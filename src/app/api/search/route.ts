// API Route Handler for ticker search
// GET /api/search?q=apple

import { NextRequest, NextResponse } from 'next/server';
import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance();

export interface SearchResult {
    symbol: string;
    name: string;
    type: string;
    exchange: string;
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q');

        if (!query || query.length < 2) {
            return NextResponse.json({ results: [] });
        }

        const searchResults = await yahooFinance.search(query, {
            quotesCount: 10,
            newsCount: 0,
        });

        const results: SearchResult[] = (searchResults.quotes || [])
            .filter((quote): quote is typeof quote & { symbol: string; shortname: string } =>
                typeof quote.symbol === 'string' &&
                typeof quote.shortname === 'string' &&
                (quote.quoteType === 'EQUITY' || quote.quoteType === 'ETF') &&
                // Only include US stocks (no suffix like .SG, .L, .DE, .TO etc.)
                // US exchanges (NYSE, NASDAQ, AMEX) use plain symbols without dots
                !quote.symbol.includes('.')
            )
            .slice(0, 8)
            .map((quote) => ({
                symbol: quote.symbol,
                name: quote.shortname || String(quote.longname) || quote.symbol,
                type: String(quote.quoteType) || 'EQUITY',
                exchange: String(quote.exchange) || '',
            }));

        return NextResponse.json({ results });
    } catch (error) {
        console.error('Search API Error:', error);
        return NextResponse.json({ results: [], error: 'Search failed' });
    }
}
