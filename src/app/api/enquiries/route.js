import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET — Fetch user's property enquiries
export async function GET(request) {
  try {
    const authUser = await getAuthenticatedUser(request);
    if (!authUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const result = await query(
      `SELECT * FROM property_enquiries WHERE user_id = $1 ORDER BY created_at DESC`,
      [authUser.id]
    );

    return NextResponse.json({ success: true, enquiries: result.rows });
  } catch (error) {
    console.error('Fetch enquiries error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST — Create a new property enquiry
export async function POST(request) {
  try {
    const authUser = await getAuthenticatedUser(request);
    if (!authUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      propertyTitle, propertyLocation, purpose, priceDisplay,
      enquiryType, preferredDate, preferredTime, message,
      agentName, agentEmail
    } = body;

    if (!propertyTitle) {
      return NextResponse.json({ success: false, error: 'Property title is required.' }, { status: 400 });
    }

    const result = await query(
      `INSERT INTO property_enquiries (
        user_id, property_title, property_location, purpose, price_display,
        enquiry_type, preferred_date, preferred_time, message, agent_name, agent_email, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'Received')
      RETURNING *`,
      [
        authUser.id,
        propertyTitle,
        propertyLocation || null,
        purpose || 'buy',
        priceDisplay || null,
        enquiryType || 'General Enquiry',
        preferredDate || null,
        preferredTime || null,
        message || null,
        agentName || null,
        agentEmail || null,
      ]
    );

    return NextResponse.json({ success: true, enquiry: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error('Create enquiry error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
