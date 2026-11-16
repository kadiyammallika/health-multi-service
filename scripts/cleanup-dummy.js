const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function cleanup() {
  const client = await pool.connect();
  try {
    // List all wellness entries with their details
    const result = await client.query('SELECT id, title, details FROM provider_listings WHERE service_type = $1', ['wellness']);
    console.log('Total wellness entries:', result.rows.length);

    const genericNames = ['Ayurveda & Panchakarma', 'Yoga & Pranayama', 'Meditation & Sound Healing', 'Physiotherapy & Rehab', 'Clinical Nutrition & Diet', 'Mental Health & Therapy', 'Acupuncture & Naturopathy', 'All Therapies'];

    let deleted = 0;
    for (const row of result.rows) {
      const d = typeof row.details === 'string' ? JSON.parse(row.details) : (row.details || {});
      const name = d.practitionerName || row.title;
      console.log('  -', name, '| title:', row.title);

      // Delete if it's a generic name OR if the title matches
      if (genericNames.includes(name) || genericNames.includes(row.title)) {
        await client.query('DELETE FROM provider_listings WHERE id = $1', [row.id]);
        console.log('    DELETED');
        deleted++;
      }
    }
    console.log('\nTotal deleted:', deleted);

    // Show remaining
    const services = ['flights', 'hotels', 'buses', 'wellness', 'properties'];
    for (const s of services) {
      const r = await client.query('SELECT COUNT(*) as c FROM provider_listings WHERE service_type = $1 AND status = $2', [s, 'active']);
      console.log(s + ':', r.rows[0].c, 'active listings');
    }
  } finally {
    client.release();
    await pool.end();
  }
}

cleanup().catch(e => { console.error(e); process.exit(1); });
