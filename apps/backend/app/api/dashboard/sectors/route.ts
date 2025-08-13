import { NextResponse } from 'next/server';
import { psxAdapter } from '../../../../lib/psx-adapter';

export const dynamic = 'force-dynamic';

export async function GET() {
  // Fetch real PSX sector data (no fallback to mock)
  const sectorData = await psxAdapter.getSectorBreakdown();
  return NextResponse.json(sectorData);
}
