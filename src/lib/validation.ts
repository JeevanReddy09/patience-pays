import { isAfter, isValid, parseISO } from 'date-fns';
import type { SipInputs } from './types';

const TICKER_REGEX = /^[A-Za-z0-9.-]{1,10}$/;

export function validateInputValues(values: {
  ticker?: string;
  amount?: string | number;
  start?: string;
  end?: string;
}): { ok: boolean; errors: string[]; inputs?: SipInputs } {
  const errors: string[] = [];
  const tickerRaw = (values.ticker || '').trim().toUpperCase();

  if (!tickerRaw) {
    errors.push('Ticker is required.');
  } else if (!TICKER_REGEX.test(tickerRaw)) {
    errors.push('Ticker must be 1-10 characters (letters, numbers, dot, dash).');
  }

  const amountNum = typeof values.amount === 'string' ? Number(values.amount) : Number(values.amount);
  if (!Number.isFinite(amountNum) || amountNum <= 0) {
    errors.push('Monthly contribution must be a positive number.');
  }

  const start = values.start || '';
  const end = values.end || '';
  const startDate = parseISO(start);
  const endDate = parseISO(end);

  if (!start || !isValid(startDate)) {
    errors.push('Start date is invalid.');
  }

  if (!end || !isValid(endDate)) {
    errors.push('End date is invalid.');
  }

  if (isValid(startDate) && isValid(endDate) && isAfter(startDate, endDate)) {
    errors.push('Start date must be on or before the end date.');
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  const inputs: SipInputs = {
    ticker: tickerRaw,
    amount: amountNum,
    start,
    end,
    currency: 'USD'
  };

  return { ok: true, errors: [], inputs };
}
