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

  constructor(baseUrl = PSX_BASE_URL, options: PSXHttpOptions = {}) {
    this.baseUrl = baseUrl;
    this.defaultOptions = {
      timeout: 10000,
      retries: 3,
      ...options,
    };
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
  async getSectorBreakdown(): Promise<SectorBreakdownResponse> {
    const response = await this.fetchWithRetry(`${this.baseUrl}/sector-summary/sectorwise`);
    const rawData = await response.text();

    console.log('PSX Sector Response Status:', response.status);
    console.log('PSX Sector Response Headers:', Object.fromEntries(response.headers.entries()));
    console.log('PSX Sector Raw Data (first 500 chars):', rawData.substring(0, 500));

    // PSX returns HTML table, we need to parse it
    // For now, throw error to see what we're getting
    throw new Error(`PSX sector data parsing not implemented. Response: ${rawData.substring(0, 200)}...`);
  }

  /**
   * Get companies listing
   * Maps to: GET https://dps.psx.com.pk/listings-table/main/nc
   */
  async getCompanies(params: {
    sector?: string;
    status?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<CompaniesResponse> {
    const response = await this.fetchWithRetry(`${this.baseUrl}/listings-table/main/nc`);
    const rawData = await response.text();

    console.log('PSX Companies Response Status:', response.status);
    console.log('PSX Companies Response Headers:', Object.fromEntries(response.headers.entries()));
    console.log('PSX Companies Raw Data (first 500 chars):', rawData.substring(0, 500));

    // PSX returns HTML table, parse and normalize
    throw new Error(`PSX companies data parsing not implemented. Response: ${rawData.substring(0, 200)}...`);
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

    throw new Error(`PSX company data parsing not implemented for ${symbol}. Response: ${rawData.substring(0, 200)}...`);
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
    try {
      const response = await this.fetchWithRetry(`${this.baseUrl}/performers`);
      const rawData = await response.text();
      return this.normalizePerformersData(rawData);
    } catch (error) {
      console.error('PSX performers fetch failed:', error);
      throw error;
    }
  }

  // Normalization methods (convert PSX raw data to our schema)
  
  private normalizeSectorData(rawHtml: string): SectorBreakdownResponse {
    // TODO: Parse HTML table to extract sector data
    // For now, return mock structure with real timestamp
    return {
      sectors: [
        {
          name: "Banking",
          marketCap: 2850000,
          percentage: 28.5,
          companiesCount: 15,
          avgPE: 6.8,
          performance1M: 2.4
        },
        {
          name: "Oil & Gas Exploration",
          marketCap: 1950000,
          percentage: 19.5,
          companiesCount: 8,
          avgPE: 8.2,
          performance1M: -1.2
        },
        {
          name: "Cement",
          marketCap: 850000,
          percentage: 8.5,
          companiesCount: 12,
          avgPE: 12.5,
          performance1M: 3.8
        }
      ],
      totalMarketCap: 10000000,
      lastUpdated: new Date().toISOString()
    };
  }

  private normalizeCompaniesData(rawHtml: string, params: any): CompaniesResponse {
    // TODO: Parse HTML table to extract companies data
    // For now, return mock structure
    const mockCompanies = [
      {
        symbol: "HBL",
        name: "Habib Bank Limited",
        sector: "Banking",
        marketCap: 485000,
        price: 142.50,
        change: 2.1,
        pe: 6.2
      },
      {
        symbol: "UBL",
        name: "United Bank Limited",
        sector: "Banking",
        marketCap: 425000,
        price: 285.75,
        change: -0.8,
        pe: 5.9
      },
      {
        symbol: "TRG",
        name: "The Resource Group International Limited",
        sector: "Technology",
        marketCap: 185000,
        price: 125.75,
        change: 5.2,
        pe: 18.5
      }
    ];

    return {
      companies: mockCompanies.slice(0, params.limit || 20),
      total: mockCompanies.length,
      page: params.page || 1,
      limit: params.limit || 20
    };
  }

  private normalizeCompanyData(symbol: string, rawHtml: string): CompanyAnalyticsResponse {
    // TODO: Parse company page HTML to extract data
    // For now, return mock structure for the requested symbol
    const mockData: Record<string, CompanyAnalyticsResponse> = {
      HBL: {
        company: {
          symbol: "HBL",
          name: "Habib Bank Limited",
          sector: "Banking",
          industry: "Commercial Banks",
          marketCap: 485000,
          sharesOutstanding: 3400000000,
          description: "Habib Bank Limited is one of the largest commercial banks in Pakistan.",
          website: "https://www.hbl.com"
        },
        financials: {
          revenue: 285000,
          netIncome: 42500,
          totalAssets: 3850000,
          totalEquity: 285000,
          cash: 185000,
          debt: 2850000
        },
        ratios: {
          pe: 6.2,
          pb: 1.7,
          roe: 14.9,
          roa: 1.1,
          debtToEquity: 10.0,
          currentRatio: 1.2,
          grossMargin: 65.8,
          netMargin: 14.9
        },
        performance: {
          price: 142.50,
          change1D: 2.1,
          change1W: 3.8,
          change1M: 8.5,
          change3M: 15.2,
          change1Y: 28.7,
          high52W: 158.75,
          low52W: 98.25
        }
      }
    };

    return mockData[symbol.toUpperCase()] || mockData.HBL;
  }

  private normalizePerformersData(rawHtml: string) {
    // TODO: Parse performers HTML to extract gainers/losers/volume leaders
    return {
      gainers: [],
      losers: [],
      volumeLeaders: []
    };
  }
}

// Export singleton instance
export const psxAdapter = new PSXAdapter();
export default PSXAdapter;
