import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { query, getClient } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'auralife-default-dev-access-token-secret-32-chars';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'auralife-default-dev-refresh-token-secret-32-chars';

// Token lifetimes
export const ACCESS_TOKEN_EXPIRY_SECONDS = 2 * 60 * 60; // 2 hours
export const REFRESH_TOKEN_EXPIRY_DAYS = 7;
export const REFRESH_TOKEN_EXPIRY_SECONDS = REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60;

/**
 * Hashes a plaintext password using bcrypt with salt rounds = 10.
 */
export async function hashPassword(plainPassword) {
  if (!plainPassword || typeof plainPassword !== 'string') {
    throw new Error('Password must be a non-empty string');
  }
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(plainPassword, salt);
}

/**
 * Compares plaintext password against a bcrypt hash.
 */
export async function comparePassword(plainPassword, hash) {
  if (!plainPassword || !hash) return false;
  return await bcrypt.compare(plainPassword, hash);
}

/**
 * Computes a SHA-256 hash for secure storage of refresh tokens.
 */
export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Signs a short-lived JWT access token.
 * IMPORTANT: Identifies the account using ONLY user id (sub).
 * Does NOT contain any role or account-type claims.
 */
export function signAccessToken(userId) {
  return jwt.sign(
    {
      sub: userId,
    },
    JWT_SECRET,
    {
      expiresIn: `${ACCESS_TOKEN_EXPIRY_SECONDS}s`,
    }
  );
}

/**
 * Verifies an access token and returns its decoded payload.
 */
export function verifyAccessToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

/**
 * Creates and stores a new refresh token with expiration in the database.
 */
export async function createRefreshToken(userId, dbClient = null) {
  const rawToken = crypto.randomBytes(40).toString('hex');
  const tokenHash = hashToken(rawToken);

  const sql = `
    INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
    VALUES ($1, $2, NOW() + INTERVAL '${REFRESH_TOKEN_EXPIRY_DAYS} days')
    RETURNING id, expires_at
  `;

  if (dbClient) {
    await dbClient.query(sql, [userId, tokenHash]);
  } else {
    await query(sql, [userId, tokenHash]);
  }

  return rawToken;
}

/**
 * Verifies and rotates a refresh token.
 * Prevents replay attacks by invalidating the used token and issuing a fresh one.
 */
