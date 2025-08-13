'use client';

import { useEffect, useState } from 'react';
import { DefaultService, OpenAPI } from '@stock-analytics/api-client';
import type { SectorBreakdownResponse, CompaniesResponse } from '@stock-analytics/api-client';
import SectorBreakdown from '@/components/SectorBreakdown';
import CompaniesTable from '@/components/CompaniesTable';

export default function DashboardPage() {
  const [sectorData, setSectorData] = useState<SectorBreakdownResponse | null>(null);
  const [companiesData, setCompaniesData] = useState<CompaniesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        OpenAPI.BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
        
        OpenAPI.BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
        const [sectorsResponse, companiesResponse] = await Promise.all([
          DefaultService.getSectorBreakdown({ index: 'KSE100' }),
          DefaultService.getCompanies({ index: 'KSE100', limit: 10000 })
        ]);

        setSectorData(sectorsResponse);
        setCompaniesData(companiesResponse);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️ Error</div>
          <p className="text-gray-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">PSX Analytics Dashboard</h1>
              <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-200">
                Scope: KSE-100
              </span>
            </div>
            <p className="mt-2 text-gray-600">
              Pakistan Stock Exchange fundamental analysis and market overview
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Market Overview */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Market Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {sectorData && sectorData.totalMarketCap !== undefined ? `PKR ${(sectorData.totalMarketCap / 1000000).toFixed(1)}T` : '-'}
                </div>
                <div className="text-sm text-gray-600">Total Market Cap</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {sectorData && sectorData.sectors ? sectorData.sectors.length : '-'}
                </div>
                <div className="text-sm text-gray-600">Sectors</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {sectorData && sectorData.sectors ? sectorData.sectors.reduce((sum, s) => sum + (s.companiesCount || 0), 0) : '-'}
                </div>
                <div className="text-sm text-gray-600">Listed Companies</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {sectorData && sectorData.sectors && sectorData.sectors.length > 0
                    ? (sectorData.sectors.reduce((sum, s) => sum + (s.avgPE || 0), 0) / sectorData.sectors.length).toFixed(1)
                    : '-'}
                </div>
                <div className="text-sm text-gray-600">Avg P/E Ratio</div>
              </div>
            </div>
          </div>
        </div>

        {/* Sector Breakdown */}
        {sectorData && (
          <div className="mb-8">
            <SectorBreakdown data={sectorData} />
          </div>
        )}

        {/* Top Companies */}
        {companiesData && sectorData && (
          <div className="mb-8">
            <CompaniesTable 
              data={companiesData} 
              title="Top Companies"
              sectorAvgPeByName={Object.fromEntries(
                (sectorData.sectors || []).map(s => [s.name, s.avgPE || 0])
              )}
            />
          </div>
        )}
      </div>
    </div>
  );
}
