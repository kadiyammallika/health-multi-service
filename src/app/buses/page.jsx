'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Bus,
  MapPin,
  Calendar,
  Users,
  Clock,
  ArrowRight,
  ArrowLeftRight,
  Filter,
  CheckCircle2,
  Ticket,
  Star,
  ShieldCheck,
  AlertCircle,
  Wifi,
  Zap,
  Droplets,
  Wind,
  Tv,
  ChevronDown,
  ChevronUp,
  X,
  Navigation,
  Phone,
  Mail,
  User,
  Search,
  SlidersHorizontal,
  MapPinned,
  CircleDot,
  Info,
  Armchair,
  BedDouble,
  Shield,
  BadgePercent,
  Radio,
  Eye,
  Sunrise,
  Sun,
  Sunset,
  Moon
} from 'lucide-react';
import { saveBooking } from '@/services/storage';
import PaymentModal from '@/components/ui/PaymentModal';
import TicketModal from '@/components/ui/TicketModal';
import DataSourceBanner from '@/components/ui/DataSourceBanner';
import { useCurrency } from '@/components/ui/CurrencyProvider';
import InlineCurrencySelector from '@/components/ui/InlineCurrencySelector';
import { ALL_CITIES, getCurrencyForCity, getCityLabel, filterCities, COUNTRY_NAMES } from '@/data/cities';

