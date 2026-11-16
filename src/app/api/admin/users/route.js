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
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (authData.accountInfo?.accountType !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    // Get all users with their account type info
    const res = await query(`
      SELECT
        u.id,
        u.name,
        u.email,
        u.phone,
        u.created_at,
        CASE
          WHEN a.id IS NOT NULL THEN 'admin'
          WHEN p.id IS NOT NULL THEN 'provider'
          WHEN c.id IS NOT NULL THEN 'customer'
          ELSE 'unknown'
        END AS account_type,
        p.business_name,
        p.application_status,
        p.category AS provider_category
      FROM users u
      LEFT JOIN admin_accounts a ON a.user_id = u.id
      LEFT JOIN provider_profiles p ON p.user_id = u.id
      LEFT JOIN customer_profiles c ON c.user_id = u.id
      ORDER BY u.created_at DESC
    `);

    return NextResponse.json({
      success: true,
      users: res.rows,
    });
  } catch (error) {
    console.error('Fetch users error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error fetching users' },
      { status: 500 }
    );
  }
}
