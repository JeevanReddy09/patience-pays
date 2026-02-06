// In-memory cache with TTL for stock data

import { CachedData } from './types';

const cache = new Map<string, CachedData<unknown>>();

const DEFAULT_TTL = 60 * 60 * 1000; // 1 hour in milliseconds

export function getCached<T>(key: string): T | null {
    const cached = cache.get(key);

    if (!cached) {
        return null;
    }

    const now = Date.now();
    if (now - cached.timestamp > cached.ttl) {
        cache.delete(key);
        return null;
    }

    return cached.data as T;
}

export function setCache<T>(key: string, data: T, ttl: number = DEFAULT_TTL): void {
    cache.set(key, {
        data,
        timestamp: Date.now(),
        ttl,
    });
}

export function clearCache(): void {
    cache.clear();
}

export function getCacheKey(ticker: string, startDate: string, endDate: string): string {
    return `${ticker.toUpperCase()}_${startDate}_${endDate}`;
}
