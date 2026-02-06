import { NextRequest, NextResponse } from 'next/server';
import tickers from '@/data/tickers.json';

type TickerItem = {
  symbol: string;
  name: string;
  exchange: string;
};

type SearchResult = TickerItem & {
  type: string;
};

const ALL_TICKERS = tickers as TickerItem[];
const MAX_RESULTS = 8;

const guessType = (name: string) => {
  const upper = name.toUpperCase();
  if (upper.includes('ETF') || upper.includes('EXCHANGE TRADED')) return 'ETF';
  return 'EQUITY';
};

const scoreTicker = (item: TickerItem, needle: string, tokens: string[]) => {
  const symbol = item.symbol.toUpperCase();
  const name = item.name.toUpperCase();
  let score = 0;

  if (symbol === needle) score += 1200;
  if (symbol.startsWith(needle)) score += 900 - (symbol.length - needle.length);
  const symbolIndex = symbol.indexOf(needle);
  if (symbolIndex >= 0) score += 700 - symbolIndex * 2;

  const nameIndex = name.indexOf(needle);
  if (nameIndex >= 0) score += 300 - Math.min(nameIndex, 50);

  if (tokens.length > 1) {
    let tokenHits = 0;
    for (const token of tokens) {
      if (symbol.includes(token) || name.includes(token)) {
        tokenHits += 1;
      }
    }
    if (tokenHits < tokens.length) return 0;
    score += tokenHits * 40;
  }

  if (score === 0) return 0;
  score += Math.max(0, 12 - symbol.length);
  return score;
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get('q') ?? '').trim();

  if (query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const needle = query.toUpperCase();
  const tokens = needle.split(/\s+/).filter(Boolean);
  const scored: Array<{ item: TickerItem; score: number }> = [];

  for (const item of ALL_TICKERS) {
    const score = scoreTicker(item, needle, tokens);
    if (score > 0) {
      scored.push({ item, score });
    }
  }

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.item.symbol.localeCompare(b.item.symbol);
  });

  const results: SearchResult[] = scored.slice(0, MAX_RESULTS).map(({ item }) => ({
    ...item,
    type: guessType(item.name)
  }));

  return NextResponse.json({ results });
}
