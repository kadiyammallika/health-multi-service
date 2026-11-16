import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// In-memory cache to save API calls (free tier = 100/month)
let flightCache = {};
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

// Airline logo mapping
const AIRLINE_LOGOS = {
  '6E': { name: 'IndiGo', emoji: '🛫', color: 'indigo' },
  'AI': { name: 'Air India', emoji: '👑', color: 'red' },
  'UK': { name: 'Vistara', emoji: '🪶', color: 'purple' },
  'SG': { name: 'SpiceJet', emoji: '🌶️', color: 'yellow' },
  'QP': { name: 'Akasa Air', emoji: '🟠', color: 'orange' },
  'IX': { name: 'Air India Express', emoji: '✈️', color: 'red' },
  '9I': { name: 'Alliance Air', emoji: '🛩️', color: 'blue' },
  'G8': { name: 'Go First', emoji: '🔵', color: 'blue' },
  'EK': { name: 'Emirates', emoji: '🏆', color: 'red' },
  'QR': { name: 'Qatar Airways', emoji: '🌍', color: 'purple' },
  'SQ': { name: 'Singapore Airlines', emoji: '🦁', color: 'blue' },
  'TG': { name: 'Thai Airways', emoji: '🇹🇭', color: 'purple' },
  'BA': { name: 'British Airways', emoji: '🇬🇧', color: 'blue' },
  'LH': { name: 'Lufthansa', emoji: '🇩🇪', color: 'blue' },
  'AA': { name: 'American Airlines', emoji: '🇺🇸', color: 'blue' },
};

export async function GET(request) {
  try {
    const apiKey = process.env.AVIATIONSTACK_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'AviationStack API key not configured',
        message: 'Add AVIATIONSTACK_API_KEY to your .env file. Get a free key at https://aviationstack.com',
        flights: []
      });
    }

    const { searchParams } = new URL(request.url);
    const depIata = searchParams.get('dep_iata') || '';
    const arrIata = searchParams.get('arr_iata') || '';
    const airlineIata = searchParams.get('airline_iata') || '';
    const limit = searchParams.get('limit') || '50';

    // Build cache key
    const cacheKey = `${depIata}-${arrIata}-${airlineIata}`;

    // Check cache first (saves API calls!)
    if (flightCache[cacheKey] && (Date.now() - flightCache[cacheKey].timestamp) < CACHE_DURATION) {
      return NextResponse.json({
        success: true,
        flights: flightCache[cacheKey].data,
        source: 'cache',
        cached_at: new Date(flightCache[cacheKey].timestamp).toISOString(),
        message: 'Serving cached data (refreshes every 30 min to save API quota)'
      });
    }

    // Build AviationStack API URL
    const params = new URLSearchParams({
      access_key: apiKey,
      limit: limit,
    });
    if (depIata) params.append('dep_iata', depIata);
    if (arrIata) params.append('arr_iata', arrIata);
    if (airlineIata) params.append('airline_iata', airlineIata);

    const apiUrl = `http://api.aviationstack.com/v1/flights?${params.toString()}`;

    const response = await fetch(apiUrl, {
      next: { revalidate: 1800 } // 30 min Next.js cache
    });

    if (!response.ok) {
      throw new Error(`AviationStack API returned ${response.status}`);
    }

    const rawData = await response.json();

    if (rawData.error) {
      return NextResponse.json({
        success: false,
        error: rawData.error.message || 'API error',
        code: rawData.error.code,
        flights: []
      });
    }

    // Transform AviationStack data to our format
    const flights = (rawData.data || []).map((flight, index) => {
      const airlineIataCode = flight.airline?.iata || '';
      const airlineInfo = AIRLINE_LOGOS[airlineIataCode] || {};

      const depTime = flight.departure?.scheduled ? new Date(flight.departure.scheduled) : null;
      const arrTime = flight.arrival?.scheduled ? new Date(flight.arrival.scheduled) : null;

      // Calculate duration
      let duration = '';
      if (depTime && arrTime) {
        const diffMs = arrTime - depTime;
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        duration = `${hours}h ${mins.toString().padStart(2, '0')}m`;
      }

      // Format time to 12-hour
      const formatTime = (date) => {
        if (!date) return '';
        let hours = date.getHours();
        const mins = date.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        return `${hours}:${mins} ${ampm}`;
      };

      return {
        id: `ext-${index}-${flight.flight?.iata || index}`,
        airline: flight.airline?.name || airlineInfo.name || 'Unknown Airline',
        airlineCode: airlineIataCode,
        flightNumber: flight.flight?.iata || flight.flight?.icao || '',
        from: flight.departure?.iata || '',
        to: flight.arrival?.iata || '',
        fromCity: flight.departure?.airport || '',
        toCity: flight.arrival?.airport || '',
        fromAirport: flight.departure?.airport || '',
        toAirport: flight.arrival?.airport || '',
        departureTime: formatTime(depTime),
        arrivalTime: formatTime(arrTime),
        duration: duration,
        stops: 'Non-stop', // AviationStack free tier doesn't provide stop info
        stopCount: 0,
        price: 0, // External flights don't have our pricing — will be estimated
        aircraft: flight.aircraft?.registration || '',
        availableSeats: 0, // Not available from free tier
        logo: airlineInfo.emoji || '✈️',
        image: null,
        flightDate: flight.flight_date || '',
        status: flight.flight_status || 'scheduled',
        source: 'aviationstack', // Mark as external data
        // Raw data for debugging
        _raw: {
          departure_terminal: flight.departure?.terminal,
          departure_gate: flight.departure?.gate,
          arrival_terminal: flight.arrival?.terminal,
          arrival_gate: flight.arrival?.gate,
          delay: flight.departure?.delay || flight.arrival?.delay,
        }
      };
    });

    // Cache the results
    flightCache[cacheKey] = {
      data: flights,
      timestamp: Date.now()
    };

    return NextResponse.json({
      success: true,
      flights,
      total: rawData.pagination?.total || flights.length,
      source: 'aviationstack_live',
      message: `Found ${flights.length} real flights from AviationStack`
    });

  } catch (error) {
    console.error('External flights API error:', error.message);
    return NextResponse.json({
      success: false,
      error: error.message,
      flights: []
    });
  }
}
