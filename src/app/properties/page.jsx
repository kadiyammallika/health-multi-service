'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import {
  Home,
  MapPin,
  Bed,
  Bath,
  Maximize2,
  Calendar,
  Phone,
  Mail,
  User,
  CheckCircle2,
  Filter,
  ArrowRight,
  ShieldCheck,
  Star,
  Send,
  Building,
  Search,
  X,
  ChevronDown,
  ChevronUp,
  Layers,
  Car,
  Dumbbell,
  Shield,
  Trees,
  Waves,
  Clock,
  IndianRupee,
  SlidersHorizontal,
  Eye,
  Heart,
  Share2,
  Compass,
  Ruler,
  CalendarDays,
  Building2,
  Landmark,
  CircleDot,
} from 'lucide-react';
import { savePropertyEnquiry } from '@/services/storage';
import { useCurrency } from '@/components/ui/CurrencyProvider';
import InlineCurrencySelector from '@/components/ui/InlineCurrencySelector';
import { ALL_CITIES, getCurrencyForCity, getCityLabel, filterCities, COUNTRY_NAMES } from '@/data/cities';
import DataSourceBanner from '@/components/ui/DataSourceBanner';
import { MapPreviewButton, InteractiveMap, MapModal } from '@/components/ui/MapView';

const PROPERTY_IMAGES = ['/images/property-1.jpg', '/images/property-2.jpg', '/images/property-3.jpg', '/images/property-4.jpg', '/images/property-5.jpg'];
const getPropertyImage = (index, prop) => {
  if (prop?.image) return prop.image;
  if (prop?.details?.image) return prop.details.image;
  if (prop?.details?.imageUrl) return prop.details.imageUrl;
  // Use index-based rotation to ensure each card gets a different image
  return PROPERTY_IMAGES[index % PROPERTY_IMAGES.length];
};

/* ── Price Formatter (moved inside component to use useCurrency) ── */

/* ── Amenity Icon Map ── */
const AMENITY_ICONS = {
  Pool: Waves,
  'Swimming Pool': Waves,
  Gym: Dumbbell,
  Gymnasium: Dumbbell,
  Security: Shield,
  'Gated Security': Shield,
  '24/7 Security': Shield,
  Parking: Car,
  'Covered Parking': Car,
  Garden: Trees,
  Park: Trees,
  Clubhouse: Building2,
  'Power Backup': CircleDot,
};

function getAmenityIcon(amenity) {
  if (!amenity) return CheckCircle2;
  for (const [key, Icon] of Object.entries(AMENITY_ICONS)) {
    if (amenity.toLowerCase().includes(key.toLowerCase())) return Icon;
  }
  return CheckCircle2;
}

/* ── Property Type Options ── */
const PROPERTY_TYPES = ['Apartment', 'Villa', 'Plot', 'Independent House', 'Penthouse', 'Farmhouse'];
const BHK_OPTIONS = [1, 2, 3, 4, '5+'];
const FURNISHING_OPTIONS = ['Furnished', 'Semi-Furnished', 'Unfurnished'];
const POSSESSION_OPTIONS = ['Ready to Move', 'Under Construction'];

/* ── Budget Presets (in Lakhs for Buy, actual for Rent) ── */
const BUDGET_BUY = [
  { label: 'Any', min: 0, max: Infinity },
  { label: 'Under 50 L', min: 0, max: 5000000 },
  { label: '50 L - 1 Cr', min: 5000000, max: 10000000 },
  { label: '1 Cr - 2 Cr', min: 10000000, max: 20000000 },
  { label: '2 Cr - 5 Cr', min: 20000000, max: 50000000 },
  { label: '5 Cr+', min: 50000000, max: Infinity },
];
const BUDGET_RENT = [
  { label: 'Any', min: 0, max: Infinity },
  { label: 'Under 15K', min: 0, max: 15000 },
  { label: '15K - 30K', min: 15000, max: 30000 },
  { label: '30K - 50K', min: 30000, max: 50000 },
  { label: '50K - 1L', min: 50000, max: 100000 },
  { label: '1 L+', min: 100000, max: Infinity },
];

