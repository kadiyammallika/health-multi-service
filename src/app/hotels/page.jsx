'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import {
  Building2,
  MapPin,
  Calendar,
  Users,
  Star,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Coffee,
  Wifi,
  Car,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Ticket,
  Search,
  SlidersHorizontal,
  X,
  Bed,
  Bath,
  Maximize2,
  Phone,
  Mail,
  User,
  Clock,
  Info,
  Tag,
  Percent,
  Heart,
  Dumbbell,
  Waves,
  UtensilsCrossed,
  TreePine,
  Shield,
  BedDouble,
  Home,
  Crown,
  Landmark,
  ThumbsUp,
  Filter,
  Moon,
  Sun,
  Minus,
  Plus
} from 'lucide-react';
import { saveBooking } from '@/services/storage';
import PaymentModal from '@/components/ui/PaymentModal';
import TicketModal from '@/components/ui/TicketModal';
import DataSourceBanner from '@/components/ui/DataSourceBanner';
import { MapPreviewButton, InteractiveMap, MapModal } from '@/components/ui/MapView';
import { useCurrency } from '@/components/ui/CurrencyProvider';
import InlineCurrencySelector from '@/components/ui/InlineCurrencySelector';
import { ALL_CITIES, getCurrencyForCity, getCityLabel, filterCities, COUNTRY_NAMES } from '@/data/cities';

const HOTEL_IMAGES = ['/images/hotel-1.jpg', '/images/hotel-2.jpg', '/images/hotel-3.jpg', '/images/hotel-4.jpg', '/images/hotel-5.jpg'];
const getHotelImage = (index, hotel) => {
  // Prefer provider-supplied image
  if (hotel?.image) return hotel.image;
  if (hotel?.details?.image) return hotel.details.image;
  if (hotel?.details?.imageUrl) return hotel.details.imageUrl;
  // Use index-based rotation to ensure each card gets a different image
  return HOTEL_IMAGES[index % HOTEL_IMAGES.length];
};

const AMENITY_ICONS = {
  'Pool': Waves,
  'Swimming Pool': Waves,
  'WiFi': Wifi,
  'Free WiFi': Wifi,
  'Wi-Fi': Wifi,
  'Spa': Sparkles,
  'Spa & Wellness': Sparkles,
  'Gym': Dumbbell,
  'Fitness Center': Dumbbell,
  'Parking': Car,
  'Free Parking': Car,
  'Valet Parking': Car,
  'Restaurant': UtensilsCrossed,
  'Fine Dining': UtensilsCrossed,
  'Coffee': Coffee,
  'Cafe': Coffee,
  'Garden': TreePine,
  'Bar': UtensilsCrossed,
  'Room Service': Bed,
  'Concierge': ShieldCheck,
  'Laundry': Bath,
};

const FILTER_AMENITIES = ['Pool', 'WiFi', 'Spa', 'Gym', 'Parking', 'Restaurant'];
const PROPERTY_TYPES = ['Luxury', 'Resort', 'Boutique', 'Hotel'];

function getPropertyType(stars) {
  if (stars >= 5) return 'Luxury';
  if (stars === 4) return 'Resort';
  if (stars === 3) return 'Boutique';
  return 'Hotel';
}

function getAmenityIcon(amenity) {
  if (!amenity) return CheckCircle2;
  for (const [key, Icon] of Object.entries(AMENITY_ICONS)) {
    if (amenity.toLowerCase().includes(key.toLowerCase())) {
      return Icon;
    }
  }
  return CheckCircle2;
}

function StarRating({ rating, size = 'sm' }) {
  const stars = Math.round(rating);
  const sizeClass = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`${sizeClass} ${s <= stars ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`}
        />
      ))}
    </div>
  );
}

function GuestRatingBadge({ rating }) {
  const displayRating = Math.round(rating * 10) / 10;
  let label = 'Good';
  let bg = 'bg-green-600';
  if (rating >= 4.5) { label = 'Exceptional'; bg = 'bg-emerald-700'; }
  else if (rating >= 4.0) { label = 'Excellent'; bg = 'bg-green-600'; }
  else if (rating >= 3.5) { label = 'Very Good'; bg = 'bg-teal-600'; }

  return (
    <div className="flex items-center gap-1.5">
      <span className={`${bg} text-white text-xs font-bold px-2 py-1 rounded-md`}>
        {displayRating}
      </span>
      <div>
        <span className="text-xs font-semibold text-gray-800">{label}</span>
      </div>
    </div>
  );
}

