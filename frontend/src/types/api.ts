// API Response Types based on our go-zero backend

export interface HealthResponse {
  status: string;
  timestamp: string;
  version: string;
}

export interface PerformanceMetrics {
  current_change: number;
  one_week: number;
  one_month: number;
  three_months: number;
  six_months: number;
  one_year: number;
  ytd: number;
}

export interface TopCompany {
  symbol: string;
  name: string;
  market_cap: number;
  current_price: number;
  change_percent: number;
}

export interface SectorOverview {
  id: string;
  name: string;
  market_cap: number;
  market_cap_percentage: number;
  performance: PerformanceMetrics;
  company_count: number;
  volume_today: number;
  turnover_today: number;
  top_companies: TopCompany[];
}

export interface MarketSummary {
  total_market_cap: number;
  kse100_index: number;
  kse100_change: number;
  total_volume: number;
  total_turnover: number;
  advance_decline_ratio: number;
  last_updated: string;
}

export interface SectorsOverviewResponse {
  sectors: SectorOverview[];
  market_summary: MarketSummary;
  last_updated: string;
}

export interface VolumeMetrics {
  today_volume: number;
  avg_volume_30d: number;
  today_turnover: number;
  avg_turnover_30d: number;
}

export interface SectorFinancialMetrics {
  avg_pe_ratio: number;
  avg_pb_ratio: number;
  avg_dividend_yield: number;
  avg_roe: number;
  avg_debt_to_equity: number;
  median_market_cap: number;
}

export interface ChartDataPoint {
  timestamp: string;
  value: number;
  volume: number;
}

export interface PerformanceChart {
  timeframe: string;
  data_points: ChartDataPoint[];
}

export interface SectorDetail {
  id: string;
  name: string;
  description: string;
  market_cap: number;
  market_cap_percentage: number;
  company_count: number;
  performance: PerformanceMetrics;
  volume_today: number;
  turnover_today: number;
  volatility: number;
  beta: number;
  last_updated: string;
}

export interface SectorCompany {
  symbol: string;
  name: string;
  market_cap: number;
  market_cap_percentage: number;
  current_price: number;
  change_percent: number;
  volume: number;
  pe_ratio: number;
  pb_ratio: number;
}

export interface SectorDetailResponse {
  sector: SectorDetail;
  performance_chart: PerformanceChart;
  financial_metrics: SectorFinancialMetrics;
  volume_metrics: VolumeMetrics;
  companies: SectorCompany[];
}

export interface SectorCompaniesResponse {
  sector_id: string;
  sector_name: string;
  companies: SectorCompany[];
  total_count: number;
}

export interface SectorCompareResponse {
  comparison: SectorOverview[];
  timeframe: string;
  generated_at: string;
}

// Request parameters
export interface GetSectorsParams {
  timeframe?: '1D' | '1W' | '1M' | '3M' | '6M' | '1Y';
  sort_by?: 'market_cap' | 'performance' | 'volume' | 'company_count';
  sort_order?: 'asc' | 'desc';
}

export interface GetSectorDetailsParams {
  sectorId: string;
  timeframe?: '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | '3Y' | '5Y';
}

export interface GetSectorCompaniesParams {
  sectorId: string;
  limit?: number;
  sort_by?: 'market_cap' | 'performance' | 'volume' | 'pe_ratio';
}

export interface SectorCompareRequest {
  sector_ids: string[];
  timeframe?: '1D' | '1W' | '1M' | '3M' | '6M' | '1Y';
  metrics?: ('performance' | 'market_cap' | 'volume' | 'pe_ratio' | 'pb_ratio' | 'dividend_yield')[];
}

// UI Component Types
export interface TimeframeOption {
  value: '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | '3Y' | '5Y';
  label: string;
  shortLabel?: string;
}

export interface SortOption {
  value: 'market_cap' | 'performance' | 'volume' | 'company_count';
  label: string;
  icon?: string;
}

export interface FilterState {
  timeframe: '1D' | '1W' | '1M' | '3M' | '6M' | '1Y';
  sortBy: 'market_cap' | 'performance' | 'volume' | 'company_count';
  sortOrder: 'asc' | 'desc';
  searchQuery?: string;
}

// Utility Types
export type PerformanceTimeframe = keyof Omit<PerformanceMetrics, 'current_change'>;

export interface FormatOptions {
  currency?: boolean;
  percentage?: boolean;
  compact?: boolean;
  precision?: number;
}
