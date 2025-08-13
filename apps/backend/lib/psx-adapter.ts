/**
 * PSX Data Portal (DPS) Adapter
 * 
 * Fetches data from PSX DPS endpoints and normalizes to our OpenAPI schema.
 * Based on endpoints discovered in docs/psx-data.md
 */

import { components } from '../openapi/types';

type SectorBreakdownResponse = components['schemas']['SectorBreakdownResponse'];
type CompaniesResponse = components['schemas']['CompaniesResponse'];
type CompanyAnalyticsResponse = components['schemas']['CompanyAnalyticsResponse'];

const PSX_BASE_URL = 'https://dps.psx.com.pk';

interface PSXHttpOptions {
  timeout?: number;
  retries?: number;
}

class PSXAdapter {
  private baseUrl: string;
  private defaultOptions: PSXHttpOptions;
  private kse100Symbols: Set<string> | null = null;
  private kse100Metrics: Map<string, { current: number; changePct: number; marketCapM: number }> | null = null;
  private companyFundamentals: Map<string, { pe?: number; marketCapM?: number }> = new Map();

  constructor(baseUrl = PSX_BASE_URL, options: PSXHttpOptions = {}) {
    this.baseUrl = baseUrl;
    this.defaultOptions = {
      timeout: 10000,
      retries: 3,
      ...options,
    };
  }

  private async ensureKSE100SymbolsLoaded(): Promise<Set<string>> {
    if (this.kse100Symbols && this.kse100Symbols.size > 0) return this.kse100Symbols;
    await this.loadKSE100Metrics();
    this.kse100Symbols = new Set(this.kse100Metrics ? Array.from(this.kse100Metrics.keys()) : []);
    return this.kse100Symbols;
  }

  private async loadKSE100Metrics(): Promise<void> {
    // Fetch KSE100 constituents page and parse symbol, current, change%, market cap (M)
    const response = await this.fetchWithRetry(`${this.baseUrl}/indices/KSE100`);
    const html = await response.text();
    const metrics = new Map<string, { current: number; changePct: number; marketCapM: number }>();
    const tbodyMatch = html.match(/<tbody[^>]*>([\s\S]*?)<\/tbody>/);
    if (tbodyMatch) {
      const rows = tbodyMatch[1].match(/<tr[^>]*>([\s\S]*?)<\/tr>/g) || [];
      for (const row of rows) {
        const symMatch = row.match(/<strong>([^<]+)<\/strong>/);
        const symbol = symMatch && symMatch[1] ? symMatch[1].trim().toUpperCase() : '';
        if (!symbol) continue;
        // Collect all numeric right-tds
        const rightTds = Array.from(row.matchAll(/<td[^>]*class="[^"]*right[^"]*"[^>]*>([\s\S]*?)<\/td>/g)).map(m => m[1]);
        // Extract numeric from inner text by stripping tags/commas
        const nums = rightTds.map(txt => parseFloat(txt.replace(/<[^>]*>/g, '').replace(/,/g, '').replace(/%/g, '')));
        // According to header on KSE100 page:
        // LDCP, CURRENT, CHANGE, CHANGE(%), IDX WTG(%), IDX POINT, VOLUME, FREEFLOAT (M), MARKET CAP (M)
        const current = nums[1] || 0;
        const changePct = nums[3] || 0;
        const marketCapM = nums[nums.length - 1] || 0; // last is Market Cap (M)
        metrics.set(symbol, { current, changePct, marketCapM });
      }
    }
    this.kse100Metrics = metrics;
  }

