import { NextResponse } from 'next/server';
import { revokeRefreshToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const cookie = request.cookies.get('refresh_token');
    const rawRefreshToken = typeof cookie === 'object' && cookie !== null ? cookie.value : cookie;

    if (rawRefreshToken) {
      await revokeRefreshToken(rawRefreshToken);
    }

    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully.',
    });

    // Clear HttpOnly auth cookies
    response.cookies.set({
      name: 'access_token',
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });

    response.cookies.set({
      name: 'refresh_token',
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, error: 'Error during logout.' },
      { status: 500 }
    );
  }
}
