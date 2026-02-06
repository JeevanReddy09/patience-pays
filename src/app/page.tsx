'use client';

import { useState } from 'react';
import InputForm, { FormData } from '@/components/InputForm';
import SummaryTiles from '@/components/SummaryTiles';
import Charts from '@/components/Charts';
import MonthlyTable from '@/components/MonthlyTable';
import WhyThisWorks from '@/components/WhyThisWorks';
import { SIPResponse } from '@/lib/types';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SIPResponse | null>(null);

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        ticker: formData.ticker,
        start: formData.startDate,
        end: formData.endDate,
        amount: formData.monthlyContribution.toString(),
        rule: 'first_trading_day_close',
      });

      const response = await fetch(`/api/sip?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to calculate SIP');
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!result) return;

    const headers = [
      'buy_month',
      'buy_date',
      'close_price',
      'contribution',
      'shares_bought',
      'cumulative_shares',
      'value_at_month',
      'note',
    ];

    const rows = result.monthly.map((row) => [
      row.buyMonth,
      row.buyDate,
      row.closePrice.toFixed(2),
      row.contribution.toFixed(2),
      row.sharesBought.toFixed(6),
      row.cumulativeShares.toFixed(6),
      row.valueAtMonth.toFixed(2),
      row.note || '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    const filename = `sip_${result.inputs.ticker}_${result.inputs.startDate}_to_${result.inputs.endDate}_first_trading_day_close.csv`;

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main className="min-h-screen py-12 md:py-20">
      <div className="container">
        {/* Hero Section */}
        <header className="text-center mb-16 md:mb-20">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 tracking-tight">
            <span className="gradient-text">Patience Pays</span>
          </h1>
          <p className="text-base md:text-lg text-[var(--color-text-secondary)] max-w-xl mx-auto leading-relaxed">
            Long-term investing rewards consistency. Backtest your SIP/DCA strategy and see how patience compounds over time.
          </p>
        </header>

        {/* Input Form */}
        <section className="max-w-2xl mx-auto mb-16">
          <InputForm onSubmit={handleSubmit} isLoading={isLoading} />
        </section>

        {/* Error Display */}
        {error && (
          <div className="max-w-2xl mx-auto mb-12">
            <div className="glass-card p-6 border-l-2 border-[var(--color-danger)]">
              <div className="flex items-start gap-4">
                <span className="text-xl">⚠️</span>
                <div>
                  <h4 className="font-semibold text-[var(--color-danger)] mb-1">Error</h4>
                  <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results Section */}
        {result && (
          <div className="space-y-8 fade-in">
            {/* Summary Tiles */}
            <section>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                🎯 Investment Summary
                <span className="text-base font-normal text-[var(--color-text-secondary)]">
                  for {result.inputs.ticker}
                </span>
              </h2>
              <SummaryTiles summary={result.summary} ticker={result.inputs.ticker} />
            </section>

            {/* Charts */}
            <section>
              <Charts
                monthly={result.monthly}
                totalContributed={result.summary.totalContributed}
              />
            </section>

            {/* Monthly Table */}
            <section>
              <MonthlyTable
                monthly={result.monthly}
                ticker={result.inputs.ticker}
                onExportCSV={handleExportCSV}
              />
            </section>

            {/* Warnings */}
            {result.meta.warnings && result.meta.warnings.length > 0 && (
              <div className="glass-card p-4 border-l-4 border-[var(--color-warning)]">
                <h4 className="font-semibold text-[var(--color-warning)] mb-2">⚠️ Warnings</h4>
                <ul className="text-sm text-[var(--color-text-secondary)] space-y-1">
                  {result.meta.warnings.map((warning, i) => (
                    <li key={i}>• {warning}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Why This Works Section */}
        <section className="mt-12">
          <WhyThisWorks />
        </section>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-[var(--color-bg-tertiary)] text-center">
          <p className="text-sm text-[var(--color-text-muted)]">
            Data provided by Yahoo Finance. Past performance does not guarantee future results.
            This tool is for educational purposes only and not financial advice.
          </p>
          <p className="text-xs text-[var(--color-text-muted)] mt-2">
            Last data refresh: {result?.meta.lastCloseDate || 'N/A'}
          </p>
        </footer>
      </div>
    </main>
  );
}
