import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  // Mock PSX sector data
  const mockSectorData = {
    sectors: [
      {
        name: 'Banking',
        marketCap: 2850000, // PKR millions
        percentage: 28.5,
        companiesCount: 15,
        avgPE: 6.8,
        performance1M: 2.4
      },
      {
        name: 'Oil & Gas',
        marketCap: 1950000,
        percentage: 19.5,
        companiesCount: 12,
        avgPE: 8.2,
        performance1M: -1.8
      },
      {
        name: 'Fertilizer',
        marketCap: 850000,
        percentage: 8.5,
        companiesCount: 6,
        avgPE: 12.5,
        performance1M: 5.2
      },
      {
        name: 'Cement',
        marketCap: 720000,
        percentage: 7.2,
        companiesCount: 18,
        avgPE: 15.3,
        performance1M: -3.1
      },
      {
        name: 'Textile',
        marketCap: 650000,
        percentage: 6.5,
        companiesCount: 45,
        avgPE: 18.7,
        performance1M: 1.2
      },
      {
        name: 'Food & Beverages',
        marketCap: 580000,
        percentage: 5.8,
        companiesCount: 22,
        avgPE: 14.2,
        performance1M: 3.8
      },
      {
        name: 'Technology',
        marketCap: 420000,
        percentage: 4.2,
        companiesCount: 8,
        avgPE: 22.4,
        performance1M: 8.5
      },
      {
        name: 'Pharmaceuticals',
        marketCap: 380000,
        percentage: 3.8,
        companiesCount: 12,
        avgPE: 16.8,
        performance1M: 4.1
      },
      {
        name: 'Steel',
        marketCap: 320000,
        percentage: 3.2,
        companiesCount: 9,
        avgPE: 11.5,
        performance1M: -2.7
      },
      {
        name: 'Others',
        marketCap: 1275000,
        percentage: 12.8,
        companiesCount: 85,
        avgPE: 14.9,
        performance1M: 0.8
      }
    ],
    totalMarketCap: 10000000, // PKR 10 trillion
    lastUpdated: new Date().toISOString()
  };

  return NextResponse.json(mockSectorData);
}
