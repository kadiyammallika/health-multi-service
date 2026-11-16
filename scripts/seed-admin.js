require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

async function seedAdmin() {
  console.log('🌱 Starting Secure Administrator Seeding from Environment...');

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString || connectionString.includes('[YOUR-PASSWORD]')) {
    console.error('❌ DATABASE_URL is not properly set in .env.');
    console.error('👉 Please update .env with your actual Supabase database password.');
    process.exit(1);
  }

  const adminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.error('❌ Error: ADMIN_EMAIL and ADMIN_PASSWORD must be defined in your .env file.');
    console.error('👉 Example in .env:');
    console.error('   ADMIN_EMAIL=your-chosen-admin@yourdomain.com');
    console.error('   ADMIN_PASSWORD=YourStrongAdminPassword!');
    process.exit(1);
  }

  const adminName = process.env.ADMIN_NAME || 'Platform Administrator';
  const adminPhone = process.env.ADMIN_PHONE || null;
  const adminDept = process.env.ADMIN_DEPARTMENT || 'Executive Platform Operations';
  const adminBadge = process.env.ADMIN_BADGE || 'Super Administrator';

  const isLocalhost = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');

  const pool = new Pool({
    connectionString,
    ssl: isLocalhost ? false : { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
  });

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    console.log(`🔐 Hashing administrator password with bcrypt (salt rounds = 10)...`);
    const adminPasswordHash = await bcrypt.hash(adminPassword, 10);

    // Upsert admin into common users table
    const adminUserRes = await client.query(
      `SELECT id FROM users WHERE LOWER(email) = $1`,
      [adminEmail]
    );

    let adminUserId;
    if (adminUserRes.rows.length === 0) {
      const inserted = await client.query(
        `INSERT INTO users (name, email, phone, password_hash)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [adminName, adminEmail, adminPhone, adminPasswordHash]
      );
      adminUserId = inserted.rows[0].id;
      console.log(`✨ Created admin common account in 'users': ${adminEmail} (ID: ${adminUserId})`);
    } else {
      adminUserId = adminUserRes.rows[0].id;
      await client.query(
        `UPDATE users SET name = $1, phone = $2, password_hash = $3 WHERE id = $4`,
        [adminName, adminPhone, adminPasswordHash, adminUserId]
      );
      console.log(`🔄 Updated existing admin account credentials in 'users': ${adminEmail}`);
    }

    // Insert or update admin_accounts profile table
    // The existence of this record identifies the user as an Administrator
    await client.query(
      `INSERT INTO admin_accounts (user_id, department, badge)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id) DO UPDATE SET department = EXCLUDED.department, badge = EXCLUDED.badge`,
      [adminUserId, adminDept, adminBadge]
    );
    console.log(`✅ Linked administrator profile in 'admin_accounts' table.`);

    await client.query('COMMIT');
    console.log(`\n🎉 Administrator account ready! Log in at /login using:`);
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: (as configured in .env)\n`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Seeding error:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seedAdmin();
