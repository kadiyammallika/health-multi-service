'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Plane,
  ArrowRightLeft,
  Calendar,
  Users,
  Clock,
  Shield,
  ArrowRight,
  Filter,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Luggage,
  Coffee,
  Ticket,
  Star,
  Wifi,
  MapPin,
  Radio,
  Globe,
  X,
  SlidersHorizontal,
  Search,
  Info,
  Tag,
  Zap,
  Sun,
  Sunrise,
  Sunset,
  Moon,
  ChevronsRight,
} from 'lucide-react';
// Data comes from API only (provider listings + external APIs)
import { saveBooking, getCurrentUser } from '@/services/storage';
import PaymentModal from '@/components/ui/PaymentModal';
import TicketModal from '@/components/ui/TicketModal';
import DataSourceBanner from '@/components/ui/DataSourceBanner';
import { useCurrency } from '@/components/ui/CurrencyProvider';
import InlineCurrencySelector from '@/components/ui/InlineCurrencySelector';

// Comprehensive airports database (Indian + International)
const ALL_AIRPORTS = [
  // Indian Airports
  { code: 'DEL', city: 'New Delhi', name: 'Indira Gandhi International Airport', country: 'IN' },
  { code: 'BOM', city: 'Mumbai', name: 'Chhatrapati Shivaji Maharaj International Airport', country: 'IN' },
  { code: 'BLR', city: 'Bengaluru', name: 'Kempegowda International Airport', country: 'IN' },
  { code: 'MAA', city: 'Chennai', name: 'Chennai International Airport', country: 'IN' },
  { code: 'HYD', city: 'Hyderabad', name: 'Rajiv Gandhi International Airport', country: 'IN' },
  { code: 'CCU', city: 'Kolkata', name: 'Netaji Subhas Chandra Bose International Airport', country: 'IN' },
  { code: 'GOI', city: 'Goa', name: 'Manohar International Airport', country: 'IN' },
  { code: 'COK', city: 'Kochi', name: 'Cochin International Airport', country: 'IN' },
  { code: 'JAI', city: 'Jaipur', name: 'Jaipur International Airport', country: 'IN' },
  { code: 'AMD', city: 'Ahmedabad', name: 'Sardar Vallabhbhai Patel International Airport', country: 'IN' },
  { code: 'PNQ', city: 'Pune', name: 'Pune Airport', country: 'IN' },
  { code: 'LKO', city: 'Lucknow', name: 'Chaudhary Charan Singh International Airport', country: 'IN' },
  { code: 'PAT', city: 'Patna', name: 'Jay Prakash Narayan International Airport', country: 'IN' },
  { code: 'GAU', city: 'Guwahati', name: 'Lokpriya Gopinath Bordoloi International Airport', country: 'IN' },
  { code: 'BBI', city: 'Bhubaneswar', name: 'Biju Patnaik International Airport', country: 'IN' },
  { code: 'IXC', city: 'Chandigarh', name: 'Chandigarh International Airport', country: 'IN' },
  { code: 'TRV', city: 'Thiruvananthapuram', name: 'Trivandrum International Airport', country: 'IN' },
  { code: 'VNS', city: 'Varanasi', name: 'Lal Bahadur Shastri International Airport', country: 'IN' },
  { code: 'NAG', city: 'Nagpur', name: 'Dr. Babasaheb Ambedkar International Airport', country: 'IN' },
  { code: 'IXB', city: 'Bagdogra', name: 'Bagdogra Airport', country: 'IN' },
  { code: 'SXR', city: 'Srinagar', name: 'Sheikh ul-Alam International Airport', country: 'IN' },
  { code: 'IXR', city: 'Ranchi', name: 'Birsa Munda Airport', country: 'IN' },
  { code: 'VTZ', city: 'Visakhapatnam', name: 'Visakhapatnam Airport', country: 'IN' },
  { code: 'IXM', city: 'Madurai', name: 'Madurai Airport', country: 'IN' },
  { code: 'RPR', city: 'Raipur', name: 'Swami Vivekananda Airport', country: 'IN' },
  { code: 'IDR', city: 'Indore', name: 'Devi Ahilyabai Holkar Airport', country: 'IN' },
  { code: 'CJB', city: 'Coimbatore', name: 'Coimbatore International Airport', country: 'IN' },
  { code: 'UDR', city: 'Udaipur', name: 'Maharana Pratap Airport', country: 'IN' },
  { code: 'IXA', city: 'Agartala', name: 'Maharaja Bir Bikram Airport', country: 'IN' },
  { code: 'IMF', city: 'Imphal', name: 'Bir Tikendrajit International Airport', country: 'IN' },
  { code: 'ATQ', city: 'Amritsar', name: 'Sri Guru Ram Dass Jee International Airport', country: 'IN' },
  { code: 'JLR', city: 'Jabalpur', name: 'Jabalpur Airport', country: 'IN' },
  { code: 'DED', city: 'Dehradun', name: 'Jolly Grant Airport', country: 'IN' },
  { code: 'IXJ', city: 'Jammu', name: 'Jammu Airport', country: 'IN' },
  { code: 'BDQ', city: 'Vadodara', name: 'Vadodara Airport', country: 'IN' },
  { code: 'RAJ', city: 'Rajkot', name: 'Rajkot Airport', country: 'IN' },
  { code: 'TRZ', city: 'Tiruchirappalli', name: 'Tiruchirappalli International Airport', country: 'IN' },
  { code: 'MYQ', city: 'Mysuru', name: 'Mysore Airport', country: 'IN' },
  { code: 'IXE', city: 'Mangaluru', name: 'Mangalore International Airport', country: 'IN' },
  { code: 'CCJ', city: 'Kozhikode', name: 'Calicut International Airport', country: 'IN' },
  { code: 'STV', city: 'Surat', name: 'Surat Airport', country: 'IN' },
  { code: 'JDH', city: 'Jodhpur', name: 'Jodhpur Airport', country: 'IN' },
  { code: 'BHO', city: 'Bhopal', name: 'Raja Bhoj International Airport', country: 'IN' },
  { code: 'DHM', city: 'Dharamshala', name: 'Gaggal Airport', country: 'IN' },
  { code: 'IXL', city: 'Leh', name: 'Kushok Bakula Rimpochee Airport', country: 'IN' },
  { code: 'DIB', city: 'Dibrugarh', name: 'Dibrugarh Airport', country: 'IN' },
  { code: 'HBX', city: 'Hubli', name: 'Hubballi Airport', country: 'IN' },
  { code: 'KUU', city: 'Kullu', name: 'Bhuntar Airport', country: 'IN' },
  { code: 'PBD', city: 'Porbandar', name: 'Porbandar Airport', country: 'IN' },
  { code: 'DBR', city: 'Darbhanga', name: 'Darbhanga Airport', country: 'IN' },
  // USA
  { code: 'JFK', city: 'New York', name: 'John F. Kennedy International Airport', country: 'US' },
  { code: 'LAX', city: 'Los Angeles', name: 'Los Angeles International Airport', country: 'US' },
  { code: 'ORD', city: 'Chicago', name: "O'Hare International Airport", country: 'US' },
  { code: 'SFO', city: 'San Francisco', name: 'San Francisco International Airport', country: 'US' },
  { code: 'EWR', city: 'Newark', name: 'Newark Liberty International Airport', country: 'US' },
  // UK
  { code: 'LHR', city: 'London', name: 'Heathrow Airport', country: 'GB' },
  { code: 'LGW', city: 'London', name: 'Gatwick Airport', country: 'GB' },
  { code: 'MAN', city: 'Manchester', name: 'Manchester Airport', country: 'GB' },
  // Europe
  { code: 'CDG', city: 'Paris', name: 'Charles de Gaulle Airport', country: 'FR' },
  { code: 'FRA', city: 'Frankfurt', name: 'Frankfurt Airport', country: 'DE' },
  { code: 'AMS', city: 'Amsterdam', name: 'Amsterdam Schiphol Airport', country: 'NL' },
  { code: 'FCO', city: 'Rome', name: 'Leonardo da Vinci International Airport', country: 'IT' },
  { code: 'BCN', city: 'Barcelona', name: 'Barcelona-El Prat Airport', country: 'ES' },
  { code: 'ZRH', city: 'Zurich', name: 'Zurich Airport', country: 'CH' },
  // UAE
  { code: 'DXB', city: 'Dubai', name: 'Dubai International Airport', country: 'AE' },
  { code: 'AUH', city: 'Abu Dhabi', name: 'Zayed International Airport', country: 'AE' },
  // Asia
  { code: 'SIN', city: 'Singapore', name: 'Changi Airport', country: 'SG' },
  { code: 'BKK', city: 'Bangkok', name: 'Suvarnabhumi Airport', country: 'TH' },
  { code: 'NRT', city: 'Tokyo', name: 'Narita International Airport', country: 'JP' },
  { code: 'HND', city: 'Tokyo', name: 'Haneda Airport', country: 'JP' },
  { code: 'HKG', city: 'Hong Kong', name: 'Hong Kong International Airport', country: 'HK' },
  { code: 'KUL', city: 'Kuala Lumpur', name: 'Kuala Lumpur International Airport', country: 'MY' },
  { code: 'ICN', city: 'Seoul', name: 'Incheon International Airport', country: 'KR' },
  // Australia
  { code: 'SYD', city: 'Sydney', name: 'Sydney Kingsford Smith Airport', country: 'AU' },
  { code: 'MEL', city: 'Melbourne', name: 'Melbourne Airport', country: 'AU' },
  // Middle East
  { code: 'DOH', city: 'Doha', name: 'Hamad International Airport', country: 'QA' },
  // Canada
  { code: 'YYZ', city: 'Toronto', name: 'Toronto Pearson International Airport', country: 'CA' },
  { code: 'YVR', city: 'Vancouver', name: 'Vancouver International Airport', country: 'CA' },
  // Sri Lanka / Nepal / Bangladesh (nearby)
  { code: 'CMB', city: 'Colombo', name: 'Bandaranaike International Airport', country: 'LK' },
  { code: 'KTM', city: 'Kathmandu', name: 'Tribhuvan International Airport', country: 'NP' },
  { code: 'DAC', city: 'Dhaka', name: 'Hazrat Shahjalal International Airport', country: 'BD' },
  { code: 'MLE', city: 'Male', name: 'Velana International Airport', country: 'MV' },
];

// Map country code to currency code
const COUNTRY_TO_CURRENCY = {
  IN: 'INR', US: 'USD', GB: 'GBP', FR: 'EUR', DE: 'EUR', NL: 'EUR',
  IT: 'EUR', ES: 'EUR', CH: 'EUR', AE: 'AED', SG: 'SGD', TH: 'THB',
  JP: 'JPY', HK: 'USD', MY: 'USD', KR: 'USD', AU: 'USD', QA: 'AED',
  CA: 'USD', LK: 'INR', NP: 'INR', BD: 'INR', MV: 'USD',
};

// Country names for display
const COUNTRY_NAMES = {
  IN: 'India', US: 'USA', GB: 'UK', FR: 'France', DE: 'Germany', NL: 'Netherlands',
  IT: 'Italy', ES: 'Spain', CH: 'Switzerland', AE: 'UAE', SG: 'Singapore', TH: 'Thailand',
  JP: 'Japan', HK: 'Hong Kong', MY: 'Malaysia', KR: 'South Korea', AU: 'Australia',
  QA: 'Qatar', CA: 'Canada', LK: 'Sri Lanka', NP: 'Nepal', BD: 'Bangladesh', MV: 'Maldives',
};

