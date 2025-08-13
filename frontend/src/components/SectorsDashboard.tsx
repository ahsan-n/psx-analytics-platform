import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChartBarIcon, 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon,
  BuildingOffice2Icon,
  CurrencyDollarIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
} from '@heroicons/react/24/outline';
import { SectorAPI } from '../services/api';
import type { 
  SectorsOverviewResponse, 
  SectorOverview, 
  MarketSummary,
  FilterState 
} from '../types/api';
import { 
  formatMarketCap, 
  formatChangePercentage, 
  formatVolume,
  formatTimeAgo,
  formatIndex,
  getPerformanceBadgeClass
} from '../utils/formatters';
import LoadingSpinner from './LoadingSpinner';
import SectorCard from './SectorCard';
import MarketSummaryCard from './MarketSummaryCard';
import FilterControls from './FilterControls';

const SectorsDashboard: React.FC = () => {
  const [data, setData] = useState<SectorsOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [filters, setFilters] = useState<FilterState>({
    timeframe: '1D',
    sortBy: 'market_cap',
    sortOrder: 'desc',
    searchQuery: '',
  });

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [filters.timeframe, filters.sortBy, filters.sortOrder]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await SectorAPI.getAllSectors({
        timeframe: filters.timeframe,
        sort_by: filters.sortBy,
        sort_order: filters.sortOrder,
      });
      
      setData(response);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const filteredSectors = data?.sectors.filter(sector =>
    sector.name.toLowerCase().includes(filters.searchQuery?.toLowerCase() || '')
  ) || [];

  if (loading && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <ChartBarIcon className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Failed to Load Data</h3>
          <p className="text-slate-600 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="btn-primary"
          >
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="glass border-b border-white/20 sticky top-0 z-40">
        <div className="container-fluid py-4">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-4"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <ChartBarIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gradient">
                  PSX Analytics Platform
                </h1>
                <p className="text-slate-600 text-sm">
                  Pakistan Stock Exchange Sector Analysis
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-3 text-sm text-slate-600"
            >
              <ClockIcon className="w-4 h-4" />
              <span>Last updated {formatTimeAgo(lastUpdated.toISOString())}</span>
              {loading && <LoadingSpinner size="sm" />}
            </motion.div>
          </div>
        </div>
      </header>

      <main className="container-fluid py-8 space-y-8">
        {/* Market Summary */}
        {data?.market_summary && (
          <MarketSummaryCard marketSummary={data.market_summary} />
        )}

        {/* Filters */}
        <FilterControls
          filters={filters}
          onFilterChange={handleFilterChange}
          loading={loading}
        />

        {/* Sectors Grid */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-900">
              PSX Sectors Overview
            </h2>
            <div className="flex items-center space-x-2 text-sm text-slate-600">
              <BuildingOffice2Icon className="w-4 h-4" />
              <span>{filteredSectors.length} sectors</span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="sector-grid"
              >
                {Array.from({ length: 12 }).map((_, index) => (
                  <div
                    key={index}
                    className="card h-48 loading-shimmer"
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="sectors"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="sector-grid"
              >
                {filteredSectors.map((sector, index) => (
                  <SectorCard
                    key={sector.id}
                    sector={sector}
                    index={index}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {filteredSectors.length === 0 && !loading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <MagnifyingGlassIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                No sectors found
              </h3>
              <p className="text-slate-600">
                Try adjusting your search criteria
              </p>
            </motion.div>
          )}
        </motion.section>
      </main>
    </div>
  );
};

export default SectorsDashboard;