export default function HotelsPage() {
  const { formatPrice, currency, rates, setCurrency } = useCurrency();
  const [step, setStep] = useState('list');

  // Search parameters - City/Destination
  const [selectedCity, setSelectedCity] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const cityRef = useRef(null);
  const [checkInDate, setCheckInDate] = useState('2026-11-20');
  const [checkOutDate, setCheckOutDate] = useState('2026-11-23');
  const [guestsCount, setGuestsCount] = useState(2);
  const [roomsCount, setRoomsCount] = useState(1);
  const [showGuestDropdown, setShowGuestDropdown] = useState(false);

  // Filters
  const [starFilters, setStarFilters] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [amenityFilters, setAmenityFilters] = useState([]);
  const [propertyTypeFilters, setPropertyTypeFilters] = useState([]);
  const [guestRatingFilter, setGuestRatingFilter] = useState(0);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [sortBy, setSortBy] = useState('recommended');

  // Selected hotel and room
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [expandedHotel, setExpandedHotel] = useState(null);

  // Guest details form
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');

  // Payment & confirmation
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

  // Map modal
  const [mapHotel, setMapHotel] = useState(null);
  const [isMapOpen, setIsMapOpen] = useState(false);

  // Dynamic data from database
  const [hotels, setHotels] = useState([]);
  const [cities, setCities] = useState([]);
  const [dataSource, setDataSource] = useState('provider');
  const [loading, setLoading] = useState(true);

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

  // City selection (auto-currency based on destination)
  const handleCitySelect = (city) => {
    setSelectedCity(city.name);
    setCitySearch(city.country === 'IN' ? city.name : `${city.name}, ${COUNTRY_NAMES[city.country] || city.country}`);
    setShowCityDropdown(false);
    const newCurrency = getCurrencyForCity(city.name);
    setCurrency(newCurrency);
  };

  // Filtered city suggestions
  const getFilteredCities = (searchText) => {
    if (!searchText || searchText.length < 1) return ALL_CITIES.slice(0, 15);
    return filterCities(searchText).slice(0, 12);
  };

  useEffect(() => {
    async function fetchHotels() {
      try {
        setLoading(true);
        const res = await fetch('/api/hotels');
        const data = await res.json();
        if (data.success && data.hotels?.length > 0) {
          setHotels(data.hotels);
          if (data.cities?.length > 0) setCities(data.cities);
          setDataSource('provider');
        } else {
          setHotels([]);
          setDataSource('provider');
        }
      } catch (err) {
        console.log('Failed to fetch hotels from API');
        setHotels([]);
        setDataSource('provider');
      } finally {
        setLoading(false);
      }
    }
    fetchHotels();
  }, []);

  // Calculate nights
  const calculateNights = () => {
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return isNaN(diffDays) || diffDays <= 0 ? 1 : diffDays;
  };

  const nights = calculateNights();

  // Compute max price for slider
  const maxPrice = useMemo(() => {
    if (hotels.length === 0) return 50000;
    const max = Math.max(...hotels.map(h => h.pricePerNight || 0));
    return Math.ceil(max / 1000) * 1000 + 1000;
  }, [hotels]);

  // Filtered & sorted hotels
  const filteredHotels = useMemo(() => {
    let result = hotels.filter((h) => {
      if (selectedCity && !(h.city || '').toLowerCase().includes(selectedCity.toLowerCase())) return false;
      if (starFilters.length > 0) {
        const hotelStars = Math.round(h.rating || 0);
        if (!starFilters.includes(hotelStars)) return false;
      }
      if (h.pricePerNight < priceRange[0] || h.pricePerNight > priceRange[1]) return false;
      if (amenityFilters.length > 0) {
        const hotelAmenities = (h.amenities || []).map(a => a.toLowerCase());
        const hasAll = amenityFilters.every(af =>
          hotelAmenities.some(ha => ha.includes(af.toLowerCase()))
        );
        if (!hasAll) return false;
      }
      if (guestRatingFilter > 0 && (h.rating || 0) < guestRatingFilter) return false;
      if (propertyTypeFilters.length > 0) {
        const hotelStars = Math.round(h.stars || h.rating || 0);
        const hotelPropertyType = getPropertyType(hotelStars);
        if (!propertyTypeFilters.includes(hotelPropertyType)) return false;
      }
      return true;
    });

    if (sortBy === 'price-low') result.sort((a, b) => a.pricePerNight - b.pricePerNight);
    else if (sortBy === 'price-high') result.sort((a, b) => b.pricePerNight - a.pricePerNight);
    else if (sortBy === 'rating') result.sort((a, b) => (b.rating || 0) - (a.rating || 0));

    return result;
  }, [hotels, selectedCity, starFilters, priceRange, amenityFilters, propertyTypeFilters, guestRatingFilter, sortBy]);

  const handleSelectHotel = (hotel) => {
    setSelectedHotel(hotel);
    setSelectedRoom(hotel.rooms?.[0] || null);
    setStep('details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectRoomAndProceed = (room) => {
    setSelectedRoom(room);
    setStep('guests');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProceedToSummary = (e) => {
    e.preventDefault();
    if (!guestName || !guestEmail || !guestPhone) {
      alert('Please fill in all required guest details.');
      return;
    }
    setStep('summary');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Pricing calculations
  const pricePerNight = selectedRoom?.price || selectedHotel?.pricePerNight || 6000;
  const baseFare = pricePerNight * nights * roomsCount;
  const taxes = Math.round(baseFare * 0.18);
  const resortFee = 500;
  const totalAmount = baseFare + taxes + resortFee;

  const handlePaymentSuccess = async (paymentDetails) => {
    setIsPaymentOpen(false);

    const bookingRef = `HTL-${(selectedHotel?.city || 'XXX').substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newBooking = {
      type: 'hotel',
      categoryTitle: 'Hotel & Stay Reservation',
      reference: bookingRef,
      hotelName: selectedHotel.name,
      city: selectedHotel.location,
      roomName: selectedRoom?.name || 'Standard Room',
      checkInDate,
      checkOutDate,
      nights,
      guestsCount,
      roomsCount,
      contactEmail: guestEmail,
      contactPhone: guestPhone,
      guestName,
      totalAmount,
      fareBreakdown: {
        baseFare,
        taxes,
        resortFee
      },
      paymentMethod: paymentDetails?.method || 'online',
      status: 'Confirmed',
      providerId: selectedHotel.providerId || null,
      listingId: selectedHotel.listingId || null,
      serviceName: selectedHotel.name || '',
      displayCurrency: currency,
      exchangeRate: rates[currency] || 1.0,
    };

    try {
      const saved = await saveBooking(newBooking);
      setConfirmedBooking(saved);
      setStep('confirmed');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Booking save error:', err);
      alert('Failed to save booking. Please try again.');
    }
  };

  const toggleStarFilter = (star) => {
    setStarFilters(prev =>
      prev.includes(star) ? prev.filter(s => s !== star) : [...prev, star]
    );
  };

  const toggleAmenityFilter = (amenity) => {
    setAmenityFilters(prev =>
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  const togglePropertyType = (type) => {
    setPropertyTypeFilters(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const clearAllFilters = () => {
    setStarFilters([]);
    setPriceRange([0, maxPrice]);
    setAmenityFilters([]);
    setPropertyTypeFilters([]);
    setGuestRatingFilter(0);
  };

  const activeFilterCount = starFilters.length + amenityFilters.length + propertyTypeFilters.length + (guestRatingFilter > 0 ? 1 : 0);

  // Determine tags for a hotel
  const getHotelTags = (hotel) => {
    const tags = [];
    if ((hotel.rating || 0) >= 4.5) tags.push({ label: 'PREMIUM', color: 'bg-amber-100 text-amber-800 border-amber-200' });
    if ((hotel.amenities || []).some(a => a.toLowerCase().includes('breakfast'))) {
      tags.push({ label: 'BREAKFAST INCLUDED', color: 'bg-green-100 text-green-800 border-green-200' });
    }
    if (hotel.pricePerNight < 5000) tags.push({ label: 'GREAT VALUE', color: 'bg-blue-100 text-blue-800 border-blue-200' });
    tags.push({ label: 'FREE CANCELLATION', color: 'bg-sky-100 text-sky-800 border-sky-200' });
    return tags;
  };

  const getDiscountPercent = (hotel) => {
    return Math.floor(Math.random() * 15) + 10;
  };

  const getOriginalPrice = (hotel, discount) => {
    return Math.round(hotel.pricePerNight / (1 - discount / 100));
  };

  // Step progress bar
  const steps = [
    { key: 'list', label: 'Search & Select', num: 1 },
    { key: 'details', label: 'Choose Room', num: 2 },
    { key: 'guests', label: 'Guest Details', num: 3 },
    { key: 'summary', label: 'Review & Pay', num: 4 },
    { key: 'confirmed', label: 'Confirmed', num: 5 },
  ];
  const currentStepIndex = steps.findIndex(s => s.key === step);

  // -- Filter sidebar component (shared between desktop and mobile) --
  const FilterSidebar = ({ className = '' }) => (
    <div className={`space-y-6 ${className}`}>
      {/* Star Rating */}
      <div>
        <h4 className="text-sm font-bold text-gray-800 mb-3">Star Rating</h4>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((star) => (
            <label key={star} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={starFilters.includes(star)}
                onChange={() => toggleStarFilter(star)}
                className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
              <div className="flex items-center gap-1">
                {[...Array(star)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                ))}
                {[...Array(5 - star)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 text-gray-300" />
                ))}
              </div>
              <span className="text-xs text-gray-500 group-hover:text-gray-700">{star} Star{star > 1 ? 's' : ''}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h4 className="text-sm font-bold text-gray-800 mb-3">Price per night</h4>
        <div className="px-1">
          <input
            type="range"
            min={0}
            max={maxPrice}
            step={500}
            value={priceRange[1]}
            onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
          />
          <div className="flex justify-between mt-2 text-xs text-gray-600 font-medium">
            <span>{formatPrice(priceRange[0])}</span>
            <span>{formatPrice(priceRange[1])}</span>
          </div>
        </div>
      </div>

      {/* Amenities */}
      <div>
        <h4 className="text-sm font-bold text-gray-800 mb-3">Amenities</h4>
        <div className="space-y-2">
          {FILTER_AMENITIES.map((amenity) => {
            const Icon = getAmenityIcon(amenity);
            return (
              <label key={amenity} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={amenityFilters.includes(amenity)}
                  onChange={() => toggleAmenityFilter(amenity)}
                  className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <Icon className="w-4 h-4 text-gray-500 group-hover:text-emerald-600" />
                <span className="text-xs text-gray-600 group-hover:text-gray-800">{amenity}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Property Type */}
      <div>
        <h4 className="text-sm font-bold text-gray-800 mb-3">Property Type</h4>
        <div className="space-y-2">
          {PROPERTY_TYPES.map((type) => {
            const icons = { Luxury: Crown, Resort: TreePine, Boutique: Landmark, Hotel: Building2 };
            const Icon = icons[type] || Building2;
            return (
              <label key={type} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={propertyTypeFilters.includes(type)}
                  onChange={() => togglePropertyType(type)}
                  className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <Icon className="w-4 h-4 text-gray-500 group-hover:text-emerald-600" />
                <span className="text-xs text-gray-600 group-hover:text-gray-800">{type}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Guest Rating */}
      <div>
        <h4 className="text-sm font-bold text-gray-800 mb-3">Guest Rating</h4>
        <div className="space-y-2">
          {[
            { label: 'Exceptional 4.5+', value: 4.5 },
            { label: 'Excellent 4+', value: 4.0 },
            { label: 'Very Good 3.5+', value: 3.5 },
            { label: 'Good 3+', value: 3.0 },
          ].map((opt) => (
            <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="radio"
                name="guestRating"
                checked={guestRatingFilter === opt.value}
                onChange={() => setGuestRatingFilter(guestRatingFilter === opt.value ? 0 : opt.value)}
                className="w-4 h-4 border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
              <span className="text-xs text-gray-600 group-hover:text-gray-800">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {activeFilterCount > 0 && (
        <button
          onClick={clearAllFilters}
          className="w-full py-2.5 text-sm font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
        >
          Clear All Filters ({activeFilterCount})
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ===== SEARCH HEADER BAR ===== */}
      <div className="bg-gradient-to-r from-[#1b5e20] via-[#2e7d32] to-[#1b5e20] relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl -translate-y-1/2" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-emerald-300 rounded-full blur-3xl translate-y-1/2" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Title */}
          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Find Your Perfect Stay
            </h1>
            <p className="text-emerald-200 text-sm mt-1">
              Luxury Hotels, Health Retreats & Premium Resorts -- Best Rate Guaranteed
            </p>
          </div>

          {/* Currency selector - in dark header like flights */}
          <div className="flex justify-end mb-3">
            <InlineCurrencySelector variant="dark" />
          </div>

          {/* Search Bar */}
          <div className="bg-white rounded-2xl shadow-2xl p-3 sm:p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-10 gap-2 items-end">
              {/* City / Destination - Autocomplete (sets currency) */}
              <div className="lg:col-span-3 p-2.5 bg-gray-50 border border-gray-200 rounded-xl hover:border-emerald-400 transition relative" ref={cityRef}>
                <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-0.5">City / Destination</label>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                  <input
                    type="text"
                    value={citySearch}
                    onChange={(e) => { setCitySearch(e.target.value); setShowCityDropdown(true); }}
                    onFocus={() => { setShowCityDropdown(true); setCitySearch(''); setSelectedCity(''); setCurrency('INR'); }}
                    placeholder="Type city..."
                    className="w-full bg-transparent text-gray-900 font-bold text-sm focus:outline-none placeholder:text-gray-400 placeholder:font-normal"
                  />
                </div>
                {showCityDropdown && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-64 overflow-y-auto">
                    {getFilteredCities(citySearch).map(c => (
                      <button
                        key={`${c.name}-${c.country}`}
                        onClick={() => handleCitySelect(c)}
                        className={`w-full text-left px-3 py-2.5 hover:bg-emerald-50 flex items-center justify-between border-b border-gray-50 last:border-0 transition-colors ${c.name === selectedCity ? 'bg-emerald-50' : ''}`}
                      >
                        <span className="text-sm font-semibold text-gray-900">{c.name}</span>
                        <span className="text-[11px] text-gray-400">{c.country === 'IN' ? c.state : (COUNTRY_NAMES[c.country] || c.country)}</span>
                      </button>
                    ))}
                    {getFilteredCities(citySearch).length === 0 && (
                      <div className="px-4 py-6 text-center text-sm text-gray-400">No cities found</div>
                    )}
                  </div>
                )}
              </div>

              {/* Check-in */}
              <div className="lg:col-span-2 p-3 bg-gray-50 border border-gray-200 rounded-xl hover:border-emerald-400 transition group">
                <label className="flex items-center gap-1.5 text-[11px] uppercase font-bold text-gray-400 mb-1">
                  <Calendar className="w-3 h-3" />
                  Check-in
                </label>
                <input
                  type="date"
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  className="bg-transparent font-semibold text-gray-800 w-full focus:outline-none text-sm"
                />
              </div>

              {/* Check-out */}
              <div className="lg:col-span-2 p-3 bg-gray-50 border border-gray-200 rounded-xl hover:border-emerald-400 transition group">
                <label className="flex items-center gap-1.5 text-[11px] uppercase font-bold text-gray-400 mb-1">
                  <Calendar className="w-3 h-3" />
                  Check-out
                </label>
                <input
                  type="date"
                  value={checkOutDate}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                  className="bg-transparent font-semibold text-gray-800 w-full focus:outline-none text-sm"
                />
              </div>

              {/* Guests & Rooms */}
              <div className="lg:col-span-2 relative">
                <div
                  className="p-3 bg-gray-50 border border-gray-200 rounded-xl hover:border-emerald-400 transition cursor-pointer"
                  onClick={() => setShowGuestDropdown(!showGuestDropdown)}
                >
                  <label className="flex items-center gap-1.5 text-[11px] uppercase font-bold text-gray-400 mb-1">
                    <Users className="w-3 h-3" />
                    Guests & Rooms
                  </label>
                  <div className="font-semibold text-gray-800 text-sm">
                    {guestsCount} Guest{guestsCount > 1 ? 's' : ''} &middot; {roomsCount} Room{roomsCount > 1 ? 's' : ''}
                  </div>
                </div>

                {showGuestDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 p-4 z-50">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-semibold text-gray-800">Guests</div>
                          <div className="text-xs text-gray-500">Total guests</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={(e) => { e.stopPropagation(); setGuestsCount(Math.max(1, guestsCount - 1)); }}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-emerald-500 hover:text-emerald-600 transition"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-6 text-center font-bold text-gray-800">{guestsCount}</span>
                          <button
                            onClick={(e) => { e.stopPropagation(); setGuestsCount(guestsCount + 1); }}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-emerald-500 hover:text-emerald-600 transition"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-semibold text-gray-800">Rooms</div>
                          <div className="text-xs text-gray-500">Number of rooms</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={(e) => { e.stopPropagation(); setRoomsCount(Math.max(1, roomsCount - 1)); }}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-emerald-500 hover:text-emerald-600 transition"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-6 text-center font-bold text-gray-800">{roomsCount}</span>
                          <button
                            onClick={(e) => { e.stopPropagation(); setRoomsCount(roomsCount + 1); }}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-emerald-500 hover:text-emerald-600 transition"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setShowGuestDropdown(false)}
                      className="mt-4 w-full py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition"
                    >
                      Apply
                    </button>
                  </div>
                )}
              </div>

              {/* Search Button */}
              <div className="lg:col-span-1">
                <button
                  type="button"
                  onClick={() => { setStep('list'); setShowGuestDropdown(false); }}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#ff8f00] hover:bg-[#ff6f00] text-white font-bold text-sm shadow-lg shadow-amber-500/30 transition flex items-center justify-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  <span>Search</span>
                </button>
              </div>
            </div>

            {/* Quick info bar */}
            {nights > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Moon className="w-3.5 h-3.5" />
                  {nights} Night{nights > 1 ? 's' : ''}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(checkInDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} - {new Date(checkOutDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===== STEP PROGRESS BAR ===== */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-1 sm:gap-2 py-3 overflow-x-auto">
            {steps.map((s, i) => (
              <div key={s.key} className="flex items-center shrink-0">
                <div className="flex items-center gap-1.5">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      i < currentStepIndex
                        ? 'bg-emerald-600 text-white'
                        : i === currentStepIndex
                        ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {i < currentStepIndex ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      s.num
                    )}
                  </div>
                  <span
                    className={`text-xs font-medium hidden sm:inline ${
                      i === currentStepIndex ? 'text-emerald-700' : 'text-gray-400'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`w-6 sm:w-10 h-0.5 mx-1 sm:mx-2 ${i < currentStepIndex ? 'bg-emerald-500' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* ===== STEP 1: HOTEL LISTINGS WITH SIDEBAR ===== */}
        {step === 'list' && (
          <div className="flex gap-6">
            {/* Filter Sidebar - Desktop */}
            <div className="hidden lg:block w-72 shrink-0">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 sticky top-20">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4" />
                    Filters
                  </h3>
                  {activeFilterCount > 0 && (
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">
                      {activeFilterCount} active
                    </span>
                  )}
                </div>
                <FilterSidebar />
              </div>
            </div>

            {/* Mobile Filter Button */}
            <button
              onClick={() => setShowMobileFilters(true)}
              className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-30 bg-emerald-700 text-white px-5 py-3 rounded-full shadow-xl flex items-center gap-2 text-sm font-bold"
            >
              <Filter className="w-4 h-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="bg-white text-emerald-700 w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Mobile Filter Drawer */}
            {showMobileFilters && (
              <div className="fixed inset-0 z-50 lg:hidden">
                <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileFilters(false)} />
                <div className="absolute right-0 top-0 bottom-0 w-80 max-w-full bg-white shadow-2xl overflow-y-auto">
                  <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h3 className="text-base font-bold text-gray-900">Filters</h3>
                    <button onClick={() => setShowMobileFilters(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="p-4">
                    <FilterSidebar />
                  </div>
                  <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
                    <button
                      onClick={() => setShowMobileFilters(false)}
                      className="w-full py-3 bg-emerald-600 text-white font-bold text-sm rounded-xl hover:bg-emerald-700 transition"
                    >
                      Show {filteredHotels.length} Properties
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Hotel Cards Column */}
            <div className="flex-1 min-w-0">
              {/* Results header + Sort */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {selectedCity || 'All Destinations'}: {filteredHotels.length} properties found
                  </h2>
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    <span className="text-xs text-gray-500">
                      {nights} night{nights > 1 ? 's' : ''} &middot; {guestsCount} guest{guestsCount > 1 ? 's' : ''} &middot; {roomsCount} room{roomsCount > 1 ? 's' : ''}
                    </span>
                    {filteredHotels.some(h => h.source === 'amadeus') && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-100">
                        Amadeus API
                      </span>
                    )}
                    {filteredHotels.some(h => h.source === 'provider') && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[10px] font-bold border border-purple-100">
                        Provider Listed
                      </span>
                    )}
                    {filteredHotels.some(h => h.source === 'live') && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-orange-50 text-orange-700 text-[10px] font-bold border border-orange-100">
                        Provider Listings
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="text-sm font-semibold text-gray-800 bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="recommended">Recommended</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Guest Rating</option>
                  </select>
                </div>
              </div>

              {/* Data Sources Banner */}
              <DataSourceBanner
                sources={['amadeus', 'supabase', 'oneconnect', 'unsplash']}
                counts={{
                  amadeus: hotels.filter(h => h.source === 'amadeus').length,
                  supabase: hotels.filter(h => h.source === 'provider').length,
                  oneconnect: hotels.filter(h => h.source === 'live').length,
                  total: filteredHotels.length,
                }}
              />

              {/* Loading state */}
              {loading && (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-4" />
                  <p className="text-sm text-gray-500">Loading hotels...</p>
                </div>
              )}

              {/* No results */}
              {!loading && filteredHotels.length === 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                  <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-800 mb-2">No hotels available</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    {hotels.length === 0
                      ? 'No providers have listed hotels yet. Check back soon!'
                      : 'Try adjusting your filters or search criteria'}
                  </p>
                  {hotels.length > 0 && (
                    <button
                      onClick={clearAllFilters}
                      className="px-5 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition"
                    >
                      Clear All Filters
                    </button>
                  )}
                </div>
              )}

              {/* Hotel Cards */}
              <div className="space-y-4">
                {filteredHotels.map((hotel, hotelIndex) => {
                  const discount = getDiscountPercent(hotel);
                  const originalPrice = getOriginalPrice(hotel, discount);
                  const tags = getHotelTags(hotel);
                  const isExpanded = expandedHotel === hotel.id;

                  return (
                    <div
                      key={hotel.id}
                      className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-shadow overflow-hidden"
                    >
                      <div className="flex flex-col md:flex-row">
                        {/* Left: Image */}
                        <div className="relative md:w-72 lg:w-80 shrink-0 h-56 md:h-auto">
                          <div className="w-full h-full min-h-[220px] bg-gradient-to-br from-emerald-800 via-emerald-600 to-teal-500 flex items-center justify-center">
                            <img src={getHotelImage(hotelIndex, hotel)} alt={hotel.name} className="w-full h-full object-cover absolute inset-0" />
                          </div>
                          {/* Discount Badge */}
                          <div className="absolute top-3 left-3 bg-red-600 text-white px-2.5 py-1 rounded-md text-xs font-bold shadow-md">
                            {discount}% OFF
                          </div>
                          {/* Heart / Favorite */}
                          <button className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white transition group">
                            <Heart className="w-4 h-4 text-gray-400 group-hover:text-red-500 transition" />
                          </button>
                        </div>

                        {/* Center: Details */}
                        <div className="flex-1 p-5 flex flex-col justify-between min-w-0">
                          <div>
                            {/* Tags */}
                            <div className="flex flex-wrap gap-1.5 mb-2">
                              {tags.map((tag, i) => (
                                <span key={i} className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${tag.color}`}>
                                  {tag.label}
                                </span>
                              ))}
                            </div>

                            {/* Hotel name and stars */}
                            <div className="flex items-start gap-2 mb-1">
                              <h3 className="text-lg font-bold text-gray-900 leading-tight">{hotel.name}</h3>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              <StarRating rating={hotel.rating || 4} />
                              <GuestRatingBadge rating={hotel.rating || 4.0} />
                              {hotel.reviewsCount && (
                                <span className="text-xs text-gray-400">({hotel.reviewsCount} reviews)</span>
                              )}
                            </div>

                            {/* Location */}
                            <button
                              onClick={(e) => { e.stopPropagation(); setMapHotel(hotel); setIsMapOpen(true); }}
                              className="flex items-center gap-1 text-xs text-blue-600 hover:underline cursor-pointer mb-2"
                            >
                              <MapPin className="w-3.5 h-3.5" />
                              <span>{hotel.location || hotel.city}</span>
                              <span className="text-blue-500 ml-1 font-semibold">- Show on map</span>
                            </button>

                            {/* Description */}
                            <p className="text-xs text-gray-500 line-clamp-2 mb-3">{hotel.description}</p>

                            {/* Amenities row */}
                            <div className="flex flex-wrap items-center gap-3">
                              {(hotel.amenities || []).slice(0, 6).map((amenity, i) => {
                                const Icon = getAmenityIcon(amenity);
                                return (
                                  <div key={i} className="flex items-center gap-1 text-xs text-gray-600">
                                    <Icon className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>{amenity}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Expand button */}
                          <button
                            onClick={() => setExpandedHotel(isExpanded ? null : hotel.id)}
                            className="flex items-center gap-1 text-xs text-emerald-700 font-semibold mt-3 hover:text-emerald-800"
                          >
                            {isExpanded ? 'Less details' : 'More details'}
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                        </div>

                        {/* Right: Price Column */}
                        <div className="md:w-52 lg:w-56 shrink-0 border-t md:border-t-0 md:border-l border-gray-100 p-5 flex flex-col justify-between bg-gray-50/50">
                          <div>
                            <div className="text-right">
                              <div className="text-xs text-gray-400 mb-1">{nights} night{nights > 1 ? 's' : ''}, {guestsCount} guest{guestsCount > 1 ? 's' : ''}</div>
                              <div className="text-xs text-gray-400 line-through">
                                {formatPrice(originalPrice)}
                              </div>
                              <div className="text-2xl font-black text-gray-900">
                                {formatPrice(hotel.pricePerNight)}
                              </div>
                              <div className="text-[11px] text-gray-500">per night</div>
                              <div className="mt-1 pt-1 border-t border-gray-200">
                                <div className="text-sm font-bold text-gray-800">
                                  {formatPrice(hotel.pricePerNight * nights * roomsCount)}
                                </div>
                                <div className="text-[11px] text-gray-400">total for {nights} night{nights > 1 ? 's' : ''}</div>
                              </div>
                              <div className="text-[11px] text-gray-400 mt-0.5">+ {formatPrice(Math.round(hotel.pricePerNight * nights * roomsCount * 0.18))} taxes</div>
                            </div>
                          </div>

                          <button
                            onClick={() => handleSelectHotel(hotel)}
                            className="mt-4 w-full py-3 rounded-lg bg-[#ff8f00] hover:bg-[#ff6f00] text-white font-bold text-sm shadow-md shadow-amber-500/25 transition flex items-center justify-center gap-1.5"
                          >
                            Select Room
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="border-t border-gray-200 bg-gray-50 p-5">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* All Amenities */}
                            <div>
                              <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-1.5">
                                <Sparkles className="w-4 h-4 text-emerald-600" />
                                All Amenities
                              </h4>
                              <div className="grid grid-cols-2 gap-2">
                                {(hotel.amenities || []).map((amenity, i) => {
                                  const Icon = getAmenityIcon(amenity);
                                  return (
                                    <div key={i} className="flex items-center gap-1.5 text-xs text-gray-600">
                                      <Icon className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                      <span>{amenity}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Room Types */}
                            <div>
                              <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-1.5">
                                <Bed className="w-4 h-4 text-emerald-600" />
                                Room Types
                              </h4>
                              <div className="space-y-2">
                                {(hotel.rooms || []).map((room, i) => (
                                  <div key={i} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-gray-200">
                                    <div>
                                      <div className="text-xs font-semibold text-gray-800">{room.name}</div>
                                      <div className="text-[11px] text-gray-500">{room.bed} &middot; {room.capacity}</div>
                                    </div>
                                    <div className="text-xs font-bold text-emerald-700">{formatPrice(room.price)}/night</div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Policies */}
                            <div>
                              <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-1.5">
                                <Info className="w-4 h-4 text-emerald-600" />
                                Policies & Info
                              </h4>
                              <div className="space-y-3 text-xs text-gray-600">
                                <div className="flex items-start gap-2">
                                  <Clock className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                                  <div>
                                    <div className="font-semibold text-gray-800">Check-in / Check-out</div>
                                    <div>Check-in: 2:00 PM &middot; Check-out: 11:00 AM</div>
                                  </div>
                                </div>
                                <div className="flex items-start gap-2">
                                  <Shield className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                                  <div>
                                    <div className="font-semibold text-gray-800">Cancellation Policy</div>
                                    <div>Free cancellation up to 24 hours before check-in</div>
                                  </div>
                                </div>
                                <div className="flex items-start gap-2">
                                  <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                                  <div>
                                    <div className="font-semibold text-gray-800">Location</div>
                                    <div>{hotel.location || hotel.city}</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Map Preview */}
                          <div className="mt-5 pt-5 border-t border-gray-200">
                            <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-1.5">
                              <MapPin className="w-4 h-4 text-emerald-600" />
                              Location on Map
                            </h4>
                            <MapPreviewButton
                              item={hotel}
                              onClick={() => { setMapHotel(hotel); setIsMapOpen(true); }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ===== STEP 2: HOTEL DETAILS & ROOM SELECTION ===== */}
        {step === 'details' && selectedHotel && (
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Back button */}
            <button
              onClick={() => setStep('list')}
              className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-emerald-700 font-medium transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to search results
            </button>

            {/* Hotel Header Card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              {/* Hero image */}
              <div className="relative h-64 sm:h-80">
                <div className="w-full h-full bg-gradient-to-br from-emerald-800 via-emerald-600 to-teal-500">
                  <img src={getHotelImage(filteredHotels.indexOf(selectedHotel), selectedHotel)} alt={selectedHotel.name} className="w-full h-full object-cover" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="flex items-center gap-2 mb-2">
                    <StarRating rating={selectedHotel.rating || 4} />
                    <GuestRatingBadge rating={selectedHotel.rating || 4.0} />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white">{selectedHotel.name}</h2>
                  <div className="flex items-center gap-1.5 text-emerald-200 text-sm mt-1">
                    <MapPin className="w-4 h-4" />
                    {selectedHotel.location || selectedHotel.city}
                  </div>
                </div>
              </div>

              {/* Hotel info section */}
              <div className="p-6 space-y-6">
                {/* Description */}
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-2">About this property</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{selectedHotel.description}</p>
                </div>

                {/* Amenities grid */}
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-3">Amenities & Facilities</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {(selectedHotel.amenities || []).map((amenity, i) => {
                      const Icon = getAmenityIcon(amenity);
                      return (
                        <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2.5 border border-gray-100">
                          <Icon className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="text-sm text-gray-700">{amenity}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Policies */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center border border-emerald-200">
                      <Clock className="w-4 h-4 text-emerald-700" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gray-800">Check-in / Check-out</div>
                      <div className="text-xs text-gray-500">2:00 PM / 11:00 AM</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center border border-emerald-200">
                      <Shield className="w-4 h-4 text-emerald-700" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gray-800">Free Cancellation</div>
                      <div className="text-xs text-gray-500">Up to 24 hrs before check-in</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center border border-emerald-200">
                      <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gray-800">Best Rate Guarantee</div>
                      <div className="text-xs text-gray-500">Found it lower? We match it</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Location Map - Like Agoda */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-5 pb-3">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  Location
                </h3>
                <p className="text-xs text-gray-500 mt-1">{selectedHotel.address || selectedHotel.location || selectedHotel.city}</p>
              </div>
              <div className="px-5 pb-5">
                <InteractiveMap
                  item={selectedHotel}
                  items={hotels.filter(h => h.city === selectedHotel.city && h.id !== selectedHotel.id).slice(0, 5)}
                  height="300px"
                  zoom={15}
                  formatPrice={formatPrice}
                />
              </div>
              {/* Nearby landmarks info */}
              <div className="px-5 pb-4 flex flex-wrap gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100">
                  🏪 Near city center
                </span>
                <span className="flex items-center gap-1 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100">
                  ✈️ Airport accessible
                </span>
                <span className="flex items-center gap-1 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100">
                  🚉 Railway station nearby
                </span>
              </div>
            </div>

            {/* Room Selection */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Bed className="w-5 h-5 text-emerald-600" />
                Select Your Room
                <span className="text-sm font-normal text-gray-400 ml-2">
                  {nights} night{nights > 1 ? 's' : ''} &middot; {guestsCount} guest{guestsCount > 1 ? 's' : ''}
                </span>
              </h3>

              <div className="space-y-4">
                {(selectedHotel.rooms || []).map((room) => {
                  const roomDiscount = Math.floor(Math.random() * 12) + 8;
                  const roomOriginal = Math.round(room.price / (1 - roomDiscount / 100));
                  const isSelected = selectedRoom?.id === room.id;

                  return (
                    <div
                      key={room.id}
                      className={`bg-white rounded-xl border overflow-hidden transition-all ${
                        isSelected
                          ? 'border-emerald-500 ring-2 ring-emerald-100 shadow-md'
                          : 'border-gray-200 shadow-sm hover:shadow-md'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row">
                        {/* Room image */}
                        <div className="sm:w-48 h-40 sm:h-auto bg-gradient-to-br from-teal-600 to-emerald-500 relative shrink-0 overflow-hidden">
                          <img
                            src={`https://images.unsplash.com/photo-${
                              room.name?.toLowerCase().includes('suite') ? '1578683010236-d716f9a3f461' :
                              room.name?.toLowerCase().includes('deluxe') ? '1611892440504-42a792e24d32' :
                              room.name?.toLowerCase().includes('premium') ? '1590490360182-c33d57733427' :
                              '1631049307264-da0ec9d70304'
                            }?w=400&h=300&fit=crop&q=80`}
                            alt={room.name}
                            className="w-full h-full object-cover absolute inset-0"
                          />
                          {isSelected && (
                            <div className="absolute inset-0 bg-emerald-600/20 flex items-center justify-center">
                              <CheckCircle2 className="w-8 h-8 text-white drop-shadow-lg" />
                            </div>
                          )}
                        </div>

                        {/* Room details */}
                        <div className="flex-1 p-5">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                            <div className="flex-1">
                              <h4 className="text-base font-bold text-gray-900 mb-1">{room.name}</h4>
                              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mb-3">
                                <span className="flex items-center gap-1">
                                  <Bed className="w-3.5 h-3.5" />
                                  {room.bed}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Users className="w-3.5 h-3.5" />
                                  {room.capacity}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Maximize2 className="w-3.5 h-3.5" />
                                  {room.size || '32 sqm'}
                                </span>
                              </div>

                              {/* Room features */}
                              <div className="grid grid-cols-2 gap-1.5">
                                {(Array.isArray(room.features) ? room.features : []).map((feature, i) => (
                                  <div key={i} className="flex items-center gap-1.5 text-xs text-gray-600">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                    <span>{feature}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Price + Select */}
                            <div className="sm:text-right sm:min-w-[160px] shrink-0">
                              <div className="flex sm:flex-col items-baseline sm:items-end gap-2 sm:gap-0">
                                <span className="text-xs text-gray-400 line-through">{formatPrice(roomOriginal)}</span>
                                <span className="text-xs text-red-600 font-bold sm:mt-0.5">{roomDiscount}% OFF</span>
                              </div>
                              <div className="text-xl font-black text-gray-900 mt-1">
                                {formatPrice(room.price)}
                              </div>
                              <div className="text-[11px] text-gray-400 mb-1">per night</div>
                              <div className="text-sm font-bold text-gray-700 mb-0.5">
                                {formatPrice(room.price * nights)} total
                              </div>
                              <div className="text-[11px] text-gray-400 mb-3">
                                incl. {formatPrice(Math.round(room.price * nights * 0.18))} taxes
                              </div>
                              <button
                                onClick={() => handleSelectRoomAndProceed(room)}
                                className={`w-full sm:w-auto px-6 py-2.5 rounded-lg font-bold text-sm transition ${
                                  isSelected
                                    ? 'bg-emerald-700 text-white shadow-md'
                                    : 'bg-[#ff8f00] hover:bg-[#ff6f00] text-white shadow-md shadow-amber-500/25'
                                }`}
                              >
                                {isSelected ? 'Selected' : 'Select'}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ===== STEP 3: GUEST DETAILS ===== */}
        {step === 'guests' && selectedHotel && selectedRoom && (
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Back button */}
            <button
              onClick={() => setStep('details')}
              className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-emerald-700 font-medium transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to room selection
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Guest Form */}
              <div className="lg:col-span-2">
                <form onSubmit={handleProceedToSummary} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 bg-gradient-to-r from-emerald-700 to-emerald-600">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Guest Information
                    </h3>
                    <p className="text-xs text-emerald-200 mt-0.5">
                      Please provide accurate details as per your government ID
                    </p>
                  </div>

                  <div className="p-6 space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Full Name (Primary Guest) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          placeholder="Enter full name as per ID"
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="email"
                            value={guestEmail}
                            onChange={(e) => setGuestEmail(e.target.value)}
                            placeholder="email@example.com"
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                          Mobile Number <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            value={guestPhone}
                            onChange={(e) => setGuestPhone(e.target.value)}
                            placeholder="+91 XXXXX XXXXX"
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Special Requests (optional)
                      </label>
                      <textarea
                        rows={3}
                        value={specialRequests}
                        onChange={(e) => setSpecialRequests(e.target.value)}
                        placeholder="e.g., High floor, extra pillows, early check-in, etc."
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition resize-none"
                      />
                    </div>

                    {/* Info notice */}
                    <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-blue-700">
                        Booking confirmation and voucher will be sent to the email address provided. Please ensure it is correct.
                      </p>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 rounded-lg bg-[#ff8f00] hover:bg-[#ff6f00] text-white font-bold text-sm shadow-lg shadow-amber-500/25 transition flex items-center justify-center gap-2"
                    >
                      Continue to Review
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </div>

              {/* Booking Summary Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 sticky top-20">
                  <h4 className="text-sm font-bold text-gray-900 mb-4">Booking Summary</h4>

                  <div className="space-y-3 pb-4 border-b border-gray-100">
                    <div className="font-bold text-gray-900">{selectedHotel.name}</div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <MapPin className="w-3 h-3" />
                      {selectedHotel.location || selectedHotel.city}
                    </div>
                    <div className="bg-emerald-50 rounded-lg px-3 py-2 text-xs text-emerald-800 font-medium">
                      {selectedRoom.name}
                    </div>
                  </div>

                  <div className="space-y-2 py-4 border-b border-gray-100 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Check-in</span>
                      <span className="font-semibold text-gray-800">{new Date(checkInDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Check-out</span>
                      <span className="font-semibold text-gray-800">{new Date(checkOutDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Duration</span>
                      <span className="font-semibold text-gray-800">{nights} Night{nights > 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Guests</span>
                      <span className="font-semibold text-gray-800">{guestsCount} Guest{guestsCount > 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Rooms</span>
                      <span className="font-semibold text-gray-800">{roomsCount} Room{roomsCount > 1 ? 's' : ''}</span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-4 text-xs">
                    <div className="flex justify-between text-gray-500">
                      <span>Room ({nights} night{nights > 1 ? 's' : ''})</span>
                      <span>{formatPrice(baseFare)}</span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                      <span>Taxes & fees (18%)</span>
                      <span>{formatPrice(taxes)}</span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                      <span>Resort fee</span>
                      <span>{formatPrice(resortFee)}</span>
                    </div>
                    <div className="pt-2 border-t border-gray-200 flex justify-between text-base font-black text-gray-900">
                      <span>Total</span>
                      <span>{formatPrice(totalAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== STEP 4: REVIEW & PAYMENT ===== */}
        {step === 'summary' && selectedHotel && selectedRoom && (
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Back button */}
            <button
              onClick={() => setStep('guests')}
              className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-emerald-700 font-medium transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Edit guest details
            </button>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-emerald-700 to-emerald-600">
                <h3 className="text-lg font-bold text-white">Booking Summary</h3>
                <p className="text-xs text-emerald-200 mt-0.5">Review your reservation before payment</p>
              </div>

              <div className="p-6 space-y-6">
                {/* Hotel & Room Details */}
                <div className="flex gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-emerald-700 to-teal-500 flex items-center justify-center shrink-0">
                    <img src={getHotelImage(filteredHotels.indexOf(selectedHotel), selectedHotel)} alt="" className="w-full h-full object-cover rounded-lg" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900">{selectedHotel.name}</h4>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                      <MapPin className="w-3 h-3" />
                      {selectedHotel.location || selectedHotel.city}
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <StarRating rating={selectedHotel.rating || 4} size="sm" />
                      <span className="text-xs text-gray-500">({selectedHotel.reviewsCount || 0} reviews)</span>
                    </div>
                  </div>
                </div>

                {/* Stay Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="text-[11px] text-gray-400 uppercase font-bold mb-1">Check-in</div>
                    <div className="text-sm font-bold text-gray-900">
                      {new Date(checkInDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(checkInDate).toLocaleDateString('en-US', { weekday: 'long' })}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="text-[11px] text-gray-400 uppercase font-bold mb-1">Check-out</div>
                    <div className="text-sm font-bold text-gray-900">
                      {new Date(checkOutDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(checkOutDate).toLocaleDateString('en-US', { weekday: 'long' })}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="text-[11px] text-gray-400 uppercase font-bold mb-1">Duration</div>
                    <div className="text-sm font-bold text-gray-900">{nights} Night{nights > 1 ? 's' : ''}</div>
                    <div className="text-xs text-gray-500">{roomsCount} Room{roomsCount > 1 ? 's' : ''}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="text-[11px] text-gray-400 uppercase font-bold mb-1">Room Type</div>
                    <div className="text-sm font-bold text-gray-900">{selectedRoom.name}</div>
                    <div className="text-xs text-gray-500">{selectedRoom.bed || selectedRoom.beds}</div>
                  </div>
                </div>

                {/* Guest Info */}
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                  <h4 className="text-sm font-bold text-gray-800 mb-2">Guest Details</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">{guestName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">{guestEmail}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">{guestPhone}</span>
                    </div>
                  </div>
                  {specialRequests && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <span className="text-xs text-gray-400 font-semibold">Special Requests:</span>
                      <p className="text-xs text-gray-600 mt-0.5">{specialRequests}</p>
                    </div>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="p-5 bg-emerald-50 rounded-xl border border-emerald-200 space-y-3">
                  <h4 className="text-sm font-bold text-gray-900">Price Breakdown</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-gray-600">
                      <span>Room Charges ({nights} Night{nights > 1 ? 's' : ''} x {formatPrice(pricePerNight)} x {roomsCount} Room{roomsCount > 1 ? 's' : ''})</span>
                      <span className="font-medium">{formatPrice(baseFare)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Taxes & Service Charge (18% GST)</span>
                      <span className="font-medium">{formatPrice(taxes)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Resort & Maintenance Fee</span>
                      <span className="font-medium">{formatPrice(resortFee)}</span>
                    </div>
                    <div className="pt-3 border-t-2 border-emerald-300 flex justify-between items-baseline">
                      <span className="text-lg font-black text-gray-900">Total Amount</span>
                      <span className="text-2xl font-black text-emerald-700">{formatPrice(totalAmount)}</span>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <button
                  type="button"
                  onClick={() => setIsPaymentOpen(true)}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-[#1b5e20] to-[#2e7d32] hover:from-[#145218] hover:to-[#256b29] text-white font-bold text-base shadow-xl shadow-emerald-600/30 transition flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-5 h-5" />
                  Pay {formatPrice(totalAmount)} Securely
                </button>

                <p className="text-xs text-center text-gray-400 flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Your payment is secured with 256-bit encryption
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ===== STEP 5: CONFIRMATION ===== */}
        {step === 'confirmed' && confirmedBooking && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
              {/* Success header */}
              <div className={`px-6 py-8 text-center ${confirmedBooking.status === 'Pending' ? 'bg-gradient-to-r from-amber-500 to-orange-600' : 'bg-gradient-to-r from-emerald-600 to-teal-600'}`}>
                <div className="w-16 h-16 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-4">
                  {confirmedBooking.status === 'Pending' ? <Clock className="w-10 h-10 text-white" /> : <CheckCircle2 className="w-10 h-10 text-white" />}
                </div>
                <h2 className="text-2xl font-bold text-white">{confirmedBooking.status === 'Pending' ? 'Booking Submitted!' : 'Booking Confirmed!'}</h2>
                <p className="opacity-80 text-sm mt-1">{confirmedBooking.status === 'Pending' ? 'Awaiting provider approval — you will be notified once confirmed' : 'Your reservation has been successfully processed'}</p>
                <div className="inline-block mt-3 px-4 py-1.5 bg-white/20 rounded-full text-white text-sm font-mono font-bold tracking-wider">
                  {confirmedBooking.reference}
                </div>
              </div>

              <div className="p-6 space-y-5">
                {/* Booking details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="text-[11px] text-gray-400 uppercase font-bold mb-1">Hotel</div>
                    <div className="text-sm font-bold text-gray-900">{confirmedBooking.hotelName}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="text-[11px] text-gray-400 uppercase font-bold mb-1">Room</div>
                    <div className="text-sm font-bold text-gray-900">{confirmedBooking.roomName}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="text-[11px] text-gray-400 uppercase font-bold mb-1">Check-in</div>
                    <div className="text-sm font-bold text-gray-900">
                      {new Date(confirmedBooking.checkInDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="text-[11px] text-gray-400 uppercase font-bold mb-1">Check-out</div>
                    <div className="text-sm font-bold text-gray-900">
                      {new Date(confirmedBooking.checkOutDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                  <div>
                    <div className="text-xs text-emerald-600 font-semibold">Total Paid</div>
                    <div className="text-2xl font-black text-emerald-800">{formatPrice(confirmedBooking.totalAmount)}</div>
                  </div>
                  <div className="text-right text-xs text-gray-500">
                    <div>{confirmedBooking.nights} Night{confirmedBooking.nights > 1 ? 's' : ''}</div>
                    <div>{confirmedBooking.guestsCount} Guest{confirmedBooking.guestsCount > 1 ? 's' : ''}</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsTicketModalOpen(true)}
                    className="w-full sm:w-auto flex-1 px-6 py-3 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
                  >
                    <Ticket className="w-4 h-4" />
                    View / Print Voucher
                  </button>

                  <Link
                    href="/bookings"
                    className="w-full sm:w-auto flex-1 px-6 py-3 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-bold text-sm transition text-center"
                  >
                    Go to My Bookings
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setStep('list');
                      setSelectedHotel(null);
                      setSelectedRoom(null);
                      setConfirmedBooking(null);
                    }}
                    className="w-full sm:w-auto flex-1 px-6 py-3 rounded-lg border-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50 font-bold text-sm transition text-center"
                  >
                    Book Another Hotel
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
        title="Simulated Hotel Stay Checkout"
        amount={totalAmount}
        breakdown={{ baseFare, taxes, resortFee }}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* Stay Voucher Modal */}
      <TicketModal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
        booking={confirmedBooking}
      />

      {/* Map Modal */}
      {mapHotel && (
        <MapModal
          item={mapHotel}
          items={hotels.filter(h => h.city === mapHotel.city)}
          isOpen={isMapOpen}
          onClose={() => { setIsMapOpen(false); setMapHotel(null); }}
          formatPrice={formatPrice}
        />
      )}
    </div>
  );
}
