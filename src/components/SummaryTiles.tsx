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
            icon: '💰',
            subtext: `${summary.numberOfContributions} contributions`,
        },
        {
            label: 'Current Value',
            value: formatCurrency(summary.accountValue),
            icon: '📈',
            subtext: `@ ${formatCurrency(summary.lastClosePrice)}/share`,
            highlight: true,
        },
        {
            label: 'Total Gain/Loss',
            value: formatCurrency(summary.gainLoss),
            icon: isPositive ? '🚀' : '📉',
            subtext: formatPercent(summary.gainLossPercent),
            positive: isPositive,
        },
        {
            label: 'Total Shares',
            value: formatNumber(summary.totalShares),
            icon: '🎯',
            subtext: `${ticker} shares owned`,
        },
        {
            label: 'CAGR',
            value: formatPercent(summary.cagr),
            icon: '📊',
            subtext: 'Compound Annual Growth Rate',
            positive: summary.cagr >= 0,
        },
        {
            label: 'Investment Period',
            value: `${summary.numberOfContributions} months`,
            icon: '📅',
            subtext: `${summary.startDate} to ${summary.endDate}`,
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tiles.map((tile, index) => (
                <div
                    key={tile.label}
                    className="glass-card p-5 fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                >
                    <div className="flex items-start justify-between mb-3">
                        <span className="text-2xl">{tile.icon}</span>
                        {tile.highlight && (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-[var(--color-primary)] text-white">
                                Current
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-[var(--color-text-secondary)] mb-1">
                        {tile.label}
                    </p>
                    <p
                        className={`text-2xl font-bold mb-1 ${tile.positive !== undefined
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
