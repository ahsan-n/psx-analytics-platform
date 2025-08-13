import type { FormatOptions } from '../types/api';

/**
 * Format currency values in Pakistani Rupees
 */
export const formatCurrency = (
  value: number,
  options: { compact?: boolean; precision?: number } = {}
): string => {
  const { compact = false, precision = 0 } = options;

  if (compact) {
    return formatCompactNumber(value, { currency: true, precision });
  }

  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  }).format(value);
};

/**
 * Format percentage values
 */
export const formatPercentage = (
  value: number,
  options: { precision?: number; showSign?: boolean } = {}
): string => {
  const { precision = 2, showSign = true } = options;
  
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
    signDisplay: showSign ? 'exceptZero' : 'auto',
  }).format(value / 100);

  return formatted;
};

/**
 * Format large numbers in compact format (e.g., 1.2B, 500M, 10.5K)
 */
export const formatCompactNumber = (
  value: number,
  options: { currency?: boolean; precision?: number } = {}
): string => {
  const { currency = false, precision = 1 } = options;

  if (value === 0) return currency ? 'PKR 0' : '0';

  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  let formatted: string;
  let suffix: string;

  if (absValue >= 1e12) {
    formatted = (absValue / 1e12).toFixed(precision);
    suffix = 'T';
  } else if (absValue >= 1e9) {
    formatted = (absValue / 1e9).toFixed(precision);
    suffix = 'B';
  } else if (absValue >= 1e6) {
    formatted = (absValue / 1e6).toFixed(precision);
    suffix = 'M';
  } else if (absValue >= 1e3) {
    formatted = (absValue / 1e3).toFixed(precision);
    suffix = 'K';
  } else {
    formatted = absValue.toFixed(precision);
    suffix = '';
  }

  // Remove trailing zeros and decimal point if not needed
  formatted = parseFloat(formatted).toString();

  const prefix = currency ? 'PKR ' : '';
  return `${sign}${prefix}${formatted}${suffix}`;
};

/**
 * Format market cap values
 */
export const formatMarketCap = (value: number): string => {
  return formatCompactNumber(value, { currency: true, precision: 1 });
};

/**
 * Format volume values
 */
export const formatVolume = (value: number): string => {
  return formatCompactNumber(value, { precision: 1 });
};

/**
 * Format stock price
 */
export const formatPrice = (value: number): string => {
  return formatCurrency(value, { precision: 2 });
};

/**
 * Format change percentage with color coding info
 */
export const formatChangePercentage = (value: number): {
  formatted: string;
  colorClass: string;
  trend: 'positive' | 'negative' | 'neutral';
} => {
  const formatted = formatPercentage(value, { precision: 2 });
  
  let colorClass: string;
  let trend: 'positive' | 'negative' | 'neutral';

  if (value > 0) {
    colorClass = 'text-emerald-600';
    trend = 'positive';
  } else if (value < 0) {
    colorClass = 'text-red-600';
    trend = 'negative';
  } else {
    colorClass = 'text-slate-600';
    trend = 'neutral';
  }

  return { formatted, colorClass, trend };
};

/**
 * Format date/time strings
 */
export const formatDateTime = (
  dateString: string,
  options: Intl.DateTimeFormatOptions = {}
): string => {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  };

  return new Intl.DateTimeFormat('en-US', defaultOptions).format(new Date(dateString));
};

/**
 * Format time ago (e.g., "2 minutes ago", "1 hour ago")
 */
export const formatTimeAgo = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  }
};

/**
 * Format financial ratios
 */
export const formatRatio = (value: number, precision: number = 2): string => {
  if (value === 0 || !isFinite(value)) return 'N/A';
  return value.toFixed(precision);
};

/**
 * Format beta values
 */
export const formatBeta = (value: number): string => {
  if (!isFinite(value)) return 'N/A';
  return value.toFixed(2);
};

/**
 * Format sector names for display
 */
export const formatSectorName = (sectorId: string): string => {
  return sectorId
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Get color class for performance based on value
 */
export const getPerformanceColor = (value: number): string => {
  if (value > 0) return 'text-emerald-600';
  if (value < 0) return 'text-red-600';
  return 'text-slate-600';
};

/**
 * Get background color class for performance badges
 */
export const getPerformanceBadgeClass = (value: number): string => {
  if (value > 0) return 'performance-positive';
  if (value < 0) return 'performance-negative';
  return 'performance-neutral';
};

/**
 * Format index value (like KSE-100)
 */
export const formatIndex = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

/**
 * Format large currency values for market summary
 */
export const formatLargeCurrency = (value: number): string => {
  if (value >= 1e12) {
    return `PKR ${(value / 1e12).toFixed(1)}T`;
  } else if (value >= 1e9) {
    return `PKR ${(value / 1e9).toFixed(1)}B`;
  } else if (value >= 1e6) {
    return `PKR ${(value / 1e6).toFixed(1)}M`;
  }
  return formatCurrency(value, { compact: true });
};
