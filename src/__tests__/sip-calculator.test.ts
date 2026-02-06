import { describe, it, expect } from 'vitest';
import {
    calculateSIP,
    getMonthsInRange,
    findFirstTradingDayInMonth,
    getLastClosePrice,
    calculateCAGR,
} from '@/lib/sip-calculator';
import { SIPInputs, StockDataPoint } from '@/lib/types';

// Helper to create stock data points with UTC dates at noon to avoid timezone issues
function createStockData(dateStr: string, close: number): StockDataPoint {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
    return {
        date,
        open: close,
        high: close + 1,
        low: close - 1,
        close,
        volume: 1000000,
        adjClose: close,
    };
}

describe('getMonthsInRange', () => {
    it('should return all months between start and end dates', () => {
        const months = getMonthsInRange('2023-08-01', '2023-12-31');
        expect(months).toEqual(['2023-08', '2023-09', '2023-10', '2023-11', '2023-12']);
    });

    it('should handle single month range', () => {
        const months = getMonthsInRange('2023-08-15', '2023-08-20');
        expect(months).toEqual(['2023-08']);
    });

    it('should handle year boundaries', () => {
        const months = getMonthsInRange('2023-11-01', '2024-02-28');
        expect(months).toEqual(['2023-11', '2023-12', '2024-01', '2024-02']);
    });
});

describe('findFirstTradingDayInMonth', () => {
    const stockData = [
        createStockData('2023-08-01', 130.0),
        createStockData('2023-08-02', 131.0),
        createStockData('2023-09-01', 135.0),
        createStockData('2023-10-02', 140.0),
    ];

    it('should find first trading day when data exists', () => {
        const result = findFirstTradingDayInMonth('2023-08', stockData);
        expect(result?.close).toBe(130.0);
    });

    it('should return next available day when first is missing', () => {
        const result = findFirstTradingDayInMonth('2023-10', stockData);
        expect(result?.close).toBe(140.0);
    });

    it('should return null for month with no trading data', () => {
        const result = findFirstTradingDayInMonth('2023-07', stockData);
        expect(result).toBeNull();
    });
});

describe('getLastClosePrice', () => {
    const stockData = [
        createStockData('2023-08-01', 130.0),
        createStockData('2023-08-15', 135.0),
        createStockData('2023-08-31', 140.0),
    ];

    it('should return last close on or before end date', () => {
        const result = getLastClosePrice('2023-08-20', stockData);
        expect(result?.close).toBe(135.0);
    });

    it('should return exact date if available', () => {
        const result = getLastClosePrice('2023-08-31', stockData);
        expect(result?.close).toBe(140.0);
    });

    it('should return null if no data before end date', () => {
        const result = getLastClosePrice('2023-07-01', stockData);
        expect(result).toBeNull();
    });
});

describe('calculateCAGR', () => {
    it('should calculate CAGR correctly for positive returns', () => {
        const cagr = calculateCAGR(1000, 1100, 1);
        expect(cagr).toBeCloseTo(10, 1);
    });

    it('should calculate CAGR correctly for multi-year period', () => {
        const cagr = calculateCAGR(1000, 1210, 2);
        expect(cagr).toBeCloseTo(10, 1);
    });

    it('should return 0 for invalid inputs', () => {
        expect(calculateCAGR(0, 1000, 1)).toBe(0);
        expect(calculateCAGR(1000, 1100, 0)).toBe(0);
    });
});

describe('calculateSIP', () => {
    const baseInputs: SIPInputs = {
        ticker: 'TEST',
        monthlyContribution: 100,
        startDate: '2023-08-01',
        endDate: '2023-10-31',
        executionRule: 'first_trading_day_close',
        currency: 'USD',
    };

    // Test Case 1: Normal SIP calculation
    it('should calculate SIP correctly for normal case', () => {
        const stockData = [
            createStockData('2023-08-01', 100.0),
            createStockData('2023-09-01', 110.0),
            createStockData('2023-10-02', 105.0),
            createStockData('2023-10-31', 120.0),
        ];

        const result = calculateSIP(baseInputs, stockData);

        expect(result.summary.numberOfContributions).toBe(3);
        expect(result.summary.totalContributed).toBe(300);
        expect(result.monthly.length).toBe(3);
        expect(result.monthly[0].sharesBought).toBeCloseTo(1, 4);
    });

    // Test Case 2: Weekend month start
    it('should handle weekend month start correctly', () => {
        const stockData = [
            createStockData('2023-10-02', 100.0),
            createStockData('2023-10-31', 110.0),
        ];

        const inputs: SIPInputs = {
            ...baseInputs,
            startDate: '2023-10-01',
            endDate: '2023-10-31',
        };

        const result = calculateSIP(inputs, stockData);
        expect(result.monthly[0].closePrice).toBe(100.0);
    });

    // Test Case 3: Holiday month start
    it('should handle holiday at month start', () => {
        const stockData = [
            createStockData('2024-01-02', 150.0),
            createStockData('2024-01-31', 155.0),
        ];

        const inputs: SIPInputs = {
            ...baseInputs,
            startDate: '2024-01-01',
            endDate: '2024-01-31',
        };

        const result = calculateSIP(inputs, stockData);
        expect(result.summary.numberOfContributions).toBe(1);
    });

    // Test Case 4: Missing month
    it('should skip months with no trading data', () => {
        const stockData = [
            createStockData('2023-08-01', 100.0),
            createStockData('2023-10-02', 110.0),
            createStockData('2023-10-31', 115.0),
        ];

        const result = calculateSIP(baseInputs, stockData);

        expect(result.monthly.length).toBe(3);
        expect(result.monthly[1].note).toBe('No trading data available for this month');
        expect(result.summary.numberOfContributions).toBe(2);
    });

    // Test Case 5: End date mid-month
    it('should include partial month when end date is mid-month', () => {
        const stockData = [
            createStockData('2023-08-01', 100.0),
            createStockData('2023-08-15', 105.0),
        ];

        const inputs: SIPInputs = {
            ...baseInputs,
            startDate: '2023-08-01',
            endDate: '2023-08-15',
        };

        const result = calculateSIP(inputs, stockData);
        expect(result.monthly.length).toBe(1);
        expect(result.summary.lastClosePrice).toBe(105.0);
    });

    // Test Case 6: No data available
    it('should throw error when no stock data in range', () => {
        const stockData: StockDataPoint[] = [];
        expect(() => calculateSIP(baseInputs, stockData)).toThrow();
    });
});
