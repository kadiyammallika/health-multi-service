import { NextResponse } from 'next/server';
import { query, getClient } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';

async function getProviderUserId(request) {
  try {
    const authData = await getAuthenticatedUser(request);
    if (!authData) {
      console.error('Provider auth: No authenticated user found');
      return null;
    }
    const userId = authData.id;
    if (!userId) {
      console.error('Provider auth: No userId in auth data');
      return null;
    }
    // Check if user has an approved provider profile
    const check = await query(
      `SELECT pp.user_id, pp.application_status FROM provider_profiles pp WHERE pp.user_id = $1`,
      [userId]
    );
    if (check.rows.length === 0) {
      console.error('Provider auth: No provider profile found for userId:', userId);
      return null;
    }
    const status = check.rows[0].application_status;
    if (status !== 'approved') {
      console.error('Provider auth: Provider status is', status, '- must be approved by admin');
      return null;
    }
    return userId;
  } catch (err) {
    console.error('Provider auth error:', err.message);
    return null;
  }
}

// GET - Fetch all listings for the current provider
export async function GET(request) {
  try {
    const userId = await getProviderUserId(request);
    console.log('GET /api/provider/listings — userId:', userId);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized — please log out and log back in as a provider' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const serviceType = searchParams.get('service_type');
    console.log('GET /api/provider/listings — serviceType:', serviceType);

    let sql = `SELECT * FROM provider_listings WHERE provider_id = $1`;
    const params = [userId];

    if (serviceType) {
      sql += ` AND service_type = $2`;
      params.push(serviceType);
    }

    sql += ` ORDER BY created_at DESC`;

    const result = await query(sql, params);
    console.log('GET /api/provider/listings — found:', result.rows.length, 'listings');
    return NextResponse.json({ listings: result.rows });
  } catch (err) {
    console.error('GET /api/provider/listings error:', err.message);
    return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 });
  }
}

// POST - Create a new listing
export async function POST(request) {
  try {
    const userId = await getProviderUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized — please log out and log back in as a provider' }, { status: 401 });
    }

    const body = await request.json();
    const { service_type, title, description, details, price, status } = body;

    if (!service_type || !title) {
      return NextResponse.json({ error: 'service_type and title are required' }, { status: 400 });
    }

    // Verify provider has this service registered
    const providerCheck = await query(
      `SELECT services FROM provider_profiles WHERE user_id = $1`,
      [userId]
    );
    const services = providerCheck.rows[0]?.services || [];
    if (Array.isArray(services) && services.length > 0 && !services.includes(service_type)) {
      return NextResponse.json({ error: 'You are not registered for this service type' }, { status: 403 });
    }

    const result = await query(
      `INSERT INTO provider_listings (provider_id, service_type, title, description, details, price, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [userId, service_type, title, description || '', details ? JSON.stringify(details) : '{}', price || 0, status || 'active']
    );

    return NextResponse.json({ listing: result.rows[0] }, { status: 201 });
  } catch (err) {
    console.error('POST /api/provider/listings error:', err.message);
    return NextResponse.json({ error: 'Failed to create listing' }, { status: 500 });
  }
}

// PUT - Update a listing
export async function PUT(request) {
  try {
    const userId = await getProviderUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized — please log out and log back in as a provider' }, { status: 401 });
    }

    const body = await request.json();
    const { id, title, description, details, price, status } = body;

    if (!id) {
      return NextResponse.json({ error: 'Listing id is required' }, { status: 400 });
    }

    // Verify ownership
    const ownership = await query(
      `SELECT id FROM provider_listings WHERE id = $1 AND provider_id = $2`,
      [id, userId]
    );
    if (ownership.rows.length === 0) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    const result = await query(
      `UPDATE provider_listings
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           details = COALESCE($3, details),
           price = COALESCE($4, price),
           status = COALESCE($5, status)
       WHERE id = $6 AND provider_id = $7 RETURNING *`,
      [title, description, details ? JSON.stringify(details) : null, price, status, id, userId]
    );

    return NextResponse.json({ listing: result.rows[0] });
  } catch (err) {
    console.error('PUT /api/provider/listings error:', err.message);
    return NextResponse.json({ error: 'Failed to update listing' }, { status: 500 });
  }
}

// DELETE - Remove a listing
export async function DELETE(request) {
  try {
    const userId = await getProviderUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized — please log out and log back in as a provider' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Listing id is required' }, { status: 400 });
    }

    const result = await query(
      `DELETE FROM provider_listings WHERE id = $1 AND provider_id = $2 RETURNING id`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/provider/listings error:', err.message);
    return NextResponse.json({ error: 'Failed to delete listing' }, { status: 500 });
  }
}
