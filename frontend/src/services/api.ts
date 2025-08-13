import axios from 'axios';
import type {
  HealthResponse,
  SectorsOverviewResponse,
  SectorDetailResponse,
  SectorCompaniesResponse,
  SectorCompareResponse,
  GetSectorsParams,
  GetSectorDetailsParams,
  GetSectorCompaniesParams,
  SectorCompareRequest,
} from '../types/api';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:8888',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', error.response?.data || error.message);
    
    // Handle common errors
    if (error.response?.status === 404) {
      throw new Error('Resource not found');
    } else if (error.response?.status >= 500) {
      throw new Error('Server error. Please try again later.');
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. Please check your connection.');
    }
    
    throw error;
  }
);

export class SectorAPI {
  /**
   * Health check endpoint
   */
  static async getHealth(): Promise<HealthResponse> {
    const response = await api.get<HealthResponse>('/health');
    return response.data;
  }

  /**
   * Get all PSX sectors overview
   */
  static async getAllSectors(params: GetSectorsParams = {}): Promise<SectorsOverviewResponse> {
    const queryParams = new URLSearchParams();
    
    if (params.timeframe) queryParams.append('timeframe', params.timeframe);
    if (params.sort_by) queryParams.append('sort_by', params.sort_by);
    if (params.sort_order) queryParams.append('sort_order', params.sort_order);

    const url = `/api/v1/sectors${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await api.get<SectorsOverviewResponse>(url);
    return response.data;
  }

  /**
   * Get detailed sector analysis
   */
  static async getSectorDetails(params: GetSectorDetailsParams): Promise<SectorDetailResponse> {
    const queryParams = new URLSearchParams();
    if (params.timeframe) queryParams.append('timeframe', params.timeframe);

    const url = `/api/v1/sectors/${params.sectorId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await api.get<SectorDetailResponse>(url);
    return response.data;
  }

  /**
   * Get top companies in sector
   */
  static async getSectorCompanies(params: GetSectorCompaniesParams): Promise<SectorCompaniesResponse> {
    const queryParams = new URLSearchParams();
    
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.sort_by) queryParams.append('sort_by', params.sort_by);

    const url = `/api/v1/sectors/${params.sectorId}/companies${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await api.get<SectorCompaniesResponse>(url);
    return response.data;
  }

  /**
   * Compare multiple sectors
   */
  static async compareSectors(request: SectorCompareRequest): Promise<SectorCompareResponse> {
    const response = await api.post<SectorCompareResponse>('/api/v1/sectors/compare', request);
    return response.data;
  }
}

// Helper functions for API error handling
export const handleApiError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

// API status checker
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    await SectorAPI.getHealth();
    return true;
  } catch {
    return false;
  }
};

export default api;
