// Shared cities data with country codes for auto-currency switching
// Used across all service pages (flights, hotels, buses, properties, wellness)

export const INDIAN_CITIES = [
  { name: 'Mumbai', state: 'Maharashtra', country: 'IN' },
  { name: 'Delhi', state: 'Delhi', country: 'IN' },
  { name: 'Bangalore', state: 'Karnataka', country: 'IN' },
  { name: 'Hyderabad', state: 'Telangana', country: 'IN' },
  { name: 'Chennai', state: 'Tamil Nadu', country: 'IN' },
  { name: 'Kolkata', state: 'West Bengal', country: 'IN' },
  { name: 'Pune', state: 'Maharashtra', country: 'IN' },
  { name: 'Ahmedabad', state: 'Gujarat', country: 'IN' },
  { name: 'Jaipur', state: 'Rajasthan', country: 'IN' },
  { name: 'Lucknow', state: 'Uttar Pradesh', country: 'IN' },
  { name: 'Goa', state: 'Goa', country: 'IN' },
  { name: 'Kochi', state: 'Kerala', country: 'IN' },
  { name: 'Chandigarh', state: 'Chandigarh', country: 'IN' },
  { name: 'Indore', state: 'Madhya Pradesh', country: 'IN' },
  { name: 'Bhopal', state: 'Madhya Pradesh', country: 'IN' },
  { name: 'Nagpur', state: 'Maharashtra', country: 'IN' },
  { name: 'Coimbatore', state: 'Tamil Nadu', country: 'IN' },
  { name: 'Visakhapatnam', state: 'Andhra Pradesh', country: 'IN' },
  { name: 'Thiruvananthapuram', state: 'Kerala', country: 'IN' },
  { name: 'Mysore', state: 'Karnataka', country: 'IN' },
  { name: 'Udaipur', state: 'Rajasthan', country: 'IN' },
  { name: 'Varanasi', state: 'Uttar Pradesh', country: 'IN' },
  { name: 'Rishikesh', state: 'Uttarakhand', country: 'IN' },
  { name: 'Dharamsala', state: 'Himachal Pradesh', country: 'IN' },
  { name: 'Haridwar', state: 'Uttarakhand', country: 'IN' },
  { name: 'Amritsar', state: 'Punjab', country: 'IN' },
  { name: 'Surat', state: 'Gujarat', country: 'IN' },
  { name: 'Patna', state: 'Bihar', country: 'IN' },
  { name: 'Ranchi', state: 'Jharkhand', country: 'IN' },
  { name: 'Bhubaneswar', state: 'Odisha', country: 'IN' },
  { name: 'Guwahati', state: 'Assam', country: 'IN' },
  { name: 'Dehradun', state: 'Uttarakhand', country: 'IN' },
  { name: 'Shimla', state: 'Himachal Pradesh', country: 'IN' },
  { name: 'Manali', state: 'Himachal Pradesh', country: 'IN' },
  { name: 'Ooty', state: 'Tamil Nadu', country: 'IN' },
  { name: 'Munnar', state: 'Kerala', country: 'IN' },
  { name: 'Darjeeling', state: 'West Bengal', country: 'IN' },
  { name: 'Agra', state: 'Uttar Pradesh', country: 'IN' },
  { name: 'Jodhpur', state: 'Rajasthan', country: 'IN' },
  { name: 'Jaisalmer', state: 'Rajasthan', country: 'IN' },
  { name: 'Madurai', state: 'Tamil Nadu', country: 'IN' },
  { name: 'Tiruchirappalli', state: 'Tamil Nadu', country: 'IN' },
  { name: 'Aurangabad', state: 'Maharashtra', country: 'IN' },
  { name: 'Nashik', state: 'Maharashtra', country: 'IN' },
  { name: 'Vijayawada', state: 'Andhra Pradesh', country: 'IN' },
  { name: 'Mangalore', state: 'Karnataka', country: 'IN' },
  { name: 'Hubli', state: 'Karnataka', country: 'IN' },
  { name: 'Belgaum', state: 'Karnataka', country: 'IN' },
  { name: 'Tirupati', state: 'Andhra Pradesh', country: 'IN' },
  { name: 'Raipur', state: 'Chhattisgarh', country: 'IN' },
];

