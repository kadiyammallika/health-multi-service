import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// In-memory cache with 30-minute TTL
let cachedRates = null;
let cacheExpiredAt = null;
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 mins

// Fallback hardcoded rates (1 INR in other currencies)
const FALLBACK_RATES = {
  INR: 1.0,
  USD: 0.01061,
  EUR: 0.00962,
  GBP: 0.00841,
  AED: 0.03897,
  CAD: 0.01465,
  AUD: 0.01633,
  SGD: 0.01416,
  JPY: 1.6372,
  THB: 0.3621,
  MYR: 0.0468,
  SAR: 0.0398,
  CHF: 0.00936,
  CNY: 0.0768,
  NZD: 0.0179,
};

function isCacheValid() {
  return cachedRates && cacheExpiredAt && Date.now() < cacheExpiredAt;
}

function updateCache(rates) {
  cachedRates = rates;
  cacheExpiredAt = Date.now() + CACHE_TTL_MS;
}

/**
 * GET /api/exchange-rates
 * Fetches current exchange rates from INR to all currencies
 * Uses ExchangeRate-API with user's provided API key
 */
export async function GET() {
  try {
    if (isCacheValid()) {
      return NextResponse.json({
        success: true,
        base: 'INR',
        rates: cachedRates,
        lastUpdated: new Date(cacheExpiredAt - CACHE_TTL_MS).toISOString(),
        source: 'cache',
      });
    }

    const apiKey = process.env.EXCHANGE_RATE_API_KEY || '41b6a081517ffaa6a15e66d5';

    const response = await fetch(
      `https://v6.exchangerate-api.com/v6/${apiKey}/latest/INR`,
      {
        headers: { Accept: 'application/json' },
        next: { revalidate: 1800 },
      }
    );

    if (!response.ok) {
      console.warn(`ExchangeRate-API returned status ${response.status}. Using fallback rates.`);
      updateCache(FALLBACK_RATES);
      return NextResponse.json({
        success: true,
        base: 'INR',
        rates: FALLBACK_RATES,
        lastUpdated: new Date().toISOString(),
        source: 'fallback',
        warning: 'ExchangeRate-API unavailable. Fallback rates active.',
      });
    }

    const data = await response.json();

    if (data.result !== 'success' || !data.conversion_rates) {
      console.warn('ExchangeRate-API error response:', data);
      updateCache(FALLBACK_RATES);
      return NextResponse.json({
        success: true,
        base: 'INR',
        rates: FALLBACK_RATES,
        lastUpdated: new Date().toISOString(),
        source: 'fallback',
        warning: data['error-type'] || 'API error',
      });
    }

    // Merge API rates with our fallback ensure INR is 1 and all keys exist
    const fullRates = {
      ...FALLBACK_RATES,
      ...data.conversion_rates,
      INR: 1.0,
    };

    updateCache(fullRates);

    return NextResponse.json({
      success: true,
      base: 'INR',
      rates: fullRates,
      lastUpdated: data.time_last_update_utc || new Date().toISOString(),
      source: 'live',
      rateCount: Object.keys(fullRates).length,
    });
  } catch (error) {
    console.error('Exchange rate fetch error:', error.message);
    updateCache(FALLBACK_RATES);
    return NextResponse.json({
      success: true,
      base: 'INR',
      rates: FALLBACK_RATES,
      lastUpdated: new Date().toISOString(),
      source: 'fallback',
      warning: 'Error fetching live rates. Using fallback rates.',
    });
  }
}
