import { NextResponse } from 'next/server';
import { psxAdapter } from '../../../../lib/psx-adapter';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const index = searchParams.get('index') || 'KSE100';
  const sectorData = await psxAdapter.getSectorBreakdown(index);
  return NextResponse.json(sectorData);
}
