// Sample hotel data with real-world amenities, room categories, pricing, and locations
export const SAMPLE_HOTEL_CITIES = [
  'Goa',
  'Jaipur',
  'Bengaluru',
  'Mumbai',
  'Udaipur',
  'Kerala (Kochi)',
  'New Delhi',
  'Shimla'
];

export const SAMPLE_HOTELS = [
  {
    id: 'HTL-301',
    name: 'The Heritage Palace & Royal Spa',
    location: 'Jaipur, Rajasthan',
    city: 'Jaipur',
    rating: 4.9,
    reviewsCount: 1240,
    pricePerNight: 8500,
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Experience royal Rajasthani hospitality with courtyard gardens, private jharokhas, and holistic wellness therapy pavilions.',
    amenities: ['Swimming Pool', 'Ayurvedic Spa', 'Free Breakfast', 'High-Speed Wi-Fi', 'Valet Parking', 'Fine Dining Restaurant'],
    rooms: [
      {
        id: 'RM-101',
        name: 'Deluxe Heritage Courtyard Room',
        bed: '1 King Bed',
        capacity: '2 Adults, 1 Child',
        price: 8500,
        features: ['Garden View', 'Deep Soaking Tub', 'Complimentary Breakfast', 'Balcony']
      },
      {
        id: 'RM-102',
        name: 'Royal Maharaja Suite',
        bed: '1 Royal King Bed + Living Area',
        capacity: '3 Adults',
        price: 14200,
        features: ['Palace View', 'Private Jacuzzi', 'Butler Service', 'High Tea Included']
      }
    ]
  },
  {
    id: 'HTL-302',
    name: 'Azure Palms Beachfront Resort & Wellness Retreat',
    location: 'Candolim, North Goa',
    city: 'Goa',
    rating: 4.8,
    reviewsCount: 1890,
    pricePerNight: 6200,
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Direct Arabian Sea beach access with infinity pool, sunset yoga deck, detox bar, and tranquil tropical suites.',
    amenities: ['Private Beach Access', 'Infinity Pool', 'Yoga Deck', 'Seafood Shack', 'Fitness Gym', 'Cocktail Lounge'],
    rooms: [
      {
        id: 'RM-201',
        name: 'Sea Breeze Studio',
        bed: '1 Queen Bed',
        capacity: '2 Guests',
        price: 6200,
        features: ['Ocean Balcony', 'Mini Bar', 'Breakfast Included', 'Rain Shower']
      },
      {
        id: 'RM-202',
        name: 'Beachfront Pool Villa',
        bed: '1 King Bed',
        capacity: '2 Adults',
        price: 11500,
        features: ['Private Plunge Pool', 'Direct Beach Walkway', 'Sunset Deck', 'Complimentary Wine']
      }
    ]
  },
  {
    id: 'HTL-303',
    name: 'The Orchid Grand Luxury Hotel',
    location: 'Indiranagar, Bengaluru',
    city: 'Bengaluru',
    rating: 4.7,
    reviewsCount: 940,
    pricePerNight: 5400,
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Eco-certified contemporary 5-star hotel in Bangalore tech & lifestyle hub with rooftop microbrewery and wellness spa.',
    amenities: ['Rooftop Pool', '24/7 Business Center', 'Spa & Salon', 'Electric Car Charging', 'Free High Speed Wi-Fi'],
    rooms: [
      {
        id: 'RM-301',
        name: 'Executive Premier Room',
        bed: '1 King Bed or 2 Twins',
        capacity: '2 Adults',
        price: 5400,
        features: ['City Skyline View', 'Ergonomic Work Desk', 'Buffet Breakfast', 'Espresso Machine']
      },
      {
        id: 'RM-302',
        name: 'Club Suite with Lounge Access',
        bed: '1 Super King Bed',
        capacity: '2 Adults',
        price: 8900,
        features: ['Club Lounge Access', 'Airport Transfer', 'Cocktail Hour', 'Complimentary Laundry']
      }
    ]
  },
  {
    id: 'HTL-304',
    name: 'Lake Pichola Sanctuary Villa Resort',
    location: 'Lake Pichola, Udaipur',
    city: 'Udaipur',
    rating: 4.95,
    reviewsCount: 680,
    pricePerNight: 12500,
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Secluded waterfront sanctuary with ornate architecture, private boat jetty, and sunset candlelit dining.',
    amenities: ['Lake View Pools', 'Ayurvedic Wellness Shala', 'Boat Transfers', 'Royal Spa', 'Terrace Restaurant'],
    rooms: [
      {
        id: 'RM-401',
        name: 'Lakeview Heritage Room',
        bed: '1 King Bed',
        capacity: '2 Guests',
        price: 12500,
        features: ['Full Lake Pichola View', 'Marble Bathroom', 'Traditional Jharokha', 'Butler Service']
      }
    ]
  }
];
