// TypeScript interfaces for the Patience Pays SIP/DCA calculator

export interface SIPInputs {
    ticker: string;
    monthlyContribution: number;
    startDate: string; // YYYY-MM-DD
    endDate: string; // YYYY-MM-DD
    executionRule: 'first_trading_day_close';
    currency: 'USD';
}

export interface MonthlyRow {
    buyMonth: string; // YYYY-MM
    buyDate: string; // YYYY-MM-DD
    closePrice: number;
    contribution: number;
    sharesBought: number;
    cumulativeShares: number;
    valueAtMonth: number;
    note?: string;
}

export interface SIPSummary {
    startDate: string;
    endDate: string;
    numberOfContributions: number;
    totalContributed: number;
    totalShares: number;
    lastClosePrice: number;
    lastCloseDate: string;
    accountValue: number;
    gainLoss: number;
    gainLossPercent: number;
    cagr: number;
}

export interface SIPResponse {
    inputs: SIPInputs;
    summary: SIPSummary;
    monthly: MonthlyRow[];
    meta: {
        dataSource: string;
        lastCloseDate: string;
        warnings: string[];
    };
}

export interface StockDataPoint {
    date: Date;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    adjClose: number;
}

export interface CachedData<T> {
    data: T;
    timestamp: number;
    ttl: number;
}
