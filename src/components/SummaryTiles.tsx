'use client';

import { SIPSummary } from '@/lib/types';

interface SummaryTilesProps {
    summary: SIPSummary;
    ticker: string;
}

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
}

function formatNumber(value: number, decimals: number = 4): string {
    return value.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
}

function formatPercent(value: number): string {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
}

export default function SummaryTiles({ summary, ticker }: SummaryTilesProps) {
    const isPositive = summary.gainLoss >= 0;

    const tiles = [
        {
            label: 'Total Contributed',
            value: formatCurrency(summary.totalContributed),
            subtext: `${summary.numberOfContributions} contributions`,
        },
        {
            label: 'Current Value',
            value: formatCurrency(summary.accountValue),
            subtext: `@ ${formatCurrency(summary.lastClosePrice)}/share`,
            highlight: true,
        },
        {
            label: 'Total Gain/Loss',
            value: formatCurrency(summary.gainLoss),
            subtext: formatPercent(summary.gainLossPercent),
            positive: isPositive,
        },
        {
            label: 'Total Shares',
            value: formatNumber(summary.totalShares),
            subtext: `${ticker} shares owned`,
        },
        {
            label: 'CAGR',
            value: formatPercent(summary.cagr),
            subtext: 'Compound Annual Growth Rate',
            positive: summary.cagr >= 0,
        },
        {
            label: 'Investment Period',
            value: `${summary.numberOfContributions} months`,
            subtext: `${summary.startDate} to ${summary.endDate}`,
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tiles.map((tile, index) => (
                <div
                    key={tile.label}
                    className="glass-card p-6 fade-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                >
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">
                            {tile.label}
                        </p>
                        {tile.highlight && (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] border border-[var(--color-border)]">
                                Live
                            </span>
                        )}
                    </div>
                    <p
                        className={`text-3xl font-bold mb-2 tracking-tight ${tile.positive !== undefined
                                ? tile.positive
                                    ? 'success-text'
                                    : 'danger-text'
                                : ''
                            }`}
                    >
                        {tile.value}
                    </p>
                    <p className="text-sm text-[var(--color-text-muted)]">{tile.subtext}</p>
                </div>
            ))}
        </div>
    );
}
