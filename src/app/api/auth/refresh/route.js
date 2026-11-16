import { NextResponse } from 'next/server';
import {
  rotateRefreshToken,
  ACCESS_TOKEN_EXPIRY_SECONDS,
  REFRESH_TOKEN_EXPIRY_SECONDS,
} from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request) {
  try {
    let rawRefreshToken = null;

    // Check cookies
    const cookie = request.cookies.get('refresh_token');
    if (cookie) {
      rawRefreshToken = typeof cookie === 'object' && cookie !== null ? cookie.value : cookie;
    }

    // Check body fallback
    if (!rawRefreshToken) {
      try {
        const body = await request.json();
        rawRefreshToken = body?.refreshToken;
      } catch (e) {}
    }

    if (!rawRefreshToken) {
      return NextResponse.json(
        { success: false, error: 'No refresh token provided.' },
        { status: 401 }
      );
    }

    // Rotate refresh token securely in PostgreSQL
    const { accessToken, refreshToken: newRefreshToken } = await rotateRefreshToken(rawRefreshToken);

    const response = NextResponse.json({
      success: true,
      message: 'Session token refreshed successfully.',
      accessToken,
    });

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
      value: newRefreshToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: REFRESH_TOKEN_EXPIRY_SECONDS,
    });

    return response;
  } catch (error) {
    console.error('Refresh token error:', error.message);
    const response = NextResponse.json(
      { success: false, error: 'Refresh token invalid or expired. Please sign in again.' },
      { status: 401 }
    );

    // Clear stale cookies
    response.cookies.set({
      name: 'access_token',
      value: '',
      path: '/',
      maxAge: 0,
    });
    response.cookies.set({
      name: 'refresh_token',
      value: '',
      path: '/',
      maxAge: 0,
    });

    return response;
  }
}