export default function BusesPage() {
  // Step state: 'results', 'seats', 'passenger', 'summary', 'confirmed'
  const [step, setStep] = useState('results');

  // Search parameters
  const [fromCity, setFromCity] = useState('');
  const [toCity, setToCity] = useState('');
  const [fromCitySearch, setFromCitySearch] = useState('');
  const [toCitySearch, setToCitySearch] = useState('');
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);
  const fromRef = useRef(null);
  const toRef = useRef(null);
  const [journeyDate, setJourneyDate] = useState('2026-11-18');
  const [busTypeFilter, setBusTypeFilter] = useState('all');

  // Filter panel states
  const [showFilters, setShowFilters] = useState(true);
  const [departureTimeFilter, setDepartureTimeFilter] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [operatorFilter, setOperatorFilter] = useState([]);
  const [amenityFilter, setAmenityFilter] = useState([]);
  const [sortBy, setSortBy] = useState('departure');

  // Selected bus & interactive seats
  const [selectedBus, setSelectedBus] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [selectedBoardingPoint, setSelectedBoardingPoint] = useState('');
  const [selectedDroppingPoint, setSelectedDroppingPoint] = useState('');
  const [activeDeck, setActiveDeck] = useState('lower');

  // Expandable bus card sections
  const [expandedBusId, setExpandedBusId] = useState(null);
  const [expandedSection, setExpandedSection] = useState('boarding');

  // Passenger details
  const [passengers, setPassengers] = useState([]);
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [formErrors, setFormErrors] = useState({});

  // Payment & confirmation
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

  // Dynamic data from database
  const [buses, setBuses] = useState([]);
  const [busCities, setBusCities] = useState([]);
  const [dataSource, setDataSource] = useState('provider');

  const { formatPrice, currency, rates, setCurrency } = useCurrency();

  // Reset currency to INR when leaving this page
  useEffect(() => {
    return () => setCurrency('INR');
  }, [setCurrency]);

  // Click-outside handler for dropdowns (same pattern as flights)
  useEffect(() => {
    function handleClickOutside(e) {
      if (fromRef.current && !fromRef.current.contains(e.target)) setShowFromDropdown(false);
      if (toRef.current && !toRef.current.contains(e.target)) setShowToDropdown(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle city selection with auto-currency (based on destination "To" city)
  const handleFromCitySelect = (cityName) => {
    setFromCity(cityName);
    setFromCitySearch(cityName);
    setShowFromDropdown(false);
  };

  const handleToCitySelect = (cityName) => {
    setToCity(cityName);
    setToCitySearch(cityName);
    setShowToDropdown(false);
    const newCurrency = getCurrencyForCity(cityName);
    setCurrency(newCurrency);
  };

  useEffect(() => {
    async function fetchBuses() {
      try {
        const res = await fetch('/api/buses');
        const data = await res.json();
        if (data.success && data.buses?.length > 0) {
          setBuses(data.buses);
          if (data.cities?.length > 0) setBusCities(data.cities);
          setDataSource('provider');
        } else {
          setBuses([]);
          setDataSource('provider');
        }
      } catch (err) {
        console.log('Failed to fetch buses from API');
        setBuses([]);
        setDataSource('provider');
      }
    }
    fetchBuses();
  }, []);

  // Deck matrix for interactive seat layout: Upper deck and Lower deck
  const lowerDeckSeats = ['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'L8', 'L9', 'L10', 'L11', 'L12'];
  const upperDeckSeats = ['U1', 'U2', 'U3', 'U4', 'U5', 'U6', 'U7', 'U8', 'U9', 'U10', 'U11', 'U12', 'U13', 'U14'];

  const swapCities = () => {
    const temp = fromCity;
    const tempSearch = fromCitySearch;
    setFromCity(toCity);
    setFromCitySearch(toCitySearch);
    setToCity(temp);
    setToCitySearch(tempSearch);
    // Update currency based on new destination
    const newCurrency = getCurrencyForCity(temp);
    setCurrency(newCurrency);
  };

  // Unique operators from bus data
  const uniqueOperators = [...new Set(buses.map(b => b.operator))];
  const allAmenities = [...new Set(buses.flatMap(b => Array.isArray(b.amenities) ? b.amenities : []))];

  // Departure time bucket helper
  const getTimeBucket = (timeStr) => {
    if (!timeStr) return '';
    const parts = timeStr.trim().split(/[\s:]+/);
    let hour = parseInt(parts[0]);
    const period = (parts[2] || '').toUpperCase();
    // Convert 12-hour to 24-hour format
    if (period === 'AM') {
      if (hour === 12) hour = 0;
    } else if (period === 'PM') {
      if (hour !== 12) hour += 12;
    }
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 24) return 'evening';
    return 'night';
  };

  const filteredBuses = buses.filter((bus) => {
    const routeMatch = (!fromCity && !toCity) ||
      (fromCity && (bus.fromCity || '').toLowerCase().includes(fromCity.toLowerCase())) ||
      (toCity && (bus.toCity || '').toLowerCase().includes(toCity.toLowerCase()));
    const typeMatch = busTypeFilter === 'all' || (bus.busType || '').toLowerCase().includes(busTypeFilter.toLowerCase());
    const timeMatch = departureTimeFilter.length === 0 || departureTimeFilter.includes(getTimeBucket(bus.departureTime));
    const priceMatch = bus.fare >= priceRange[0] && bus.fare <= priceRange[1];
    const operatorMatch = operatorFilter.length === 0 || operatorFilter.includes(bus.operator);
    const amenityMatch = amenityFilter.length === 0 || amenityFilter.every(a => (Array.isArray(bus.amenities) ? bus.amenities : []).includes(a));
    return routeMatch && typeMatch && timeMatch && priceMatch && operatorMatch && amenityMatch;
  }).sort((a, b) => {
    if (sortBy === 'price_low') return a.fare - b.fare;
    if (sortBy === 'price_high') return b.fare - a.fare;
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
    if (sortBy === 'departure') return (a.departureTime || '').localeCompare(b.departureTime || '');
    return 0;
  });

  const handleSelectBus = (bus) => {
    setSelectedBus(bus);
    setSelectedSeats([]);
    const bps = bus.boardingPoints || [];
    const dps = bus.droppingPoints || [];
    const firstBp = bps[0];
    const firstDp = dps[0];
    setSelectedBoardingPoint(firstBp ? (typeof firstBp === 'object' ? firstBp.name : firstBp) : '');
    setSelectedDroppingPoint(firstDp ? (typeof firstDp === 'object' ? firstDp.name : firstDp) : '');
    setStep('seats');
  };

  const handleToggleSeat = (seatId) => {
    if (!selectedBus) return;
    if ((selectedBus.bookedSeats || []).includes(seatId)) return;

    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seatId));
    } else {
      if (selectedSeats.length >= 6) {
        alert('You can select a maximum of 6 seats per transaction.');
        return;
      }
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  const handleProceedToPassengers = () => {
    if (selectedSeats.length === 0) {
      alert('Please select at least 1 seat to proceed.');
      return;
    }
    const list = selectedSeats.map((seat, idx) => ({
      name: '',
      age: '',
      gender: 'Male',
      seat
    }));
    setPassengers(list);
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
      if (!p.name.trim()) errors[`name_${idx}`] = 'Passenger name is required';
      if (!p.age || isNaN(p.age) || p.age < 1) errors[`age_${idx}`] = 'Valid age required';
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
  const seatFare = selectedBus?.fare || 0;
  const baseFare = seatFare * selectedSeats.length;
  const taxes = Math.round(baseFare * 0.05);
  const convenienceFee = 60;
  const totalAmount = baseFare + taxes + convenienceFee;

  const handlePaymentSuccess = async (paymentDetails) => {
    setIsPaymentOpen(false);

    const bookingRef = `BUS-${(selectedBus.operator || 'XX').substring(0, 2).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newBooking = {
      type: 'bus',
      categoryTitle: 'Bus Booking',
      reference: bookingRef,
      operator: selectedBus.operator,
      busType: selectedBus.busType,
      fromCity: selectedBus.fromCity,
      toCity: selectedBus.toCity,
      date: journeyDate,
      time: `${selectedBus.departureTime} - ${selectedBus.arrivalTime}`,
      selectedSeats,
      passengers,
      boardingPoint: selectedBoardingPoint,
      droppingPoint: selectedDroppingPoint,
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
      providerId: selectedBus.providerId || null,
      listingId: selectedBus.listingId || null,
      serviceName: selectedBus.operator || '',
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

  // Amenity icon mapping
  const getAmenityIcon = (amenity) => {
    if (!amenity) return <CheckCircle2 className="w-3.5 h-3.5" />;
    const lower = amenity.toLowerCase();
    if (lower.includes('wifi') || lower.includes('wi-fi')) return <Wifi className="w-3.5 h-3.5" />;
    if (lower.includes('charg') || lower.includes('power') || lower.includes('usb')) return <Zap className="w-3.5 h-3.5" />;
    if (lower.includes('water') || lower.includes('bottle')) return <Droplets className="w-3.5 h-3.5" />;
    if (lower.includes('ac') || lower.includes('air')) return <Wind className="w-3.5 h-3.5" />;
    if (lower.includes('tv') || lower.includes('entertainment') || lower.includes('screen')) return <Tv className="w-3.5 h-3.5" />;
    if (lower.includes('blanket') || lower.includes('pillow') || lower.includes('bed')) return <BedDouble className="w-3.5 h-3.5" />;
    if (lower.includes('track') || lower.includes('gps') || lower.includes('live')) return <Navigation className="w-3.5 h-3.5" />;
    if (lower.includes('seat') || lower.includes('reclin')) return <Armchair className="w-3.5 h-3.5" />;
    return <CheckCircle2 className="w-3.5 h-3.5" />;
  };

  // Get bus tags
  const getBusTags = (bus) => {
    const tags = [];
    const type = (bus.busType || '').toLowerCase();
    if (type.includes('ac') || type.includes('volvo')) tags.push({ label: 'AC', color: 'bg-blue-100 text-blue-700 border-blue-200' });
    if (type.includes('sleeper')) tags.push({ label: 'SLEEPER', color: 'bg-purple-100 text-purple-700 border-purple-200' });
    if ((bus.rating || 0) >= 4.5) tags.push({ label: 'PREMIUM', color: 'bg-amber-100 text-amber-800 border-amber-300' });
    if (bus.fare && bus.fare < 800) tags.push({ label: 'DEAL', color: 'bg-orange-100 text-orange-700 border-orange-200' });
    if ((Array.isArray(bus.amenities) ? bus.amenities : []).some(a => a.toLowerCase().includes('track') || a.toLowerCase().includes('gps'))) {
      tags.push({ label: 'GPS TRACKING', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' });
    }
    tags.push({ label: 'LIVE', color: 'bg-red-100 text-red-600 border-red-200' });
    return tags;
  };

  // Step progress data
  const steps = [
    { key: 'results', label: 'Select Bus', num: 1 },
    { key: 'seats', label: 'Pick Seats', num: 2 },
    { key: 'passenger', label: 'Passengers', num: 3 },
    { key: 'summary', label: 'Review & Pay', num: 4 },
    { key: 'confirmed', label: 'Confirmed', num: 5 }
  ];

  const currentStepIndex = steps.findIndex(s => s.key === step);

  const toggleDepartureTime = (bucket) => {
    setDepartureTimeFilter(prev =>
      prev.includes(bucket) ? prev.filter(t => t !== bucket) : [...prev, bucket]
    );
  };

  const toggleOperator = (op) => {
    setOperatorFilter(prev =>
      prev.includes(op) ? prev.filter(o => o !== op) : [...prev, op]
    );
  };

  const toggleAmenity = (amenity) => {
    setAmenityFilter(prev =>
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  const clearAllFilters = () => {
    setBusTypeFilter('all');
    setDepartureTimeFilter([]);
    setPriceRange([0, 5000]);
    setOperatorFilter([]);
    setAmenityFilter([]);
  };

  const activeFilterCount = (busTypeFilter !== 'all' ? 1 : 0) +
    departureTimeFilter.length + operatorFilter.length + amenityFilter.length;

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* ====== ORANGE SEARCH HEADER ====== */}
      <div className="bg-gradient-to-r from-[#f57c00] to-[#ef6c00] shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          {/* Top row: logo + progress */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Bus className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Bus Tickets</h1>
                <p className="text-[11px] text-orange-100">Verified operators with live tracking</p>
              </div>
            </div>

            {/* Step progress pills */}
            <div className="hidden md:flex items-center gap-1">
              {steps.map((s, i) => (
                <div key={s.key} className="flex items-center">
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    i === currentStepIndex
                      ? 'bg-white text-[#f57c00] shadow-md'
                      : i < currentStepIndex
                      ? 'bg-white/30 text-white'
                      : 'bg-white/10 text-orange-200'
                  }`}>
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      i === currentStepIndex
                        ? 'bg-[#f57c00] text-white'
                        : i < currentStepIndex
                        ? 'bg-white/40 text-white'
                        : 'bg-white/10 text-orange-300'
                    }`}>
                      {i < currentStepIndex ? '\u2713' : s.num}
                    </span>
                    <span className="hidden lg:inline">{s.label}</span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`w-4 h-0.5 mx-0.5 ${i < currentStepIndex ? 'bg-white/40' : 'bg-white/10'}`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Currency selector - in dark header like flights */}
          <div className="flex justify-end mb-3">
            <InlineCurrencySelector variant="dark" />
          </div>

          {/* Search bar row */}
          <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* From city - Searchable */}
              <div className="flex-1 relative" ref={fromRef}>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1 tracking-wider">From</label>
                <div className="flex items-center gap-2">
                  <CircleDot className="w-4 h-4 text-[#f57c00] shrink-0" />
                  <input
                    type="text"
                    placeholder="Search city..."
                    value={fromCitySearch}
                    onChange={(e) => { setFromCitySearch(e.target.value); setShowFromDropdown(true); }}
                    onFocus={() => { setShowFromDropdown(true); setFromCitySearch(''); }}
                    className="w-full bg-transparent font-bold text-gray-800 text-sm focus:outline-none border-b-2 border-transparent focus:border-[#f57c00] pb-1 transition-colors placeholder-gray-400"
                  />
                  {fromCity && (
                    <button onClick={() => { setFromCity(''); setFromCitySearch(''); }} className="text-gray-400 hover:text-gray-600">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                {showFromDropdown && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-56 overflow-y-auto z-50">
                    <button onClick={() => { handleFromCitySelect(''); setFromCitySearch(''); }} className="w-full text-left px-4 py-2 hover:bg-orange-50 text-sm font-medium text-gray-600 border-b border-gray-100">All Cities</button>
                    {filterCities(fromCitySearch).slice(0, 50).map((city) => (
                      <button
                        key={`${city.name}-${city.country}`}
                        onClick={() => handleFromCitySelect(city.name)}
                        className="w-full text-left px-4 py-2 hover:bg-orange-50 text-sm flex justify-between"
                      >
                        <span className="font-medium text-gray-800">{city.name}</span>
                        <span className="text-xs text-gray-400">{city.country === 'IN' ? city.state : getCityLabel(city).split(', ')[1]}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Swap button */}
              <button
                type="button"
                onClick={swapCities}
                className="self-center w-9 h-9 rounded-full border-2 border-[#f57c00] text-[#f57c00] hover:bg-[#f57c00] hover:text-white flex items-center justify-center transition-all shrink-0"
              >
                <ArrowLeftRight className="w-4 h-4" />
              </button>

              {/* To city - Searchable */}
              <div className="flex-1 relative" ref={toRef}>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1 tracking-wider">To</label>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#c62828] shrink-0" />
                  <input
                    type="text"
                    placeholder="Search city..."
                    value={toCitySearch}
                    onChange={(e) => { setToCitySearch(e.target.value); setShowToDropdown(true); }}
                    onFocus={() => { setShowToDropdown(true); setToCitySearch(''); setToCity(''); setCurrency('INR'); }}
                    className="w-full bg-transparent font-bold text-gray-800 text-sm focus:outline-none border-b-2 border-transparent focus:border-[#c62828] pb-1 transition-colors placeholder-gray-400"
                  />
                  {toCity && (
                    <button onClick={() => { setToCity(''); setToCitySearch(''); setCurrency('INR'); }} className="text-gray-400 hover:text-gray-600">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                {showToDropdown && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-56 overflow-y-auto z-50">
                    <button onClick={() => { handleToCitySelect(''); setToCitySearch(''); }} className="w-full text-left px-4 py-2 hover:bg-red-50 text-sm font-medium text-gray-600 border-b border-gray-100">All Cities</button>
                    {filterCities(toCitySearch).slice(0, 50).map((city) => (
                      <button
                        key={`${city.name}-${city.country}`}
                        onClick={() => handleToCitySelect(city.name)}
                        className="w-full text-left px-4 py-2 hover:bg-red-50 text-sm flex justify-between"
                      >
                        <span className="font-medium text-gray-800">{city.name}</span>
                        <span className="text-xs text-gray-400">{city.country === 'IN' ? city.state : getCityLabel(city).split(', ')[1]}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="hidden sm:block w-px h-12 bg-gray-200" />

              {/* Date */}
              <div className="flex-1">
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1 tracking-wider">Date of Journey</label>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500 shrink-0" />
                  <input
                    type="date"
                    value={journeyDate}
                    onChange={(e) => setJourneyDate(e.target.value)}
                    className="w-full bg-transparent font-bold text-gray-800 text-sm focus:outline-none cursor-pointer border-b-2 border-transparent focus:border-[#f57c00] pb-1"
                  />
                </div>
              </div>

              {/* Search button */}
              <button
                type="button"
                onClick={() => setStep('results')}
                className="px-6 py-3 sm:py-0 sm:h-12 rounded-lg bg-[#c62828] hover:bg-[#b71c1c] text-white font-bold text-sm shadow-lg shadow-red-900/20 transition-all flex items-center justify-center gap-2 shrink-0"
              >
                <Search className="w-4 h-4" />
                <span>Search Buses</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ====== MAIN CONTENT ====== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* STEP 1: BUS RESULTS WITH SIDEBAR FILTERS */}
        {step === 'results' && (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* -------- LEFT SIDEBAR FILTERS -------- */}
            <div className="lg:w-[280px] shrink-0">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden sticky top-4">
                {/* Filter header */}
                <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-[#f57c00]" />
                    <span className="text-sm font-bold text-gray-800">Filters</span>
                    {activeFilterCount > 0 && (
                      <span className="w-5 h-5 rounded-full bg-[#f57c00] text-white text-[10px] font-bold flex items-center justify-center">
                        {activeFilterCount}
                      </span>
                    )}
                  </div>
                  {activeFilterCount > 0 && (
                    <button onClick={clearAllFilters} className="text-xs text-[#c62828] font-semibold hover:underline">
                      Clear All
                    </button>
                  )}
                </div>

                {/* Bus Type Filter */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">Bus Type</h4>
                  <div className="space-y-2">
                    {[
                      { value: 'all', label: 'All Types' },
                      { value: 'sleeper', label: 'AC Sleeper' },
                      { value: 'volvo', label: 'Volvo / Multi-Axle' },
                      { value: 'seater', label: 'AC Seater' },
                      { value: 'non-ac', label: 'Non-AC' }
                    ].map(opt => (
                      <label key={opt.value} className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="radio"
                          name="busType"
                          checked={busTypeFilter === opt.value}
                          onChange={() => setBusTypeFilter(opt.value)}
                          className="w-3.5 h-3.5 text-[#f57c00] accent-[#f57c00]"
                        />
                        <span className="text-xs text-gray-600 group-hover:text-gray-900 transition">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Departure Time Filter */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">Departure Time</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { bucket: 'morning', label: 'Morning', sub: '6AM - 12PM', icon: <Sunrise className="w-3.5 h-3.5" /> },
                      { bucket: 'afternoon', label: 'Afternoon', sub: '12PM - 6PM', icon: <Sun className="w-3.5 h-3.5" /> },
                      { bucket: 'evening', label: 'Evening', sub: '6PM - 12AM', icon: <Sunset className="w-3.5 h-3.5" /> },
                      { bucket: 'night', label: 'Night', sub: '12AM - 6AM', icon: <Moon className="w-3.5 h-3.5" /> }
                    ].map(t => (
                      <button
                        key={t.bucket}
                        type="button"
                        onClick={() => toggleDepartureTime(t.bucket)}
                        className={`p-2 rounded-lg border text-center transition-all ${
                          departureTimeFilter.includes(t.bucket)
                            ? 'border-[#f57c00] bg-orange-50 text-[#f57c00]'
                            : 'border-gray-200 text-gray-500 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-center mb-0.5">{t.icon}</div>
                        <div className="text-[10px] font-semibold">{t.label}</div>
                        <div className="text-[9px] opacity-70">{t.sub}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">Price Range</h4>
                  <div className="flex items-center justify-between text-[11px] text-gray-500 mb-2">
                    <span>Min: {formatPrice(priceRange[0])}</span>
                    <span>Max: {formatPrice(priceRange[1])}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="5000"
                    step="100"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#f57c00]"
                  />
                </div>

                {/* Operator Filter */}
                {uniqueOperators.length > 0 && (
                  <div className="px-4 py-3 border-b border-gray-100">
                    <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">Bus Operators</h4>
                    <div className="space-y-2 max-h-36 overflow-y-auto">
                      {uniqueOperators.map(op => (
                        <label key={op} className="flex items-center gap-2 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={operatorFilter.includes(op)}
                            onChange={() => toggleOperator(op)}
                            className="w-3.5 h-3.5 rounded accent-[#f57c00]"
                          />
                          <span className="text-xs text-gray-600 group-hover:text-gray-900 transition truncate">{op}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Amenities Filter */}
                {allAmenities.length > 0 && (
                  <div className="px-4 py-3">
                    <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">Amenities</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {allAmenities.slice(0, 10).map(amenity => (
                        <button
                          key={amenity}
                          type="button"
                          onClick={() => toggleAmenity(amenity)}
                          className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium border transition-all ${
                            amenityFilter.includes(amenity)
                              ? 'border-[#f57c00] bg-orange-50 text-[#f57c00]'
                              : 'border-gray-200 text-gray-500 hover:border-gray-300'
                          }`}
                        >
                          {getAmenityIcon(amenity)}
                          <span>{amenity}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* -------- RIGHT: BUS RESULT CARDS -------- */}
            <div className="flex-1 space-y-4">
              {/* Sort bar */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Bus className="w-4 h-4 text-[#f57c00]" />
                  <span className="font-semibold text-gray-800">{filteredBuses.length}</span>
                  <span>buses found</span>
                  {fromCity && toCity && (
                    <span className="text-gray-400">on {fromCity} to {toCity}</span>
                  )}
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100">
                    OneConnect API
                  </span>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[10px] font-bold border border-purple-100">
                    Provider Listed
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 hidden sm:inline">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="text-xs font-semibold text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#f57c00]"
                  >
                    <option value="departure">Departure Time</option>
                    <option value="price_low">Price: Low to High</option>
                    <option value="price_high">Price: High to Low</option>
                    <option value="rating">Rating</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
                  >
                    <Filter className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Data Sources Banner */}
              <DataSourceBanner
                sources={['supabase', 'oneconnect', 'unsplash']}
                counts={{
                  supabase: buses.filter(b => b.source === 'provider').length,
                  oneconnect: buses.filter(b => b.source === 'live').length,
                  total: filteredBuses.length,
                }}
              />

              {/* Bus cards */}
              {filteredBuses.length === 0 && (
                <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
                  <Bus className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-gray-700">No buses available</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    {buses.length === 0
                      ? 'No providers have listed buses yet. Check back soon!'
                      : 'Try adjusting your filters or search criteria'}
                  </p>
                  {buses.length > 0 && (
                    <button
                      onClick={clearAllFilters}
                      className="mt-4 px-4 py-2 rounded-lg bg-[#f57c00] text-white text-xs font-bold hover:bg-[#ef6c00] transition"
                    >
                      Clear All Filters
                    </button>
                  )}
                </div>
              )}

              {filteredBuses.map((bus) => {
                const isExpanded = expandedBusId === bus.id;
                const tags = getBusTags(bus);

                return (
                  <div key={bus.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                    {/* Main bus card content */}
                    <div className="p-4 sm:p-5">
                      {/* Row 1: Operator name + bus type + rating + tags */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-gray-900 text-base">{bus.operator}</h3>
                          <span className="text-xs text-gray-500 font-medium">{bus.busType}</span>
                          {bus.source === 'provider' && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-50 text-purple-600 border border-purple-200">Provider Listed</span>
                          )}
                          {bus.source === 'live' && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-50 text-blue-600 border border-blue-200">OneConnect API</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {tags.slice(0, 4).map((tag, i) => (
                            <span key={i} className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${tag.color}`}>
                              {tag.label}
                            </span>
                          ))}
                          <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200">
                            <Star className="w-3 h-3 fill-emerald-500 text-emerald-500" />
                            <span className="text-xs font-bold text-emerald-700">{bus.rating}</span>
                          </div>
                        </div>
                      </div>

                      {/* Row 2: Departure -> Duration -> Arrival */}
                      <div className="flex items-center justify-between gap-4 mb-3">
                        <div className="text-center sm:text-left">
                          <div className="text-xl font-black text-gray-900">{bus.departureTime}</div>
                          <div className="text-xs text-gray-500 font-medium">{bus.fromCity}</div>
                        </div>

                        <div className="flex-1 flex flex-col items-center px-2">
                          <span className="text-[11px] font-semibold text-gray-400">{bus.duration}</span>
                          <div className="w-full max-w-[200px] flex items-center my-1">
                            <div className="w-2 h-2 rounded-full border-2 border-[#f57c00]" />
                            <div className="flex-1 h-[2px] bg-gray-200 relative">
                              <div className="absolute inset-0 bg-gradient-to-r from-[#f57c00] to-[#ef6c00] rounded-full" style={{ width: '60%' }} />
                            </div>
                            <div className="w-2 h-2 rounded-full bg-[#c62828]" />
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-medium">
                            <Radio className="w-2.5 h-2.5" />
                            <span>Live Tracking</span>
                          </div>
                        </div>

                        <div className="text-center sm:text-right">
                          <div className="text-xl font-black text-gray-900">{bus.arrivalTime}</div>
                          <div className="text-xs text-gray-500 font-medium">{bus.toCity}</div>
                        </div>
                      </div>

                      {/* Row 3: Amenities icons */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {(Array.isArray(bus.amenities) ? bus.amenities : []).map((amenity, i) => (
                          <div key={i} className="flex items-center gap-1 text-gray-500 bg-gray-50 rounded-md px-2 py-1">
                            {getAmenityIcon(amenity)}
                            <span className="text-[10px] font-medium">{amenity}</span>
                          </div>
                        ))}
                      </div>

                      {/* Row 4: Price + Seats available + Select button */}
                      <div className="flex flex-wrap items-end justify-between gap-3 pt-3 border-t border-gray-100">
                        <div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-[11px] text-gray-400 line-through">{formatPrice(Math.round(bus.fare * 1.15))}</span>
                            <span className="text-2xl font-black text-gray-900">{formatPrice(bus.fare)}</span>
                          </div>
                          <span className="text-[10px] text-gray-400">per seat</span>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1 text-[11px] font-medium">
                            <Armchair className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-emerald-600">{bus.availableSeatsCount} seats left</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleSelectBus(bus)}
                            className="px-5 py-2.5 rounded-lg bg-[#f57c00] hover:bg-[#ef6c00] text-white font-bold text-sm shadow-md shadow-orange-600/20 transition-all flex items-center gap-2"
                          >
                            <span>Select Seats</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Expandable section toggle */}
                    <div className="border-t border-gray-100">
                      <div className="flex">
                        {['boarding', 'cancellation', 'reviews'].map((section) => (
                          <button
                            key={section}
                            type="button"
                            onClick={() => {
                              if (isExpanded && expandedSection === section) {
                                setExpandedBusId(null);
                              } else {
                                setExpandedBusId(bus.id);
                                setExpandedSection(section);
                              }
                            }}
                            className={`flex-1 px-3 py-2 text-[11px] font-semibold text-center border-r last:border-r-0 border-gray-100 transition-colors ${
                              isExpanded && expandedSection === section
                                ? 'text-[#f57c00] bg-orange-50'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {section === 'boarding' && 'Boarding & Dropping Points'}
                            {section === 'cancellation' && 'Cancellation Policy'}
                            {section === 'reviews' && 'Reviews'}
                            {isExpanded && expandedSection === section
                              ? <ChevronUp className="w-3 h-3 inline ml-1" />
                              : <ChevronDown className="w-3 h-3 inline ml-1" />
                            }
                          </button>
                        ))}
                      </div>

                      {/* Expanded content */}
                      {isExpanded && (
                        <div className="px-5 py-4 bg-gray-50 border-t border-gray-100">
                          {expandedSection === 'boarding' && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                              <div>
                                <h5 className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1.5">
                                  <CircleDot className="w-3.5 h-3.5 text-[#f57c00]" />
                                  Boarding Points
                                </h5>
                                <div className="space-y-1.5">
                                  {(bus.boardingPoints || []).map((bp, i) => (
                                    <div key={i} className="flex items-center justify-between text-xs text-gray-600 bg-white rounded-lg px-3 py-2 border border-gray-100">
                                      <div className="flex items-center gap-2">
                                        <MapPin className="w-3 h-3 text-[#f57c00] shrink-0" />
                                        <span>{typeof bp === 'object' ? bp.name : bp}</span>
                                      </div>
                                      {typeof bp === 'object' && bp.time && <span className="text-gray-400">{bp.time}</span>}
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <h5 className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1.5">
                                  <MapPinned className="w-3.5 h-3.5 text-[#c62828]" />
                                  Dropping Points
                                </h5>
                                <div className="space-y-1.5">
                                  {(bus.droppingPoints || []).map((dp, i) => (
                                    <div key={i} className="flex items-center justify-between text-xs text-gray-600 bg-white rounded-lg px-3 py-2 border border-gray-100">
                                      <div className="flex items-center gap-2">
                                        <MapPin className="w-3 h-3 text-[#c62828] shrink-0" />
                                        <span>{typeof dp === 'object' ? dp.name : dp}</span>
                                      </div>
                                      {typeof dp === 'object' && dp.time && <span className="text-gray-400">{dp.time}</span>}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}

                          {expandedSection === 'cancellation' && (
                            <div className="space-y-3">
                              <div className="flex items-start gap-2 text-xs">
                                <Info className="w-4 h-4 text-[#f57c00] shrink-0 mt-0.5" />
                                <span className="text-gray-600">Cancellation charges vary based on the time of cancellation. Please check the operator's policy before booking.</span>
                              </div>
                              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                <table className="w-full text-xs">
                                  <thead>
                                    <tr className="bg-gray-50 text-gray-500">
                                      <th className="text-left px-3 py-2 font-semibold">Time before departure</th>
                                      <th className="text-right px-3 py-2 font-semibold">Cancellation charge</th>
                                    </tr>
                                  </thead>
                                  <tbody className="text-gray-700">
                                    <tr className="border-t border-gray-100">
                                      <td className="px-3 py-2">More than 48 hrs</td>
                                      <td className="text-right px-3 py-2 text-emerald-600 font-semibold">10% of fare</td>
                                    </tr>
                                    <tr className="border-t border-gray-100">
                                      <td className="px-3 py-2">24 - 48 hrs</td>
                                      <td className="text-right px-3 py-2 text-amber-600 font-semibold">25% of fare</td>
                                    </tr>
                                    <tr className="border-t border-gray-100">
                                      <td className="px-3 py-2">12 - 24 hrs</td>
                                      <td className="text-right px-3 py-2 text-orange-600 font-semibold">50% of fare</td>
                                    </tr>
                                    <tr className="border-t border-gray-100">
                                      <td className="px-3 py-2">Less than 12 hrs</td>
                                      <td className="text-right px-3 py-2 text-red-600 font-semibold">No refund</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}

                          {expandedSection === 'reviews' && (
                            <div className="space-y-3">
                              <div className="flex items-center gap-3">
                                <div className="w-14 h-14 rounded-xl bg-emerald-50 flex flex-col items-center justify-center">
                                  <span className="text-xl font-black text-emerald-700">{bus.rating}</span>
                                  <div className="flex gap-0.5">
                                    {[1, 2, 3, 4, 5].map(s => (
                                      <Star key={s} className={`w-2 h-2 ${s <= Math.round(bus.rating) ? 'fill-emerald-500 text-emerald-500' : 'text-gray-300'}`} />
                                    ))}
                                  </div>
                                </div>
                                <div className="text-xs text-gray-500">
                                  <p className="font-semibold text-gray-700">Based on traveller reviews</p>
                                  <p>Punctuality, Cleanliness, and Comfort rated highly</p>
                                </div>
                              </div>
                              <div className="space-y-2">
                                {[
                                  { user: 'Priya S.', text: 'Very comfortable journey, AC was working perfectly. Bus was on time.', rating: 5 },
                                  { user: 'Rahul K.', text: 'Good service and clean bus. Boarding point was easy to find.', rating: 4 }
                                ].map((review, i) => (
                                  <div key={i} className="bg-white rounded-lg p-3 border border-gray-100">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-xs font-bold text-gray-700">{review.user}</span>
                                      <div className="flex gap-0.5">
                                        {[1, 2, 3, 4, 5].map(s => (
                                          <Star key={s} className={`w-2.5 h-2.5 ${s <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                                        ))}
                                      </div>
                                    </div>
                                    <p className="text-[11px] text-gray-500">{review.text}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ====== STEP 2: SEAT SELECTION ====== */}
        {step === 'seats' && selectedBus && (
          <div className="max-w-5xl mx-auto space-y-5">
            {/* Bus info banner */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#f57c00] text-white flex items-center justify-center">
                  <Bus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{selectedBus.operator}</h3>
                  <p className="text-xs text-gray-500">
                    {selectedBus.fromCity} to {selectedBus.toCity} | {journeyDate} | Dep: {selectedBus.departureTime}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStep('results')}
                className="text-xs font-semibold text-[#f57c00] hover:text-[#ef6c00] flex items-center gap-1"
              >
                <ArrowRight className="w-3 h-3 rotate-180" />
                Change Bus
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Seat map area */}
              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Deck tabs */}
                <div className="flex border-b border-gray-100">
                  <button
                    type="button"
                    onClick={() => setActiveDeck('lower')}
                    className={`flex-1 py-3 text-sm font-bold text-center transition-colors ${
                      activeDeck === 'lower'
                        ? 'text-[#f57c00] border-b-2 border-[#f57c00] bg-orange-50/50'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Lower Deck
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveDeck('upper')}
                    className={`flex-1 py-3 text-sm font-bold text-center transition-colors ${
                      activeDeck === 'upper'
                        ? 'text-[#f57c00] border-b-2 border-[#f57c00] bg-orange-50/50'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Upper Deck
                  </button>
                </div>

                <div className="p-5">
                  {/* Legend */}
                  <div className="flex items-center justify-center gap-5 mb-5">
                    <div className="flex items-center gap-1.5">
                      <div className="w-7 h-7 rounded-md border-2 border-emerald-400 bg-white" />
                      <span className="text-[11px] text-gray-600 font-medium">Available</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-7 h-7 rounded-md bg-[#f57c00] border-2 border-[#ef6c00]" />
                      <span className="text-[11px] text-gray-900 font-bold">Selected</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-7 h-7 rounded-md bg-gray-200 border-2 border-gray-300" />
                      <span className="text-[11px] text-gray-400 font-medium">Booked</span>
                    </div>
                  </div>

                  {/* Bus outline with seats */}
                  <div className="relative max-w-md mx-auto bg-gray-50 rounded-2xl border-2 border-gray-200 p-5 pt-10">
                    {/* Driver indicator */}
                    <div className="absolute top-2 right-4 flex items-center gap-1.5 text-gray-400">
                      <div className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center">
                        <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                      </div>
                      <span className="text-[10px] font-semibold">Driver</span>
                    </div>

                    {/* Seat grid */}
                    {activeDeck === 'lower' && (
                      <div className="space-y-3">
                        {/* Row layout: 2 seats | aisle | 2 seats */}
                        {[0, 1, 2].map(row => (
                          <div key={row} className="flex items-center justify-center gap-3">
                            <div className="flex gap-2">
                              {lowerDeckSeats.slice(row * 4, row * 4 + 2).map(seat => {
                                const isBooked = (selectedBus.bookedSeats || []).includes(seat);
                                const isSelected = selectedSeats.includes(seat);
                                return (
                                  <button
                                    key={seat}
                                    type="button"
                                    disabled={isBooked}
                                    onClick={() => handleToggleSeat(seat)}
                                    className={`w-14 h-14 rounded-lg text-xs font-bold transition-all flex flex-col items-center justify-center border-2 ${
                                      isBooked
                                        ? 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed'
                                        : isSelected
                                        ? 'bg-[#f57c00] text-white border-[#ef6c00] shadow-lg shadow-orange-500/30 scale-105'
                                        : 'bg-white text-gray-700 border-emerald-300 hover:border-[#f57c00] hover:bg-orange-50 cursor-pointer'
                                    }`}
                                  >
                                    <Armchair className="w-4 h-4 mb-0.5 opacity-70" />
                                    <span className="font-mono text-[10px]">{seat}</span>
                                    <span className="text-[8px] opacity-60">{formatPrice(selectedBus.fare)}</span>
                                  </button>
                                );
                              })}
                            </div>
                            {/* Aisle */}
                            <div className="w-8 flex items-center justify-center">
                              <div className="w-0.5 h-10 bg-gray-200 rounded-full" />
                            </div>
                            <div className="flex gap-2">
                              {lowerDeckSeats.slice(row * 4 + 2, row * 4 + 4).map(seat => {
                                const isBooked = (selectedBus.bookedSeats || []).includes(seat);
                                const isSelected = selectedSeats.includes(seat);
                                return (
                                  <button
                                    key={seat}
                                    type="button"
                                    disabled={isBooked}
                                    onClick={() => handleToggleSeat(seat)}
                                    className={`w-14 h-14 rounded-lg text-xs font-bold transition-all flex flex-col items-center justify-center border-2 ${
                                      isBooked
                                        ? 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed'
                                        : isSelected
                                        ? 'bg-[#f57c00] text-white border-[#ef6c00] shadow-lg shadow-orange-500/30 scale-105'
                                        : 'bg-white text-gray-700 border-emerald-300 hover:border-[#f57c00] hover:bg-orange-50 cursor-pointer'
                                    }`}
                                  >
                                    <Armchair className="w-4 h-4 mb-0.5 opacity-70" />
                                    <span className="font-mono text-[10px]">{seat}</span>
                                    <span className="text-[8px] opacity-60">{formatPrice(selectedBus.fare)}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {activeDeck === 'upper' && (
                      <div className="space-y-3">
                        {/* Upper deck: sleeper berths, wider */}
                        {[0, 1, 2, 3].map(row => {
                          const startIdx = row * 4;
                          const endIdx = Math.min(startIdx + 4, upperDeckSeats.length);
                          const rowSeats = upperDeckSeats.slice(startIdx, endIdx);
                          if (rowSeats.length === 0) return null;
                          return (
                            <div key={row} className="flex items-center justify-center gap-3">
                              <div className="flex gap-2">
                                {rowSeats.slice(0, 2).map(seat => {
                                  const isBooked = (selectedBus.bookedSeats || []).includes(seat);
                                  const isSelected = selectedSeats.includes(seat);
                                  return (
                                    <button
                                      key={seat}
                                      type="button"
                                      disabled={isBooked}
                                      onClick={() => handleToggleSeat(seat)}
                                      className={`w-14 h-14 rounded-lg text-xs font-bold transition-all flex flex-col items-center justify-center border-2 ${
                                        isBooked
                                          ? 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed'
                                          : isSelected
                                          ? 'bg-[#f57c00] text-white border-[#ef6c00] shadow-lg shadow-orange-500/30 scale-105'
                                          : 'bg-white text-gray-700 border-emerald-300 hover:border-[#f57c00] hover:bg-orange-50 cursor-pointer'
                                      }`}
                                    >
                                      <BedDouble className="w-4 h-4 mb-0.5 opacity-70" />
                                      <span className="font-mono text-[10px]">{seat}</span>
                                      <span className="text-[8px] opacity-60">{formatPrice(selectedBus.fare)}</span>
                                    </button>
                                  );
                                })}
                              </div>
                              <div className="w-8 flex items-center justify-center">
                                <div className="w-0.5 h-10 bg-gray-200 rounded-full" />
                              </div>
                              <div className="flex gap-2">
                                {rowSeats.slice(2, 4).map(seat => {
                                  const isBooked = (selectedBus.bookedSeats || []).includes(seat);
                                  const isSelected = selectedSeats.includes(seat);
                                  return (
                                    <button
                                      key={seat}
                                      type="button"
                                      disabled={isBooked}
                                      onClick={() => handleToggleSeat(seat)}
                                      className={`w-14 h-14 rounded-lg text-xs font-bold transition-all flex flex-col items-center justify-center border-2 ${
                                        isBooked
                                          ? 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed'
                                          : isSelected
                                          ? 'bg-[#f57c00] text-white border-[#ef6c00] shadow-lg shadow-orange-500/30 scale-105'
                                          : 'bg-white text-gray-700 border-emerald-300 hover:border-[#f57c00] hover:bg-orange-50 cursor-pointer'
                                      }`}
                                    >
                                      <BedDouble className="w-4 h-4 mb-0.5 opacity-70" />
                                      <span className="font-mono text-[10px]">{seat}</span>
                                      <span className="text-[8px] opacity-60">{formatPrice(selectedBus.fare)}</span>
                                    </button>
                                  );
                                })}
                                {/* fill empty slot for last row with 2 seats */}
                                {rowSeats.length < 4 && rowSeats.length > 2 && (
                                  <div className="w-14 h-14" />
                                )}
                              </div>
                              {/* fill empty right side for 2-seat rows */}
                              {rowSeats.length <= 2 && (
                                <>
                                  <div className="w-8" />
                                  <div className="flex gap-2">
                                    {Array.from({ length: 2 - Math.max(0, rowSeats.length - 2) }).map((_, k) => (
                                      <div key={k} className="w-14 h-14" />
                                    ))}
                                  </div>
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right sidebar: Boarding/Dropping + Summary */}
              <div className="space-y-4">
                {/* Boarding point selection */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-3">
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                    <CircleDot className="w-3.5 h-3.5 text-[#f57c00]" />
                    Boarding Point
                  </h4>
                  <div className="space-y-1.5">
                    {(selectedBus.boardingPoints || []).map((bp, i) => {
                      const bpName = typeof bp === 'object' ? bp.name : bp;
                      const bpTime = typeof bp === 'object' ? bp.time : null;
                      return (
                        <label
                          key={i}
                          className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all ${
                            selectedBoardingPoint === bpName
                              ? 'border-[#f57c00] bg-orange-50'
                              : 'border-gray-100 hover:border-gray-200'
                          }`}
                        >
                          <input
                            type="radio"
                            name="boardingPoint"
                            checked={selectedBoardingPoint === bpName}
                            onChange={() => setSelectedBoardingPoint(bpName)}
                            className="w-3.5 h-3.5 accent-[#f57c00]"
                          />
                          <div className="flex items-center gap-1.5 flex-1">
                            <MapPin className="w-3 h-3 text-[#f57c00]" />
                            <span className="text-xs text-gray-700 font-medium">{bpName}</span>
                            {bpTime && <span className="text-xs text-gray-400 ml-auto">{bpTime}</span>}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Dropping point selection */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-3">
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPinned className="w-3.5 h-3.5 text-[#c62828]" />
                    Dropping Point
                  </h4>
                  <div className="space-y-1.5">
                    {(selectedBus.droppingPoints || []).map((dp, i) => {
                      const dpName = typeof dp === 'object' ? dp.name : dp;
                      const dpTime = typeof dp === 'object' ? dp.time : null;
                      return (
                        <label
                          key={i}
                          className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all ${
                            selectedDroppingPoint === dpName
                              ? 'border-[#c62828] bg-red-50'
                              : 'border-gray-100 hover:border-gray-200'
                          }`}
                        >
                          <input
                            type="radio"
                            name="droppingPoint"
                            checked={selectedDroppingPoint === dpName}
                            onChange={() => setSelectedDroppingPoint(dpName)}
                            className="w-3.5 h-3.5 accent-[#c62828]"
                          />
                          <div className="flex items-center gap-1.5 flex-1">
                            <MapPin className="w-3 h-3 text-[#c62828]" />
                            <span className="text-xs text-gray-700 font-medium">{dpName}</span>
                            {dpTime && <span className="text-xs text-gray-400 ml-auto">{dpTime}</span>}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Fare summary sidebar */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-3">
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Fare Summary</h4>

                  {selectedSeats.length > 0 ? (
                    <>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {selectedSeats.map(seat => (
                            <span key={seat} className="px-2 py-0.5 rounded bg-orange-100 text-[#f57c00] text-[11px] font-bold font-mono">
                              {seat}
                            </span>
                          ))}
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>{selectedSeats.length} seat(s) x {formatPrice(seatFare)}</span>
                          <span className="font-semibold text-gray-800">{formatPrice(baseFare)}</span>
                        </div>
                      </div>
                      <div className="border-t border-gray-100 pt-2 flex justify-between items-baseline">
                        <span className="text-xs text-gray-500">Estimated Total</span>
                        <span className="text-xl font-black text-[#f57c00]">{formatPrice(baseFare)}</span>
                      </div>
                    </>
                  ) : (
                    <p className="text-xs text-gray-400 text-center py-3">Select seats to see fare</p>
                  )}

                  <button
                    type="button"
                    onClick={handleProceedToPassengers}
                    disabled={selectedSeats.length === 0}
                    className={`w-full py-3 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                      selectedSeats.length > 0
                        ? 'bg-[#f57c00] hover:bg-[#ef6c00] text-white shadow-md shadow-orange-500/20'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <span>Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ====== STEP 3: PASSENGER DETAILS ====== */}
        {step === 'passenger' && selectedBus && (
          <div className="max-w-3xl mx-auto space-y-5">
            {/* Bus summary bar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#f57c00] text-white flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Passenger Details</h3>
                  <p className="text-xs text-gray-500">
                    {selectedBus.operator} | {selectedBus.fromCity} to {selectedBus.toCity} | Seats: {selectedSeats.join(', ')}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStep('seats')}
                className="text-xs font-semibold text-[#f57c00] hover:text-[#ef6c00] flex items-center gap-1"
              >
                <ArrowRight className="w-3 h-3 rotate-180" />
                Back to Seats
              </button>
            </div>

            <form onSubmit={handleProceedToSummary} className="space-y-5">
              {/* Passenger cards */}
              {passengers.map((p, idx) => (
                <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#f57c00] text-white flex items-center justify-center text-xs font-bold">
                        {idx + 1}
                      </div>
                      <span className="text-sm font-bold text-gray-800">Passenger {idx + 1}</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-md bg-orange-100 text-[#f57c00] text-xs font-bold font-mono">
                      Seat {p.seat}
                    </span>
                  </div>

                  <div className="p-5">
                    <div className="grid grid-cols-1 sm:grid-cols-6 gap-4">
                      <div className="sm:col-span-3">
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                          <User className="w-3 h-3 inline mr-1 text-gray-400" />
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={p.name}
                          onChange={(e) => handlePassengerChange(idx, 'name', e.target.value)}
                          placeholder="Enter full name"
                          className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#f57c00] focus:border-transparent transition"
                          required
                        />
                        {formErrors[`name_${idx}`] && (
                          <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {formErrors[`name_${idx}`]}
                          </p>
                        )}
                      </div>

                      <div className="sm:col-span-1">
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Age</label>
                        <input
                          type="number"
                          value={p.age}
                          onChange={(e) => handlePassengerChange(idx, 'age', e.target.value)}
                          placeholder="Age"
                          className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#f57c00] focus:border-transparent transition"
                          required
                        />
                        {formErrors[`age_${idx}`] && (
                          <p className="text-[11px] text-red-500 mt-1">{formErrors[`age_${idx}`]}</p>
                        )}
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Gender</label>
                        <select
                          value={p.gender}
                          onChange={(e) => handlePassengerChange(idx, 'gender', e.target.value)}
                          className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#f57c00] focus:border-transparent transition"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Contact details */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
                  <h4 className="text-sm font-bold text-gray-800">Contact Information</h4>
                  <p className="text-[11px] text-gray-400 mt-0.5">Ticket and updates will be sent to these details</p>
                </div>
                <div className="p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                        <Mail className="w-3 h-3 inline mr-1 text-gray-400" />
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#f57c00] focus:border-transparent transition"
                        required
                      />
                      {formErrors.email && (
                        <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {formErrors.email}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                        <Phone className="w-3 h-3 inline mr-1 text-gray-400" />
                        Phone Number
                      </label>
                      <input
                        type="text"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#f57c00] focus:border-transparent transition"
                        required
                      />
                      {formErrors.phone && (
                        <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {formErrors.phone}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep('seats')}
                  className="px-4 py-2.5 rounded-lg border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition flex items-center gap-1.5"
                >
                  <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                  Back
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-lg bg-[#f57c00] hover:bg-[#ef6c00] text-white font-bold text-sm shadow-md shadow-orange-500/20 transition-all flex items-center gap-2"
                >
                  <span>Continue to Review</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ====== STEP 4: REVIEW & PAY ====== */}
        {step === 'summary' && selectedBus && (
          <div className="max-w-3xl mx-auto space-y-5">
            {/* Title bar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <Eye className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Review Your Booking</h3>
                <p className="text-xs text-gray-500">Verify all details before proceeding to payment</p>
              </div>
            </div>

            {/* Journey details card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-5 py-3 bg-gradient-to-r from-[#f57c00] to-[#ef6c00] text-white">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold">{selectedBus.operator}</h4>
                  <span className="text-xs font-medium bg-white/20 px-2 py-0.5 rounded">{selectedBus.busType}</span>
                </div>
              </div>

              <div className="p-5 space-y-4">
                {/* Route */}
                <div className="flex items-center justify-between">
                  <div className="text-center">
                    <div className="text-xl font-black text-gray-900">{selectedBus.departureTime}</div>
                    <div className="text-xs text-gray-500 font-medium">{selectedBus.fromCity}</div>
                  </div>
                  <div className="flex-1 flex flex-col items-center px-4">
                    <span className="text-[11px] text-gray-400 font-medium">{selectedBus.duration}</span>
                    <div className="w-full max-w-[150px] h-[2px] bg-gray-200 my-1 rounded-full relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-[#f57c00] to-[#c62828] rounded-full" />
                    </div>
                    <span className="text-[10px] text-gray-400">{journeyDate}</span>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-black text-gray-900">{selectedBus.arrivalTime}</div>
                    <div className="text-xs text-gray-500 font-medium">{selectedBus.toCity}</div>
                  </div>
                </div>

                {/* Seat + Points */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-gray-100">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <span className="text-[10px] text-gray-400 uppercase font-bold">Seats</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedSeats.map(s => (
                        <span key={s} className="px-2 py-0.5 rounded bg-orange-100 text-[#f57c00] text-xs font-bold font-mono">{s}</span>
                      ))}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <span className="text-[10px] text-gray-400 uppercase font-bold">Boarding</span>
                    <div className="text-xs font-semibold text-gray-800 mt-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#f57c00]" />
                      {selectedBoardingPoint}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <span className="text-[10px] text-gray-400 uppercase font-bold">Dropping</span>
                    <div className="text-xs font-semibold text-gray-800 mt-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#c62828]" />
                      {selectedDroppingPoint}
                    </div>
                  </div>
                </div>

                {/* Passengers */}
                <div className="pt-3 border-t border-gray-100">
                  <span className="text-[10px] text-gray-400 uppercase font-bold">Passengers</span>
                  <div className="mt-2 space-y-1.5">
                    {passengers.map((p, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs bg-gray-50 rounded-lg px-3 py-2">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#f57c00] text-white flex items-center justify-center text-[10px] font-bold">{idx + 1}</span>
                          <span className="font-semibold text-gray-800">{p.name}</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-500">
                          <span>{p.gender}, {p.age} yrs</span>
                          <span className="font-mono font-bold text-[#f57c00]">{p.seat}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Fare breakdown */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
                <h4 className="text-sm font-bold text-gray-800">Fare Breakdown</h4>
              </div>
              <div className="p-5 space-y-3">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Base Fare ({selectedSeats.length} seat{selectedSeats.length > 1 ? 's' : ''} x {formatPrice(seatFare)})</span>
                  <span className="font-semibold">{formatPrice(baseFare)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>GST / Service Tax (5%)</span>
                  <span className="font-semibold">{formatPrice(taxes)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Convenience Fee</span>
                  <span className="font-semibold">{formatPrice(convenienceFee)}</span>
                </div>
                <div className="pt-3 border-t-2 border-gray-200 flex justify-between items-baseline">
                  <span className="text-base font-bold text-gray-900">Total Amount</span>
                  <span className="text-2xl font-black text-[#f57c00]">{formatPrice(totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Offer strip */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-3">
              <BadgePercent className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="text-xs text-emerald-700">
                <span className="font-bold">Safe & Secure Booking</span> -- Your payment is protected with 256-bit encryption. Free cancellation up to 48hrs before departure.
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep('passenger')}
                className="px-4 py-2.5 rounded-lg border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition flex items-center gap-1.5"
              >
                <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                Edit Details
              </button>
              <button
                type="button"
                onClick={() => setIsPaymentOpen(true)}
                className="px-8 py-3 rounded-lg bg-[#c62828] hover:bg-[#b71c1c] text-white font-bold text-sm shadow-lg shadow-red-900/20 transition-all flex items-center gap-2"
              >
                <Shield className="w-4 h-4" />
                <span>Pay {formatPrice(totalAmount)}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ====== STEP 5: CONFIRMED ====== */}
        {step === 'confirmed' && confirmedBooking && (
          <div className="max-w-2xl mx-auto space-y-5">
            {/* Success hero */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <div className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-3 ${confirmedBooking.status === 'Pending' ? 'bg-amber-50 border border-amber-200 text-amber-700' : 'bg-emerald-50 border border-emerald-200 text-emerald-700'}`}>
                {confirmedBooking.status === 'Pending' ? 'Booking Submitted' : 'Booking Confirmed'}
              </div>
              <h2 className="text-2xl font-black text-gray-900">{confirmedBooking.status === 'Pending' ? 'Awaiting Confirmation' : 'Your seats are booked!'}</h2>
              <p className="text-sm text-gray-500 mt-2">
                Booking Reference: <strong className="font-mono text-[#f57c00] text-base">{confirmedBooking.reference}</strong>
              </p>
            </div>

            {/* Trip summary card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-5 py-3 bg-gradient-to-r from-[#f57c00] to-[#ef6c00] text-white flex items-center justify-between">
                <span className="text-sm font-bold">{confirmedBooking.operator}</span>
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded">{confirmedBooking.date}</span>
              </div>
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-lg font-black text-gray-900">{confirmedBooking.fromCity}</div>
                    <div className="text-xs text-gray-500">{confirmedBooking.time?.split(' - ')[0]}</div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-300" />
                  <div className="text-right">
                    <div className="text-lg font-black text-gray-900">{confirmedBooking.toCity}</div>
                    <div className="text-xs text-gray-500">{confirmedBooking.time?.split(' - ')[1]}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100 text-xs">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <span className="text-gray-400 uppercase text-[10px] font-bold">Seats</span>
                    <div className="font-bold text-gray-800 mt-0.5">{confirmedBooking.selectedSeats?.join(', ')}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <span className="text-gray-400 uppercase text-[10px] font-bold">Boarding</span>
                    <div className="font-bold text-gray-800 mt-0.5">{typeof confirmedBooking.boardingPoint === 'object' ? confirmedBooking.boardingPoint.name : confirmedBooking.boardingPoint}</div>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-sm text-gray-500">Amount Paid</span>
                  <span className="text-xl font-black text-emerald-600">{formatPrice(confirmedBooking.totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsTicketModalOpen(true)}
                className="flex-1 px-5 py-3 rounded-lg bg-[#f57c00] hover:bg-[#ef6c00] text-white font-bold text-sm shadow-md shadow-orange-500/20 transition-all flex items-center justify-center gap-2"
              >
                <Ticket className="w-4 h-4" />
                <span>View / Print Ticket</span>
              </button>

              <Link
                href="/bookings"
                className="flex-1 px-5 py-3 rounded-lg border-2 border-gray-200 text-gray-700 hover:bg-gray-50 font-bold text-sm transition text-center"
              >
                Go to My Bookings
              </Link>
            </div>

            {/* Info strip */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start gap-2 text-xs text-blue-700">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <span>A confirmation email and SMS has been sent with your e-ticket details. Please carry a valid photo ID during the journey.</span>
            </div>
          </div>
        )}
      </div>

      {/* Payment Gateway Modal */}
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        title="Simulated Bus Booking Checkout"
        amount={totalAmount}
        breakdown={{ baseFare, taxes, convenienceFee }}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* Ticket Modal */}
      <TicketModal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
        booking={confirmedBooking}
      />
    </div>
  );
}
