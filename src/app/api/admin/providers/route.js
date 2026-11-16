import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request) {
  try {
    const authData = await getAuthenticatedUser(request);

    if (!authData) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Authentication required.' },
        { status: 401 }
      );
    }

    // Strictly enforce administrator verification from database
    if (authData.accountInfo?.accountType !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Access restricted strictly to platform administrators.' },
        { status: 403 }
      );
    }

    // Retrieve all providers with their contact user details
    const res = await query(`
      SELECT 
        p.id AS provider_id,
        p.user_id,
        p.business_name,
        p.category,
        p.category_label,
        p.license_number,
        p.years_in_business,
        p.address,
        p.specialization,
        p.application_status,
        p.services,
        p.created_at AS applied_at,
        p.updated_at,
        u.name AS contact_person,
        u.email,
        u.phone
      FROM provider_profiles p
      JOIN users u ON u.id = p.user_id
      ORDER BY p.created_at DESC
    `);

    return NextResponse.json({
      success: true,
      providers: res.rows,
    });
  } catch (error) {
    console.error('Fetch providers error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error fetching provider applications.' },
      { status: 500 }
    );
  }
}
