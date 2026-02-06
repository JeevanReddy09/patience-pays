'use client';

import { useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { monthlyRowsToCsv } from '@/lib/csv';
import type { MonthlyRow, SipResponse, SipSummary } from '@/lib/types';
import TickerSearch from '@/components/TickerSearch';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2
});

const currencyFormatter0 = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0
});

const numberFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 6
});

const percentFormatter = new Intl.NumberFormat('en-US', {
  style: 'percent',
  maximumFractionDigits: 2
});

type ChartPoint = {
  month: string;
  value: number;
  contributed: number;
};

function SummaryTiles({ summary }: { summary: SipSummary }) {
  const gainClass = summary.gain_loss >= 0 ? 'text-emerald-600' : 'text-rose-600';
  const items = [
    { label: 'Start / End', value: `${summary.start} to ${summary.end}` },
    { label: 'Contributions', value: summary.number_of_contributions.toString() },
    { label: 'Total Contributed', value: currencyFormatter.format(summary.total_contributed) },
    { label: 'Total Shares', value: numberFormatter.format(summary.total_shares) },
    {
      label: 'Last Close Used',
      value: `${currencyFormatter.format(summary.last_close)} on ${summary.last_close_date}`
    },
    { label: 'Account Value', value: currencyFormatter.format(summary.account_value) },
    { label: 'Gain / Loss', value: currencyFormatter.format(summary.gain_loss), className: gainClass },
    { label: 'CAGR', value: summary.cagr != null ? percentFormatter.format(summary.cagr) : '--' }
  ];

  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
      {items.map((item) => (
        <div
          key={item.label}
          className='rounded-2xl border border-mist bg-white/80 p-4 shadow-soft'
        >
          <p className='text-xs uppercase tracking-wide text-slate-500'>{item.label}</p>
          <p className={`mt-2 text-base font-semibold text-ink ${item.className ?? ''}`}>
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}

function Charts({ data }: { data: ChartPoint[] }) {
  if (!data.length) return null;

  return (
    <div className='grid gap-6 lg:grid-cols-2'>
      <div className='rounded-2xl border border-mist bg-white/80 p-5 shadow-soft'>
        <h3 className='text-lg font-semibold text-ink'>Portfolio value over time</h3>
        <div className='mt-4 h-72'>
          <ResponsiveContainer>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray='3 3' stroke='#e2e8f0' />
              <XAxis dataKey='month' tick={{ fontSize: 12 }} />
              <YAxis
                tickFormatter={(value) => currencyFormatter0.format(Number(value))}
                tick={{ fontSize: 12 }}
              />
              <Tooltip formatter={(value: number) => currencyFormatter.format(value)} />
              <Line type='monotone' dataKey='value' stroke='#0f766e' strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className='rounded-2xl border border-mist bg-white/80 p-5 shadow-soft'>
        <h3 className='text-lg font-semibold text-ink'>Contributions vs value</h3>
        <div className='mt-4 h-72'>
          <ResponsiveContainer>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray='3 3' stroke='#e2e8f0' />
              <XAxis dataKey='month' tick={{ fontSize: 12 }} />
              <YAxis
                tickFormatter={(value) => currencyFormatter0.format(Number(value))}
                tick={{ fontSize: 12 }}
              />
              <Tooltip formatter={(value: number) => currencyFormatter.format(value)} />
              <Legend />
              <Area
                type='monotone'
                dataKey='contributed'
                stroke='#f7c873'
                fill='#f7c873'
                fillOpacity={0.4}
                name='Contributed'
              />
              <Area
                type='monotone'
                dataKey='value'
                stroke='#0f766e'
                fill='#0f766e'
                fillOpacity={0.25}
                name='Value'
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function MonthlyTable({ rows }: { rows: MonthlyRow[] }) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter((row) => {
      const haystack = `${row.buy_month} ${row.buy_date ?? ''} ${row.note ?? ''}`.toLowerCase();
      return haystack.includes(needle);
    });
  }, [rows, search]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const pageRows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  return (
    <div className='rounded-2xl border border-mist bg-white/80 p-5 shadow-soft'>
      <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
        <div>
          <h3 className='text-lg font-semibold text-ink'>Monthly purchases</h3>
          <p className='text-sm text-slate-600'>Search by month, date, or note.</p>
        </div>
        <input
          type='text'
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder='Search'
          className='w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm md:w-64'
        />
      </div>
      <div className='mt-4 overflow-x-auto'>
        <table className='min-w-full text-left text-sm'>
          <thead className='text-xs uppercase tracking-wide text-slate-500'>
            <tr>
              <th className='py-2 pr-4'>Month</th>
              <th className='py-2 pr-4'>Buy Date</th>
              <th className='py-2 pr-4'>Close Price</th>
              <th className='py-2 pr-4'>Contribution</th>
              <th className='py-2 pr-4'>Shares Bought</th>
              <th className='py-2 pr-4'>Cumulative Shares</th>
              <th className='py-2'>Note</th>
            </tr>
          </thead>
          <tbody className='text-slate-700'>
            {pageRows.map((row) => (
              <tr key={`${row.buy_month}-${row.buy_date ?? 'skip'}`} className='border-t border-slate-100'>
                <td className='py-2 pr-4'>{row.buy_month}</td>
                <td className='py-2 pr-4'>{row.buy_date ?? '--'}</td>
                <td className='py-2 pr-4'>
                  {row.close_price != null ? currencyFormatter.format(row.close_price) : '--'}
                </td>
                <td className='py-2 pr-4'>{currencyFormatter.format(row.contribution)}</td>
                <td className='py-2 pr-4'>{numberFormatter.format(row.shares_bought)}</td>
                <td className='py-2 pr-4'>{numberFormatter.format(row.cumulative_shares)}</td>
                <td className='py-2'>{row.note ?? ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className='mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600'>
        <span>
          Page {safePage} of {pageCount} ({filtered.length} rows)
        </span>
        <div className='flex items-center gap-2'>
          <button
            type='button'
            onClick={() => setPage((prev) => Math.max(1, Math.min(prev, pageCount) - 1))}
            disabled={safePage === 1}
            className='rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm disabled:opacity-50'
          >
            Prev
          </button>
          <button
            type='button'
            onClick={() => setPage((prev) => Math.min(pageCount, Math.min(prev, pageCount) + 1))}
            disabled={safePage === pageCount}
            className='rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm disabled:opacity-50'
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

type FormState = {
  ticker: string;
  amount: string;
  start: string;
  end: string;
  rule: string;
};

export default function Home() {
  const today = new Date().toISOString().slice(0, 10);
  const demoPreset: FormState = {
    ticker: 'GOOGL',
    amount: '100',
    start: '2023-08-01',
    end: today,
    rule: 'first_trading_day_close'
  };

  const [form, setForm] = useState<FormState>(demoPreset);
  const [data, setData] = useState<SipResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chartData = useMemo(() => {
    if (!data) return [];
    let contributed = 0;
    let lastValue = 0;
    return data.monthly.map((row) => {
      contributed += row.contribution;
      const value = row.value_at_month ?? lastValue;
      if (row.value_at_month != null) {
        lastValue = row.value_at_month;
      }
      return {
        month: row.buy_month,
        value,
        contributed
      };
    });
  }, [data]);

  const updateField =
    (field: keyof FormState) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({
      ticker: form.ticker.trim(),
      start: form.start,
      end: form.end,
      amount: form.amount,
      rule: form.rule
    });

    try {
      const response = await fetch(`/api/sip?${params.toString()}`, { cache: 'no-store' });
      const payload = await response.json();
      if (!response.ok) {
        setError(payload?.error ?? 'Unable to run backtest.');
        setData(null);
      } else {
        setData(payload);
      }
    } catch (err) {
      setError('Network error while fetching data.');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = () => {
    const updatedPreset = { ...demoPreset, end: new Date().toISOString().slice(0, 10) };
    setForm(updatedPreset);
    setData(null);
    setError(null);
  };

  const handleDownload = () => {
    if (!data) return;
    const csv = monthlyRowsToCsv(data.monthly);
    const filename = `sip_${data.inputs.ticker}_${data.inputs.start}_to_${data.inputs.end}_first_trading_day_close.csv`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className='relative min-h-screen'>
      <div className='pointer-events-none absolute inset-0 overflow-hidden'>
        <div className='absolute -top-24 right-[-10%] h-72 w-72 rounded-full bg-sun/40 blur-3xl' />
        <div className='absolute bottom-[-20%] left-[-10%] h-96 w-96 rounded-full bg-sea/20 blur-3xl' />
      </div>

      <header className='relative px-6 pt-12 pb-14'>
        <div className='mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.1fr_0.9fr]'>
          <div>
            <span className='text-xs uppercase tracking-[0.3em] text-sea'>Patience Pays</span>
            <h1 className='mt-3 text-4xl font-semibold text-ink md:text-6xl'>Patience Pays</h1>
            <p className='mt-4 text-lg text-slate-700'>Long-term investing rewards consistency.</p>
            <div className='mt-6 rounded-2xl border border-mist bg-white/70 p-5 shadow-soft'>
              <p className='text-sm text-slate-700'>
                This strategy invests the same amount monthly regardless of price. Over long horizons, consistency
                matters.
              </p>
            </div>
            <div className='mt-8 grid gap-3'>
              <div className='rounded-2xl border border-mist bg-white/60 p-4'>
                <p className='text-sm font-semibold text-ink'>Calm, steady compounding</p>
                <p className='text-sm text-slate-600'>See how recurring buys build ownership over time.</p>
              </div>
              <div className='rounded-2xl border border-mist bg-white/60 p-4'>
                <p className='text-sm font-semibold text-ink'>Reliable, transparent data</p>
                <p className='text-sm text-slate-600'>Server-side pricing with a fallback source and caching.</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className='rounded-2xl border border-mist bg-white/80 p-6 shadow-soft'>
            <h2 className='text-lg font-semibold text-ink'>Backtest inputs</h2>
            <p className='mt-1 text-sm text-slate-600'>USD display only for now.</p>

            <div className='mt-5 grid gap-4'>
              <label className='grid gap-2 text-sm text-slate-700'>
                Ticker
                <TickerSearch
                  value={form.ticker}
                  onChange={(value) => setForm((prev) => ({ ...prev, ticker: value }))}
                />
              </label>

              <label className='grid gap-2 text-sm text-slate-700'>
                Monthly contribution (USD)
                <input
                  type='number'
                  min='1'
                  step='1'
                  value={form.amount}
                  onChange={updateField('amount')}
                  className='rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm'
                />
              </label>

              <div className='grid gap-4 md:grid-cols-2'>
                <label className='grid gap-2 text-sm text-slate-700'>
                  Start date
                  <input
                    type='date'
                    value={form.start}
                    onChange={updateField('start')}
                    className='rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm'
                  />
                </label>
                <label className='grid gap-2 text-sm text-slate-700'>
                  End date
                  <input
                    type='date'
                    value={form.end}
                    onChange={updateField('end')}
                    className='rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm'
                  />
                </label>
              </div>

              <label className='grid gap-2 text-sm text-slate-700'>
                Execution rule
                <select
                  value={form.rule}
                  onChange={updateField('rule')}
                  className='rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm'
                >
                  <option value='first_trading_day_close'>First trading day close</option>
                </select>
              </label>
            </div>

            <div className='mt-6 flex flex-wrap gap-3'>
              <button
                type='submit'
                className='rounded-xl bg-sea px-4 py-2 text-sm font-semibold text-white shadow-soft'
                disabled={loading}
              >
                {loading ? 'Running...' : 'Run backtest'}
              </button>
              <button
                type='button'
                onClick={handleDemo}
                className='rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700'
              >
                Demo preset
              </button>
            </div>
          </form>
        </div>
      </header>

      <main className='relative px-6 pb-16'>
        <div className='mx-auto flex max-w-6xl flex-col gap-8'>
          {loading && (
            <div className='rounded-2xl border border-mist bg-white/70 p-4 text-sm text-slate-600 shadow-soft'>
              Fetching prices and running the backtest...
            </div>
          )}

          {error && (
            <div className='rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700'>
              {error}
            </div>
          )}

          {!loading && !data && !error && (
            <div className='rounded-2xl border border-mist bg-white/70 p-4 text-sm text-slate-600 shadow-soft'>
              Run a backtest to see results.
            </div>
          )}

          {data && (
            <>
              <SummaryTiles summary={data.summary} />

              <Charts data={chartData} />

              <div className='flex flex-wrap items-center gap-3'>
                <button
                  type='button'
                  onClick={handleDownload}
                  className='rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-white shadow-soft'
                >
                  Download CSV
                </button>
                <span className='text-xs text-slate-500'>
                  {`Filename: sip_${data.inputs.ticker}_${data.inputs.start}_to_${data.inputs.end}_first_trading_day_close.csv`}
                </span>
              </div>

              {data.meta.warnings.length > 0 && (
                <div className='rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800'>
                  <p className='font-semibold'>Data warnings</p>
                  <ul className='mt-2 list-disc pl-5'>
                    {data.meta.warnings.map((warning, idx) => (
                      <li key={`${warning}-${idx}`}>{warning}</li>
                    ))}
                  </ul>
                </div>
              )}

              <MonthlyTable rows={data.monthly} />
            </>
          )}

          <section className='rounded-2xl border border-mist bg-white/75 p-6 shadow-soft'>
            <h3 className='text-lg font-semibold text-ink'>Why this works</h3>
            <ul className='mt-3 list-disc space-y-1 pl-5 text-sm text-slate-600'>
              <li>Consistency beats timing.</li>
              <li>Volatility is normal.</li>
              <li>Stable companies reward patience.</li>
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
}
