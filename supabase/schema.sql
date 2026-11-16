-- ==============================================================================
-- AuraLife / OneConnect - Real-World Supabase PostgreSQL Database Schema
-- Strict Account Identification Architecture (NO role or roles column)
-- Project: mallikakadiyam (avdpakmhsvdqwjuzulcl)
-- ==============================================================================

-- 1. Enable Cryptographic Extension for UUID Generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Common Users Table
-- Stores base account authentication credentials.
-- NO role or roles column is defined here.
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Case-insensitive index for fast email authentication lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(LOWER(email));

-- 3. Customer Profiles Table
-- The existence of a record in this table identifies the user as a Customer.
CREATE TABLE IF NOT EXISTS customer_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    address TEXT,
    preferences JSONB DEFAULT '{}'::jsonb,
    avatar_url TEXT DEFAULT 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customer_profiles_user_id ON customer_profiles(user_id);

-- 4. Provider Profiles Table
-- The existence of a record in this table identifies the user as a Provider.
-- Access to the provider portal requires application_status = 'approved'.
CREATE TABLE IF NOT EXISTS provider_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    business_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    category_label VARCHAR(255),
    license_number VARCHAR(100),
    years_in_business INT DEFAULT 0,
    address TEXT,
    specialization TEXT,
    application_status VARCHAR(50) NOT NULL DEFAULT 'pending',
    services JSONB DEFAULT '[]'::jsonb,
    avatar_url TEXT DEFAULT 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=200&q=80',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_provider_status CHECK (application_status IN ('pending', 'approved', 'rejected'))
);

CREATE INDEX IF NOT EXISTS idx_provider_profiles_user_id ON provider_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_provider_profiles_status ON provider_profiles(application_status);

-- 5. Admin Accounts Table
-- The existence of a record in this table identifies the user as an Administrator.
-- Administrators can only be created via backend seed scripts; never by public registration.
CREATE TABLE IF NOT EXISTS admin_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    department VARCHAR(100) DEFAULT 'Platform Administration',
    badge VARCHAR(100) DEFAULT 'Super Administrator',
    avatar_url TEXT DEFAULT 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_accounts_user_id ON admin_accounts(user_id);

-- 6. Refresh Tokens Table
-- Manages session tokens with rotation, expiry, and revocation tracking.
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_hash ON refresh_tokens(token_hash);

-- 7. Trigger Function for Automatic updated_at Timestamps
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp_column();

DROP TRIGGER IF EXISTS trg_provider_profiles_updated_at ON provider_profiles;
CREATE TRIGGER trg_provider_profiles_updated_at
    BEFORE UPDATE ON provider_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp_column();

-- 8. Enable Row-Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE refresh_tokens ENABLE ROW LEVEL SECURITY;

-- 9. Row Level Security Policies
-- Since our application uses a secure backend connection (Session Pooler via DATABASE_URL),
-- backend operations execute with database permissions.
-- We establish explicit policies to ensure safe table access:
DO $$
BEGIN
    -- users policy
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'backend_full_access_users') THEN
        CREATE POLICY backend_full_access_users ON users FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- customer_profiles policy
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'customer_profiles' AND policyname = 'backend_full_access_customer') THEN
        CREATE POLICY backend_full_access_customer ON customer_profiles FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- provider_profiles policy
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'provider_profiles' AND policyname = 'backend_full_access_provider') THEN
        CREATE POLICY backend_full_access_provider ON provider_profiles FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- admin_accounts policy
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'admin_accounts' AND policyname = 'backend_full_access_admin') THEN
        CREATE POLICY backend_full_access_admin ON admin_accounts FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- refresh_tokens policy
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'refresh_tokens' AND policyname = 'backend_full_access_tokens') THEN
        CREATE POLICY backend_full_access_tokens ON refresh_tokens FOR ALL USING (true) WITH CHECK (true);
    END IF;
END
$$;

-- ==============================================================================
-- SERVICE LISTING TABLES — Real Data for Hotels, Flights, Buses, Properties, Practitioners
-- ==============================================================================

