/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CompaniesResponse } from '../models/CompaniesResponse';
import type { CompanyAnalyticsResponse } from '../models/CompanyAnalyticsResponse';
import type { HealthResponse } from '../models/HealthResponse';
import type { SectorBreakdownResponse } from '../models/SectorBreakdownResponse';
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
     * Get sector breakdown data
     * @returns SectorBreakdownResponse Sector breakdown data
     * @throws ApiError
     */
    public static getSectorBreakdown(): CancelablePromise<SectorBreakdownResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/dashboard/sectors',
        });
    }
    /**
     * Get companies list
     * @returns CompaniesResponse List of companies
     * @throws ApiError
     */
    public static getCompanies({
        sector,
        limit = 20,
    }: {
        /**
         * Filter by sector
         */
        sector?: string,
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
}
