import { NextResponse } from 'next/server';
import { getClient } from '@/lib/db';
import {
  hashPassword,
  signAccessToken,
  createRefreshToken,
  identifyAccountType,
  formatSafeUser,
  ACCESS_TOKEN_EXPIRY_SECONDS,
  REFRESH_TOKEN_EXPIRY_SECONDS,
} from '@/lib/auth';
import nodemailer from 'nodemailer';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request) {
  let client;
  try {
    const body = await request.json();
    const { name, email, phone, password } = body;

    // 1. Validation
    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Full name is required.' },
        { status: 400 }
      );
    }

    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      return NextResponse.json(
        { success: false, error: 'A valid email address is required.' },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters in length.' },
        { status: 400 }
      );
    }

    client = await getClient();
    await client.query('BEGIN');

    // 2. Check if email already exists
    const existing = await client.query(
      `SELECT id FROM users WHERE LOWER(email) = $1`,
      [cleanEmail]
    );

    if (existing.rows.length > 0) {
      await client.query('ROLLBACK');
      return NextResponse.json(
        { success: false, error: 'An account with this email address already exists. Please log in instead.' },
        { status: 409 }
      );
    }

    // 3. Hash password using bcrypt
    const passwordHash = await hashPassword(password);

    // 4. Insert common user account
    const userRes = await client.query(
      `INSERT INTO users (name, email, phone, password_hash)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, phone, created_at, updated_at`,
      [name.trim(), cleanEmail, phone ? phone.trim() : null, passwordHash]
    );

    const newUser = userRes.rows[0];

    // 5. Create customer_profiles record
    // Customer identity is purely established by the presence of this record.
    await client.query(
      `INSERT INTO customer_profiles (user_id)
       VALUES ($1)`,
      [newUser.id]
    );

    // 6. Generate Session Tokens (JWT access token + DB refresh token)
    // Note: The JWT access token contains ONLY sub: newUser.id (NO role claim!)
    const accessToken = signAccessToken(newUser.id);
    const refreshToken = await createRefreshToken(newUser.id, client);

    await client.query('COMMIT');

    const accountInfo = await identifyAccountType(newUser.id);
    const safeUser = formatSafeUser(newUser, accountInfo);

    // Send welcome email (fire-and-forget — don't block registration)
    try {
      const gmailUser = process.env.GMAIL_USER;
      const gmailPass = process.env.GMAIL_APP_PASSWORD;
      if (gmailUser && gmailPass) {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: { user: gmailUser, pass: gmailPass },
        });
        await transporter.sendMail({
          from: `"OneConnect" <${gmailUser}>`,
          to: cleanEmail,
          subject: 'Welcome to OneConnect! Your Account is Ready',
          html: `
            <div style="max-width:520px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
              <div style="background:linear-gradient(135deg,#4f46e5,#0d9488);padding:36px 24px;text-align:center;">
                <h1 style="color:#fff;font-size:28px;font-weight:800;margin:0;letter-spacing:-0.5px;">One<span style="color:#fbbf24;">Connect</span></h1>
                <p style="color:#c7d2fe;font-size:13px;margin:8px 0 0;">Multi-Service Marketplace</p>
              </div>
              <div style="padding:32px 24px;">
                <h2 style="color:#1e293b;font-size:20px;margin:0 0 12px;">Welcome, ${name.trim()}!</h2>
                <p style="color:#64748b;font-size:14px;line-height:1.7;margin:0 0 20px;">
                  Your OneConnect account has been created successfully. You can now explore and book services across our platform.
                </p>
                <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin:20px 0;">
                  <h3 style="font-size:13px;text-transform:uppercase;letter-spacing:1px;color:#64748b;margin:0 0 14px;font-weight:600;">What You Can Do</h3>
                  <p style="color:#4a5568;font-size:14px;padding:6px 0;margin:0;">✈️ Book Flights across India</p>
                  <p style="color:#4a5568;font-size:14px;padding:6px 0;margin:0;">🚌 Reserve Bus Tickets</p>
                  <p style="color:#4a5568;font-size:14px;padding:6px 0;margin:0;">🏨 Stay at Top Hotels</p>
                  <p style="color:#4a5568;font-size:14px;padding:6px 0;margin:0;">🌿 Health & Healing Sessions</p>
                  <p style="color:#4a5568;font-size:14px;padding:6px 0;margin:0;">🏡 Explore Properties</p>
                </div>
                <div style="text-align:center;margin:28px 0;">
                  <a href="#" style="display:inline-block;background:linear-gradient(135deg,#4f46e5,#4338ca);color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:10px;font-weight:700;font-size:14px;">
                    Explore Services
                  </a>
                </div>
                <p style="color:#94a3b8;font-size:12px;line-height:1.5;text-align:center;margin:20px 0 0;">
                  If you didn't create this account, please ignore this email.
                </p>
              </div>
              <div style="background:#f8fafc;padding:20px 24px;text-align:center;border-top:1px solid #e2e8f0;">
                <p style="font-size:12px;color:#94a3b8;margin:0;">&copy; ${new Date().getFullYear()} OneConnect. All rights reserved.</p>
              </div>
            </div>
          `,
        });
        console.log('Welcome email sent to:', cleanEmail);
      }
    } catch (emailErr) {
      console.error('Welcome email failed (non-blocking):', emailErr.message);
    }

    const response = NextResponse.json(
      {
        success: true,
        message: 'Account registered successfully.',
        user: { ...safeUser, roles: accountInfo.roles || ['customer'] },
        redirectUrl: '/dashboard/customer',
      },
      { status: 201 }
    );

    // 7. Store authentication tokens in secure HttpOnly cookies
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
    if (client) {
      try {
        await client.query('ROLLBACK');
      } catch (rbError) {
        // Ignore rollback failure
      }
    }
    console.error('Registration API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Server error during registration.' },
      { status: 500 }
    );
  } finally {
    if (client) {
      client.release();
    }
  }
}
