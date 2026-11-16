-- ==============================================================================
-- Master Data Management (MDM) Migration
-- Creates centralized master tables for Airlines, Airports, and Aircraft
-- ==============================================================================

-- 1. Airlines Master Table
CREATE TABLE IF NOT EXISTS master_airlines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    airline_name VARCHAR(255) NOT NULL,
    airline_code VARCHAR(10) NOT NULL,
    logo_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_master_airlines_code ON master_airlines(LOWER(airline_code));
CREATE INDEX IF NOT EXISTS idx_master_airlines_active ON master_airlines(is_active);

-- 2. Airports Master Table
CREATE TABLE IF NOT EXISTS master_airports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    airport_name VARCHAR(255) NOT NULL,
    airport_code VARCHAR(10) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'India',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_master_airports_code ON master_airports(LOWER(airport_code));
CREATE INDEX IF NOT EXISTS idx_master_airports_active ON master_airports(is_active);
CREATE INDEX IF NOT EXISTS idx_master_airports_city ON master_airports(LOWER(city));

-- 3. Aircraft Master Table
CREATE TABLE IF NOT EXISTS master_aircraft (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aircraft_name VARCHAR(255) NOT NULL,
    aircraft_code VARCHAR(50) NOT NULL,
    manufacturer VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_master_aircraft_code ON master_aircraft(LOWER(aircraft_code));
CREATE INDEX IF NOT EXISTS idx_master_aircraft_active ON master_aircraft(is_active);

-- 4. Auto-update timestamps
DROP TRIGGER IF EXISTS trg_master_airlines_updated_at ON master_airlines;
CREATE TRIGGER trg_master_airlines_updated_at
    BEFORE UPDATE ON master_airlines
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp_column();

DROP TRIGGER IF EXISTS trg_master_airports_updated_at ON master_airports;
CREATE TRIGGER trg_master_airports_updated_at
    BEFORE UPDATE ON master_airports
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp_column();

DROP TRIGGER IF EXISTS trg_master_aircraft_updated_at ON master_aircraft;
CREATE TRIGGER trg_master_aircraft_updated_at
    BEFORE UPDATE ON master_aircraft
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp_column();

-- 5. Enable RLS
ALTER TABLE master_airlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_airports ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_aircraft ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies (backend full access since we use server-side auth)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'master_airlines' AND policyname = 'backend_full_access_master_airlines') THEN
        CREATE POLICY backend_full_access_master_airlines ON master_airlines FOR ALL USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'master_airports' AND policyname = 'backend_full_access_master_airports') THEN
        CREATE POLICY backend_full_access_master_airports ON master_airports FOR ALL USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'master_aircraft' AND policyname = 'backend_full_access_master_aircraft') THEN
        CREATE POLICY backend_full_access_master_aircraft ON master_aircraft FOR ALL USING (true) WITH CHECK (true);
    END IF;
END
$$;

-- 7. Seed Airlines Data
INSERT INTO master_airlines (airline_name, airline_code, logo_url) VALUES
    ('IndiGo', '6E', NULL),
    ('Air India', 'AI', NULL),
    ('Air India Express', 'IX', NULL),
    ('SpiceJet', 'SG', NULL),
    ('Akasa Air', 'QP', NULL),
    ('Alliance Air', '9I', NULL),
    ('Vistara', 'UK', NULL),
    ('Go First', 'G8', NULL)
ON CONFLICT DO NOTHING;

-- 8. Seed Airports Data
INSERT INTO master_airports (airport_name, airport_code, city, state, country) VALUES
    ('Kempegowda International Airport', 'BLR', 'Bengaluru', 'Karnataka', 'India'),
    ('Chennai International Airport', 'MAA', 'Chennai', 'Tamil Nadu', 'India'),
    ('Coimbatore International Airport', 'CJB', 'Coimbatore', 'Tamil Nadu', 'India'),
    ('Rajiv Gandhi International Airport', 'HYD', 'Hyderabad', 'Telangana', 'India'),
    ('Indira Gandhi International Airport', 'DEL', 'New Delhi', 'Delhi', 'India'),
    ('Chhatrapati Shivaji Maharaj International Airport', 'BOM', 'Mumbai', 'Maharashtra', 'India'),
    ('Netaji Subhas Chandra Bose International Airport', 'CCU', 'Kolkata', 'West Bengal', 'India'),
    ('Goa International Airport (Dabolim)', 'GOI', 'Goa', 'Goa', 'India'),
    ('Cochin International Airport', 'COK', 'Kochi', 'Kerala', 'India'),
    ('Jaipur International Airport', 'JAI', 'Jaipur', 'Rajasthan', 'India'),
    ('Sardar Vallabhbhai Patel International Airport', 'AMD', 'Ahmedabad', 'Gujarat', 'India'),
    ('Pune Airport', 'PNQ', 'Pune', 'Maharashtra', 'India'),
    ('Trivandrum International Airport', 'TRV', 'Thiruvananthapuram', 'Kerala', 'India'),
    ('Mangalore International Airport', 'IXE', 'Mangaluru', 'Karnataka', 'India'),
    ('Lokpriya Gopinath Bordoloi International Airport', 'GAU', 'Guwahati', 'Assam', 'India'),
    ('Sri Guru Ram Dass Jee International Airport', 'ATQ', 'Amritsar', 'Punjab', 'India'),
    ('Manohar International Airport', 'GOX', 'Mopa, Goa', 'Goa', 'India'),
    ('Bagdogra Airport', 'IXB', 'Siliguri', 'West Bengal', 'India'),
    ('Visakhapatnam Airport', 'VTZ', 'Visakhapatnam', 'Andhra Pradesh', 'India'),
    ('Biju Patnaik International Airport', 'BBI', 'Bhubaneswar', 'Odisha', 'India')
ON CONFLICT DO NOTHING;

-- 9. Seed Aircraft Data
INSERT INTO master_aircraft (aircraft_name, aircraft_code, manufacturer) VALUES
    ('Airbus A320neo', 'A320N', 'Airbus'),
    ('Airbus A321neo', 'A321N', 'Airbus'),
    ('Airbus A320', 'A320', 'Airbus'),
    ('Boeing 737-800', 'B738', 'Boeing'),
    ('Boeing 737 MAX 8', 'B38M', 'Boeing'),
    ('Boeing 787 Dreamliner', 'B787', 'Boeing'),
    ('Boeing 777-300ER', 'B77W', 'Boeing'),
    ('ATR 72-600', 'AT76', 'ATR'),
    ('Airbus A350-900', 'A359', 'Airbus'),
    ('De Havilland Dash 8 Q400', 'DH8D', 'De Havilland')
ON CONFLICT DO NOTHING;