export async function rotateRefreshToken(rawToken) {
  if (!rawToken) {
    throw new Error('Refresh token is required');
  }

  const tokenHash = hashToken(rawToken);
  const client = await getClient();

  try {
    await client.query('BEGIN');

    // Find valid token
    const tokenRes = await client.query(
      `SELECT * FROM refresh_tokens 
       WHERE token_hash = $1 
         AND revoked_at IS NULL 
         AND expires_at > NOW() 
       FOR UPDATE`,
      [tokenHash]
    );

    if (tokenRes.rows.length === 0) {
      await client.query('ROLLBACK');
      throw new Error('Invalid, expired or revoked refresh token');
    }

    const currentTokenRecord = tokenRes.rows[0];
    const userId = currentTokenRecord.user_id;

    // Revoke the used token (Rotation)
    await client.query(
      `UPDATE refresh_tokens SET revoked_at = NOW() WHERE id = $1`,
      [currentTokenRecord.id]
    );

    // Issue a brand-new refresh token
    const newRawRefreshToken = crypto.randomBytes(40).toString('hex');
    const newTokenHash = hashToken(newRawRefreshToken);

    await client.query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '${REFRESH_TOKEN_EXPIRY_DAYS} days')`,
      [userId, newTokenHash]
    );

    // Generate new access token
    const newAccessToken = signAccessToken(userId);

    await client.query('COMMIT');

    return {
      userId,
      accessToken: newAccessToken,
      refreshToken: newRawRefreshToken,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Revokes all refresh tokens for a user (e.g. on logout or password change).
 */
export async function revokeAllUserTokens(userId) {
  if (!userId) return;
  await query(
    `UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = $1 AND revoked_at IS NULL`,
    [userId]
  );
}

/**
 * Revokes a specific refresh token by raw value.
 */
export async function revokeRefreshToken(rawToken) {
  if (!rawToken) return;
  const tokenHash = hashToken(rawToken);
  await query(
    `UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = $1`,
    [tokenHash]
  );
}

/**
 * AUTOMATIC ACCOUNT IDENTIFICATION ENGINE
 * 
 * Inspects database records across:
 * 1. admin_accounts
 * 2. provider_profiles
 * 3. customer_profiles
 * 
 * Strictly follows the requirement:
 * - NO role or roles column exists.
 * - Identity is resolved purely by profile record existence.
 * - Handles ambiguity if multiple types exist.
 */
export async function identifyAccountType(userId, dbClient = null) {
  const runner = dbClient || { query };

  const [adminRes, providerRes, customerRes] = await Promise.all([
    runner.query(`SELECT * FROM admin_accounts WHERE user_id = $1`, [userId]),
    runner.query(`SELECT * FROM provider_profiles WHERE user_id = $1`, [userId]),
    runner.query(`SELECT * FROM customer_profiles WHERE user_id = $1`, [userId]),
  ]);

  const hasAdmin = adminRes.rows.length > 0;
  const hasProvider = providerRes.rows.length > 0;
  const hasCustomer = customerRes.rows.length > 0;

  const count = (hasAdmin ? 1 : 0) + (hasProvider ? 1 : 0) + (hasCustomer ? 1 : 0);

  if (count === 0) {
    return {
      identified: false,
      accountType: null,
      error: 'No active profile record found for this user account.',
    };
  }

  // Build list of all roles this user has
  const roles = [];
  if (hasAdmin) roles.push('admin');
  if (hasProvider) roles.push('provider');
  if (hasCustomer) roles.push('customer');

  // Primary account type: admin > customer > provider (customer is default for multi-role)
  let primaryType = null;
  let primaryProfile = null;
  let redirectUrl = null;
  let applicationStatus = null;

  if (hasAdmin) {
    primaryType = 'admin';
    primaryProfile = adminRes.rows[0];
    redirectUrl = '/dashboard/admin';
  } else if (hasCustomer) {
    primaryType = 'customer';
    primaryProfile = customerRes.rows[0];
    redirectUrl = '/dashboard/customer';
  } else if (hasProvider) {
    primaryType = 'provider';
    primaryProfile = providerRes.rows[0];
    redirectUrl = '/dashboard/provider';
    applicationStatus = providerRes.rows[0].application_status;
  }

  const result = {
    identified: true,
    accountType: primaryType,
    profile: primaryProfile,
    redirectUrl,
    roles, // all roles this user has
  };

  if (hasProvider) {
    result.providerProfile = providerRes.rows[0];
    result.applicationStatus = providerRes.rows[0].application_status;
  }
  if (hasCustomer) {
    result.customerProfile = customerRes.rows[0];
  }

  return result;
}

/**
 * Returns safe user object without password_hash or sensitive internal flags.
 */
export function formatSafeUser(userRow, accountInfo) {
  if (!userRow) return null;
  const result = {
    id: userRow.id,
    name: userRow.name,
    email: userRow.email,
    phone: userRow.phone,
    createdAt: userRow.created_at,
    accountType: accountInfo?.accountType || null,
    applicationStatus: accountInfo?.applicationStatus || null,
    profile: accountInfo?.profile || null,
    avatar: accountInfo?.profile?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  };

  // Include provider services if user has a provider profile (even if primary type is customer)
  if (accountInfo?.providerProfile?.services) {
    result.services = accountInfo.providerProfile.services;
  } else if (accountInfo?.accountType === 'provider' && accountInfo?.profile?.services) {
    result.services = accountInfo.profile.services;
  }

  // Include provider application status for multi-role users
  if (accountInfo?.applicationStatus) {
    result.providerStatus = accountInfo.applicationStatus;
  }

  return result;
}

/**
 * Extracts and verifies the authenticated user from a Next.js Request or headers/cookies.
 */
export async function getAuthenticatedUser(request) {
  try {
    let token = null;

    // Check Authorization header
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    // Fall back to access_token cookie
    if (!token && request.cookies) {
      const cookieVal = request.cookies.get('access_token');
      token = typeof cookieVal === 'object' && cookieVal !== null ? cookieVal.value : cookieVal;
    }

    if (!token) {
      return null;
    }

    const decoded = verifyAccessToken(token);
    if (!decoded || !decoded.sub) {
      return null;
    }

    const userRes = await query(`SELECT * FROM users WHERE id = $1`, [decoded.sub]);
    if (userRes.rows.length === 0) {
      return null;
    }

    const userRow = userRes.rows[0];
    const accountInfo = await identifyAccountType(userRow.id);

    const safeUser = formatSafeUser(userRow, accountInfo);

    if (!accountInfo.identified) {
      return {
        id: userRow.id,
        name: userRow.name,
        email: userRow.email,
        user: safeUser,
        accountInfo,
        error: accountInfo.error,
      };
    }

    return {
      id: userRow.id,
      name: userRow.name,
      email: userRow.email,
      user: safeUser,
      accountInfo,
    };
  } catch (err) {
    console.error('getAuthenticatedUser error:', err.message);
    return null;
  }
}
