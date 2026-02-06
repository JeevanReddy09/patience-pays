'use client';

import React, { useState } from 'react';
import TickerSearch from './TickerSearch';

interface InputFormProps {
    onSubmit: (data: FormData) => void;
    isLoading: boolean;
}

export interface FormData {
    ticker: string;
    monthlyContribution: number;
    startDate: string;
    endDate: string;
}

function getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
}

export default function InputForm({ onSubmit, isLoading }: InputFormProps) {
    const [ticker, setTicker] = useState('GOOGL');
    const [monthlyContribution, setMonthlyContribution] = useState(100);
    const [startDate, setStartDate] = useState('2023-08-01');
    const [endDate, setEndDate] = useState(getTodayDate());

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            ticker: ticker.toUpperCase(),
            monthlyContribution,
            startDate,
            endDate,
        });
    };

    const handleDemoPreset = () => {
        setTicker('GOOGL');
        setMonthlyContribution(100);
        setStartDate('2023-08-01');
        setEndDate(getTodayDate());
    };

    return (
        <div className="glass-card p-6 md:p-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Configure Your SIP</h2>
                <button
                    type="button"
                    onClick={handleDemoPreset}
                    className="btn-secondary text-sm py-2 px-4"
                >
                    📊 Demo Preset
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Ticker Search */}
                    <TickerSearch value={ticker} onChange={setTicker} />

                    {/* Monthly Contribution */}
                    <div>
                        <label htmlFor="contribution" className="input-label">
                            Monthly Contribution ($)
                        </label>
                        <input
                            type="number"
                            id="contribution"
                            value={monthlyContribution}
                            onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                            min={1}
                            step={1}
                            className="input-field"
                            required
                        />
                    </div>

                    {/* Start Date */}
                    <div>
                        <label htmlFor="startDate" className="input-label">
                            Start Date
                        </label>
                        <input
                            type="date"
                            id="startDate"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="input-field"
                            required
                        />
                    </div>

                    {/* End Date */}
                    <div>
                        <label htmlFor="endDate" className="input-label">
                            End Date
                        </label>
                        <input
                            type="date"
                            id="endDate"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="input-field"
                            required
                        />
                    </div>
                </div>

                {/* Execution Rule Info */}
                <div className="bg-[var(--color-bg-tertiary)] rounded-lg p-4 text-sm text-[var(--color-text-secondary)]">
                    <strong>Execution Rule:</strong> Buy at the closing price on the first trading day of each month
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary w-full text-lg"
                >
                    {isLoading ? (
                        <span className="flex items-center justify-center gap-2">
                            <span className="pulse">⏳</span> Calculating...
                        </span>
                    ) : (
                        'Calculate SIP Returns'
                    )}
                </button>
            </form>
        </div>
    );
}
