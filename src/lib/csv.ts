import type { MonthlyRow } from './types';

const headers = [
  'buy_month',
  'buy_date',
  'close_price',
  'contribution',
  'shares_bought',
  'cumulative_shares',
  'note'
];

export function monthlyRowsToCsv(rows: MonthlyRow[]): string {
  const lines = [headers.join(',')];
  for (const row of rows) {
    const values = [
      row.buy_month,
      row.buy_date ?? '',
      row.close_price != null ? row.close_price.toFixed(4) : '',
      row.contribution ? row.contribution.toFixed(2) : '0.00',
      row.shares_bought ? row.shares_bought.toFixed(6) : '0.000000',
      row.cumulative_shares ? row.cumulative_shares.toFixed(6) : '0.000000',
      row.note ? `"${row.note.replace(/"/g, '""')}"` : ''
    ];
    lines.push(values.join(','));
  }
  return lines.join('\n');
}
