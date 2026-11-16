import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json({ error: 'Token and password are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    // Find valid token
    const tokenResult = await query(
      'SELECT id, user_id, expires_at, used FROM password_reset_tokens WHERE token = $1',
      [token]
    );

    if (tokenResult.rows.length === 0) {
      return NextResponse.json({ error: 'Invalid or expired reset link. Please request a new one.' }, { status: 400 });
    }

    const resetToken = tokenResult.rows[0];

    if (resetToken.used) {
      return NextResponse.json({ error: 'This reset link has already been used. Please request a new one.' }, { status: 400 });
    }

    if (new Date(resetToken.expires_at) < new Date()) {
      return NextResponse.json({ error: 'This reset link has expired. Please request a new one.' }, { status: 400 });
    }

    // Hash the new password
    const passwordHash = await bcrypt.hash(password, 12);

    // Update user's password
    await query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [
      passwordHash,
      resetToken.user_id,
    ]);

    // Mark token as used
    await query('UPDATE password_reset_tokens SET used = TRUE WHERE id = $1', [resetToken.id]);

    // Delete all other tokens for this user
    await query('DELETE FROM password_reset_tokens WHERE user_id = $1 AND id != $2', [
      resetToken.user_id,
      resetToken.id,
    ]);

    return NextResponse.json({ message: 'Password has been reset successfully. You can now sign in.' });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Failed to reset password. Please try again.' }, { status: 500 });
  }
}