export default function PropertiesPage() {
  /* ── State: Filters ── */
  const [purpose, setPurpose] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedType, setSelectedType] = useState('All Types');
  const [selectedBedrooms, setSelectedBedrooms] = useState('all');
  const [budgetRange, setBudgetRange] = useState({ min: 0, max: Infinity });
  const [selectedFurnishing, setSelectedFurnishing] = useState('all');
  const [selectedPossession, setSelectedPossession] = useState('all');
  const [minArea, setMinArea] = useState('');
  const [maxArea, setMaxArea] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const cityRef = useRef(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  /* ── State: Enquiry Modal ── */
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);
  const [enquiryType, setEnquiryType] = useState('Site Visit & Inspection Request');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('alex.morgan@example.com');
  const [clientPhone, setClientPhone] = useState('+91 98765 43210');
  const [preferredDate, setPreferredDate] = useState('2026-11-25');
  const [preferredTime, setPreferredTime] = useState('Morning (10:00 AM - 12:00 PM)');
  const [message, setMessage] = useState('Interested in viewing the floor plans and scheduling an on-site visit with our family.');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedEnquiry, setSubmittedEnquiry] = useState(null);

  /* ── State: Expanded Card ── */
  const [expandedId, setExpandedId] = useState(null);

  /* ── State: Map Modal ── */
  const [mapProperty, setMapProperty] = useState(null);
  const [isMapOpen, setIsMapOpen] = useState(false);

  /* ── State: Data from API ── */
  const [properties, setProperties] = useState([]);
  const [propertyTypes, setPropertyTypes] = useState(['All Types']);
  const [dataSource, setDataSource] = useState('provider');

  /* ── Currency ── */
  const { formatPrice, setCurrency } = useCurrency();

  // Reset currency to INR when leaving this page
  useEffect(() => {
    return () => setCurrency('INR');
  }, [setCurrency]);

  // Click-outside handler for dropdowns
  useEffect(() => {
    function handleClickOutside(e) {
      if (cityRef.current && !cityRef.current.contains(e.target)) setShowCityDropdown(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCitySelect = (city) => {
    setSelectedCity(city.name);
    setCitySearch(city.country === 'IN' ? city.name : `${city.name}, ${COUNTRY_NAMES[city.country] || city.country}`);
    setShowCityDropdown(false);
    const newCurrency = getCurrencyForCity(city.name);
    setCurrency(newCurrency);
  };

  const getFilteredCities = (searchText) => {
    if (!searchText || searchText.length < 1) return ALL_CITIES.slice(0, 15);
    return filterCities(searchText).slice(0, 12);
  };

  const formatIndianPrice = (num, isRental) => {
    if (!num) return formatPrice(0);
    return formatPrice(num) + (isRental ? '/month' : '');
  };

  const formatPricePerSqFt = (price, area) => {
    if (!price || !area) return '';
    const ppsf = Math.round(price / area);
    return `${formatPrice(ppsf)}/sq ft`;
  };

  useEffect(() => {
    async function fetchProperties() {
      try {
        const res = await fetch('/api/properties');
        const data = await res.json();
        if (data.success) {
          setProperties(data.properties || []);
          if (data.types?.length > 0) setPropertyTypes(['All Types', ...data.types]);
          setDataSource(data.source || 'provider');
        }
      } catch (err) {
        console.log('Failed to fetch properties from API');
        setProperties([]);
      }
    }
    fetchProperties();
  }, []);

  /* ── Derived: Unique locations ── */
  const locations = useMemo(() => {
    const locs = [...new Set(properties.map((p) => p.location).filter(Boolean))];
    return locs.sort();
  }, [properties]);

  /* ── Filter Logic ── */
  const filteredProperties = useMemo(() => {
    return properties.filter((p) => {
      const purposeMatch = purpose === 'all' || p.purpose === purpose;
      const typeMatch = selectedType === 'All Types' || p.type === selectedType;
      const bedMatch = selectedBedrooms === 'all' || (selectedBedrooms === '5+' ? (p.bedrooms || 0) >= 5 : p.bedrooms === Number(selectedBedrooms));
      const locationMatch = !selectedLocation || p.location?.toLowerCase().includes(selectedLocation.toLowerCase());
      const cityMatch = !selectedCity || p.location?.toLowerCase().includes(selectedCity.toLowerCase());

      // Budget filter
      const price = typeof p.price === 'string' ? parseFloat(p.price.replace(/[^0-9.]/g, '')) : (p.price || 0);
      const budgetMatch = budgetRange.min === 0 && budgetRange.max === Infinity ? true : (price >= budgetRange.min && price <= budgetRange.max);

      // Furnishing filter
      const furnishMatch = selectedFurnishing === 'all' || (p.furnishing || '').toLowerCase().includes(selectedFurnishing.toLowerCase());

      // Possession filter
      const possessionMatch = selectedPossession === 'all' || (p.possession || p.status || '').toLowerCase().includes(selectedPossession.toLowerCase().split(' ')[0]);

      // Area filter
      const area = typeof p.area === 'string' ? parseFloat(p.area) : (p.area || 0);
      const minAreaMatch = !minArea || area >= Number(minArea);
      const maxAreaMatch = !maxArea || area <= Number(maxArea);

      return purposeMatch && typeMatch && bedMatch && locationMatch && cityMatch && budgetMatch && furnishMatch && possessionMatch && minAreaMatch && maxAreaMatch;
    });
  }, [properties, purpose, selectedType, selectedBedrooms, selectedLocation, selectedCity, budgetRange, selectedFurnishing, selectedPossession, minArea, maxArea]);

  /* ── Handlers ── */
  const handleOpenEnquiry = (property) => {
    setSelectedProperty(property);
    setSubmittedEnquiry(null);
    setIsEnquiryModalOpen(true);
  };

  const handleEnquirySubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newEnquiry = await savePropertyEnquiry({
      propertyId: selectedProperty.id,
      propertyTitle: selectedProperty.title,
      propertyLocation: selectedProperty.location,
      purpose: selectedProperty.purpose,
      priceDisplay: selectedProperty.priceDisplay,
      clientName,
      clientEmail,
      clientPhone,
      enquiryType,
      preferredDate,
      preferredTime,
      message,
      agentEmail: selectedProperty.agent?.email || '',
      agentName: selectedProperty.agent?.name || '',
    });

    setIsSubmitting(false);
    setSubmittedEnquiry(newEnquiry);
  };

  const clearAllFilters = () => {
    setPurpose('all');
    setSelectedLocation('');
    setSelectedType('All Types');
    setSelectedBedrooms('all');
    setBudgetRange({ min: 0, max: Infinity });
    setSelectedFurnishing('all');
    setSelectedPossession('all');
    setMinArea('');
    setMaxArea('');
    setSelectedCity(''); setCitySearch(''); setCurrency('INR');
  };

  const budgetOptions = purpose === 'rent' ? BUDGET_RENT : BUDGET_BUY;

  /* ══════════════════════════════════════════════════════════
     RENDER
     ══════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-[#fafafa]">

      {/* ═══════════════════════════════════════════════════════
          TOP SEARCH BAR — 99acres-style red gradient header
          ═══════════════════════════════════════════════════════ */}
      <div className="bg-gradient-to-r from-[#b71c1c] to-[#c62828] shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
          {/* Brand Line */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Home className="w-6 h-6 text-white/90" />
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">OneConnect Properties</h1>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-white/70 font-medium">
              <ShieldCheck className="w-4 h-4" />
              Verified Listings Only
            </span>
          </div>

          {/* Purpose Tabs */}
          <div className="flex items-center gap-1">
            {[
              { key: 'all', label: 'All' },
              { key: 'buy', label: 'Buy' },
              { key: 'rent', label: 'Rent' },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setPurpose(tab.key)}
                className={`px-5 py-2 rounded-t-lg text-sm font-semibold transition-colors ${
                  purpose === tab.key
                    ? 'bg-white text-[#b71c1c]'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Currency selector - in dark header like flights */}
          <div className="flex justify-end mb-3">
            <InlineCurrencySelector variant="dark" />
          </div>

          {/* Search Row */}
          <div className="bg-white rounded-lg shadow-md flex flex-col sm:flex-row items-stretch">
            {/* City / Destination */}
            <div className="flex items-center gap-2 px-4 py-3 border-b sm:border-b-0 sm:border-r border-gray-200 flex-1 relative" ref={cityRef}>
              <MapPin className="w-4 h-4 text-[#b71c1c] shrink-0" />
              <input
                type="text"
                placeholder="Search city / destination..."
                value={citySearch}
                onChange={(e) => { setCitySearch(e.target.value); setShowCityDropdown(true); }}
                onFocus={() => { setShowCityDropdown(true); setCitySearch(''); setSelectedCity(''); setCurrency('INR'); }}
                className="w-full text-sm text-gray-800 font-semibold placeholder-gray-400 focus:outline-none bg-transparent"
              />
              {showCityDropdown && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-64 overflow-y-auto z-50">
                  {getFilteredCities(citySearch).map(c => (
                    <button key={`${c.name}-${c.country}`} onClick={() => handleCitySelect(c)}
                      className={`w-full text-left px-3 py-2.5 hover:bg-red-50 flex justify-between items-center border-b border-gray-50 last:border-0 ${c.name === selectedCity ? 'bg-red-50' : ''}`}>
                      <span className="text-sm font-semibold text-gray-900">{c.name}</span>
                      <span className="text-[11px] text-gray-400">{c.country === 'IN' ? c.state : (COUNTRY_NAMES[c.country] || c.country)}</span>
                    </button>
                  ))}
                  {getFilteredCities(citySearch).length === 0 && (
                    <div className="px-4 py-3 text-sm text-gray-400">No cities found</div>
                  )}
                </div>
              )}
            </div>

            {/* Property Type */}
            <div className="flex items-center gap-2 px-4 py-3 border-b sm:border-b-0 sm:border-r border-gray-200 min-w-[160px]">
              <Building className="w-4 h-4 text-gray-400 shrink-0" />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full text-sm text-gray-800 focus:outline-none bg-transparent appearance-none cursor-pointer"
              >
                {propertyTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Budget */}
            <div className="flex items-center gap-2 px-4 py-3 border-b sm:border-b-0 sm:border-r border-gray-200 min-w-[150px]">
              <IndianRupee className="w-4 h-4 text-gray-400 shrink-0" />
              <select
                value={JSON.stringify(budgetRange)}
                onChange={(e) => setBudgetRange(JSON.parse(e.target.value))}
                className="w-full text-sm text-gray-800 focus:outline-none bg-transparent appearance-none cursor-pointer"
              >
                {budgetOptions.map((b, i) => (
                  <option key={i} value={JSON.stringify({ min: b.min, max: b.max })}>{b.label}</option>
                ))}
              </select>
            </div>

            {/* BHK */}
            <div className="flex items-center gap-2 px-4 py-3 border-b sm:border-b-0 sm:border-r border-gray-200 min-w-[120px]">
              <Bed className="w-4 h-4 text-gray-400 shrink-0" />
              <select
                value={selectedBedrooms}
                onChange={(e) => setSelectedBedrooms(e.target.value)}
                className="w-full text-sm text-gray-800 focus:outline-none bg-transparent appearance-none cursor-pointer"
              >
                <option value="all">BHK</option>
                {BHK_OPTIONS.map((b) => (
                  <option key={b} value={b}>{b} BHK</option>
                ))}
              </select>
            </div>

            {/* Search Button */}
            <button
              type="button"
              onClick={() => {}}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-[#c62828] hover:bg-[#b71c1c] text-white font-bold text-sm transition-colors sm:rounded-r-lg"
            >
              <Search className="w-4 h-4" />
              <span>Search</span>
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          MAIN CONTENT — Sidebar + Listings
          ═══════════════════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Results Count + Mobile Filter Toggle */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-600">
            <span className="font-bold text-gray-900">{filteredProperties.length}</span> properties found
            {purpose !== 'all' && <span className="text-[#b71c1c] font-semibold"> for {purpose === 'buy' ? 'Sale' : 'Rent'}</span>}
            {selectedCity && <span> in &quot;{selectedCity}&quot;</span>}
          </p>
          <button
            type="button"
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="lg:hidden flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>
        </div>

        <div className="flex gap-6">

          {/* ─── LEFT SIDEBAR FILTERS ─── */}
          <aside className={`${showMobileFilters ? 'fixed inset-0 z-40 bg-white overflow-y-auto p-4 lg:relative lg:inset-auto lg:z-auto lg:p-0' : 'hidden'} lg:block w-full lg:w-[280px] shrink-0`}>
            {/* Mobile close */}
            <div className="flex items-center justify-between mb-4 lg:hidden">
              <h3 className="font-bold text-lg text-gray-900">Filters</h3>
              <button onClick={() => setShowMobileFilters(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm divide-y divide-gray-100">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3">
                <h3 className="font-bold text-sm text-gray-900">Filters</h3>
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="text-xs text-[#c62828] font-semibold hover:underline"
                >
                  Clear All
                </button>
              </div>

              {/* Purpose Toggle */}
              <div className="px-4 py-3">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Purpose</h4>
                <div className="flex rounded-lg overflow-hidden border border-gray-200">
                  {['all', 'buy', 'rent'].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPurpose(p)}
                      className={`flex-1 py-2 text-xs font-semibold transition-colors ${
                        purpose === p
                          ? 'bg-[#c62828] text-white'
                          : 'bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {p === 'all' ? 'All' : p === 'buy' ? 'Buy' : 'Rent'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Budget Range */}
              <div className="px-4 py-3">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Budget</h4>
                <div className="grid grid-cols-2 gap-1.5">
                  {budgetOptions.map((b, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setBudgetRange({ min: b.min, max: b.max })}
                      className={`py-1.5 px-2 rounded-md text-xs font-medium transition-colors border ${
                        budgetRange.min === b.min && budgetRange.max === b.max
                          ? 'bg-red-50 text-[#c62828] border-[#c62828]'
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* BHK */}
              <div className="px-4 py-3">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">BHK</h4>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedBedrooms('all')}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                      selectedBedrooms === 'all'
                        ? 'bg-red-50 text-[#c62828] border-[#c62828]'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    Any
                  </button>
                  {BHK_OPTIONS.map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setSelectedBedrooms(String(b))}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                        selectedBedrooms === String(b)
                          ? 'bg-red-50 text-[#c62828] border-[#c62828]'
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              {/* Property Type */}
              <div className="px-4 py-3">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Property Type</h4>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="propType"
                      checked={selectedType === 'All Types'}
                      onChange={() => setSelectedType('All Types')}
                      className="w-3.5 h-3.5 text-[#c62828] focus:ring-[#c62828] accent-[#c62828]"
                    />
                    <span className="text-xs text-gray-700">All Types</span>
                  </label>
                  {PROPERTY_TYPES.map((pt) => (
                    <label key={pt} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="propType"
                        checked={selectedType === pt}
                        onChange={() => setSelectedType(pt)}
                        className="w-3.5 h-3.5 text-[#c62828] focus:ring-[#c62828] accent-[#c62828]"
                      />
                      <span className="text-xs text-gray-700">{pt}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Furnishing */}
              <div className="px-4 py-3">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Furnishing</h4>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="furnishing"
                      checked={selectedFurnishing === 'all'}
                      onChange={() => setSelectedFurnishing('all')}
                      className="w-3.5 h-3.5 accent-[#c62828]"
                    />
                    <span className="text-xs text-gray-700">Any</span>
                  </label>
                  {FURNISHING_OPTIONS.map((f) => (
                    <label key={f} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="furnishing"
                        checked={selectedFurnishing === f}
                        onChange={() => setSelectedFurnishing(f)}
                        className="w-3.5 h-3.5 accent-[#c62828]"
                      />
                      <span className="text-xs text-gray-700">{f}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Possession */}
              <div className="px-4 py-3">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Possession Status</h4>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="possession"
                      checked={selectedPossession === 'all'}
                      onChange={() => setSelectedPossession('all')}
                      className="w-3.5 h-3.5 accent-[#c62828]"
                    />
                    <span className="text-xs text-gray-700">Any</span>
                  </label>
                  {POSSESSION_OPTIONS.map((po) => (
                    <label key={po} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="possession"
                        checked={selectedPossession === po}
                        onChange={() => setSelectedPossession(po)}
                        className="w-3.5 h-3.5 accent-[#c62828]"
                      />
                      <span className="text-xs text-gray-700">{po}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Area Range */}
              <div className="px-4 py-3">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Area (sq ft)</h4>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minArea}
                    onChange={(e) => setMinArea(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-md border border-gray-200 text-xs text-gray-700 focus:outline-none focus:border-[#c62828] bg-gray-50"
                  />
                  <span className="text-gray-400 text-xs">to</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxArea}
                    onChange={(e) => setMaxArea(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-md border border-gray-200 text-xs text-gray-700 focus:outline-none focus:border-[#c62828] bg-gray-50"
                  />
                </div>
              </div>

              {/* Apply (mobile) */}
              <div className="px-4 py-3 lg:hidden">
                <button
                  type="button"
                  onClick={() => setShowMobileFilters(false)}
                  className="w-full py-2.5 rounded-lg bg-[#c62828] text-white font-bold text-sm"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </aside>

          {/* ─── PROPERTY CARDS GRID ─── */}
          <main className="flex-1 min-w-0">
            {/* Data Sources Banner */}
            <DataSourceBanner
              sources={['supabase', 'oneconnect', 'unsplash']}
              counts={{ total: filteredProperties.length }}
            />

            {filteredProperties.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
                <Building className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="font-bold text-gray-700 text-lg mb-1">No properties available</h3>
                <p className="text-sm text-gray-500 mb-4">
                  {properties.length === 0
                    ? 'No providers have listed properties yet. Check back soon!'
                    : 'Try adjusting your filters or search criteria.'}
                </p>
                {properties.length > 0 && (
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="px-4 py-2 bg-[#c62828] text-white rounded-lg text-sm font-semibold hover:bg-[#b71c1c] transition-colors"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredProperties.map((prop, propIndex) => {
                  const isExpanded = expandedId === prop.id;
                  const priceNum = typeof prop.price === 'string' ? parseFloat(prop.price.replace(/[^0-9.]/g, '')) : prop.price;
                  const displayPrice = prop.priceDisplay || formatIndianPrice(priceNum, prop.purpose === 'rent');
                  const pricePerSqFt = prop.purpose !== 'rent' ? formatPricePerSqFt(priceNum, prop.area) : null;

                  return (
                    <div
                      key={prop.id}
                      className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                    >
                      <div className="flex flex-col md:flex-row">
                        {/* ── Image Section ── */}
                        <div className="relative w-full md:w-[300px] h-56 md:h-auto shrink-0">
                          <img
                            src={getPropertyImage(propIndex, prop)}
                            alt={prop.title}
                            className="w-full h-full object-cover"
                          />

                          {/* Badge Overlays */}
                          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wide shadow-sm ${
                              prop.purpose === 'buy'
                                ? 'bg-[#1565c0] text-white'
                                : 'bg-emerald-600 text-white'
                            }`}>
                              {prop.purpose === 'buy' ? 'FOR SALE' : 'FOR RENT'}
                            </span>
                            {prop.premium && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wide bg-amber-500 text-white shadow-sm">
                                <Star className="w-3 h-3" /> PREMIUM
                              </span>
                            )}
                            {prop.verified !== false && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wide bg-[#1565c0] text-white shadow-sm">
                                <ShieldCheck className="w-3 h-3" /> VERIFIED
                              </span>
                            )}
                          </div>

                          {/* Wishlist / Share */}
                          <div className="absolute top-3 right-3 flex flex-col gap-1.5">
                            <button type="button" className="p-1.5 bg-white/90 rounded-full shadow hover:bg-white transition">
                              <Heart className="w-4 h-4 text-gray-500" />
                            </button>
                            <button type="button" className="p-1.5 bg-white/90 rounded-full shadow hover:bg-white transition">
                              <Share2 className="w-4 h-4 text-gray-500" />
                            </button>
                          </div>
                        </div>

                        {/* ── Details Section ── */}
                        <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between min-w-0">
                          {/* Title + Location */}
                          <div>
                            <h3 className="font-bold text-gray-900 text-base sm:text-lg leading-snug line-clamp-1">{prop.title}</h3>
                            <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                              <MapPin className="w-3.5 h-3.5 text-[#c62828] shrink-0" />
                              <span className="truncate">{prop.location}</span>
                              <button
                                onClick={(e) => { e.stopPropagation(); setMapProperty(prop); setIsMapOpen(true); }}
                                className="ml-1 text-blue-600 font-semibold text-xs hover:underline shrink-0"
                              >
                                Show on map
                              </button>
                            </div>
                          </div>

                          {/* Specs Row */}
                          <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-3 text-sm text-gray-700">
                            {prop.bedrooms && (
                              <span className="flex items-center gap-1">
                                <Bed className="w-4 h-4 text-gray-400" />
                                <strong>{prop.bedrooms}</strong> BHK
                              </span>
                            )}
                            {prop.bathrooms && (
                              <span className="flex items-center gap-1">
                                <Bath className="w-4 h-4 text-gray-400" />
                                <strong>{prop.bathrooms}</strong> Bath
                              </span>
                            )}
                            {prop.area && (
                              <span className="flex items-center gap-1">
                                <Maximize2 className="w-4 h-4 text-gray-400" />
                                <strong>{prop.area}</strong> sq ft
                              </span>
                            )}
                            {prop.floor && (
                              <span className="flex items-center gap-1">
                                <Layers className="w-4 h-4 text-gray-400" />
                                Floor <strong>{prop.floor}</strong>
                              </span>
                            )}
                          </div>

                          {/* Price */}
                          <div className="mt-3">
                            <span className="text-xl sm:text-2xl font-extrabold text-gray-900">{displayPrice}</span>
                            {pricePerSqFt && (
                              <span className="ml-2 text-xs text-gray-500 font-medium">({pricePerSqFt})</span>
                            )}
                            {prop.purpose === 'rent' && prop.deposit && (
                              <div className="text-xs text-gray-500 mt-0.5">
                                Deposit: <span className="font-semibold text-gray-700">{prop.deposit}</span>
                              </div>
                            )}
                          </div>

                          {/* Amenities Icons */}
                          {Array.isArray(prop.amenities) && prop.amenities.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {prop.amenities.slice(0, 5).map((amen, idx) => {
                                const AmenIcon = getAmenityIcon(amen);
                                return (
                                  <span
                                    key={idx}
                                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-50 border border-gray-100 text-[11px] text-gray-600 font-medium"
                                    title={amen}
                                  >
                                    <AmenIcon className="w-3 h-3 text-gray-400" />
                                    {amen}
                                  </span>
                                );
                              })}
                              {prop.amenities.length > 5 && (
                                <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-50 border border-gray-100 text-[11px] text-gray-500 font-medium">
                                  +{prop.amenities.length - 5} more
                                </span>
                              )}
                            </div>
                          )}

                          {/* Agent Strip */}
                          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 gap-3">
                            <div className="flex items-center gap-2.5 min-w-0">
                              {prop.agent?.avatar ? (
                                <img
                                  src={prop.agent.avatar}
                                  alt={prop.agent.name}
                                  className="w-9 h-9 rounded-full object-cover border border-gray-200 shrink-0"
                                />
                              ) : (
                                <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                                  <User className="w-4 h-4 text-gray-400" />
                                </div>
                              )}
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-gray-800 truncate flex items-center gap-1">
                                  {prop.agent?.name || 'Agent'}
                                  <ShieldCheck className="w-3 h-3 text-[#1565c0] shrink-0" />
                                </div>
                                <div className="text-[11px] text-gray-400 truncate">{prop.agent?.company || 'Verified Partner'}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleOpenEnquiry(prop)}
                                className="px-3.5 py-2 rounded-lg bg-[#c62828] hover:bg-[#b71c1c] text-white font-semibold text-xs shadow transition-colors flex items-center gap-1.5"
                              >
                                <Phone className="w-3.5 h-3.5" />
                                Contact Agent
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenEnquiry(prop)}
                                className="px-3.5 py-2 rounded-lg bg-white border border-[#c62828] text-[#c62828] font-semibold text-xs hover:bg-red-50 transition-colors flex items-center gap-1.5"
                              >
                                <Calendar className="w-3.5 h-3.5" />
                                Schedule Visit
                              </button>
                            </div>
                          </div>

                          {/* Expand / Collapse */}
                          <button
                            type="button"
                            onClick={() => setExpandedId(isExpanded ? null : prop.id)}
                            className="mt-3 flex items-center gap-1 text-xs text-[#c62828] font-semibold hover:underline"
                          >
                            {isExpanded ? (
                              <>
                                <ChevronUp className="w-3.5 h-3.5" />
                                Hide Details
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-3.5 h-3.5" />
                                View Full Details
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* ── Expanded Detail Section ── */}
                      {isExpanded && (
                        <div className="border-t border-gray-100 bg-gray-50 px-5 py-5 space-y-5">
                          {/* Description */}
                          {prop.description && (
                            <div>
                              <h4 className="text-sm font-bold text-gray-800 mb-1">Description</h4>
                              <p className="text-sm text-gray-600 leading-relaxed">{prop.description}</p>
                            </div>
                          )}

                          {/* Property Highlights Grid */}
                          <div>
                            <h4 className="text-sm font-bold text-gray-800 mb-2">Property Highlights</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                              {prop.type && (
                                <div className="flex items-center gap-2 bg-white rounded-lg p-2.5 border border-gray-100">
                                  <Building className="w-4 h-4 text-[#c62828]" />
                                  <div>
                                    <div className="text-[10px] text-gray-400 uppercase font-semibold">Type</div>
                                    <div className="text-xs font-bold text-gray-800">{prop.type}</div>
                                  </div>
                                </div>
                              )}
                              {prop.bedrooms && (
                                <div className="flex items-center gap-2 bg-white rounded-lg p-2.5 border border-gray-100">
                                  <Bed className="w-4 h-4 text-[#c62828]" />
                                  <div>
                                    <div className="text-[10px] text-gray-400 uppercase font-semibold">Bedrooms</div>
                                    <div className="text-xs font-bold text-gray-800">{prop.bedrooms} BHK</div>
                                  </div>
                                </div>
                              )}
                              {prop.bathrooms && (
                                <div className="flex items-center gap-2 bg-white rounded-lg p-2.5 border border-gray-100">
                                  <Bath className="w-4 h-4 text-[#c62828]" />
                                  <div>
                                    <div className="text-[10px] text-gray-400 uppercase font-semibold">Bathrooms</div>
                                    <div className="text-xs font-bold text-gray-800">{prop.bathrooms}</div>
                                  </div>
                                </div>
                              )}
                              {prop.area && (
                                <div className="flex items-center gap-2 bg-white rounded-lg p-2.5 border border-gray-100">
                                  <Ruler className="w-4 h-4 text-[#c62828]" />
                                  <div>
                                    <div className="text-[10px] text-gray-400 uppercase font-semibold">Carpet Area</div>
                                    <div className="text-xs font-bold text-gray-800">{prop.area} sq ft</div>
                                  </div>
                                </div>
                              )}
                              {prop.facing && (
                                <div className="flex items-center gap-2 bg-white rounded-lg p-2.5 border border-gray-100">
                                  <Compass className="w-4 h-4 text-[#c62828]" />
                                  <div>
                                    <div className="text-[10px] text-gray-400 uppercase font-semibold">Facing</div>
                                    <div className="text-xs font-bold text-gray-800">{prop.facing}</div>
                                  </div>
                                </div>
                              )}
                              {prop.floor && (
                                <div className="flex items-center gap-2 bg-white rounded-lg p-2.5 border border-gray-100">
                                  <Layers className="w-4 h-4 text-[#c62828]" />
                                  <div>
                                    <div className="text-[10px] text-gray-400 uppercase font-semibold">Floor</div>
                                    <div className="text-xs font-bold text-gray-800">{prop.floor}</div>
                                  </div>
                                </div>
                              )}
                              {(prop.furnishing || prop.furnishingStatus) && (
                                <div className="flex items-center gap-2 bg-white rounded-lg p-2.5 border border-gray-100">
                                  <Home className="w-4 h-4 text-[#c62828]" />
                                  <div>
                                    <div className="text-[10px] text-gray-400 uppercase font-semibold">Furnishing</div>
                                    <div className="text-xs font-bold text-gray-800">{prop.furnishing || prop.furnishingStatus}</div>
                                  </div>
                                </div>
                              )}
                              {(prop.age || prop.propertyAge) && (
                                <div className="flex items-center gap-2 bg-white rounded-lg p-2.5 border border-gray-100">
                                  <CalendarDays className="w-4 h-4 text-[#c62828]" />
                                  <div>
                                    <div className="text-[10px] text-gray-400 uppercase font-semibold">Property Age</div>
                                    <div className="text-xs font-bold text-gray-800">{prop.age || prop.propertyAge}</div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* All Amenities */}
                          {Array.isArray(prop.amenities) && prop.amenities.length > 0 && (
                            <div>
                              <h4 className="text-sm font-bold text-gray-800 mb-2">Amenities</h4>
                              <div className="flex flex-wrap gap-2">
                                {prop.amenities.map((amen, idx) => {
                                  const AmenIcon = getAmenityIcon(amen);
                                  return (
                                    <span
                                      key={idx}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs text-gray-700 font-medium"
                                    >
                                      <AmenIcon className="w-3.5 h-3.5 text-[#c62828]" />
                                      {amen}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Location Map */}
                          <div>
                            <h4 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-1.5">
                              <MapPin className="w-4 h-4 text-[#c62828]" />
                              Location Map
                            </h4>
                            <InteractiveMap
                              item={prop}
                              items={filteredProperties.filter(p => p.city === prop.city && p.id !== prop.id).slice(0, 5)}
                              height="280px"
                              zoom={14}
                              formatPrice={formatPrice}
                            />
                          </div>

                          {/* Agent Details */}
                          {prop.agent && (
                            <div>
                              <h4 className="text-sm font-bold text-gray-800 mb-2">Agent Details</h4>
                              <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-4">
                                {prop.agent.avatar ? (
                                  <img
                                    src={prop.agent.avatar}
                                    alt={prop.agent.name}
                                    className="w-14 h-14 rounded-full object-cover border-2 border-gray-200 shrink-0"
                                  />
                                ) : (
                                  <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                                    <User className="w-6 h-6 text-gray-400" />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="font-bold text-sm text-gray-900 flex items-center gap-1">
                                    {prop.agent.name}
                                    <ShieldCheck className="w-4 h-4 text-[#1565c0]" />
                                  </div>
                                  <div className="text-xs text-gray-500 mt-0.5">{prop.agent.company || 'Verified Realty Partner'}</div>
                                  {prop.agent.phone && (
                                    <div className="flex items-center gap-1 mt-1 text-xs text-gray-600">
                                      <Phone className="w-3 h-3 text-gray-400" />
                                      {prop.agent.phone}
                                    </div>
                                  )}
                                  {prop.agent.email && (
                                    <div className="flex items-center gap-1 mt-0.5 text-xs text-gray-600">
                                      <Mail className="w-3 h-3 text-gray-400" />
                                      {prop.agent.email}
                                    </div>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleOpenEnquiry(prop)}
                                  className="px-4 py-2.5 rounded-lg bg-[#c62828] hover:bg-[#b71c1c] text-white font-semibold text-xs shadow transition-colors shrink-0"
                                >
                                  Send Enquiry
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          ENQUIRY MODAL
          ═══════════════════════════════════════════════════════ */}
      {isEnquiryModalOpen && selectedProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">

            {/* Modal Header — Property Info */}
            <div className="bg-gradient-to-r from-[#b71c1c] to-[#c62828] px-5 py-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 bg-white/15 rounded-lg shrink-0">
                    <Home className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-base truncate">{selectedProperty.title}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-white/80 mt-0.5">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{selectedProperty.location}</span>
                      <span className="mx-1">|</span>
                      <span className="font-semibold text-white">{selectedProperty.priceDisplay || formatIndianPrice(selectedProperty.price, selectedProperty.purpose === 'rent')}</span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEnquiryModalOpen(false)}
                  className="p-1 hover:bg-white/20 rounded-lg transition-colors shrink-0 ml-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5">
              {submittedEnquiry ? (
                /* ── Success State ── */
                <div className="text-center py-6 space-y-4">
                  <div className="w-16 h-16 mx-auto bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>
                  <div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Enquiry Submitted
                    </span>
                    <h3 className="text-lg font-bold text-gray-900 mt-3">Reference: {submittedEnquiry.id}</h3>
                    <p className="text-sm text-gray-600 max-w-sm mx-auto mt-1">
                      Your request has been sent to <strong>{selectedProperty.agent?.name}</strong>. Track this enquiry in your Customer Dashboard.
                    </p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-sm text-left space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Property</span>
                      <span className="font-semibold text-gray-800">{submittedEnquiry.propertyTitle}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Date</span>
                      <span className="font-semibold text-gray-800">{submittedEnquiry.preferredDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Time</span>
                      <span className="font-semibold text-gray-800">{submittedEnquiry.preferredTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Contact</span>
                      <span className="font-semibold text-gray-800">{submittedEnquiry.clientName}</span>
                    </div>
                  </div>

                  <div className="flex justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEnquiryModalOpen(false)}
                      className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors"
                    >
                      Close
                    </button>
                    <Link
                      href="/dashboard/customer"
                      className="px-5 py-2.5 rounded-lg bg-[#c62828] hover:bg-[#b71c1c] text-white text-sm font-semibold shadow transition-colors"
                    >
                      View in Dashboard
                    </Link>
                  </div>
                </div>
              ) : (
                /* ── Enquiry Form ── */
                <form onSubmit={handleEnquirySubmit} className="space-y-4">
                  {/* Enquiry Type */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Enquiry Type</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setEnquiryType('Site Visit & Inspection Request')}
                        className={`p-3 rounded-lg text-sm font-semibold border-2 transition text-center flex flex-col items-center gap-1 ${
                          enquiryType.includes('Site Visit')
                            ? 'bg-red-50 text-[#c62828] border-[#c62828]'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Calendar className="w-5 h-5" />
                        Site Visit
                      </button>
                      <button
                        type="button"
                        onClick={() => setEnquiryType('Callback & Price Negotiation')}
                        className={`p-3 rounded-lg text-sm font-semibold border-2 transition text-center flex flex-col items-center gap-1 ${
                          enquiryType.includes('Callback')
                            ? 'bg-red-50 text-[#c62828] border-[#c62828]'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Phone className="w-5 h-5" />
                        Request Callback
                      </button>
                    </div>
                  </div>

                  {/* Date & Time */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Preferred Date</label>
                      <input
                        type="date"
                        value={preferredDate}
                        onChange={(e) => setPreferredDate(e.target.value)}
                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-[#c62828] focus:ring-1 focus:ring-[#c62828]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Preferred Time</label>
                      <select
                        value={preferredTime}
                        onChange={(e) => setPreferredTime(e.target.value)}
                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-[#c62828] focus:ring-1 focus:ring-[#c62828]"
                      >
                        <option>Morning (10:00 AM - 12:00 PM)</option>
                        <option>Afternoon (02:00 PM - 04:00 PM)</option>
                        <option>Evening (04:30 PM - 06:30 PM)</option>
                      </select>
                    </div>
                  </div>

                  {/* Client Details */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Your Details</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            value={clientName}
                            onChange={(e) => setClientName(e.target.value)}
                            className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-[#c62828] focus:ring-1 focus:ring-[#c62828]"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Mobile Number</label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            value={clientPhone}
                            onChange={(e) => setClientPhone(e.target.value)}
                            className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-[#c62828] focus:ring-1 focus:ring-[#c62828]"
                            required
                          />
                        </div>
                      </div>
                    </div>
                    <div className="mt-3">
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="email"
                          value={clientEmail}
                          onChange={(e) => setClientEmail(e.target.value)}
                          className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-[#c62828] focus:ring-1 focus:ring-[#c62828]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Message / Questions</label>
                    <textarea
                      rows={3}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-[#c62828] focus:ring-1 focus:ring-[#c62828] resize-none"
                      placeholder="Any specific questions about the property..."
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsEnquiryModalOpen(false)}
                      className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 px-4 py-2.5 rounded-lg bg-[#c62828] hover:bg-[#b71c1c] text-white text-sm font-bold shadow transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Submit Enquiry
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile filter overlay backdrop */}
      {showMobileFilters && (
        <div
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={() => setShowMobileFilters(false)}
        />
      )}

      {/* Map Modal */}
      {mapProperty && (
        <MapModal
          item={mapProperty}
          items={filteredProperties.filter(p => p.city === mapProperty.city)}
          isOpen={isMapOpen}
          onClose={() => { setIsMapOpen(false); setMapProperty(null); }}
          formatPrice={formatPrice}
        />
      )}
    </div>
  );
}
