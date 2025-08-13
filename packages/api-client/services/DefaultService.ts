/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AnnouncementsRequest } from '../models/AnnouncementsRequest';
import type { AnnouncementsResponse } from '../models/AnnouncementsResponse';
import type { CompaniesResponse } from '../models/CompaniesResponse';
import type { CompanyAnalyticsResponse } from '../models/CompanyAnalyticsResponse';
import type { CompanyReportsResponse } from '../models/CompanyReportsResponse';
import type { HealthResponse } from '../models/HealthResponse';
import type { HistoricalRequest } from '../models/HistoricalRequest';
import type { HistoricalSeriesResponse } from '../models/HistoricalSeriesResponse';
import type { IndexSnapshot } from '../models/IndexSnapshot';
import type { IndicesResponse } from '../models/IndicesResponse';
import type { IntradaySeriesResponse } from '../models/IntradaySeriesResponse';
import type { MarketSummaryResponse } from '../models/MarketSummaryResponse';
import type { MarketWatchResponse } from '../models/MarketWatchResponse';
import type { PerformersResponse } from '../models/PerformersResponse';
import type { SectorBreakdownResponse } from '../models/SectorBreakdownResponse';
import type { SymbolsResponse } from '../models/SymbolsResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class DefaultService {
    /**
     * Health check
     * @returns HealthResponse OK
     * @throws ApiError
     */
    public static getHealth(): CancelablePromise<HealthResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/health',
        });
    }
    /**
     * Get sector breakdown data (KSE-100 by default)
     * @returns SectorBreakdownResponse Sector breakdown data
     * @throws ApiError
     */
    public static getSectorBreakdown({
        index = 'KSE100',
    }: {
        /**
         * Filter by index/board (default KSE-100)
         */
        index?: 'KSE100',
    }): CancelablePromise<SectorBreakdownResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/dashboard/sectors',
            query: {
                'index': index,
            },
        });
    }
    /**
     * Get companies list (KSE-100 by default)
     * @returns CompaniesResponse List of companies
     * @throws ApiError
     */
    public static getCompanies({
        sector,
        status,
        index = 'KSE100',
        page = 1,
        limit = 20,
    }: {
        /**
         * Filter by sector
         */
        sector?: string,
        /**
         * Listing status filter (e.g., NC)
         */
        status?: string,
        /**
         * Filter by index/board (default KSE-100)
         */
        index?: 'KSE100',
        /**
         * Page number (1-based)
         */
        page?: number,
        /**
         * Limit number of results
         */
        limit?: number,
    }): CancelablePromise<CompaniesResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/companies',
            query: {
                'sector': sector,
                'status': status,
                'index': index,
                'page': page,
                'limit': limit,
            },
        });
    }
    /**
     * Get company analytics
     * @returns CompanyAnalyticsResponse Company analytics data
     * @throws ApiError
     */
    public static getCompanyAnalytics({
        symbol,
    }: {
        /**
         * Company symbol
         */
        symbol: string,
    }): CancelablePromise<CompanyAnalyticsResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/companies/{symbol}',
            path: {
                'symbol': symbol,
            },
        });
    }
    /**
     * Get index snapshot by code
     * @returns IndexSnapshot Index snapshot
     * @throws ApiError
     */
    public static getIndexSnapshot({
        code,
    }: {
        /**
         * Index code (e.g., KSE100)
         */
        code: string,
    }): CancelablePromise<IndexSnapshot> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/indices/{code}',
            path: {
                'code': code,
            },
        });
    }
    /**
     * Get market performers (gainers, losers, volume leaders)
     * @returns PerformersResponse Market performers
     * @throws ApiError
     */
    public static getMarketPerformers({
        board,
        session,
        assetClass,
    }: {
        /**
         * Market board code
         */
        board?: string,
        /**
         * Trading session identifier
         */
        session?: string,
        /**
         * Asset class filter
         */
        assetClass?: 'equity' | 'debt',
    }): CancelablePromise<PerformersResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/market/performers',
            query: {
                'board': board,
                'session': session,
                'assetClass': assetClass,
            },
        });
    }
    /**
     * Get market watch table
     * @returns MarketWatchResponse Market watch rows
     * @throws ApiError
     */
    public static getMarketWatch(): CancelablePromise<MarketWatchResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/market/watch',
        });
    }
    /**
     * Get today's market boards summary
     * @returns MarketSummaryResponse Boards totals summary
     * @throws ApiError
     */
    public static getMarketSummary(): CancelablePromise<MarketSummaryResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/market/summary',
        });
    }
    /**
     * Get historical OHLCV series
     * @returns HistoricalSeriesResponse Historical OHLCV series
     * @throws ApiError
     */
    public static getHistoricalSeries({
        requestBody,
    }: {
        requestBody: HistoricalRequest,
    }): CancelablePromise<HistoricalSeriesResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/historical',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Get company announcements
     * @returns AnnouncementsResponse Announcements list
     * @throws ApiError
     */
    public static getAnnouncements({
        requestBody,
    }: {
        requestBody: AnnouncementsRequest,
    }): CancelablePromise<AnnouncementsResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/announcements',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Get company reports (documents)
     * @returns CompanyReportsResponse Reports list
     * @throws ApiError
     */
    public static getCompanyReports({
        symbol,
    }: {
        /**
         * Company symbol
         */
        symbol: string,
    }): CancelablePromise<CompanyReportsResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/company/{symbol}/reports',
            path: {
                'symbol': symbol,
            },
        });
    }
    /**
     * Get intraday price series for a company
     * @returns IntradaySeriesResponse Intraday series
     * @throws ApiError
     */
    public static getCompanyIntraday({
        symbol,
    }: {
        /**
         * Company symbol
         */
        symbol: string,
    }): CancelablePromise<IntradaySeriesResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/company/{symbol}/intraday',
            path: {
                'symbol': symbol,
            },
        });
    }
    /**
     * Get snapshots for all indices
     * @returns IndicesResponse Indices snapshot list
     * @throws ApiError
     */
    public static getIndices(): CancelablePromise<IndicesResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/indices',
        });
    }
    /**
     * Get intraday series for an index
     * @returns IntradaySeriesResponse Intraday series
     * @throws ApiError
     */
    public static getIndexIntraday({
        code,
    }: {
        code: string,
    }): CancelablePromise<IntradaySeriesResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/indices/{code}/intraday',
            path: {
                'code': code,
            },
        });
    }
    /**
     * Get all tradable symbols
     * @returns SymbolsResponse Symbols list
     * @throws ApiError
     */
    public static getSymbols(): CancelablePromise<SymbolsResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/symbols',
        });
    }
}
