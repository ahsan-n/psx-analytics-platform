import { NextRequest, NextResponse } from 'next/server';
import { psxAdapter } from '../../../lib/psx-adapter';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sector = searchParams.get('sector');
  const status = searchParams.get('status');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');

  // Fetch real PSX companies data (no fallback to mock)
  const companiesData = await psxAdapter.getCompanies({
    sector: sector || undefined,
    status: status || undefined,
    page,
    limit
  });
  
  return NextResponse.json(companiesData);
}
