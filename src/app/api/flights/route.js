import { NextResponse } from 'next/server';
import { query, isDatabaseConfigured } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const depIata = searchParams.get('dep_iata') || '';
    const arrIata = searchParams.get('arr_iata') || '';
    const includeExternal = searchParams.get('include_external') !== 'false';

    const providerFlights = [];
    const liveFlights = [];

    // 1. Fetch provider-added flights from database (approved providers only)
    if (isDatabaseConfigured()) {
      try {
        const result = await query(
          `SELECT
            pl.*, pp.business_name as provider_business,
            ma.airline_name, ma.airline_code AS master_airline_code,
            dep.airport_name AS dep_airport_name, dep.airport_code AS dep_airport_code, dep.city AS dep_city,
            arr.airport_name AS arr_airport_name, arr.airport_code AS arr_airport_code, arr.city AS arr_city,
            ac.aircraft_name AS master_aircraft_name, ac.aircraft_code AS master_aircraft_code
          FROM provider_listings pl
          JOIN users u ON pl.provider_id = u.id
          JOIN provider_profiles pp ON pp.user_id = u.id AND pp.application_status = 'approved'
          LEFT JOIN master_airlines ma ON ma.id = (pl.details->>'airline_id')::uuid
          LEFT JOIN master_airports dep ON dep.id = (pl.details->>'departure_airport_id')::uuid
          LEFT JOIN master_airports arr ON arr.id = (pl.details->>'arrival_airport_id')::uuid
          LEFT JOIN master_aircraft ac ON ac.id = (pl.details->>'aircraft_id')::uuid
          WHERE pl.service_type = 'flights' AND pl.status = 'active'
          ORDER BY pl.created_at DESC`
        );

        for (const row of result.rows) {
          const d = typeof row.details === 'string' ? JSON.parse(row.details) : (row.details || {});

          const airline = row.airline_name || d.airline_custom || d.airlineName || d.airline || row.title;
          const airlineCode = row.master_airline_code || (d.flightNumber || '').split('-')[0] || '';
          const fromCity = row.dep_city || d.departure_airport_custom || d.from || d.fromCity || '';
          const toCity = row.arr_city || d.arrival_airport_custom || d.to || d.toCity || '';
          const fromCode = row.dep_airport_code || fromCity.substring(0, 3).toUpperCase();
          const toCode = row.arr_airport_code || toCity.substring(0, 3).toUpperCase();
          const aircraft = row.master_aircraft_name || d.aircraft_custom || d.aircraftType || d.aircraft || '';

          providerFlights.push({
            id: `pl-${row.id}`,
            listingId: row.id,
            providerId: row.provider_id,
            providerName: row.provider_business,
            airline,
            logo: getAirlineLogo(airline),
            airlineCode,
            flightNumber: d.flightNumber || '',
            from: fromCode,
            to: toCode,
            fromCity,
            toCity,
            fromAirport: row.dep_airport_name || '',
            toAirport: row.arr_airport_name || '',
            departureTime: d.departureTime || '',
            arrivalTime: d.arrivalTime || '',
            duration: d.duration || '',
            stops: d.stops || 'Non-stop',
            stopCount: d.stops === 'Non-stop' ? 0 : d.stops === '1 Stop' ? 1 : 2,
            price: parseFloat(row.price) || 0,
            availableSeats: parseInt(d.availableSeats) || 180,
            aircraft,
            image: d.imageUrl || null,
            source: 'provider',
            baggage: d.baggage || '15 Kg Check-in + 7 Kg Cabin',
            meal: d.meal || 'Not Included',
            flightClass: d.class || 'Economy',
            refundable: d.refundable || 'Non-Refundable',
          });
        }
      } catch (dbErr) {
        console.error('DB query error:', dbErr.message);
      }
    }

    // 2. Get live flight data from AviationStack API (free tier)
    if (includeExternal && process.env.AVIATIONSTACK_API_KEY) {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ||
          (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : `http://localhost:${process.env.PORT || 3000}`);
        const extParams = new URLSearchParams({ limit: '30' });
        if (depIata) extParams.append('dep_iata', depIata);
        if (arrIata) extParams.append('arr_iata', arrIata);

        const extRes = await fetch(`${baseUrl}/api/external/flights?${extParams.toString()}`);
        const extData = await extRes.json();

        if (extData.success && extData.flights) {
          liveFlights.push(...extData.flights.map(f => ({
            ...f,
            price: f.price || estimatePrice(f.from, f.to, f.airline),
            availableSeats: f.availableSeats || Math.floor(20 + Math.random() * 130),
            source: 'aviationstack',
          })));
        }
      } catch (extErr) {
        console.error('AviationStack API error:', extErr.message);
      }
    }

    // 3. Merge: provider flights first, then AviationStack live data
    const allFlights = [...providerFlights, ...liveFlights];

    // 4. Build airports list from master table
    let airports = [];
    if (isDatabaseConfigured()) {
      try {
        const airportResult = await query(
          `SELECT airport_code AS code, city, airport_name AS name FROM master_airports WHERE is_active = true ORDER BY city`
        );
        airports = airportResult.rows;
      } catch (e) {
        // fallback
      }
    }

    return NextResponse.json({
      success: true,
      flights: allFlights,
      airports,
      counts: {
        provider: providerFlights.length,
        aviationstack: liveFlights.length,
        total: allFlights.length,
      },
      dataSources: [
        ...(liveFlights.length > 0 ? ['AviationStack API (Free Tier)'] : []),
        ...(providerFlights.length > 0 ? ['OneConnect Provider Listings'] : []),
      ]
    });
  } catch (error) {
    console.error('Flights API error:', error.message);
    return NextResponse.json({ success: true, flights: [], airports: [] });
  }
}

const CARRIER_NAMES = {
  '6E': 'IndiGo', 'AI': 'Air India', 'UK': 'Vistara', 'SG': 'SpiceJet',
  'QP': 'Akasa Air', 'IX': 'Air India Express', '9I': 'Alliance Air', 'G8': 'Go First',
  'EK': 'Emirates', 'QR': 'Qatar Airways', 'SQ': 'Singapore Airlines', 'BA': 'British Airways',
  'LH': 'Lufthansa', 'AA': 'American Airlines', 'TG': 'Thai Airways',
};

function getAirlineLogo(airline) {
  const logos = {
    'IndiGo': '🛫', 'Air India': '👑', 'Vistara': '🪶',
    'SpiceJet': '🌶️', 'Akasa Air': '🟠', 'Air India Express': '✈️',
    'Alliance Air': '🛩️', 'Go First': '🔵',
  };
  return logos[airline] || '✈️';
}

function estimatePrice(from, to, airline) {
  const routePrices = {
    'DEL-BOM': 4500, 'BOM-DEL': 4500, 'DEL-BLR': 5200, 'BLR-DEL': 5200,
    'DEL-MAA': 5000, 'MAA-DEL': 5000, 'DEL-HYD': 4800, 'HYD-DEL': 4800,
    'BOM-BLR': 3800, 'BLR-BOM': 3800, 'BOM-GOI': 2800, 'GOI-BOM': 2800,
  };
  let base = routePrices[`${from}-${to}`] || 4000;
  const premium = ['Vistara', 'Air India'];
  if (airline && premium.some(a => airline.includes(a))) base = Math.round(base * 1.3);
  return Math.round(base * (0.85 + Math.random() * 0.30));
}