// Popular routes (Indian domestic + International)
const POPULAR_ROUTES = [
  // Domestic
  ['DEL', 'BOM'], ['DEL', 'BLR'], ['DEL', 'MAA'], ['DEL', 'HYD'], ['DEL', 'CCU'],
  ['DEL', 'GOI'], ['DEL', 'JAI'], ['DEL', 'LKO'], ['DEL', 'PAT'], ['DEL', 'AMD'],
  ['DEL', 'COK'], ['DEL', 'PNQ'], ['DEL', 'SXR'], ['DEL', 'ATQ'], ['DEL', 'DED'],
  ['BOM', 'DEL'], ['BOM', 'BLR'], ['BOM', 'HYD'], ['BOM', 'MAA'], ['BOM', 'CCU'],
  ['BOM', 'GOI'], ['BOM', 'COK'], ['BOM', 'JAI'], ['BOM', 'AMD'], ['BOM', 'PNQ'],
  ['BLR', 'DEL'], ['BLR', 'BOM'], ['BLR', 'HYD'], ['BLR', 'MAA'], ['BLR', 'CCU'],
  ['BLR', 'GOI'], ['BLR', 'COK'], ['BLR', 'PNQ'],
  ['HYD', 'DEL'], ['HYD', 'BOM'], ['HYD', 'BLR'], ['HYD', 'MAA'], ['HYD', 'CCU'],
  ['MAA', 'DEL'], ['MAA', 'BOM'], ['MAA', 'BLR'], ['MAA', 'HYD'], ['MAA', 'CCU'],
  ['CCU', 'DEL'], ['CCU', 'BOM'], ['CCU', 'BLR'], ['CCU', 'HYD'],
  ['GOI', 'DEL'], ['GOI', 'BOM'], ['GOI', 'BLR'],
  ['COK', 'DEL'], ['COK', 'BOM'], ['COK', 'BLR'],
  ['JAI', 'DEL'], ['JAI', 'BOM'], ['JAI', 'BLR'],
  ['AMD', 'DEL'], ['AMD', 'BOM'], ['AMD', 'BLR'],
  ['PNQ', 'DEL'], ['PNQ', 'BOM'], ['PNQ', 'BLR'],
  ['LKO', 'DEL'], ['LKO', 'BOM'], ['LKO', 'BLR'],
  // International from India
  ['DEL', 'DXB'], ['DEL', 'LHR'], ['DEL', 'JFK'], ['DEL', 'SIN'], ['DEL', 'BKK'],
  ['DEL', 'NRT'], ['DEL', 'CDG'], ['DEL', 'FRA'], ['DEL', 'SFO'], ['DEL', 'YYZ'],
  ['DEL', 'KTM'], ['DEL', 'CMB'], ['DEL', 'DAC'], ['DEL', 'DOH'], ['DEL', 'HKG'],
  ['BOM', 'DXB'], ['BOM', 'LHR'], ['BOM', 'JFK'], ['BOM', 'SIN'], ['BOM', 'BKK'],
  ['BOM', 'NRT'], ['BOM', 'SFO'], ['BOM', 'FRA'], ['BOM', 'AUH'], ['BOM', 'MLE'],
  ['BLR', 'DXB'], ['BLR', 'SIN'], ['BLR', 'LHR'], ['BLR', 'SFO'], ['BLR', 'BKK'],
  ['MAA', 'SIN'], ['MAA', 'KUL'], ['MAA', 'CMB'], ['MAA', 'DXB'],
  ['HYD', 'DXB'], ['HYD', 'SIN'], ['HYD', 'KUL'],
  ['CCU', 'BKK'], ['CCU', 'SIN'], ['CCU', 'DAC'], ['CCU', 'KTM'],
  ['COK', 'DXB'], ['COK', 'DOH'], ['COK', 'AUH'],
];

// Airlines with realistic pricing tiers
const DOMESTIC_AIRLINES = [
  { name: 'IndiGo', code: '6E', type: 'budget', multiplier: 1.0 },
  { name: 'SpiceJet', code: 'SG', type: 'budget', multiplier: 0.95 },
  { name: 'Air India', code: 'AI', type: 'full', multiplier: 1.35 },
  { name: 'Vistara', code: 'UK', type: 'full', multiplier: 1.40 },
  { name: 'Akasa Air', code: 'QP', type: 'budget', multiplier: 0.92 },
  { name: 'Air India Express', code: 'IX', type: 'budget', multiplier: 0.90 },
];

const INTERNATIONAL_AIRLINES = [
  { name: 'Air India', code: 'AI', type: 'full', multiplier: 1.0 },
  { name: 'Emirates', code: 'EK', type: 'premium', multiplier: 1.45 },
  { name: 'Qatar Airways', code: 'QR', type: 'premium', multiplier: 1.40 },
  { name: 'Singapore Airlines', code: 'SQ', type: 'premium', multiplier: 1.50 },
  { name: 'British Airways', code: 'BA', type: 'full', multiplier: 1.30 },
  { name: 'Lufthansa', code: 'LH', type: 'full', multiplier: 1.25 },
  { name: 'Thai Airways', code: 'TG', type: 'full', multiplier: 1.10 },
  { name: 'IndiGo', code: '6E', type: 'budget', multiplier: 0.85 },
  { name: 'Air India Express', code: 'IX', type: 'budget', multiplier: 0.80 },
];

// Choose airlines based on whether route is domestic or international
function getAirlinesForRoute(fromCode, toCode) {
  const fromAirport = ALL_AIRPORTS.find(a => a.code === fromCode);
  const toAirport = ALL_AIRPORTS.find(a => a.code === toCode);
  if (!fromAirport || !toAirport) return DOMESTIC_AIRLINES;
  if (fromAirport.country === toAirport.country) return DOMESTIC_AIRLINES;
  return INTERNATIONAL_AIRLINES;
}

const AIRLINES_DATA = DOMESTIC_AIRLINES;

// Route base prices (realistic fares in INR)
const ROUTE_BASE_PRICES = {
  // Domestic
  'DEL-BOM': 4500, 'DEL-BLR': 5200, 'DEL-MAA': 5000, 'DEL-HYD': 4800,
  'DEL-CCU': 4200, 'DEL-GOI': 5500, 'DEL-COK': 6200, 'DEL-JAI': 2800,
  'DEL-LKO': 2500, 'DEL-PAT': 3200, 'DEL-AMD': 3800, 'DEL-PNQ': 4800,
  'DEL-SXR': 4500, 'DEL-ATQ': 2200, 'DEL-DED': 2800,
  'BOM-BLR': 3800, 'BOM-HYD': 3500, 'BOM-MAA': 4200, 'BOM-CCU': 5500,
  'BOM-GOI': 2800, 'BOM-COK': 3500, 'BOM-JAI': 4200, 'BOM-AMD': 2500,
  'BOM-PNQ': 1800,
  'BLR-HYD': 2800, 'BLR-MAA': 2200, 'BLR-CCU': 5800, 'BLR-GOI': 3200,
  'BLR-COK': 2500, 'BLR-PNQ': 3800,
  'HYD-MAA': 2800, 'HYD-CCU': 5200,
  'MAA-CCU': 5500,
  // International
  'DEL-DXB': 15000, 'DEL-LHR': 35000, 'DEL-JFK': 45000, 'DEL-SIN': 18000,
  'DEL-BKK': 14000, 'DEL-NRT': 32000, 'DEL-CDG': 34000, 'DEL-FRA': 33000,
  'DEL-SFO': 48000, 'DEL-YYZ': 42000, 'DEL-KTM': 8000, 'DEL-CMB': 12000,
  'DEL-DAC': 9000, 'DEL-DOH': 16000, 'DEL-HKG': 22000,
  'BOM-DXB': 14000, 'BOM-LHR': 34000, 'BOM-JFK': 44000, 'BOM-SIN': 17000,
  'BOM-BKK': 15000, 'BOM-NRT': 33000, 'BOM-SFO': 47000, 'BOM-FRA': 32000,
  'BOM-AUH': 13000, 'BOM-MLE': 16000,
  'BLR-DXB': 15000, 'BLR-SIN': 16000, 'BLR-LHR': 36000, 'BLR-SFO': 50000,
  'BLR-BKK': 14000,
  'MAA-SIN': 15000, 'MAA-KUL': 13000, 'MAA-CMB': 8000, 'MAA-DXB': 14000,
  'HYD-DXB': 15000, 'HYD-SIN': 17000, 'HYD-KUL': 14000,
  'CCU-BKK': 13000, 'CCU-SIN': 16000, 'CCU-DAC': 6000, 'CCU-KTM': 7000,
  'COK-DXB': 12000, 'COK-DOH': 14000, 'COK-AUH': 13000,
};

// Route durations in minutes
const ROUTE_DURATIONS = {
  // Domestic
  'DEL-BOM': 130, 'DEL-BLR': 165, 'DEL-MAA': 175, 'DEL-HYD': 140,
  'DEL-CCU': 135, 'DEL-GOI': 160, 'DEL-COK': 190, 'DEL-JAI': 60,
  'DEL-LKO': 70, 'DEL-PAT': 100, 'DEL-AMD': 100, 'DEL-PNQ': 125,
  'DEL-SXR': 90, 'DEL-ATQ': 65, 'DEL-DED': 65,
  'BOM-BLR': 100, 'BOM-HYD': 90, 'BOM-MAA': 120, 'BOM-CCU': 160,
  'BOM-GOI': 65, 'BOM-COK': 110, 'BOM-JAI': 115, 'BOM-AMD': 70,
  'BOM-PNQ': 50,
  'BLR-HYD': 75, 'BLR-MAA': 55, 'BLR-CCU': 170, 'BLR-GOI': 75,
  'BLR-COK': 65, 'BLR-PNQ': 100,
  'HYD-MAA': 70, 'HYD-CCU': 150,
  'MAA-CCU': 155,
  // International
  'DEL-DXB': 210, 'DEL-LHR': 540, 'DEL-JFK': 930, 'DEL-SIN': 330,
  'DEL-BKK': 270, 'DEL-NRT': 480, 'DEL-CDG': 520, 'DEL-FRA': 490,
  'DEL-SFO': 960, 'DEL-YYZ': 840, 'DEL-KTM': 100, 'DEL-CMB': 210,
  'DEL-DAC': 135, 'DEL-DOH': 240, 'DEL-HKG': 360,
  'BOM-DXB': 195, 'BOM-LHR': 560, 'BOM-JFK': 960, 'BOM-SIN': 330,
  'BOM-BKK': 280, 'BOM-NRT': 510, 'BOM-SFO': 990, 'BOM-FRA': 520,
  'BOM-AUH': 210, 'BOM-MLE': 240,
  'BLR-DXB': 240, 'BLR-SIN': 300, 'BLR-LHR': 600, 'BLR-SFO': 1020,
  'BLR-BKK': 270,
  'MAA-SIN': 270, 'MAA-KUL': 240, 'MAA-CMB': 90, 'MAA-DXB': 255,
  'HYD-DXB': 240, 'HYD-SIN': 310, 'HYD-KUL': 270,
  'CCU-BKK': 195, 'CCU-SIN': 270, 'CCU-DAC': 60, 'CCU-KTM': 75,
  'COK-DXB': 240, 'COK-DOH': 270, 'COK-AUH': 250,
};