export const INTERNATIONAL_CITIES = [
  // USA
  { name: 'New York', state: 'New York', country: 'US' },
  { name: 'Los Angeles', state: 'California', country: 'US' },
  { name: 'San Francisco', state: 'California', country: 'US' },
  { name: 'Chicago', state: 'Illinois', country: 'US' },
  { name: 'Miami', state: 'Florida', country: 'US' },
  { name: 'Las Vegas', state: 'Nevada', country: 'US' },
  { name: 'Houston', state: 'Texas', country: 'US' },
  { name: 'Seattle', state: 'Washington', country: 'US' },
  { name: 'Boston', state: 'Massachusetts', country: 'US' },
  { name: 'Washington DC', state: 'District of Columbia', country: 'US' },
  // UK
  { name: 'London', state: 'England', country: 'GB' },
  { name: 'Manchester', state: 'England', country: 'GB' },
  { name: 'Edinburgh', state: 'Scotland', country: 'GB' },
  { name: 'Birmingham', state: 'England', country: 'GB' },
  // Europe
  { name: 'Paris', state: 'Île-de-France', country: 'FR' },
  { name: 'Berlin', state: 'Berlin', country: 'DE' },
  { name: 'Munich', state: 'Bavaria', country: 'DE' },
  { name: 'Frankfurt', state: 'Hesse', country: 'DE' },
  { name: 'Amsterdam', state: 'North Holland', country: 'NL' },
  { name: 'Rome', state: 'Lazio', country: 'IT' },
  { name: 'Milan', state: 'Lombardy', country: 'IT' },
  { name: 'Barcelona', state: 'Catalonia', country: 'ES' },
  { name: 'Madrid', state: 'Madrid', country: 'ES' },
  { name: 'Zurich', state: 'Zurich', country: 'CH' },
  { name: 'Geneva', state: 'Geneva', country: 'CH' },
  { name: 'Vienna', state: 'Vienna', country: 'AT' },
  { name: 'Prague', state: 'Prague', country: 'CZ' },
  { name: 'Athens', state: 'Attica', country: 'GR' },
  { name: 'Istanbul', state: 'Istanbul', country: 'TR' },
  // UAE
  { name: 'Dubai', state: 'Dubai', country: 'AE' },
  { name: 'Abu Dhabi', state: 'Abu Dhabi', country: 'AE' },
  // Qatar
  { name: 'Doha', state: 'Doha', country: 'QA' },
  // Saudi Arabia
  { name: 'Riyadh', state: 'Riyadh', country: 'SA' },
  { name: 'Jeddah', state: 'Makkah', country: 'SA' },
  // Singapore
  { name: 'Singapore', state: 'Singapore', country: 'SG' },
  // Thailand
  { name: 'Bangkok', state: 'Bangkok', country: 'TH' },
  { name: 'Phuket', state: 'Phuket', country: 'TH' },
  { name: 'Chiang Mai', state: 'Chiang Mai', country: 'TH' },
  { name: 'Pattaya', state: 'Chonburi', country: 'TH' },
  // Japan
  { name: 'Tokyo', state: 'Tokyo', country: 'JP' },
  { name: 'Osaka', state: 'Osaka', country: 'JP' },
  { name: 'Kyoto', state: 'Kyoto', country: 'JP' },
  // South Korea
  { name: 'Seoul', state: 'Seoul', country: 'KR' },
  { name: 'Busan', state: 'Busan', country: 'KR' },
  // China
  { name: 'Beijing', state: 'Beijing', country: 'CN' },
  { name: 'Shanghai', state: 'Shanghai', country: 'CN' },
  { name: 'Hong Kong', state: 'Hong Kong', country: 'HK' },
  // Malaysia
  { name: 'Kuala Lumpur', state: 'KL', country: 'MY' },
  { name: 'Penang', state: 'Penang', country: 'MY' },
  // Indonesia
  { name: 'Bali', state: 'Bali', country: 'ID' },
  { name: 'Jakarta', state: 'Jakarta', country: 'ID' },
  // Vietnam
  { name: 'Ho Chi Minh City', state: 'HCMC', country: 'VN' },
  { name: 'Hanoi', state: 'Hanoi', country: 'VN' },
  // Australia
  { name: 'Sydney', state: 'NSW', country: 'AU' },
  { name: 'Melbourne', state: 'Victoria', country: 'AU' },
  // Canada
  { name: 'Toronto', state: 'Ontario', country: 'CA' },
  { name: 'Vancouver', state: 'BC', country: 'CA' },
  // Nearby countries
  { name: 'Kathmandu', state: 'Bagmati', country: 'NP' },
  { name: 'Pokhara', state: 'Gandaki', country: 'NP' },
  { name: 'Colombo', state: 'Western', country: 'LK' },
  { name: 'Dhaka', state: 'Dhaka', country: 'BD' },
  { name: 'Male', state: 'Maldives', country: 'MV' },
  // Egypt
  { name: 'Cairo', state: 'Cairo', country: 'EG' },
  // South Africa
  { name: 'Cape Town', state: 'Western Cape', country: 'ZA' },
  { name: 'Johannesburg', state: 'Gauteng', country: 'ZA' },
  // Brazil
  { name: 'Rio de Janeiro', state: 'RJ', country: 'BR' },
  { name: 'São Paulo', state: 'SP', country: 'BR' },
  // Mexico
  { name: 'Cancun', state: 'Quintana Roo', country: 'MX' },
  { name: 'Mexico City', state: 'CDMX', country: 'MX' },
  // Russia
  { name: 'Moscow', state: 'Moscow', country: 'RU' },
  // Philippines
  { name: 'Manila', state: 'NCR', country: 'PH' },
  { name: 'Cebu', state: 'Cebu', country: 'PH' },
];

