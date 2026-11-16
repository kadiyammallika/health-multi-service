/**
 * Amadeus API Client with OAuth2 token management and response caching.
 *
 * Uses the Amadeus Self-Service (test) API for:
 *   - Flight Offers Search v2
 *   - Hotel List by City v1
 *   - Hotel Offers v3
 *
 * Environment variables required:
 *   AMADEUS_API_KEY
 *   AMADEUS_API_SECRET
 */

const BASE_URL = 'https://test.api.amadeus.com';
const TOKEN_ENDPOINT = `${BASE_URL}/v1/security/oauth2/token`;

// ---------------------------------------------------------------------------
// Token cache
// ---------------------------------------------------------------------------

let cachedToken = null;
let tokenExpiresAt = 0; // epoch ms

/**
 * Check whether the required Amadeus environment variables are set.
 */
export function isAmadeusConfigured() {
  return !!(process.env.AMADEUS_API_KEY && process.env.AMADEUS_API_SECRET);
}

/**
 * Obtain (or return a cached) OAuth2 access token from Amadeus using the
 * client_credentials grant type. The token is refreshed 60 seconds before
 * its actual expiry to avoid edge-case failures.
 */
export async function getAmadeusToken() {
  // Return cached token if still valid (with 60s safety margin)
  if (cachedToken && Date.now() < tokenExpiresAt - 60_000) {
    return cachedToken;
  }

  const apiKey = process.env.AMADEUS_API_KEY;
  const apiSecret = process.env.AMADEUS_API_SECRET;

  if (!apiKey || !apiSecret) {
    throw new Error(
      'Amadeus API credentials are not configured. Set AMADEUS_API_KEY and AMADEUS_API_SECRET environment variables.'
    );
  }

  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: apiKey,
      client_secret: apiSecret,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Amadeus token request failed (${response.status}): ${errorBody}`
    );
  }

  const data = await response.json();

  cachedToken = data.access_token;
  // expires_in is in seconds — convert to ms and add to current time
  tokenExpiresAt = Date.now() + data.expires_in * 1000;

  return cachedToken;
}

// ---------------------------------------------------------------------------
// In-memory response cache
// ---------------------------------------------------------------------------

const responseCache = new Map();

const CACHE_TTL = {
  flights: 5 * 60 * 1000,  // 5 minutes
  hotels: 15 * 60 * 1000,  // 15 minutes
};

/**
 * Return a cached value if it exists and has not expired, otherwise null.
 */
function getCached(key) {
  const entry = responseCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    responseCache.delete(key);
    return null;
  }
  return entry.data;
}

/**
 * Store a value in the cache with the given TTL (milliseconds).
 */
function setCache(key, data, ttl) {
  responseCache.set(key, { data, expiresAt: Date.now() + ttl });
}

// ---------------------------------------------------------------------------
// Authenticated request helper
// ---------------------------------------------------------------------------

/**
 * Make an authenticated GET request to the Amadeus API.
 * Automatically attaches the Bearer token.
 */
async function amadeusGet(path) {
  const token = await getAmadeusToken();

  const url = `${BASE_URL}${path}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Amadeus API error ${response.status} for ${path}: ${errorBody}`
    );
  }

  return response.json();
}

// ---------------------------------------------------------------------------
// Flight Offers Search v2
// ---------------------------------------------------------------------------

/**
 * Search for flight offers.
 *
 * @param {string} origin            - IATA origin airport code (e.g. "DEL")
 * @param {string} destination       - IATA destination airport code (e.g. "BOM")
 * @param {string} departureDate     - Departure date in YYYY-MM-DD format
 * @param {number} [adults=1]        - Number of adult travellers
 * @returns {Promise<object>}        - Amadeus Flight Offers response
 */
export async function searchFlights(origin, destination, departureDate, adults = 1) {
  if (!origin || !destination || !departureDate) {
    throw new Error('origin, destination, and departureDate are required');
  }

  const cacheKey = `flights:${origin}:${destination}:${departureDate}:${adults}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const params = new URLSearchParams({
    originLocationCode: origin.toUpperCase(),
    destinationLocationCode: destination.toUpperCase(),
    departureDate,
    adults: String(adults),
    max: '20',
    currencyCode: 'INR',
  });

  const data = await amadeusGet(`/v2/shopping/flight-offers?${params}`);
  setCache(cacheKey, data, CACHE_TTL.flights);
  return data;
}

// ---------------------------------------------------------------------------
// Hotel List by City v1
// ---------------------------------------------------------------------------

/**
 * Get a list of hotels in a given city.
 *
 * @param {string} cityCode   - IATA city code (e.g. "DEL")
 * @returns {Promise<object>} - Amadeus Hotel List response
 */
export async function searchHotelsByCity(cityCode) {
  if (!cityCode) {
    throw new Error('cityCode is required');
  }

  const cacheKey = `hotels-city:${cityCode}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const params = new URLSearchParams({
    cityCode: cityCode.toUpperCase(),
    radius: '30',
    radiusUnit: 'KM',
    hotelSource: 'ALL',
  });

  const data = await amadeusGet(`/v1/reference-data/locations/hotels/by-city?${params}`);
  setCache(cacheKey, data, CACHE_TTL.hotels);
  return data;
}

// ---------------------------------------------------------------------------
// Hotel Offers v3
// ---------------------------------------------------------------------------

/**
 * Get pricing / offers for specific hotels.
 *
 * @param {string|string[]} hotelIds - One or more Amadeus hotel IDs
 * @returns {Promise<object>}        - Amadeus Hotel Offers response
 */
export async function getHotelOffers(hotelIds) {
  if (!hotelIds) {
    throw new Error('hotelIds is required');
  }

  const ids = Array.isArray(hotelIds) ? hotelIds.join(',') : hotelIds;
  const cacheKey = `hotel-offers:${ids}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const params = new URLSearchParams({
    hotelIds: ids,
    adults: '1',
    currencyCode: 'INR',
  });

  const data = await amadeusGet(`/v3/shopping/hotel-offers?${params}`);
  setCache(cacheKey, data, CACHE_TTL.hotels);
  return data;
}
