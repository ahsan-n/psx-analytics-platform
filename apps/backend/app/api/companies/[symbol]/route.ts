import { NextRequest, NextResponse } from 'next/server';
import { psxAdapter } from '../../../../lib/psx-adapter';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params;

  // Fetch real PSX company data (no fallback to mock)
  const companyData = await psxAdapter.getCompanyAnalytics(symbol);
  return NextResponse.json(companyData);
}
