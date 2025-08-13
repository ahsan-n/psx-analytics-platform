import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params;

  // Mock company analytics data - in real app this would come from database
  const mockCompanyData: Record<string, any> = {
    'HBL': {
      company: {
        symbol: 'HBL',
        name: 'Habib Bank Limited',
        sector: 'Banking',
        industry: 'Commercial Banks',
        marketCap: 485000,
        sharesOutstanding: 3400000000,
        description: 'Habib Bank Limited (HBL) is the largest private sector bank in Pakistan with a network of over 1,700 branches.',
        website: 'https://www.hbl.com'
      },
      financials: {
        revenue: 285000, // PKR millions
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
    },
    'TRG': {
      company: {
        symbol: 'TRG',
        name: 'The Resource Group',
        sector: 'Technology',
        industry: 'Software & IT Services',
        marketCap: 85000,
        sharesOutstanding: 675000000,
        description: 'TRG is a leading technology company providing software solutions and IT services globally.',
        website: 'https://www.trg.com.pk'
      },
      financials: {
        revenue: 28500,
        netIncome: 4250,
        totalAssets: 45000,
        totalEquity: 32000,
        cash: 8500,
        debt: 5500
      },
      ratios: {
        pe: 18.5,
        pb: 2.7,
        roe: 13.3,
        roa: 9.4,
        debtToEquity: 0.17,
        currentRatio: 2.8,
        grossMargin: 42.5,
        netMargin: 14.9
      },
      performance: {
        price: 125.75,
        change1D: 5.2,
        change1W: 8.1,
        change1M: 15.8,
        change3M: 35.2,
        change1Y: 58.7,
        high52W: 145.50,
        low52W: 75.25
      }
    },
    'EFERT': {
      company: {
        symbol: 'EFERT',
        name: 'Engro Fertilizers Limited',
        sector: 'Fertilizer',
        industry: 'Fertilizers',
        marketCap: 285000,
        sharesOutstanding: 3175000000,
        description: 'Engro Fertilizers Limited is one of Pakistan\'s leading fertilizer manufacturers.',
        website: 'https://www.engro.com'
      },
      financials: {
        revenue: 125000,
        netIncome: 18500,
        totalAssets: 185000,
        totalEquity: 95000,
        cash: 12500,
        debt: 45000
      },
      ratios: {
        pe: 11.8,
        pb: 3.0,
        roe: 19.5,
        roa: 10.0,
        debtToEquity: 0.47,
        currentRatio: 1.8,
        grossMargin: 28.5,
        netMargin: 14.8
      },
      performance: {
        price: 89.75,
        change1D: 4.2,
        change1W: 6.8,
        change1M: 12.5,
        change3M: 18.9,
        change1Y: 42.3,
        high52W: 95.50,
        low52W: 58.25
      }
    }
  };

  const companyData = mockCompanyData[symbol.toUpperCase()];

  if (!companyData) {
    return NextResponse.json(
      { error: 'Company not found' },
      { status: 404 }
    );
  }

  return NextResponse.json(companyData);
}
