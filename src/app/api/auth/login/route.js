import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import {
  comparePassword,
  signAccessToken,
  createRefreshToken,
  identifyAccountType,
  formatSafeUser,
  ACCESS_TOKEN_EXPIRY_SECONDS,
  REFRESH_TOKEN_EXPIRY_SECONDS,
} from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // 1. Receive email and password
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = password || '';

    if (!cleanEmail || !cleanPassword) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    // 2. Find matching account in users table
    const userRes = await query(
      `SELECT * FROM users WHERE LOWER(email) = $1`,
      [cleanEmail]
    );

    if (userRes.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid email address or password.' },
        { status: 401 }
      );
    }

    const user = userRes.rows[0];

    // 3. Verify entered password using bcrypt
    const passwordMatch = await comparePassword(cleanPassword, user.password_hash);
    if (!passwordMatch) {
      return NextResponse.json(
        { success: false, error: 'Invalid email address or password.' },
        { status: 401 }
      );
    }

    // 4. Automatically identify account type by checking database records
    // Checks customer_profiles, provider_profiles, and admin_accounts
    const accountInfo = await identifyAccountType(user.id);

    // 8. If no valid account record exists, reject the login
    if (!accountInfo.identified) {
      return NextResponse.json(
        {
          success: false,
          error: 'No active profile record found associated with this account. Please register or contact support.',
        },
        { status: 403 }
      );
    }

    // 6. Check provider application status — block pending/rejected providers
    // If user has multiple roles (e.g. customer + provider), still allow login but flag provider status
    const isProvider = accountInfo.roles?.includes('provider');
    const providerPending = isProvider && accountInfo.applicationStatus === 'pending';
    const providerRejected = isProvider && accountInfo.applicationStatus === 'rejected';

    // If provider is the ONLY role, block login entirely
    if (isProvider && accountInfo.roles.length === 1) {
      if (providerPending) {
        return NextResponse.json(
          {
            success: false,
            isPendingProvider: true,
            status: 'pending',
            error: 'Your provider application is currently pending administrative verification. Please wait for platform approval before accessing the Provider Dashboard.',
          },
          { status: 403 }
        );
      }

      if (providerRejected) {
        return NextResponse.json(
          {
            success: false,
            isRejectedProvider: true,
            status: 'rejected',
            error: 'Your provider partnership application was reviewed and not approved by administration.',
          },
          { status: 403 }
        );
      }
    }

    // 10. Generate signed JWT access token (Contains ONLY user ID; NO role claim!)
    const accessToken = signAccessToken(user.id);

    // Generate rotated refresh token stored securely in the database
    const refreshToken = await createRefreshToken(user.id);

    // 12. Format safe user data (exclude password_hash)
    const safeUser = formatSafeUser(user, accountInfo);

    // 13. Formulate redirect response to appropriate dashboard
    const response = NextResponse.json({
      success: true,
      message: 'Authentication successful.',
      user: { ...safeUser, roles: accountInfo.roles || [safeUser.accountType], applicationStatus: accountInfo.applicationStatus || null },
      redirectUrl: accountInfo.redirectUrl,
    });

    // 11. Store authentication tokens using secure HttpOnly cookies
    response.cookies.set({
      name: 'access_token',
      value: accessToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: ACCESS_TOKEN_EXPIRY_SECONDS,
    });

    response.cookies.set({
      name: 'refresh_token',
      value: refreshToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: REFRESH_TOKEN_EXPIRY_SECONDS,
    });

    return response;
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Server error during login.' },
      { status: 500 }
    );
  }
}
