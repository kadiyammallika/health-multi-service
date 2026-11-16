/**
 * Seed all curated data into provider_listings table
 * under the provider account: mallireddy9171@gmail.com
 */
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const PROVIDER_ID = 'c5bd3b6b-7309-4e39-87f6-517c9f7210ed'; // mallireddy9171@gmail.com

async function seedListings() {
  const client = await pool.connect();

  try {
    // First, clear existing curated listings for this provider to avoid duplicates
    await client.query(`DELETE FROM provider_listings WHERE provider_id = $1`, [PROVIDER_ID]);
    console.log('Cleared existing listings for provider');

    let totalInserted = 0;

    // ========== BUSES ==========
    const busesData = [
      { operator: 'VRL Travels', busNumber: 'KA-01-AB-1234', type: 'Multi-Axle Volvo A/C Sleeper', from: 'Bengaluru', to: 'Mumbai', departureTime: '08:00 PM', arrivalTime: '06:30 AM', duration: '10h 30m', price: 1200, rating: 4.3, reviews: 2456, seatsAvailable: 23, amenities: ['WiFi', 'Charging Point', 'Water Bottle', 'Blanket', 'Reading Light'], boardingPoints: [{ name: 'Majestic Bus Stand', time: '08:00 PM' }, { name: 'Electronic City', time: '08:45 PM' }], droppingPoints: [{ name: 'Dadar', time: '05:30 AM' }, { name: 'Borivali', time: '06:00 AM' }], cancellation: 'Free cancellation before 6 hours', liveTracking: true, isAC: true, image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80' },
      { operator: 'SRS Travels', busNumber: 'KA-01-CD-5678', type: 'A/C Seater/Sleeper', from: 'Bengaluru', to: 'Chennai', departureTime: '10:00 PM', arrivalTime: '05:00 AM', duration: '7h 00m', price: 850, rating: 4.1, reviews: 1834, seatsAvailable: 15, amenities: ['Charging Point', 'Water Bottle', 'Blanket'], cancellation: 'Free cancellation before 4 hours', liveTracking: true, isAC: true, image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800&q=80' },
      { operator: 'KPN Travels', busNumber: 'TN-01-EF-9012', type: 'Multi-Axle Volvo A/C Sleeper', from: 'Chennai', to: 'Bangalore', departureTime: '09:30 PM', arrivalTime: '05:30 AM', duration: '8h 00m', price: 950, rating: 4.4, reviews: 3102, seatsAvailable: 18, amenities: ['WiFi', 'Charging Point', 'Water Bottle', 'Blanket', 'TV'], cancellation: 'Free cancellation before 6 hours', liveTracking: true, isAC: true, image: 'https://images.unsplash.com/photo-1557223562-6c77ef16210f?w=800&q=80' },
      { operator: 'Orange Travels', busNumber: 'AP-01-GH-3456', type: 'Volvo Multi-Axle Semi-Sleeper', from: 'Hyderabad', to: 'Bengaluru', departureTime: '09:00 PM', arrivalTime: '06:00 AM', duration: '9h 00m', price: 1100, rating: 4.2, reviews: 2891, seatsAvailable: 20, amenities: ['WiFi', 'Charging Point', 'Water Bottle', 'Blanket'], cancellation: 'Free cancellation before 6 hours', liveTracking: true, isAC: true, image: 'https://images.unsplash.com/photo-1464219789935-c2d9d9aba644?w=800&q=80' },
      { operator: 'APSRTC Garuda Plus', busNumber: 'AP-39-Z-1234', type: 'Garuda Plus A/C Sleeper', from: 'Hyderabad', to: 'Vijayawada', departureTime: '11:00 PM', arrivalTime: '04:30 AM', duration: '5h 30m', price: 650, rating: 4.0, reviews: 5678, seatsAvailable: 30, amenities: ['Water Bottle', 'Blanket'], cancellation: 'No cancellation', liveTracking: true, isAC: true, image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80' },
      { operator: 'Neeta Travels', busNumber: 'MH-01-IJ-7890', type: 'Volvo B11R Multi-Axle Sleeper', from: 'Mumbai', to: 'Pune', departureTime: '06:00 AM', arrivalTime: '10:00 AM', duration: '4h 00m', price: 500, rating: 4.5, reviews: 4321, seatsAvailable: 25, amenities: ['WiFi', 'Charging Point', 'Water Bottle', 'Snacks'], cancellation: 'Free cancellation before 2 hours', liveTracking: true, isAC: true, image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800&q=80' },
      { operator: 'Paulo Travels', busNumber: 'MH-04-KL-2345', type: 'Mercedes Benz Multi-Axle', from: 'Mumbai', to: 'Goa', departureTime: '07:00 PM', arrivalTime: '05:00 AM', duration: '10h 00m', price: 1400, rating: 4.6, reviews: 3456, seatsAvailable: 12, amenities: ['WiFi', 'Charging Point', 'Water Bottle', 'Blanket', 'Snacks', 'TV'], cancellation: 'Free cancellation before 6 hours', liveTracking: true, isAC: true, image: 'https://images.unsplash.com/photo-1557223562-6c77ef16210f?w=800&q=80' },
      { operator: 'KSRTC Airavat Club Class', busNumber: 'KA-57-F-1234', type: 'Volvo 9600 Club Class', from: 'Bengaluru', to: 'Goa', departureTime: '08:30 PM', arrivalTime: '06:00 AM', duration: '9h 30m', price: 1350, rating: 4.3, reviews: 2100, seatsAvailable: 16, amenities: ['WiFi', 'Charging Point', 'Water Bottle', 'Blanket', 'Personal TV'], cancellation: 'Partial refund before 4 hours', liveTracking: true, isAC: true, image: 'https://images.unsplash.com/photo-1464219789935-c2d9d9aba644?w=800&q=80' },
      { operator: 'IntrCity SmartBus', busNumber: 'DL-01-MN-6789', type: 'Smart Sleeper (Luxury)', from: 'Delhi', to: 'Jaipur', departureTime: '06:30 AM', arrivalTime: '12:00 PM', duration: '5h 30m', price: 799, rating: 4.7, reviews: 8765, seatsAvailable: 22, amenities: ['WiFi', 'Charging Point', 'Water Bottle', 'Blanket', 'Snacks', 'Personal TV', 'Reading Light'], cancellation: 'Free cancellation before 4 hours', liveTracking: true, isAC: true, image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800&q=80' },
      { operator: 'Rajdhani Travels', busNumber: 'GJ-01-OP-4567', type: 'A/C Semi-Sleeper', from: 'Ahmedabad', to: 'Mumbai', departureTime: '10:30 PM', arrivalTime: '06:30 AM', duration: '8h 00m', price: 900, rating: 4.0, reviews: 1567, seatsAvailable: 28, amenities: ['Charging Point', 'Water Bottle', 'Blanket'], cancellation: 'Free cancellation before 4 hours', liveTracking: true, isAC: true, image: 'https://images.unsplash.com/photo-1557223562-6c77ef16210f?w=800&q=80' },
      { operator: 'Kallada Travels', busNumber: 'KL-01-QR-8901', type: 'Scania Multi-Axle Sleeper', from: 'Bengaluru', to: 'Kochi', departureTime: '09:15 PM', arrivalTime: '06:00 AM', duration: '8h 45m', price: 1050, rating: 4.2, reviews: 3456, seatsAvailable: 19, amenities: ['WiFi', 'Charging Point', 'Water Bottle', 'Blanket', 'Pillow'], cancellation: 'Free cancellation before 6 hours', liveTracking: true, isAC: true, image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80' },
      { operator: 'Chartered Bus (MSRTC)', busNumber: 'MH-12-ST-2345', type: 'Shivneri A/C Seater', from: 'Pune', to: 'Mumbai', departureTime: '07:00 AM', arrivalTime: '11:00 AM', duration: '4h 00m', price: 450, rating: 4.1, reviews: 6789, seatsAvailable: 35, amenities: ['Water Bottle', 'Charging Point'], cancellation: 'Partial refund', liveTracking: true, isAC: true, image: 'https://images.unsplash.com/photo-1464219789935-c2d9d9aba644?w=800&q=80' },
    ];

    for (const bus of busesData) {
      await client.query(
        `INSERT INTO provider_listings (provider_id, service_type, title, description, details, price, status)
         VALUES ($1, 'buses', $2, $3, $4, $5, 'active')`,
        [
          PROVIDER_ID,
          `${bus.operator} — ${bus.from} to ${bus.to}`,
          `${bus.type} | ${bus.from} → ${bus.to} | Dep: ${bus.departureTime} | Arr: ${bus.arrivalTime} | ${bus.duration}`,
          JSON.stringify({
            operator: bus.operator,
            busNumber: bus.busNumber,
            busType: bus.type,
            from: bus.from,
            to: bus.to,
            departureTime: bus.departureTime,
            arrivalTime: bus.arrivalTime,
            duration: bus.duration,
            seatsAvailable: bus.seatsAvailable,
            amenities: bus.amenities,
            boardingPoints: bus.boardingPoints,
            droppingPoints: bus.droppingPoints,
            cancellation: bus.cancellation,
            liveTracking: bus.liveTracking,
            isAC: bus.isAC,
            rating: bus.rating,
            reviews: bus.reviews,
            image: bus.image,
          }),
          bus.price,
        ]
      );
    }
    totalInserted += busesData.length;
    console.log(`✓ Inserted ${busesData.length} bus listings`);

    // ========== FLIGHTS ==========
    const flightsData = [
      { airline: 'IndiGo', airlineCode: '6E', flightNumber: '6E-2045', from: 'DEL', to: 'BOM', fromCity: 'New Delhi', toCity: 'Mumbai', departureTime: '06:00 AM', arrivalTime: '08:15 AM', duration: '2h 15m', stops: 'Non-stop', aircraft: 'Airbus A320neo', price: 4299, seats: 23, baggage: '15 Kg Check-in + 7 Kg Cabin', meal: 'Not Included', class: 'Economy' },
      { airline: 'Air India', airlineCode: 'AI', flightNumber: 'AI-865', from: 'BOM', to: 'DEL', fromCity: 'Mumbai', toCity: 'New Delhi', departureTime: '07:30 AM', arrivalTime: '09:45 AM', duration: '2h 15m', stops: 'Non-stop', aircraft: 'Boeing 787 Dreamliner', price: 5800, seats: 15, baggage: '25 Kg Check-in + 7 Kg Cabin', meal: 'Complimentary Meal', class: 'Economy' },
      { airline: 'SpiceJet', airlineCode: 'SG', flightNumber: 'SG-127', from: 'DEL', to: 'BLR', fromCity: 'New Delhi', toCity: 'Bengaluru', departureTime: '08:00 AM', arrivalTime: '10:45 AM', duration: '2h 45m', stops: 'Non-stop', aircraft: 'Boeing 737-800', price: 3899, seats: 30, baggage: '15 Kg Check-in + 7 Kg Cabin', meal: 'Not Included', class: 'Economy' },
      { airline: 'Vistara', airlineCode: 'UK', flightNumber: 'UK-835', from: 'DEL', to: 'MAA', fromCity: 'New Delhi', toCity: 'Chennai', departureTime: '09:15 AM', arrivalTime: '12:00 PM', duration: '2h 45m', stops: 'Non-stop', aircraft: 'Airbus A320neo', price: 5200, seats: 18, baggage: '20 Kg Check-in + 7 Kg Cabin', meal: 'Complimentary Meal', class: 'Economy' },
      { airline: 'IndiGo', airlineCode: '6E', flightNumber: '6E-312', from: 'BLR', to: 'HYD', fromCity: 'Bengaluru', toCity: 'Hyderabad', departureTime: '10:30 AM', arrivalTime: '11:45 AM', duration: '1h 15m', stops: 'Non-stop', aircraft: 'Airbus A321neo', price: 3200, seats: 40, baggage: '15 Kg Check-in + 7 Kg Cabin', meal: 'Not Included', class: 'Economy' },
      { airline: 'Air India Express', airlineCode: 'IX', flightNumber: 'IX-384', from: 'BOM', to: 'GOI', fromCity: 'Mumbai', toCity: 'Goa', departureTime: '11:00 AM', arrivalTime: '12:15 PM', duration: '1h 15m', stops: 'Non-stop', aircraft: 'Boeing 737-800', price: 2899, seats: 25, baggage: '15 Kg Check-in + 7 Kg Cabin', meal: 'Not Included', class: 'Economy' },
      { airline: 'Akasa Air', airlineCode: 'QP', flightNumber: 'QP-1542', from: 'BOM', to: 'BLR', fromCity: 'Mumbai', toCity: 'Bengaluru', departureTime: '02:00 PM', arrivalTime: '03:30 PM', duration: '1h 30m', stops: 'Non-stop', aircraft: 'Boeing 737 MAX 8', price: 3450, seats: 35, baggage: '15 Kg Check-in + 7 Kg Cabin', meal: 'Not Included', class: 'Economy' },
      { airline: 'Air India', airlineCode: 'AI', flightNumber: 'AI-505', from: 'DEL', to: 'CCU', fromCity: 'New Delhi', toCity: 'Kolkata', departureTime: '03:00 PM', arrivalTime: '05:15 PM', duration: '2h 15m', stops: 'Non-stop', aircraft: 'Airbus A320', price: 4800, seats: 12, baggage: '25 Kg Check-in + 7 Kg Cabin', meal: 'Complimentary Meal', class: 'Economy' },
      { airline: 'IndiGo', airlineCode: '6E', flightNumber: '6E-6789', from: 'HYD', to: 'DEL', fromCity: 'Hyderabad', toCity: 'New Delhi', departureTime: '04:30 PM', arrivalTime: '06:45 PM', duration: '2h 15m', stops: 'Non-stop', aircraft: 'Airbus A320neo', price: 4100, seats: 20, baggage: '15 Kg Check-in + 7 Kg Cabin', meal: 'Not Included', class: 'Economy' },
      { airline: 'Vistara', airlineCode: 'UK', flightNumber: 'UK-945', from: 'BLR', to: 'DEL', fromCity: 'Bengaluru', toCity: 'New Delhi', departureTime: '06:00 PM', arrivalTime: '08:45 PM', duration: '2h 45m', stops: 'Non-stop', aircraft: 'Boeing 787 Dreamliner', price: 6500, seats: 10, baggage: '25 Kg Check-in + 10 Kg Cabin', meal: 'Complimentary Premium Meal', class: 'Premium Economy' },
    ];

    for (const flight of flightsData) {
      await client.query(
        `INSERT INTO provider_listings (provider_id, service_type, title, description, details, price, status)
         VALUES ($1, 'flights', $2, $3, $4, $5, 'active')`,
        [
          PROVIDER_ID,
          `${flight.airline} ${flight.flightNumber} — ${flight.fromCity} to ${flight.toCity}`,
          `${flight.aircraft} | ${flight.stops} | ${flight.class} | Baggage: ${flight.baggage}`,
          JSON.stringify({
            airline: flight.airline,
            airlineCode: flight.airlineCode,
            flightNumber: flight.flightNumber,
            from: flight.from,
            to: flight.to,
            fromCity: flight.fromCity,
            toCity: flight.toCity,
            departureTime: flight.departureTime,
            arrivalTime: flight.arrivalTime,
            duration: flight.duration,
            stops: flight.stops,
            aircraft: flight.aircraft,
            availableSeats: flight.seats,
            baggage: flight.baggage,
            meal: flight.meal,
            class: flight.class,
          }),
          flight.price,
        ]
      );
    }
    totalInserted += flightsData.length;
    console.log(`✓ Inserted ${flightsData.length} flight listings`);

    // ========== HOTELS ==========
    const hotelsData = [
      { name: 'Taj Mahal Palace', city: 'Mumbai', stars: 5, pricePerNight: 18500, discount: 23, amenities: ['Free WiFi', 'Swimming Pool', 'Spa', 'Gym', 'Restaurant', '24/7 Room Service'], rooms: [{ name: 'Superior Room', price: 18500, size: '35 sqm', maxGuests: 2, beds: '1 King Bed' }, { name: 'Luxury Suite', price: 35000, size: '65 sqm', maxGuests: 3, beds: '1 King Bed + Sofa' }], checkIn: '02:00 PM', checkOut: '12:00 PM', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80' },
      { name: 'The Oberoi', city: 'New Delhi', stars: 5, pricePerNight: 22000, discount: 15, amenities: ['Free WiFi', 'Swimming Pool', 'Spa', 'Gym', 'Restaurant', 'Bar', 'Concierge'], rooms: [{ name: 'Premier Room', price: 22000, size: '40 sqm', maxGuests: 2, beds: '1 King Bed' }, { name: 'Deluxe Suite', price: 42000, size: '75 sqm', maxGuests: 3, beds: '1 King Bed + Living Area' }], checkIn: '02:00 PM', checkOut: '12:00 PM', image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80' },
      { name: 'ITC Grand Chola', city: 'Chennai', stars: 5, pricePerNight: 12000, discount: 20, amenities: ['Free WiFi', 'Swimming Pool', 'Spa', 'Gym', 'Multiple Restaurants', 'Business Center'], rooms: [{ name: 'Executive Club Room', price: 12000, size: '38 sqm', maxGuests: 2, beds: '1 King Bed' }], checkIn: '02:00 PM', checkOut: '12:00 PM', image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80' },
      { name: 'The Leela Palace', city: 'Bengaluru', stars: 5, pricePerNight: 15000, discount: 18, amenities: ['Free WiFi', 'Swimming Pool', 'Spa', 'Gym', 'Restaurant', 'Bar', 'Garden'], rooms: [{ name: 'Royal Premier Room', price: 15000, size: '42 sqm', maxGuests: 2, beds: '1 King Bed' }], checkIn: '03:00 PM', checkOut: '12:00 PM', image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80' },
      { name: 'Radisson Blu', city: 'Hyderabad', stars: 4, pricePerNight: 6500, discount: 25, amenities: ['Free WiFi', 'Swimming Pool', 'Gym', 'Restaurant', 'Parking'], rooms: [{ name: 'Superior Room', price: 6500, size: '30 sqm', maxGuests: 2, beds: '1 Queen Bed' }], checkIn: '02:00 PM', checkOut: '11:00 AM', image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80' },
      { name: 'Marriott Suites', city: 'Pune', stars: 5, pricePerNight: 9800, discount: 20, amenities: ['Free WiFi', 'Swimming Pool', 'Spa', 'Gym', 'Restaurant', 'Lounge', 'Business Center'], rooms: [{ name: 'Executive Suite', price: 9800, size: '45 sqm', maxGuests: 2, beds: '1 King Bed' }], checkIn: '03:00 PM', checkOut: '12:00 PM', image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80' },
      { name: 'Taj Lake Palace', city: 'Udaipur', stars: 5, pricePerNight: 32000, discount: 10, amenities: ['Free WiFi', 'Swimming Pool', 'Spa', 'Gym', 'Fine Dining', 'Lake View', 'Heritage Walk'], rooms: [{ name: 'Luxury Lake View Room', price: 32000, size: '50 sqm', maxGuests: 2, beds: '1 King Bed' }], checkIn: '02:00 PM', checkOut: '12:00 PM', image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80' },
      { name: 'Novotel Goa Resort', city: 'Goa', stars: 4, pricePerNight: 7500, discount: 30, amenities: ['Free WiFi', 'Beach Access', 'Swimming Pool', 'Spa', 'Kids Club', 'Restaurant'], rooms: [{ name: 'Superior Garden View', price: 7500, size: '32 sqm', maxGuests: 2, beds: '1 King Bed' }], checkIn: '03:00 PM', checkOut: '11:00 AM', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80' },
      { name: 'Holiday Inn Express', city: 'Jaipur', stars: 3, pricePerNight: 3800, discount: 15, amenities: ['Free WiFi', 'Breakfast Included', 'Gym', 'Parking', 'Business Center'], rooms: [{ name: 'Standard Room', price: 3800, size: '25 sqm', maxGuests: 2, beds: '1 Double Bed' }], checkIn: '02:00 PM', checkOut: '12:00 PM', image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80' },
      { name: 'Hyatt Regency', city: 'Kolkata', stars: 5, pricePerNight: 11000, discount: 22, amenities: ['Free WiFi', 'Swimming Pool', 'Spa', 'Gym', 'Multiple Restaurants', 'Bar'], rooms: [{ name: 'Regency Club Room', price: 11000, size: '38 sqm', maxGuests: 2, beds: '1 King Bed' }], checkIn: '03:00 PM', checkOut: '12:00 PM', image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80' },
    ];

    for (const hotel of hotelsData) {
      await client.query(
        `INSERT INTO provider_listings (provider_id, service_type, title, description, details, price, status)
         VALUES ($1, 'hotels', $2, $3, $4, $5, 'active')`,
        [
          PROVIDER_ID,
          hotel.name,
          `${hotel.stars}-Star Hotel in ${hotel.city} | Check-in: ${hotel.checkIn} | Check-out: ${hotel.checkOut}`,
          JSON.stringify({
            hotelName: hotel.name,
            city: hotel.city,
            stars: hotel.stars,
            discount: hotel.discount,
            amenities: hotel.amenities,
            rooms: hotel.rooms,
            checkInTime: hotel.checkIn,
            checkOutTime: hotel.checkOut,
            cancellation: 'Free cancellation up to 24 hours before check-in',
            breakfastIncluded: hotel.stars >= 4,
            image: hotel.image,
            rating: 4.0 + Math.random() * 0.9,
            reviews: Math.floor(500 + Math.random() * 5000),
          }),
          hotel.pricePerNight,
        ]
      );
    }
    totalInserted += hotelsData.length;
    console.log(`✓ Inserted ${hotelsData.length} hotel listings`);

    // ========== PROPERTIES ==========
    const propertiesData = [
      { title: 'Luxury 3 BHK Sea-View Apartment in Worli', type: 'Apartment', purpose: 'buy', city: 'Mumbai', price: 42500000, area: 1650, bedrooms: 3, bathrooms: 3, floor: '22nd Floor', furnishing: 'Semi-Furnished', facing: 'West (Sea Facing)', possession: 'Ready to Move', amenities: ['Swimming Pool', 'Gym', 'Clubhouse', 'Play Area', 'Power Backup', '24/7 Security'], image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80' },
      { title: 'Premium 4 BHK Villa in Whitefield', type: 'Villa', purpose: 'buy', city: 'Bengaluru', price: 28000000, area: 3200, bedrooms: 4, bathrooms: 4, floor: 'Independent', furnishing: 'Fully Furnished', facing: 'East', possession: 'Ready to Move', amenities: ['Private Garden', 'Covered Parking', 'Modular Kitchen', 'CCTV'], image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80' },
      { title: 'Modern 2 BHK Apartment in Gachibowli', type: 'Apartment', purpose: 'rent', city: 'Hyderabad', price: 35000, area: 1100, bedrooms: 2, bathrooms: 2, floor: '8th Floor', furnishing: 'Fully Furnished', facing: 'North-East', possession: 'Immediate', amenities: ['Swimming Pool', 'Gym', 'Clubhouse', 'Power Backup', 'Parking'], image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80' },
      { title: 'Spacious 3 BHK in Anna Nagar', type: 'Apartment', purpose: 'buy', city: 'Chennai', price: 15500000, area: 1450, bedrooms: 3, bathrooms: 2, floor: '5th Floor', furnishing: 'Semi-Furnished', facing: 'South', possession: 'Ready to Move', amenities: ['Gym', 'Play Area', 'Power Backup', 'Parking', 'Intercom'], image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80' },
      { title: 'Heritage Haveli in Jaipur Old City', type: 'Villa', purpose: 'buy', city: 'Jaipur', price: 48000000, area: 5000, bedrooms: 6, bathrooms: 5, floor: 'G+2', furnishing: 'Unfurnished', facing: 'East', possession: 'Ready to Move', amenities: ['Courtyard', 'Terrace', 'Garden', 'Parking', 'Heritage Architecture'], image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80' },
      { title: 'Studio Apartment near Huda City Centre', type: 'Studio', purpose: 'rent', city: 'Gurugram', price: 22000, area: 550, bedrooms: 1, bathrooms: 1, floor: '12th Floor', furnishing: 'Fully Furnished', facing: 'West', possession: 'Immediate', amenities: ['Gym', 'Swimming Pool', 'Metro Connectivity', 'Power Backup'], image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80' },
      { title: 'Penthouse in Koregaon Park', type: 'Penthouse', purpose: 'buy', city: 'Pune', price: 52000000, area: 4200, bedrooms: 4, bathrooms: 4, floor: '24th Floor', furnishing: 'Fully Furnished', facing: 'All Sides', possession: 'Ready to Move', amenities: ['Private Terrace', 'Jacuzzi', 'Home Theater', 'Modular Kitchen', 'Swimming Pool'], image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80' },
      { title: 'Beachside 2 BHK in Candolim', type: 'Apartment', purpose: 'rent', city: 'Goa', price: 45000, area: 1000, bedrooms: 2, bathrooms: 2, floor: '3rd Floor', furnishing: 'Fully Furnished', facing: 'West (Sea)', possession: 'Immediate', amenities: ['Beach Access', 'Swimming Pool', 'Garden', 'Parking', 'Balcony'], image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80' },
    ];

    for (const prop of propertiesData) {
      await client.query(
        `INSERT INTO provider_listings (provider_id, service_type, title, description, details, price, status)
         VALUES ($1, 'properties', $2, $3, $4, $5, 'active')`,
        [
          PROVIDER_ID,
          prop.title,
          `${prop.type} | ${prop.bedrooms} BHK | ${prop.area} sqft | ${prop.furnishing} | ${prop.city}`,
          JSON.stringify({
            propertyType: prop.type,
            purpose: prop.purpose,
            city: prop.city,
            area: prop.area,
            bedrooms: prop.bedrooms,
            bathrooms: prop.bathrooms,
            floor: prop.floor,
            furnishing: prop.furnishing,
            facing: prop.facing,
            possession: prop.possession,
            amenities: prop.amenities,
            image: prop.image,
          }),
          prop.price,
        ]
      );
    }
    totalInserted += propertiesData.length;
    console.log(`✓ Inserted ${propertiesData.length} property listings`);

    // ========== WELLNESS ==========
    const wellnessData = [
      { name: 'Dr. Arjun Sharma', clinic: 'Kairali Ayurvedic Centre', city: 'Rishikesh', category: 'Ayurveda', specialization: 'Panchakarma & Detox Therapy', qualifications: 'BAMS, MD (Ayurveda) - BHU', experience: '18 years', fee: 1500, duration: '45 mins', mode: 'In-Person & Online', languages: ['Hindi', 'English'], services: [{ name: 'Panchakarma (5-day)', price: 15000 }, { name: 'Shirodhara Session', price: 2500 }], image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80' },
      { name: 'Dr. Priya Nair', clinic: 'Yoga Healing Institute', city: 'Kerala', category: 'Yoga Therapy', specialization: 'Therapeutic Yoga & Pranayama', qualifications: 'MSc Yoga, RYT-500', experience: '12 years', fee: 1200, duration: '60 mins', mode: 'Online & In-Person', languages: ['English', 'Malayalam', 'Hindi'], services: [{ name: 'Private Yoga Session', price: 1200 }, { name: 'Pranayama Workshop', price: 800 }], image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80' },
      { name: 'Dr. Rajesh Gupta', clinic: 'Homeo Life Clinic', city: 'New Delhi', category: 'Homeopathy', specialization: 'Chronic Disease Management', qualifications: 'BHMS, MD (Homeopathy)', experience: '15 years', fee: 800, duration: '30 mins', mode: 'In-Person & Online', languages: ['Hindi', 'English'], services: [{ name: 'Initial Consultation', price: 800 }, { name: 'Follow-up', price: 400 }], image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80' },
      { name: 'Dr. Meera Krishnan', clinic: 'AyurVeda Wellness Spa', city: 'Mumbai', category: 'Ayurveda', specialization: 'Skin & Beauty Treatments', qualifications: 'BAMS, CYP', experience: '10 years', fee: 2000, duration: '60 mins', mode: 'In-Person', languages: ['Hindi', 'English', 'Marathi'], services: [{ name: 'Facial Rejuvenation', price: 3500 }, { name: 'Herbal Body Wrap', price: 4000 }], image: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=800&q=80' },
      { name: 'Dr. Sanjay Verma', clinic: 'PhysioFit Centre', city: 'Bengaluru', category: 'Physiotherapy', specialization: 'Sports Injury & Rehabilitation', qualifications: 'BPT, MPT (Sports)', experience: '14 years', fee: 1000, duration: '45 mins', mode: 'In-Person', languages: ['English', 'Hindi', 'Kannada'], services: [{ name: 'Sports Injury Assessment', price: 1000 }, { name: 'Rehabilitation Program', price: 8000 }], image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80' },
      { name: 'Anita Desai', clinic: 'Mindful Living Studio', city: 'Pune', category: 'Meditation', specialization: 'Mindfulness & Stress Management', qualifications: 'Certified MBSR Instructor', experience: '8 years', fee: 900, duration: '60 mins', mode: 'Online & In-Person', languages: ['English', 'Hindi', 'Marathi'], services: [{ name: 'Guided Meditation', price: 900 }, { name: '8-Week MBSR Course', price: 12000 }], image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80' },
      { name: 'Dr. Kavitha Rao', clinic: 'Naturo Health Clinic', city: 'Hyderabad', category: 'Naturopathy', specialization: 'Diet Therapy & Detoxification', qualifications: 'BNYS, MD (Naturopathy)', experience: '11 years', fee: 1100, duration: '45 mins', mode: 'In-Person & Online', languages: ['Telugu', 'English', 'Hindi'], services: [{ name: 'Naturopathy Consultation', price: 1100 }, { name: 'Detox Program (3-day)', price: 8500 }], image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80' },
      { name: 'Ravi Shankar Iyer', clinic: 'Pranayama & Wellness Hub', city: 'Chennai', category: 'Yoga Therapy', specialization: 'Breathing Techniques & Meditation', qualifications: 'E-RYT 500, Yoga Alliance', experience: '20 years', fee: 1300, duration: '60 mins', mode: 'Online & In-Person', languages: ['Tamil', 'English', 'Hindi'], services: [{ name: 'Advanced Pranayama', price: 1300 }, { name: 'Yoga Teacher Training', price: 25000 }], image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80' },
      { name: 'Dr. Neha Agarwal', clinic: 'Holistic Nutrition Clinic', city: 'New Delhi', category: 'Nutrition', specialization: 'Clinical Nutrition & Weight Management', qualifications: 'MSc Nutrition, CDE', experience: '9 years', fee: 1500, duration: '45 mins', mode: 'Online & In-Person', languages: ['Hindi', 'English'], services: [{ name: 'Nutrition Assessment', price: 1500 }, { name: 'Monthly Diet Plan', price: 3000 }], image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80' },
      { name: 'Dr. Vikram Singh', clinic: 'Acupuncture Wellness Centre', city: 'Jaipur', category: 'Acupuncture', specialization: 'Pain Management & TCM', qualifications: 'MBBS, Diploma in Acupuncture', experience: '16 years', fee: 1800, duration: '45 mins', mode: 'In-Person', languages: ['Hindi', 'English'], services: [{ name: 'Acupuncture Session', price: 1800 }, { name: 'Cupping Therapy', price: 1200 }], image: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=800&q=80' },
    ];

    for (const w of wellnessData) {
      await client.query(
        `INSERT INTO provider_listings (provider_id, service_type, title, description, details, price, status)
         VALUES ($1, 'wellness', $2, $3, $4, $5, 'active')`,
        [
          PROVIDER_ID,
          `${w.name} — ${w.clinic}`,
          `${w.category} | ${w.specialization} | ${w.experience} experience | ${w.mode}`,
          JSON.stringify({
            practitionerName: w.name,
            clinic: w.clinic,
            city: w.city,
            category: w.category,
            specialization: w.specialization,
            qualifications: w.qualifications,
            experience: w.experience,
            consultationFee: w.fee,
            sessionDuration: w.duration,
            consultationMode: w.mode,
            languages: w.languages,
            services: w.services,
            image: w.image,
            availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            availableSlots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'],
            cancellation: 'Free cancellation up to 2 hours before appointment',
            isVerified: true,
          }),
          w.fee,
        ]
      );
    }
    totalInserted += wellnessData.length;
    console.log(`✓ Inserted ${wellnessData.length} wellness listings`);

    console.log(`\n✅ Total: ${totalInserted} listings added for provider mallireddy9171@gmail.com`);
  } catch (err) {
    console.error('Error seeding listings:', err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seedListings().catch(e => {
  console.error(e);
  process.exit(1);
});
