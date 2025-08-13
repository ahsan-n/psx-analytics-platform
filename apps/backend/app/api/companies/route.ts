import { NextRequest, NextResponse } from 'next/server';
import { psxAdapter } from '../../../lib/psx-adapter';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sector = searchParams.get('sector');
  const status = searchParams.get('status');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');

  try {
    // Try to fetch real PSX companies data
    const companiesData = await psxAdapter.getCompanies({
      sector: sector || undefined,
      status: status || undefined,
      page,
      limit
    });
    
    return NextResponse.json(companiesData);
  } catch (error) {
    console.error('Failed to fetch PSX companies data, falling back to mock:', error);
    
    // Fallback to mock data if PSX is unavailable
    const allCompanies = [
      // Banking
      { symbol: 'HBL', name: 'Habib Bank Limited', sector: 'Banking', marketCap: 485000, price: 142.50, change: 2.1, pe: 6.2 },
      { symbol: 'UBL', name: 'United Bank Limited', sector: 'Banking', marketCap: 320000, price: 185.75, change: -0.8, pe: 7.1 },
      { symbol: 'MCB', name: 'MCB Bank Limited', sector: 'Banking', marketCap: 298000, price: 195.25, change: 1.5, pe: 6.8 },
      { symbol: 'ABL', name: 'Allied Bank Limited', sector: 'Banking', marketCap: 185000, price: 92.30, change: 0.3, pe: 5.9 },
      { symbol: 'BAFL', name: 'Bank Alfalah Limited', sector: 'Banking', marketCap: 165000, price: 48.75, change: -1.2, pe: 7.5 },

      // Oil & Gas
      { symbol: 'PPL', name: 'Pakistan Petroleum Limited', sector: 'Oil & Gas', marketCap: 420000, price: 98.50, change: -2.1, pe: 8.9 },
      { symbol: 'OGDC', name: 'Oil & Gas Development Company', sector: 'Oil & Gas', marketCap: 385000, price: 89.25, change: -1.5, pe: 7.8 },
      { symbol: 'PSO', name: 'Pakistan State Oil Company', sector: 'Oil & Gas', marketCap: 125000, price: 189.75, change: 1.8, pe: 9.2 },
      { symbol: 'APL', name: 'Attock Petroleum Limited', sector: 'Oil & Gas', marketCap: 95000, price: 385.50, change: -0.5, pe: 7.5 },

      // Technology
      { symbol: 'TRG', name: 'The Resource Group', sector: 'Technology', marketCap: 85000, price: 125.75, change: 5.2, pe: 18.5 },
      { symbol: 'NETSOL', name: 'NetSol Technologies', sector: 'Technology', marketCap: 45000, price: 89.25, change: 8.1, pe: 24.2 },
      { symbol: 'SYSTEMS', name: 'Systems Limited', sector: 'Technology', marketCap: 95000, price: 185.50, change: 3.8, pe: 22.1 },

      // Fertilizer
      { symbol: 'EFERT', name: 'Engro Fertilizers Limited', sector: 'Fertilizer', marketCap: 285000, price: 89.75, change: 4.2, pe: 11.8 },
      { symbol: 'FFC', name: 'Fauji Fertilizer Company', sector: 'Fertilizer', marketCap: 195000, price: 95.25, change: 6.1, pe: 13.2 },
      { symbol: 'FFBL', name: 'Fauji Fertilizer Bin Qasim', sector: 'Fertilizer', marketCap: 125000, price: 38.50, change: 2.8, pe: 12.5 },

      // Cement
      { symbol: 'LUCK', name: 'Lucky Cement Limited', sector: 'Cement', marketCap: 185000, price: 485.75, change: -2.5, pe: 14.2 },
      { symbol: 'DGKC', name: 'D. G. Khan Cement Company', sector: 'Cement', marketCap: 95000, price: 89.25, change: -1.8, pe: 16.8 },
      { symbol: 'MLCF', name: 'Maple Leaf Cement Factory', sector: 'Cement', marketCap: 75000, price: 42.50, change: -4.2, pe: 15.5 },

      // Food & Beverages
      { symbol: 'NESTLE', name: 'Nestlé Pakistan Limited', sector: 'Food & Beverages', marketCap: 185000, price: 6250.00, change: 2.8, pe: 16.5 },
      { symbol: 'UNITY', name: 'Unity Foods Limited', sector: 'Food & Beverages', marketCap: 85000, price: 28.75, change: 1.5, pe: 12.8 },
      { symbol: 'ENGRO', name: 'Engro Corporation Limited', sector: 'Food & Beverages', marketCap: 125000, price: 285.50, change: 4.1, pe: 13.9 }
    ];

    // Filter by sector if provided
    let filteredCompanies = sector 
      ? allCompanies.filter(company => company.sector.toLowerCase() === sector.toLowerCase())
      : allCompanies;

    // Apply limit
    const companies = filteredCompanies.slice(0, limit);

    const response = {
      companies,
      total: filteredCompanies.length,
      page,
      limit
    };

    return NextResponse.json(response);
  }
}
