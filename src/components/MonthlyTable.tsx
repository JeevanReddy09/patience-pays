'use client';

import { useState, useMemo } from 'react';
import { MonthlyRow } from '@/lib/types';

interface MonthlyTableProps {
    monthly: MonthlyRow[];
    ticker: string;
    onExportCSV: () => void;
}

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
}

function formatShares(value: number): string {
    return value.toLocaleString('en-US', {
        minimumFractionDigits: 4,
        maximumFractionDigits: 4,
    });
}

const ITEMS_PER_PAGE = 12;

export default function MonthlyTable({ monthly, ticker, onExportCSV }: MonthlyTableProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');

    // Filter rows based on search
    const filteredRows = useMemo(() => {
        if (!searchTerm) return monthly;
        const term = searchTerm.toLowerCase();
        return monthly.filter(
            (row) =>
                row.buyMonth.toLowerCase().includes(term) ||
                row.buyDate.toLowerCase().includes(term) ||
                (row.note && row.note.toLowerCase().includes(term))
        );
    }, [monthly, searchTerm]);

    // Pagination
    const totalPages = Math.ceil(filteredRows.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedRows = filteredRows.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const handlePageChange = (page: number) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    };

    return (
        <div className="glass-card p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <h3 className="text-2xl font-bold tracking-tight">Monthly Purchase History</h3>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <input
                        type="text"
                        placeholder="Search by month or date..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="input-field text-sm py-2 px-4 sm:w-64"
                    />
                    <button onClick={onExportCSV} className="btn-secondary text-sm py-2 px-4">
                        Download CSV
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-[var(--color-border)]">
                            <th className="text-left py-3 px-2 text-[var(--color-text-muted)] font-medium text-xs uppercase tracking-wider">
                                Month
                            </th>
                            <th className="text-left py-3 px-2 text-[var(--color-text-muted)] font-medium text-xs uppercase tracking-wider">
                                Buy Date
                            </th>
                            <th className="text-right py-3 px-2 text-[var(--color-text-muted)] font-medium text-xs uppercase tracking-wider">
                                Price
                            </th>
                            <th className="text-right py-3 px-2 text-[var(--color-text-muted)] font-medium text-xs uppercase tracking-wider">
                                Contribution
                            </th>
                            <th className="text-right py-3 px-2 text-[var(--color-text-muted)] font-medium text-xs uppercase tracking-wider">
                                Shares
                            </th>
                            <th className="text-right py-3 px-2 text-[var(--color-text-muted)] font-medium text-xs uppercase tracking-wider">
                                Cumulative
                            </th>
                            <th className="text-right py-3 px-2 text-[var(--color-text-muted)] font-medium text-xs uppercase tracking-wider">
                                Value
                            </th>
                            <th className="text-left py-3 px-2 text-[var(--color-text-muted)] font-medium text-xs uppercase tracking-wider">
                                Note
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedRows.map((row, index) => (
                            <tr
                                key={row.buyMonth}
                                className={`border-b border-[var(--color-border-light)] hover:bg-[var(--color-bg-hover)] transition-colors ${row.note ? 'opacity-60' : ''
                                    }`}
                            >
                                <td className="py-3 px-2 font-medium">{row.buyMonth}</td>
                                <td className="py-3 px-2">{row.buyDate || '-'}</td>
                                <td className="py-3 px-2 text-right">
                                    {row.closePrice ? formatCurrency(row.closePrice) : '-'}
                                </td>
                                <td className="py-3 px-2 text-right">
                                    {row.contribution ? formatCurrency(row.contribution) : '-'}
                                </td>
                                <td className="py-3 px-2 text-right">
                                    {row.sharesBought ? formatShares(row.sharesBought) : '-'}
                                </td>
                                <td className="py-3 px-2 text-right font-medium">
                                    {formatShares(row.cumulativeShares)}
                                </td>
                                <td className="py-3 px-2 text-right text-[var(--color-success)]">
                                    {row.valueAtMonth ? formatCurrency(row.valueAtMonth) : '-'}
                                </td>
                                <td className="py-3 px-2 text-[var(--color-warning)] text-xs">
                                    {row.note || ''}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-between items-center mt-6 pt-6 border-t border-[var(--color-border)]">
                    <p className="text-sm text-[var(--color-text-muted)]">
                        Showing {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredRows.length)} of{' '}
                        {filteredRows.length} rows
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="btn-secondary py-2 px-3 text-sm disabled:opacity-30"
                        >
                            ←
                        </button>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                                pageNum = i + 1;
                            } else if (currentPage <= 3) {
                                pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                                pageNum = totalPages - 4 + i;
                            } else {
                                pageNum = currentPage - 2 + i;
                            }
                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => handlePageChange(pageNum)}
                                    className={`py-2 px-3 text-sm rounded-lg transition-colors ${currentPage === pageNum
                                        ? 'bg-[var(--color-primary)] text-[var(--color-bg-primary)]'
                                        : 'btn-secondary'
                                        }`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="btn-secondary py-2 px-3 text-sm disabled:opacity-30"
                        >
                            →
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
