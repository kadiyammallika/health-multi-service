'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Check, X, Search, Globe } from 'lucide-react';
import { useCurrency, searchCurrencies } from '@/components/ui/CurrencyProvider';

/**
 * Compact inline currency selector designed to sit inside search bars.
 * Shows flag + currency code, opens a searchable country dropdown.
 *
 * @param {string} variant - 'dark' (for dark backgrounds like flights) or 'light' (default, for white search bars)
 * @param {string} className - Additional classes
 */
export default function InlineCurrencySelector({ variant = 'light', className = '' }) {
  const { currency, setCurrency, currencies, rates, source } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  const activeCurrencyInfo = currencies.find((c) => c.code === currency) || currencies[0];

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Auto-focus search when opened
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const filteredCurrencies = useMemo(() => searchCurrencies(searchQuery), [searchQuery]);

  const handleSelect = (code) => {
    setCurrency(code);
    setSearchQuery('');
    setIsOpen(false);
  };

  const isDark = variant === 'dark';

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsOpen(!isOpen); }}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${
          isDark
            ? `bg-white/10 border border-white/20 text-white hover:bg-white/20 ${isOpen ? 'bg-white/25 border-white/40' : ''}`
            : `bg-gray-50 border border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-100 ${isOpen ? 'border-indigo-400 bg-indigo-50 text-indigo-700' : ''}`
        }`}
        title="Change display currency"
      >
        <Globe className="w-3.5 h-3.5 opacity-70" />
        <span className="text-sm leading-none">{activeCurrencyInfo.flag}</span>
        <span>{activeCurrencyInfo.code}</span>
        <ChevronDown className={`w-3 h-3 opacity-60 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full mt-2 w-80 max-w-[90vw] bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 z-[100] animate-fadeIn"
          style={{ right: 0 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-bold text-slate-900">Select Country & Currency</span>
            </div>
            <button
              type="button"
              onClick={() => { setIsOpen(false); setSearchQuery(''); }}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Search Input */}
          <div className="relative mb-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search country, code... (e.g. US, India, LON)"
              className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 outline-none placeholder-slate-400 transition"
              autoComplete="off"
              onClick={(e) => e.stopPropagation()}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Results */}
          <div className="max-h-64 overflow-y-auto pr-1">
            {filteredCurrencies.length === 0 ? (
              <div className="text-center py-6 text-sm text-slate-400">
                No matching countries or currencies found
              </div>
            ) : (
              filteredCurrencies.map((c) => {
                const isCurrent = c.code === currency;
                const rateToINR = c.code === 'INR' ? 1 : rates[c.code];
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => handleSelect(c.code)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition ${
                      isCurrent
                        ? 'bg-indigo-50/80 text-indigo-900 font-bold'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl leading-none">{c.flag}</span>
                      <div>
                        <div className="flex items-center gap-1.5 text-xs font-bold leading-tight">
                          <span>{c.country}</span>
                          <span className="text-slate-400 font-normal">({c.countryCode})</span>
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {c.code} - {c.name} ({c.symbol})
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      {isCurrent ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-700 bg-white px-2 py-0.5 rounded-md border border-indigo-200">
                          <Check className="w-3 h-3 text-indigo-600" /> Active
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-mono">
                          {rateToINR ? `1 INR = ${Number(rateToINR).toFixed(4)}` : ''}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-400 text-center">
            ExchangeRate-API {source === 'live' ? '(Live)' : source === 'cache' ? '(Cached)' : '(Fallback)'}
          </div>
        </div>
      )}
    </div>
  );
}
