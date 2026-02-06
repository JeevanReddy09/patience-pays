# Patience Pays 💰

**Long-term investing rewards consistency.** Backtest your SIP/DCA (Systematic Investment Plan / Dollar Cost Averaging) strategy and see how patience compounds over time.

![Patience Pays Screenshot](screenshot.png)

## Features

- 📊 **SIP Backtester** - Test recurring investment strategies on any stock
- 📈 **Interactive Charts** - Visualize portfolio growth over time
- 💸 **Summary Statistics** - See total gains, CAGR, and more
- 📋 **Monthly Breakdown** - Detailed transaction history table
- 📥 **CSV Export** - Download your data for further analysis
- 🎯 **Demo Preset** - Try it instantly with GOOGL

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone or navigate to the project
cd patience-pays

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Running Tests

```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:run
```

## API Reference

### GET /api/sip

Calculate SIP returns for a given stock and date range.

**Parameters:**

| Parameter | Type   | Default                  | Description                    |
|-----------|--------|--------------------------|--------------------------------|
| ticker    | string | required                 | Stock ticker (e.g., GOOGL)     |
| start     | string | required                 | Start date (YYYY-MM-DD)        |
| end       | string | required                 | End date (YYYY-MM-DD)          |
| amount    | number | 100                      | Monthly contribution ($)       |
| rule      | string | first_trading_day_close  | Execution rule                 |

**Example Request:**

```
GET /api/sip?ticker=GOOGL&start=2023-08-01&end=2026-02-05&amount=100&rule=first_trading_day_close
```

**Response:**

```json
{
  "inputs": {
    "ticker": "GOOGL",
    "monthlyContribution": 100,
    "startDate": "2023-08-01",
    "endDate": "2026-02-05",
    "executionRule": "first_trading_day_close",
    "currency": "USD"
  },
  "summary": {
    "numberOfContributions": 30,
    "totalContributed": 3000,
    "totalShares": 15.234,
    "accountValue": 3450.50,
    "gainLoss": 450.50,
    "gainLossPercent": 15.02,
    "cagr": 8.45
  },
  "monthly": [...],
  "meta": {
    "dataSource": "yahoo",
    "lastCloseDate": "2026-02-05",
    "warnings": []
  }
}
```

## Tech Stack

- **Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Charts:** Recharts
- **Data Source:** Yahoo Finance (via yahoo-finance2)
- **Testing:** Vitest

## Data Source & Limitations

- **Source:** Yahoo Finance (unofficial API via yahoo-finance2)
- **Caching:** 1-hour in-memory cache to reduce API calls
- **Rate Limits:** May be rate-limited during heavy usage
- **Accuracy:** Historical prices may have minor discrepancies

## Disclaimer

This tool is for **educational purposes only** and does not constitute financial advice. Past performance does not guarantee future results. Always consult a financial advisor before making investment decisions.

## License

MIT
