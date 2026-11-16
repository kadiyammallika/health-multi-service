const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres.avdpakmhsvdqwjuzulcl:Mallika%40507@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true',
  ssl: { rejectUnauthorized: false },
});

const PROVIDER_ID = 'c5bd3b6b-7309-4e39-87f6-517c9f7210ed';

const listings = [
  // ===== 5 FLIGHTS =====
  {
    service_type: 'flights',
    title: 'IndiGo 6E-6013',
    description: 'IndiGo daily morning flight from Bengaluru to Mumbai. Non-stop service on Airbus A320neo.',
    price: 4850,
    details: {
      airlineName: 'IndiGo',
      flightNumber: '6E-6013',
      from: 'Bengaluru',
      to: 'Mumbai',
      departureTime: '07:10 AM',
      arrivalTime: '09:15 AM',
      duration: '2h 05m',
      aircraftType: 'Airbus A320neo',
      stops: 'Non-stop',
      availableSeats: '180',
      imageUrl: 'https://images.unsplash.com/photo-1436491865332-7a61a109db05?w=800'
    }
  },
  {
    service_type: 'flights',
    title: 'Air India AI-505',
    description: 'Air India direct flight from New Delhi to Chennai. Premium service on Airbus A321neo.',
    price: 5200,
    details: {
      airlineName: 'Air India',
      flightNumber: 'AI-505',
      from: 'New Delhi',
      to: 'Chennai',
      departureTime: '10:30 AM',
      arrivalTime: '01:15 PM',
      duration: '2h 45m',
      aircraftType: 'Airbus A321neo',
      stops: 'Non-stop',
      availableSeats: '190',
      imageUrl: 'https://images.unsplash.com/photo-1529074963764-98f45c47344b?w=800'
    }
  },
  {
    service_type: 'flights',
    title: 'Vistara UK-835',
    description: 'Vistara premium flight from Mumbai to Bengaluru. Full-service carrier with complimentary meals.',
    price: 4200,
    details: {
      airlineName: 'Vistara',
      flightNumber: 'UK-835',
      from: 'Mumbai',
      to: 'Bengaluru',
      departureTime: '06:00 AM',
      arrivalTime: '07:45 AM',
      duration: '1h 45m',
      aircraftType: 'Boeing 737-800',
      stops: 'Non-stop',
      availableSeats: '168',
      imageUrl: 'https://images.unsplash.com/photo-1570710891163-6d3b5c47248b?w=800'
    }
  },
  {
    service_type: 'flights',
    title: 'SpiceJet SG-277',
    description: 'SpiceJet afternoon flight from Hyderabad to New Delhi. Budget-friendly non-stop service.',
    price: 3800,
    details: {
      airlineName: 'SpiceJet',
      flightNumber: 'SG-277',
      from: 'Hyderabad',
      to: 'New Delhi',
      departureTime: '02:15 PM',
      arrivalTime: '04:30 PM',
      duration: '2h 15m',
      aircraftType: 'Boeing 737 MAX 8',
      stops: 'Non-stop',
      availableSeats: '189',
      imageUrl: 'https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?w=800'
    }
  },
  {
    service_type: 'flights',
    title: 'Akasa Air QP-1372',
    description: 'Akasa Air connecting flight from Bengaluru to Delhi via Mumbai. Modern Boeing 737 MAX fleet.',
    price: 5500,
    details: {
      airlineName: 'Akasa Air',
      flightNumber: 'QP-1372',
      from: 'Bengaluru',
      to: 'New Delhi',
      departureTime: '08:45 AM',
      arrivalTime: '01:30 PM',
      duration: '4h 45m',
      aircraftType: 'Boeing 737 MAX 8',
      stops: '1 Stop (Mumbai)',
      availableSeats: '174',
      imageUrl: 'https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=800'
    }
  },

  // ===== 5 BUSES =====
  {
    service_type: 'buses',
    title: 'VRL Travels - Bengaluru to Goa',
    description: 'VRL Travels AC Sleeper bus from Bengaluru to Goa. Overnight journey with comfortable berths.',
    price: 1200,
    details: {
      operatorName: 'VRL Travels',
      busNumber: 'KA-51-AF-7890',
      from: 'Bengaluru',
      to: 'Goa',
      departureTime: '09:30 PM',
      arrivalTime: '06:00 AM',
      duration: '8h 30m',
      busType: 'AC Sleeper',
      availableSeats: '36',
      imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800'
    }
  },
  {
    service_type: 'buses',
    title: 'KSRTC Airavat - Bengaluru to Mysuru',
    description: 'KSRTC Airavat Club Class from Bengaluru to Mysuru. Government-operated premium AC seater.',
    price: 450,
    details: {
      operatorName: 'KSRTC Airavat',
      busNumber: 'KA-57-F-3241',
      from: 'Bengaluru',
      to: 'Mysuru',
      departureTime: '07:00 AM',
      arrivalTime: '10:30 AM',
      duration: '3h 30m',
      busType: 'AC Seater',
      availableSeats: '45',
      imageUrl: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800'
    }
  },
  {
    service_type: 'buses',
    title: 'Orange Travels - Hyderabad to Vijayawada',
    description: 'Orange Travels AC Sleeper from Hyderabad to Vijayawada. Popular overnight route in Telangana.',
    price: 850,
    details: {
      operatorName: 'Orange Travels',
      busNumber: 'AP-28-TC-5567',
      from: 'Hyderabad',
      to: 'Vijayawada',
      departureTime: '11:00 PM',
      arrivalTime: '05:30 AM',
      duration: '6h 30m',
      busType: 'AC Sleeper',
      availableSeats: '30',
      imageUrl: 'https://images.unsplash.com/photo-1557223562-6c77ef16210f?w=800'
    }
  },
  {
    service_type: 'buses',
    title: 'SRS Travels - Chennai to Bengaluru',
    description: 'SRS Travels Multi-Axle Volvo from Chennai to Bengaluru. Premium highway service.',
    price: 950,
    details: {
      operatorName: 'SRS Travels',
      busNumber: 'KA-01-AJ-9912',
      from: 'Chennai',
      to: 'Bengaluru',
      departureTime: '10:30 PM',
      arrivalTime: '05:00 AM',
      duration: '6h 30m',
      busType: 'Volvo Multi-Axle',
      availableSeats: '40',
      imageUrl: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800'
    }
  },
  {
    service_type: 'buses',
    title: 'TSRTC Garuda - Hyderabad to Tirupati',
    description: 'TSRTC Garuda Plus AC bus from Hyderabad to Tirupati. Government-operated temple route.',
    price: 1100,
    details: {
      operatorName: 'TSRTC Garuda',
      busNumber: 'TS-08-UF-4455',
      from: 'Hyderabad',
      to: 'Tirupati',
      departureTime: '08:00 PM',
      arrivalTime: '06:30 AM',
      duration: '10h 30m',
      busType: 'AC Seater',
      availableSeats: '48',
      imageUrl: 'https://images.unsplash.com/photo-1464219789935-c2d9d9aba644?w=800'
    }
  },

  // ===== 5 HOTELS =====
  {
    service_type: 'hotels',
    title: 'Taj Lake Palace',
    description: 'Heritage luxury hotel floating on Lake Pichola, Udaipur. One of the most romantic hotels in the world.',
    price: 28000,
    details: {
      hotelName: 'Taj Lake Palace',
      city: 'Udaipur',
      address: 'Pichola Lake, Udaipur, Rajasthan 313001',
      roomType: 'Luxury Suite',
      starRating: '5 Star',
      amenities: 'WiFi, Pool, Spa, Restaurant, Lake View, Butler Service, Gym',
      checkIn: '2:00 PM',
      checkOut: '12:00 PM',
      availableRooms: '35',
      imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'
    }
  },
  {
    service_type: 'hotels',
    title: 'ITC Grand Chola',
    description: 'Luxury 5-star hotel in Chennai inspired by the Chola dynasty. ITC Hotels premium brand.',
    price: 12000,
    details: {
      hotelName: 'ITC Grand Chola',
      city: 'Chennai',
      address: '63 Mount Road, Guindy, Chennai, Tamil Nadu 600032',
      roomType: 'Deluxe Room',
      starRating: '5 Star',
      amenities: 'WiFi, Pool, Spa, Gym, Restaurant, Business Centre, Parking',
      checkIn: '2:00 PM',
      checkOut: '11:00 AM',
      availableRooms: '60',
      imageUrl: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800'
    }
  },
  {
    service_type: 'hotels',
    title: 'The Leela Palace Bengaluru',
    description: 'Ultra-luxury 5-star hotel on Old Airport Road, Bengaluru. Award-winning hospitality.',
    price: 18000,
    details: {
      hotelName: 'The Leela Palace',
      city: 'Bengaluru',
      address: '23 HAL Old Airport Road, Bengaluru, Karnataka 560008',
      roomType: 'Royal Premier Room',
      starRating: '5 Star',
      amenities: 'WiFi, Pool, Spa, Gym, Fine Dining, Concierge, Garden',
      checkIn: '3:00 PM',
      checkOut: '12:00 PM',
      availableRooms: '45',
      imageUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800'
    }
  },
  {
    service_type: 'hotels',
    title: 'Radisson Blu Plaza Hyderabad',
    description: 'Premium 4-star hotel in Banjara Hills, Hyderabad. Ideal for business and leisure travelers.',
    price: 6500,
    details: {
      hotelName: 'Radisson Blu Plaza',
      city: 'Hyderabad',
      address: '8-2-409, Road No 6, Banjara Hills, Hyderabad 500034',
      roomType: 'Standard Room',
      starRating: '4 Star',
      amenities: 'WiFi, Pool, Gym, Restaurant, Parking, Laundry, Bar',
      checkIn: '2:00 PM',
      checkOut: '11:00 AM',
      availableRooms: '80',
      imageUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800'
    }
  },
  {
    service_type: 'hotels',
    title: 'Taj Fort Aguada Resort Goa',
    description: 'Beachfront 5-star resort on Sinquerim Beach, Goa. Built on a 16th-century Portuguese fort.',
    price: 22000,
    details: {
      hotelName: 'Taj Fort Aguada Resort & Spa',
      city: 'Goa',
      address: 'Sinquerim, Candolim, Bardez, Goa 403515',
      roomType: 'Premium Sea View Room',
      starRating: '5 Star',
      amenities: 'WiFi, Private Beach, Pool, Spa, Gym, Restaurant, Water Sports',
      checkIn: '2:00 PM',
      checkOut: '12:00 PM',
      availableRooms: '50',
      imageUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800'
    }
  },

  // ===== 5 HEALTH & HEALING (wellness) =====
  {
    service_type: 'wellness',
    title: 'Dr. Arjun Rao Ayurveda Clinic',
    description: 'Experienced Ayurvedic practitioner offering Panchakarma, herbal consultations, and traditional treatments.',
    price: 1200,
    details: {
      practitionerName: 'Dr. Arjun Rao Ayurveda Clinic',
      specialization: 'Ayurveda & Panchakarma',
      qualifications: 'BAMS, MD (Ayurveda), 14+ Years Experience',
      location: 'Indiranagar, Bengaluru',
      consultationMode: 'Both In-Person & Online',
      sessionDuration: '45 mins',
      availableSlots: '10:00 AM, 11:30 AM, 2:00 PM, 4:00 PM',
      category: 'Ayurveda',
      imageUrl: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=800'
    }
  },
  {
    service_type: 'wellness',
    title: 'Kavitha Nair Yoga Studio',
    description: 'Certified yoga therapist specializing in Hatha Yoga, Pranayama, and mindfulness meditation.',
    price: 800,
    details: {
      practitionerName: 'Kavitha Nair Yoga Studio',
      specialization: 'Yoga Therapy & Pranayama',
      qualifications: 'RYT-500, MSc Yoga Science, 10+ Years',
      location: 'Koramangala, Bengaluru',
      consultationMode: 'Both In-Person & Online',
      sessionDuration: '60 mins',
      availableSlots: '6:00 AM, 7:30 AM, 5:00 PM, 6:30 PM',
      category: 'Yoga',
      imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800'
    }
  },
  {
    service_type: 'wellness',
    title: 'Dr. Priya Sharma Physiotherapy Centre',
    description: 'Specialized orthopaedic physiotherapy and sports rehabilitation. Advanced manual therapy techniques.',
    price: 1500,
    details: {
      practitionerName: 'Dr. Priya Sharma Physiotherapy Centre',
      specialization: 'Ortho Physiotherapy & Sports Rehab',
      qualifications: 'BPT, MPT (Ortho), MIAP, 8+ Years',
      location: 'Banjara Hills, Hyderabad',
      consultationMode: 'In-Person',
      sessionDuration: '30 mins',
      availableSlots: '9:00 AM, 10:30 AM, 12:00 PM, 3:00 PM',
      category: 'Physiotherapy',
      imageUrl: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800'
    }
  },
  {
    service_type: 'wellness',
    title: 'Dr. Lakshmi Iyer Mind Wellness',
    description: 'Experienced psychiatrist offering CBT, mindfulness therapy, and stress management counseling.',
    price: 2000,
    details: {
      practitionerName: 'Dr. Lakshmi Iyer Mind Wellness',
      specialization: 'Psychiatry, CBT & Mindfulness',
      qualifications: 'MBBS, MD Psychiatry, 12+ Years',
      location: 'T. Nagar, Chennai',
      consultationMode: 'Online Video',
      sessionDuration: '50 mins',
      availableSlots: '10:00 AM, 2:00 PM, 4:30 PM',
      category: 'Mental Health & Wellness',
      imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800'
    }
  },
  {
    service_type: 'wellness',
    title: 'Meera Reddy Nutrition Clinic',
    description: 'Clinical nutritionist specializing in diet planning, weight management, and diabetes nutrition.',
    price: 1000,
    details: {
      practitionerName: 'Meera Reddy Nutrition Clinic',
      specialization: 'Clinical Nutrition & Diet Planning',
      qualifications: 'MSc Clinical Nutrition, CDE, 7+ Years',
      location: 'Jubilee Hills, Hyderabad',
      consultationMode: 'Both In-Person & Online',
      sessionDuration: '40 mins',
      availableSlots: '9:00 AM, 11:00 AM, 3:00 PM, 5:00 PM',
      category: 'Nutrition',
      imageUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800'
    }
  },

  // ===== 5 PROPERTIES =====
  {
    service_type: 'properties',
    title: 'Casa Anjuna Heritage Villa',
    description: 'Luxury 3-bedroom villa near Anjuna Beach, Goa. Private pool, garden, and beach access.',
    price: 12000,
    details: {
      propertyName: 'Casa Anjuna Heritage Villa',
      propertyType: 'Villa',
      location: 'Anjuna, North Goa',
      address: '123 Anjuna Beach Road, Anjuna, Bardez, Goa',
      bedrooms: '3',
      bathrooms: '3',
      amenities: 'WiFi, Pool, Parking, Kitchen, Garden, AC, Beach Access',
      maxGuests: '6',
      imageUrl: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800'
    }
  },
  {
    service_type: 'properties',
    title: 'Prestige Lakeside Habitat',
    description: 'Modern 2BHK apartment in Whitefield, Bengaluru. Premium gated community with world-class amenities.',
    price: 8500,
    details: {
      propertyName: 'Prestige Lakeside Habitat',
      propertyType: 'Apartment',
      location: 'Whitefield, Bengaluru',
      address: 'Prestige Lakeside Habitat, Varthur Road, Whitefield, Bengaluru',
      bedrooms: '2',
      bathrooms: '2',
      amenities: 'WiFi, Gym, Swimming Pool, Parking, Clubhouse, Security',
      maxGuests: '4',
      imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'
    }
  },
  {
    service_type: 'properties',
    title: 'Alleppey Premium Houseboat',
    description: 'Luxury 2-bedroom houseboat on Alleppey Backwaters, Kerala. All meals and guide included.',
    price: 15000,
    details: {
      propertyName: 'Alleppey Premium Houseboat',
      propertyType: 'Houseboat',
      location: 'Alleppey, Kerala',
      address: 'Finishing Point, Alleppey Backwaters, Alappuzha, Kerala',
      bedrooms: '2',
      bathrooms: '2',
      amenities: 'AC, Kitchen, Dining, Sundeck, Guide, Meals Included',
      maxGuests: '4',
      imageUrl: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=800'
    }
  },
  {
    service_type: 'properties',
    title: 'DLF Camellias Penthouse',
    description: 'Ultra-luxury 4BHK penthouse in Golf Course Road, Gurugram. Premium high-rise living.',
    price: 25000,
    details: {
      propertyName: 'DLF Camellias Penthouse',
      propertyType: 'Penthouse',
      location: 'Golf Course Road, Gurugram',
      address: 'DLF Camellias, Sector 42, Golf Course Road, Gurugram, Haryana',
      bedrooms: '4',
      bathrooms: '4',
      amenities: 'WiFi, Private Terrace, Gym, Pool, Concierge, Parking, Smart Home',
      maxGuests: '8',
      imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'
    }
  },
  {
    service_type: 'properties',
    title: 'Munnar Tea Estate Cottage',
    description: 'Charming cottage surrounded by tea plantations in Munnar, Kerala. Peaceful hill station retreat.',
    price: 6000,
    details: {
      propertyName: 'Munnar Tea Estate Cottage',
      propertyType: 'Cottage',
      location: 'Munnar, Kerala',
      address: 'Near Kolukkumalai Tea Estate, Munnar, Idukki, Kerala',
      bedrooms: '2',
      bathrooms: '1',
      amenities: 'WiFi, Fireplace, Kitchen, Garden, Mountain View, Parking',
      maxGuests: '4',
      imageUrl: 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=800'
    }
  },
];

async function addListings() {
  console.log(`Adding ${listings.length} provider listings...`);

  let success = 0;
  let failed = 0;

  for (const listing of listings) {
    try {
      const result = await pool.query(
        `INSERT INTO provider_listings (provider_id, service_type, title, description, details, price, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, service_type, title`,
        [
          PROVIDER_ID,
          listing.service_type,
          listing.title,
          listing.description,
          JSON.stringify(listing.details),
          listing.price,
          'active'
        ]
      );
      console.log(`✅ Added: [${result.rows[0].service_type}] ${result.rows[0].title}`);
      success++;
    } catch (err) {
      console.error(`❌ Failed: [${listing.service_type}] ${listing.title} - ${err.message}`);
      failed++;
    }
  }

  console.log(`\nDone! ${success} added, ${failed} failed.`);
  await pool.end();
}

addListings();
