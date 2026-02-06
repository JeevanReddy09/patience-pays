import 'server-only';
import { addDays, format, isAfter, isBefore, isValid, parseISO } from 'date-fns';
import type { MarketDaily } from './types';

type Source = 'yahoo' | 'stooq';

type SourceResult = {
  data: MarketDaily[];
  source: Source;
  warnings: string[];
};

type CacheEntry = SourceResult & { ts: number };

const CACHE = new Map<string, CacheEntry>();
const TTL_MS = 1000 * 60 * 60;

function normalizeDaily(
  entries: { date: Date; close: number }[],
  start: string,
  end: string
): MarketDaily[] {
  const startDate = parseISO(start);
  const endDate = parseISO(end);
  return entries
    .filter((item) => item.date && Number.isFinite(item.close))
    .map((item) => ({
      date: format(item.date, 'yyyy-MM-dd'),
      close: Number(item.close)
    }))
    .filter((item) => {
      const date = parseISO(item.date);
      return !isBefore(date, startDate) && !isAfter(date, endDate);
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}

async function fetchYahooDaily(ticker: string, start: string, end: string): Promise<MarketDaily[]> {
  const startDate = parseISO(start);
  const endDate = parseISO(end);
  const period1 = Math.floor(startDate.getTime() / 1000);
  const period2 = Math.floor(addDays(endDate, 1).getTime() / 1000);

  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
    ticker
  )}?interval=1d&period1=${period1}&period2=${period2}&events=div%7Csplit`;

  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Yahoo request failed (${response.status}).`);
  }

  const payload = await response.json();
  if (payload?.chart?.error) {
    throw new Error(payload.chart.error?.description || 'Yahoo returned an error.');
  }

  const result = payload?.chart?.result?.[0];
  const timestamps: number[] | undefined = result?.timestamp;
  const closes: Array<number | null> | undefined = result?.indicators?.quote?.[0]?.close;

  if (!timestamps || !closes || timestamps.length === 0) return [];

  const entries: { date: Date; close: number }[] = [];
  for (let i = 0; i < timestamps.length; i += 1) {
    const close = closes[i];
    if (!Number.isFinite(close)) continue;
    const date = new Date(timestamps[i] * 1000);
    entries.push({ date, close: Number(close) });
  }

  return normalizeDaily(entries, start, end);
}

async function fetchStooqDaily(ticker: string, start: string, end: string): Promise<MarketDaily[]> {
  const symbol = ticker.includes('.') ? ticker.toLowerCase() : `${ticker.toLowerCase()}.us`;
  const url = `https://stooq.com/q/d/l/?s=${symbol}&i=d`;
  const response = await fetch(url, { cache: 'no-store' });

  if (!response.ok) {
    throw new Error(`Stooq request failed (${response.status}).`);
  }

  const text = await response.text();
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];

  const header = lines[0].split(',');
  const dateIdx = header.findIndex((h) => h.toLowerCase() === 'date');
  const closeIdx = header.findIndex((h) => h.toLowerCase() === 'close');
  if (dateIdx === -1 || closeIdx === -1) return [];

  const startDate = parseISO(start);
  const endDate = parseISO(end);
  const data: MarketDaily[] = [];

  for (let i = 1; i < lines.length; i += 1) {
    const cols = lines[i].split(',');
    if (cols.length <= Math.max(dateIdx, closeIdx)) continue;
    const dateStr = cols[dateIdx];
    const close = Number(cols[closeIdx]);
    if (!dateStr || !Number.isFinite(close)) continue;
    const date = parseISO(dateStr);
    if (!isValid(date)) continue;
    if (isBefore(date, startDate) || isAfter(date, endDate)) continue;
    data.push({ date: dateStr, close });
  }

  return data.sort((a, b) => a.date.localeCompare(b.date));
}

export async function getDailyPrices(
  ticker: string,
  start: string,
  end: string
): Promise<SourceResult> {
  const key = `${ticker}|${start}|${end}`;
  const cached = CACHE.get(key);
  if (cached && Date.now() - cached.ts < TTL_MS) {
    return { data: cached.data, source: cached.source, warnings: cached.warnings };
  }

  const warnings: string[] = [];

  try {
    const yahoo = await fetchYahooDaily(ticker, start, end);
    if (yahoo.length > 0) {
      const result: SourceResult = { data: yahoo, source: 'yahoo', warnings };
      CACHE.set(key, { ...result, ts: Date.now() });
      return result;
    }
    warnings.push('Yahoo returned no data, attempting fallback.');
  } catch (error) {
    warnings.push('Yahoo data fetch failed, using fallback.');
  }

  const stooq = await fetchStooqDaily(ticker, start, end);
  if (stooq.length === 0) {
    throw new Error('No market data found for the selected range.');
  }
  const result: SourceResult = { data: stooq, source: 'stooq', warnings };
  CACHE.set(key, { ...result, ts: Date.now() });
  return result;
}
