'use client';

import { useEffect, useRef, useState, type ChangeEvent, type KeyboardEvent } from 'react';

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
  const [hasSelected, setHasSelected] = useState(false);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

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
        setIsOpen((data.results || []).length > 0);
        setSelectedIndex(-1);
      } catch {
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

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || results.length === 0) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        event.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case 'Enter':
        event.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleSelect(results[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value.toUpperCase();
    setQuery(newValue);
    if (newValue && !newValue.includes(' ') && /^[A-Z0-9.-]+$/.test(newValue)) {
      onChange(newValue);
    }
  };

  return (
    <div className='relative'>
      <input
        ref={inputRef}
        type='text'
        value={query}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => results.length > 0 && setIsOpen(true)}
        placeholder='GOOGL'
        className='w-full rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm uppercase'
        autoComplete='off'
        required
      />
      {isLoading && (
        <span className='absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400'>...</span>
      )}

      {isOpen && results.length > 0 && (
        <div
          ref={dropdownRef}
          className='absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-mist bg-white/95 shadow-soft'
        >
          {results.map((result, index) => (
            <button
              key={result.symbol}
              type='button'
              onClick={() => handleSelect(result)}
              className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors ${
                index === selectedIndex ? 'bg-mist/70' : 'hover:bg-mist/50'
              }`}
            >
              <span className='min-w-[60px] font-semibold text-ink'>{result.symbol}</span>
              <span className='flex-1 truncate text-slate-600'>{result.name}</span>
              <span className='rounded-full bg-sand px-2 py-1 text-[10px] uppercase tracking-wide text-slate-500'>
                {result.type}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
