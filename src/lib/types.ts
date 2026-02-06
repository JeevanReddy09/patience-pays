export type Rule = 'first_trading_day_close';

export interface SipInputs {
  ticker: string;
  amount: number;
  start: string;
  end: string;
  rule: Rule;
  currency?: 'USD';
}

export interface MarketDaily {
  date: string;
  close: number;
}

export interface MonthlyRow {
  buy_month: string;
  buy_date: string | null;
  close_price: number | null;
  contribution: number;
  shares_bought: number;
  cumulative_shares: number;
  note?: string;
  value_at_month?: number;
}

export interface SipSummary {
  start: string;
  end: string;
  number_of_contributions: number;
  total_contributed: number;
  total_shares: number;
  last_close: number;
  last_close_date: string;
  account_value: number;
  gain_loss: number;
  cagr?: number;
}

export interface SipResponse {
  inputs: SipInputs;
  summary: SipSummary;
  monthly: MonthlyRow[];
  meta: {
    data_source: string;
    last_close_date: string;
    warnings: string[];
  };
}
