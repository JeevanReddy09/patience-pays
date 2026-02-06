import { describe, expect, it } from 'vitest';
import { computeSipFromDaily } from './sip';
import { validateInputValues } from './validation';
import type { MarketDaily, SipInputs } from './types';

const baseInputs: SipInputs = {
  ticker: 'TEST',
  amount: 100,
  start: '2024-01-01',
  end: '2024-01-31',
  currency: 'USD'
};

describe('SIP logic', () => {
  it('uses the first trading day when month starts on weekend', () => {
    const inputs = { ...baseInputs, start: '2024-06-01', end: '2024-06-30' };
    const daily: MarketDaily[] = [
      { date: '2024-06-03', close: 10 },
      { date: '2024-06-04', close: 12 }
    ];
    const result = computeSipFromDaily(inputs, daily);
    expect(result.monthly[0].buy_date).toBe('2024-06-03');
  });

  it('uses the first trading day when month starts on a holiday', () => {
    const inputs = { ...baseInputs, start: '2024-01-01', end: '2024-01-31' };
    const daily: MarketDaily[] = [
      { date: '2024-01-02', close: 100 },
      { date: '2024-01-03', close: 101 }
    ];
    const result = computeSipFromDaily(inputs, daily);
    expect(result.monthly[0].buy_date).toBe('2024-01-02');
  });

  it('notes skipped months with no trading days', () => {
    const inputs = { ...baseInputs, start: '2024-01-01', end: '2024-03-31' };
    const daily: MarketDaily[] = [
      { date: '2024-01-02', close: 100 },
      { date: '2024-03-01', close: 120 }
    ];
    const result = computeSipFromDaily(inputs, daily);
    expect(result.monthly).toHaveLength(3);
    expect(result.monthly[1].note).toContain('skipped');
  });

  it('uses last close on or before the end date', () => {
    const inputs = { ...baseInputs, start: '2024-01-01', end: '2024-03-15' };
    const daily: MarketDaily[] = [
      { date: '2024-01-02', close: 100 },
      { date: '2024-02-01', close: 110 },
      { date: '2024-03-14', close: 120 },
      { date: '2024-03-18', close: 130 }
    ];
    const result = computeSipFromDaily(inputs, daily);
    expect(result.summary.last_close_date).toBe('2024-03-14');
  });

  it('rejects invalid tickers', () => {
    const validation = validateInputValues({
      ticker: 'BAD$$',
      amount: '100',
      start: '2024-01-01',
      end: '2024-02-01',
    });
    expect(validation.ok).toBe(false);
  });
});
