require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'auralife-default-dev-access-token-secret-32-chars';
const ACCESS_TOKEN_EXPIRY_SECONDS = 15 * 60; // 15 mins
const REFRESH_TOKEN_EXPIRY_DAYS = 7;
const REFRESH_TOKEN_EXPIRY_SECONDS = REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60;

// Database Connection
const connectionString = process.env.DATABASE_URL;
const isLocalhost = connectionString && (connectionString.includes('localhost') || connectionString.includes('127.0.0.1'));

const pool = new Pool({
  connectionString,
  ssl: isLocalhost ? false : { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Helpers
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function signAccessToken(userId) {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: `${ACCESS_TOKEN_EXPIRY_SECONDS}s` });
}

function verifyAccessToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

async function createRefreshToken(userId, client = null) {
  const raw = crypto.randomBytes(40).toString('hex');
  const tokenHash = hashToken(raw);
  const sql = `INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, NOW() + INTERVAL '${REFRESH_TOKEN_EXPIRY_DAYS} days')`;
  if (client) {
    await client.query(sql, [userId, tokenHash]);
  } else {
    await pool.query(sql, [userId, tokenHash]);
  }
  return raw;
}

async function identifyAccountType(userId, client = null) {
  const runner = client || pool;
  const [adminRes, providerRes, customerRes] = await Promise.all([
    runner.query('SELECT * FROM admin_accounts WHERE user_id = $1', [userId]),
    runner.query('SELECT * FROM provider_profiles WHERE user_id = $1', [userId]),
    runner.query('SELECT * FROM customer_profiles WHERE user_id = $1', [userId]),
  ]);

  const hasAdmin = adminRes.rows.length > 0;
  const hasProvider = providerRes.rows.length > 0;
  const hasCustomer = customerRes.rows.length > 0;
  const count = (hasAdmin ? 1 : 0) + (hasProvider ? 1 : 0) + (hasCustomer ? 1 : 0);

  if (count === 0) {
    return { identified: false, accountType: null, error: 'No active profile record found.' };
  }
  if (count > 1) {
    return { identified: false, ambiguous: true, accountType: null, error: 'Conflicting profile types detected.' };
  }
  if (hasAdmin) {
    return { identified: true, accountType: 'admin', profile: adminRes.rows[0], redirectUrl: '/dashboard/admin' };
  }
  if (hasProvider) {
    const prov = providerRes.rows[0];
    return {
      identified: true,
      accountType: 'provider',
      profile: prov,
      applicationStatus: prov.application_status,
      redirectUrl: '/dashboard/provider',
    };
  }
  if (hasCustomer) {
    return { identified: true, accountType: 'customer', profile: customerRes.rows[0], redirectUrl: '/dashboard/customer' };
  }
  return { identified: false, accountType: null, error: 'Unable to identify account.' };
}

function formatSafeUser(user, accountInfo) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    createdAt: user.created_at,
    accountType: accountInfo?.accountType,
    applicationStatus: accountInfo?.applicationStatus,
    profile: accountInfo?.profile,
    avatar: accountInfo?.profile?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  };
}

async function authMiddleware(req, res, next) {
  let token = null;
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.cookies && req.cookies.access_token) {
    token = req.cookies.access_token;
  }

  if (!token) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Session token required.' });
  }

  const decoded = verifyAccessToken(token);
  if (!decoded || !decoded.sub) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Invalid or expired token.' });
  }

  try {
    const uRes = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.sub]);
    if (uRes.rows.length === 0) {
      return res.status(401).json({ success: false, error: 'User account not found.' });
    }
    const user = uRes.rows[0];
    const accountInfo = await identifyAccountType(user.id);
    req.user = user;
    req.accountInfo = accountInfo;
    next();
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Authentication internal error.' });
  }
}

