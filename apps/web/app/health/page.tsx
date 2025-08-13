'use client';

import { useEffect, useState } from 'react';
import { DefaultService, OpenAPI } from '@stock-analytics/api-client';
import type { HealthResponse } from '@stock-analytics/api-client/models/HealthResponse';

export default function HealthPage() {
  const [data, setData] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    OpenAPI.BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
    DefaultService.getHealth()
      .then(setData)
      .catch((e: unknown) => setError((e as Error).message));
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Backend Health</h1>
      {error && (
        <div className="border border-red-300 text-red-700 bg-red-50 rounded p-3">Error: {error}</div>
      )}
      {!error && !data && <div className="text-gray-500">Loading…</div>}
      {data && (
        <div className="border rounded p-4 bg-gray-50">
          <div className="mb-2"><span className="font-medium">Status:</span> {data.status}</div>
          <div className="mb-2"><span className="font-medium">Service:</span> {data.service}</div>
          <div><span className="font-medium">Timestamp:</span> {data.timestamp}</div>
        </div>
      )}
    </div>
  );
}


