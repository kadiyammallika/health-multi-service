// Sample property data for buying and renting with images, amenities, pricing, and agent contact
export const PROPERTY_LOCATIONS = [
  'Bengaluru (Indiranagar / Whitefield)',
  'Mumbai (Bandra West / Worli)',
  'Goa (Anjuna / Siolim)',
  'New Delhi (South Extension / Vasant Vihar)',
  'Hyderabad (Jubilee Hills / Gachibowli)',
  'Pune (Koregaon Park / Kalyani Nagar)'
];

export const PROPERTY_TYPES = [
  'All Types',
  'Luxury Apartment',
  'Villa / Independent House',
  'Penthouse',
  'Eco Sanctuary / Farmhouse',
  'Commercial Office Space'
];

export const SAMPLE_PROPERTIES = [
  {
    id: 'PROP-501',
    purpose: 'buy', // 'buy' or 'rent'
    title: 'Serene Glasshouse Villa with Private Zen Pool',
    location: 'Siolim, North Goa',
    city: 'Goa',
    price: 38500000, // 3.85 Cr
    priceDisplay: '₹3.85 Cr',
    propertyType: 'Villa / Independent House',
    bedrooms: 4,
    bathrooms: 5,
    areaSqFt: 3800,
    furnished: 'Fully Furnished',
    featured: true,
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Bespoke biophilic Portuguese contemporary luxury villa. Features double-height living room, private infinity plunge pool, solar power integration, and lush garden gazebo.',
    amenities: ['Private Pool', 'Solar Heated', 'Italian Marble', 'Landscaped Lawn', '2 Covered Car Parks', '24/7 Gated Security'],
    agent: {
      id: 'AGT-01',
      name: 'Elena Vance - Prime Estates Realty',
      phone: '+91 98450 12345',
      email: 'elena@primeestates.com',
      avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=200&q=80',
      rating: 4.9,
      activeListings: 18
    }
  },
  {
    id: 'PROP-502',
    purpose: 'rent',
    title: 'Skyline Penthouse with Panoramic Ocean & City View',
    location: 'Bandra West, Mumbai',
    city: 'Mumbai',
    price: 240000, // 2.4 Lakhs/month
    priceDisplay: '₹2.40 Lakh / mo',
    propertyType: 'Penthouse',
    bedrooms: 3,
    bathrooms: 4,
    areaSqFt: 2900,
    furnished: 'Designer Semi-Furnished',
    featured: true,
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'High-floor sea-facing duplex penthouse with expansive private wrap-around terrace, bespoke modular kitchen, and smart-home automation.',
    amenities: ['Sea View', 'Wrap-around Balcony', 'Clubhouse & Gym', 'Valet Concierge', 'EV Charging Bay', 'High Speed Elevators'],
    agent: {
      id: 'AGT-02',
      name: 'Rajeev Singhania - Apex Luxury Living',
      phone: '+91 98200 98765',
      email: 'rajeev@apexluxury.com',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80',
      rating: 4.85,
      activeListings: 24
    }
  },
  {
    id: 'PROP-503',
    purpose: 'buy',
    title: 'Eco-Luxury 3BHK Garden Residence with Clubhouse',
    location: 'Indiranagar 100ft Rd, Bengaluru',
    city: 'Bengaluru',
    price: 26500000, // 2.65 Cr
    priceDisplay: '₹2.65 Cr',
    propertyType: 'Luxury Apartment',
    bedrooms: 3,
    bathrooms: 3,
    areaSqFt: 2150,
    furnished: 'Unfurnished / Bare Shell',
    featured: false,
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Premium vastu-compliant apartment surrounded by mature trees in central Indiranagar. Features acoustic double-glazed windows and VRV air-conditioning.',
    amenities: ['Olympic Lap Pool', 'Tennis Court', 'Squash Court', 'Rainwater Harvesting', 'Children Play Park'],
    agent: {
      id: 'AGT-01',
      name: 'Elena Vance - Prime Estates Realty',
      phone: '+91 98450 12345',
      email: 'elena@primeestates.com',
      avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=200&q=80',
      rating: 4.9,
      activeListings: 18
    }
  },
  {
    id: 'PROP-504',
    purpose: 'rent',
    title: 'Modern Minimalist 2BHK Condo Near Tech Corridor',
    location: 'Whitefield, Bengaluru',
    city: 'Bengaluru',
    price: 52000, // 52k / month
    priceDisplay: '₹52,000 / mo',
    propertyType: 'Luxury Apartment',
    bedrooms: 2,
    bathrooms: 2,
    areaSqFt: 1350,
    furnished: 'Fully Furnished',
    featured: false,
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Tastefully furnished apartment with workstation setup, ergonomic chairs, smart TVs, modular kitchen with appliances, and 1 Gbps fiber readiness.',
    amenities: ['Power Backup', 'Heated Pool', 'Gym & Aerobics', 'Covered Parking', 'Supermarket on Campus'],
    agent: {
      id: 'AGT-03',
      name: 'Deepak Reddy - UrbanSpace Properties',
      phone: '+91 98490 55432',
      email: 'deepak@urbanspace.com',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      rating: 4.75,
      activeListings: 12
    }
  },
  {
    id: 'PROP-505',
    purpose: 'buy',
    title: 'Palatial 5BHK Independent Heritage Bungalow',
    location: 'Vasant Vihar, New Delhi',
    city: 'New Delhi',
    price: 95000000, // 9.5 Cr
    priceDisplay: '₹9.50 Cr',
    propertyType: 'Villa / Independent House',
    bedrooms: 5,
    bathrooms: 6,
    areaSqFt: 5200,
    furnished: 'Semi-Furnished',
    featured: true,
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Prestigious diplomatic enclave residence with private landscaped lawn, servant quarters, home theatre room, and private elevator.',
    amenities: ['Private Elevator', 'Home Cinema', 'Sprawling Lawn', 'Guard Room', 'Modular Barbecue Patio'],
    agent: {
      id: 'AGT-02',
      name: 'Rajeev Singhania - Apex Luxury Living',
      phone: '+91 98200 98765',
      email: 'rajeev@apexluxury.com',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80',
      rating: 4.85,
      activeListings: 24
    }
  }
];
