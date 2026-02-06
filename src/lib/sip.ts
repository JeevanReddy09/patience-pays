import { differenceInDays, eachMonthOfInterval, format, isAfter, isBefore, parseISO } from 'date-fns';
import type { MarketDaily, MonthlyRow, SipInputs, SipSummary } from './types';

export interface SipComputeResult {
  summary: SipSummary;
  monthly: MonthlyRow[];
  warnings: string[];
}

export function computeSipFromDaily(inputs: SipInputs, daily: MarketDaily[]): SipComputeResult {
  const startDate = parseISO(inputs.start);
  const endDate = parseISO(inputs.end);

  const sorted = [...daily]
    .filter((item) => Number.isFinite(item.close))
    .sort((a, b) => a.date.localeCompare(b.date));

  const filtered = sorted.filter((item) => {
    const date = parseISO(item.date);
    return !isBefore(date, startDate) && !isAfter(date, endDate);
  });

  if (filtered.length === 0) {
    throw new Error('No daily market data available for the selected range.');
  }

  const byMonth = new Map<string, MarketDaily[]>();
  for (const day of filtered) {
    const key = day.date.slice(0, 7);
    const list = byMonth.get(key);
    if (list) list.push(day);
    else byMonth.set(key, [day]);
  }

  const months = eachMonthOfInterval({ start: startDate, end: endDate });
  let cumulative = 0;
  let contributed = 0;
  let lastValue = 0;
  const rows: MonthlyRow[] = [];
  const warnings: string[] = [];

  for (const month of months) {
    const key = format(month, 'yyyy-MM');
    const days = byMonth.get(key);

    if (!days || days.length === 0) {
      warnings.push(`Skipped ${key}: no trading days in dataset.`);
      rows.push({
        buy_month: key,
        buy_date: null,
        close_price: null,
        contribution: 0,
        shares_bought: 0,
        cumulative_shares: cumulative,
        note: 'skipped month (no trading days)',
        value_at_month: lastValue
      });
      continue;
    }

    const first = days[0];
    const close = first.close;
    const shares = inputs.amount / close;
    cumulative += shares;
    contributed += inputs.amount;
    const valueAtMonth = cumulative * close;
    lastValue = valueAtMonth;

    rows.push({
      buy_month: key,
      buy_date: first.date,
      close_price: close,
      contribution: inputs.amount,
      shares_bought: shares,
      cumulative_shares: cumulative,
      value_at_month: valueAtMonth
    });
  }

  const lastDaily = filtered[filtered.length - 1];
  const accountValue = cumulative * lastDaily.close;
  const gainLoss = accountValue - contributed;
  const years = differenceInDays(endDate, startDate) / 365.25;
  const cagr =
    years > 0 && contributed > 0 ? Math.pow(accountValue / contributed, 1 / years) - 1 : undefined;

  const summary: SipSummary = {
    start: inputs.start,
    end: inputs.end,
    number_of_contributions: rows.filter((row) => row.contribution > 0).length,
    total_contributed: contributed,
    total_shares: cumulative,
    last_close: lastDaily.close,
    last_close_date: lastDaily.date,
    account_value: accountValue,
    gain_loss: gainLoss,
    cagr
  };

  return { summary, monthly: rows, warnings };
}
