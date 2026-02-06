# Patience Pays — UI/UX Design & Build Strategy

## Product Intent
- Goal: Make monthly SIP/DCA compounding feel calm, predictable, and trustworthy.
- Target behavior: Users should quickly understand inputs, run a backtest, and interpret outputs without needing financial expertise.
- Constraints: USD only, server-side data fetch, first trading day close rule.

## Visual System
- Theme: “Long-term patience” with warm neutrals and sea-toned accents.
- Typography: Expressive heading font + geometric body font for clarity.
- Color palette (Tailwind tokens in `tailwind.config.ts`):
  - `ink` (#0f172a): primary text and controls
  - `sea` (#0f766e): primary action and brand accent
  - `mist` (#e6f1ee): borders and soft separators
  - `sand` (#f4efe7): background warmth
  - `sun` (#f7c873): highlight glow
- Background: Layered gradients + soft orbs to create depth without distraction.

## Layout Strategy
- Responsive split hero: left content / right input card for desktop, stacked on mobile.
- Content hierarchy:
  1) Brand and explanation
  2) Inputs
  3) Results summary tiles
  4) Charts
  5) CSV + warnings
  6) Monthly table
  7) “Why this works” explanation
- Spacing: Dense but breathable using consistent rounded cards, light borders, and soft shadows.

## Information Architecture
- Inputs are grouped in a single form card for focus.
- Outputs follow chronological interpretation: summary, trend, granular data.
- Warnings are placed adjacent to results, not hidden, to build trust.
- CSV download is a direct action with a deterministic filename for traceability.

## Interaction Design
- Demo preset: Resets to a known-good example (GOOGL, $100, Aug 2023–today).
- Loading state: Single calm banner, avoids UI shift.
- Error state: Clear banner with server or validation feedback.
- Table UX: Search + pagination, optimized for large ranges.
- Charts: Two primary visuals to avoid cognitive overload.

## Accessibility Considerations
- High-contrast text on light background.
- Inputs and buttons use standard HTML elements and focus styles.
- Charts include tooltips and legible ticks.
- No icon-only actions; text labels are explicit.

## Technical Build Strategy

### Stack Choice
- Next.js 16 (App Router), TypeScript, Tailwind CSS, Recharts.
- Server-side fetching to keep data sources and API calls private.

### Component Structure
- `src/app/page.tsx`:
  - `SummaryTiles`: Summary metrics, color-coded gain/loss.
  - `Charts`: Portfolio value + contributions vs value.
  - `MonthlyTable`: Search + pagination.
  - `Home`: Overall orchestration and state.
- `src/app/layout.tsx`:
  - Global fonts and base page shell.
- `src/app/globals.css`:
  - Background, base typography, selection styling.

### State and Data Flow
- Form state is local in `Home`.
- API call to `GET /api/sip` on submit.
- Response structure:
  - `inputs`, `summary`, `monthly`, `meta`.
- Chart series is derived from `monthly` for single source of truth.

### Market Data Strategy
- Primary: Yahoo chart API (server-side fetch).
- Fallback: Stooq CSV.
- Cache: In-memory Map with 1-hour TTL to reduce repeated network calls.
- Strict date filtering and sorting before SIP computation.

### SIP Algorithm Implementation
- For each month in range:
  - Find first trading day in daily dataset for that month.
  - Use close price for buy.
  - Track cumulative shares and value.
- “Now” valuation uses last available close on or before end date.

### UX-Safe Error Handling
- Validation errors return 400 with clear message.
- Data source failures include warnings and fallback attempts.
- No silent failures: empty datasets cause explicit errors.

## Performance Notes
- Charts and table are client-only but lightweight.
- Pagination avoids large table rendering.
- Server route uses caching and avoids client-side API keys.

## Rationale: Why This Layout Works
- Users see the “why” before they’re asked to act.
- The input card stands alone to reduce choice fatigue.
- Summary tiles give quick wins; charts provide meaning; table provides auditability.

