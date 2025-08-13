'use client';

import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import type { SectorBreakdownResponse } from '@stock-analytics/api-client';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

interface SectorBreakdownProps {
  data: SectorBreakdownResponse;
}

export default function SectorBreakdown({ data }: SectorBreakdownProps) {
  const sectors = data.sectors || [];
  // Prepare data for doughnut chart
  const doughnutData = {
    labels: sectors.map(sector => sector.name),
    datasets: [
      {
        label: 'Market Cap %',
        data: sectors.map(sector => sector.percentage),
        backgroundColor: [
          '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
          '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6B7280'
        ],
        borderColor: '#fff',
        borderWidth: 2,
      },
    ],
  };

  // Prepare DoD performance: cap-weighted 1D change
  const performanceData = {
    labels: sectors.map(s => s.name && s.name.length > 8 ? s.name.substring(0, 8) + '...' : (s.name || '')),
    datasets: [
      {
        label: '1D Change (%)',
        data: sectors.map(s => (s as any).change1D || 0),
        backgroundColor: sectors.map(s => ((s as any).change1D || 0) >= 0 ? '#10B981' : '#EF4444'),
        borderColor: sectors.map(s => ((s as any).change1D || 0) >= 0 ? '#059669' : '#DC2626'),
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.parsed || 0;
            return `${label}: ${value}%`;
          }
        }
      }
    },
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, ticks: { callback: (v: any) => v + '%' } } }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Sector Breakdown</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Market Cap Distribution */}
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-4">Market Cap Distribution</h3>
          <div className="h-80">
            <Doughnut data={doughnutData} options={chartOptions} />
          </div>
        </div>

        {/* DoD 1D Change */}
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-4">1‑Day Change</h3>
          <div className="h-80">
            <Bar data={performanceData} options={barOptions} />
          </div>
        </div>
      </div>

      {/* Sector Details Table */}
      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Sector Details</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sector
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Market Cap
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  % of Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Companies
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg P/E
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  1D Change
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sectors.map((sector, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {sector.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    PKR {((sector.marketCap || 0) / 1000).toFixed(0)}B
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {(sector.percentage || 0).toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {sector.companiesCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {(sector.avgPE || 0).toFixed(1)}x
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <span className={`${((sector as any).change1D || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {(((sector as any).change1D || 0) >= 0 ? '+' : '') + (((sector as any).change1D || 0).toFixed(1))}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-500">
        Last updated: {data.lastUpdated ? new Date(data.lastUpdated).toLocaleString() : '-'}
      </div>
    </div>
  );
}
