import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import nodemailer from 'nodemailer';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Gmail SMTP transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ success: false, error: 'Valid email is required.' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if email already registered
    const existing = await query('SELECT id FROM users WHERE LOWER(email) = $1', [cleanEmail]);
    if (existing.rows.length > 0) {
      return NextResponse.json(
        { success: false, error: 'This email is already registered. Please login instead.' },
        { status: 409 }
      );
    }

    // Generate 6-digit OTP
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Store OTP in database
    await query('DELETE FROM otp_verifications WHERE email = $1', [cleanEmail]);
    await query(
      'INSERT INTO otp_verifications (email, otp_code, expires_at, attempts) VALUES ($1, $2, $3, 0)',
      [cleanEmail, otp, expiresAt.toISOString()]
    );

    // Send email via Gmail SMTP
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      return NextResponse.json(
        { success: false, error: 'Email service is not configured. Please contact support.' },
        { status: 500 }
      );
    }

    await transporter.sendMail({
      from: `"OneConnect" <${process.env.GMAIL_USER}>`,
      to: cleanEmail,
      subject: 'Your OneConnect Verification Code',
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0;">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-block; width: 48px; height: 48px; background: linear-gradient(135deg, #14b8a6, #059669); border-radius: 12px; line-height: 48px; font-size: 24px; color: white; font-weight: bold;">O</div>
            <h1 style="margin: 12px 0 4px; font-size: 22px; color: #0f172a;">OneConnect</h1>
            <p style="margin: 0; font-size: 13px; color: #64748b;">Partner Verification</p>
          </div>
          <p style="font-size: 15px; color: #334155; text-align: center;">Your verification code is:</p>
          <div style="text-align: center; margin: 24px 0;">
            <div style="display: inline-block; font-size: 36px; font-weight: 800; letter-spacing: 12px; color: #0f172a; background: #f1f5f9; padding: 16px 32px; border-radius: 12px; border: 2px dashed #cbd5e1;">${otp}</div>
          </div>
          <p style="font-size: 12px; color: #94a3b8; text-align: center;">This code expires in 10 minutes. Do not share it with anyone.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="font-size: 11px; color: #94a3b8; text-align: center;">If you didn't request this code, you can safely ignore this email.</p>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      method: 'otp',
      message: `Verification code sent to ${cleanEmail}. Please check your inbox.`,
      emailSent: true,
    });
  } catch (error) {
    console.error('OTP send error:', error);
    return NextResponse.json({ success: false, error: 'Failed to send verification email. Please try again.' }, { status: 500 });
  }
}