  private async loadCompanyFundamentals(symbol: string): Promise<{ pe?: number; marketCapM?: number }> {
    const upper = (symbol || '').toUpperCase();
    const cached = this.companyFundamentals.get(upper);
    if (cached && (cached.pe !== undefined || cached.marketCapM !== undefined)) return cached;

    const response = await this.fetchWithRetry(`${this.baseUrl}/company/${upper}`);
    const html = await response.text();

    let pe: number | undefined;
    let marketCapM: number | undefined;

    try {
      // P/E Ratio (TTM) **
      const peSectionMatch = html.match(/P\/?E\s*Ratio\s*\(TTM\)[\s\S]*?<div[^>]*class="stats_value"[^>]*>([\d.,]+)<\/div>/i);
      if (peSectionMatch && peSectionMatch[1]) {
        pe = parseFloat(peSectionMatch[1].replace(/,/g, ''));
      }
    } catch {}

    try {
      // Market Cap (000's) in equity section → convert to millions
      const mcMatch = html.match(/Market\s*Cap\s*\(0+\'?s\)[\s\S]*?<div[^>]*class="stats_value"[^>]*>([\d.,]+)<\/div>/i);
      if (mcMatch && mcMatch[1]) {
        const thousands = parseFloat(mcMatch[1].replace(/,/g, ''));
        if (!Number.isNaN(thousands)) {
          marketCapM = thousands / 1000.0;
        }
      }
    } catch {}

    const result = { pe, marketCapM };
    this.companyFundamentals.set(upper, result);
    return result;
  }

  private async fetchWithRetry(url: string, options: RequestInit = {}): Promise<Response> {
    const { timeout, retries } = this.defaultOptions;
    let lastError: Error;

    for (let attempt = 0; attempt <= retries!; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            'Accept': 'application/json, text/html, */*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Cache-Control': 'no-cache',
            ...options.headers,
          },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return response;
      } catch (error) {
        lastError = error as Error;
        if (attempt < retries!) {
          // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }

    throw lastError!;
  }

  /**
   * Get sector breakdown data
   * Maps to: GET https://dps.psx.com.pk/sector-summary/sectorwise
   */
  async getSectorBreakdown(index: string = 'KSE100'): Promise<SectorBreakdownResponse> {
    const response = await this.fetchWithRetry(`${this.baseUrl}/sector-summary/sectorwise`);
    const rawData = await response.text();

    console.log('PSX Sector Response Status:', response.status);
    console.log('PSX Sector Response Headers:', Object.fromEntries(response.headers.entries()));
    console.log('PSX Sector Raw Data (first 500 chars):', rawData.substring(0, 500));

    // Parse HTML table and normalize to our schema
    const parsed = this.parseSectorHtml(rawData);
    if (index && index.toUpperCase() === 'KSE100') {
      // Recompute sector stats using only KSE-100 companies
      await this.loadKSE100Metrics();
      const kset = await this.ensureKSE100SymbolsLoaded();
      const allCompanies = await this.getCompanies({ limit: 10000 });
      const allList = allCompanies.companies || [];
      const kseCompanies = allList.filter(c => kset.has((c.symbol || '').toUpperCase()));

      // Prefetch fundamentals (P/E) for all KSE100 companies; cached for subsequent requests
      await Promise.all(kseCompanies.map(c => c.symbol ? this.loadCompanyFundamentals(c.symbol) : Promise.resolve({}))); 

      const sectorMap = new Map<string, { count: number; marketCapM: number; totalPE: number; peCount: number; perfSum: number }>();
      let totalMarketCapM = 0;
      for (const c of kseCompanies) {
        const sector = c.sector || 'Unknown';
        if (!sectorMap.has(sector)) sectorMap.set(sector, { count: 0, marketCapM: 0, totalPE: 0, peCount: 0, perfSum: 0 });
        const s = sectorMap.get(sector)!;
        s.count += 1;
        const sym = (c.symbol || '').toUpperCase();
        // Market cap and daily change from KSE100 constituents table (authoritative, already in millions)
        const m = this.kse100Metrics?.get(sym);
        const marketCapM = m ? m.marketCapM : (c.marketCap ? c.marketCap / 1_000_000 : 0);
        s.marketCapM += marketCapM || 0;
        // P/E from company fundamentals page cache when available
        const f = this.companyFundamentals.get(sym);
        if (f && f.pe !== undefined && !Number.isNaN(f.pe)) {
          s.totalPE += f.pe;
          s.peCount += 1;
        }
        // Use changePct from constituents table for performance
        s.perfSum += (m ? m.changePct : 0);
        totalMarketCapM += marketCapM || 0;
      }

      const sectors = Array.from(sectorMap.entries()).map(([name, s]) => ({
        name,
        marketCap: s.marketCapM, // in PKR millions
        percentage: totalMarketCapM > 0 ? (s.marketCapM / totalMarketCapM) * 100 : 0,
        companiesCount: s.count,
        avgPE: s.peCount > 0 ? s.totalPE / s.peCount : 0,
        performance1M: s.count > 0 ? s.perfSum / s.count : 0,
      }));

      return {
        sectors: sectors.sort((a, b) => (b.marketCap || 0) - (a.marketCap || 0)),
        totalMarketCap: totalMarketCapM,
        lastUpdated: new Date().toISOString(),
      };
    }
    return parsed;
  }

  private parseSectorHtml(html: string): SectorBreakdownResponse {
    // Parse the PSX sector HTML table to extract real data
    const sectors: components['schemas']['SectorData'][] = [];
    
    try {
      // Extract table rows from the HTML
      const tableMatch = html.match(/<tbody[^>]*>([\s\S]*?)<\/tbody>/);
      if (!tableMatch) {
        console.warn('No table body found in PSX sector HTML');
        return this.getEmptySectorResponse();
      }

      const tbody = tableMatch[1];
      const rowMatches = tbody.match(/<tr[^>]*>([\s\S]*?)<\/tr>/g);
      
      if (!rowMatches) {
        console.warn('No table rows found in PSX sector HTML');
        return this.getEmptySectorResponse();
      }

      for (const row of rowMatches) {
        // Extract cells from each row
        const cellMatches = row.match(/<td[^>]*>([\s\S]*?)<\/td>/g);
        if (!cellMatches || cellMatches.length < 5) continue;

        // Parse cell contents (remove HTML tags and clean up)
        const cells = cellMatches.map(cell => 
          cell.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()
        );

        // sector table may include Turnover and Market Cap (B) at the end
        const sectorCode = cells[0];
        const sectorName = cells[1];
        const advance = cells[2];
        const decline = cells[3];
        const unchanged = cells[4];
        const marketCapBText = cells[cells.length - 1];
        
        if (sectorName && sectorName !== 'Sector Name' && sectorName.length > 0) {
          // Calculate companies count from PSX data
          const advanceCount = parseInt(advance || '0') || 0;
          const declineCount = parseInt(decline || '0') || 0;
          const unchangedCount = parseInt(unchanged || '0') || 0;
          const totalCompanies = advanceCount + declineCount + unchangedCount;
          
          // Calculate performance based on advance/decline ratio
          const performance1M = totalCompanies > 0 
            ? ((advanceCount - declineCount) / totalCompanies) * 5 // Scale to reasonable percentage
            : 0;
          
          const marketCapB = parseFloat((marketCapBText || '0').replace(/,/g, '')) || 0;
          sectors.push({
            name: sectorName,
            marketCap: marketCapB * 1000, // convert B to M to match schema description
            percentage: 0, // will be filled after total computed if needed
            companiesCount: totalCompanies || 1,
            avgPE: 0,
            performance1M: Math.round(performance1M * 100) / 100
          });
        }
      }

      const totalMarketCap = sectors.reduce((sum, s) => sum + (s.marketCap || 0), 0);
      // back-fill percentage now that we know total
      for (const s of sectors) {
        s.percentage = totalMarketCap > 0 ? ((s.marketCap || 0) / totalMarketCap) * 100 : 0;
      }

      return {
        sectors,
        totalMarketCap,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error parsing PSX sector HTML:', error);
      return this.getEmptySectorResponse();
    }
  }

  private getEmptySectorResponse(): SectorBreakdownResponse {
    return {
      sectors: [],
      totalMarketCap: 0,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Get companies listing
   * Maps to: GET https://dps.psx.com.pk/listings-table/main/nc
   */
  async getCompanies(params: {
    sector?: string;
    status?: string;
    index?: string; // e.g., KSE100
    page?: number;
    limit?: number;
  } = {}): Promise<CompaniesResponse> {
    const response = await this.fetchWithRetry(`${this.baseUrl}/listings-table/main/nc`);
    const rawData = await response.text();

    console.log('PSX Companies Response Status:', response.status);
    console.log('PSX Companies Response Headers:', Object.fromEntries(response.headers.entries()));
    console.log('PSX Companies Raw Data (first 500 chars):', rawData.substring(0, 500));

    // Parse
    const parsedAll = this.parseCompaniesHtml(rawData, {});
    const allList = parsedAll.companies || [];
    if (params.index && params.index.toUpperCase() === 'KSE100') {
      await this.loadKSE100Metrics();
      const kset = await this.ensureKSE100SymbolsLoaded();
      const filtered = allList.filter(c => kset.has((c.symbol || '').toUpperCase()));
      // Enrich with metrics from KSE100 page
      const enriched = filtered.map(c => {
        const m = this.kse100Metrics?.get((c.symbol || '').toUpperCase());
        return {
          ...c,
          price: m ? m.current : c.price,
          change: m ? m.changePct : c.change,
          marketCap: m ? m.marketCapM : c.marketCap, // already in M
        };
      });
      const page = params.page || 1;
      const limit = params.limit || 20;
      const startIndex = (page - 1) * limit;
      const pageSlice = enriched.slice(startIndex, startIndex + limit);
      // Fill P/E (and missing market cap) from company page fundamentals for visible page only (perf)
      const filled = await Promise.all(pageSlice.map(async (c) => {
        if (!c.symbol) return c;
        const f = await this.loadCompanyFundamentals(c.symbol);
        return {
          ...c,
          pe: (f.pe !== undefined ? f.pe : c.pe),
          marketCap: (c.marketCap !== undefined ? c.marketCap : f.marketCapM),
        };
      }));
      return { companies: filled, total: enriched.length, page, limit };
    }
    // Non-index case: apply optional sector filter then paginate
    const sectorFiltered = params.sector
      ? allList.filter(c => (c.sector || '').toLowerCase().includes((params.sector || '').toLowerCase()))
      : allList;
    const page = params.page || 1;
    const limit = params.limit || 20;
    const startIndex = (page - 1) * limit;
    const companies = sectorFiltered.slice(startIndex, startIndex + limit);
    return { companies, total: sectorFiltered.length, page, limit };
  }

  private parseCompaniesHtml(html: string, params: {
    sector?: string;
    status?: string;
    index?: string;
    page?: number;
    limit?: number;
  }): CompaniesResponse {
    // Parse the PSX companies HTML table to extract real data
    const allCompanies: components['schemas']['CompanyBasic'][] = [];
    
    try {
      // Extract table rows from the HTML
      const tableMatch = html.match(/<tbody[^>]*>([\s\S]*?)<\/tbody>/);
      if (!tableMatch) {
        console.warn('No table body found in PSX companies HTML');
        return this.getEmptyCompaniesResponse(params);
      }

      const tbody = tableMatch[1];
      const rowMatches = tbody.match(/<tr[^>]*>([\s\S]*?)<\/tr>/g);
      
      if (!rowMatches) {
        console.warn('No table rows found in PSX companies HTML');
        return this.getEmptyCompaniesResponse(params);
      }

      for (const row of rowMatches) {
        // Extract cells from each row
        const cellMatches = row.match(/<td[^>]*>([\s\S]*?)<\/td>/g);
        if (!cellMatches || cellMatches.length < 7) continue;

        // Parse cell contents (remove HTML tags and clean up)
        const cells = cellMatches.map(cell => 
          cell.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()
        );

        const [symbolCell, nameCell, sectorCell, clearingTypeCell, sharesCell, freeFloatCell, listedInCell] = cells;
        
        // Extract symbol from the first cell (it might contain HTML)
        const symbol = symbolCell.replace(/[^A-Z0-9]/g, '');
        
        if (symbol && symbol.length > 0 && nameCell && nameCell.length > 0) {
          // If we are restricting to KSE-100, ensure the "Listed In" column contains KSE-100
          if (params.index && params.index.toUpperCase() === 'KSE100') {
            const listedInText = (listedInCell || '').toUpperCase();
            if (!(listedInText.includes('KSE-100') || listedInText.includes('KSE100'))) {
              continue;
            }
          }
          // Parse shares (remove commas and convert to number)
          const shares = parseInt(sharesCell.replace(/[,\s]/g, '') || '0') || 0;
          const freeFloat = parseInt(freeFloatCell.replace(/[,\s]/g, '') || '0') || 0;
          
          allCompanies.push({
            symbol: symbol,
            name: nameCell,
            sector: sectorCell || 'Unknown',
            marketCap: Math.floor(shares * (Math.random() * 500 + 50)), // Placeholder calculation
            price: Math.floor(Math.random() * 500 + 50), // Placeholder - not available in listings
            change: (Math.random() - 0.5) * 10, // Placeholder - not available in listings
            pe: Math.floor(Math.random() * 25 + 5) // Placeholder - not available in listings
          });
        }
      }

      // Filter by sector if provided
      let filteredCompanies = params.sector 
        ? allCompanies.filter(company => company.sector?.toLowerCase().includes(params.sector?.toLowerCase() || ''))
        : allCompanies;

      // Return all companies here; callers will paginate
      return {
        companies: filteredCompanies,
        total: filteredCompanies.length,
        page: 1,
        limit: filteredCompanies.length
      };
    } catch (error) {
      console.error('Error parsing PSX companies HTML:', error);
      return this.getEmptyCompaniesResponse(params);
    }
  }

  private getEmptyCompaniesResponse(params: { page?: number; limit?: number }): CompaniesResponse {
    return {
      companies: [],
      total: 0,
      page: params.page || 1,
      limit: params.limit || 20
    };
  }

  /**
   * Get company analytics/profile
   * Maps to: Multiple PSX endpoints for a given symbol
   */
  async getCompanyAnalytics(symbol: string): Promise<CompanyAnalyticsResponse> {
    // We'd need multiple calls to get full company data
    // For now, use a simplified approach
    const response = await this.fetchWithRetry(`${this.baseUrl}/company/${symbol}`);
    const rawData = await response.text();

    console.log(`PSX Company ${symbol} Response Status:`, response.status);
    console.log(`PSX Company ${symbol} Response Headers:`, Object.fromEntries(response.headers.entries()));
    console.log(`PSX Company ${symbol} Raw Data (first 500 chars):`, rawData.substring(0, 500));

    return this.parseCompanyAnalyticsHtml(symbol, rawData);
  }

  private parseCompanyAnalyticsHtml(symbol: string, html: string): CompanyAnalyticsResponse {
    // Parse the PSX company HTML page to extract real data
    try {
      // Extract company name from title or meta tags
      const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
      const nameMatch = titleMatch ? titleMatch[1].split('(')[0].trim() : '';
      
      // Extract description from meta description
      const descMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i);
      const description = descMatch ? descMatch[1] : `${nameMatch} is a company listed on Pakistan Stock Exchange.`;
      
      // Extract sector information (this would need more sophisticated parsing)
      const sectorMatch = html.match(/sector[^>]*>([^<]+)</i);
      const sector = sectorMatch ? sectorMatch[1].trim() : 'Unknown';

      // For now, return structured data with extracted info and calculated placeholders
      const response: CompanyAnalyticsResponse = {
        company: {
          symbol: symbol.toUpperCase(),
          name: nameMatch || `${symbol.toUpperCase()} Company`,
          sector: sector,
          industry: sector, // Use sector as industry for now
          marketCap: Math.floor(Math.random() * 1000000 + 100000), // Placeholder
          sharesOutstanding: Math.floor(Math.random() * 5000000000 + 1000000000), // Placeholder
          description: description,
          website: `https://www.${symbol.toLowerCase()}.com` // Placeholder
        },
        financials: {
          revenue: Math.floor(Math.random() * 500000 + 50000), // Placeholder
          netIncome: Math.floor(Math.random() * 50000 + 5000), // Placeholder
          totalAssets: Math.floor(Math.random() * 5000000 + 500000), // Placeholder
          totalEquity: Math.floor(Math.random() * 500000 + 50000), // Placeholder
          cash: Math.floor(Math.random() * 200000 + 20000), // Placeholder
          debt: Math.floor(Math.random() * 3000000 + 300000) // Placeholder
        },
        ratios: {
          pe: Math.round((Math.random() * 20 + 5) * 10) / 10, // Placeholder
          pb: Math.round((Math.random() * 3 + 0.5) * 10) / 10, // Placeholder
          roe: Math.round((Math.random() * 25 + 5) * 10) / 10, // Placeholder
          roa: Math.round((Math.random() * 5 + 0.5) * 10) / 10, // Placeholder
          debtToEquity: Math.round((Math.random() * 15 + 1) * 10) / 10, // Placeholder
          currentRatio: Math.round((Math.random() * 2 + 0.5) * 10) / 10, // Placeholder
          grossMargin: Math.round((Math.random() * 40 + 30) * 10) / 10, // Placeholder
          netMargin: Math.round((Math.random() * 20 + 5) * 10) / 10 // Placeholder
        },
        performance: {
          price: Math.round((Math.random() * 500 + 50) * 100) / 100, // Placeholder
          change1D: Math.round((Math.random() - 0.5) * 20 * 100) / 100, // Placeholder
          change1W: Math.round((Math.random() - 0.5) * 10 * 100) / 100, // Placeholder
          change1M: Math.round((Math.random() - 0.5) * 15 * 100) / 100, // Placeholder
          change3M: Math.round((Math.random() - 0.5) * 25 * 100) / 100, // Placeholder
          change1Y: Math.round((Math.random() - 0.5) * 50 * 100) / 100, // Placeholder
          high52W: Math.round((Math.random() * 600 + 100) * 100) / 100, // Placeholder
          low52W: Math.round((Math.random() * 200 + 20) * 100) / 100 // Placeholder
        }
      };

      return response;
    } catch (error) {
      console.error(`Error parsing PSX company HTML for ${symbol}:`, error);
      
      // Return basic structure if parsing fails
      return this.getEmptyCompanyAnalyticsResponse(symbol);
    }
  }

  private getEmptyCompanyAnalyticsResponse(symbol: string): CompanyAnalyticsResponse {
    return {
      company: {
        symbol: symbol.toUpperCase(),
        name: `${symbol.toUpperCase()} Company`,
        sector: 'Unknown',
        industry: 'Unknown',
        marketCap: 0,
        sharesOutstanding: 0,
        description: `Company information for ${symbol.toUpperCase()} is not available.`,
        website: ''
      },
      financials: {
        revenue: 0,
        netIncome: 0,
        totalAssets: 0,
        totalEquity: 0,
        cash: 0,
        debt: 0
      },
      ratios: {
        pe: 0,
        pb: 0,
        roe: 0,
        roa: 0,
        debtToEquity: 0,
        currentRatio: 0,
        grossMargin: 0,
        netMargin: 0
      },
      performance: {
        price: 0,
        change1D: 0,
        change1W: 0,
        change1M: 0,
        change3M: 0,
        change1Y: 0,
        high52W: 0,
        low52W: 0
      }
    };
  }



  /**
   * Get symbols list
   * Maps to: GET https://dps.psx.com.pk/symbols
   */
  async getSymbols() {
    const response = await this.fetchWithRetry(`${this.baseUrl}/symbols`);
    const rawData = await response.text();

    console.log('PSX Symbols Response Status:', response.status);
    console.log('PSX Symbols Response Headers:', Object.fromEntries(response.headers.entries()));
    console.log('PSX Symbols Raw Data (first 500 chars):', rawData.substring(0, 500));

    // Try to parse as JSON first
    try {
      const jsonData = JSON.parse(rawData);
      console.log('PSX Symbols JSON Data (first 3 items):', jsonData.slice(0, 3));
      return jsonData;
    } catch (e) {
      throw new Error(`PSX symbols data is not JSON. Response: ${rawData.substring(0, 200)}...`);
    }
  }

  /**
   * Get market performers
   * Maps to: GET https://dps.psx.com.pk/performers
   */
  async getPerformers() {
    const response = await this.fetchWithRetry(`${this.baseUrl}/performers`);
    const rawData = await response.text();
    
    console.log('PSX Performers Response Status:', response.status);
    console.log('PSX Performers Raw Data (first 500 chars):', rawData.substring(0, 500));
    
    // TODO: Implement proper HTML parsing for performers data
    throw new Error(`PSX performers data parsing not implemented. Response: ${rawData.substring(0, 200)}...`);
  }

  // Note: All normalization methods have been replaced with direct HTML parsing in the main methods above
}

// Export singleton instance
export const psxAdapter = new PSXAdapter();
export default PSXAdapter;
