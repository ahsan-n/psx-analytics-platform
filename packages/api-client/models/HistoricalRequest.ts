/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type HistoricalRequest = {
    symbol: string;
    dateFrom: string;
    dateTo: string;
    interval: HistoricalRequest.interval;
};
export namespace HistoricalRequest {
    export enum interval {
        DAILY = 'daily',
        WEEKLY = 'weekly',
        MONTHLY = 'monthly',
        INTRADAY = 'intraday',
    }
}

