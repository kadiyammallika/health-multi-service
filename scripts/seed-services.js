/**
 * seed-services.js
 * Seeds all 5 service tables (hotels, flights, buses, properties, practitioners)
 * with real Indian data into the PostgreSQL database.
 *
 * Usage: node scripts/seed-services.js
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// ---------------------------------------------------------------------------
// CREATE TABLE statements (idempotent)
// ---------------------------------------------------------------------------
const CREATE_TABLES_SQL = `
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

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
`;

// ---------------------------------------------------------------------------
// SEED DATA
// ---------------------------------------------------------------------------

const HOTELS = [
  {
    id: 'HTL-301',
    name: 'Taj Palace Hotel',
    location: 'Sardar Patel Marg, Diplomatic Enclave, New Delhi',
    city: 'New Delhi',
    rating: 4.8,
    reviews_count: 3240,
    price_per_night: 12500,
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80'
    ]),
    description: 'Iconic 5-star luxury hotel set on 6 acres of landscaped gardens in the heart of Delhi\'s diplomatic enclave. World-class dining, Jiva Spa, and impeccable Taj hospitality.',
    amenities: JSON.stringify(['Jiva Spa', 'Swimming Pool', 'Fitness Centre', 'Free Wi-Fi', 'Valet Parking', 'Multi-Cuisine Restaurants', 'Business Centre']),
    rooms: JSON.stringify([
      { id: 'RM-101', name: 'Deluxe Garden View Room', bed: '1 King Bed', capacity: '2 Adults, 1 Child', price: 12500, features: ['Garden View', 'Marble Bathroom', 'Complimentary Breakfast', 'Mini Bar'] },
      { id: 'RM-102', name: 'Taj Club Executive Suite', bed: '1 King Bed + Living Area', capacity: '3 Adults', price: 22000, features: ['Club Lounge Access', 'Butler Service', 'Private Balcony', 'Evening Cocktails'] }
    ])
  },
  {
    id: 'HTL-302',
    name: 'The Oberoi Udaivilas',
    location: 'Haridasji Ki Magri, Udaipur, Rajasthan',
    city: 'Udaipur',
    rating: 4.95,
    reviews_count: 1890,
    price_per_night: 35000,
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80'
    ]),
    description: 'Sprawling lakeside palace resort on the banks of Lake Pichola. Features interconnected domes, private courtyards, and a 50-metre semi-private pool reflecting Mewar grandeur.',
    amenities: JSON.stringify(['Private Lake Access', 'Oberoi Spa', 'Infinity Pool', 'Fine Dining', 'Horse Carriage Rides', 'Royal Boat Transfers', 'Yoga Pavilion']),
    rooms: JSON.stringify([
      { id: 'RM-201', name: 'Premier Lakeview Room', bed: '1 King Bed', capacity: '2 Adults', price: 35000, features: ['Lake Pichola View', 'Private Courtyard', 'Deep Soaking Tub', 'Butler Service'] },
      { id: 'RM-202', name: 'Kohinoor Suite with Private Pool', bed: '1 Royal King Bed + Drawing Room', capacity: '3 Adults', price: 75000, features: ['Private Heated Pool', 'Panoramic Lake View', 'Personal Butler', 'Complimentary Spa Treatment'] }
    ])
  },
  {
    id: 'HTL-303',
    name: 'ITC Grand Chola',
    location: 'Mount Road, Guindy, Chennai',
    city: 'Chennai',
    rating: 4.7,
    reviews_count: 2780,
    price_per_night: 9800,
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80'
    ]),
    description: 'South India\'s largest luxury hotel, inspired by the grandeur of the Chola dynasty. LEED Platinum certified with award-winning restaurants and Kaya Kalp Royal Spa.',
    amenities: JSON.stringify(['Kaya Kalp Spa', 'Outdoor Pool', 'Fitness Centre', 'High-Speed Wi-Fi', 'EV Charging', '10 Restaurants & Bars', 'Banquet Halls']),
    rooms: JSON.stringify([
      { id: 'RM-301', name: 'ITC One Executive Room', bed: '1 King Bed or Twin Beds', capacity: '2 Adults', price: 9800, features: ['City View', 'Rain Shower', 'Buffet Breakfast', 'Espresso Machine'] },
      { id: 'RM-302', name: 'Eva Presidential Suite', bed: '1 Super King Bed + Living Room', capacity: '2 Adults, 1 Child', price: 28000, features: ['Lounge Access', 'Personal Concierge', 'Private Dining', 'Jacuzzi'] }
    ])
  },
  {
    id: 'HTL-304',
    name: 'The Leela Palace',
    location: 'Old Airport Road, HAL, Bengaluru',
    city: 'Bengaluru',
    rating: 4.85,
    reviews_count: 2150,
    price_per_night: 11200,
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80'
    ]),
    description: 'Regal 5-star palace hotel inspired by the Mysore Royal Palace. Lush gardens, rooftop infinity pool, and the legendary Jamavar restaurant serving exquisite Indian cuisine.',
    amenities: JSON.stringify(['ESPA Spa', 'Rooftop Infinity Pool', 'Jamavar Restaurant', 'Free Wi-Fi', 'Airport Transfers', 'Butler Service', 'Library Bar']),
    rooms: JSON.stringify([
      { id: 'RM-401', name: 'Royal Premier Garden Room', bed: '1 King Bed', capacity: '2 Adults', price: 11200, features: ['Garden View', 'Walk-in Closet', 'Complimentary Breakfast', 'Pillow Menu'] },
      { id: 'RM-402', name: 'Maharaja Suite', bed: '1 King Bed + Sitting Room', capacity: '3 Adults', price: 32000, features: ['Panoramic City View', 'Private Jacuzzi', 'Butler Service', 'Complimentary Spa Access'] }
    ])
  },
  {
    id: 'HTL-305',
    name: 'Taj Fort Aguada Resort & Spa',
    location: 'Sinquerim, Candolim, Bardez, Goa',
    city: 'Goa',
    rating: 4.75,
    reviews_count: 3560,
    price_per_night: 8500,
    image: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=800&q=80',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'
    ]),
    description: 'Perched on a hillside overlooking the Arabian Sea atop the ramparts of a 16th-century Portuguese fort. Private beach, Jiva Spa, and stunning sunset views.',
    amenities: JSON.stringify(['Private Beach', 'Jiva Spa', 'Infinity Pool', 'Seafood Restaurant', 'Water Sports', 'Kids Club', 'Yoga Deck']),
    rooms: JSON.stringify([
      { id: 'RM-501', name: 'Premium Sea-View Cottage', bed: '1 King Bed', capacity: '2 Adults, 1 Child', price: 8500, features: ['Sea View Balcony', 'Rain Shower', 'Minibar', 'Complimentary Breakfast'] },
      { id: 'RM-502', name: 'Aguada Suite with Plunge Pool', bed: '1 King Bed + Living Area', capacity: '2 Adults', price: 18500, features: ['Private Plunge Pool', 'Ocean Panorama', 'Sunset Deck', 'Butler Service'] }
    ])
  },
  {
    id: 'HTL-306',
    name: 'Rambagh Palace',
    location: 'Bhawani Singh Road, Jaipur, Rajasthan',
    city: 'Jaipur',
    rating: 4.9,
    reviews_count: 1640,
    price_per_night: 28000,
    image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80'
    ]),
    description: 'The former residence of the Maharaja of Jaipur, this Taj landmark hotel is set on 47 acres of Mughal-style gardens. A living museum of royal Rajasthani heritage.',
    amenities: JSON.stringify(['Jiva Spa', 'Heritage Walk', 'Polo Ground', 'Croquet Lawn', 'Royal Restaurant Suvarna Mahal', 'Outdoor Pool', 'Horse Riding']),
    rooms: JSON.stringify([
      { id: 'RM-601', name: 'Palace Heritage Room', bed: '1 King Bed', capacity: '2 Adults', price: 28000, features: ['Palace Garden View', 'Antique Furnishings', 'Butler Service', 'High Tea Included'] },
      { id: 'RM-602', name: 'Historical Royal Suite', bed: '1 Royal King Bed + Lounge', capacity: '3 Adults', price: 65000, features: ['Mughal Garden View', 'Private Dining Room', 'Vintage Decor', 'Personal Butler & Valet'] }
    ])
  },
  {
    id: 'HTL-307',
    name: 'The Oberoi Mumbai',
    location: 'Nariman Point, Marine Drive, Mumbai',
    city: 'Mumbai',
    rating: 4.8,
    reviews_count: 2940,
    price_per_night: 15500,
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80'
    ]),
    description: 'Ultra-modern luxury hotel at Nariman Point offering panoramic views of Marine Drive and the Arabian Sea. Home to Ziya, the Michelin-recommended Indian restaurant.',
    amenities: JSON.stringify(['Oberoi Spa', 'Outdoor Pool', 'Ziya Restaurant', 'Free Wi-Fi', 'Limousine Service', 'Fitness Centre', 'Champagne Lounge']),
    rooms: JSON.stringify([
      { id: 'RM-701', name: 'Deluxe Ocean View Room', bed: '1 King Bed', capacity: '2 Adults', price: 15500, features: ['Arabian Sea View', 'Marble Bathroom', 'Nespresso Machine', 'Complimentary Breakfast'] },
      { id: 'RM-702', name: 'Oberoi Executive Suite', bed: '1 King Bed + Study', capacity: '2 Adults, 1 Child', price: 35000, features: ['Marine Drive Panorama', 'Separate Living Room', 'Walk-in Wardrobe', 'Evening Canapes'] }
    ])
  },
  {
    id: 'HTL-308',
    name: 'Wildflower Hall Shimla',
    location: 'Chharabra, Shimla, Himachal Pradesh',
    city: 'Shimla',
    rating: 4.88,
    reviews_count: 980,
    price_per_night: 22000,
    image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'
    ]),
    description: 'An Oberoi resort nestled in 22 acres of cedar forest at 8,250 feet, once the residence of Lord Kitchener. Breathtaking Himalayan vistas and pristine mountain air.',
    amenities: JSON.stringify(['Oberoi Spa', 'Indoor Heated Pool', 'Nature Trails', 'Mountain Biking', 'Ice Skating (Winter)', 'Library', 'All-Day Dining']),
    rooms: JSON.stringify([
      { id: 'RM-801', name: 'Premier Valley View Room', bed: '1 King Bed', capacity: '2 Adults', price: 22000, features: ['Himalayan Valley View', 'Fireplace', 'Deep Soaking Tub', 'Complimentary Breakfast'] },
      { id: 'RM-802', name: 'Lord Kitchener Suite', bed: '1 King Bed + Lounge + Balcony', capacity: '3 Adults', price: 55000, features: ['Panoramic Mountain View', 'Private Deck', 'Personal Butler', 'In-Room Spa Treatment'] }
    ])
  },
];

const FLIGHTS = [
  {
    id: 'FL-601',
    airline: 'IndiGo',
    airline_code: '6E',
    flight_number: '6E-2145',
    from_code: 'DEL',
    to_code: 'BOM',
    from_city: 'New Delhi',
    to_city: 'Mumbai',
    departure_time: '06:15 AM',
    arrival_time: '08:30 AM',
    duration: '2h 15m',
    stops: 'Non-stop',
    stop_count: 0,
    price: 4850,
    available_seats: 42,
    aircraft: 'Airbus A320neo',
    amenities: JSON.stringify(['Snacks for Purchase', 'USB Charging', '7kg Cabin Baggage', '15kg Check-in'])
  },
  {
    id: 'FL-602',
    airline: 'Air India',
    airline_code: 'AI',
    flight_number: 'AI-865',
    from_code: 'DEL',
    to_code: 'BLR',
    from_city: 'New Delhi',
    to_city: 'Bengaluru',
    departure_time: '07:00 AM',
    arrival_time: '09:45 AM',
    duration: '2h 45m',
    stops: 'Non-stop',
    stop_count: 0,
    price: 5890,
    available_seats: 28,
    aircraft: 'Airbus A321neo',
    amenities: JSON.stringify(['Hot Meal Included', 'In-flight Entertainment', '25kg Check-in', 'Wi-Fi Available'])
  },
  {
    id: 'FL-603',
    airline: 'Vistara',
    airline_code: 'UK',
    flight_number: 'UK-845',
    from_code: 'BOM',
    to_code: 'BLR',
    from_city: 'Mumbai',
    to_city: 'Bengaluru',
    departure_time: '05:20 PM',
    arrival_time: '07:00 PM',
    duration: '1h 40m',
    stops: 'Non-stop',
    stop_count: 0,
    price: 4200,
    available_seats: 35,
    aircraft: 'Boeing 737-800',
    amenities: JSON.stringify(['Complimentary Meal', 'Extra Legroom Available', '15kg Check-in', 'USB Power'])
  },
  {
    id: 'FL-604',
    airline: 'SpiceJet',
    airline_code: 'SG',
    flight_number: 'SG-422',
    from_code: 'DEL',
    to_code: 'GOI',
    from_city: 'New Delhi',
    to_city: 'Goa',
    departure_time: '11:10 AM',
    arrival_time: '01:40 PM',
    duration: '2h 30m',
    stops: 'Non-stop',
    stop_count: 0,
    price: 5650,
    available_seats: 18,
    aircraft: 'Boeing 737-800',
    amenities: JSON.stringify(['Snack Box for Purchase', 'SpiceMax Upgrade', '7kg Cabin Baggage', '15kg Check-in'])
  },
  {
    id: 'FL-605',
    airline: 'Akasa Air',
    airline_code: 'QP',
    flight_number: 'QP-1308',
    from_code: 'BLR',
    to_code: 'HYD',
    from_city: 'Bengaluru',
    to_city: 'Hyderabad',
    departure_time: '03:10 PM',
    arrival_time: '04:20 PM',
    duration: '1h 10m',
    stops: 'Non-stop',
    stop_count: 0,
    price: 3500,
    available_seats: 55,
    aircraft: 'Boeing 737 MAX 8',
    amenities: JSON.stringify(['Cafe Akasa Meals', 'USB Charging', '7kg Cabin Baggage', '15kg Check-in'])
  },
  {
    id: 'FL-606',
    airline: 'IndiGo',
    airline_code: '6E',
    flight_number: '6E-5327',
    from_code: 'BOM',
    to_code: 'GOI',
    from_city: 'Mumbai',
    to_city: 'Goa',
    departure_time: '08:15 AM',
    arrival_time: '09:25 AM',
    duration: '1h 10m',
    stops: 'Non-stop',
    stop_count: 0,
    price: 3890,
    available_seats: 30,
    aircraft: 'Airbus A320neo',
    amenities: JSON.stringify(['Snacks for Purchase', '7kg Cabin Baggage', '15kg Check-in', 'Standard Seat'])
  },
  {
    id: 'FL-607',
    airline: 'Vistara',
    airline_code: 'UK',
    flight_number: 'UK-712',
    from_code: 'DEL',
    to_code: 'HYD',
    from_city: 'New Delhi',
    to_city: 'Hyderabad',
    departure_time: '09:30 AM',
    arrival_time: '11:50 AM',
    duration: '2h 20m',
    stops: 'Non-stop',
    stop_count: 0,
    price: 5490,
    available_seats: 22,
    aircraft: 'Airbus A321neo',
    amenities: JSON.stringify(['Gourmet Meal', 'In-flight Entertainment', 'Wi-Fi Available', '15kg Check-in'])
  },
  {
    id: 'FL-608',
    airline: 'Air India',
    airline_code: 'AI',
    flight_number: 'AI-020',
    from_code: 'CCU',
    to_code: 'DEL',
    from_city: 'Kolkata',
    to_city: 'New Delhi',
    departure_time: '06:50 AM',
    arrival_time: '09:10 AM',
    duration: '2h 20m',
    stops: 'Non-stop',
    stop_count: 0,
    price: 5200,
    available_seats: 38,
    aircraft: 'Airbus A320neo',
    amenities: JSON.stringify(['Hot Meal Included', 'In-flight Entertainment', '25kg Check-in', 'Blanket & Pillow'])
  },
  {
    id: 'FL-609',
    airline: 'SpiceJet',
    airline_code: 'SG',
    flight_number: 'SG-159',
    from_code: 'MAA',
    to_code: 'DEL',
    from_city: 'Chennai',
    to_city: 'New Delhi',
    departure_time: '02:30 PM',
    arrival_time: '05:15 PM',
    duration: '2h 45m',
    stops: 'Non-stop',
    stop_count: 0,
    price: 4980,
    available_seats: 25,
    aircraft: 'Boeing 737-800',
    amenities: JSON.stringify(['Snack Box for Purchase', 'SpiceMax Upgrade', '7kg Cabin Baggage', '15kg Check-in'])
  },
  {
    id: 'FL-610',
    airline: 'Akasa Air',
    airline_code: 'QP',
    flight_number: 'QP-1542',
    from_code: 'BLR',
    to_code: 'GOI',
    from_city: 'Bengaluru',
    to_city: 'Goa',
    departure_time: '04:45 PM',
    arrival_time: '05:55 PM',
    duration: '1h 10m',
    stops: 'Non-stop',
    stop_count: 0,
    price: 3750,
    available_seats: 48,
    aircraft: 'Boeing 737 MAX 8',
    amenities: JSON.stringify(['Cafe Akasa Meals', 'USB Charging', '7kg Cabin Baggage', '15kg Check-in'])
  },
];

const BUSES = [
  {
    id: 'BUS-101',
    operator: 'RSRTC (Rajasthan Roadways)',
    bus_type: 'Volvo 9600 Multi-Axle A/C Sleeper (2+1)',
    from_city: 'New Delhi',
    to_city: 'Jaipur',
    departure_time: '10:30 PM',
    arrival_time: '04:30 AM',
    duration: '6h 00m',
    rating: 4.5,
    reviews_count: 1420,
    fare: 850,
    available_seats_count: 14,
    total_seats: 30,
    boarding_points: JSON.stringify(['Kashmere Gate ISBT - 10:15 PM', 'Dhaula Kuan - 10:45 PM', 'IFFCO Chowk Gurgaon - 11:15 PM']),
    dropping_points: JSON.stringify(['Sindhi Camp Bus Stand - 04:15 AM', 'Narayan Singh Circle - 04:30 AM']),
    amenities: JSON.stringify(['Blanket & Pillow', 'Charging Point', 'Water Bottle', 'Live GPS Tracking', 'Emergency Exit']),
    booked_seats: JSON.stringify(['U2', 'U5', 'L1', 'L3', 'L8', 'L12', 'U10', 'U14'])
  },
  {
    id: 'BUS-102',
    operator: 'KSRTC Airavat Club Class',
    bus_type: 'Scania Multi-Axle AC Semi-Sleeper (2+2)',
    from_city: 'Bengaluru',
    to_city: 'Hyderabad',
    departure_time: '09:15 PM',
    arrival_time: '06:30 AM',
    duration: '9h 15m',
    rating: 4.7,
    reviews_count: 2850,
    fare: 1250,
    available_seats_count: 16,
    total_seats: 36,
    boarding_points: JSON.stringify(['Majestic Bus Stand - 09:00 PM', 'Hebbal Flyover - 09:30 PM', 'Manyata Tech Park - 09:45 PM']),
    dropping_points: JSON.stringify(['Aramghar Circle - 05:50 AM', 'Mehdipatnam - 06:10 AM', 'Ameerpet - 06:30 AM']),
    amenities: JSON.stringify(['Wi-Fi', 'Charging Point', 'Air Suspension', 'Reading Light', 'Water Bottle']),
    booked_seats: JSON.stringify(['L2', 'L4', 'L9', 'U1', 'U7', 'U11'])
  },
  {
    id: 'BUS-103',
    operator: 'VRL Travels',
    bus_type: 'Volvo 9600 Multi-Axle AC Sleeper (2+1)',
    from_city: 'Mumbai',
    to_city: 'Goa',
    departure_time: '08:00 PM',
    arrival_time: '07:30 AM',
    duration: '11h 30m',
    rating: 4.9,
    reviews_count: 4240,
    fare: 1450,
    available_seats_count: 8,
    total_seats: 30,
    boarding_points: JSON.stringify(['Borivali West - 07:30 PM', 'Dadar TT Circle - 08:00 PM', 'Vashi Toll Plaza - 09:15 PM']),
    dropping_points: JSON.stringify(['Mapusa Bus Stand - 06:45 AM', 'Panaji KTC Stand - 07:15 AM', 'Margao Kadamba Stand - 07:45 AM']),
    amenities: JSON.stringify(['Fresh Linen', 'Snacks Box', 'USB Charger', 'GPS Tracking', 'Emergency Contact']),
    booked_seats: JSON.stringify(['L1', 'L3', 'L5', 'L7', 'U2', 'U6', 'U9', 'U11', 'U13'])
  },
  {
    id: 'BUS-104',
    operator: 'Orange Travels (RedBus)',
    bus_type: 'Bharat Benz AC Sleeper (2+1)',
    from_city: 'Bengaluru',
    to_city: 'Chennai',
    departure_time: '11:00 PM',
    arrival_time: '05:30 AM',
    duration: '6h 30m',
    rating: 4.6,
    reviews_count: 1960,
    fare: 750,
    available_seats_count: 18,
    total_seats: 30,
    boarding_points: JSON.stringify(['Madiwala - 10:45 PM', 'Electronic City Toll - 11:15 PM', 'Hosur Bus Stand - 11:45 PM']),
    dropping_points: JSON.stringify(['Sriperumbudur - 04:45 AM', 'Koyambedu CMBT - 05:30 AM']),
    amenities: JSON.stringify(['Personal Audio Jack', 'Water Bottle', 'Reclining Push-Back Seats', 'Charging Point']),
    booked_seats: JSON.stringify(['S1', 'S2', 'S9', 'S10', 'S18', 'S24'])
  },
  {
    id: 'BUS-105',
    operator: 'SRS Travels',
    bus_type: 'Mercedes Benz Multi-Axle AC Sleeper (2+1)',
    from_city: 'Pune',
    to_city: 'Mumbai',
    departure_time: '06:00 AM',
    arrival_time: '09:30 AM',
    duration: '3h 30m',
    rating: 4.4,
    reviews_count: 3420,
    fare: 450,
    available_seats_count: 22,
    total_seats: 36,
    boarding_points: JSON.stringify(['Swargate Bus Stand - 05:45 AM', 'Wakad - 06:15 AM', 'Hinjawadi IT Park - 06:30 AM']),
    dropping_points: JSON.stringify(['Thane Station - 09:00 AM', 'Dadar TT - 09:30 AM']),
    amenities: JSON.stringify(['Wi-Fi', 'Air Suspension', 'Reading Light', 'Charging Point']),
    booked_seats: JSON.stringify(['L3', 'L5', 'U2', 'U8'])
  },
  {
    id: 'BUS-106',
    operator: 'TSRTC Garuda Plus',
    bus_type: 'Volvo 9600 AC Semi-Sleeper (2+2)',
    from_city: 'Hyderabad',
    to_city: 'Chennai',
    departure_time: '09:00 PM',
    arrival_time: '06:00 AM',
    duration: '9h 00m',
    rating: 4.5,
    reviews_count: 2180,
    fare: 1100,
    available_seats_count: 20,
    total_seats: 40,
    boarding_points: JSON.stringify(['MGBS Bus Station - 08:45 PM', 'Dilsukhnagar - 09:15 PM', 'LB Nagar - 09:30 PM']),
    dropping_points: JSON.stringify(['Sriperumbudur - 05:15 AM', 'Koyambedu CMBT - 06:00 AM']),
    amenities: JSON.stringify(['Blanket', 'Charging Point', 'Water Bottle', 'Live Tracking']),
    booked_seats: JSON.stringify(['L1', 'L6', 'U3', 'U9', 'U15'])
  },
  {
    id: 'BUS-107',
    operator: 'Neeta Travels',
    bus_type: 'Scania AC Sleeper (2+1)',
    from_city: 'New Delhi',
    to_city: 'Agra',
    departure_time: '06:30 AM',
    arrival_time: '10:30 AM',
    duration: '4h 00m',
    rating: 4.3,
    reviews_count: 890,
    fare: 550,
    available_seats_count: 20,
    total_seats: 30,
    boarding_points: JSON.stringify(['ISBT Anand Vihar - 06:15 AM', 'Noida Sector 62 - 06:45 AM', 'Greater Noida Toll - 07:10 AM']),
    dropping_points: JSON.stringify(['Sikandra - 10:00 AM', 'Agra Idgah Bus Stand - 10:30 AM']),
    amenities: JSON.stringify(['Wi-Fi', 'USB Charger', 'Reclining Seats', 'Water Bottle']),
    booked_seats: JSON.stringify(['L2', 'L4', 'U5', 'U7'])
  },
  {
    id: 'BUS-108',
    operator: 'Paulo Travels',
    bus_type: 'Volvo 9600 AC Sleeper (2+1)',
    from_city: 'Mumbai',
    to_city: 'Pune',
    departure_time: '07:00 PM',
    arrival_time: '10:30 PM',
    duration: '3h 30m',
    rating: 4.8,
    reviews_count: 5120,
    fare: 550,
    available_seats_count: 10,
    total_seats: 30,
    boarding_points: JSON.stringify(['Borivali East - 06:30 PM', 'Dadar TT Circle - 07:00 PM', 'Sion - 07:20 PM']),
    dropping_points: JSON.stringify(['Wakad - 10:00 PM', 'Shivajinagar - 10:15 PM', 'Swargate - 10:30 PM']),
    amenities: JSON.stringify(['Fresh Linen', 'Snacks', 'USB Charger', 'GPS Tracking', 'Blanket & Pillow']),
    booked_seats: JSON.stringify(['L1', 'L2', 'L3', 'L6', 'L9', 'U1', 'U4', 'U7', 'U10', 'U12'])
  },
];

const PROPERTIES = [
  {
    id: 'PROP-501',
    purpose: 'buy',
    title: '3BHK Luxury Apartment in Indiranagar',
    location: 'Indiranagar 100ft Road, Bengaluru',
    city: 'Bengaluru',
    price: 24500000,
    price_display: '₹2.45 Cr',
    property_type: 'Luxury Apartment',
    bedrooms: 3,
    bathrooms: 3,
    area_sqft: 2150,
    furnished: 'Semi-Furnished',
    featured: true,
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80'
    ]),
    description: 'Premium vastu-compliant apartment in the heart of Indiranagar. Double-glazed acoustic windows, VRV air-conditioning, Italian marble flooring, and modular kitchen with Hettich fittings.',
    amenities: JSON.stringify(['Olympic Lap Pool', 'Tennis Court', 'Clubhouse', 'Rainwater Harvesting', 'Children Play Area', 'Power Backup']),
    agent: JSON.stringify({
      id: 'AGT-01',
      name: 'Priya Sharma - NestAway Realty',
      phone: '+91 98450 12345',
      email: 'priya.sharma@nestawayrealty.com',
      avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=200&q=80',
      rating: 4.9,
      activeListings: 22
    })
  },
  {
    id: 'PROP-502',
    purpose: 'rent',
    title: '2BHK Fully Furnished Flat in Bandra West',
    location: 'Bandra West, Mumbai',
    city: 'Mumbai',
    price: 185000,
    price_display: '₹1.85 Lakh / mo',
    property_type: 'Luxury Apartment',
    bedrooms: 2,
    bathrooms: 2,
    area_sqft: 1400,
    furnished: 'Fully Furnished',
    featured: true,
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80'
    ]),
    description: 'Tastefully furnished designer apartment in prime Bandra West. Walking distance to Bandstand, Carter Road, and Linking Road. Modular kitchen, smart home automation, 1 Gbps fiber.',
    amenities: JSON.stringify(['Sea View', 'Gym & Swimming Pool', 'Clubhouse', 'Covered Parking', 'High-Speed Elevators', 'Power Backup']),
    agent: JSON.stringify({
      id: 'AGT-02',
      name: 'Rajesh Menon - Apex Luxury Living',
      phone: '+91 98200 98765',
      email: 'rajesh.menon@apexluxury.com',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80',
      rating: 4.85,
      activeListings: 28
    })
  },
  {
    id: 'PROP-503',
    purpose: 'buy',
    title: '4BHK Premium Villa in Jubilee Hills',
    location: 'Jubilee Hills Road No. 36, Hyderabad',
    city: 'Hyderabad',
    price: 37500000,
    price_display: '₹3.75 Cr',
    property_type: 'Villa / Independent House',
    bedrooms: 4,
    bathrooms: 5,
    area_sqft: 3800,
    furnished: 'Semi-Furnished',
    featured: true,
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80'
    ]),
    description: 'Luxurious independent villa in the prestigious Jubilee Hills enclave. Double-height living room, private landscaped garden, home theatre, and terrace garden with city view.',
    amenities: JSON.stringify(['Private Garden', 'Home Theatre', 'Terrace Garden', 'Modular Kitchen', '3 Car Garage', '24/7 Security']),
    agent: JSON.stringify({
      id: 'AGT-03',
      name: 'Anitha Reddy - UrbanSpace Properties',
      phone: '+91 98490 55432',
      email: 'anitha.reddy@urbanspace.com',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
      rating: 4.8,
      activeListings: 15
    })
  },
  {
    id: 'PROP-504',
    purpose: 'buy',
    title: '5BHK Heritage Bungalow in Vasant Vihar',
    location: 'Vasant Vihar, New Delhi',
    city: 'New Delhi',
    price: 125000000,
    price_display: '₹12.5 Cr',
    property_type: 'Villa / Independent House',
    bedrooms: 5,
    bathrooms: 6,
    area_sqft: 5200,
    furnished: 'Semi-Furnished',
    featured: true,
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'
    ]),
    description: 'Prestigious diplomatic enclave bungalow with sprawling lawns, servant quarters, private elevator, home cinema, and modular barbecue patio. Minutes from embassies and Vasant Kunj malls.',
    amenities: JSON.stringify(['Private Elevator', 'Home Cinema', 'Sprawling Lawn', 'Guard Room', 'Barbecue Patio', 'Solar Panels']),
    agent: JSON.stringify({
      id: 'AGT-04',
      name: 'Vikram Khanna - Heritage Realtors Delhi',
      phone: '+91 99100 44321',
      email: 'vikram.khanna@heritagerealtors.in',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      rating: 4.92,
      activeListings: 10
    })
  },
  {
    id: 'PROP-505',
    purpose: 'rent',
    title: '2BHK Smart Apartment near Whitefield IT Hub',
    location: 'Whitefield, Bengaluru',
    city: 'Bengaluru',
    price: 45000,
    price_display: '₹45,000 / mo',
    property_type: 'Luxury Apartment',
    bedrooms: 2,
    bathrooms: 2,
    area_sqft: 1250,
    furnished: 'Fully Furnished',
    featured: false,
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80'
    ]),
    description: 'Smart-home enabled furnished apartment with workstation setup, ergonomic chairs, smart TVs, washer-dryer combo, and modular kitchen with appliances. 1 Gbps fiber-ready.',
    amenities: JSON.stringify(['Power Backup', 'Swimming Pool', 'Gym & Yoga Room', 'Covered Parking', 'Supermarket on Campus', 'EV Charging']),
    agent: JSON.stringify({
      id: 'AGT-05',
      name: 'Deepak Nair - NestAway Realty',
      phone: '+91 98450 67890',
      email: 'deepak.nair@nestawayrealty.com',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      rating: 4.75,
      activeListings: 14
    })
  },
  {
    id: 'PROP-506',
    purpose: 'buy',
    title: '3BHK Sea-View Apartment in Dona Paula',
    location: 'Dona Paula, Panaji, Goa',
    city: 'Goa',
    price: 19500000,
    price_display: '₹1.95 Cr',
    property_type: 'Luxury Apartment',
    bedrooms: 3,
    bathrooms: 3,
    area_sqft: 1850,
    furnished: 'Semi-Furnished',
    featured: false,
    image: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=800&q=80',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80'
    ]),
    description: 'Stunning sea-facing apartment at the tip of Dona Paula overlooking the Mandovi river confluence. Open balcony with 180-degree ocean view, Italian flooring, and modern fittings.',
    amenities: JSON.stringify(['Sea View', 'Infinity Pool', 'Clubhouse', 'Landscaped Garden', 'Covered Parking', '24/7 Security']),
    agent: JSON.stringify({
      id: 'AGT-06',
      name: 'Sameer D\'Souza - Goa Coastal Properties',
      phone: '+91 98220 33456',
      email: 'sameer@goacoastal.com',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
      rating: 4.82,
      activeListings: 19
    })
  },
];

const PRACTITIONERS = [
  {
    id: 'PRAC-001',
    name: 'Dr. Arjun Rao, BAMS, MD(Ayu)',
    category: 'ayurveda',
    specialization: 'Ayurvedic Medicine & Chronic Dosha Detox',
    qualifications: 'BAMS (Kerala Ayurveda Academy), MD (Ayurveda) - 14+ Years Experience',
    experience_years: 14,
    rating: 4.95,
    reviews_count: 310,
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80',
    location: 'Indiranagar Clinic, Bengaluru & Online Telehealth',
    consultation_mode: 'In-Person & Online Video',
    duration: '45 mins',
    price: 1200,
    about: 'Senior Ayurvedic physician specializing in gut biome balance, chronic inflammation, Panchakarma detox therapies, and personalized herbal formulations for long-term wellness.',
    available_dates: JSON.stringify(['Today', 'Tomorrow', 'This Friday', 'This Saturday']),
    available_slots: JSON.stringify(['10:00 AM', '11:30 AM', '03:00 PM', '04:30 PM', '06:00 PM'])
  },
  {
    id: 'PRAC-002',
    name: 'Kavitha Nair, RYT-500',
    category: 'yoga',
    specialization: 'Therapeutic Hatha & Ashtanga Vinyasa, Pranayama',
    qualifications: 'Certified Yoga Alliance RYT-500, Rishikesh Yogpeeth Graduate',
    experience_years: 9,
    rating: 4.88,
    reviews_count: 245,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    location: 'Rishikesh Studio & Online Virtual Sessions',
    consultation_mode: 'Online 1-on-1 Video Session',
    duration: '60 mins',
    price: 800,
    about: 'Guiding conscious movement, alignment-based postures, stress reduction breathwork (Pranayama), and restorative spine health for all experience levels.',
    available_dates: JSON.stringify(['Today', 'Tomorrow', 'This Thursday', 'This Saturday']),
    available_slots: JSON.stringify(['07:00 AM', '08:30 AM', '05:00 PM', '06:30 PM'])
  },
  {
    id: 'PRAC-003',
    name: 'Dr. Priya Sharma, MPT',
    category: 'physiotherapy',
    specialization: 'Sports Injury Rehabilitation & Postural Ergonomics',
    qualifications: 'MPT (Neuromusculoskeletal), Certified Dry Needling Specialist',
    experience_years: 11,
    rating: 4.92,
    reviews_count: 180,
    avatar: 'https://images.unsplash.com/photo-1594824813637-280df0c56345?auto=format&fit=crop&w=400&q=80',
    location: 'Pulse Sports & Rehab Centre, New Delhi',
    consultation_mode: 'In-Person Clinic Visit',
    duration: '50 mins',
    price: 1500,
    about: 'Evidence-based physiotherapy for sciatica, frozen shoulder, athletic strain recovery, and bespoke post-operative rehabilitation programs.',
    available_dates: JSON.stringify(['Tomorrow', 'This Thursday', 'This Friday']),
    available_slots: JSON.stringify(['11:00 AM', '01:00 PM', '03:30 PM', '05:30 PM'])
  },
  {
    id: 'PRAC-004',
    name: 'Swami Anand Giri',
    category: 'meditation',
    specialization: 'Tibetan Singing Bowl Therapy & Vipassana Mindfulness',
    qualifications: 'Sound Meditation Master (Dharamsala), Mindfulness Coach - 15+ Years Practice',
    experience_years: 15,
    rating: 4.9,
    reviews_count: 165,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    location: 'Dharamsala Meditation Centre & Online Sessions',
    consultation_mode: 'Online Video or In-Person Session',
    duration: '45 mins',
    price: 950,
    about: 'Harmonize your nervous system through therapeutic sound frequencies, guided visual meditations, and somatic emotional release for deep inner calm.',
    available_dates: JSON.stringify(['Today', 'Tomorrow', 'This Sunday']),
    available_slots: JSON.stringify(['09:30 AM', '04:00 PM', '07:00 PM', '08:30 PM'])
  },
  {
    id: 'PRAC-005',
    name: 'Dr. Sneha Patel, MSc RD',
    category: 'nutrition',
    specialization: 'Hormonal Health (PCOS/Thyroid) & Gut Microbiome',
    qualifications: 'MSc Clinical Nutrition, Registered Dietitian, Monash University FODMAP Certified',
    experience_years: 8,
    rating: 4.87,
    reviews_count: 220,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    location: 'Virtual Health Suite & Clinic, Mumbai',
    consultation_mode: 'Online Video Consultation',
    duration: '40 mins',
    price: 1100,
    about: 'Holistic dietetics addressing metabolic health, anti-inflammatory nutrition, sustainable lifestyle changes, and evidence-based gut healing protocols.',
    available_dates: JSON.stringify(['Tomorrow', 'This Friday', 'This Saturday']),
    available_slots: JSON.stringify(['10:30 AM', '02:00 PM', '04:00 PM', '06:00 PM'])
  },
  {
    id: 'PRAC-006',
    name: 'Dr. Vikram Menon, DNYS',
    category: 'alternative',
    specialization: 'Acupuncture & Traditional Meridian Healing',
    qualifications: 'Doctor of Naturopathy & Yogic Sciences, Certified Acupuncturist (Beijing)',
    experience_years: 12,
    rating: 4.93,
    reviews_count: 140,
    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=400&q=80',
    location: 'Natural Healing Sanctuary, Panaji, Goa',
    consultation_mode: 'In-Person Clinic Visit',
    duration: '60 mins',
    price: 1600,
    about: 'Restoring chi flow and alleviating chronic migraine, joint pain, and sleep disorders using sterile ultra-fine meridian needle stimulation and naturopathic protocols.',
    available_dates: JSON.stringify(['This Thursday', 'This Friday', 'This Saturday']),
    available_slots: JSON.stringify(['10:00 AM', '12:00 PM', '03:00 PM', '05:00 PM'])
  },
  {
    id: 'PRAC-007',
    name: 'Dr. Lakshmi Iyer, MD Psychiatry',
    category: 'mental_wellness',
    specialization: 'CBT, Trauma Therapy & Anxiety Management',
    qualifications: 'MD Psychiatry (NIMHANS), Certified CBT Therapist - 16 Years Experience',
    experience_years: 16,
    rating: 4.96,
    reviews_count: 340,
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80',
    location: 'Mind Wellness Clinic, T. Nagar, Chennai',
    consultation_mode: 'In-Person & Online Video',
    duration: '50 mins',
    price: 2000,
    about: 'Compassionate psychiatric care specializing in Cognitive Behavioural Therapy (CBT), trauma-informed therapy, anxiety & depression management, and workplace burnout counselling.',
    available_dates: JSON.stringify(['Today', 'Tomorrow', 'This Wednesday', 'This Friday']),
    available_slots: JSON.stringify(['10:00 AM', '12:00 PM', '02:30 PM', '04:30 PM', '06:30 PM'])
  },
  {
    id: 'PRAC-008',
    name: 'Guru Ramesh Bhat',
    category: 'ayurveda',
    specialization: 'Traditional Panchakarma & Kerala Ayurveda',
    qualifications: 'Vaidya (Traditional Ayurveda Guru Lineage), 25+ Years in Panchakarma Practice',
    experience_years: 25,
    rating: 4.94,
    reviews_count: 420,
    avatar: 'https://images.unsplash.com/photo-1566753323558-f4e0952af115?auto=format&fit=crop&w=400&q=80',
    location: 'Ayurveda Heritage Centre, Thiruvananthapuram, Kerala',
    consultation_mode: 'In-Person Treatment & Consultation',
    duration: '60 mins',
    price: 1400,
    about: 'Master Panchakarma therapist offering authentic Kerala Ayurvedic treatments including Abhyanga, Shirodhara, Basti, and personalized detox programmes rooted in ancient Vedic tradition.',
    available_dates: JSON.stringify(['Tomorrow', 'This Thursday', 'This Saturday', 'Next Monday']),
    available_slots: JSON.stringify(['08:00 AM', '10:00 AM', '02:00 PM', '04:00 PM'])
  },
];

// ---------------------------------------------------------------------------
// Helper: build INSERT query
// ---------------------------------------------------------------------------
function buildInsert(table, columns, rows) {
  const placeholders = rows.map((_, rowIdx) => {
    const cols = columns.map((_, colIdx) => `$${rowIdx * columns.length + colIdx + 1}`);
    return `(${cols.join(', ')})`;
  });

  const values = rows.flatMap((row) => columns.map((col) => row[col]));

  return {
    text: `INSERT INTO ${table} (${columns.join(', ')}) VALUES ${placeholders.join(', ')} ON CONFLICT (id) DO NOTHING`,
    values,
  };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  const client = await pool.connect();
  try {
    console.log('[seed] Connected to PostgreSQL');

    // 1. Create tables
    console.log('[seed] Creating tables if not exist...');
    await client.query(CREATE_TABLES_SQL);
    console.log('[seed] Tables ready.');

    // 2. Clear old seed data
    console.log('[seed] Clearing existing data...');
    await client.query('DELETE FROM practitioners');
    await client.query('DELETE FROM properties');
    await client.query('DELETE FROM buses');
    await client.query('DELETE FROM flights');
    await client.query('DELETE FROM hotels');
    console.log('[seed] Old data cleared.');

    // 3. Seed Hotels
    console.log('[seed] Inserting 8 hotels...');
    const hotelCols = ['id', 'name', 'location', 'city', 'rating', 'reviews_count', 'price_per_night', 'image', 'images', 'description', 'amenities', 'rooms'];
    const hotelQuery = buildInsert('hotels', hotelCols, HOTELS);
    await client.query(hotelQuery);
    console.log('[seed] Hotels seeded.');

    // 4. Seed Flights
    console.log('[seed] Inserting 10 flights...');
    const flightCols = ['id', 'airline', 'airline_code', 'flight_number', 'from_code', 'to_code', 'from_city', 'to_city', 'departure_time', 'arrival_time', 'duration', 'stops', 'stop_count', 'price', 'available_seats', 'aircraft', 'amenities'];
    const flightQuery = buildInsert('flights', flightCols, FLIGHTS);
    await client.query(flightQuery);
    console.log('[seed] Flights seeded.');

    // 5. Seed Buses
    console.log('[seed] Inserting 8 buses...');
    const busCols = ['id', 'operator', 'bus_type', 'from_city', 'to_city', 'departure_time', 'arrival_time', 'duration', 'rating', 'reviews_count', 'fare', 'available_seats_count', 'total_seats', 'boarding_points', 'dropping_points', 'amenities', 'booked_seats'];
    const busQuery = buildInsert('buses', busCols, BUSES);
    await client.query(busQuery);
    console.log('[seed] Buses seeded.');

    // 6. Seed Properties
    console.log('[seed] Inserting 6 properties...');
    const propCols = ['id', 'purpose', 'title', 'location', 'city', 'price', 'price_display', 'property_type', 'bedrooms', 'bathrooms', 'area_sqft', 'furnished', 'featured', 'image', 'images', 'description', 'amenities', 'agent'];
    const propQuery = buildInsert('properties', propCols, PROPERTIES);
    await client.query(propQuery);
    console.log('[seed] Properties seeded.');

    // 7. Seed Practitioners
    console.log('[seed] Inserting 8 practitioners...');
    const pracCols = ['id', 'name', 'category', 'specialization', 'qualifications', 'experience_years', 'rating', 'reviews_count', 'avatar', 'location', 'consultation_mode', 'duration', 'price', 'about', 'available_dates', 'available_slots'];
    const pracQuery = buildInsert('practitioners', pracCols, PRACTITIONERS);
    await client.query(pracQuery);
    console.log('[seed] Practitioners seeded.');

    console.log('\n[seed] All 5 service tables seeded successfully!');
    console.log('  - Hotels:        8 records');
    console.log('  - Flights:      10 records');
    console.log('  - Buses:         8 records');
    console.log('  - Properties:    6 records');
    console.log('  - Practitioners: 8 records');
    console.log('  TOTAL:          40 records\n');
  } catch (err) {
    console.error('[seed] ERROR:', err.message);
    console.error(err.stack);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
    console.log('[seed] Database connection closed.');
  }
}

main();
