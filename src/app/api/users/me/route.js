import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request) {
  try {
    const authData = await getAuthenticatedUser(request);

    if (!authData) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: No valid session token.' },
        { status: 401 }
      );
    }

    if (!authData.accountInfo?.identified) {
      return NextResponse.json(
        {
          success: false,
          error: authData.accountInfo?.error || 'Account access restricted: Profile verification failed.',
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      user: { ...authData.user, roles: authData.accountInfo.roles || [authData.user.accountType] },
    });
  } catch (error) {
    console.error('Error fetching current user:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error.' },
      { status: 500 }
    );
  }
}
