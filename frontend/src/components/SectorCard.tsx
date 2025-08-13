import React from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUpIcon,
  TrendingDownIcon,
  BuildingOffice2Icon,
  CurrencyDollarIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import type { SectorOverview } from '../types/api';
import {
  formatMarketCap,
  formatChangePercentage,
  formatVolume,
  getPerformanceBadgeClass,
  getPerformanceColor,
} from '../utils/formatters';

interface SectorCardProps {
  sector: SectorOverview;
  index: number;
  onClick?: () => void;
}

const SectorCard: React.FC<SectorCardProps> = ({ sector, index, onClick }) => {
  const performanceChange = formatChangePercentage(sector.performance.current_change);
  const isPositive = sector.performance.current_change > 0;
  const isNegative = sector.performance.current_change < 0;

  // Get sector icon and color based on sector type
  const getSectorIcon = (sectorId: string) => {
    const iconMap: Record<string, { icon: typeof BuildingOffice2Icon; color: string }> = {
      'banking-finance': { icon: BuildingOffice2Icon, color: 'text-blue-600' },
      'oil-gas': { icon: ChartBarIcon, color: 'text-amber-600' },
      'textiles': { icon: BuildingOffice2Icon, color: 'text-purple-600' },
      'cement': { icon: BuildingOffice2Icon, color: 'text-gray-600' },
      'fertilizer': { icon: ChartBarIcon, color: 'text-green-600' },
      'steel-engineering': { icon: BuildingOffice2Icon, color: 'text-slate-600' },
      'chemicals-pharmaceuticals': { icon: ChartBarIcon, color: 'text-teal-600' },
      'food-agriculture': { icon: ChartBarIcon, color: 'text-emerald-600' },
      'power-generation': { icon: ChartBarIcon, color: 'text-yellow-600' },
      'technology-telecom': { icon: ChartBarIcon, color: 'text-indigo-600' },
      'automobile': { icon: BuildingOffice2Icon, color: 'text-red-600' },
      'real-estate': { icon: BuildingOffice2Icon, color: 'text-orange-600' },
      'miscellaneous': { icon: BuildingOffice2Icon, color: 'text-rose-600' },
    };

    return iconMap[sectorId] || { icon: BuildingOffice2Icon, color: 'text-slate-600' };
  };

  const { icon: SectorIcon, color: iconColor } = getSectorIcon(sector.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
      className="card group cursor-pointer overflow-hidden"
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center group-hover:from-blue-100 group-hover:to-blue-200 transition-all duration-300`}>
            <SectorIcon className={`w-5 h-5 ${iconColor} group-hover:text-blue-600 transition-colors duration-300`} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors duration-300">
              {sector.name}
            </h3>
            <p className="text-sm text-slate-500">
              {sector.company_count} companies
            </p>
          </div>
        </div>

        {/* Performance Badge */}
        <div className={`${getPerformanceBadgeClass(sector.performance.current_change)} flex items-center space-x-1`}>
          {isPositive && <TrendingUpIcon className="w-3 h-3" />}
          {isNegative && <TrendingDownIcon className="w-3 h-3" />}
          <span className="text-xs font-medium">
            {performanceChange.formatted}
          </span>
        </div>
      </div>

      {/* Market Cap */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-600">Market Cap</span>
          <span className="font-semibold text-slate-900">
            {formatMarketCap(sector.market_cap)}
          </span>
        </div>
        
        {/* Market Cap Percentage */}
        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(sector.market_cap_percentage, 100)}%` }}
            transition={{ delay: index * 0.05 + 0.3, duration: 0.8 }}
            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
          />
        </div>
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>{sector.market_cap_percentage.toFixed(1)}% of total market</span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="text-center p-2 bg-slate-50 rounded-lg">
          <p className="text-xs text-slate-600 mb-1">Volume</p>
          <p className="font-medium text-slate-900 text-sm">
            {formatVolume(sector.volume_today)}
          </p>
        </div>
        <div className="text-center p-2 bg-slate-50 rounded-lg">
          <p className="text-xs text-slate-600 mb-1">Turnover</p>
          <p className="font-medium text-slate-900 text-sm">
            {formatMarketCap(sector.turnover_today)}
          </p>
        </div>
      </div>

      {/* Top Companies */}
      <div>
        <p className="text-xs text-slate-600 mb-2">Top Companies</p>
        <div className="space-y-1">
          {sector.top_companies.slice(0, 3).map((company, idx) => (
            <div
              key={company.symbol}
              className="flex items-center justify-between text-xs"
            >
              <span className="font-medium text-slate-700 truncate">
                {company.symbol}
              </span>
              <span className={getPerformanceColor(company.change_percent)}>
                {formatChangePercentage(company.change_percent).formatted}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </motion.div>
  );
};

export default SectorCard;
