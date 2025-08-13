import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_ORIGIN = process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3000';

export function middleware(request: NextRequest) {
  const origin = request.headers.get('origin') || '';

  if (request.method === 'OPTIONS') {
    const preflight = new NextResponse(null, { status: 204 });
    preflight.headers.set('Access-Control-Allow-Origin', origin && origin !== 'null' ? origin : ALLOWED_ORIGIN);
    preflight.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    preflight.headers.set('Access-Control-Allow-Headers', request.headers.get('Access-Control-Request-Headers') || 'Content-Type, Authorization');
    preflight.headers.set('Access-Control-Max-Age', '86400');
    preflight.headers.set('Vary', 'Origin');
    return preflight;
  }

  const response = NextResponse.next();
  response.headers.set('Access-Control-Allow-Origin', origin && origin !== 'null' ? origin : ALLOWED_ORIGIN);
  response.headers.set('Access-Control-Allow-Credentials', 'false');
  response.headers.set('Vary', 'Origin');
  return response;
}

export const config = {
  matcher: ['/api/:path*'],
};


