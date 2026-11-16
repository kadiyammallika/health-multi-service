// Test the full login -> fetch listings flow
const BASE = 'http://localhost:3000';

async function test() {
  try {
    // Step 1: Login
    console.log('1. Logging in as mallireddy9171@gmail.com...');
    const loginRes = await fetch(`${BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'mallireddy9171@gmail.com', password: 'Mallika@507' }),
    });
    const loginData = await loginRes.json();
    console.log('Login status:', loginRes.status, loginData.success);
    console.log('User services:', loginData.user?.services);
    console.log('Account type:', loginData.user?.accountType);

    // Extract cookies from response
    const cookies = loginRes.headers.getSetCookie?.() || [];
    console.log('Cookies received:', cookies.length);
    const cookieHeader = cookies.map(c => c.split(';')[0]).join('; ');
    console.log('Cookie header:', cookieHeader.substring(0, 100) + '...');

    // Step 2: Fetch listings
    console.log('\n2. Fetching provider listings...');
    const listRes = await fetch(`${BASE}/api/provider/listings?service_type=flights`, {
      headers: { Cookie: cookieHeader },
    });
    const listData = await listRes.json();
    console.log('Listings status:', listRes.status);
    console.log('Listings count:', listData.listings?.length || 0);
    if (listData.listings?.length > 0) {
      console.log('First listing:', listData.listings[0].title);
    }
    if (listData.error) {
      console.log('Error:', listData.error);
    }

    // Step 3: Fetch all service types
    console.log('\n3. Fetching ALL listings (no filter)...');
    const allRes = await fetch(`${BASE}/api/provider/listings`, {
      headers: { Cookie: cookieHeader },
    });
    const allData = await allRes.json();
    console.log('All listings count:', allData.listings?.length || 0);

  } catch (err) {
    console.error('Test failed:', err.message);
  }
}

test();