// 1. POST /api/auth/register (Customer Registration)
app.post('/api/auth/register', async (req, res) => {
  const { name, email, phone, password } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ success: false, error: 'Name is required.' });
  const cleanEmail = (email || '').trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) return res.status(400).json({ success: false, error: 'Valid email is required.' });
  if (!password || password.length < 6) return res.status(400).json({ success: false, error: 'Password must be >= 6 characters.' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const existing = await client.query('SELECT id FROM users WHERE LOWER(email) = $1', [cleanEmail]);
    if (existing.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ success: false, error: 'Email already registered.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const userRes = await client.query(
      'INSERT INTO users (name, email, phone, password_hash) VALUES ($1, $2, $3, $4) RETURNING id, name, email, phone, created_at',
      [name.trim(), cleanEmail, phone ? phone.trim() : null, passwordHash]
    );
    const newUser = userRes.rows[0];
    await client.query('INSERT INTO customer_profiles (user_id) VALUES ($1)', [newUser.id]);

    const accessToken = signAccessToken(newUser.id);
    const refreshToken = await createRefreshToken(newUser.id, client);
    await client.query('COMMIT');

    const accountInfo = await identifyAccountType(newUser.id);
    const safeUser = formatSafeUser(newUser, accountInfo);

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: ACCESS_TOKEN_EXPIRY_SECONDS * 1000,
    });
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: REFRESH_TOKEN_EXPIRY_SECONDS * 1000,
    });

    return res.status(201).json({
      success: true,
      message: 'Customer registered successfully.',
      user: safeUser,
      redirectUrl: '/dashboard/customer',
    });
  } catch (err) {
    await client.query('ROLLBACK');
    return res.status(500).json({ success: false, error: err.message });
  } finally {
    client.release();
  }
});

// 2. POST /api/auth/provider-register (Provider Registration)
app.post('/api/auth/provider-register', async (req, res) => {
  const { businessName, category, categoryLabel, contactPerson, email, phone, password, licenseNumber, yearsInBusiness, address, specialization } = req.body;
  if (!businessName || !contactPerson || !email || !password) {
    return res.status(400).json({ success: false, error: 'Required fields missing.' });
  }
  const cleanEmail = email.trim().toLowerCase();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const existing = await client.query('SELECT id FROM users WHERE LOWER(email) = $1', [cleanEmail]);
    if (existing.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ success: false, error: 'Email already registered.' });
    }
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const userRes = await client.query(
      'INSERT INTO users (name, email, phone, password_hash) VALUES ($1, $2, $3, $4) RETURNING id, name, email',
      [contactPerson.trim(), cleanEmail, phone ? phone.trim() : null, passwordHash]
    );
    const newUser = userRes.rows[0];
    const provRes = await client.query(
      `INSERT INTO provider_profiles (user_id, business_name, category, category_label, license_number, years_in_business, address, specialization, application_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending') RETURNING id, application_status`,
      [newUser.id, businessName.trim(), category || 'wellness', categoryLabel || 'Service Provider', licenseNumber || null, Number(yearsInBusiness) || 0, address || null, specialization || null]
    );
    await client.query('COMMIT');
    return res.status(201).json({
      success: true,
      message: 'Provider registration submitted. Status is pending.',
      applicationStatus: 'pending',
      provider: { id: provRes.rows[0].id, userId: newUser.id, businessName },
    });
  } catch (err) {
    await client.query('ROLLBACK');
    return res.status(500).json({ success: false, error: err.message });
  } finally {
    client.release();
  }
});

