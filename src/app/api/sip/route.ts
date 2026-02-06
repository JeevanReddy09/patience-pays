// API Route Handler for SIP calculations
// GET /api/sip?ticker=GOOGL&start=2023-08-01&end=2026-02-05&amount=100&rule=first_trading_day_close

import { NextRequest, NextResponse } from 'next/server';
import { SIPInputs, SIPResponse } from '@/lib/types';
import { fetchStockData } from '@/lib/yahoo-finance';
import { calculateSIP } from '@/lib/sip-calculator';

function validateInputs(params: URLSearchParams): {
    valid: boolean;
    inputs?: SIPInputs;
    error?: string
} {
    const ticker = params.get('ticker')?.toUpperCase();
    const start = params.get('start');
    const end = params.get('end');
    const amount = params.get('amount');
    const rule = params.get('rule') || 'first_trading_day_close';

    if (!ticker) {
        return { valid: false, error: 'Ticker symbol is required' };
    }

    if (!/^[A-Z0-9.^-]+$/.test(ticker)) {
        return { valid: false, error: 'Invalid ticker symbol format' };
    }

    if (!start) {
        return { valid: false, error: 'Start date is required' };
    }

    if (!end) {
        return { valid: false, error: 'End date is required' };
    }

    const startDate = new Date(start);
    const endDate = new Date(end);

    if (isNaN(startDate.getTime())) {
        return { valid: false, error: 'Invalid start date format. Use YYYY-MM-DD' };
    }

    if (isNaN(endDate.getTime())) {
        return { valid: false, error: 'Invalid end date format. Use YYYY-MM-DD' };
    }

    if (startDate >= endDate) {
        return { valid: false, error: 'Start date must be before end date' };
    }

    const monthlyContribution = parseFloat(amount || '100');
    if (isNaN(monthlyContribution) || monthlyContribution <= 0) {
        return { valid: false, error: 'Monthly contribution must be a positive number' };
    }

    if (rule !== 'first_trading_day_close') {
        return { valid: false, error: 'Currently only first_trading_day_close rule is supported' };
    }

    return {
        valid: true,
        inputs: {
            ticker,
            monthlyContribution,
            startDate: start,
            endDate: end,
            executionRule: 'first_trading_day_close',
            currency: 'USD',
        },
    };
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        // Validate inputs
        const validation = validateInputs(searchParams);

        if (!validation.valid || !validation.inputs) {
            return NextResponse.json(
                { error: validation.error },
                { status: 400 }
            );
        }

        const inputs = validation.inputs;

        // Fetch stock data
        const { data: stockData, warnings } = await fetchStockData(
            inputs.ticker,
            inputs.startDate,
            inputs.endDate
        );

        // Calculate SIP
        const { summary, monthly } = calculateSIP(inputs, stockData);

        const response: SIPResponse = {
            inputs,
            summary,
            monthly,
            meta: {
                dataSource: 'yahoo',
                lastCloseDate: summary.lastCloseDate,
                warnings,
            },
        };

        return NextResponse.json(response);

    } catch (error) {
        console.error('SIP API Error:', error);

        const message = error instanceof Error
            ? error.message
            : 'An unexpected error occurred';

        const status = message.includes('Invalid ticker') ? 400 : 500;

        return NextResponse.json(
            { error: message },
            { status }
        );
    }
}
