import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

async function verifyAdmin(request) {
  const authData = await getAuthenticatedUser(request);
  if (!authData) return { error: 'Unauthorized', status: 401 };
  if (authData.accountInfo?.accountType !== 'admin') return { error: 'Forbidden', status: 403 };
  return { authData };
}

export async function GET(request) {
  const auth = await verifyAdmin(request);
  if (auth.error) return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });

  try {
    const result = await query('SELECT * FROM master_aircraft ORDER BY manufacturer, aircraft_name');
    return NextResponse.json({ success: true, aircraft: result.rows });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  const auth = await verifyAdmin(request);
  if (auth.error) return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });

  try {
    const body = await request.json();
    const { aircraft_name, aircraft_code, manufacturer } = body;

    if (!aircraft_name?.trim() || !aircraft_code?.trim()) {
      return NextResponse.json({ success: false, error: 'Aircraft name and code are required' }, { status: 400 });
    }

    const existing = await query('SELECT id FROM master_aircraft WHERE LOWER(aircraft_code) = LOWER($1)', [aircraft_code.trim()]);
    if (existing.rows.length > 0) {
      return NextResponse.json({ success: false, error: `Aircraft code "${aircraft_code}" already exists` }, { status: 409 });
    }

    const result = await query(
      'INSERT INTO master_aircraft (aircraft_name, aircraft_code, manufacturer) VALUES ($1, $2, $3) RETURNING *',
      [aircraft_name.trim(), aircraft_code.trim().toUpperCase(), manufacturer?.trim() || null]
    );

    return NextResponse.json({ success: true, aircraft: result.rows[0] }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  const auth = await verifyAdmin(request);
  if (auth.error) return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });

  try {
    const body = await request.json();
    const { id, aircraft_name, aircraft_code, manufacturer, is_active } = body;

    if (!id) return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });

    if (aircraft_code) {
      const existing = await query('SELECT id FROM master_aircraft WHERE LOWER(aircraft_code) = LOWER($1) AND id != $2', [aircraft_code.trim(), id]);
      if (existing.rows.length > 0) {
        return NextResponse.json({ success: false, error: `Aircraft code "${aircraft_code}" already exists` }, { status: 409 });
      }
    }

    const result = await query(
      `UPDATE master_aircraft SET
        aircraft_name = COALESCE($1, aircraft_name),
        aircraft_code = COALESCE($2, aircraft_code),
        manufacturer = COALESCE($3, manufacturer),
        is_active = COALESCE($4, is_active)
      WHERE id = $5 RETURNING *`,
      [aircraft_name?.trim(), aircraft_code?.trim()?.toUpperCase(), manufacturer?.trim(), is_active, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Aircraft not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, aircraft: result.rows[0] });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
