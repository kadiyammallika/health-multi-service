import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

export async function POST(request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Check if user exists
    const userResult = await query(
      'SELECT id, name, email FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    // Always return success (don't reveal if email exists)
    if (userResult.rows.length === 0) {
      return NextResponse.json({ message: 'If this email is registered, you will receive a reset link.' });
    }

    const user = userResult.rows[0];

    // Delete any existing tokens for this user
    await query('DELETE FROM password_reset_tokens WHERE user_id = $1', [user.id]);

    // Generate a secure token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Save token to database
    await query(
      'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, token, expiresAt]
    );

    // Build reset URL - use request origin so it works on mobile too
    const origin = request.headers.get('origin') || request.headers.get('referer')?.replace(/\/[^/]*$/, '') || '';
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || origin || `http://localhost:${process.env.PORT || 3000}`;
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;

    // Send email via Gmail SMTP
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"OneConnect" <${process.env.GMAIL_USER}>`,
      to: user.email,
      subject: 'Reset Your Password - OneConnect',
      html: `
        <div style="max-width:480px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
          <div style="background:linear-gradient(135deg,#4f46e5,#0d9488);padding:32px 24px;text-align:center;">
            <h1 style="color:#ffffff;font-size:24px;margin:0;">OneConnect</h1>
            <p style="color:#c7d2fe;font-size:13px;margin:8px 0 0;">Multi-Service Marketplace</p>
          </div>
          <div style="padding:32px 24px;">
            <h2 style="color:#1e293b;font-size:18px;margin:0 0 8px;">Reset Your Password</h2>
            <p style="color:#64748b;font-size:14px;line-height:1.6;margin:0 0 24px;">
              Hi <strong>${user.name || 'there'}</strong>, we received a request to reset your password. Click the button below to create a new password.
            </p>
            <div style="text-align:center;margin:24px 0;">
              <a href="${resetUrl}" style="display:inline-block;background:linear-gradient(135deg,#4f46e5,#4338ca);color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:700;font-size:14px;">
                Reset Password
              </a>
            </div>
            <p style="color:#94a3b8;font-size:12px;line-height:1.5;margin:24px 0 0;text-align:center;">
              This link expires in <strong>1 hour</strong>. If you didn't request this, you can safely ignore this email.
            </p>
            <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />
            <p style="color:#cbd5e1;font-size:11px;text-align:center;margin:0;">
              If the button doesn't work, copy and paste this link:<br/>
              <span style="color:#6366f1;word-break:break-all;">${resetUrl}</span>
            </p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ message: 'If this email is registered, you will receive a reset link.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Failed to process request. Please try again.' }, { status: 500 });
  }
}