// 3. POST /api/auth/login (Common Login API - Auto Identification)
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const cleanEmail = (email || '').trim().toLowerCase();
  if (!cleanEmail || !password) return res.status(400).json({ success: false, error: 'Email and password required.' });

  try {
    const userRes = await pool.query('SELECT * FROM users WHERE LOWER(email) = $1', [cleanEmail]);
    if (userRes.rows.length === 0) return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    const user = userRes.rows[0];

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ success: false, error: 'Invalid email or password.' });

    const accountInfo = await identifyAccountType(user.id);
    if (!accountInfo.identified) {
      if (accountInfo.ambiguous) {
        return res.status(403).json({ success: false, error: 'Conflicting account types detected.' });
      }
      return res.status(403).json({ success: false, error: 'No active profile found for this user.' });
    }

    if (accountInfo.accountType === 'provider') {
      if (accountInfo.applicationStatus === 'pending') {
        return res.status(403).json({
          success: false,
          isPendingProvider: true,
          status: 'pending',
          error: 'Your provider application is currently pending administrative verification.',
        });
      }
      if (accountInfo.applicationStatus === 'rejected') {
        return res.status(403).json({ success: false, status: 'rejected', error: 'Your application was rejected.' });
      }
    }

    const accessToken = signAccessToken(user.id);
    const refreshToken = await createRefreshToken(user.id);
    const safeUser = formatSafeUser(user, accountInfo);

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: ACCESS_TOKEN_EXPIRY_SECONDS * 1000,
    });
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: REFRESH_TOKEN_EXPIRY_SECONDS * 1000,
    });

    return res.json({
      success: true,
      message: 'Authentication successful.',
      user: safeUser,
      redirectUrl: accountInfo.redirectUrl,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 4. POST /api/auth/refresh (Token Rotation)
app.post('/api/auth/refresh', async (req, res) => {
  const rawToken = req.cookies.refresh_token || req.body.refreshToken;
  if (!rawToken) return res.status(401).json({ success: false, error: 'Refresh token required.' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const tokenHash = hashToken(rawToken);
    const tokenRes = await client.query(
      'SELECT * FROM refresh_tokens WHERE token_hash = $1 AND revoked_at IS NULL AND expires_at > NOW() FOR UPDATE',
      [tokenHash]
    );
    if (tokenRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(401).json({ success: false, error: 'Invalid or expired refresh token.' });
    }
    const tokenRecord = tokenRes.rows[0];
    await client.query('UPDATE refresh_tokens SET revoked_at = NOW() WHERE id = $1', [tokenRecord.id]);

    const newRaw = crypto.randomBytes(40).toString('hex');
    const newHash = hashToken(newRaw);
    await client.query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, NOW() + INTERVAL '${REFRESH_TOKEN_EXPIRY_DAYS} days')`,
      [tokenRecord.user_id, newHash]
    );

    const newAccessToken = signAccessToken(tokenRecord.user_id);
    await client.query('COMMIT');

    res.cookie('access_token', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: ACCESS_TOKEN_EXPIRY_SECONDS * 1000,
    });
    res.cookie('refresh_token', newRaw, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: REFRESH_TOKEN_EXPIRY_SECONDS * 1000,
    });

    return res.json({ success: true, accessToken: newAccessToken });
  } catch (err) {
    await client.query('ROLLBACK');
    return res.status(401).json({ success: false, error: 'Token refresh failed.' });
  } finally {
    client.release();
  }
});

// 5. POST /api/auth/logout
app.post('/api/auth/logout', async (req, res) => {
  const rawToken = req.cookies.refresh_token;
  if (rawToken) {
    const tokenHash = hashToken(rawToken);
    await pool.query('UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = $1', [tokenHash]);
  }
  res.clearCookie('access_token');
  res.clearCookie('refresh_token');
  return res.json({ success: true, message: 'Logged out successfully.' });
});

// 6. GET /api/users/me (Current Authenticated User)
app.get('/api/users/me', authMiddleware, (req, res) => {
  if (!req.accountInfo?.identified) {
    return res.status(403).json({ success: false, error: req.accountInfo?.error || 'Profile unverified.' });
  }
  return res.json({ success: true, user: formatSafeUser(req.user, req.accountInfo) });
});

// 7. GET /api/admin/providers (Admin Only)
app.get('/api/admin/providers', authMiddleware, async (req, res) => {
  if (req.accountInfo?.accountType !== 'admin') {
    return res.status(403).json({ success: false, error: 'Forbidden: Admin access required.' });
  }
  const result = await pool.query(`
    SELECT p.*, u.name as contact_person, u.email, u.phone 
    FROM provider_profiles p 
    JOIN users u ON u.id = p.user_id 
    ORDER BY p.created_at DESC
  `);
  return res.json({ success: true, providers: result.rows });
});

// 8. POST /api/admin/providers/:id/approve (Admin Only)
app.post('/api/admin/providers/:id/approve', authMiddleware, async (req, res) => {
  if (req.accountInfo?.accountType !== 'admin') {
    return res.status(403).json({ success: false, error: 'Forbidden: Admin access required.' });
  }
  const { id } = req.params;
  const result = await pool.query(
    `UPDATE provider_profiles SET application_status = 'approved', updated_at = NOW() WHERE id::text = $1 OR user_id::text = $1 RETURNING *`,
    [id]
  );
  if (result.rows.length === 0) return res.status(404).json({ success: false, error: 'Provider not found.' });
  return res.json({ success: true, message: 'Provider approved.', provider: result.rows[0] });
});

// 9. POST /api/admin/providers/:id/reject (Admin Only)
app.post('/api/admin/providers/:id/reject', authMiddleware, async (req, res) => {
  if (req.accountInfo?.accountType !== 'admin') {
    return res.status(403).json({ success: false, error: 'Forbidden: Admin access required.' });
  }
  const { id } = req.params;
  const result = await pool.query(
    `UPDATE provider_profiles SET application_status = 'rejected', updated_at = NOW() WHERE id::text = $1 OR user_id::text = $1 RETURNING *`,
    [id]
  );
  if (result.rows.length === 0) return res.status(404).json({ success: false, error: 'Provider not found.' });
  return res.json({ success: true, message: 'Provider rejected.', provider: result.rows[0] });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Express Authentication server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