export const ALL_CITIES = [...INDIAN_CITIES, ...INTERNATIONAL_CITIES];

// Country code to country name
export const COUNTRY_NAMES = {
  IN: 'India', US: 'USA', GB: 'UK', FR: 'France', DE: 'Germany',
  NL: 'Netherlands', IT: 'Italy', ES: 'Spain', CH: 'Switzerland',
  AT: 'Austria', CZ: 'Czech Republic', GR: 'Greece', TR: 'Turkey',
  AE: 'UAE', QA: 'Qatar', SA: 'Saudi Arabia', SG: 'Singapore',
  TH: 'Thailand', JP: 'Japan', KR: 'South Korea', CN: 'China',
  HK: 'Hong Kong', MY: 'Malaysia', ID: 'Indonesia', VN: 'Vietnam',
  AU: 'Australia', CA: 'Canada', NP: 'Nepal', LK: 'Sri Lanka',
  BD: 'Bangladesh', MV: 'Maldives', EG: 'Egypt', ZA: 'South Africa',
  BR: 'Brazil', MX: 'Mexico', RU: 'Russia', PH: 'Philippines',
};

// Country code to currency code
export const COUNTRY_TO_CURRENCY = {
  IN: 'INR', US: 'USD', GB: 'GBP', FR: 'EUR', DE: 'EUR',
  NL: 'EUR', IT: 'EUR', ES: 'EUR', CH: 'EUR', AT: 'EUR',
  CZ: 'EUR', GR: 'EUR', TR: 'EUR', AE: 'AED', QA: 'AED',
  SA: 'AED', SG: 'SGD', TH: 'THB', JP: 'JPY', KR: 'USD',
  CN: 'USD', HK: 'USD', MY: 'USD', ID: 'USD', VN: 'USD',
  AU: 'USD', CA: 'USD', NP: 'INR', LK: 'INR', BD: 'INR',
  MV: 'USD', EG: 'USD', ZA: 'USD', BR: 'USD', MX: 'USD',
  RU: 'USD', PH: 'USD',
};

// Get currency code for a city name
export function getCurrencyForCity(cityName) {
  if (!cityName || cityName === 'all' || cityName === 'All Cities' || cityName === 'All Destinations') {
    return 'INR';
  }
  const city = ALL_CITIES.find(
    c => c.name.toLowerCase() === cityName.toLowerCase()
  );
  if (!city) return 'INR';
  return COUNTRY_TO_CURRENCY[city.country] || 'INR';
}

// Get country name for a city
export function getCountryForCity(cityName) {
  const city = ALL_CITIES.find(
    c => c.name.toLowerCase() === cityName.toLowerCase()
  );
  if (!city) return null;
  return COUNTRY_NAMES[city.country] || null;
}

// Filter cities by search term (matches name, state, or country name)
export function filterCities(searchTerm, cities = ALL_CITIES) {
  if (!searchTerm) return cities;
  const term = searchTerm.toLowerCase();
  return cities.filter(c =>
    c.name.toLowerCase().includes(term) ||
    c.state.toLowerCase().includes(term) ||
    (COUNTRY_NAMES[c.country] || '').toLowerCase().includes(term)
  );
}

// Get display label for a city (e.g., "Mumbai, Maharashtra" or "Tokyo, Japan")
export function getCityLabel(city) {
  if (city.country === 'IN') {
    return `${city.name}, ${city.state}`;
  }
  return `${city.name}, ${COUNTRY_NAMES[city.country] || city.country}`;
}