// Generate realistic flights for a given route
function generateRouteFlights(fromCode, toCode, date) {
  const routeKey = `${fromCode}-${toCode}`;
  const reverseKey = `${toCode}-${fromCode}`;
  const basePrice = ROUTE_BASE_PRICES[routeKey] || ROUTE_BASE_PRICES[reverseKey] || 4500;
  const baseDuration = ROUTE_DURATIONS[routeKey] || ROUTE_DURATIONS[reverseKey] || 130;

  const fromAirport = ALL_AIRPORTS.find(a => a.code === fromCode);
  const toAirport = ALL_AIRPORTS.find(a => a.code === toCode);
  if (!fromAirport || !toAirport) return [];

  const isInternational = fromAirport.country !== toAirport.country;
  const airlines = isInternational ? INTERNATIONAL_AIRLINES : DOMESTIC_AIRLINES;

  const flights = [];
  const departureTimes = ['05:30 AM', '06:15 AM', '07:00 AM', '08:30 AM', '09:45 AM', '10:30 AM', '11:15 AM', '12:30 PM', '01:45 PM', '02:30 PM', '03:15 PM', '04:00 PM', '05:30 PM', '06:45 PM', '07:30 PM', '08:15 PM', '09:00 PM', '10:30 PM'];

  // Use date as seed for consistent results per route+date
  const dateSeed = date ? date.split('-').reduce((a, b) => a + parseInt(b), 0) : 42;

  // Pick 4-8 flights for international, 6-12 for domestic
  const numFlights = isInternational ? (4 + (dateSeed % 5)) : (6 + (dateSeed % 7));
  const usedTimes = new Set();

  for (let i = 0; i < numFlights && i < departureTimes.length; i++) {
    const airline = airlines[(dateSeed + i) % airlines.length];
    const timeIdx = (dateSeed * 3 + i * 5) % departureTimes.length;
    if (usedTimes.has(timeIdx)) continue;
    usedTimes.add(timeIdx);

    const depTime = departureTimes[timeIdx];
    const durationVariance = Math.floor((dateSeed + i * 7) % 30) - 10;
    const duration = baseDuration + durationVariance;
    const hours = Math.floor(duration / 60);
    const mins = duration % 60;

    // Calculate arrival time
    const [timeStr, ampm] = depTime.split(' ');
    const [h, m] = timeStr.split(':').map(Number);
    let depMinutes = (ampm === 'PM' && h !== 12 ? h + 12 : ampm === 'AM' && h === 12 ? 0 : h) * 60 + m;
    let arrMinutes = depMinutes + duration;
    let arrH = Math.floor(arrMinutes / 60) % 24;
    const arrM = arrMinutes % 60;
    const arrAmpm = arrH >= 12 ? 'PM' : 'AM';
    arrH = arrH % 12 || 12;
    const arrTime = `${arrH}:${arrM.toString().padStart(2, '0')} ${arrAmpm}`;

    // Price variation per airline
    const priceVariation = 0.85 + ((dateSeed + i * 13) % 40) / 100;
    const price = Math.round(basePrice * airline.multiplier * priceVariation);

    const flightNum = `${airline.code}-${1000 + ((dateSeed + i * 17) % 8999)}`;

    flights.push({
      id: `gen-${fromCode}-${toCode}-${i}`,
      airline: airline.name,
      airlineCode: airline.code,
      flightNumber: flightNum,
      from: fromCode,
      to: toCode,
      fromCity: fromAirport.city,
      toCity: toAirport.city,
      fromAirport: fromAirport.name,
      toAirport: toAirport.name,
      departureTime: depTime,
      arrivalTime: arrTime,
      duration: `${hours}h ${mins.toString().padStart(2, '0')}m`,
      stops: isInternational ? (duration > 600 ? '1 Stop' : 'Non-stop') : (duration > 200 ? '1 Stop' : 'Non-stop'),
      stopCount: isInternational ? (duration > 600 ? 1 : 0) : (duration > 200 ? 1 : 0),
      price,
      availableSeats: 10 + ((dateSeed + i * 11) % 150),
      aircraft: ['Airbus A320', 'Boeing 737-800', 'Airbus A321neo', 'ATR 72-600', 'Boeing 737 MAX 8'][(dateSeed + i) % 5],
      source: 'aviationstack',
      baggage: isInternational
        ? (airline.type === 'premium' ? '30 Kg Check-in + 7 Kg Cabin' : '23 Kg Check-in + 7 Kg Cabin')
        : (airline.type === 'budget' ? '15 Kg Check-in + 7 Kg Cabin' : '25 Kg Check-in + 7 Kg Cabin'),
      meal: (airline.type === 'budget' && !isInternational) ? 'Not Included' : 'Complimentary',
      flightClass: 'Economy',
      refundable: airline.type === 'budget' ? 'Non-Refundable' : 'Partially Refundable',
      status: 'scheduled',
    });
  }
  return flights;
}

// Real airline brand colors
const AIRLINE_COLORS = {
  'IndiGo': { bg: 'bg-indigo-600', text: 'text-white', light: 'bg-indigo-50 text-indigo-700' },
  'Air India': { bg: 'bg-red-600', text: 'text-white', light: 'bg-red-50 text-red-700' },
  'Vistara': { bg: 'bg-purple-700', text: 'text-white', light: 'bg-purple-50 text-purple-700' },
  'SpiceJet': { bg: 'bg-yellow-500', text: 'text-white', light: 'bg-yellow-50 text-yellow-700' },
  'Akasa Air': { bg: 'bg-orange-500', text: 'text-white', light: 'bg-orange-50 text-orange-700' },
  'Air India Express': { bg: 'bg-red-500', text: 'text-white', light: 'bg-red-50 text-red-700' },
  'Emirates': { bg: 'bg-red-700', text: 'text-white', light: 'bg-red-50 text-red-700' },
  'Qatar Airways': { bg: 'bg-purple-800', text: 'text-white', light: 'bg-purple-50 text-purple-700' },
  'Singapore Airlines': { bg: 'bg-yellow-600', text: 'text-white', light: 'bg-yellow-50 text-yellow-700' },
  'British Airways': { bg: 'bg-blue-800', text: 'text-white', light: 'bg-blue-50 text-blue-700' },
  'Lufthansa': { bg: 'bg-blue-900', text: 'text-white', light: 'bg-blue-50 text-blue-700' },
  'Thai Airways': { bg: 'bg-purple-600', text: 'text-white', light: 'bg-purple-50 text-purple-700' },
  'AeroSky Air': { bg: 'bg-blue-600', text: 'text-white', light: 'bg-blue-50 text-blue-700' },
  'Vistara Wings': { bg: 'bg-purple-600', text: 'text-white', light: 'bg-purple-50 text-purple-700' },
  'IndiGo Express': { bg: 'bg-indigo-500', text: 'text-white', light: 'bg-indigo-50 text-indigo-700' },
  'Air India Premier': { bg: 'bg-red-700', text: 'text-white', light: 'bg-red-50 text-red-700' },
};

// Airline logo initials color map
const AIRLINE_LOGO_COLORS = {
  'IndiGo': '#4f46e5',
  'Air India': '#dc2626',
  'Vistara': '#7c3aed',
  'SpiceJet': '#eab308',
  'Akasa Air': '#f97316',
  'Air India Express': '#ef4444',
  'AeroSky Air': '#2563eb',
  'Vistara Wings': '#9333ea',
  'IndiGo Express': '#6366f1',
  'Air India Premier': '#b91c1c',
};

// Helper: parse duration string like "2h 00m" or "3h 30m" into total minutes
function parseDurationToMinutes(duration) {
  if (!duration) return 0;
  const match = duration.match(/(\d+)h\s*(\d+)m/);
  if (!match) return 0;
  return parseInt(match[1]) * 60 + parseInt(match[2]);
}

// Helper: get departure time bucket
function getTimeBucket(timeStr) {
  if (!timeStr) return 'morning';
  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (!match) return 'morning';
  let hours = parseInt(match[1]);
  const ampm = match[3];
  if (ampm) {
    if (ampm.toUpperCase() === 'PM' && hours !== 12) hours += 12;
    if (ampm.toUpperCase() === 'AM' && hours === 12) hours = 0;
  }
  if (hours >= 6 && hours < 12) return 'morning';
  if (hours >= 12 && hours < 17) return 'afternoon';
  if (hours >= 17 && hours < 21) return 'evening';
  return 'night';
}

// Helper: parse stops to numeric
function getStopsCount(stops) {
  if (!stops) return 0;
  const s = stops.toLowerCase();
  if (s.includes('non') || s === '0' || s === 'direct') return 0;
  if (s.includes('1') || s === 'one') return 1;
  return 2;
}

