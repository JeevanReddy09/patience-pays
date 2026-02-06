'use client';

import { useState, useEffect, useRef } from 'react';

interface SearchResult {
    symbol: string;
    name: string;
    type: string;
    exchange: string;
}

interface TickerSearchProps {
    value: string;
    onChange: (ticker: string) => void;
}

export default function TickerSearch({ value, onChange }: TickerSearchProps) {
    const [query, setQuery] = useState(value);
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Update local query when value prop changes
    useEffect(() => {
        setQuery(value);
    }, [value]);

    // Track whether user just selected from dropdown (to skip immediate re-search)
    const [hasSelected, setHasSelected] = useState(false);

    // Handle search with debounce
    useEffect(() => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        if (query.length < 2) {
            setResults([]);
            setIsOpen(false);
            return;
        }

        // Skip search if user just selected a ticker
        if (hasSelected) {
            setHasSelected(false);
            return;
        }

        setIsLoading(true);
        debounceRef.current = setTimeout(async () => {
            try {
                const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
                const data = await response.json();
                setResults(data.results || []);
                setIsOpen(data.results?.length > 0);
                setSelectedIndex(-1);
            } catch (error) {
                console.error('Search error:', error);
                setResults([]);
            } finally {
                setIsLoading(false);
            }
        }, 300);

        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, [query, hasSelected]);

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                inputRef.current &&
                !inputRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (result: SearchResult) => {
        setHasSelected(true);
        setQuery(result.symbol);
        onChange(result.symbol);
        setIsOpen(false);
        setResults([]);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen || results.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0 && selectedIndex < results.length) {
                    handleSelect(results[selectedIndex]);
                }
                break;
            case 'Escape':
                setIsOpen(false);
                break;
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value.toUpperCase();
        setQuery(newValue);
        // Only call onChange for valid tickers without spaces (direct ticker entry)
        // For company name searches (with spaces), we preserve the query for searching
        // but don't update the parent until user selects from dropdown
        if (newValue && !newValue.includes(' ') && /^[A-Z0-9]+$/.test(newValue)) {
            onChange(newValue);
        }
    };

    return (
        <div className="relative">
            <label htmlFor="ticker" className="input-label">
                Stock Ticker
            </label>
            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    id="ticker"
                    value={query}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => results.length > 0 && setIsOpen(true)}
                    placeholder="Search by company name or ticker..."
                    className="input-field uppercase pr-10"
                    autoComplete="off"
                    required
                />
                {isLoading && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
                        ⏳
                    </span>
                )}
            </div>

            {/* Dropdown */}
            {isOpen && results.length > 0 && (
                <div
                    ref={dropdownRef}
                    className="absolute z-50 w-full mt-2 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl overflow-hidden"
                >
                    {results.map((result, index) => (
                        <button
                            key={result.symbol}
                            type="button"
                            onClick={() => handleSelect(result)}
                            className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-colors ${index === selectedIndex
                                    ? 'bg-[var(--color-bg-hover)] text-[var(--color-text-primary)]'
                                    : 'hover:bg-[var(--color-bg-hover)]'
                                }`}
                        >
                            <span className="font-semibold text-sm min-w-[60px]">{result.symbol}</span>
                            <span className="text-sm text-[var(--color-text-secondary)] truncate flex-1">
                                {result.name}
                            </span>
                            <span className="text-xs px-2 py-1 rounded bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)] border border-[var(--color-border)]">
                                {result.type}
                            </span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
