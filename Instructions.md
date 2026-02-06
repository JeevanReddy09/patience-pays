Build a production-ready web app named “Patience Pays” (tagline: Long-term investing rewards consistency). The app lets a user backtest a simple SIP/DCA strategy into a stable stock (default: GOOGL) and shows how patience + recurring investing compounds over time.

Core purpose

Users input:

Ticker (e.g., GOOGL, MSFT, VTI, SPY)

Monthly contribution (default $100)

Start date (default 2023-08-01)

End date (default today)
\r\n
Optional: currency display (USD only for now)

App outputs:

Monthly purchase table:

buy_month (YYYY-MM)

buy_date

close_price

contribution

shares_bought

cumulative_shares

note (e.g., skipped month)

Summary block:

start/end

number of contributions

total contributed

total shares

last close used + date

account value (shares * last close)

gain/loss (value - contributed)

CAGR (optional but desirable)

Charts (must-have):

Portfolio value over time (monthly marks)

Contributions vs value (stacked or two-line)

Optional: drawdown or rolling returns

CSV export of the monthly table with a deterministic filename, like:
sip_<TICKER>_<START>_to_<END>.csv

Product/UX requirements

Branding: calm “long-term patience” theme; include a short explanation panel:
“This strategy invests the same amount monthly regardless of price. Over long horizons, consistency matters.”

Mobile responsive.

Include a “Demo preset” button that sets: ticker=GOOGL, $100/mo, Aug 2023 to today, first trading day close.

Handle weekends/holidays correctly: “first trading day” must be the first available date in the daily dataset for that month.

If a month has no trading days (rare), skip and note.

Technical requirements (choose a clear stack and implement fully)

Preferred: Next.js (TypeScript) + Tailwind frontend, and a lightweight backend route for finance data.

Use server-side fetching for prices so API keys are not exposed.

Use a reliable market data source:

Primary: Yahoo Finance via a server library (Node) OR Python microservice using yfinance.

If Yahoo blocks/rate-limits: support fallback to Stooq or another free source.

Cache responses (in-memory + time-based) to avoid repeated downloads.

Validate ticker input and date ranges; show helpful error messages.

Data logic requirements (must match exactly)

Implement SIP algorithm:

Download daily OHLC data for the ticker between start date and end date (inclusive end).

For each month in range:

Find the first trading day within that month present in the dataset.

Use that day’s Close price as execution price.

shares_bought = monthly_contribution / close_price

cumulative_shares accumulates.

“Now” valuation:

Use last available Close price on or before end date.

account_value = cumulative_shares * last_close

gain_loss = account_value - total_contributed

Return:

summary JSON

monthly rows array

API design

Create an endpoint:

GET /api/sip?ticker=GOOGL&start=2023-08-01&end=2026-02-05&amount=100

Response JSON:

{
  "inputs": {...},
  "summary": {...},
  "monthly": [...],
  "meta": {
    "data_source": "yahoo",
    "last_close_date": "YYYY-MM-DD",
    "warnings": []
  }
}

Frontend pages/components

Home page:

Hero: “Patience Pays”

Input form card

Results section with summary tiles

Charts

Monthly table with pagination + search

Download CSV button

Add a small “Why this works” section with 3 bullets:

consistency beats timing

volatility is normal

stable companies reward patience

Charts

Use a modern chart library:

Recharts (if React)

Or Chart.js

Charts should use computed monthly valuation series:

For each month row, compute value_at_month = cumulative_shares * close_price_at_that_month (or close at buy date)

For end value, use last_close.

Quality bar

Type-safe models (interfaces)

Clean file structure

Meaningful UI states (loading, error, empty)

Unit tests for SIP logic (at least 5 cases: weekend month start, holiday month start, missing month, end date mid-month, invalid ticker)

README with how to run locally, how data is fetched, and limitations.

Deliverables

Complete codebase

Working local run instructions

Example screenshots (or at least a short description of UI states)

Make sure the SIP logic matches the spec exactly.