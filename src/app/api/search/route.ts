import { NextRequest, NextResponse } from 'next/server';

interface SearchResult {
  symbol: string;
  name: string;
  type: string;
  exchange: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim() ?? '';

    if (query.length < 2) {
      return NextResponse.json({ results: [] });
    }

    const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(
      query
    )}&quotesCount=10&newsCount=0&listsCount=0&enableFuzzyQuery=false`;

    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) {
      return NextResponse.json({ results: [], error: 'Search failed' });
    }

    const payload = await response.json();
    const quotes = Array.isArray(payload?.quotes) ? payload.quotes : [];

    const results: SearchResult[] = quotes
      .filter((quote: any) => typeof quote?.symbol === 'string')
      .filter((quote: any) => quote.quoteType === 'EQUITY' || quote.quoteType === 'ETF')
      .filter((quote: any) => !String(quote.symbol).includes('.'))
      .slice(0, 8)
      .map((quote: any) => ({
        symbol: String(quote.symbol),
        name: String(quote.shortname || quote.longname || quote.symbol),
        type: String(quote.quoteType || 'EQUITY'),
        exchange: String(quote.exchange || '')
      }));

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Search API Error:', error);
    return NextResponse.json({ results: [], error: 'Search failed' });
  }
}
