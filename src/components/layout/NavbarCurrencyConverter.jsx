'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import {
  ArrowRightLeft,
  ChevronDown,
  Check,
  RefreshCw,
  X,
  Search,
  Globe,
} from 'lucide-react';
import { useCurrency, searchCurrencies } from '@/components/ui/CurrencyProvider';

export default function NavbarCurrencyConverter({ isMobile = false, onCloseMobile = () => {}, compact = false }) {
  const {
    currency,
    setCurrency,
    currencies,
    rates,
    lastUpdated,
    loading,
    source,
    convertCustom,
    fetchRates,
  } = useCurrency();

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('search'); // 'search' or 'converter'
  const [amount, setAmount] = useState('1000');
  const [fromCurrency, setFromCurrency] = useState('INR');
  const [toCurrency, setToCurrency] = useState('USD');
  const popoverRef = useRef(null);
  const searchInputRef = useRef(null);

  // Sync toCurrency when site currency changes
  useEffect(() => {
    if (currency !== 'INR' && currency !== toCurrency) {
      setToCurrency(currency);
    }
  }, [currency]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event) {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Auto-focus search when opened
  useEffect(() => {
    if (isOpen && activeTab === 'search' && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen, activeTab]);

  const activeCurrencyInfo = currencies.find((c) => c.code === currency) || currencies[0];

  // Filtered currencies based on search
  const filteredCurrencies = useMemo(() => {
    return searchCurrencies(searchQuery);
  }, [searchQuery]);

  // Converter calculations
  const fromInfo = currencies.find((c) => c.code === fromCurrency) || currencies[0];
  const toInfo = currencies.find((c) => c.code === toCurrency) || currencies[1] || currencies[0];
  const numericAmount = parseFloat(amount) || 0;
  const convertedResult = convertCustom(numericAmount, fromCurrency, toCurrency);
  const unitRate = convertCustom(1, fromCurrency, toCurrency);

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const handleSelectCurrency = (code) => {
    setCurrency(code);
    setToCurrency(code);
    setSearchQuery('');
    setIsOpen(false);
    if (isMobile) {
      onCloseMobile();
    }
  };

  const handleApplyToSite = () => {
    setCurrency(toCurrency);
    setIsOpen(false);
    if (isMobile) {
      onCloseMobile();
    }
  };

  // Search results component (shared between mobile and desktop)
  const SearchResults = ({ maxHeight = 'max-h-64' }) => (
    <div className="space-y-1">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search country, code or currency... (e.g. US, India, EUR)"
          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 outline-none placeholder-slate-400 transition"
          autoComplete="off"
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
      <div className={`${maxHeight} overflow-y-auto pr-1`}>
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
                onClick={() => handleSelectCurrency(c.code)}
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
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-700 bg-white px-2 py-0.5 rounded-md border border-indigo-200 shadow-xs">
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
    </div>
  );

  // Mobile inline rendering
  if (isMobile) {
    return (
      <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">{activeCurrencyInfo.flag}</span>
            <span className="text-xs font-bold text-slate-800">
              {activeCurrencyInfo.country} ({activeCurrencyInfo.code} {activeCurrencyInfo.symbol})
            </span>
          </div>
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Live Rates
          </span>
        </div>

        {/* Search for mobile */}
        <SearchResults maxHeight="max-h-48" />
      </div>
    );
  }

  // Compact mode for sidebar — just a small button
  if (compact) {
    return (
      <div className="relative" ref={popoverRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-bold transition ${
            isOpen
              ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
              : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
          }`}
          title="Change display currency"
        >
          <span className="text-sm leading-none">{activeCurrencyInfo.flag}</span>
          <span>{activeCurrencyInfo.code}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
        </button>

        {isOpen && (
          <div className="absolute left-0 bottom-full mb-2 w-80 max-w-[90vw] bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 z-[60] animate-fadeIn">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold text-slate-900">Select Country & Currency</span>
              </div>
              <button type="button" onClick={() => { setIsOpen(false); setSearchQuery(''); }} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <SearchResults maxHeight="max-h-60" />
            <div className="mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-400 text-center">
              Rates: ExchangeRate-API {source === 'live' ? '(Live)' : source === 'cache' ? '(Cached)' : '(Fallback)'}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Desktop full trigger button + popover
  return (
    <div className="relative" ref={popoverRef}>
      {/* Desktop Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold transition shadow-xs ${
          isOpen
            ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-500/20'
            : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
        }`}
        title="Country & Currency Selector (Powered by ExchangeRate-API)"
        aria-label="Currency converter"
      >
        <span className="text-sm leading-none">{activeCurrencyInfo.flag}</span>
        <span className="tracking-wide">
          {activeCurrencyInfo.countryCode || activeCurrencyInfo.code}{' '}
          <span className="text-slate-400">
            {activeCurrencyInfo.code} ({activeCurrencyInfo.symbol})
          </span>
        </span>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-0.5" title="Live exchange rate connected"></span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-[420px] max-w-[95vw] bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-50 animate-fadeIn">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                <Globe className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 leading-tight">Country & Currency Selector</h4>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>ExchangeRate-API {source === 'live' ? 'Live' : source === 'cache' ? 'Cached' : 'Fallback'}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={fetchRates}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                title="Refresh exchange rates"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
              </button>
              <button
                type="button"
                onClick={() => { setIsOpen(false); setSearchQuery(''); }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl my-3 text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('search')}
              className={`py-1.5 rounded-lg transition flex items-center justify-center gap-1.5 ${
                activeTab === 'search'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Search className="w-3 h-3" />
              Search Country
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('converter')}
              className={`py-1.5 rounded-lg transition flex items-center justify-center gap-1.5 ${
                activeTab === 'converter'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowRightLeft className="w-3 h-3" />
              Convert Calculator
            </button>
          </div>

          {activeTab === 'search' ? (
            <SearchResults maxHeight="max-h-72" />
          ) : (
            /* Converter Calculator Tab */
            <div className="space-y-3">
              {/* From Row */}
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  You Convert
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-transparent text-lg font-black text-slate-900 outline-none focus:ring-0"
                    placeholder="Enter amount"
                  />
                  <select
                    value={fromCurrency}
                    onChange={(e) => setFromCurrency(e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 shadow-xs outline-none focus:border-indigo-500"
                  >
                    {currencies.map((c) => (
                      <option key={`from-${c.code}`} value={c.code}>
                        {c.flag} {c.code} ({c.symbol})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Swap Button */}
              <div className="relative flex justify-center -my-1">
                <button
                  type="button"
                  onClick={handleSwap}
                  className="w-7 h-7 rounded-full bg-white border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 flex items-center justify-center shadow-xs transition transform hover:rotate-180 duration-300 z-10"
                  title="Swap currencies"
                >
                  <ArrowRightLeft className="w-3 h-3" />
                </button>
              </div>

              {/* To Row */}
              <div className="p-2.5 bg-indigo-50/60 rounded-xl border border-indigo-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block mb-1">
                  Converted Result
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-full text-lg font-black text-indigo-950 truncate">
                    {toInfo.symbol} {convertedResult.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <select
                    value={toCurrency}
                    onChange={(e) => setToCurrency(e.target.value)}
                    className="bg-white border border-indigo-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-indigo-900 shadow-xs outline-none focus:border-indigo-500"
                  >
                    {currencies.map((c) => (
                      <option key={`to-${c.code}`} value={c.code}>
                        {c.flag} {c.code} ({c.symbol})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Rate */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                <span>Exchange Rate:</span>
                <span className="font-semibold text-slate-700">
                  1 {fromCurrency} = {unitRate.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })} {toCurrency}
                </span>
              </div>

              {/* Apply Button */}
              <button
                type="button"
                onClick={handleApplyToSite}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition"
              >
                <Check className="w-4 h-4" />
                <span>Set {toCurrency} ({toInfo.symbol}) as Website Currency</span>
              </button>
            </div>
          )}

          {/* Footer */}
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
            <span>Rates: Real-time via ExchangeRate-API</span>
            {lastUpdated && (
              <span className="truncate max-w-[160px]">
                Updated: {new Date(lastUpdated).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