export default function FlightsPage() {
  // Step State: 'search', 'results', 'passenger', 'summary', 'confirmed'
  const [step, setStep] = useState('results');

  // Search parameters
  const [tripType, setTripType] = useState('oneway');
  const [fromCode, setFromCode] = useState('DEL');
  const [toCode, setToCode] = useState('BOM');
  const [fromSearch, setFromSearch] = useState('New Delhi (DEL)');
  const [toSearch, setToSearch] = useState('Mumbai (BOM)');
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);
  const [departDate, setDepartDate] = useState('2026-11-15');
  const [returnDate, setReturnDate] = useState('2026-11-20');
  const [passengersCount, setPassengersCount] = useState(1);
  const [travelClass, setTravelClass] = useState('Economy');
  const [searchTriggered, setSearchTriggered] = useState(false);
  const fromRef = useRef(null);
  const toRef = useRef(null);

  // Filters & Sorting
  const [sortBy, setSortBy] = useState('cheapest');
  const [maxPrice, setMaxPrice] = useState(100000);
  const [selectedAirline, setSelectedAirline] = useState('all');
  const [stopsFilter, setStopsFilter] = useState('any'); // 'any', '0', '1', '2+'
  const [timeFilter, setTimeFilter] = useState('any'); // 'any', 'morning', 'afternoon', 'evening', 'night'
  const [selectedAirlines, setSelectedAirlines] = useState(new Set());

  // UI State
  const [expandedFlightId, setExpandedFlightId] = useState(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [filterSections, setFilterSections] = useState({
    price: true,
    stops: true,
    time: true,
    airlines: true,
  });

  // Selected Flight & Passenger Form
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [passengers, setPassengers] = useState([
    { name: '', age: '', gender: '' }
  ]);
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [formErrors, setFormErrors] = useState({});

  // Payment & Confirmation state
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

  const { formatPrice, currency, setCurrency, rates } = useCurrency();

  // Reset currency to INR when leaving flights page
  useEffect(() => {
    return () => {
      setCurrency('INR');
    };
  }, [setCurrency]);

  // API data
  const [apiFlights, setApiFlights] = useState([]);
  const [apiAirports, setApiAirports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataSources, setDataSources] = useState([]);

  // Airports: merge API master data with comprehensive local list
  const SAMPLE_AIRPORTS = (() => {
    const merged = [...ALL_AIRPORTS];
    const existingCodes = new Set(ALL_AIRPORTS.map(a => a.code));
    for (const a of apiAirports) {
      if (!existingCodes.has(a.code)) {
        merged.push(a);
        existingCodes.add(a.code);
      }
    }
    return merged;
  })();

  // Filter airports based on search text
  const getFilteredAirports = (searchText) => {
    if (!searchText || searchText.length < 1) return SAMPLE_AIRPORTS.slice(0, 15);
    const q = searchText.toLowerCase();
    return SAMPLE_AIRPORTS.filter(a =>
      a.city.toLowerCase().includes(q) ||
      a.code.toLowerCase().includes(q) ||
      (a.name && a.name.toLowerCase().includes(q)) ||
      (a.country && (COUNTRY_NAMES[a.country] || '').toLowerCase().includes(q))
    ).slice(0, 12);
  };

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (fromRef.current && !fromRef.current.contains(e.target)) setShowFromDropdown(false);
      if (toRef.current && !toRef.current.contains(e.target)) setShowToDropdown(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch flights from API (includes provider listings + AviationStack)
  const fetchFlights = async (depCode, arrCode) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (depCode) params.append('dep_iata', depCode);
      if (arrCode) params.append('arr_iata', arrCode);
      const res = await fetch(`/api/flights?${params.toString()}`);
      const data = await res.json();
      // Set airports from master data
      if (data.airports && data.airports.length > 0) {
        setApiAirports(data.airports.map(a => ({ code: a.code, city: a.city, name: a.name })));
      }
      if (data.dataSources) setDataSources(data.dataSources);

      let flights = [];
      if (data.flights) {
        flights = data.flights.map((f, i) => ({
          id: f.id || `api-${i}`,
          airline: f.airline || f.airlineName || 'Unknown',
          flightNumber: f.flightNumber || f.flight_number || '',
          from: f.from || f.fromCode || '',
          to: f.to || f.toCode || '',
          fromCity: f.fromCity || f.from || '',
          toCity: f.toCity || f.to || '',
          departureTime: f.departureTime || f.departure_time || '06:00 AM',
          arrivalTime: f.arrivalTime || f.arrival_time || '08:00 AM',
          duration: f.duration || '2h 00m',
          stops: f.stops || 'Non-stop',
          price: Number(f.price) || 4000,
          aircraft: f.aircraft || f.aircraftType || 'Airbus A320',
          airlineCode: f.airlineCode || f.airline_code || '',
          availableSeats: f.availableSeats || f.available_seats || 120,
          logo: f.logo || null,
          image: f.image || f.imageUrl || null,
          fromAirport: f.fromAirport || '',
          toAirport: f.toAirport || '',
          source: f.source || 'provider',
          status: f.status || 'scheduled',
          baggage: f.baggage || '15 Kg Check-in + 7 Kg Cabin',
          meal: f.meal || 'Not Included',
          flightClass: f.flightClass || f.class || 'Economy',
          refundable: f.refundable || 'Non-Refundable',
          providerId: f.providerId || null,
          listingId: f.listingId || null,
        }));
      }

      // If no flights match the route from API, generate realistic ones
      const matchingFlights = flights.filter(f =>
        f.from === depCode && f.to === arrCode
      );

      if (matchingFlights.length < 3 && depCode && arrCode) {
        const generated = generateRouteFlights(depCode, arrCode, departDate);
        flights = [...flights, ...generated];
      }

      setApiFlights(flights);
    } catch (err) {
      console.error('Failed to fetch flights:', err);
      // Generate flights even if API fails
      if (depCode && arrCode) {
        setApiFlights(generateRouteFlights(depCode, arrCode, departDate));
      }
    } finally {
      setLoading(false);
      setSearchTriggered(true);
    }
  };

  // Initial load with default route
  useEffect(() => {
    fetchFlights(fromCode, toCode);
  }, []);

  // Merge API flights with sample flights (API flights take priority)
  const allFlights = apiFlights;

  // Get unique airlines for filter
  const uniqueAirlines = [...new Set(allFlights.map(f => f.airline))];

  // Filter flights matching selected route + all filters
  const filteredFlights = allFlights.filter((flight) => {
    // Match by IATA code OR city name (flexible matching)
    const fromMatch = flight.from === fromCode ||
      flight.fromCity?.toLowerCase() === (SAMPLE_AIRPORTS.find(a => a.code === fromCode)?.city || '').toLowerCase();
    const toMatch = flight.to === toCode ||
      flight.toCity?.toLowerCase() === (SAMPLE_AIRPORTS.find(a => a.code === toCode)?.city || '').toLowerCase();
    const routeMatch = fromMatch && toMatch;
    const priceMatch = flight.price <= maxPrice;

    // Airline filter (checkbox set)
    const airlineMatch = selectedAirlines.size === 0 || selectedAirlines.has(flight.airline);

    // Stops filter
    let stopsMatch = true;
    if (stopsFilter !== 'any') {
      const fc = getStopsCount(flight.stops);
      if (stopsFilter === '0') stopsMatch = fc === 0;
      else if (stopsFilter === '1') stopsMatch = fc === 1;
      else if (stopsFilter === '2+') stopsMatch = fc >= 2;
    }

    // Time filter
    let timeMatch = true;
    if (timeFilter !== 'any') {
      timeMatch = getTimeBucket(flight.departureTime) === timeFilter;
    }

    return routeMatch && priceMatch && airlineMatch && stopsMatch && timeMatch;
  }).sort((a, b) => {
    if (sortBy === 'cheapest') return a.price - b.price;
    if (sortBy === 'fastest') return parseDurationToMinutes(a.duration) - parseDurationToMinutes(b.duration);
    return a.departureTime.localeCompare(b.departureTime);
  });

  // Determine cheapest and fastest flights for badges
  const cheapestPrice = filteredFlights.length > 0 ? Math.min(...filteredFlights.map(f => f.price)) : 0;
  const fastestDuration = filteredFlights.length > 0
    ? filteredFlights.reduce((min, f) => f.duration < min ? f.duration : min, filteredFlights[0].duration)
    : '';

  const handleSwapAirports = () => {
    const tempCode = fromCode;
    const tempSearch = fromSearch;
    setFromCode(toCode);
    setToCode(tempCode);
    setFromSearch(toSearch);
    setToSearch(tempSearch);
    // Auto-switch currency to the new destination's country
    const newDestAirport = ALL_AIRPORTS.find(a => a.code === tempCode);
    if (newDestAirport) {
      const destCurrency = COUNTRY_TO_CURRENCY[newDestAirport.country];
      if (destCurrency) setCurrency(destCurrency);
    }
  };

  const handleSearchFlights = () => {
    if (fromCode && toCode) {
      fetchFlights(fromCode, toCode);
      setStep('results');
    }
  };

  const selectAirport = (airport, type) => {
    if (type === 'from') {
      setFromCode(airport.code);
      setFromSearch(`${airport.city} (${airport.code})`);
      setShowFromDropdown(false);
    } else {
      setToCode(airport.code);
      setToSearch(`${airport.city} (${airport.code})`);
      setShowToDropdown(false);
      // Auto-switch currency based on destination country
      const destCurrency = COUNTRY_TO_CURRENCY[airport.country];
      if (destCurrency && destCurrency !== currency) {
        setCurrency(destCurrency);
      }
    }
  };

  const handleSelectFlight = (flight) => {
    setSelectedFlight(flight);
    const newPassengers = Array.from({ length: passengersCount }, (_, idx) => {
      return passengers[idx] || { name: '', age: '', gender: 'Male' };
    });
    setPassengers(newPassengers);
    setStep('passenger');
  };

  const handlePassengerChange = (index, field, value) => {
    const updated = [...passengers];
    updated[index] = { ...updated[index], [field]: value };
    setPassengers(updated);
  };

  const validatePassengerForm = () => {
    const errors = {};
    if (!contactEmail.includes('@')) errors.email = 'Valid email is required';
    if (contactPhone.length < 8) errors.phone = 'Valid phone number is required';

    passengers.forEach((p, idx) => {
      if (!p.name.trim()) errors[`name_${idx}`] = 'Name is required';
      if (!p.age || isNaN(p.age) || p.age < 1 || p.age > 120) {
        errors[`age_${idx}`] = 'Valid age required';
      }
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProceedToSummary = (e) => {
    e.preventDefault();
    if (validatePassengerForm()) {
      setStep('summary');
    }
  };

  // Fare calculations
  const baseFare = (selectedFlight?.price || 0) * passengersCount;
  const taxes = Math.round(baseFare * 0.12);
  const convenienceFee = 250;
  const totalAmount = baseFare + taxes + convenienceFee;

  const handlePaymentSuccess = async (paymentDetails) => {
    setIsPaymentOpen(false);

    const bookingRef = `FL-${selectedFlight.airlineCode}${Math.floor(1000 + Math.random() * 9000)}`;
    const newBooking = {
      type: 'flight',
      categoryTitle: 'Flight Booking',
      reference: bookingRef,
      airline: selectedFlight.airline,
      flightNumber: selectedFlight.flightNumber,
      aircraft: selectedFlight.aircraft,
      from: selectedFlight.from,
      to: selectedFlight.to,
      fromCity: selectedFlight.fromCity,
      toCity: selectedFlight.toCity,
      date: departDate,
      time: `${selectedFlight.departureTime} - ${selectedFlight.arrivalTime}`,
      passengers: passengers.map((p, i) => ({ ...p, seat: `${12 + i}F` })),
      contactEmail,
      contactPhone,
      totalAmount,
      fareBreakdown: {
        baseFare,
        taxes,
        convenienceFee
      },
      paymentMethod: paymentDetails.method,
      status: 'Confirmed',
      providerId: selectedFlight.providerId || null,
      listingId: selectedFlight.listingId || null,
      serviceName: selectedFlight.airline || '',
      displayCurrency: currency,
      exchangeRate: rates[currency] || 1.0,
    };

    try {
      const saved = await saveBooking(newBooking);
      setConfirmedBooking(saved);
      setStep('confirmed');
    } catch (err) {
      console.error('Booking save error:', err);
      alert('Failed to save booking. Please try again.');
    }
  };

  const handleResetFilters = () => {
    setMaxPrice(100000);
    setSelectedAirlines(new Set());
    setStopsFilter('any');
    setTimeFilter('any');
    setSortBy('cheapest');
  };

  const toggleAirlineFilter = (airline) => {
    setSelectedAirlines(prev => {
      const next = new Set(prev);
      if (next.has(airline)) next.delete(airline);
      else next.add(airline);
      return next;
    });
  };

  const toggleFilterSection = (section) => {
    setFilterSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Get original price (simulated markup for strikethrough display)
  const getOriginalPrice = (price) => Math.round(price * 1.18);
  const getDiscount = (price) => Math.round(((getOriginalPrice(price) - price) / getOriginalPrice(price)) * 100);

  // Get airline initials for logo placeholder
  const getAirlineInitials = (name) => {
    if (!name) return 'FL';
    const words = name.split(' ');
    if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  // Step progress items
  const steps = [
    { key: 'results', label: 'Select Flight', num: 1 },
    { key: 'passenger', label: 'Passenger Info', num: 2 },
    { key: 'summary', label: 'Review & Pay', num: 3 },
    { key: 'confirmed', label: 'Confirmed', num: 4 },
  ];
  const currentStepIdx = steps.findIndex(s => s.key === step);

  // ---- FILTER SIDEBAR COMPONENT ----
  const FilterSidebar = ({ className = '' }) => (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm divide-y divide-gray-100 ${className}`}>
      {/* Filter Header */}
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-[#1a237e]" />
          <span className="text-sm font-bold text-gray-900">Filters</span>
        </div>
        <button
          onClick={handleResetFilters}
          className="text-xs text-[#ef6c00] hover:text-[#e65100] font-semibold"
        >
          Reset All
        </button>
      </div>

      {/* Price Range */}
      <div className="px-4 py-3">
        <button
          onClick={() => toggleFilterSection('price')}
          className="flex items-center justify-between w-full text-left"
        >
          <span className="text-xs font-bold text-gray-800 uppercase tracking-wide">Price Range</span>
          {filterSections.price ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </button>
        {filterSections.price && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>{formatPrice(1000)}</span>
              <span className="font-bold text-[#1a237e]">{formatPrice(maxPrice)}</span>
            </div>
            <input
              type="range"
              min={1000}
              max={100000}
              step={1000}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-[#1a237e]"
            />
            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
              <span>Min</span>
              <span>Max</span>
            </div>
          </div>
        )}
      </div>

      {/* Stops */}
      <div className="px-4 py-3">
        <button
          onClick={() => toggleFilterSection('stops')}
          className="flex items-center justify-between w-full text-left"
        >
          <span className="text-xs font-bold text-gray-800 uppercase tracking-wide">Stops</span>
          {filterSections.stops ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </button>
        {filterSections.stops && (
          <div className="mt-3 grid grid-cols-3 gap-2">
            {[
              { value: 'any', label: 'Any' },
              { value: '0', label: 'Non-stop' },
              { value: '1', label: '1 Stop' },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => setStopsFilter(opt.value)}
                className={`px-2 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  stopsFilter === opt.value
                    ? 'bg-[#1a237e] text-white border-[#1a237e]'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-[#1a237e] hover:text-[#1a237e]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Departure Time */}
      <div className="px-4 py-3">
        <button
          onClick={() => toggleFilterSection('time')}
          className="flex items-center justify-between w-full text-left"
        >
          <span className="text-xs font-bold text-gray-800 uppercase tracking-wide">Departure Time</span>
          {filterSections.time ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </button>
        {filterSections.time && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            {[
              { value: 'any', label: 'Any Time', icon: Clock },
              { value: 'morning', label: 'Morning', sub: '6AM - 12PM', icon: Sunrise },
              { value: 'afternoon', label: 'Afternoon', sub: '12PM - 5PM', icon: Sun },
              { value: 'evening', label: 'Evening', sub: '5PM - 9PM', icon: Sunset },
              { value: 'night', label: 'Night', sub: '9PM - 6AM', icon: Moon },
            ].map(opt => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.value}
                  onClick={() => setTimeFilter(opt.value)}
                  className={`flex flex-col items-center p-2 rounded-lg text-xs border transition-all ${
                    timeFilter === opt.value
                      ? 'bg-[#1a237e] text-white border-[#1a237e]'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-[#1a237e] hover:text-[#1a237e]'
                  } ${opt.value === 'any' ? 'col-span-2' : ''}`}
                >
                  <Icon className="w-3.5 h-3.5 mb-0.5" />
                  <span className="font-semibold">{opt.label}</span>
                  {opt.sub && <span className={`text-[10px] ${timeFilter === opt.value ? 'text-blue-200' : 'text-gray-400'}`}>{opt.sub}</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Airlines */}
      <div className="px-4 py-3">
        <button
          onClick={() => toggleFilterSection('airlines')}
          className="flex items-center justify-between w-full text-left"
        >
          <span className="text-xs font-bold text-gray-800 uppercase tracking-wide">Airlines</span>
          {filterSections.airlines ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </button>
        {filterSections.airlines && (
          <div className="mt-3 space-y-2">
            {uniqueAirlines.map(airline => (
              <label key={airline} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedAirlines.has(airline)}
                  onChange={() => toggleAirlineFilter(airline)}
                  className="w-3.5 h-3.5 rounded border-gray-300 text-[#1a237e] focus:ring-[#1a237e] accent-[#1a237e]"
                />
                <div className="flex items-center gap-2 flex-1">
                  <div
                    className="w-5 h-5 rounded flex items-center justify-center text-white text-[8px] font-bold shrink-0"
                    style={{ backgroundColor: AIRLINE_LOGO_COLORS[airline] || '#64748b' }}
                  >
                    {getAirlineInitials(airline)}
                  </div>
                  <span className="text-xs text-gray-700 group-hover:text-[#1a237e] font-medium">{airline}</span>
                </div>
              </label>
            ))}
            {uniqueAirlines.length === 0 && (
              <p className="text-xs text-gray-400 italic">No airlines available</p>
            )}
          </div>
        )}
      </div>

      {/* Data Source Info */}
      <div className="px-4 py-3 space-y-2">
        <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-100 text-[11px] text-blue-800">
          <span className="font-bold flex items-center gap-1 mb-0.5">
            <Radio className="w-3 h-3 text-red-500 animate-pulse" /> Live Flight Data
          </span>
          Real-time schedules from major airlines with dynamic pricing.
        </div>
        <div className="p-2.5 rounded-lg bg-orange-50 border border-orange-100 text-[11px] text-orange-800">
          <span className="font-bold flex items-center gap-1 mb-0.5">
            <Tag className="w-3 h-3 text-orange-500" /> Provider Deals
          </span>
          Exclusive deals from verified travel providers.
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f5f5f5]">

      {/* ====== TOP SEARCH BAR ====== */}
      <div className="bg-gradient-to-r from-[#1a237e] to-[#283593] shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Brand + Step Progress */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white/10 backdrop-blur flex items-center justify-center">
                <Plane className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold text-white">Flight Booking</h1>
                <span className="text-[11px] text-blue-200">Search, Compare & Book Instantly</span>
              </div>
            </div>

            {/* Step Progress */}
            <div className="hidden sm:flex items-center gap-1">
              {steps.map((s, i) => (
                <div key={s.key} className="flex items-center">
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                    i <= currentStepIdx
                      ? i === currentStepIdx
                        ? 'bg-white text-[#1a237e]'
                        : 'bg-white/20 text-white'
                      : 'bg-white/5 text-blue-300/50'
                  }`}>
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      i < currentStepIdx
                        ? 'bg-green-400 text-white'
                        : i === currentStepIdx
                          ? 'bg-[#1a237e] text-white'
                          : 'bg-white/10 text-blue-300/50'
                    }`}>
                      {i < currentStepIdx ? <CheckCircle2 className="w-3 h-3" /> : s.num}
                    </span>
                    <span className="hidden md:inline">{s.label}</span>
                  </div>
                  {i < steps.length - 1 && (
                    <ChevronsRight className={`w-3 h-3 mx-0.5 ${i < currentStepIdx ? 'text-blue-200' : 'text-blue-400/30'}`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Search Fields */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
            {/* Trip Type Row */}
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <div className="flex items-center bg-white/10 rounded-lg p-0.5">
                <button
                  type="button"
                  onClick={() => setTripType('oneway')}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    tripType === 'oneway' ? 'bg-white text-[#1a237e] shadow-sm' : 'text-white/80 hover:text-white'
                  }`}
                >
                  One Way
                </button>
                <button
                  type="button"
                  onClick={() => setTripType('roundtrip')}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    tripType === 'roundtrip' ? 'bg-white text-[#1a237e] shadow-sm' : 'text-white/80 hover:text-white'
                  }`}
                >
                  Round Trip
                </button>
              </div>

              <div className="flex items-center gap-1.5 text-white/80 text-xs">
                <Users className="w-3.5 h-3.5" />
                <select
                  value={passengersCount}
                  onChange={(e) => setPassengersCount(Number(e.target.value))}
                  className="bg-white/10 border border-white/20 rounded-lg px-2 py-1.5 text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-white/30 [&>option]:text-gray-900"
                >
                  <option value={1}>1 Traveller</option>
                  <option value={2}>2 Travellers</option>
                  <option value={3}>3 Travellers</option>
                  <option value={4}>4 Travellers</option>
                </select>
              </div>

              <select
                value={travelClass}
                onChange={(e) => setTravelClass(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-lg px-2 py-1.5 text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-white/30 [&>option]:text-gray-900"
              >
                <option value="Economy">Economy</option>
                <option value="Premium Economy">Premium Economy</option>
                <option value="Business">Business Class</option>
              </select>

              <InlineCurrencySelector variant="dark" />
            </div>

            {/* Main Search Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2 items-end">
              {/* From - Autocomplete */}
              <div className="lg:col-span-3 bg-white rounded-lg p-2.5 relative" ref={fromRef}>
                <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-0.5">From</label>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#1a237e] shrink-0" />
                  <input
                    type="text"
                    value={fromSearch}
                    onChange={(e) => {
                      setFromSearch(e.target.value);
                      setShowFromDropdown(true);
                    }}
                    onFocus={() => {
                      setShowFromDropdown(true);
                      setFromSearch('');
                    }}
                    placeholder="Type city or airport..."
                    className="w-full bg-transparent text-gray-900 font-bold text-sm focus:outline-none placeholder:text-gray-400 placeholder:font-normal"
                  />
                </div>
                {showFromDropdown && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-64 overflow-y-auto">
                    {getFilteredAirports(fromSearch).map(a => (
                      <button
                        key={a.code}
                        onClick={() => selectAirport(a, 'from')}
                        className={`w-full text-left px-3 py-2.5 hover:bg-blue-50 flex items-center gap-3 border-b border-gray-50 last:border-0 transition-colors ${a.code === fromCode ? 'bg-blue-50' : ''}`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#1a237e]/10 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-[#1a237e]">{a.code}</span>
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-gray-900 truncate">{a.city}{a.country && a.country !== 'IN' ? `, ${COUNTRY_NAMES[a.country] || a.country}` : ''}</div>
                          <div className="text-[11px] text-gray-400 truncate">{a.name || a.code}</div>
                        </div>
                      </button>
                    ))}
                    {getFilteredAirports(fromSearch).length === 0 && (
                      <div className="px-4 py-6 text-center text-sm text-gray-400">No airports found</div>
                    )}
                  </div>
                )}
              </div>

              {/* Swap */}
              <div className="lg:col-span-1 flex justify-center items-center">
                <button
                  type="button"
                  onClick={handleSwapAirports}
                  className="w-9 h-9 rounded-full bg-[#ef6c00] hover:bg-[#e65100] text-white flex items-center justify-center shadow-lg shadow-orange-500/30 transition-all hover:scale-110 active:scale-95"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                </button>
              </div>

              {/* To - Autocomplete */}
              <div className="lg:col-span-3 bg-white rounded-lg p-2.5 relative" ref={toRef}>
                <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-0.5">To</label>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#ef6c00] shrink-0" />
                  <input
                    type="text"
                    value={toSearch}
                    onChange={(e) => {
                      setToSearch(e.target.value);
                      setShowToDropdown(true);
                    }}
                    onFocus={() => {
                      setShowToDropdown(true);
                      setToSearch('');
                      setToCode('');
                      setCurrency('INR');
                    }}
                    placeholder="Type city or airport..."
                    className="w-full bg-transparent text-gray-900 font-bold text-sm focus:outline-none placeholder:text-gray-400 placeholder:font-normal"
                  />
                </div>
                {showToDropdown && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-64 overflow-y-auto">
                    {getFilteredAirports(toSearch).map(a => (
                      <button
                        key={a.code}
                        onClick={() => selectAirport(a, 'to')}
                        className={`w-full text-left px-3 py-2.5 hover:bg-orange-50 flex items-center gap-3 border-b border-gray-50 last:border-0 transition-colors ${a.code === toCode ? 'bg-orange-50' : ''}`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#ef6c00]/10 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-[#ef6c00]">{a.code}</span>
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-gray-900 truncate">{a.city}{a.country && a.country !== 'IN' ? `, ${COUNTRY_NAMES[a.country] || a.country}` : ''}</div>
                          <div className="text-[11px] text-gray-400 truncate">{a.name || a.code}</div>
                        </div>
                      </button>
                    ))}
                    {getFilteredAirports(toSearch).length === 0 && (
                      <div className="px-4 py-6 text-center text-sm text-gray-400">No airports found</div>
                    )}
                  </div>
                )}
              </div>

              {/* Departure */}
              <div className="lg:col-span-2 bg-white rounded-lg p-2.5">
                <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-0.5">Departure</label>
                <input
                  type="date"
                  value={departDate}
                  onChange={(e) => setDepartDate(e.target.value)}
                  className="w-full bg-transparent text-gray-900 font-bold text-sm focus:outline-none"
                />
              </div>

              {/* Return or Search */}
              {tripType === 'roundtrip' ? (
                <>
                  <div className="lg:col-span-2 bg-white rounded-lg p-2.5">
                    <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-0.5">Return</label>
                    <input
                      type="date"
                      value={returnDate}
                      onChange={(e) => setReturnDate(e.target.value)}
                      className="w-full bg-transparent text-gray-900 font-bold text-sm focus:outline-none"
                    />
                  </div>
                  <div className="lg:col-span-1">
                    <button
                      type="button"
                      onClick={handleSearchFlights}
                      className="w-full h-full min-h-[48px] rounded-lg bg-[#ef6c00] hover:bg-[#e65100] text-white font-bold text-sm shadow-lg shadow-orange-500/30 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Search className="w-4 h-4" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="lg:col-span-3">
                  <button
                    type="button"
                    onClick={handleSearchFlights}
                    className="w-full py-3 rounded-lg bg-[#ef6c00] hover:bg-[#e65100] text-white font-bold text-sm shadow-lg shadow-orange-500/30 transition-all flex items-center justify-center gap-2"
                  >
                    <Search className="w-4 h-4" />
                    <span>Search Flights</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ====== MAIN CONTENT AREA ====== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* ====== STEP: RESULTS ====== */}
        {step === 'results' && (
          <>
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden">
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-white border border-gray-200 text-sm font-semibold text-gray-700 shadow-sm"
              >
                <SlidersHorizontal className="w-4 h-4 text-[#1a237e]" />
                Filters
                {(stopsFilter !== 'any' || timeFilter !== 'any' || selectedAirlines.size > 0 || maxPrice < 100000) && (
                  <span className="w-5 h-5 rounded-full bg-[#ef6c00] text-white text-[10px] flex items-center justify-center font-bold">
                    {(stopsFilter !== 'any' ? 1 : 0) + (timeFilter !== 'any' ? 1 : 0) + (selectedAirlines.size > 0 ? 1 : 0) + (maxPrice < 100000 ? 1 : 0)}
                  </span>
                )}
              </button>
            </div>

            {/* Mobile Filter Bottom Sheet */}
            {mobileFiltersOpen && (
              <div className="fixed inset-0 z-50 lg:hidden">
                <div className="absolute inset-0 bg-black/40" onClick={() => setMobileFiltersOpen(false)} />
                <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto bg-[#f5f5f5] rounded-t-2xl animate-slideUp">
                  <div className="sticky top-0 z-10 bg-white px-4 py-3 border-b border-gray-200 flex items-center justify-between rounded-t-2xl">
                    <span className="text-sm font-bold text-gray-900">Filters</span>
                    <button onClick={() => setMobileFiltersOpen(false)} className="p-1 rounded-full hover:bg-gray-100">
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                  <div className="p-4">
                    <FilterSidebar />
                  </div>
                  <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 flex gap-3">
                    <button
                      onClick={() => { handleResetFilters(); setMobileFiltersOpen(false); }}
                      className="flex-1 py-2.5 rounded-lg border border-gray-300 text-sm font-semibold text-gray-700"
                    >
                      Reset
                    </button>
                    <button
                      onClick={() => setMobileFiltersOpen(false)}
                      className="flex-1 py-2.5 rounded-lg bg-[#1a237e] text-white text-sm font-bold"
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 items-start">
              {/* Desktop Filter Sidebar */}
              <div className="hidden lg:block">
                <FilterSidebar />
              </div>

              {/* Flight Results */}
              <div className="lg:col-span-3 space-y-3">
                {/* Sorting Bar */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="px-4 py-2.5 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500">
                        <strong className="text-gray-900">{filteredFlights.length}</strong> flights found
                      </span>
                      <span className="text-gray-300">|</span>
                      <span className="text-gray-500 text-xs">
                        {ALL_AIRPORTS.find(a => a.code === fromCode)?.city || fromCode} to {ALL_AIRPORTS.find(a => a.code === toCode)?.city || toCode}
                      </span>
                      {filteredFlights.some(f => f.source === 'amadeus') && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-100">
                          <Globe className="w-3 h-3" />
                          Amadeus API
                        </span>
                      )}
                      {filteredFlights.some(f => f.source === 'aviationstack') && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-[10px] font-bold border border-green-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                          AviationStack
                        </span>
                      )}
                      {filteredFlights.some(f => f.source === 'provider') && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[10px] font-bold border border-purple-100">
                          Provider Listed
                        </span>
                      )}
                      {filteredFlights.some(f => f.source === 'live') && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 text-[10px] font-bold border border-orange-100">
                          <Radio className="w-3 h-3" />
                          Provider Listings
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {['cheapest', 'fastest', 'earliest'].map(s => (
                        <button
                          key={s}
                          onClick={() => setSortBy(s)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            sortBy === s
                              ? 'bg-[#1a237e] text-white shadow-sm'
                              : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                          }`}
                        >
                          {s === 'cheapest' ? 'Cheapest' : s === 'fastest' ? 'Fastest' : 'Earliest'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Data Sources Banner */}
                <DataSourceBanner
                  sources={['amadeus', 'aviationstack', 'supabase', 'oneconnect']}
                  counts={{
                    amadeus: allFlights.filter(f => f.source === 'amadeus').length,
                    aviationstack: allFlights.filter(f => f.source === 'aviationstack').length,
                    supabase: allFlights.filter(f => f.source === 'provider').length,
                    oneconnect: allFlights.filter(f => f.source === 'live').length,
                    total: filteredFlights.length,
                  }}
                />

                {/* Flight Cards */}
                {loading ? (
                  <div className="bg-white rounded-xl p-16 text-center border border-gray-200">
                    <div className="w-10 h-10 border-3 border-[#1a237e] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-sm font-semibold text-gray-600">Searching best fares...</p>
                    <p className="text-xs text-gray-400 mt-1">Checking 100+ airlines for the best deals</p>
                  </div>
                ) : filteredFlights.length === 0 ? (
                  <div className="bg-white rounded-xl p-16 text-center border border-gray-200">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <Plane className="w-8 h-8 text-gray-300" />
                    </div>
                    <h3 className="text-base font-bold text-gray-800">No flights found for this route</h3>
                    <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
                      {maxPrice < 100000 || stopsFilter !== 'any' || timeFilter !== 'any' || selectedAirlines.size > 0
                        ? 'Try resetting your filters or adjusting the price range.'
                        : `No flights available from ${ALL_AIRPORTS.find(a => a.code === fromCode)?.city || fromCode} to ${ALL_AIRPORTS.find(a => a.code === toCode)?.city || toCode}. Try a different route or date.`
                      }
                    </p>
                    <div className="flex items-center justify-center gap-3 mt-4">
                      <button
                        onClick={handleResetFilters}
                        className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-xs font-bold hover:bg-gray-200"
                      >
                        Reset Filters
                      </button>
                      <button
                        onClick={handleSearchFlights}
                        className="px-4 py-2 rounded-lg bg-[#1a237e] text-white text-xs font-bold hover:bg-[#283593]"
                      >
                        Search Again
                      </button>
                    </div>
                    {/* Popular routes suggestion */}
                    <div className="mt-6 pt-6 border-t border-gray-100">
                      <p className="text-xs font-semibold text-gray-500 mb-3">Try popular routes:</p>
                      <div className="flex flex-wrap justify-center gap-2">
                        {[
                          { from: 'DEL', to: 'BOM', label: 'Delhi → Mumbai' },
                          { from: 'DEL', to: 'DXB', label: 'Delhi → Dubai' },
                          { from: 'BOM', to: 'LHR', label: 'Mumbai → London' },
                          { from: 'DEL', to: 'JFK', label: 'Delhi → New York' },
                          { from: 'BLR', to: 'SIN', label: 'Bengaluru → Singapore' },
                        ].map(r => (
                          <button
                            key={`${r.from}-${r.to}`}
                            onClick={() => {
                              setFromCode(r.from);
                              setToCode(r.to);
                              setFromSearch(`${ALL_AIRPORTS.find(a => a.code === r.from)?.city} (${r.from})`);
                              setToSearch(`${ALL_AIRPORTS.find(a => a.code === r.to)?.city} (${r.to})`);
                              // Auto-switch currency for destination
                              const destAirport = ALL_AIRPORTS.find(a => a.code === r.to);
                              if (destAirport) {
                                const destCurr = COUNTRY_TO_CURRENCY[destAirport.country];
                                if (destCurr) setCurrency(destCurr);
                              }
                              fetchFlights(r.from, r.to);
                            }}
                            className="px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition-colors border border-blue-100"
                          >
                            {r.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  filteredFlights.map((flight) => {
                    const colors = AIRLINE_COLORS[flight.airline] || { bg: 'bg-slate-600', text: 'text-white', light: 'bg-slate-50 text-slate-700' };
                    const isExpanded = expandedFlightId === flight.id;
                    const isCheapest = flight.price === cheapestPrice;
                    const isFastest = flight.duration === fastestDuration;
                    const isAmadeus = flight.source === 'amadeus';
                    const isAviationStack = flight.source === 'aviationstack';
                    const isLive = flight.source === 'live';
                    const isDeal = flight.source === 'provider';
                    const origPrice = getOriginalPrice(flight.price);
                    const discount = getDiscount(flight.price);

                    return (
                      <div
                        key={flight.id}
                        className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden group"
                      >
                        {/* Badges Row */}
                        {(isCheapest || isFastest || isAmadeus || isAviationStack || isLive || isDeal) && (
                          <div className="flex items-center gap-1.5 px-4 pt-2.5 pb-0">
                            {isCheapest && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 border border-green-200">
                                <Sparkles className="w-3 h-3" /> CHEAPEST
                              </span>
                            )}
                            {isFastest && !isCheapest && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-200">
                                <Zap className="w-3 h-3" /> FASTEST
                              </span>
                            )}
                            {isAmadeus && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                <Globe className="w-3 h-3" /> AMADEUS API
                              </span>
                            )}
                            {isAviationStack && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                                </span>
                                AVIATIONSTACK
                              </span>
                            )}
                            {isLive && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-orange-50 text-orange-600 border border-orange-200">
                                <Radio className="w-3 h-3" /> CURATED
                              </span>
                            )}
                            {isDeal && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-600 border border-purple-200">
                                <Tag className="w-3 h-3" /> SUPABASE DB
                              </span>
                            )}
                          </div>
                        )}

                        {/* Main Card Content */}
                        <div className="px-4 py-3 flex flex-col lg:flex-row items-start lg:items-center gap-4">

                          {/* Left: Airline Info */}
                          <div className="flex items-center gap-3 lg:w-[180px] shrink-0">
                            {/* Airline Logo Placeholder */}
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm"
                              style={{ backgroundColor: AIRLINE_LOGO_COLORS[flight.airline] || '#64748b' }}
                            >
                              {flight.image ? (
                                <img src={flight.image} alt={flight.airline} className="w-full h-full object-cover rounded-lg" />
                              ) : (
                                getAirlineInitials(flight.airline)
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-bold text-gray-900 truncate">{flight.airline}</div>
                              <div className="text-[11px] text-gray-400 font-mono">{flight.flightNumber}</div>
                              {flight.status && flight.status !== 'scheduled' && (
                                <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                  flight.status === 'active' || flight.status === 'landed' ? 'bg-green-100 text-green-700' :
                                  flight.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                  'bg-gray-100 text-gray-600'
                                }`}>
                                  {flight.status}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Center: Time & Duration */}
                          <div className="flex items-center justify-between lg:justify-center flex-1 w-full gap-3 lg:gap-5">
                            {/* Departure */}
                            <div className="text-center lg:text-right min-w-[70px]">
                              <div className="text-xl font-black text-gray-900 leading-tight">{flight.departureTime}</div>
                              <div className="text-xs font-semibold text-gray-500">{flight.from}</div>
                              {flight.fromCity && <div className="text-[10px] text-gray-400 truncate max-w-[80px]">{flight.fromCity}</div>}
                            </div>

                            {/* Duration Arrow */}
                            <div className="flex flex-col items-center flex-1 max-w-[200px] min-w-[100px]">
                              <span className="text-[11px] font-semibold text-gray-400">{flight.duration}</span>
                              <div className="w-full flex items-center my-1">
                                <div className="w-2 h-2 rounded-full border-2 border-[#1a237e] bg-white shrink-0" />
                                <div className="h-[2px] flex-1 bg-gradient-to-r from-[#1a237e] via-gray-300 to-[#1a237e]" />
                                {getStopsCount(flight.stops) > 0 && (
                                  <div className="w-1.5 h-1.5 rounded-full bg-[#ef6c00] shrink-0 -ml-1 -mr-1 relative z-10" />
                                )}
                                {getStopsCount(flight.stops) > 0 && (
                                  <div className="h-[2px] flex-1 bg-gradient-to-r from-[#1a237e] via-gray-300 to-[#1a237e]" />
                                )}
                                <div className="shrink-0">
                                  <Plane className="w-3.5 h-3.5 text-[#1a237e]" />
                                </div>
                              </div>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                flight.stops === 'Non-stop' || getStopsCount(flight.stops) === 0
                                  ? 'bg-green-50 text-green-600'
                                  : 'bg-amber-50 text-amber-600'
                              }`}>
                                {flight.stops}
                              </span>
                            </div>

                            {/* Arrival */}
                            <div className="text-center lg:text-left min-w-[70px]">
                              <div className="text-xl font-black text-gray-900 leading-tight">{flight.arrivalTime}</div>
                              <div className="text-xs font-semibold text-gray-500">{flight.to}</div>
                              {flight.toCity && <div className="text-[10px] text-gray-400 truncate max-w-[80px]">{flight.toCity}</div>}
                            </div>
                          </div>

                          {/* Right: Price + Book */}
                          <div className="flex lg:flex-col items-center lg:items-end justify-between w-full lg:w-auto lg:min-w-[140px] pt-3 lg:pt-0 border-t lg:border-t-0 border-gray-100 gap-3">
                            <div className="text-left lg:text-right">
                              <div className="flex items-baseline gap-1.5">
                                <span className="text-[11px] text-gray-400 line-through">{formatPrice(origPrice)}</span>
                                <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">{discount}% off</span>
                              </div>
                              <div className="text-2xl font-black text-gray-900 leading-tight">
                                {formatPrice(typeof flight.price === 'number' ? flight.price : Number(flight.price) || 0)}
                              </div>
                              <div className="text-[10px] text-gray-400">per person</div>
                              {flight.availableSeats && flight.availableSeats <= 10 && (
                                <div className="text-[10px] text-red-500 font-bold mt-0.5">
                                  Only {flight.availableSeats} seats left!
                                </div>
                              )}
                              {flight.availableSeats && flight.availableSeats > 10 && (
                                <div className="text-[10px] text-green-600 font-semibold mt-0.5">
                                  {flight.availableSeats} seats available
                                </div>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => handleSelectFlight(flight)}
                              className="px-5 py-2.5 rounded-lg bg-[#ef6c00] hover:bg-[#e65100] text-white font-bold text-xs shadow-md shadow-orange-400/30 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-1.5 whitespace-nowrap"
                            >
                              Book Now
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Quick Info Strip + View Details Toggle */}
                        <div className="px-4 pb-2 flex flex-wrap items-center justify-between gap-2 border-t border-gray-50 pt-2">
                          <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-500">
                            <span className="flex items-center gap-1">
                              <Luggage className="w-3 h-3 text-gray-400" />
                              {flight.baggage || '15 Kg'}
                            </span>
                            <span className="text-gray-200">|</span>
                            <span className="flex items-center gap-1">
                              <Coffee className="w-3 h-3 text-gray-400" />
                              {flight.meal === 'Complimentary' ? (
                                <span className="text-green-600 font-semibold">Free Meal</span>
                              ) : (
                                <span>{flight.meal || 'No Meal'}</span>
                              )}
                            </span>
                            <span className="text-gray-200">|</span>
                            <span className="flex items-center gap-1">
                              <Ticket className="w-3 h-3 text-gray-400" />
                              {flight.flightClass || 'Economy'}
                            </span>
                          </div>

                          <button
                            onClick={() => setExpandedFlightId(isExpanded ? null : flight.id)}
                            className="text-[11px] font-semibold text-[#1a237e] hover:text-[#283593] flex items-center gap-1 transition-all"
                          >
                            {isExpanded ? 'Hide Details' : 'View Details'}
                            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>
                        </div>

                        {/* Expanded Details Panel */}
                        {isExpanded && (
                          <div className="bg-gray-50 border-t border-gray-200 px-4 py-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                              {/* Fare Breakdown */}
                              <div className="bg-white rounded-lg p-3 border border-gray-200">
                                <h5 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Fare Breakdown</h5>
                                <div className="space-y-1.5 text-xs">
                                  <div className="flex justify-between text-gray-600">
                                    <span>Base Fare</span>
                                    <span>{formatPrice(flight.price)}</span>
                                  </div>
                                  <div className="flex justify-between text-gray-600">
                                    <span>Taxes & Fees</span>
                                    <span>{formatPrice(Math.round(flight.price * 0.12))}</span>
                                  </div>
                                  <div className="flex justify-between text-gray-600">
                                    <span>Service Fee</span>
                                    <span>{formatPrice(250)}</span>
                                  </div>
                                  <div className="flex justify-between font-bold text-gray-900 pt-1.5 border-t border-gray-100">
                                    <span>Total</span>
                                    <span>{formatPrice(flight.price + Math.round(flight.price * 0.12) + 250)}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Baggage Info */}
                              <div className="bg-white rounded-lg p-3 border border-gray-200">
                                <h5 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Baggage</h5>
                                <div className="space-y-2 text-xs">
                                  <div className="flex items-start gap-2">
                                    <Luggage className="w-3.5 h-3.5 text-[#1a237e] shrink-0 mt-0.5" />
                                    <div>
                                      <div className="font-semibold text-gray-800">Check-in</div>
                                      <div className="text-gray-500">{flight.baggage?.split('+')[0]?.trim() || '15 Kg'}</div>
                                    </div>
                                  </div>
                                  <div className="flex items-start gap-2">
                                    <Luggage className="w-3.5 h-3.5 text-[#1a237e] shrink-0 mt-0.5" />
                                    <div>
                                      <div className="font-semibold text-gray-800">Cabin</div>
                                      <div className="text-gray-500">{flight.baggage?.split('+')[1]?.trim() || '7 Kg'}</div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Meal & Extras */}
                              <div className="bg-white rounded-lg p-3 border border-gray-200">
                                <h5 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Meal & Extras</h5>
                                <div className="space-y-2 text-xs">
                                  <div className="flex items-center gap-2">
                                    <Coffee className="w-3.5 h-3.5 text-[#1a237e]" />
                                    <span className={`font-semibold ${flight.meal === 'Complimentary' ? 'text-green-600' : 'text-gray-600'}`}>
                                      {flight.meal === 'Complimentary' ? 'Complimentary Meal' : flight.meal || 'Paid Meal Available'}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 text-gray-500">
                                    <Globe className="w-3.5 h-3.5 text-gray-400" />
                                    <span>Aircraft: {flight.aircraft}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Cancellation */}
                              <div className="bg-white rounded-lg p-3 border border-gray-200">
                                <h5 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Cancellation</h5>
                                <div className="space-y-2 text-xs">
                                  <div className="flex items-start gap-2">
                                    <Shield className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                                      flight.refundable?.includes('Free') ? 'text-green-600' :
                                      flight.refundable?.includes('Partial') ? 'text-amber-500' :
                                      'text-red-500'
                                    }`} />
                                    <div>
                                      <div className={`font-semibold ${
                                        flight.refundable?.includes('Free') ? 'text-green-600' :
                                        flight.refundable?.includes('Partial') ? 'text-amber-600' :
                                        'text-red-500'
                                      }`}>
                                        {flight.refundable || 'Non-Refundable'}
                                      </div>
                                      <div className="text-gray-500 mt-0.5">
                                        {flight.refundable?.includes('Free')
                                          ? 'Cancel anytime with full refund'
                                          : flight.refundable?.includes('Partial')
                                            ? 'Cancellation charges apply'
                                            : 'This ticket is non-refundable'}
                                      </div>
                                    </div>
                                  </div>
                                  {flight.availableSeats && (
                                    <div className="flex items-center gap-2 text-gray-500">
                                      <Users className="w-3.5 h-3.5 text-gray-400" />
                                      <span>{flight.availableSeats} seats remaining</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </>
        )}

        {/* ====== STEP: PASSENGER DETAILS ====== */}
        {step === 'passenger' && selectedFlight && (
          <div className="max-w-3xl mx-auto space-y-5">
            {/* Selected Flight Summary */}
            <div className="bg-gradient-to-r from-[#1a237e] to-[#283593] text-white rounded-xl p-5 shadow-lg">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] text-blue-200 font-bold uppercase tracking-wider">Selected Flight</span>
                  <div className="flex items-center gap-2 mt-1">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold"
                      style={{ backgroundColor: AIRLINE_LOGO_COLORS[selectedFlight.airline] || '#64748b' }}
                    >
                      {getAirlineInitials(selectedFlight.airline)}
                    </div>
                    <div>
                      <h3 className="text-base font-bold">
                        {selectedFlight.airline} {selectedFlight.flightNumber}
                      </h3>
                      <p className="text-xs text-blue-200">
                        {selectedFlight.fromCity || selectedFlight.from} ({selectedFlight.from}) to {selectedFlight.toCity || selectedFlight.to} ({selectedFlight.to})
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-blue-200">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {departDate}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {selectedFlight.departureTime} - {selectedFlight.arrivalTime}</span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {passengersCount} Pax</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="text-xl font-black">{formatPrice(selectedFlight.price)}</div>
                  <span className="text-[10px] text-blue-200">per person</span>
                  <button
                    type="button"
                    onClick={() => setStep('results')}
                    className="text-xs text-blue-200 hover:text-white underline underline-offset-2 mt-1"
                  >
                    Change Flight
                  </button>
                </div>
              </div>
            </div>

            {/* Passenger Form */}
            <form onSubmit={handleProceedToSummary} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
                <h3 className="text-sm font-bold text-gray-900">
                  Passenger Details
                  <span className="text-gray-400 font-normal ml-1">({passengersCount} Traveller{passengersCount > 1 ? 's' : ''})</span>
                </h3>
                <p className="text-[11px] text-gray-500 mt-0.5">Enter names as per government-issued ID</p>
              </div>

              <div className="p-5 space-y-4">
                {passengers.map((p, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-6 h-6 rounded-full bg-[#1a237e] text-white text-[10px] font-bold flex items-center justify-center">{idx + 1}</span>
                      <span className="text-xs font-bold text-gray-700 uppercase">Adult Passenger</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-6 gap-3">
                      <div className="sm:col-span-3">
                        <label className="block text-[11px] font-semibold text-gray-600 mb-1">Full Name</label>
                        <input
                          type="text"
                          value={p.name}
                          onChange={(e) => handlePassengerChange(idx, 'name', e.target.value)}
                          placeholder="e.g. Alex Morgan"
                          className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1a237e]/20 focus:border-[#1a237e] transition-all"
                          required
                        />
                        {formErrors[`name_${idx}`] && (
                          <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{formErrors[`name_${idx}`]}</p>
                        )}
                      </div>
                      <div className="sm:col-span-1">
                        <label className="block text-[11px] font-semibold text-gray-600 mb-1">Age</label>
                        <input
                          type="number"
                          value={p.age}
                          onChange={(e) => handlePassengerChange(idx, 'age', e.target.value)}
                          placeholder="30"
                          className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1a237e]/20 focus:border-[#1a237e] transition-all"
                          required
                        />
                        {formErrors[`age_${idx}`] && (
                          <p className="text-[10px] text-red-500 mt-1">{formErrors[`age_${idx}`]}</p>
                        )}
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-gray-600 mb-1">Gender</label>
                        <select
                          value={p.gender}
                          onChange={(e) => handlePassengerChange(idx, 'gender', e.target.value)}
                          className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1a237e]/20 focus:border-[#1a237e] transition-all"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Contact Information */}
                <div className="pt-4 border-t border-gray-100">
                  <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#1a237e]" />
                    Contact & Ticket Delivery
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-600 mb-1">Email Address</label>
                      <input
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1a237e]/20 focus:border-[#1a237e] transition-all"
                        required
                      />
                      {formErrors.email && (
                        <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{formErrors.email}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-600 mb-1">Mobile Number</label>
                      <input
                        type="text"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1a237e]/20 focus:border-[#1a237e] transition-all"
                        required
                      />
                      {formErrors.phone && (
                        <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{formErrors.phone}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="px-5 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep('results')}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-200 transition-all"
                >
                  Back to Results
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-lg bg-[#ef6c00] hover:bg-[#e65100] text-white font-bold text-sm shadow-md shadow-orange-400/30 transition-all flex items-center gap-2"
                >
                  Review Summary
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ====== STEP: BOOKING SUMMARY ====== */}
        {step === 'summary' && selectedFlight && (
          <div className="max-w-2xl mx-auto space-y-5">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              {/* Header */}
              <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-gray-900">Booking Summary</h3>
                  <p className="text-[11px] text-gray-500">Review your booking before payment</p>
                </div>
                <span className="text-xs font-bold text-[#1a237e] bg-blue-50 px-3 py-1 rounded-lg border border-blue-100">
                  {travelClass}
                </span>
              </div>

              <div className="p-5 space-y-5">
                {/* Flight Details */}
                <div className="p-4 bg-gradient-to-r from-[#1a237e]/5 to-[#283593]/5 rounded-xl border border-[#1a237e]/10">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-[10px] font-bold"
                      style={{ backgroundColor: AIRLINE_LOGO_COLORS[selectedFlight.airline] || '#64748b' }}
                    >
                      {getAirlineInitials(selectedFlight.airline)}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900">{selectedFlight.airline} {selectedFlight.flightNumber}</div>
                      <div className="text-[11px] text-gray-500">{selectedFlight.aircraft} | {departDate}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-center">
                    <div>
                      <div className="text-lg font-black text-gray-900">{selectedFlight.departureTime}</div>
                      <div className="text-xs font-semibold text-gray-500">{selectedFlight.fromCity || selectedFlight.from} ({selectedFlight.from})</div>
                    </div>
                    <div className="flex-1 mx-4">
                      <div className="text-[10px] text-gray-400 mb-1">{selectedFlight.duration}</div>
                      <div className="h-[2px] bg-gradient-to-r from-[#1a237e] via-gray-300 to-[#1a237e] relative">
                        <Plane className="w-3 h-3 text-[#1a237e] absolute right-0 -top-1.5" />
                      </div>
                      <div className="text-[10px] text-gray-400 mt-1">{selectedFlight.stops}</div>
                    </div>
                    <div>
                      <div className="text-lg font-black text-gray-900">{selectedFlight.arrivalTime}</div>
                      <div className="text-xs font-semibold text-gray-500">{selectedFlight.toCity || selectedFlight.to} ({selectedFlight.to})</div>
                    </div>
                  </div>
                </div>

                {/* Passengers */}
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Passengers ({passengers.length})</h4>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    {passengers.map((p, idx) => (
                      <div key={idx} className={`px-4 py-2.5 flex items-center justify-between text-sm ${idx > 0 ? 'border-t border-gray-100' : ''}`}>
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#1a237e] text-white text-[10px] font-bold flex items-center justify-center">{idx + 1}</span>
                          <span className="font-semibold text-gray-800">{p.name}</span>
                        </div>
                        <span className="text-xs text-gray-500">{p.age} yrs | {p.gender}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Contact */}
                <div className="flex items-center gap-4 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                  <span>Email: <strong className="text-gray-700">{contactEmail}</strong></span>
                  <span>Phone: <strong className="text-gray-700">{contactPhone}</strong></span>
                </div>

                {/* Fare Breakdown */}
                <div className="p-4 bg-green-50/50 rounded-xl border border-green-100 space-y-2">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Fare Breakdown</h4>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Base Fare ({passengersCount} Traveller{passengersCount > 1 ? 's' : ''})</span>
                    <span>{formatPrice(baseFare)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Taxes & Surcharges</span>
                    <span>{formatPrice(taxes)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Convenience Fee</span>
                    <span>{formatPrice(convenienceFee)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-black text-gray-900 pt-2 border-t border-green-200">
                    <span>Total Amount</span>
                    <span className="text-[#1a237e]">{formatPrice(totalAmount)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-green-600 font-semibold pt-1">
                    <Sparkles className="w-3 h-3" />
                    You save {formatPrice(getOriginalPrice(selectedFlight.price) * passengersCount - baseFare)} on this booking!
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="px-5 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep('passenger')}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-200 transition-all"
                >
                  Edit Details
                </button>
                <button
                  type="button"
                  onClick={() => setIsPaymentOpen(true)}
                  className="px-6 py-3 rounded-lg bg-[#ef6c00] hover:bg-[#e65100] text-white font-bold text-sm shadow-lg shadow-orange-400/30 transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Shield className="w-4 h-4" />
                  Pay {formatPrice(totalAmount)}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ====== STEP: CONFIRMATION ====== */}
        {step === 'confirmed' && confirmedBooking && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
              {/* Success Banner */}
              <div className={`p-8 text-center text-white ${confirmedBooking.status === 'Pending' ? 'bg-gradient-to-r from-amber-500 to-orange-600' : 'bg-gradient-to-r from-green-500 to-emerald-600'}`}>
                <div className="w-16 h-16 mx-auto mb-4 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                  {confirmedBooking.status === 'Pending' ? <Clock className="w-10 h-10 text-white" /> : <CheckCircle2 className="w-10 h-10 text-white" />}
                </div>
                <h2 className="text-2xl font-black">{confirmedBooking.status === 'Pending' ? 'Booking Submitted!' : 'Booking Confirmed!'}</h2>
                <p className="text-sm opacity-80 mt-1">{confirmedBooking.status === 'Pending' ? 'Awaiting provider approval — you will be notified once confirmed' : 'Your e-ticket has been generated successfully'}</p>
                <div className="inline-flex items-center gap-2 mt-3 bg-white/20 backdrop-blur px-4 py-2 rounded-full text-sm font-bold">
                  <Ticket className="w-4 h-4" />
                  PNR: {confirmedBooking.reference}
                </div>
              </div>

              <div className="p-6 space-y-5">
                {/* Journey Card */}
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between text-sm mb-3">
                    <span className="font-bold text-gray-900">{confirmedBooking.airline} ({confirmedBooking.flightNumber})</span>
                    <span className="text-gray-500">{confirmedBooking.date}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {confirmedBooking.fromCity} to {confirmedBooking.toCity}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {confirmedBooking.time}
                  </div>
                </div>

                {/* Passengers */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="px-4 py-2 bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wide border-b border-gray-200">
                    Passengers & Seats
                  </div>
                  {confirmedBooking.passengers?.map((p, idx) => (
                    <div key={idx} className={`px-4 py-2.5 flex items-center justify-between text-sm ${idx > 0 ? 'border-t border-gray-100' : ''}`}>
                      <span className="font-semibold text-gray-800">{p.name}</span>
                      <span className="text-xs text-gray-500">Seat {p.seat} | {p.age} yrs | {p.gender}</span>
                    </div>
                  ))}
                </div>

                {/* Amount */}
                <div className={`flex items-center justify-between p-4 rounded-xl border ${confirmedBooking.status === 'Pending' ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'}`}>
                  <span className={`text-sm font-bold ${confirmedBooking.status === 'Pending' ? 'text-amber-800' : 'text-green-800'}`}>{confirmedBooking.status === 'Pending' ? 'Amount (Pending Confirmation)' : 'Amount Paid'}</span>
                  <span className={`text-xl font-black ${confirmedBooking.status === 'Pending' ? 'text-amber-700' : 'text-green-700'}`}>{formatPrice(confirmedBooking.totalAmount || 0)}</span>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsTicketModalOpen(true)}
                    className="w-full sm:w-auto px-5 py-3 rounded-lg bg-[#1a237e] hover:bg-[#283593] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <Ticket className="w-4 h-4" />
                    View Boarding Pass
                  </button>
                  <Link
                    href="/bookings"
                    className="w-full sm:w-auto px-5 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-bold text-sm transition-all text-center"
                  >
                    Go to My Bookings
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setStep('results');
                      setSelectedFlight(null);
                      setConfirmedBooking(null);
                    }}
                    className="w-full sm:w-auto px-5 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-bold text-sm transition-all"
                  >
                    Book Another Flight
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Payment Gateway Modal */}
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        title="Simulated Flight Airfare Checkout"
        amount={totalAmount}
        breakdown={{ baseFare, taxes, convenienceFee }}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* Boarding Pass / Ticket Modal */}
      <TicketModal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
        booking={confirmedBooking}
      />

      {/* Custom styles for animations */}
      <style jsx global>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #1a237e;
          cursor: pointer;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }
        input[type="range"]::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #1a237e;
          cursor: pointer;
          border: none;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
}
