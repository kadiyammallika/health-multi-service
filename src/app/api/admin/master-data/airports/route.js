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
    const result = await query('SELECT * FROM master_airports ORDER BY city, airport_name');
    return NextResponse.json({ success: true, airports: result.rows });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  const auth = await verifyAdmin(request);
  if (auth.error) return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });

  try {
    const body = await request.json();
    const { airport_name, airport_code, city, state, country } = body;

    if (!airport_name?.trim() || !airport_code?.trim() || !city?.trim()) {
      return NextResponse.json({ success: false, error: 'Airport name, code, and city are required' }, { status: 400 });
    }

    const existing = await query('SELECT id FROM master_airports WHERE LOWER(airport_code) = LOWER($1)', [airport_code.trim()]);
    if (existing.rows.length > 0) {
      return NextResponse.json({ success: false, error: `Airport code "${airport_code}" already exists` }, { status: 409 });
    }

    const result = await query(
      'INSERT INTO master_airports (airport_name, airport_code, city, state, country) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [airport_name.trim(), airport_code.trim().toUpperCase(), city.trim(), state?.trim() || null, country?.trim() || 'India']
    );

    return NextResponse.json({ success: true, airport: result.rows[0] }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  const auth = await verifyAdmin(request);
  if (auth.error) return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });

  try {
    const body = await request.json();
    const { id, airport_name, airport_code, city, state, country, is_active } = body;

    if (!id) return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });

    if (airport_code) {
      const existing = await query('SELECT id FROM master_airports WHERE LOWER(airport_code) = LOWER($1) AND id != $2', [airport_code.trim(), id]);
      if (existing.rows.length > 0) {
        return NextResponse.json({ success: false, error: `Airport code "${airport_code}" already exists` }, { status: 409 });
      }
    }

    const result = await query(
      `UPDATE master_airports SET
        airport_name = COALESCE($1, airport_name),
        airport_code = COALESCE($2, airport_code),
        city = COALESCE($3, city),
        state = COALESCE($4, state),
        country = COALESCE($5, country),
        is_active = COALESCE($6, is_active)
      WHERE id = $7 RETURNING *`,
      [airport_name?.trim(), airport_code?.trim()?.toUpperCase(), city?.trim(), state?.trim(), country?.trim(), is_active, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Airport not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, airport: result.rows[0] });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
