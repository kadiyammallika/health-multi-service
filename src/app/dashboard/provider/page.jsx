'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plane, Bus, Building2, Sparkles, MapPin, Plus, Pencil, Trash2,
  X, Save, ToggleLeft, ToggleRight, LogOut, Clock, IndianRupee,
  Eye, EyeOff, ChevronDown, ChevronUp, AlertCircle, CheckCircle2,
  Users, TrendingUp, Package, ImageIcon, Link2, Bell, ShoppingBag,
  Calendar, Phone, Mail, User, CheckCircle, XCircle, RefreshCw
} from 'lucide-react';
import { getCurrentUser, logoutUser, syncSessionFromBackend } from '@/services/storage';
import AuthGuard from '@/components/auth/AuthGuard';
import { useCurrency } from '@/components/ui/CurrencyProvider';

// Searchable Dropdown for Master Data with "Other" custom entry option
function MasterDropdown({ field, value, onChange, masterData, formData, customValues, onCustomChange }) {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const items = masterData[field.masterType] || [];
  const isOtherSelected = value === '__other__';
  const customKey = field.key.replace('_id', '_custom');

  const getDisplayLabel = (item) => {
    if (field.masterType === 'airlines') return `${item.airline_name} (${item.airline_code})`;
    if (field.masterType === 'airports') return `${item.city} – ${item.airport_name} (${item.airport_code})`;
    if (field.masterType === 'aircraft') return `${item.aircraft_name} (${item.aircraft_code})`;
    return item.id;
  };

  const getSelectedLabel = () => {
    if (!value) return '';
    if (value === '__other__') return 'Other (Custom)';
    const item = items.find(i => i.id === value);
    return item ? getDisplayLabel(item) : '';
  };

  const filtered = items.filter((item) => {
    if (!search) return true;
    const s = search.toLowerCase();
    if (field.masterType === 'airlines') return (item.airline_name || '').toLowerCase().includes(s) || (item.airline_code || '').toLowerCase().includes(s);
    if (field.masterType === 'airports') return (item.airport_name || '').toLowerCase().includes(s) || (item.airport_code || '').toLowerCase().includes(s) || (item.city || '').toLowerCase().includes(s);
    if (field.masterType === 'aircraft') return (item.aircraft_name || '').toLowerCase().includes(s) || (item.aircraft_code || '').toLowerCase().includes(s);
    return true;
  }).filter((item) => {
    // For arrival airport, filter out the selected departure airport
    if (field.key === 'arrival_airport_id' && formData?.departure_airport_id) {
      return item.id !== formData.departure_airport_id;
    }
    if (field.key === 'departure_airport_id' && formData?.arrival_airport_id) {
      return item.id !== formData.arrival_airport_id;
    }
    return true;
  });

  const otherLabel = field.masterType === 'airlines' ? 'Other Airline' : field.masterType === 'airports' ? 'Other Airport' : 'Other Aircraft';
  const customPlaceholder = field.masterType === 'airlines' ? 'Enter airline name (e.g. Emirates, Qatar Airways)' : field.masterType === 'airports' ? 'Enter airport name & code (e.g. Dubai - DXB)' : 'Enter aircraft type (e.g. Boeing 777)';

  return (
    <div className="relative">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3 py-2.5 rounded-lg border text-sm cursor-pointer flex items-center justify-between ${
          isOpen ? 'border-blue-400 ring-1 ring-blue-400' : 'border-gray-200'
        } ${value ? 'text-gray-900' : 'text-gray-400'} bg-white`}
      >
        <span className="truncate">{getSelectedLabel() || `Select ${field.label}`}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <input
              type="text"
              placeholder={`Search ${field.masterType}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="w-full px-2.5 py-2 rounded-md border border-gray-200 text-xs focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none"
              autoFocus
            />
          </div>
          <div className="overflow-y-auto max-h-44">
            {filtered.length === 0 && !search ? (
              <div className="px-3 py-4 text-center text-xs text-gray-400">No results found</div>
            ) : (
              <>
                {filtered.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => { onChange(item.id); setIsOpen(false); setSearch(''); }}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-blue-50 transition flex items-center justify-between ${
                      value === item.id ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700'
                    }`}
                  >
                    <span>{getDisplayLabel(item)}</span>
                    {value === item.id && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                  </button>
                ))}
                {/* Other (Custom) option - always shown at the bottom */}
                <div className="border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => { onChange('__other__'); setIsOpen(false); setSearch(''); }}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-orange-50 transition flex items-center gap-2 ${
                      isOtherSelected ? 'bg-orange-50 text-orange-700 font-semibold' : 'text-orange-600'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5 shrink-0" />
                    <span>{otherLabel} (Not in list)</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Custom text input shown when "Other" is selected */}
      {isOtherSelected && (
        <input
          type="text"
          value={customValues?.[customKey] || ''}
          onChange={(e) => onCustomChange(customKey, e.target.value)}
          placeholder={customPlaceholder}
          className="w-full mt-2 px-3 py-2.5 rounded-lg border border-orange-300 text-sm bg-orange-50 focus:border-orange-400 focus:ring-1 focus:ring-orange-400 outline-none placeholder-orange-300"
        />
      )}

      {/* Backdrop to close dropdown */}
      {isOpen && <div className="fixed inset-0 z-40" onClick={() => { setIsOpen(false); setSearch(''); }} />}
    </div>
  );
}

// Indian cities/bus stands for autocomplete
const INDIAN_CITIES = [
  'Bengaluru - Majestic Bus Stand', 'Bengaluru - Kempegowda Bus Station', 'Bengaluru - Silk Board', 'Bengaluru - Electronic City',
  'Bengaluru - Marathahalli', 'Bengaluru - Madiwala', 'Bengaluru - Satellite Bus Stand', 'Bengaluru - Hebbal',
  'Delhi - ISBT Kashmere Gate', 'Delhi - Anand Vihar ISBT', 'Delhi - Sarai Kale Khan ISBT', 'Delhi - Majnu Ka Tilla',
  'Mumbai - Borivali', 'Mumbai - Dadar', 'Mumbai - Thane', 'Mumbai - Andheri', 'Mumbai - Vashi', 'Mumbai - Panvel',
  'Chennai - Koyambedu Bus Stand', 'Chennai - CMBT', 'Chennai - Guindy', 'Chennai - Tambaram',
  'Hyderabad - MGBS', 'Hyderabad - JBS (Jubilee Bus Station)', 'Hyderabad - Uppal', 'Hyderabad - LB Nagar', 'Hyderabad - Ameerpet',
  'Pune - Pune Station', 'Pune - Swargate', 'Pune - Shivaji Nagar', 'Pune - Hinjewadi', 'Pune - Wakad',
  'Kolkata - Esplanade Bus Stand', 'Kolkata - Karunamoyee', 'Kolkata - Dakshineshwar', 'Kolkata - Howrah',
  'Ahmedabad - Paldi Bus Stand', 'Ahmedabad - Geeta Mandir', 'Ahmedabad - SG Highway',
  'Jaipur - Sindhi Camp Bus Stand', 'Jaipur - Narayan Singh Circle', 'Jaipur - Durgapura',
  'Lucknow - Alambagh Bus Stand', 'Lucknow - Charbagh', 'Lucknow - Kaiserbagh',
  'Chandigarh - ISBT Sector 43', 'Chandigarh - ISBT Sector 17',
  'Goa - Panjim Bus Stand', 'Goa - Margao Bus Stand', 'Goa - Mapusa Bus Stand', 'Goa - Vasco',
  'Indore - Sarwate Bus Stand', 'Indore - Gangwal Bus Stand',
  'Bhopal - ISBT Bhopal', 'Bhopal - Habibganj',
  'Nagpur - Ganeshpeth Bus Stand', 'Nagpur - MSRTC Stand',
  'Coimbatore - Gandhipuram Bus Stand', 'Coimbatore - Ukkadam Bus Stand',
  'Mysuru - Mysuru Bus Stand', 'Mysuru - Sub Urban Bus Stand',
  'Visakhapatnam - RTC Complex', 'Visakhapatnam - Gajuwaka',
  'Vijayawada - Pandit Nehru Bus Station', 'Vijayawada - NTR Bus Stand',
  'Kochi - Vyttila Hub', 'Kochi - Ernakulam KSRTC', 'Kochi - Aluva',
  'Thiruvananthapuram - KSRTC Bus Stand', 'Thiruvananthapuram - Thampanoor',
  'Mangaluru - KSRTC Bus Stand', 'Mangaluru - State Bank Bus Stand',
  'Hubli - Central Bus Stand', 'Dharwad - Bus Stand',
  'Shirdi - Shirdi Bus Stand', 'Tirupati - Tirupati Bus Stand',
  'Madurai - Periyar Bus Stand', 'Madurai - Mattuthavani',
  'Varanasi - Cantt Bus Stand', 'Varanasi - Lanka',
  'Patna - Mithapur Bus Stand', 'Patna - Gandhi Maidan',
  'Ranchi - Birsa Munda Bus Terminal', 'Bhubaneswar - Baramunda Bus Stand',
  'Guwahati - ISBT Guwahati', 'Guwahati - Paltan Bazaar',
  'Dehradun - ISBT Dehradun', 'Rishikesh - ISBT Rishikesh',
  'Shimla - ISBT Shimla', 'Manali - Manali Bus Stand',
  'Udaipur - UIT Circle Bus Stand', 'Jodhpur - RSTC Bus Stand',
  'Amritsar - ISBT Amritsar', 'Ludhiana - Bus Stand',
  'Agra - ISBT Agra', 'Kanpur - Jhakarkatti Bus Stand',
  'Nashik - Nashik CBS', 'Aurangabad - MSRTC Bus Stand',
  'Surat - Udhna Bus Port', 'Vadodara - Vadodara CBS',
  'Rajkot - GSRTC Bus Stand', 'Raipur - Pandri Bus Stand',
];

// City Autocomplete component (like ConfirmTkt / redBus city search)
function CityAutocomplete({ value, onChange, placeholder, label }) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [focused, setFocused] = useState(false);

  const filteredCities = query.trim()
    ? INDIAN_CITIES.filter(c => c.toLowerCase().includes(query.toLowerCase())).slice(0, 8)
    : INDIAN_CITIES.slice(0, 8);

  const handleSelect = (city) => {
    onChange(city);
    setQuery('');
    setIsOpen(false);
  };

  const displayValue = value || '';

  return (
    <div className="relative">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={isOpen ? query : displayValue}
          onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
          onFocus={() => { setIsOpen(true); setQuery(''); setFocused(true); }}
          onBlur={() => { setTimeout(() => { setIsOpen(false); setFocused(false); }, 200); }}
          placeholder={placeholder || `Search city or bus stand...`}
          className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none"
          autoComplete="off"
        />
        {value && !isOpen && (
          <button type="button" onClick={() => { onChange(''); setQuery(''); setIsOpen(true); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100">
            <X className="w-3.5 h-3.5 text-gray-400" />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-50 top-full mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-52 overflow-y-auto">
          {filteredCities.length === 0 ? (
            <div className="px-3 py-4 text-center">
              <p className="text-xs text-gray-500">No matching cities found</p>
              <button type="button" onClick={() => { handleSelect(query.trim()); }}
                className="mt-2 text-xs text-blue-600 hover:underline">
                Use &quot;{query.trim()}&quot; as custom entry
              </button>
            </div>
          ) : (
            filteredCities.map((city, i) => (
              <button key={city + i} type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(city)}
                className={`w-full text-left px-3 py-2.5 text-sm hover:bg-blue-50 transition flex items-center gap-2 ${
                  value === city ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                } ${i > 0 ? 'border-t border-gray-50' : ''}`}>
                <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span>{city}</span>
              </button>
            ))
          )}
        </div>
      )}

      {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />}
    </div>
  );
}

// Generate time slots every 15 minutes in 12-hour format
const TIME_SLOTS = (() => {
  const slots = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 15) {
      const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
      const period = h < 12 ? 'AM' : 'PM';
      const label = `${String(hour12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`;
      slots.push(label);
    }
  }
  return slots;
})();

// Auto-generate flight/bus number based on selection
// Airline codes: IndiGo=6E, Air India=AI, SpiceJet=SG, etc.
const OPERATOR_CODES = {
  'VRL Travels': 'VRL', 'SRS Travels': 'SRS', 'KSRTC': 'KSRTC', 'Orange Travels': 'OT',
  'Paulo Travels': 'PT', 'Neeta Travels': 'NT', 'RedBus Express': 'RBE', 'Kaveri Travels': 'KVR',
  'Sugama Travels': 'SGM', 'Durgamba Motors': 'DM', 'TSRTC': 'TSRTC', 'APSRTC': 'APSRTC',
  'MSRTC': 'MSRTC', 'GSRTC': 'GSRTC', 'RSRTC': 'RSRTC', 'UPSRTC': 'UPSRTC', 'HRTC': 'HRTC', 'PEPSU': 'PEPSU',
};

const STATE_CODES = ['KA', 'MH', 'TN', 'AP', 'TS', 'DL', 'UP', 'RJ', 'GJ', 'WB', 'KL', 'GA', 'HR', 'PB', 'MP', 'HP'];

function generateFlightNumber(airlineCode) {
  const num = Math.floor(1000 + Math.random() * 9000); // 4-digit random
  return `${airlineCode}-${num}`;
}

function generateBusNumber(operatorName) {
  const stateCode = STATE_CODES[Math.floor(Math.random() * STATE_CODES.length)];
  const district = String(Math.floor(1 + Math.random() * 50)).padStart(2, '0');
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const letterPair = letters[Math.floor(Math.random() * letters.length)] + letters[Math.floor(Math.random() * letters.length)];
  const num = String(Math.floor(1000 + Math.random() * 9000));
  return `${stateCode}-${district}-${letterPair}-${num}`;
}

// Service config
const SERVICE_CONFIG = {
  flights: {
    name: 'Flights', icon: Plane, color: 'bg-indigo-600', lightBg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200',
    fields: [
      { key: 'airline_id', label: 'Airline Name', type: 'master-dropdown', masterType: 'airlines', required: true, autoGenKey: 'flightNumber' },
      { key: 'flightNumber', label: 'Flight Number', type: 'auto-generated', placeholder: 'Auto-generated (e.g. 6E-2341)', required: true, readonlyHint: 'Select airline to auto-generate' },
      { key: 'departure_airport_id', label: 'From (Departure Airport)', type: 'master-dropdown', masterType: 'airports', required: true },
      { key: 'arrival_airport_id', label: 'To (Arrival Airport)', type: 'master-dropdown', masterType: 'airports', required: true },
      { key: 'departureTime', label: 'Departure Time', type: 'time-dropdown', required: true },
      { key: 'arrivalTime', label: 'Arrival Time', type: 'time-dropdown', required: true },
      { key: 'duration', label: 'Duration', type: 'select', options: ['0h 45m', '1h 00m', '1h 15m', '1h 30m', '1h 45m', '2h 00m', '2h 15m', '2h 30m', '2h 45m', '3h 00m', '3h 30m', '4h 00m', '4h 30m', '5h 00m', '6h 00m', '7h 00m', '8h 00m', '10h 00m', '12h 00m'] },
      { key: 'aircraft_id', label: 'Aircraft Type', type: 'master-dropdown', masterType: 'aircraft' },
      { key: 'stops', label: 'Stops', type: 'select', options: ['Non-stop', '1 Stop', '2 Stops'] },
      { key: 'travelClass', label: 'Class', type: 'select', options: ['Economy', 'Premium Economy', 'Business', 'First Class'], required: true },
      { key: 'baggage', label: 'Baggage Allowance', type: 'select', options: ['7 Kg Cabin Only', '15 Kg Check-in + 7 Kg Cabin', '20 Kg Check-in + 7 Kg Cabin', '25 Kg Check-in + 7 Kg Cabin', '30 Kg Check-in + 7 Kg Cabin', '40 Kg Check-in + 10 Kg Cabin', '2x 23 Kg Check-in + 7 Kg Cabin'], required: true },
      { key: 'mealIncluded', label: 'Meal Included', type: 'select', options: ['No Meal', 'Complimentary Meal', 'Paid Meal Available', 'Snacks & Beverages Only'], required: true },
      { key: 'refundable', label: 'Refundable', type: 'select', options: ['Non-Refundable', 'Partially Refundable', 'Fully Refundable'], required: true },
      { key: 'availableSeats', label: 'Available Seats', type: 'number', placeholder: '180', required: true },
      { key: 'imageUrl', label: 'Image URL', type: 'url', placeholder: 'Paste image link (e.g. from Google Images or Unsplash)', fullWidth: true },
    ],
  },
  hotels: {
    name: 'Hotels', icon: Building2, color: 'bg-emerald-600', lightBg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200',
    fields: [
      { key: 'hotelName', label: 'Hotel / Property Name', type: 'select', options: ['Taj Hotels', 'Oberoi Hotels', 'ITC Hotels', 'Leela Palace', 'Radisson Blu', 'Marriott', 'Hyatt Regency', 'Holiday Inn', 'Novotel', 'Lemon Tree Hotels', 'OYO Rooms', 'Treebo Hotels', 'FabHotel', 'Ginger Hotels', 'The Park Hotels', 'JW Marriott', 'Sheraton', 'Hilton', 'Best Western', 'Ramada'], required: true },
      { key: 'city', label: 'City', type: 'select', options: ['Bengaluru', 'Mumbai', 'Delhi', 'Chennai', 'Hyderabad', 'Kolkata', 'Pune', 'Ahmedabad', 'Goa', 'Jaipur', 'Udaipur', 'Lucknow', 'Chandigarh', 'Kochi', 'Coimbatore', 'Mysuru', 'Mangaluru', 'Shimla', 'Manali', 'Rishikesh', 'Ooty', 'Munnar', 'Darjeeling', 'Agra', 'Varanasi'], required: true },
      { key: 'address', label: 'Full Address', type: 'text', placeholder: 'e.g. 123 Beach Road, Calangute' },
      { key: 'roomType', label: 'Room Type', type: 'select', options: ['Standard Room', 'Deluxe Room', 'Superior Room', 'Premium Room', 'Suite', 'Executive Suite', 'Presidential Suite', 'Family Room', 'Twin Room', 'Single Room', 'Dormitory'] },
      { key: 'starRating', label: 'Star Rating', type: 'select', options: ['1 Star', '2 Star', '3 Star', '4 Star', '5 Star'] },
      { key: 'amenities', label: 'Amenities', type: 'select', options: ['WiFi + Pool + Gym', 'WiFi + Restaurant + Bar', 'WiFi + Pool + Spa + Gym', 'WiFi + Restaurant + Pool + Parking', 'WiFi + Spa + Restaurant + Bar + Pool + Gym', 'WiFi Only', 'Basic (No Amenities)', 'Premium (All Amenities)'] },
      { key: 'breakfastIncluded', label: 'Breakfast Included', type: 'select', options: ['No Breakfast', 'Complimentary Breakfast', 'Breakfast + Dinner (MAP)', 'All Meals Included (AP)', 'Breakfast Buffet', 'Continental Breakfast'], required: true },
      { key: 'wifiAvailable', label: 'WiFi', type: 'select', options: ['Free WiFi', 'Paid WiFi', 'WiFi in Lobby Only', 'No WiFi'] },
      { key: 'parkingAvailable', label: 'Parking', type: 'select', options: ['Free Parking', 'Paid Parking (Valet)', 'Paid Parking (Self)', 'No Parking', 'Street Parking'] },
      { key: 'cancellationPolicy', label: 'Cancellation Policy', type: 'select', options: ['Free Cancellation (up to 24 hrs)', 'Free Cancellation (up to 48 hrs)', 'Free Cancellation (up to 7 days)', 'Non-Refundable', 'Partially Refundable (50%)', 'Fully Refundable'], required: true },
      { key: 'checkInTime', label: 'Check-in Time', type: 'time-dropdown', required: true },
      { key: 'checkOutTime', label: 'Check-out Time', type: 'time-dropdown', required: true },
      { key: 'availableRooms', label: 'Available Rooms', type: 'number', placeholder: '50', required: true },
      { key: 'imageUrl', label: 'Image URL', type: 'url', placeholder: 'Paste image link (e.g. from Google Images or Unsplash)', fullWidth: true },
    ],
  },
  buses: {
    name: 'Buses', icon: Bus, color: 'bg-amber-600', lightBg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200',
    fields: [
      { key: 'operatorName', label: 'Bus Operator Name', type: 'select', options: ['VRL Travels', 'SRS Travels', 'KSRTC', 'Orange Travels', 'Paulo Travels', 'Neeta Travels', 'RedBus Express', 'Kaveri Travels', 'Sugama Travels', 'Durgamba Motors', 'TSRTC', 'APSRTC', 'MSRTC', 'GSRTC', 'RSRTC', 'UPSRTC', 'HRTC', 'PEPSU'], required: true, autoGenKey: 'busNumber' },
      { key: 'busNumber', label: 'Bus Number', type: 'auto-generated', placeholder: 'Auto-generated (e.g. KA-01-VRL-1234)', required: true, readonlyHint: 'Select operator to auto-generate' },
      { key: 'from', label: 'From (City)', type: 'select', options: ['Bengaluru', 'Mumbai', 'Delhi', 'Chennai', 'Hyderabad', 'Kolkata', 'Pune', 'Ahmedabad', 'Goa', 'Jaipur', 'Lucknow', 'Chandigarh', 'Kochi', 'Coimbatore', 'Mysuru', 'Mangaluru', 'Hubli', 'Vizag', 'Nagpur', 'Indore', 'Bhopal', 'Thiruvananthapuram', 'Madurai', 'Vijayawada', 'Surat'], required: true },
      { key: 'to', label: 'To (City)', type: 'select', options: ['Bengaluru', 'Mumbai', 'Delhi', 'Chennai', 'Hyderabad', 'Kolkata', 'Pune', 'Ahmedabad', 'Goa', 'Jaipur', 'Lucknow', 'Chandigarh', 'Kochi', 'Coimbatore', 'Mysuru', 'Mangaluru', 'Hubli', 'Vizag', 'Nagpur', 'Indore', 'Bhopal', 'Thiruvananthapuram', 'Madurai', 'Vijayawada', 'Surat'], required: true },
      { key: 'departureTime', label: 'Departure Time', type: 'time-dropdown', required: true },
      { key: 'arrivalTime', label: 'Arrival Time', type: 'time-dropdown', required: true },
      { key: 'duration', label: 'Duration', type: 'select', options: ['1h 00m', '2h 00m', '3h 00m', '4h 00m', '5h 00m', '6h 00m', '7h 00m', '8h 00m', '9h 00m', '10h 00m', '12h 00m', '14h 00m', '16h 00m', '18h 00m', '20h 00m', '24h 00m'] },
      { key: 'busType', label: 'Bus Type', type: 'select', options: ['Sleeper', 'Semi-Sleeper', 'Seater', 'AC Sleeper', 'Volvo AC', 'AC Seater', 'Non-AC Sleeper', 'Non-AC Seater', 'Multi-Axle Volvo'] },
      { key: 'amenities', label: 'Amenities / Facilities', type: 'select', options: ['WiFi + Charging Point', 'Charging Point Only', 'Water Bottle + Blanket', 'WiFi + Charging + Water + Blanket', 'AC + Blanket + Water', 'Basic (No Amenities)', 'Premium (WiFi, Charging, Snacks, Blanket, Pillow)', 'Entertainment System + WiFi'] },
      { key: 'boardingPoint', label: 'Boarding Point', type: 'city-autocomplete', required: true },
      { key: 'droppingPoint', label: 'Dropping Point', type: 'city-autocomplete', required: true },
      { key: 'refundable', label: 'Cancellation / Refund Policy', type: 'select', options: ['Non-Refundable', 'Free Cancellation (up to 24 hrs)', 'Free Cancellation (up to 6 hrs)', 'Partially Refundable (50%)', 'Partially Refundable (75%)', 'Fully Refundable'], required: true },
      { key: 'availableSeats', label: 'Available Seats', type: 'number', placeholder: '36', required: true },
      { key: 'imageUrl', label: 'Image URL', type: 'url', placeholder: 'Paste image link (e.g. from Google Images or Unsplash)', fullWidth: true },
    ],
  },
  wellness: {
    name: 'Health & Healing', icon: Sparkles, color: 'bg-teal-600', lightBg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200',
    fields: [
      { key: 'practitionerName', label: 'Practitioner / Clinic Name', type: 'select', options: ['Apollo Clinic', 'Fortis Healthcare', 'Manipal Hospital', 'Max Healthcare', 'AIIMS', 'Narayana Health', 'Columbia Asia', 'Medanta', 'Aster CMI', 'Sakra World Hospital', 'Cloudnine Hospital', 'Practo Clinic', 'Cure.fit', 'Art of Living', 'Isha Foundation', 'Patanjali Wellness', 'Jiva Ayurveda', 'Kerala Ayurveda', 'Kottakkal Arya Vaidya Sala', 'Sri Sri Tattva'], required: true },
      { key: 'specialization', label: 'Specialization', type: 'select', options: ['Ayurveda', 'Yoga Therapy', 'Physiotherapy', 'Nutrition & Dietetics', 'Mental Health Counseling', 'Acupuncture', 'Naturopathy', 'Homeopathy', 'Chiropractic', 'Panchakarma', 'Reiki Healing', 'Aromatherapy', 'Siddha Medicine', 'Unani Medicine', 'Sports Medicine'], required: true },
      { key: 'qualifications', label: 'Qualifications', type: 'select', options: ['BAMS', 'BHMS', 'BNYS', 'MD (Ayurveda)', 'MSc (Yoga)', 'BPT (Physiotherapy)', 'MPT (Physiotherapy)', 'PhD (Yoga & Wellness)', 'Certified Yoga Instructor', 'Certified Nutritionist', 'MSc (Clinical Psychology)', 'MBBS + MD', 'Diploma in Naturopathy'] },
      { key: 'city', label: 'City', type: 'select', options: ['Bengaluru', 'Mumbai', 'Delhi', 'Chennai', 'Hyderabad', 'Kolkata', 'Pune', 'Ahmedabad', 'Goa', 'Jaipur', 'Kochi', 'Coimbatore', 'Mysuru', 'Rishikesh', 'Thiruvananthapuram', 'Varanasi', 'Haridwar', 'Dharamsala', 'Varkala', 'Alleppey'], required: true },
      { key: 'location', label: 'Location / Address', type: 'text', placeholder: 'e.g. Indiranagar, Bengaluru' },
      { key: 'consultationMode', label: 'Consultation Mode', type: 'select', options: ['In-Person', 'Online Video', 'Both In-Person & Online'] },
      { key: 'sessionDuration', label: 'Session Duration', type: 'select', options: ['15 mins', '30 mins', '45 mins', '1 hour', '1.5 hours', '2 hours', '3 hours', 'Half Day (4 hours)', 'Full Day (8 hours)'] },
      { key: 'availableSlots', label: 'Available Slots (comma separated)', type: 'text', placeholder: 'e.g. 10:00 AM, 11:30 AM, 3:00 PM' },
      { key: 'category', label: 'Category', type: 'select', options: ['Ayurveda', 'Yoga', 'Meditation', 'Physiotherapy', 'Nutrition', 'Mental Health & Wellness', 'Acupuncture', 'Naturopathy', 'Homeopathy', 'Panchakarma', 'Siddha', 'Unani'] },
      { key: 'experienceLevel', label: 'Experience Level', type: 'select', options: ['All Levels', 'Beginner Friendly', 'Intermediate', 'Advanced', 'Professional/Clinical'] },
      { key: 'language', label: 'Language', type: 'select', options: ['English', 'Hindi', 'Kannada', 'Tamil', 'Telugu', 'Malayalam', 'Marathi', 'Bengali', 'Gujarati', 'English + Hindi', 'English + Kannada', 'English + Tamil', 'English + Telugu', 'Multiple Languages'] },
      { key: 'genderPreference', label: 'Practitioner Gender', type: 'select', options: ['Male', 'Female', 'No Preference', 'Both Available'] },
      { key: 'cancellationPolicy', label: 'Cancellation Policy', type: 'select', options: ['Free Cancellation (up to 24 hrs)', 'Free Cancellation (up to 2 hrs)', 'Non-Refundable', 'Partially Refundable (50%)', 'Free Rescheduling', 'Fully Refundable'], required: true },
      { key: 'insuranceAccepted', label: 'Insurance Accepted', type: 'select', options: ['Yes (All Major Insurance)', 'Yes (Select Insurance Only)', 'No Insurance / Self Pay Only', 'CGHS / ECHS Accepted', 'Ayushman Bharat Accepted'] },
      { key: 'imageUrl', label: 'Image URL', type: 'url', placeholder: 'Paste image link (e.g. from Google Images or Unsplash)', fullWidth: true },
    ],
  },
  properties: {
    name: 'Properties', icon: MapPin, color: 'bg-rose-600', lightBg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200',
    fields: [
      { key: 'propertyName', label: 'Property Name / Title', type: 'select', options: ['Seaside Villa', 'Mountain Retreat', 'Lake House', 'Beach Cottage', 'Heritage Haveli', 'Luxury Penthouse', 'Garden Bungalow', 'Riverside Cabin', 'Hill Station Cottage', 'Plantation Stay', 'Palace Suite', 'Treehouse Stay', 'Houseboat', 'Eco Lodge', 'Farm Stay'], required: true },
      { key: 'propertyType', label: 'Property Type', type: 'select', options: ['Villa', 'Apartment', 'Cottage', 'Farmhouse', 'Bungalow', 'PG/Hostel', 'Penthouse', 'Studio', 'Duplex', 'Treehouse', 'Houseboat', 'Tent/Glamping'], required: true },
      { key: 'city', label: 'City', type: 'select', options: ['Bengaluru', 'Mumbai', 'Delhi', 'Chennai', 'Hyderabad', 'Kolkata', 'Pune', 'Ahmedabad', 'Goa', 'Jaipur', 'Udaipur', 'Kochi', 'Coimbatore', 'Mysuru', 'Shimla', 'Manali', 'Ooty', 'Munnar', 'Lonavala', 'Kodaikanal', 'Alleppey', 'Pondicherry', 'Darjeeling', 'Rishikesh', 'Mahabaleshwar'], required: true },
      { key: 'location', label: 'Locality / Area', type: 'text', placeholder: 'e.g. Calangute Beach, North Goa' },
      { key: 'address', label: 'Full Address', type: 'text', placeholder: 'e.g. 456 Beach Lane, Calangute' },
      { key: 'bedrooms', label: 'Bedrooms', type: 'select', options: ['1', '2', '3', '4', '5', '6', '7', '8', '10+'] },
      { key: 'bathrooms', label: 'Bathrooms', type: 'select', options: ['1', '2', '3', '4', '5', '6+'] },
      { key: 'amenities', label: 'Amenities', type: 'select', options: ['WiFi + Kitchen + Parking', 'WiFi + Pool + Kitchen + Parking', 'WiFi + Pool + Garden + BBQ + Parking', 'WiFi + AC + TV + Kitchen', 'Pool + Garden + Gym + WiFi + Parking', 'Basic (WiFi Only)', 'Fully Furnished (All Amenities)', 'Premium (Pool, Jacuzzi, Home Theatre, WiFi, Parking)'] },
      { key: 'maxGuests', label: 'Max Guests', type: 'select', options: ['1', '2', '3', '4', '5', '6', '8', '10', '12', '15', '20', '25+'] },
      { key: 'checkInTime', label: 'Check-in Time', type: 'time-dropdown', required: true },
      { key: 'checkOutTime', label: 'Check-out Time', type: 'time-dropdown', required: true },
      { key: 'minimumStay', label: 'Minimum Stay', type: 'select', options: ['1 Night', '2 Nights', '3 Nights', '5 Nights', '7 Nights (1 Week)', '14 Nights (2 Weeks)', '30 Nights (1 Month)'] },
      { key: 'cancellationPolicy', label: 'Cancellation Policy', type: 'select', options: ['Free Cancellation (up to 24 hrs)', 'Free Cancellation (up to 48 hrs)', 'Free Cancellation (up to 7 days)', 'Non-Refundable', 'Partially Refundable (50%)', 'Fully Refundable'], required: true },
      { key: 'petsAllowed', label: 'Pets Allowed', type: 'select', options: ['No Pets', 'Pets Allowed', 'Pets Allowed (Small Dogs Only)', 'Pets Allowed (Extra Charge)'] },
      { key: 'imageUrl', label: 'Image URL', type: 'url', placeholder: 'Paste image link (e.g. from Google Images or Unsplash)', fullWidth: true },
    ],
  },
};

// Auto-refresh fetch: if a request gets 401, refresh the token and retry once
async function authFetch(url, options = {}) {
  let res = await fetch(url, options);
  if (res.status === 401) {
    // Try refreshing the access token
    const refreshRes = await fetch('/api/auth/refresh', { method: 'POST' });
    if (refreshRes.ok) {
      // Retry the original request with the new token (cookie is auto-updated)
      res = await fetch(url, options);
    }
  }
  return res;
}

export default function ProviderDashboardPage() {
  const router = useRouter();
  const { formatPrice } = useCurrency();
  const [currentUser, setCurrentUser] = useState(null);
  const [activeService, setActiveService] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});
  const [customValues, setCustomValues] = useState({});
  const [formPrice, setFormPrice] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [expandedCard, setExpandedCard] = useState(null);

  const [providerStatus, setProviderStatus] = useState(null);
  const [statusLoading, setStatusLoading] = useState(true);

  // Master data for dropdowns
  const [masterData, setMasterData] = useState({ airlines: [], airports: [], aircraft: [] });
  const [masterLoading, setMasterLoading] = useState(false);

  // Bookings & Notifications
  const [activeTab, setActiveTab] = useState('listings'); // 'listings' | 'bookings' | 'notifications'
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [bookingFilter, setBookingFilter] = useState('All');
  const [bookingSearch, setBookingSearch] = useState('');
  const [expandedBooking, setExpandedBooking] = useState(null);

  useEffect(() => {
    // Fetch master data for dropdowns
    const fetchMasterData = async () => {
      setMasterLoading(true);
      try {
        const res = await fetch('/api/master-data');
        if (res.ok) {
          const data = await res.json();
          setMasterData({
            airlines: data.airlines || [],
            airports: data.airports || [],
            aircraft: data.aircraft || [],
          });
        }
      } catch (e) { console.error('Master data fetch error:', e); }
      setMasterLoading(false);
    };
    fetchMasterData();
  }, []);

  useEffect(() => {
    const init = async () => {
      // Sync session from backend first to ensure fresh token and services
      const synced = await syncSessionFromBackend();
      const user = synced || getCurrentUser();
      setCurrentUser(user);
      if (user?.services?.length > 0) {
        setActiveService(user.services[0]);
      }
      setLoading(false);
      // Check provider approval status from backend
      checkProviderStatus();
    };
    init();
  }, []);

  const checkProviderStatus = async () => {
    try {
      const res = await authFetch('/api/users/me');
      if (res.ok) {
        const data = await res.json();
        if (data.user?.providerStatus) {
          setProviderStatus(data.user.providerStatus);
        } else if (data.user?.applicationStatus) {
          setProviderStatus(data.user.applicationStatus);
        } else {
          setProviderStatus('approved'); // fallback
        }
        // Update services in case they changed
        if (data.user?.services?.length > 0) {
          const user = getCurrentUser();
          if (user && !user.services?.length) {
            user.services = data.user.services;
            setCurrentUser(user);
            setActiveService(data.user.services[0]);
          }
        }
      } else {
        // If API fails, still allow access with fallback
        setProviderStatus('approved');
      }
    } catch (e) {
      console.error('Status check error:', e);
      setProviderStatus('approved'); // fallback on error
    }
    setStatusLoading(false);
  };

  // Fetch bookings and notifications on load
  useEffect(() => {
    if (providerStatus === 'approved') {
      fetchBookings();
      fetchNotifications();
    }
  }, [providerStatus]);

  const fetchBookings = async () => {
    setBookingsLoading(true);
    try {
      const res = await authFetch('/api/bookings?role=provider');
      const data = await res.json();
      if (res.ok) setBookings(data.bookings || []);
    } catch (err) { console.error('Fetch bookings error:', err); }
    setBookingsLoading(false);
  };

  const fetchNotifications = async () => {
    setNotificationsLoading(true);
    try {
      const res = await authFetch('/api/notifications');
      const data = await res.json();
      if (res.ok) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) { console.error('Fetch notifications error:', err); }
    setNotificationsLoading(false);
  };

  const markNotificationRead = async (id) => {
    try {
      await authFetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: id }),
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) { console.error('Mark read error:', err); }
  };

  const markAllNotificationsRead = async () => {
    try {
      await authFetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true }),
      });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) { console.error('Mark all read error:', err); }
  };

  const updateBookingStatus = async (bookingId, status) => {
    try {
      const res = await authFetch('/api/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, status }),
      });
      if (res.ok) {
        setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status } : b));
        setSuccess(`Booking ${status.toLowerCase()} successfully`);
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) { console.error('Update booking error:', err); }
  };

  const updateBookingStatusWithNotes = async (bookingId, status, notes) => {
    try {
      const res = await authFetch('/api/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, status, notes: notes || '' }),
      });
      if (res.ok) {
        setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status } : b));
        setSuccess(`Booking ${status.toLowerCase()} successfully`);
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) { console.error('Update booking error:', err); }
  };

  // Fetch listings when service tab changes
  useEffect(() => {
    if (activeService && activeTab === 'listings') fetchListings();
  }, [activeService, activeTab]);

  const fetchListings = async () => {
    try {
      let res = await authFetch(`/api/provider/listings?service_type=${activeService}`);
      if (res.status === 401) {
        // Token might be stale — sync session and retry
        await syncSessionFromBackend();
        res = await authFetch(`/api/provider/listings?service_type=${activeService}`);
      }
      const data = await res.json();
      if (res.ok) {
        setListings(data.listings || []);
      } else {
        console.error('Fetch listings error:', data.error);
        setError(data.error || 'Failed to load listings. Please log out and log back in.');
      }
    } catch (err) {
      console.error('Fetch listings error:', err);
      setError('Network error loading listings. Please refresh the page.');
    }
  };

  const providerServices = currentUser?.services || [];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  const openAddForm = () => {
    setEditingId(null);
    setFormData({});
    setCustomValues({});
    setFormPrice('');
    setError('');
    setShowForm(true);
  };

  const openEditForm = (listing) => {
    setEditingId(listing.id);
    const details = listing.details || {};
    setFormData(details);
    // Restore custom values if the listing used "Other"
    const cv = {};
    // Flight master-dropdown customs
    ['airline_custom', 'departure_airport_custom', 'arrival_airport_custom', 'aircraft_custom'].forEach(k => {
      if (details[k]) cv[k] = details[k];
    });
    // For select fields, detect non-standard values and treat as custom
    const svcCfg = SERVICE_CONFIG[listing.service_type];
    if (svcCfg) {
      svcCfg.fields.forEach(f => {
        if (f.type === 'select' && details[f.key] && !f.options.includes(details[f.key])) {
          cv[f.key + '_custom'] = details[f.key];
          details[f.key] = '__other__';
        }
        if (f.type === 'time-dropdown' && details[f.key] && !TIME_SLOTS.includes(details[f.key])) {
          cv[f.key + '_custom'] = details[f.key];
          details[f.key] = '__other__';
        }
      });
    }
    setCustomValues(cv);
    setFormPrice(listing.price?.toString() || '');
    setError('');
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!activeService) return;
    const cfg = SERVICE_CONFIG[activeService];
    if (!cfg) return;

    // Validate required fields — for master-dropdown/time-dropdown/select with "Other", check custom value
    const missingFields = cfg.fields
      .filter(f => {
        if (!f.required) return false;
        if (f.type === 'master-dropdown' && formData[f.key] === '__other__') {
          const ck = f.key.replace('_id', '_custom');
          return !customValues[ck]?.trim();
        }
        if (f.type === 'time-dropdown' && formData[f.key] === '__other__') {
          return !customValues[f.key + '_custom']?.trim();
        }
        if (f.type === 'select' && formData[f.key] === '__other__') {
          return !customValues[f.key + '_custom']?.trim();
        }
        return !formData[f.key]?.toString().trim();
      })
      .map(f => {
        if (f.type === 'master-dropdown' && formData[f.key] === '__other__') return `${f.label} (custom name)`;
        if (f.type === 'time-dropdown' && formData[f.key] === '__other__') return `${f.label} (custom time)`;
        if (f.type === 'select' && formData[f.key] === '__other__') return `${f.label} (custom value)`;
        return f.label;
      });

    if (missingFields.length > 0) {
      setError(`Please fill: ${missingFields.join(', ')}`);
      return;
    }

    setSaving(true);
    setError('');

    try {
      // Build title - resolve master data names for flights
      let title = 'Untitled';
      let description = '';

      if (activeService === 'flights') {
        const airline = masterData.airlines.find(a => a.id === formData.airline_id);
        const depAirport = masterData.airports.find(a => a.id === formData.departure_airport_id);
        const arrAirport = masterData.airports.find(a => a.id === formData.arrival_airport_id);
        const aircraft = masterData.aircraft.find(a => a.id === formData.aircraft_id);

        // Resolve names — use custom values when "Other" is selected
        const airlineName = formData.airline_id === '__other__' ? customValues.airline_custom : airline?.airline_name;
        const depName = formData.departure_airport_id === '__other__' ? customValues.departure_airport_custom : (depAirport ? `${depAirport.city} (${depAirport.airport_code})` : '');
        const arrName = formData.arrival_airport_id === '__other__' ? customValues.arrival_airport_custom : (arrAirport ? `${arrAirport.city} (${arrAirport.airport_code})` : '');
        const aircraftName = formData.aircraft_id === '__other__' ? customValues.aircraft_custom : aircraft?.aircraft_name;

        title = `${airlineName || 'Flight'}${formData.flightNumber ? ` ${formData.flightNumber}` : ''}`;
        const parts = [];
        if (airlineName) parts.push(`Airline: ${airlineName}${airline ? ` (${airline.airline_code})` : ''}`);
        if (formData.flightNumber) parts.push(`Flight: ${formData.flightNumber}`);
        if (depName) parts.push(`From: ${depName}`);
        if (arrName) parts.push(`To: ${arrName}`);
        if (aircraftName) parts.push(`Aircraft: ${aircraftName}`);
        if (formData.travelClass) parts.push(`Class: ${formData.travelClass === '__other__' ? customValues.travelClass_custom : formData.travelClass}`);
        if (formData.baggage) parts.push(`Baggage: ${formData.baggage === '__other__' ? customValues.baggage_custom : formData.baggage}`);
        description = parts.join(' | ');
      } else {
        const titleField = cfg.fields.find(f => f.required);
        let titleVal = formData[titleField?.key] || 'Untitled';
        // Resolve "Other" custom value for title
        if (titleVal === '__other__' && customValues[titleField?.key + '_custom']) {
          titleVal = customValues[titleField.key + '_custom'];
        }
        title = titleVal;
        description = cfg.fields
          .filter(f => formData[f.key])
          .map(f => {
            let val = formData[f.key];
            // Resolve "Other" custom values for display
            if (val === '__other__' && customValues[f.key + '_custom']) {
              val = customValues[f.key + '_custom'];
            }
            return `${f.label}: ${val}`;
          })
          .join(' | ');
      }

      // Merge custom values into details so they're stored in JSONB
      const details = { ...formData };
      // Resolve time-dropdown and select custom values
      cfg.fields.forEach(f => {
        if (f.type === 'time-dropdown' && details[f.key] === '__other__') {
          details[f.key] = customValues[f.key + '_custom']?.trim() || '';
        }
        if (f.type === 'select' && details[f.key] === '__other__') {
          details[f.key] = customValues[f.key + '_custom']?.trim() || '';
        }
      });
      if (activeService === 'flights') {
        Object.entries(customValues).forEach(([k, v]) => {
          if (v?.trim() && !k.endsWith('Time_custom') && !k.endsWith('_custom')) details[k] = v.trim();
        });
      }

      const payload = {
        service_type: activeService,
        title,
        description,
        details,
        price: parseFloat(formPrice) || 0,
        status: 'active',
      };

      let res;
      if (editingId) {
        payload.id = editingId;
        res = await authFetch('/api/provider/listings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await authFetch('/api/provider/listings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to save');
      } else {
        setSuccess(editingId ? 'Listing updated successfully!' : 'Listing added successfully!');
        setShowForm(false);
        setEditingId(null);
        setFormData({});
        setCustomValues({});
        setFormPrice('');
        fetchListings();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;
    try {
      const res = await authFetch(`/api/provider/listings?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSuccess('Listing deleted');
        fetchListings();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleToggleStatus = async (listing) => {
    const newStatus = listing.status === 'active' ? 'inactive' : 'active';
    try {
      await authFetch('/api/provider/listings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: listing.id, status: newStatus }),
      });
      fetchListings();
    } catch (err) {
      console.error('Toggle error:', err);
    }
  };

  const activeConfig = activeService ? SERVICE_CONFIG[activeService] : null;
  const ActiveIcon = activeConfig?.icon || Package;
  const activeListings = listings.filter(l => l.status === 'active').length;
  const inactiveListings = listings.filter(l => l.status === 'inactive').length;

  return (
    <AuthGuard allowedRole="provider" roleTitle="Service Provider">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm">
                  {currentUser?.name?.charAt(0)?.toUpperCase() || 'P'}
                </div>
                <div>
                  <h1 className="text-sm font-bold text-gray-900">{greeting}, {currentUser?.name?.split(' ')[0] || 'Partner'}!</h1>
                  <p className="text-xs text-gray-500">{currentUser?.profile?.business_name || 'Provider Portal'}</p>
                </div>
              </div>
              <button onClick={() => { logoutUser(); router.push('/login'); }}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 flex items-center gap-1.5">
                <LogOut className="w-3.5 h-3.5" /> Logout
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          {/* Pending Approval Banner */}
          {providerStatus === 'pending' && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 sm:p-8 text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-amber-100 text-amber-600 rounded-full flex items-center justify-center">
                <Clock className="w-8 h-8" />
              </div>
              <h2 className="text-lg font-bold text-amber-800">Application Pending Approval</h2>
              <p className="text-sm text-amber-700 max-w-md mx-auto">
                Your provider application is being reviewed by the admin team. Once approved, you'll be able to add and manage your service listings here.
              </p>
              <div className="flex items-center justify-center gap-2 text-xs text-amber-600">
                <Clock className="w-3.5 h-3.5" />
                <span>You'll receive an email notification when approved</span>
              </div>
              {providerServices.length > 0 && (
                <div className="pt-3 border-t border-amber-200">
                  <p className="text-xs font-semibold text-amber-700 mb-2">Services you applied for:</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {providerServices.map(svc => {
                      const cfg = SERVICE_CONFIG[svc];
                      if (!cfg) return null;
                      const Icon = cfg.icon;
                      return (
                        <span key={svc} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-amber-200 text-xs font-medium text-amber-800">
                          <Icon className="w-3.5 h-3.5" /> {cfg.name}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Rejected Banner */}
          {providerStatus === 'rejected' && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 sm:p-8 text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-rose-100 text-rose-600 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h2 className="text-lg font-bold text-rose-800">Application Not Approved</h2>
              <p className="text-sm text-rose-700 max-w-md mx-auto">
                Unfortunately, your provider application was not approved. Please contact support for more information.
              </p>
            </div>
          )}

          {/* Main Tab Switcher — Listings / Bookings / Notifications */}
          {providerStatus === 'approved' && (
            <div className="flex items-center gap-2 bg-white rounded-xl p-1.5 border border-gray-200 w-fit">
              <button onClick={() => setActiveTab('listings')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'listings' ? 'bg-teal-600 text-white shadow' : 'text-gray-600 hover:bg-gray-50'}`}>
                <Package className="w-4 h-4" /> My Listings
              </button>
              <button onClick={() => { setActiveTab('bookings'); fetchBookings(); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'bookings' ? 'bg-blue-600 text-white shadow' : 'text-gray-600 hover:bg-gray-50'}`}>
                <ShoppingBag className="w-4 h-4" /> Bookings
                {bookings.length > 0 && <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${activeTab === 'bookings' ? 'bg-white/20' : 'bg-blue-100 text-blue-700'}`}>{bookings.length}</span>}
              </button>
              <button onClick={() => { setActiveTab('notifications'); fetchNotifications(); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all relative ${activeTab === 'notifications' ? 'bg-orange-500 text-white shadow' : 'text-gray-600 hover:bg-gray-50'}`}>
                <Bell className="w-4 h-4" /> Notifications
                {unreadCount > 0 && <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500 text-white">{unreadCount}</span>}
              </button>
            </div>
          )}

          {/* Service Tabs — only show when approved and on listings tab */}
          {providerStatus === 'approved' && activeTab === 'listings' && providerServices.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {providerServices.map(svc => {
                const cfg = SERVICE_CONFIG[svc];
                if (!cfg) return null;
                const Icon = cfg.icon;
                const isActive = activeService === svc;
                return (
                  <button key={svc} onClick={() => { setActiveService(svc); setShowForm(false); }}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all
                      ${isActive ? `${cfg.color} text-white shadow-lg shadow-${svc === 'flights' ? 'indigo' : svc === 'hotels' ? 'emerald' : svc === 'buses' ? 'amber' : svc === 'wellness' ? 'teal' : 'rose'}-200` : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'}`}>
                    <Icon className="w-4 h-4" />
                    {cfg.name}
                  </button>
                );
              })}
            </div>
          )}

          {/* ===== LISTINGS TAB CONTENT ===== */}
          {activeTab === 'listings' && (
            <>
          {/* No services message — only when approved */}
          {providerStatus === 'approved' && providerServices.length === 0 && (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-700">No Services Configured</h3>
              <p className="text-sm text-gray-500 mt-2">Your service categories will appear here once your account is set up.</p>
            </div>
          )}

          {/* Stats Cards */}
          {providerStatus === 'approved' && activeService && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500">Total Listings</span>
                  <Package className="w-4 h-4 text-gray-400" />
                </div>
                <div className="text-2xl font-black text-gray-900 mt-1">{listings.length}</div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500">Active</span>
                  <Eye className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="text-2xl font-black text-emerald-600 mt-1">{activeListings}</div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500">Inactive</span>
                  <EyeOff className="w-4 h-4 text-gray-400" />
                </div>
                <div className="text-2xl font-black text-gray-400 mt-1">{inactiveListings}</div>
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2 text-sm text-emerald-700">
              <CheckCircle2 className="w-4 h-4" /> {success}
            </div>
          )}

          {/* Add Button + Listings */}
          {providerStatus === 'approved' && activeService && !showForm && (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-gray-900">
                  My {activeConfig?.name} Listings
                </h2>
                <button onClick={openAddForm}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white ${activeConfig?.color} hover:opacity-90 shadow-sm transition`}>
                  <Plus className="w-4 h-4" /> Add New {activeConfig?.name?.slice(0, -1) || 'Listing'}
                </button>
              </div>

              {/* Listings */}
              {listings.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-300">
                  <ActiveIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-700">No {activeConfig?.name} Listed Yet</h3>
                  <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
                    Start by adding your first {activeConfig?.name?.toLowerCase()} listing. Fill in the details and it will be visible to customers on the platform.
                  </p>
                  <button onClick={openAddForm}
                    className={`mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white ${activeConfig?.color} hover:opacity-90 shadow-sm`}>
                    <Plus className="w-4 h-4" /> Add Your First Listing
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {listings.map(listing => {
                    const details = typeof listing.details === 'string' ? JSON.parse(listing.details) : (listing.details || {});
                    const isExpanded = expandedCard === listing.id;
                    const cfg = SERVICE_CONFIG[listing.service_type] || activeConfig;

                    return (
                      <div key={listing.id} className={`bg-white rounded-xl border ${listing.status === 'inactive' ? 'border-gray-200 opacity-70' : 'border-gray-200'} overflow-hidden`}>
                        {/* Card Header */}
                        <div className="p-4 flex items-center justify-between cursor-pointer" onClick={() => setExpandedCard(isExpanded ? null : listing.id)}>
                          <div className="flex items-center gap-3 min-w-0">
                            {details.imageUrl ? (
                              <img src={details.imageUrl} alt={listing.title} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                            ) : (
                              <div className={`w-10 h-10 rounded-lg ${cfg?.color} flex items-center justify-center shrink-0`}>
                                {cfg?.icon && <cfg.icon className="w-5 h-5 text-white" />}
                              </div>
                            )}
                            <div className="min-w-0">
                              <h4 className="text-sm font-bold text-gray-900 truncate">{listing.title === '__other__' ? (details.operatorName || details.hotelName || details.practitionerName || details.propertyName || 'Untitled') : listing.title}</h4>
                              <p className="text-xs text-gray-500 truncate">
                                {listing.service_type === 'flights' ? (() => {
                                  const dep = masterData.airports.find(a => a.id === details.departure_airport_id);
                                  const arr = masterData.airports.find(a => a.id === details.arrival_airport_id);
                                  const parts = [];
                                  if (details.flightNumber) parts.push(details.flightNumber);
                                  if (dep) parts.push(dep.city);
                                  if (arr) parts.push(arr.city);
                                  return parts.join(' • ') || listing.description;
                                })() : listing.service_type === 'buses' ? [details.from, details.to, details.busType].filter(v => v && v !== '__other__').join(' • ')
                                : listing.service_type === 'hotels' ? [details.city, details.roomType, details.starRating].filter(v => v && v !== '__other__').join(' • ')
                                : listing.service_type === 'wellness' ? [details.specialization, details.city, details.consultationMode].filter(v => v && v !== '__other__').join(' • ')
                                : listing.service_type === 'properties' ? [details.propertyType, details.city, details.bedrooms ? `${details.bedrooms} BHK` : ''].filter(v => v && v !== '__other__').join(' • ')
                                : Object.entries(details).slice(0, 3).map(([k, v]) => v).filter(v => v && v !== '__other__').join(' • ')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-sm font-bold text-gray-900">{formatPrice(parseFloat(listing.price || 0))}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${listing.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                              {listing.status === 'active' ? 'Live' : 'Hidden'}
                            </span>
                            {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                          </div>
                        </div>

                        {/* Expanded Details */}
                        {isExpanded && (
                          <div className="border-t border-gray-100 bg-gray-50 p-4">
                            {details.imageUrl && (
                              <div className="mb-4 rounded-lg overflow-hidden">
                                <img src={details.imageUrl} alt={listing.title} className="w-full h-48 object-cover" />
                              </div>
                            )}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                              {cfg?.fields.map(f => {
                                let val = details[f.key];
                                if (!val || f.key === 'imageUrl') return null;
                                // Resolve master data IDs to display names
                                if (f.type === 'master-dropdown' && val) {
                                  const items = masterData[f.masterType] || [];
                                  const item = items.find(i => i.id === val);
                                  if (item) {
                                    if (f.masterType === 'airlines') val = `${item.airline_name} (${item.airline_code})`;
                                    else if (f.masterType === 'airports') val = `${item.city} – ${item.airport_name} (${item.airport_code})`;
                                    else if (f.masterType === 'aircraft') val = `${item.aircraft_name}`;
                                  }
                                }
                                return (
                                  <div key={f.key} className="text-xs">
                                    <span className="text-gray-500">{f.label}:</span>
                                    <span className="ml-1.5 font-semibold text-gray-800">{val}</span>
                                  </div>
                                );
                              })}
                            </div>
                            <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
                              <button onClick={(e) => { e.stopPropagation(); openEditForm(listing); }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50">
                                <Pencil className="w-3 h-3" /> Edit
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); handleToggleStatus(listing); }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50">
                                {listing.status === 'active' ? <><EyeOff className="w-3 h-3" /> Hide</> : <><Eye className="w-3 h-3" /> Show</>}
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); handleDelete(listing.id); }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 ml-auto">
                                <Trash2 className="w-3 h-3" /> Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* Add/Edit Form */}
          {providerStatus === 'approved' && showForm && activeConfig && (
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              {/* Form Header */}
              <div className={`${activeConfig.color} px-6 py-4 flex items-center justify-between`}>
                <div className="flex items-center gap-3 text-white">
                  <ActiveIcon className="w-5 h-5" />
                  <h3 className="text-sm font-bold">{editingId ? 'Edit' : 'Add New'} {activeConfig.name?.slice(0, -1) || 'Listing'}</h3>
                </div>
                <button onClick={() => { setShowForm(false); setEditingId(null); }}
                  className="text-white/70 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Body */}
              <div className="p-6 space-y-5">
                {error && (
                  <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-center gap-2 text-sm text-rose-700">
                    <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {activeConfig.fields.map(field => (
                    <div key={field.key} className={field.fullWidth || (field.type === 'text' && field.key.includes('address')) ? 'sm:col-span-2' : ''}>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        {field.label} {field.required && <span className="text-rose-500">*</span>}
                      </label>
                      {field.type === 'auto-generated' ? (
                        <div className="space-y-1">
                          <div className="relative">
                            <input
                              type="text"
                              value={formData[field.key] || ''}
                              onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                              placeholder={field.placeholder}
                              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none bg-white"
                            />
                            {!formData[field.key] && (
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-amber-500 font-medium">{field.readonlyHint}</span>
                            )}
                          </div>
                          {formData[field.key] && (
                            <button
                              type="button"
                              onClick={() => {
                                // Re-generate based on parent field
                                const parentField = activeConfig?.fields.find(f => f.autoGenKey === field.key);
                                if (parentField && formData[parentField.key]) {
                                  if (parentField.type === 'master-dropdown' && parentField.masterType === 'airlines') {
                                    const airline = masterData.airlines.find(a => a.id === formData[parentField.key]);
                                    if (airline) setFormData(prev => ({ ...prev, [field.key]: generateFlightNumber(airline.airline_code) }));
                                  } else if (parentField.type === 'select') {
                                    setFormData(prev => ({ ...prev, [field.key]: generateBusNumber(formData[parentField.key]) }));
                                  }
                                }
                              }}
                              className="text-[10px] text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                            >
                              ↻ Re-generate number
                            </button>
                          )}
                        </div>
                      ) : field.type === 'master-dropdown' ? (
                        <MasterDropdown
                          field={field}
                          value={formData[field.key] || ''}
                          onChange={(val) => {
                            const updates = { [field.key]: val };
                            // Auto-generate flight number when airline is selected
                            if (field.autoGenKey) {
                              if (field.masterType === 'airlines') {
                                if (val === '__other__') {
                                  updates[field.autoGenKey] = generateFlightNumber('XX');
                                } else {
                                  const airline = masterData.airlines.find(a => a.id === val);
                                  if (airline) updates[field.autoGenKey] = generateFlightNumber(airline.airline_code);
                                }
                              }
                            }
                            setFormData(prev => ({ ...prev, ...updates }));
                            // Clear custom value if switching back from "Other"
                            if (val !== '__other__') {
                              const ck = field.key.replace('_id', '_custom');
                            }
                          }}
                          masterData={masterData}
                          formData={formData}
                          customValues={customValues}
                          onCustomChange={(key, val) => setCustomValues(prev => ({ ...prev, [key]: val }))}
                        />
                      ) : field.type === 'time-dropdown' ? (
                        <div className="space-y-2">
                          <div className="relative">
                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            <select
                              value={TIME_SLOTS.includes(formData[field.key]) ? formData[field.key] : formData[field.key] ? '__other__' : ''}
                              onChange={(e) => {
                                if (e.target.value === '__other__') {
                                  setFormData({ ...formData, [field.key]: '__other__' });
                                } else {
                                  setFormData({ ...formData, [field.key]: e.target.value });
                                }
                              }}
                              className="w-full pl-9 pr-8 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none bg-white appearance-none"
                            >
                              <option value="">Select {field.label}</option>
                              {TIME_SLOTS.map(t => (
                                <option key={t} value={t}>{t}</option>
                              ))}
                              <option value="__other__">✏️ Other (Custom time)</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                          </div>
                          {(formData[field.key] === '__other__' || (formData[field.key] && !TIME_SLOTS.includes(formData[field.key]) && formData[field.key] !== '')) && (
                            <input
                              type="text"
                              value={formData[field.key] === '__other__' ? (customValues[field.key + '_custom'] || '') : formData[field.key]}
                              onChange={(e) => {
                                if (formData[field.key] === '__other__') {
                                  setCustomValues(prev => ({ ...prev, [field.key + '_custom']: e.target.value }));
                                } else {
                                  setFormData({ ...formData, [field.key]: e.target.value });
                                }
                              }}
                              placeholder="e.g. 2:35 AM, 10:22 PM"
                              className="w-full pl-3 pr-3 py-2.5 rounded-lg border border-orange-300 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-400 outline-none bg-orange-50"
                            />
                          )}
                        </div>
                      ) : field.type === 'city-autocomplete' ? (
                        <CityAutocomplete
                          value={formData[field.key] || ''}
                          onChange={(val) => setFormData(prev => ({ ...prev, [field.key]: val }))}
                          placeholder={`Search ${field.label.toLowerCase()}...`}
                          label={field.label}
                        />
                      ) : field.type === 'select' ? (
                        <div className="space-y-2">
                          <select
                            value={field.options.includes(formData[field.key]) ? formData[field.key] : formData[field.key] ? '__other__' : ''}
                            onChange={(e) => {
                              if (e.target.value === '__other__') {
                                const updates = { [field.key]: '__other__' };
                                if (field.autoGenKey) updates[field.autoGenKey] = generateBusNumber('Other');
                                setFormData(prev => ({ ...prev, ...updates }));
                                setCustomValues(prev => ({ ...prev, [field.key + '_custom']: '' }));
                              } else {
                                const updates = { [field.key]: e.target.value };
                                // Auto-generate bus number when operator is selected
                                if (field.autoGenKey && e.target.value) {
                                  updates[field.autoGenKey] = generateBusNumber(e.target.value);
                                }
                                setFormData(prev => ({ ...prev, ...updates }));
                                setCustomValues(prev => { const n = { ...prev }; delete n[field.key + '_custom']; return n; });
                              }
                            }}
                            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none bg-white">
                            <option value="">Select {field.label}</option>
                            {field.options.map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                            <option value="__other__">✏️ Other (Custom)</option>
                          </select>
                          {(formData[field.key] === '__other__' || (formData[field.key] && !field.options.includes(formData[field.key]) && formData[field.key] !== '')) && (
                            <input
                              type="text"
                              value={formData[field.key] === '__other__' ? (customValues[field.key + '_custom'] || '') : formData[field.key]}
                              onChange={(e) => {
                                if (formData[field.key] === '__other__') {
                                  setCustomValues(prev => ({ ...prev, [field.key + '_custom']: e.target.value }));
                                } else {
                                  setFormData({ ...formData, [field.key]: e.target.value });
                                }
                              }}
                              placeholder={`Enter custom ${field.label.toLowerCase()}`}
                              className="w-full pl-3 pr-3 py-2.5 rounded-lg border border-orange-300 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-400 outline-none bg-orange-50"
                            />
                          )}
                        </div>
                      ) : field.type === 'url' ? (
                        <div className="space-y-2">
                          <div className="relative">
                            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="url"
                              value={formData[field.key] || ''}
                              onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                              placeholder={field.placeholder}
                              className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none"
                            />
                          </div>
                          {formData[field.key] && (
                            <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                              <img
                                src={formData[field.key]}
                                alt="Preview"
                                className="w-full h-40 object-cover"
                                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                              />
                              <div className="hidden items-center justify-center h-40 text-xs text-gray-400">
                                <ImageIcon className="w-5 h-5 mr-2" /> Invalid image URL — please check the link
                              </div>
                            </div>
                          )}
                          <p className="text-[10px] text-gray-400">
                            Tip: Right-click any image on Google → &quot;Copy image address&quot; → paste here
                          </p>
                        </div>
                      ) : (
                        <input
                          type={field.type}
                          value={formData[field.key] || ''}
                          onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                          placeholder={field.placeholder}
                          className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none"
                        />
                      )}
                    </div>
                  ))}

                  {/* Price field (always present) */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Price (₹) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="number"
                        value={formPrice}
                        onChange={(e) => setFormPrice(e.target.value)}
                        placeholder="e.g. 4500"
                        className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <button onClick={handleSave} disabled={saving}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white ${activeConfig.color} hover:opacity-90 disabled:opacity-50 shadow-sm`}>
                    {saving ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {saving ? 'Saving...' : (editingId ? 'Update Listing' : 'Save Listing')}
                  </button>
                  <button onClick={() => { setShowForm(false); setEditingId(null); }}
                    className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Help Card */}
          {providerStatus === 'approved' && activeService && listings.length === 0 && !showForm && (
            <div className={`${activeConfig?.lightBg} rounded-xl p-5 border ${activeConfig?.border}`}>
              <h4 className={`text-sm font-bold ${activeConfig?.text} mb-2`}>Getting Started with {activeConfig?.name}</h4>
              <ul className="text-xs text-gray-600 space-y-1.5">
                <li>• Click <strong>"Add New"</strong> to create your first listing</li>
                <li>• Fill in all the required details accurately</li>
                <li>• Set a competitive price for your service</li>
                <li>• Your listing will be visible to customers on the platform once saved</li>
                <li>• You can edit, hide, or delete listings anytime</li>
              </ul>
            </div>
          )}
            </>
          )}

          {/* ===== BOOKINGS TAB CONTENT ===== */}
          {activeTab === 'bookings' && providerStatus === 'approved' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">Customer Bookings</h2>
                <button onClick={fetchBookings}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 border border-gray-200">
                  <RefreshCw className={`w-3.5 h-3.5 ${bookingsLoading ? 'animate-spin' : ''}`} /> Refresh
                </button>
              </div>

              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by reference, customer name, or service..."
                  value={bookingSearch || ''}
                  onChange={(e) => setBookingSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
                <Eye className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>

              {/* Booking Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
                  <p className="text-2xl font-bold text-blue-600">{bookings.length}</p>
                  <p className="text-xs text-gray-500 mt-1">Total Bookings</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
                  <p className="text-2xl font-bold text-green-600">{bookings.filter(b => b.status === 'Confirmed').length}</p>
                  <p className="text-xs text-gray-500 mt-1">Confirmed</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
                  <p className="text-2xl font-bold text-amber-600">{bookings.filter(b => b.status === 'Pending').length}</p>
                  <p className="text-xs text-gray-500 mt-1">Pending</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
                  <p className="text-2xl font-bold text-teal-600">
                    {formatPrice(bookings.filter(b => b.status === 'Confirmed').reduce((sum, b) => sum + (b.total_amount || 0), 0))}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Total Revenue</p>
                </div>
              </div>

              {/* Status Filters */}
              <div className="flex items-center gap-2 flex-wrap">
                {['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled', 'Rejected'].map(s => (
                  <button key={s} onClick={() => setBookingFilter(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      bookingFilter === s ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                    }`}>
                    {s} {s !== 'All' ? `(${bookings.filter(b => b.status === s).length})` : `(${bookings.length})`}
                  </button>
                ))}
              </div>

              {bookingsLoading ? (
                <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
                  <RefreshCw className="w-8 h-8 text-gray-300 mx-auto animate-spin mb-3" />
                  <p className="text-sm text-gray-500">Loading bookings...</p>
                </div>
              ) : bookings.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
                  <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-700">No Bookings Yet</h3>
                  <p className="text-sm text-gray-500 mt-2">When customers book your services, they will appear here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {bookings.filter(b => {
                    const matchStatus = bookingFilter === 'All' || b.status === bookingFilter;
                    const search = (bookingSearch || '').toLowerCase();
                    const matchSearch = !search ||
                      (b.reference || '').toLowerCase().includes(search) ||
                      (b.customer_name || '').toLowerCase().includes(search) ||
                      (b.service_name || '').toLowerCase().includes(search) ||
                      (b.category_title || '').toLowerCase().includes(search);
                    return matchStatus && matchSearch;
                  }).map(booking => {
                    const details = typeof booking.details === 'string' ? JSON.parse(booking.details) : (booking.details || {});
                    const statusColor = booking.status === 'Confirmed' ? 'bg-green-100 text-green-700' :
                      booking.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700';
                    const typeIcon = { flights: Plane, hotels: Building2, buses: Bus, wellness: Sparkles, properties: MapPin }[booking.type] || Package;
                    const TypeIcon = typeIcon;

                    return (
                      <div key={booking.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                              <TypeIcon className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-sm font-bold text-gray-900">{booking.service_name || booking.category_title || booking.type}</h4>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusColor}`}>{booking.status}</span>
                              </div>
                              <p className="text-xs text-gray-500 mt-0.5">Ref: {booking.reference}</p>
                              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-600">
                                <span className="flex items-center gap-1"><User className="w-3 h-3" />{booking.customer_name || 'Customer'}</span>
                                {booking.customer_email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{booking.customer_email}</span>}
                                {booking.customer_phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{booking.customer_phone}</span>}
                              </div>
                              <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-gray-500">
                                {booking.travel_date && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{booking.travel_date}</span>}
                                {booking.from_location && booking.to_location && (
                                  <span>{booking.from_location} → {booking.to_location}</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-bold text-gray-900">{formatPrice(booking.total_amount || 0)}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">{new Date(booking.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                          </div>
                        </div>
                        <button onClick={() => setExpandedBooking(expandedBooking === booking.id ? null : booking.id)}
                          className="flex items-center gap-1 px-2 py-1 rounded text-xs text-blue-600 hover:bg-blue-50 mt-2">
                          <Eye className="w-3 h-3" /> {expandedBooking === booking.id ? 'Hide Details' : 'View Details'}
                        </button>
                        {expandedBooking === booking.id && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg text-xs space-y-2 border border-gray-100">
                            {details.passengers && Array.isArray(details.passengers) ? (
                              <div>
                                <strong>Passengers:</strong>
                                <div className="mt-1 space-y-1">
                                  {details.passengers.map((p, i) => (
                                    <div key={i} className="flex items-center gap-2 bg-white px-2 py-1 rounded border border-gray-100">
                                      <span className="font-medium text-gray-800">{p.name || 'Passenger ' + (i+1)}</span>
                                      {p.age && <span className="text-gray-500">Age: {p.age}</span>}
                                      {p.gender && <span className="text-gray-500">{p.gender}</span>}
                                      {p.seat && <span className="text-blue-600 font-medium">Seat: {p.seat}</span>}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : details.passengers ? (
                              <div><strong>Passengers:</strong> {String(details.passengers)}</div>
                            ) : null}
                            {details.guestDetails && (
                              <div><strong>Guest:</strong> {details.guestDetails.name || details.guestDetails.guestName || ''} {details.guestDetails.email ? `(${details.guestDetails.email})` : ''}</div>
                            )}
                            {details.selectedSeats && <div><strong>Seats:</strong> {Array.isArray(details.selectedSeats) ? details.selectedSeats.join(', ') : details.selectedSeats}</div>}
                            {details.roomType && <div><strong>Room:</strong> {details.roomType}</div>}
                            {details.checkInDate && <div><strong>Check-in:</strong> {details.checkInDate}</div>}
                            {details.checkOutDate && <div><strong>Check-out:</strong> {details.checkOutDate}</div>}
                            {details.boardingPoint && <div><strong>Boarding:</strong> {details.boardingPoint}</div>}
                            {details.droppingPoint && <div><strong>Dropping:</strong> {details.droppingPoint}</div>}
                            {details.contactEmail && <div><strong>Email:</strong> {details.contactEmail}</div>}
                            {details.contactPhone && <div><strong>Phone:</strong> {details.contactPhone}</div>}
                            {booking.payment_method && <div><strong>Payment:</strong> {booking.payment_method}</div>}
                            {booking.payment_status && <div><strong>Payment Status:</strong> <span className={`font-medium ${booking.payment_status === 'Completed' ? 'text-green-700' : 'text-amber-700'}`}>{booking.payment_status}</span></div>}
                          </div>
                        )}
                        {booking.status === 'Pending' && (
                          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                            <button onClick={() => updateBookingStatus(booking.id, 'Confirmed')}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-50 text-green-700 hover:bg-green-100 border border-green-200">
                              <CheckCircle className="w-3.5 h-3.5" /> Accept Booking
                            </button>
                            <button onClick={() => {
                              const reason = prompt('Reason for rejection (optional):');
                              updateBookingStatusWithNotes(booking.id, 'Rejected', reason);
                            }}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-700 hover:bg-red-100 border border-red-200">
                              <XCircle className="w-3.5 h-3.5" /> Reject Booking
                            </button>
                          </div>
                        )}
                        {booking.status === 'Confirmed' && (
                          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                            <button onClick={() => updateBookingStatus(booking.id, 'Completed')}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-50 text-green-700 hover:bg-green-100">
                              <CheckCircle className="w-3.5 h-3.5" /> Mark Completed
                            </button>
                            <button onClick={() => updateBookingStatus(booking.id, 'Cancelled')}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-700 hover:bg-red-100">
                              <XCircle className="w-3.5 h-3.5" /> Cancel
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ===== NOTIFICATIONS TAB CONTENT ===== */}
          {activeTab === 'notifications' && providerStatus === 'approved' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">Notifications</h2>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button onClick={markAllNotificationsRead}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-blue-600 hover:bg-blue-50 border border-blue-200">
                      Mark all read
                    </button>
                  )}
                  <button onClick={fetchNotifications}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 border border-gray-200">
                    <RefreshCw className={`w-3.5 h-3.5 ${notificationsLoading ? 'animate-spin' : ''}`} /> Refresh
                  </button>
                </div>
              </div>

              {notificationsLoading ? (
                <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
                  <RefreshCw className="w-8 h-8 text-gray-300 mx-auto animate-spin mb-3" />
                  <p className="text-sm text-gray-500">Loading notifications...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
                  <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-700">No Notifications</h3>
                  <p className="text-sm text-gray-500 mt-2">You'll receive notifications here when customers book your services.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {notifications.map(notif => {
                    const isUnread = !notif.is_read;
                    const iconMap = {
                      new_booking: { icon: ShoppingBag, bg: 'bg-blue-50', color: 'text-blue-600' },
                      booking_update: { icon: RefreshCw, bg: 'bg-amber-50', color: 'text-amber-600' },
                      booking_confirmed: { icon: CheckCircle, bg: 'bg-green-50', color: 'text-green-600' },
                    };
                    const iconConfig = iconMap[notif.type] || { icon: Bell, bg: 'bg-gray-50', color: 'text-gray-600' };
                    const NotifIcon = iconConfig.icon;

                    return (
                      <div key={notif.id}
                        onClick={() => { if (isUnread) markNotificationRead(notif.id); }}
                        className={`bg-white rounded-xl border p-4 cursor-pointer transition hover:shadow-md ${isUnread ? 'border-blue-200 bg-blue-50/30' : 'border-gray-200'}`}>
                        <div className="flex items-start gap-3">
                          <div className={`w-9 h-9 rounded-lg ${iconConfig.bg} flex items-center justify-center shrink-0`}>
                            <NotifIcon className={`w-4.5 h-4.5 ${iconConfig.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className={`text-sm font-bold ${isUnread ? 'text-gray-900' : 'text-gray-600'}`}>{notif.title}</h4>
                              {isUnread && <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />}
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.message}</p>
                            <p className="text-[10px] text-gray-400 mt-1.5">
                              {new Date(notif.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </AuthGuard>
  );
}
