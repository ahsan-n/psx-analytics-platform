import React from 'react';
import { motion } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  ClockIcon,
  ArrowsUpDownIcon,
} from '@heroicons/react/24/outline';
import type { FilterState } from '../types/api';

interface FilterControlsProps {
  filters: FilterState;
  onFilterChange: (filters: Partial<FilterState>) => void;
  loading?: boolean;
}

const FilterControls: React.FC<FilterControlsProps> = ({
  filters,
  onFilterChange,
  loading = false,
}) => {
  const timeframeOptions = [
    { value: '1D' as const, label: '1 Day', shortLabel: '1D' },
    { value: '1W' as const, label: '1 Week', shortLabel: '1W' },
    { value: '1M' as const, label: '1 Month', shortLabel: '1M' },
    { value: '3M' as const, label: '3 Months', shortLabel: '3M' },
    { value: '6M' as const, label: '6 Months', shortLabel: '6M' },
    { value: '1Y' as const, label: '1 Year', shortLabel: '1Y' },
  ];

  const sortOptions = [
    { value: 'market_cap' as const, label: 'Market Cap', icon: '💰' },
    { value: 'performance' as const, label: 'Performance', icon: '📈' },
    { value: 'volume' as const, label: 'Volume', icon: '📊' },
    { value: 'company_count' as const, label: 'Companies', icon: '🏢' },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900 flex items-center space-x-2">
          <AdjustmentsHorizontalIcon className="w-5 h-5" />
          <span>Filters & Search</span>
        </h2>
      </div>

      <div className="card">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="lg:col-span-1">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Search Sectors
            </label>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by sector name..."
                value={filters.searchQuery || ''}
                onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                disabled={loading}
              />
            </div>
          </div>

          {/* Timeframe */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center space-x-1">
              <ClockIcon className="w-4 h-4" />
              <span>Timeframe</span>
            </label>
            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-lg">
              {timeframeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => onFilterChange({ timeframe: option.value })}
                  disabled={loading}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                    filters.timeframe === option.value
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {option.shortLabel}
                </button>
              ))}
            </div>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Sort By
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) => onFilterChange({ 
                sortBy: e.target.value as FilterState['sortBy'] 
              })}
              disabled={loading}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.icon} {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center space-x-1">
              <ArrowsUpDownIcon className="w-4 h-4" />
              <span>Order</span>
            </label>
            <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-lg">
              <button
                onClick={() => onFilterChange({ sortOrder: 'desc' })}
                disabled={loading}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  filters.sortOrder === 'desc'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                High to Low
              </button>
              <button
                onClick={() => onFilterChange({ sortOrder: 'asc' })}
                disabled={loading}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  filters.sortOrder === 'asc'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Low to High
              </button>
            </div>
          </div>
        </div>

        {/* Active Filters Summary */}
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ 
            opacity: filters.searchQuery ? 1 : 0, 
            height: filters.searchQuery ? 'auto' : 0 
          }}
          transition={{ duration: 0.2 }}
          className="mt-4 pt-4 border-t border-slate-200"
        >
          {filters.searchQuery && (
            <div className="flex items-center space-x-2 text-sm text-slate-600">
              <span>Searching for:</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md font-medium">
                "{filters.searchQuery}"
              </span>
              <button
                onClick={() => onFilterChange({ searchQuery: '' })}
                className="text-slate-400 hover:text-slate-600 transition-colors duration-200"
              >
                ✕
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </motion.section>
  );
};

export default FilterControls;
