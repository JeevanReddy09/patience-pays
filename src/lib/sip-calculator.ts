// SIP (Systematic Investment Plan) Calculator
// Implements the core DCA (Dollar Cost Averaging) logic

import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { SIPInputs, SIPSummary, MonthlyRow, StockDataPoint } from './types';

export interface SIPCalculationResult {
    summary: SIPSummary;
    monthly: MonthlyRow[];
}

/**
 * Get all months between start and end dates (inclusive)
 */
export function getMonthsInRange(startDate: string, endDate: string): string[] {
    const months: string[] = [];
    const start = parseISO(startDate);
    const end = parseISO(endDate);

    let current = startOfMonth(start);
    const endMonth = startOfMonth(end);

    while (current <= endMonth) {
        months.push(format(current, 'yyyy-MM'));
        current = new Date(current.getFullYear(), current.getMonth() + 1, 1);
    }

    return months;
}

/**
 * Find the first trading day in a month from the stock data
 */
export function findFirstTradingDayInMonth(
    month: string,
    stockData: StockDataPoint[]
): StockDataPoint | null {
    const [year, monthNum] = month.split('-').map(Number);
    const monthStart = new Date(year, monthNum - 1, 1);
    const monthEnd = endOfMonth(monthStart);

    // Filter stock data to this month and sort by date
    const monthData = stockData
        .filter((d) => isWithinInterval(d.date, { start: monthStart, end: monthEnd }))
        .sort((a, b) => a.date.getTime() - b.date.getTime());

    return monthData.length > 0 ? monthData[0] : null;
}

/**
 * Get the last available close price on or before end date
 */
export function getLastClosePrice(
    endDate: string,
    stockData: StockDataPoint[]
): StockDataPoint | null {
    // Parse end date and set to end of day to include all times on that date
    const [year, month, day] = endDate.split('-').map(Number);
    const end = new Date(year, month - 1, day, 23, 59, 59, 999);

    const validData = stockData
        .filter((d) => d.date <= end)
        .sort((a, b) => b.date.getTime() - a.date.getTime());

    return validData.length > 0 ? validData[0] : null;
}

/**
 * Calculate CAGR (Compound Annual Growth Rate)
 */
export function calculateCAGR(
    initialValue: number,
    finalValue: number,
    years: number
): number {
    if (years <= 0 || initialValue <= 0) return 0;
    return (Math.pow(finalValue / initialValue, 1 / years) - 1) * 100;
}

/**
 * Main SIP calculation function
 */
export function calculateSIP(
    inputs: SIPInputs,
    stockData: StockDataPoint[]
): SIPCalculationResult {
    const months = getMonthsInRange(inputs.startDate, inputs.endDate);
    const monthly: MonthlyRow[] = [];

    let cumulativeShares = 0;
    let totalContributed = 0;
    let numberOfContributions = 0;

    for (const month of months) {
        const firstTradingDay = findFirstTradingDayInMonth(month, stockData);

        if (!firstTradingDay) {
            // Skip month with no trading data
            monthly.push({
                buyMonth: month,
                buyDate: '',
                closePrice: 0,
                contribution: 0,
                sharesBought: 0,
                cumulativeShares,
                valueAtMonth: 0,
                note: 'No trading data available for this month',
            });
            continue;
        }

        const closePrice = firstTradingDay.close;
        const sharesBought = inputs.monthlyContribution / closePrice;
        cumulativeShares += sharesBought;
        totalContributed += inputs.monthlyContribution;
        numberOfContributions++;

        const valueAtMonth = cumulativeShares * closePrice;

        monthly.push({
            buyMonth: month,
            buyDate: format(firstTradingDay.date, 'yyyy-MM-dd'),
            closePrice,
            contribution: inputs.monthlyContribution,
            sharesBought,
            cumulativeShares,
            valueAtMonth,
        });
    }

    // Get last available close price for final valuation
    const lastClose = getLastClosePrice(inputs.endDate, stockData);

    if (!lastClose) {
        throw new Error('No stock data available for the specified date range');
    }

    const accountValue = cumulativeShares * lastClose.close;
    const gainLoss = accountValue - totalContributed;
    const gainLossPercent = totalContributed > 0 ? (gainLoss / totalContributed) * 100 : 0;

    // Calculate CAGR
    const startDateObj = parseISO(inputs.startDate);
    const endDateObj = parseISO(inputs.endDate);
    const years = (endDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    const cagr = calculateCAGR(totalContributed, accountValue, years);

    const summary: SIPSummary = {
        startDate: inputs.startDate,
        endDate: inputs.endDate,
        numberOfContributions,
        totalContributed,
        totalShares: cumulativeShares,
        lastClosePrice: lastClose.close,
        lastCloseDate: format(lastClose.date, 'yyyy-MM-dd'),
        accountValue,
        gainLoss,
        gainLossPercent,
        cagr,
    };

    return { summary, monthly };
}
