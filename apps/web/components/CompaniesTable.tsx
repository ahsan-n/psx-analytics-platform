'use client';

import React from 'react';
import Link from 'next/link';
import type { CompaniesResponse } from '@stock-analytics/api-client';

interface CompaniesTableProps {
  data: CompaniesResponse;
  title?: string;
  sectorAvgPeByName?: Record<string, number>;
}

export default function CompaniesTable({ data, title = "Companies", sectorAvgPeByName = {} }: CompaniesTableProps) {
  const [query, setQuery] = React.useState('');
  const [sectorFilter, setSectorFilter] = React.useState<string>('');
  const [sortKey, setSortKey] = React.useState<'symbol' | 'name' | 'sector' | 'marketCap' | 'marketCapComputed' | 'price' | 'change' | 'pe' | 'sectorPE'>('marketCap');
  const [sortDir, setSortDir] = React.useState<'asc' | 'desc'>('desc');

  const sectors = Array.from(new Set((data.companies || []).map(c => c.sector).filter(Boolean))) as string[];
  const filtered = (data.companies || []).filter(c => {
    const q = query.trim().toLowerCase();
    const okQ = !q || (c.symbol || '').toLowerCase().includes(q) || (c.name || '').toLowerCase().includes(q);
    const okS = !sectorFilter || (c.sector || '') === sectorFilter;
    return okQ && okS;
  }).map(c => ({
    ...c,
    sectorPE: sectorAvgPeByName[c.sector || ''] || 0,
  }));

  const sorted = [...filtered].sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1;
    const av = (a as any)[sortKey] || 0;
    const bv = (b as any)[sortKey] || 0;
    if (typeof av === 'string' && typeof bv === 'string') return av.localeCompare(bv) * dir;
    return (av - bv) * dir;
  });
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        <div className="text-sm text-gray-500">
          Showing {data.companies.length} of {data.total} companies
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search symbol or name"
          className="border rounded px-3 py-2 text-sm"
        />
        <select 
          value={sectorFilter}
          onChange={e => setSectorFilter(e.target.value)}
          className="border rounded px-3 py-2 text-sm"
        >
          <option value="">All sectors</option>
          {sectors.map(s => (<option key={s} value={s}>{s}</option>))}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th onClick={() => {setSortKey('symbol'); setSortDir(sortDir==='asc'?'desc':'asc')}} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">
                Symbol
              </th>
              <th onClick={() => {setSortKey('name'); setSortDir(sortDir==='asc'?'desc':'asc')}} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">
                Company Name
              </th>
              <th onClick={() => {setSortKey('sector'); setSortDir(sortDir==='asc'?'desc':'asc')}} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">
                Sector
              </th>
              <th onClick={() => {setSortKey('marketCap'); setSortDir(sortDir==='asc'?'desc':'asc')}} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">
                Market Cap (KSE 100 contribution)
              </th>
              <th onClick={() => {setSortKey('price'); setSortDir(sortDir==='asc'?'desc':'asc')}} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">
                Price
              </th>
              <th onClick={() => {setSortKey('marketCapComputed'); setSortDir(sortDir==='asc'?'desc':'asc')}} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">
                Market Cap
              </th>
              <th onClick={() => {setSortKey('change'); setSortDir(sortDir==='asc'?'desc':'asc')}} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">
                Change
              </th>
              <th onClick={() => {setSortKey('pe'); setSortDir(sortDir==='asc'?'desc':'asc')}} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">
                P/E Ratio
              </th>
              <th onClick={() => {setSortKey('sectorPE'); setSortDir(sortDir==='asc'?'desc':'asc')}} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">
                Sector P/E
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sorted.map((company, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">
                  <Link href={`/companies/${company.symbol}`} className="hover:text-blue-800">
                    {company.symbol}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {company.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {company.sector}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  PKR {(company.marketCap / 1000).toFixed(0)}B
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  PKR {company.price.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {(() => {
                    const mc = (company as any).marketCapComputed as number | undefined;
                    return mc && mc > 0 ? `PKR ${(mc / 1000).toFixed(0)}B` : '—';
                  })()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <span className={`${company.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {company.change >= 0 ? '+' : ''}{company.change.toFixed(1)}%
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {company.pe ? `${company.pe.toFixed(1)}x` : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {company.sector ? `${(sectorAvgPeByName[company.sector] || 0).toFixed(1)}x` : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link 
                    href={`/companies/${company.symbol}`}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    View Analytics
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.total > data.companies.length && (
        <div className="mt-6 text-center">
          <Link 
            href="/companies"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100"
          >
            View All Companies ({data.total})
          </Link>
        </div>
      )}
    </div>
  );
}
