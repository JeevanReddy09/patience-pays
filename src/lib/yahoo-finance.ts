// Yahoo Finance data fetching service

import YahooFinance from 'yahoo-finance2';
import { StockDataPoint } from './types';
import { getCached, setCache, getCacheKey } from './cache';

// Create instance for v3 API
const yahooFinance = new YahooFinance();

export interface FetchResult {
    data: StockDataPoint[];
    warnings: string[];
}

export async function fetchStockData(
    ticker: string,
    startDate: string,
    endDate: string
): Promise<FetchResult> {
    const cacheKey = getCacheKey(ticker, startDate, endDate);
    const cached = getCached<StockDataPoint[]>(cacheKey);

    if (cached) {
        return { data: cached, warnings: [] };
    }

    const warnings: string[] = [];

    try {
        // Suppress Yahoo Finance validation warnings
        const queryOptions = {
            period1: startDate,
            period2: endDate,
            interval: '1d' as const,
        };

        const result = await yahooFinance.chart(ticker, queryOptions);

        if (!result || !result.quotes || result.quotes.length === 0) {
            throw new Error(`No data found for ticker ${ticker}`);
        }

        const data: StockDataPoint[] = result.quotes
            .filter((quote) => quote.close !== null && quote.close !== undefined)
            .map((quote) => ({
                date: new Date(quote.date),
                open: quote.open ?? 0,
                high: quote.high ?? 0,
                low: quote.low ?? 0,
                close: quote.close ?? 0,
                volume: quote.volume ?? 0,
                adjClose: quote.adjclose ?? quote.close ?? 0,
            }));

        if (data.length === 0) {
            throw new Error(`No valid trading data found for ticker ${ticker}`);
        }

        setCache(cacheKey, data);
        return { data, warnings };

    } catch (error) {
        if (error instanceof Error) {
            if (error.message.includes('Not Found') || error.message.includes('Invalid')) {
                throw new Error(`Invalid ticker symbol: ${ticker}`);
            }
            throw error;
        }
        throw new Error(`Failed to fetch data for ${ticker}`);
    }
}

export async function validateTicker(ticker: string): Promise<boolean> {
    try {
        const result = await yahooFinance.quote(ticker);
        return !!result && !!result.symbol;
    } catch {
        return false;
    }
}