-- 10. Hotels Table
CREATE TABLE IF NOT EXISTS hotels (
    id TEXT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    rating DECIMAL(3,2) DEFAULT 0,
    reviews_count INT DEFAULT 0,
    price_per_night INT NOT NULL,
    image TEXT,
    images JSONB DEFAULT '[]'::jsonb,
    description TEXT,
    amenities JSONB DEFAULT '[]'::jsonb,
    rooms JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hotels_city ON hotels(city);

-- 11. Flights Table
CREATE TABLE IF NOT EXISTS flights (
    id TEXT PRIMARY KEY,
    airline VARCHAR(255) NOT NULL,
    airline_code VARCHAR(10) NOT NULL,
    flight_number VARCHAR(20) NOT NULL,
    from_code VARCHAR(10) NOT NULL,
    to_code VARCHAR(10) NOT NULL,
    from_city VARCHAR(100) NOT NULL,
    to_city VARCHAR(100) NOT NULL,
    departure_time VARCHAR(20) NOT NULL,
    arrival_time VARCHAR(20) NOT NULL,
    duration VARCHAR(20) NOT NULL,
    stops VARCHAR(50) DEFAULT 'Non-stop',
    stop_count INT DEFAULT 0,
    price INT NOT NULL,
    available_seats INT DEFAULT 0,
    aircraft VARCHAR(100),
    amenities JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_flights_route ON flights(from_code, to_code);

-- 12. Buses Table
CREATE TABLE IF NOT EXISTS buses (
    id TEXT PRIMARY KEY,
    operator VARCHAR(255) NOT NULL,
    bus_type VARCHAR(255) NOT NULL,
    from_city VARCHAR(100) NOT NULL,
    to_city VARCHAR(100) NOT NULL,
    departure_time VARCHAR(20) NOT NULL,
    arrival_time VARCHAR(20) NOT NULL,
    duration VARCHAR(20) NOT NULL,
    rating DECIMAL(3,2) DEFAULT 0,
    reviews_count INT DEFAULT 0,
    fare INT NOT NULL,
    available_seats_count INT DEFAULT 0,
    total_seats INT DEFAULT 0,
    boarding_points JSONB DEFAULT '[]'::jsonb,
    dropping_points JSONB DEFAULT '[]'::jsonb,
    amenities JSONB DEFAULT '[]'::jsonb,
    booked_seats JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_buses_route ON buses(from_city, to_city);

-- 13. Properties Table
CREATE TABLE IF NOT EXISTS properties (
    id TEXT PRIMARY KEY,
    purpose VARCHAR(10) NOT NULL CHECK (purpose IN ('buy', 'rent')),
    title VARCHAR(500) NOT NULL,
    location VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    price BIGINT NOT NULL,
    price_display VARCHAR(50) NOT NULL,
    property_type VARCHAR(100) NOT NULL,
    bedrooms INT DEFAULT 0,
    bathrooms INT DEFAULT 0,
    area_sqft INT DEFAULT 0,
    furnished VARCHAR(100),
    featured BOOLEAN DEFAULT false,
    image TEXT,
    images JSONB DEFAULT '[]'::jsonb,
    description TEXT,
    amenities JSONB DEFAULT '[]'::jsonb,
    agent JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_properties_purpose ON properties(purpose);
CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);

-- 14. Health & Healing Practitioners Table
CREATE TABLE IF NOT EXISTS practitioners (
    id TEXT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    specialization VARCHAR(255),
    qualifications TEXT,
    experience_years INT DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0,
    reviews_count INT DEFAULT 0,
    avatar TEXT,
    location VARCHAR(255),
    consultation_mode VARCHAR(100),
    duration VARCHAR(20),
    price INT NOT NULL,
    about TEXT,
    available_dates JSONB DEFAULT '[]'::jsonb,
    available_slots JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_practitioners_category ON practitioners(category);

-- 15. Provider Listings Table
-- Stores listings added by providers (flights, hotels, buses, properties, wellness)
CREATE TABLE IF NOT EXISTS provider_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    service_type VARCHAR(50) NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT DEFAULT '',
    details JSONB DEFAULT '{}'::jsonb,
    price INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_provider_listings_provider ON provider_listings(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_listings_service ON provider_listings(service_type);
CREATE INDEX IF NOT EXISTS idx_provider_listings_status ON provider_listings(status);

-- 16. Wellness Appointments Table (if not exists)
CREATE TABLE IF NOT EXISTS wellness_appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    practitioner_name VARCHAR(255),
    specialization VARCHAR(255),
    date VARCHAR(50),
    time_slot VARCHAR(50),
    consultation_mode VARCHAR(100),
    duration VARCHAR(20),
    price INT DEFAULT 0,
    patient_name VARCHAR(255),
    patient_phone VARCHAR(50),
    notes TEXT,
    status VARCHAR(50) DEFAULT 'Pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 17. RLS Policies for service tables (public read access)
ALTER TABLE hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE flights ENABLE ROW LEVEL SECURITY;
ALTER TABLE buses ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE practitioners ENABLE ROW LEVEL SECURITY;
ALTER TABLE wellness_appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_listings ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'hotels' AND policyname = 'backend_full_access_hotels') THEN
        CREATE POLICY backend_full_access_hotels ON hotels FOR ALL USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'flights' AND policyname = 'backend_full_access_flights') THEN
        CREATE POLICY backend_full_access_flights ON flights FOR ALL USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'buses' AND policyname = 'backend_full_access_buses') THEN
        CREATE POLICY backend_full_access_buses ON buses FOR ALL USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'properties' AND policyname = 'backend_full_access_properties') THEN
        CREATE POLICY backend_full_access_properties ON properties FOR ALL USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'practitioners' AND policyname = 'backend_full_access_practitioners') THEN
        CREATE POLICY backend_full_access_practitioners ON practitioners FOR ALL USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'wellness_appointments' AND policyname = 'backend_full_access_wellness') THEN
        CREATE POLICY backend_full_access_wellness ON wellness_appointments FOR ALL USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'provider_listings' AND policyname = 'backend_full_access_provider_listings') THEN
        CREATE POLICY backend_full_access_provider_listings ON provider_listings FOR ALL USING (true) WITH CHECK (true);
    END IF;
END
$$;
