'use client';

import {
    LineChart,
    Line,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { MonthlyRow } from '@/lib/types';

interface ChartsProps {
    monthly: MonthlyRow[];
    totalContributed: number;
}

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
}

export default function Charts({ monthly, totalContributed }: ChartsProps) {
    // Prepare data for charts - only include months with actual purchases
    const chartData = monthly
        .filter((row) => row.buyDate)
        .map((row, index) => {
            const cumulativeContribution = (index + 1) * row.contribution;
            return {
                month: row.buyMonth,
                value: row.valueAtMonth,
                contributed: cumulativeContribution,
                shares: row.cumulativeShares,
                price: row.closePrice,
            };
        });

    // Custom tooltip component
    const CustomTooltip = ({ active, payload, label }: {
        active?: boolean;
        payload?: Array<{ name: string; value: number; color: string }>;
        label?: string;
    }) => {
        if (active && payload && payload.length) {
            return (
                <div className="glass-card p-3 text-sm">
                    <p className="font-semibold mb-2">{label}</p>
                    {payload.map((entry, index) => (
                        <p key={index} style={{ color: entry.color }}>
                            {entry.name}: {formatCurrency(entry.value)}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-8">
            {/* Portfolio Value Over Time */}
            <div className="glass-card p-6">
                <h3 className="text-lg font-bold mb-4">📈 Portfolio Value Over Time</h3>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="valueGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis
                                dataKey="month"
                                stroke="#64748b"
                                tick={{ fill: '#94a3b8', fontSize: 12 }}
                                tickFormatter={(value) => value.slice(2)}
                            />
                            <YAxis
                                stroke="#64748b"
                                tick={{ fill: '#94a3b8', fontSize: 12 }}
                                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="value"
                                name="Portfolio Value"
                                stroke="#2563eb"
                                strokeWidth={3}
                                fill="url(#valueGradient)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Contributions vs Portfolio Value */}
            <div className="glass-card p-6">
                <h3 className="text-lg font-bold mb-4">💰 Contributions vs Portfolio Value</h3>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis
                                dataKey="month"
                                stroke="#64748b"
                                tick={{ fill: '#94a3b8', fontSize: 12 }}
                                tickFormatter={(value) => value.slice(2)}
                            />
                            <YAxis
                                stroke="#64748b"
                                tick={{ fill: '#94a3b8', fontSize: 12 }}
                                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                                wrapperStyle={{ paddingTop: '10px' }}
                                iconType="line"
                            />
                            <Line
                                type="monotone"
                                dataKey="contributed"
                                name="Total Contributed"
                                stroke="#64748b"
                                strokeWidth={2}
                                strokeDasharray="5 5"
                                dot={false}
                            />
                            <Line
                                type="monotone"
                                dataKey="value"
                                name="Portfolio Value"
                                stroke="#10b981"
                                strokeWidth={3}
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <div className="mt-4 p-4 bg-[var(--color-bg-tertiary)] rounded-lg">
                    <p className="text-sm text-[var(--color-text-secondary)]">
                        <span className="font-semibold text-[var(--color-text-primary)]">Gap Analysis:</span>{' '}
                        The distance between the lines shows your investment gains.
                        When the green line is above the gray dashed line, your portfolio is profitable.
                    </p>
                </div>
            </div>
        </div>
    );
}
