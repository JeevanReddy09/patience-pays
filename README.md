# Patience Pays

Long-term investing rewards consistency. Patience Pays lets you backtest a simple monthly SIP/DCA strategy into a stable stock and see how patience plus recurring contributions compound over time.

## Stack
- Next.js (TypeScript) with Tailwind
- Recharts for charts
- Yahoo Finance chart API (server-side fetch) with Stooq fallback

## Run locally
1. npm install
2. npm run dev
3. Open http://localhost:3000

## API
GET /api/sip?ticker=GOOGL&start=2023-08-01&end=2026-02-05&amount=100&rule=first_trading_day_close

## Data sources
- Primary: Yahoo Finance chart API (server-side fetch)
- Fallback: Stooq daily CSV

## Caching
In-memory cache with a 1-hour TTL keyed by ticker and date range.

## UI states
- Loading: Fetching prices and running the backtest
- Error: Validation or data fetch errors shown in a banner
- Results: Summary tiles, charts, CSV download, monthly table

## Limitations
- USD display only
- Free data sources can be delayed or incomplete
- Dividends and splits are not applied
- Educational use only, not investment advice
