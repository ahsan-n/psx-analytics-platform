'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { DefaultService, OpenAPI } from '@stock-analytics/api-client';
import type { CompanyAnalyticsResponse } from '@stock-analytics/api-client';

export default function CompanyAnalyticsPage() {
  const params = useParams();
  const symbol = params?.symbol as string;
  
  const [data, setData] = useState<CompanyAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!symbol) return;

    const loadCompanyData = async () => {
      try {
        OpenAPI.BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
        const response = await DefaultService.getCompanyAnalytics(symbol);
        setData(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load company data');
      } finally {
        setLoading(false);
      }
    };

    loadCompanyData();
  }, [symbol]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading company analytics...</p>
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
          <Link href="/dashboard" className="mt-4 inline-block text-blue-600 hover:text-blue-800">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-700">Company not found</p>
          <Link href="/dashboard" className="mt-4 inline-block text-blue-600 hover:text-blue-800">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const { company, financials, ratios, performance } = data;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {company.symbol} - {company.name}
                </h1>
                <p className="mt-2 text-gray-600">
                  {company.sector} • {company.industry}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  PKR {performance.price.toFixed(2)}
                </div>
                <div className={`text-lg font-medium ${performance.change1D >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {performance.change1D >= 0 ? '+' : ''}{performance.change1D.toFixed(2)}% (1D)
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <div className="mb-8">
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-800">
            ← Back to Dashboard
          </Link>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-sm font-medium text-gray-500">Market Cap</div>
            <div className="text-2xl font-bold text-gray-900">
              PKR {(company.marketCap / 1000).toFixed(1)}B
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-sm font-medium text-gray-500">P/E Ratio</div>
            <div className="text-2xl font-bold text-gray-900">
              {ratios.pe.toFixed(1)}x
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-sm font-medium text-gray-500">P/B Ratio</div>
            <div className="text-2xl font-bold text-gray-900">
              {ratios.pb.toFixed(1)}x
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-sm font-medium text-gray-500">ROE</div>
            <div className="text-2xl font-bold text-gray-900">
              {ratios.roe.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Company Info and Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Company Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Company Information</h2>
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium text-gray-500">Description</div>
                <div className="text-gray-900">{company.description}</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-500">Website</div>
                  <a href={company.website} target="_blank" rel="noopener noreferrer" 
                     className="text-blue-600 hover:text-blue-800">
                    {company.website}
                  </a>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Shares Outstanding</div>
                  <div className="text-gray-900">
                    {(company.sharesOutstanding / 1000000000).toFixed(2)}B
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Performance */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Price Performance</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">1 Day</span>
                <span className={`font-medium ${performance.change1D >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {performance.change1D >= 0 ? '+' : ''}{performance.change1D.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">1 Week</span>
                <span className={`font-medium ${performance.change1W >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {performance.change1W >= 0 ? '+' : ''}{performance.change1W.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">1 Month</span>
                <span className={`font-medium ${performance.change1M >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {performance.change1M >= 0 ? '+' : ''}{performance.change1M.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">3 Months</span>
                <span className={`font-medium ${performance.change3M >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {performance.change3M >= 0 ? '+' : ''}{performance.change3M.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">1 Year</span>
                <span className={`font-medium ${performance.change1Y >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {performance.change1Y >= 0 ? '+' : ''}{performance.change1Y.toFixed(2)}%
                </span>
              </div>
              <hr className="my-3" />
              <div className="flex justify-between">
                <span className="text-gray-600">52W High</span>
                <span className="font-medium">PKR {performance.high52W.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">52W Low</span>
                <span className="font-medium">PKR {performance.low52W.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Financials and Ratios */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Financial Highlights */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Financial Highlights (TTM)</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Revenue</span>
                <span className="font-medium">PKR {(financials.revenue / 1000).toFixed(1)}B</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Net Income</span>
                <span className="font-medium">PKR {(financials.netIncome / 1000).toFixed(1)}B</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Assets</span>
                <span className="font-medium">PKR {(financials.totalAssets / 1000).toFixed(1)}B</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Equity</span>
                <span className="font-medium">PKR {(financials.totalEquity / 1000).toFixed(1)}B</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Cash & Equivalents</span>
                <span className="font-medium">PKR {(financials.cash / 1000).toFixed(1)}B</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Debt</span>
                <span className="font-medium">PKR {(financials.debt / 1000).toFixed(1)}B</span>
              </div>
            </div>
          </div>

          {/* Key Ratios */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Key Ratios</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Return on Assets (ROA)</span>
                <span className="font-medium">{ratios.roa.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Debt to Equity</span>
                <span className="font-medium">{ratios.debtToEquity.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Current Ratio</span>
                <span className="font-medium">{ratios.currentRatio.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Gross Margin</span>
                <span className="font-medium">{ratios.grossMargin.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Net Margin</span>
                <span className="font-medium">{ratios.netMargin.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
