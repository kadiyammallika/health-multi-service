import { NextResponse } from 'next/server';
import { getClient } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request) {
  let client;
  try {
    const body = await request.json();
    const {
      businessName,
      category,
      categoryLabel,
      services,
      contactPerson,
      email,
      phone,
      password,
      licenseNumber,
      yearsInBusiness,
      address,
      specialization,
    } = body;

    // 1. Validation
    if (!businessName || !businessName.trim()) {
      return NextResponse.json(
        { success: false, error: 'Business name is required.' },
        { status: 400 }
      );
    }

    if (!contactPerson || !contactPerson.trim()) {
      return NextResponse.json(
        { success: false, error: 'Authorized contact person name is required.' },
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

    if (!password || password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters in length.' },
        { status: 400 }
      );
    }

    client = await getClient();
    await client.query('BEGIN');

    // 2. Check existing user
    const existing = await client.query(
      `SELECT id, name, email, phone FROM users WHERE LOWER(email) = $1`,
      [cleanEmail]
    );

    let newUser;

    if (existing.rows.length > 0) {
      // User already exists (e.g., registered as customer). Check if already a provider.
      newUser = existing.rows[0];

      const existingProvider = await client.query(
        `SELECT id FROM provider_profiles WHERE user_id = $1`,
        [newUser.id]
      );

      if (existingProvider.rows.length > 0) {
        await client.query('ROLLBACK');
        return NextResponse.json(
          { success: false, error: 'You are already registered as a provider. Please log in instead.' },
          { status: 409 }
        );
      }

      // Verify password for existing account
      const fullUser = await client.query(`SELECT password_hash FROM users WHERE id = $1`, [newUser.id]);
      const { comparePassword: comparePass } = await import('@/lib/auth');
      const passwordMatch = await comparePass(password, fullUser.rows[0].password_hash);
      if (!passwordMatch) {
        await client.query('ROLLBACK');
        return NextResponse.json(
          { success: false, error: 'An account with this email already exists. Please enter the correct password for your existing account to add provider access.' },
          { status: 401 }
        );
      }
    } else {
      // 3. Hash password using bcrypt
      const passwordHash = await hashPassword(password);

      // 4. Create common user account in users table
      const userRes = await client.query(
        `INSERT INTO users (name, email, phone, password_hash)
         VALUES ($1, $2, $3, $4)
         RETURNING id, name, email, phone, created_at`,
        [contactPerson.trim(), cleanEmail, phone ? phone.trim() : null, passwordHash]
      );

      newUser = userRes.rows[0];
    }

    // 5. Create provider profile with application_status = 'pending'
    const validServices = Array.isArray(services) && services.length > 0
      ? services
      : [category || 'wellness'];

    const profileRes = await client.query(
      `INSERT INTO provider_profiles (
         user_id, business_name, category, category_label,
         license_number, years_in_business, address, specialization,
         application_status, services
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending', $9)
       RETURNING id, business_name, category, application_status, services, created_at`,
      [
        newUser.id,
        businessName.trim(),
        category || validServices[0],
        categoryLabel || 'Service Provider',
        licenseNumber ? licenseNumber.trim() : null,
        Number(yearsInBusiness) || 0,
        address ? address.trim() : null,
        specialization ? specialization.trim() : null,
        JSON.stringify(validServices),
      ]
    );

    await client.query('COMMIT');

    const providerProfile = profileRes.rows[0];

    return NextResponse.json(
      {
        success: true,
        message: 'Provider registration submitted! Your application is pending admin approval.',
        applicationStatus: 'pending',
        provider: {
          id: providerProfile.id,
          userId: newUser.id,
          businessName: providerProfile.business_name,
          category: providerProfile.category,
          services: providerProfile.services,
          status: providerProfile.application_status,
          email: newUser.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (client) {
      try {
        await client.query('ROLLBACK');
      } catch (e) {}
    }
    console.error('Provider registration error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Server error during provider onboarding.' },
      { status: 500 }
    );
  } finally {
    if (client) {
      client.release();
    }
  }
}
