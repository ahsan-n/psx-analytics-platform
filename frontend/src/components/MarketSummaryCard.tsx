import React from 'react';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  BuildingOffice2Icon,
  ArrowsRightLeftIcon,
} from '@heroicons/react/24/outline';
import type { MarketSummary } from '../types/api';
import {
  formatIndex,
  formatChangePercentage,
  formatLargeCurrency,
  formatVolume,
  getPerformanceColor,
  formatTimeAgo,
} from '../utils/formatters';

interface MarketSummaryCardProps {
  marketSummary: MarketSummary;
}

const MarketSummaryCard: React.FC<MarketSummaryCardProps> = ({ marketSummary }) => {
  const kseChange = formatChangePercentage(marketSummary.kse100_change);
  const isPositive = marketSummary.kse100_change > 0;

  const metrics = [
    {
      label: 'KSE-100 Index',
      value: formatIndex(marketSummary.kse100_index),
      change: kseChange.formatted,
      changeColor: getPerformanceColor(marketSummary.kse100_change),
      icon: ChartBarIcon,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      isMain: true,
    },
    {
      label: 'Total Market Cap',
      value: formatLargeCurrency(marketSummary.total_market_cap),
      icon: CurrencyDollarIcon,
      iconColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      label: 'Total Volume',
      value: formatVolume(marketSummary.total_volume),
      icon: ArrowsRightLeftIcon,
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'Total Turnover',
      value: formatLargeCurrency(marketSummary.total_turnover),
      icon: BuildingOffice2Icon,
      iconColor: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      label: 'Advance/Decline',
      value: marketSummary.advance_decline_ratio.toFixed(2),
      icon: TrendingUpIcon,
      iconColor: marketSummary.advance_decline_ratio > 1 ? 'text-emerald-600' : 'text-red-600',
      bgColor: marketSummary.advance_decline_ratio > 1 ? 'bg-emerald-50' : 'bg-red-50',
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">Market Overview</h2>
        <p className="text-sm text-slate-600">
          Updated {formatTimeAgo(marketSummary.last_updated)}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`card ${metric.isMain ? 'md:col-span-2 lg:col-span-1' : ''} group hover:scale-105`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 ${metric.bgColor} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                <metric.icon className={`w-5 h-5 ${metric.iconColor}`} />
              </div>
              
              {metric.change && (
                <div className={`flex items-center space-x-1 ${metric.changeColor}`}>
                  {isPositive ? (
                    <TrendingUpIcon className="w-4 h-4" />
                  ) : (
                    <TrendingDownIcon className="w-4 h-4" />
                  )}
                  <span className="text-sm font-medium">{metric.change}</span>
                </div>
              )}
            </div>

            <div>
              <p className="text-2xl font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors duration-300">
                {metric.value}
              </p>
              <p className="text-sm text-slate-600">{metric.label}</p>
            </div>

            {/* KSE-100 Additional Info */}
            {metric.isMain && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-3 pt-3 border-t border-slate-200"
              >
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>Pakistan Stock Exchange</span>
                  <span className="flex items-center space-x-1">
                    <div className={`w-2 h-2 rounded-full ${isPositive ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse`} />
                    <span>Live</span>
                  </span>
                </div>
              </motion.div>
            )}

            {/* Advance/Decline Additional Info */}
            {metric.label === 'Advance/Decline' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-3 pt-3 border-t border-slate-200"
              >
                <div className="text-xs text-slate-600">
                  {marketSummary.advance_decline_ratio > 1 ? (
                    <span className="text-emerald-600">More stocks advancing</span>
                  ) : marketSummary.advance_decline_ratio < 1 ? (
                    <span className="text-red-600">More stocks declining</span>
                  ) : (
                    <span className="text-slate-600">Balanced market</span>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Market Status Indicator */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6 }}
        className="card bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
            <span className="font-medium text-slate-900">Market Status: Open</span>
            <span className="text-sm text-slate-600">
              Trading hours: 9:15 AM - 3:30 PM PKT
            </span>
          </div>
          
          <div className="text-right">
            <p className="text-sm text-slate-600">Next update in</p>
            <p className="font-medium text-slate-900">30 seconds</p>
          </div>
        </div>
      </motion.div>
    </motion.section>
  );
};

export default MarketSummaryCard;
