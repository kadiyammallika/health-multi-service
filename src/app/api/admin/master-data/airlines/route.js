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

// GET all airlines (admin - includes inactive)
export async function GET(request) {
  const auth = await verifyAdmin(request);
  if (auth.error) return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });

  try {
    const result = await query('SELECT * FROM master_airlines ORDER BY airline_name');
    return NextResponse.json({ success: true, airlines: result.rows });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST create new airline
export async function POST(request) {
  const auth = await verifyAdmin(request);
  if (auth.error) return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });

  try {
    const body = await request.json();
    const { airline_name, airline_code, logo_url } = body;

    if (!airline_name?.trim() || !airline_code?.trim()) {
      return NextResponse.json({ success: false, error: 'Airline name and code are required' }, { status: 400 });
    }

    // Check for duplicate code
    const existing = await query('SELECT id FROM master_airlines WHERE LOWER(airline_code) = LOWER($1)', [airline_code.trim()]);
    if (existing.rows.length > 0) {
      return NextResponse.json({ success: false, error: `Airline code "${airline_code}" already exists` }, { status: 409 });
    }

    const result = await query(
      'INSERT INTO master_airlines (airline_name, airline_code, logo_url) VALUES ($1, $2, $3) RETURNING *',
      [airline_name.trim(), airline_code.trim().toUpperCase(), logo_url || null]
    );

    return NextResponse.json({ success: true, airline: result.rows[0] }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT update airline
export async function PUT(request) {
  const auth = await verifyAdmin(request);
  if (auth.error) return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });

  try {
    const body = await request.json();
    const { id, airline_name, airline_code, logo_url, is_active } = body;

    if (!id) return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });

    // Check for duplicate code (excluding self)
    if (airline_code) {
      const existing = await query('SELECT id FROM master_airlines WHERE LOWER(airline_code) = LOWER($1) AND id != $2', [airline_code.trim(), id]);
      if (existing.rows.length > 0) {
        return NextResponse.json({ success: false, error: `Airline code "${airline_code}" already exists` }, { status: 409 });
      }
    }

    const result = await query(
      `UPDATE master_airlines SET
        airline_name = COALESCE($1, airline_name),
        airline_code = COALESCE($2, airline_code),
        logo_url = COALESCE($3, logo_url),
        is_active = COALESCE($4, is_active)
      WHERE id = $5 RETURNING *`,
      [airline_name?.trim(), airline_code?.trim()?.toUpperCase(), logo_url, is_active, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Airline not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, airline: result.rows[0] });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
