'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CurrencyContext = createContext();

const CURRENCIES = [
  // Asia
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', flag: '🇮🇳', country: 'India', countryCode: 'IN', aliases: ['IN', 'IND', 'Bharat'] },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', flag: '🇯🇵', country: 'Japan', countryCode: 'JP', aliases: ['JP', 'JPN'] },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', flag: '🇨🇳', country: 'China', countryCode: 'CN', aliases: ['CN', 'CHN', 'PRC'] },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', flag: '🇸🇬', country: 'Singapore', countryCode: 'SG', aliases: ['SG', 'SGP'] },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit', flag: '🇲🇾', country: 'Malaysia', countryCode: 'MY', aliases: ['MY', 'MYS'] },
  { code: 'THB', symbol: '฿', name: 'Thai Baht', flag: '🇹🇭', country: 'Thailand', countryCode: 'TH', aliases: ['TH', 'THA'] },
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah', flag: '🇮🇩', country: 'Indonesia', countryCode: 'ID', aliases: ['ID', 'IDN'] },
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso', flag: '🇵🇭', country: 'Philippines', countryCode: 'PH', aliases: ['PH', 'PHL'] },
  { code: 'VND', symbol: '₫', name: 'Vietnamese Dong', flag: '🇻🇳', country: 'Vietnam', countryCode: 'VN', aliases: ['VN', 'VNM'] },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won', flag: '🇰🇷', country: 'South Korea', countryCode: 'KR', aliases: ['KR', 'KOR', 'Korea'] },
  { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka', flag: '🇧🇩', country: 'Bangladesh', countryCode: 'BD', aliases: ['BD', 'BGD'] },
  { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee', flag: '🇵🇰', country: 'Pakistan', countryCode: 'PK', aliases: ['PK', 'PAK'] },
  { code: 'LKR', symbol: 'Rs', name: 'Sri Lankan Rupee', flag: '🇱🇰', country: 'Sri Lanka', countryCode: 'LK', aliases: ['LK', 'LKA'] },
  { code: 'NPR', symbol: '₨', name: 'Nepalese Rupee', flag: '🇳🇵', country: 'Nepal', countryCode: 'NP', aliases: ['NP', 'NPL'] },
  { code: 'MMK', symbol: 'K', name: 'Myanmar Kyat', flag: '🇲🇲', country: 'Myanmar', countryCode: 'MM', aliases: ['MM', 'MMR', 'Burma'] },
  { code: 'KHR', symbol: '៛', name: 'Cambodian Riel', flag: '🇰🇭', country: 'Cambodia', countryCode: 'KH', aliases: ['KH', 'KHM'] },
  { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar', flag: '🇭🇰', country: 'Hong Kong', countryCode: 'HK', aliases: ['HK', 'HKG'] },
  { code: 'TWD', symbol: 'NT$', name: 'Taiwan Dollar', flag: '🇹🇼', country: 'Taiwan', countryCode: 'TW', aliases: ['TW', 'TWN'] },
  // Middle East
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', flag: '🇦🇪', country: 'United Arab Emirates', countryCode: 'AE', aliases: ['AE', 'UAE', 'Dubai', 'Abu Dhabi'] },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal', flag: '🇸🇦', country: 'Saudi Arabia', countryCode: 'SA', aliases: ['SA', 'SAU', 'KSA'] },
  { code: 'QAR', symbol: 'QR', name: 'Qatari Riyal', flag: '🇶🇦', country: 'Qatar', countryCode: 'QA', aliases: ['QA', 'QAT'] },
  { code: 'KWD', symbol: 'KD', name: 'Kuwaiti Dinar', flag: '🇰🇼', country: 'Kuwait', countryCode: 'KW', aliases: ['KW', 'KWT'] },
  { code: 'BHD', symbol: 'BD', name: 'Bahraini Dinar', flag: '🇧🇭', country: 'Bahrain', countryCode: 'BH', aliases: ['BH', 'BHR'] },
  { code: 'OMR', symbol: 'OMR', name: 'Omani Rial', flag: '🇴🇲', country: 'Oman', countryCode: 'OM', aliases: ['OM', 'OMN'] },
  { code: 'JOD', symbol: 'JD', name: 'Jordanian Dinar', flag: '🇯🇴', country: 'Jordan', countryCode: 'JO', aliases: ['JO', 'JOR'] },
  { code: 'ILS', symbol: '₪', name: 'Israeli Shekel', flag: '🇮🇱', country: 'Israel', countryCode: 'IL', aliases: ['IL', 'ISR'] },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira', flag: '🇹🇷', country: 'Turkey', countryCode: 'TR', aliases: ['TR', 'TUR', 'Turkiye'] },
  // Americas
  { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸', country: 'United States', countryCode: 'US', aliases: ['US', 'USA', 'America'] },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', flag: '🇨🇦', country: 'Canada', countryCode: 'CA', aliases: ['CA', 'CAN'] },
  { code: 'MXN', symbol: 'MX$', name: 'Mexican Peso', flag: '🇲🇽', country: 'Mexico', countryCode: 'MX', aliases: ['MX', 'MEX'] },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', flag: '🇧🇷', country: 'Brazil', countryCode: 'BR', aliases: ['BR', 'BRA'] },
  { code: 'ARS', symbol: 'AR$', name: 'Argentine Peso', flag: '🇦🇷', country: 'Argentina', countryCode: 'AR', aliases: ['AR', 'ARG'] },
  { code: 'CLP', symbol: 'CL$', name: 'Chilean Peso', flag: '🇨🇱', country: 'Chile', countryCode: 'CL', aliases: ['CL', 'CHL'] },
  { code: 'COP', symbol: 'COL$', name: 'Colombian Peso', flag: '🇨🇴', country: 'Colombia', countryCode: 'CO', aliases: ['CO', 'COL'] },
  { code: 'PEN', symbol: 'S/', name: 'Peruvian Sol', flag: '🇵🇪', country: 'Peru', countryCode: 'PE', aliases: ['PE', 'PER'] },
  // Europe
  { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺', country: 'European Union', countryCode: 'EU', aliases: ['EU', 'Europe', 'Eurozone'] },
  { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧', country: 'United Kingdom', countryCode: 'GB', aliases: ['GB', 'GBR', 'UK', 'England', 'Britain'] },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', flag: '🇨🇭', country: 'Switzerland', countryCode: 'CH', aliases: ['CH', 'CHE'] },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona', flag: '🇸🇪', country: 'Sweden', countryCode: 'SE', aliases: ['SE', 'SWE'] },
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone', flag: '🇳🇴', country: 'Norway', countryCode: 'NO', aliases: ['NO', 'NOR'] },
  { code: 'DKK', symbol: 'kr', name: 'Danish Krone', flag: '🇩🇰', country: 'Denmark', countryCode: 'DK', aliases: ['DK', 'DNK'] },
  { code: 'PLN', symbol: 'zł', name: 'Polish Zloty', flag: '🇵🇱', country: 'Poland', countryCode: 'PL', aliases: ['PL', 'POL'] },
  { code: 'CZK', symbol: 'Kč', name: 'Czech Koruna', flag: '🇨🇿', country: 'Czech Republic', countryCode: 'CZ', aliases: ['CZ', 'CZE', 'Czechia'] },
  { code: 'HUF', symbol: 'Ft', name: 'Hungarian Forint', flag: '🇭🇺', country: 'Hungary', countryCode: 'HU', aliases: ['HU', 'HUN'] },
  { code: 'RON', symbol: 'lei', name: 'Romanian Leu', flag: '🇷🇴', country: 'Romania', countryCode: 'RO', aliases: ['RO', 'ROU'] },
  { code: 'RUB', symbol: '₽', name: 'Russian Ruble', flag: '🇷🇺', country: 'Russia', countryCode: 'RU', aliases: ['RU', 'RUS'] },
  { code: 'UAH', symbol: '₴', name: 'Ukrainian Hryvnia', flag: '🇺🇦', country: 'Ukraine', countryCode: 'UA', aliases: ['UA', 'UKR'] },
  // Africa
  { code: 'ZAR', symbol: 'R', name: 'South African Rand', flag: '🇿🇦', country: 'South Africa', countryCode: 'ZA', aliases: ['ZA', 'ZAF', 'SA'] },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', flag: '🇳🇬', country: 'Nigeria', countryCode: 'NG', aliases: ['NG', 'NGA'] },
  { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound', flag: '🇪🇬', country: 'Egypt', countryCode: 'EG', aliases: ['EG', 'EGY'] },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', flag: '🇰🇪', country: 'Kenya', countryCode: 'KE', aliases: ['KE', 'KEN'] },
  { code: 'GHS', symbol: 'GH₵', name: 'Ghanaian Cedi', flag: '🇬🇭', country: 'Ghana', countryCode: 'GH', aliases: ['GH', 'GHA'] },
  { code: 'MAD', symbol: 'MAD', name: 'Moroccan Dirham', flag: '🇲🇦', country: 'Morocco', countryCode: 'MA', aliases: ['MA', 'MAR'] },
  // Oceania
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', flag: '🇦🇺', country: 'Australia', countryCode: 'AU', aliases: ['AU', 'AUS', 'Aussie'] },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar', flag: '🇳🇿', country: 'New Zealand', countryCode: 'NZ', aliases: ['NZ', 'NZL', 'Kiwi'] },
  { code: 'FJD', symbol: 'FJ$', name: 'Fijian Dollar', flag: '🇫🇯', country: 'Fiji', countryCode: 'FJ', aliases: ['FJ', 'FJI'] },
];

// Search currencies by country name, country code, currency code, or aliases
export function searchCurrencies(query) {
  if (!query || !query.trim()) return CURRENCIES;
  const q = query.trim().toLowerCase();
  return CURRENCIES.filter((c) => {
    if (c.code.toLowerCase().includes(q)) return true;
    if (c.country.toLowerCase().includes(q)) return true;
    if (c.countryCode.toLowerCase() === q) return true;
    if (c.name.toLowerCase().includes(q)) return true;
    if (c.aliases?.some((a) => a.toLowerCase().includes(q))) return true;
    return false;
  });
}

export function CurrencyProvider({ children }) {
  const [currency, setCurrencyState] = useState('INR');
  const [rates, setRates] = useState({});
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState('live');

  // Load saved currency preference from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('oneconnect_currency');
        if (saved && CURRENCIES.some((c) => c.code === saved)) {
          setCurrencyState(saved);
        }
      } catch (e) {}
    }
  }, []);

  // Fetch live exchange rates from ExchangeRate-API via backend route
  const fetchRates = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/exchange-rates');
      const data = await res.json();
      if (data.success && data.rates) {
        setRates(data.rates);
        setLastUpdated(data.lastUpdated);
        setSource(data.source || 'live');
      }
    } catch (e) {
      console.error('Failed to fetch live exchange rates:', e);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  const setCurrency = useCallback((code) => {
    if (!code) return;
    setCurrencyState(code);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('oneconnect_currency', code);
        window.dispatchEvent(new Event('oneconnect_currency_update'));
      } catch (e) {}
    }
  }, []);

  // Convert INR amount to active or specified currency
  const convert = useCallback(
    (amountInINR, targetCurrency = null) => {
      const target = targetCurrency || currency;
      if (amountInINR === null || amountInINR === undefined || isNaN(amountInINR)) return 0;
      const num = Number(amountInINR);
      if (target === 'INR') return num;
      const rate = rates[target];
      if (!rate) return num;
      return Math.round(num * rate * 100) / 100;
    },
    [currency, rates]
  );

  // Convert between ANY two currencies (using INR as pivot)
  const convertCustom = useCallback(
    (amount, fromCode = 'INR', toCode = 'USD') => {
      if (amount === null || amount === undefined || isNaN(amount)) return 0;
      const num = Number(amount);
      if (fromCode === toCode) return num;

      // Rate against INR: 1 INR = rates[CURR]
      const fromRate = fromCode === 'INR' ? 1.0 : rates[fromCode] || 1.0;
      const toRate = toCode === 'INR' ? 1.0 : rates[toCode] || 1.0;

      // Step 1: convert from source currency to INR
      const inINR = num / fromRate;
      // Step 2: convert from INR to target currency
      const result = inINR * toRate;

      return Math.round(result * 100) / 100;
    },
    [rates]
  );

  // Format price with currency symbol and localized formatting
  const formatPrice = useCallback(
    (amountInINR, overrideCurrency = null) => {
      const target = overrideCurrency || currency;
      const curr = CURRENCIES.find((c) => c.code === target) || { symbol: target, code: target };
      const converted = convert(amountInINR, target);

      if (target === 'JPY') {
        return `${curr.symbol}${Math.round(converted).toLocaleString()}`;
      }
      if (target === 'INR') {
        return `${curr.symbol}${Math.round(converted).toLocaleString('en-IN')}`;
      }

      // Formatting for foreign currencies
      const formattedNum = Number(converted).toLocaleString('en-US', {
        minimumFractionDigits: converted % 1 === 0 ? 0 : 2,
        maximumFractionDigits: 2,
      });

      return `${curr.symbol}${formattedNum}`;
    },
    [currency, convert]
  );

  const getCurrencyInfo = useCallback((code) => {
    return CURRENCIES.find((c) => c.code === code) || { code, symbol: code, name: code, flag: '🌐', country: '' };
  }, []);

  const value = {
    currency,
    setCurrency,
    currencies: CURRENCIES,
    rates,
    lastUpdated,
    loading,
    source,
    convert,
    convertCustom,
    formatPrice,
    getCurrencyInfo,
    fetchRates,
  };

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    return {
      currency: 'INR',
      setCurrency: () => {},
      currencies: CURRENCIES,
      rates: {},
      lastUpdated: null,
      loading: false,
      source: 'fallback',
      convert: (amt) => Number(amt || 0),
      convertCustom: (amt) => Number(amt || 0),
      formatPrice: (amt) => `₹${Number(amt || 0).toLocaleString('en-IN')}`,
      getCurrencyInfo: (code) => CURRENCIES.find((c) => c.code === code) || { code, symbol: '₹', name: 'Indian Rupee', flag: '🇮🇳' },
      fetchRates: () => {},
    };
  }
  return ctx;
}

export { CURRENCIES };
