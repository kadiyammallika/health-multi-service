import { NextResponse } from 'next/server';
import { query, isDatabaseConfigured } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Public read-only endpoint: returns all active master data for dropdowns
export async function GET(request) {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ success: true, airlines: [], airports: [], aircraft: [] });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // optional: 'airlines', 'airports', 'aircraft'

    const result = {};

    if (!type || type === 'airlines') {
      const airlines = await query(
        `SELECT id, airline_name, airline_code, logo_url FROM master_airlines WHERE is_active = true ORDER BY airline_name`
      );
      result.airlines = airlines.rows;
    }

    if (!type || type === 'airports') {
      const airports = await query(
        `SELECT id, airport_name, airport_code, city, state, country FROM master_airports WHERE is_active = true ORDER BY city, airport_name`
      );
      result.airports = airports.rows;
    }

    if (!type || type === 'aircraft') {
      const aircraft = await query(
        `SELECT id, aircraft_name, aircraft_code, manufacturer FROM master_aircraft WHERE is_active = true ORDER BY manufacturer, aircraft_name`
      );
      result.aircraft = aircraft.rows;
    }

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('Master data fetch error:', error.message);
    return NextResponse.json({ success: false, error: 'Failed to fetch master data' }, { status: 500 });
  }
}
