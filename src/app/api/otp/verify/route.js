import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json({ success: false, error: 'Email and code are required.' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.trim();

    // Verify against our otp_verifications table
    const result = await query(
      'SELECT * FROM otp_verifications WHERE email = $1 ORDER BY created_at DESC LIMIT 1',
      [cleanEmail]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No verification code found. Please request a new one.' },
        { status: 400 }
      );
    }

    const record = result.rows[0];

    // Check expiry
    if (new Date(record.expires_at) < new Date()) {
      await query('DELETE FROM otp_verifications WHERE email = $1', [cleanEmail]);
      return NextResponse.json(
        { success: false, error: 'Code expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Check attempts (max 5)
    if (record.attempts >= 5) {
      await query('DELETE FROM otp_verifications WHERE email = $1', [cleanEmail]);
      return NextResponse.json(
        { success: false, error: 'Too many attempts. Please request a new code.' },
        { status: 429 }
      );
    }

    // Increment attempts
    await query(
      'UPDATE otp_verifications SET attempts = attempts + 1 WHERE id = $1',
      [record.id]
    );

    // Verify OTP
    if (record.otp_code !== cleanOtp) {
      const remaining = 4 - record.attempts;
      return NextResponse.json(
        { success: false, error: `Invalid code. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.` },
        { status: 400 }
      );
    }

    // OTP verified — delete it
    await query('DELETE FROM otp_verifications WHERE email = $1', [cleanEmail]);

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully!',
      verified: true,
    });
  } catch (error) {
    console.error('OTP verify error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
