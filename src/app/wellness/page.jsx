'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Leaf,
  Activity,
  Heart,
  Shield,
  Apple,
  Smile,
  Zap,
  Star,
  Calendar,
  Clock,
  Video,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  UserCheck,
  Stethoscope,
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  X,
  BadgeCheck,
  Award,
  Wifi,
  Globe,
  Phone,
  Mail,
  User,
  FileText,
  IndianRupee,
  SlidersHorizontal,
  Brain,
  Flower2,
  Dumbbell,
  UtensilsCrossed,
  Sprout,
  Droplets,
  Target,
  Languages,
  Users,
  ThumbsUp,
} from 'lucide-react';
import { saveWellnessAppointment, getWellnessAppointments } from '@/services/storage';
import DataSourceBanner from '@/components/ui/DataSourceBanner';
import { useCurrency } from '@/components/ui/CurrencyProvider';
import InlineCurrencySelector from '@/components/ui/InlineCurrencySelector';
import { ALL_CITIES, getCurrencyForCity, getCityLabel, filterCities, COUNTRY_NAMES } from '@/data/cities';

const WELLNESS_IMAGES = ['/images/wellness-1.jpg', '/images/wellness-2.jpg', '/images/wellness-3.jpg'];
const getWellnessImage = (index, prac) => {
  if (prac?.image) return prac.image;
  if (prac?.details?.image) return prac.details.image;
  if (prac?.details?.imageUrl) return prac.details.imageUrl;
  // Use index-based rotation to ensure each card gets a different image
  return WELLNESS_IMAGES[index % WELLNESS_IMAGES.length];
};

const WELLNESS_CATEGORIES = [
  { id: 'all', name: 'All Therapies' },
  { id: 'ayurveda', name: 'Ayurveda & Panchakarma' },
  { id: 'yoga', name: 'Yoga & Pranayama' },
  { id: 'meditation', name: 'Meditation & Sound Healing' },
  { id: 'physiotherapy', name: 'Physiotherapy & Rehab' },
  { id: 'nutrition', name: 'Clinical Nutrition & Diet' },
  { id: 'mental_wellness', name: 'Mental Health & Therapy' },
  { id: 'alternative', name: 'Acupuncture & Naturopathy' },
];

const CATEGORY_ICONS = {
  all: Sparkles,
  ayurveda: Leaf,
  yoga: Activity,
  physiotherapy: Dumbbell,
  nutrition: UtensilsCrossed,
  naturopathy: Sprout,
  homeopathy: Droplets,
  mental_wellness: Brain,
  acupuncture: Target,
  meditation: Heart,
  alternative: Zap,
};

const CATEGORY_COLORS = {
  ayurveda: { bg: 'bg-emerald-100', text: 'text-emerald-700', ring: 'ring-emerald-200', avatar: 'bg-emerald-600' },
  yoga: { bg: 'bg-purple-100', text: 'text-purple-700', ring: 'ring-purple-200', avatar: 'bg-purple-600' },
  physiotherapy: { bg: 'bg-blue-100', text: 'text-blue-700', ring: 'ring-blue-200', avatar: 'bg-blue-600' },
  nutrition: { bg: 'bg-orange-100', text: 'text-orange-700', ring: 'ring-orange-200', avatar: 'bg-orange-600' },
  naturopathy: { bg: 'bg-lime-100', text: 'text-lime-700', ring: 'ring-lime-200', avatar: 'bg-lime-600' },
  homeopathy: { bg: 'bg-cyan-100', text: 'text-cyan-700', ring: 'ring-cyan-200', avatar: 'bg-cyan-600' },
  mental_wellness: { bg: 'bg-pink-100', text: 'text-pink-700', ring: 'ring-pink-200', avatar: 'bg-pink-600' },
  acupuncture: { bg: 'bg-amber-100', text: 'text-amber-700', ring: 'ring-amber-200', avatar: 'bg-amber-600' },
  meditation: { bg: 'bg-indigo-100', text: 'text-indigo-700', ring: 'ring-indigo-200', avatar: 'bg-indigo-600' },
  alternative: { bg: 'bg-teal-100', text: 'text-teal-700', ring: 'ring-teal-200', avatar: 'bg-teal-600' },
};

// Cities now come from shared data (ALL_CITIES) with international support
const LANGUAGES = ['English', 'Hindi', 'Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Marathi', 'Bengali'];
const EXPERIENCE_LEVELS = [
  { label: 'Any Experience', value: 0 },
  { label: '3+ Years', value: 3 },
  { label: '5+ Years', value: 5 },
  { label: '10+ Years', value: 10 },
  { label: '15+ Years', value: 15 },
];
const RATING_OPTIONS = [
  { label: '4.5+ Stars', value: 4.5 },
  { label: '4+ Stars', value: 4.0 },
  { label: '3.5+ Stars', value: 3.5 },
  { label: 'All Ratings', value: 0 },
];

export default function WellnessPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPractitioner, setSelectedPractitioner] = useState(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const cityRef = useRef(null);
  const [consultationMode, setConsultationMode] = useState('all');
  const [feeRange, setFeeRange] = useState(5000);
  const [minRating, setMinRating] = useState(0);
  const [minExperience, setMinExperience] = useState(0);
  const [genderPref, setGenderPref] = useState('all');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [sortBy, setSortBy] = useState('rating');

  // Booking modal form
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('Tomorrow');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [patientName, setPatientName] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [healthNotes, setHealthNotes] = useState('');
  const [selectedServices, setSelectedServices] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Already booked slots from storage to prevent duplicates
  const [existingAppointments, setExistingAppointments] = useState([]);

  // Dynamic data from database
  const [practitioners, setPractitioners] = useState([]);
  const [categories, setCategories] = useState(() => [...WELLNESS_CATEGORIES]);
  const [dataSource, setDataSource] = useState('provider');

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

  useEffect(() => {
    async function fetchPractitioners() {
      try {
        const res = await fetch('/api/practitioners');
        const data = await res.json();
        if (data.success && data.practitioners?.length > 0) {
          const dbPractitioners = data.practitioners.map(p => ({
            ...p,
            duration: p.sessionDuration || p.duration || '45 mins',
            reviewsCount: p.reviews || p.reviewsCount || 0,
            about: p.description || p.about || '',
          }));
          setPractitioners(dbPractitioners);
          // Only override categories if API returns proper {id, name} objects
          if (Array.isArray(data.categories) && data.categories.length > 0 && data.categories[0]?.id) {
            const hasAll = data.categories.some(c => c.id === 'all');
            setCategories(hasAll ? data.categories : [{ id: 'all', name: 'All Therapies' }, ...data.categories]);
          }
          setDataSource('provider');
        } else {
          setPractitioners([]);
          setDataSource('provider');
        }
      } catch (err) {
        console.log('Failed to fetch practitioners from API');
        setPractitioners([]);
        setDataSource('provider');
      }
    }
    fetchPractitioners();
  }, []);

  useEffect(() => {
    setExistingAppointments(getWellnessAppointments());
    const sync = () => setExistingAppointments(getWellnessAppointments());
    window.addEventListener('auralife_storage_update', sync);
    return () => window.removeEventListener('auralife_storage_update', sync);
  }, []);

  const filteredPractitioners = useMemo(() => {
    let results = practitioners.filter((p) => {
      if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchName = p.name?.toLowerCase().includes(q);
        const matchSpec = p.specialization?.toLowerCase().includes(q);
        const matchAbout = p.about?.toLowerCase().includes(q);
        if (!matchName && !matchSpec && !matchAbout) return false;
      }
      if (selectedCity && p.location && !p.location.toLowerCase().includes(selectedCity.toLowerCase())) return false;
      if (consultationMode !== 'all') {
        const mode = (p.consultationMode || '').toLowerCase();
        if (consultationMode === 'online' && !mode.includes('online') && !mode.includes('video') && !mode.includes('virtual')) return false;
        if (consultationMode === 'in-person' && !mode.includes('in-person') && !mode.includes('clinic') && !mode.includes('studio')) return false;
      }
      if (p.price > feeRange) return false;
      if (minRating > 0 && (p.rating || 0) < minRating) return false;
      if (minExperience > 0 && (p.experienceYears || 0) < minExperience) return false;
      return true;
    });

    if (sortBy === 'rating') {
      results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'price_low') {
      results.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === 'price_high') {
      results.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sortBy === 'experience') {
      results.sort((a, b) => (b.experienceYears || 0) - (a.experienceYears || 0));
    }

    return results;
  }, [practitioners, selectedCategory, searchQuery, selectedCity, consultationMode, feeRange, minRating, minExperience, genderPref, selectedLanguage, sortBy]);

  const handleOpenBooking = (practitioner) => {
    setSelectedPractitioner(practitioner);
    setSelectedDate((practitioner.availableDates || [])[0] || 'Tomorrow');
    setSelectedSlot((practitioner.availableSlots || [])[0] || '10:00 AM');
    setSelectedServices([]);
    setHealthNotes('');
    setErrorMessage('');
    setSubmitSuccess(null);
    setIsBookingModalOpen(true);
  };

  const isSlotBooked = (date, slot) => {
    if (!selectedPractitioner) return false;
    return existingAppointments.some(
      (a) =>
        a.practitionerId === selectedPractitioner.id &&
        a.date === date &&
        a.timeSlot === slot &&
        a.status !== 'Declined' &&
        a.status !== 'Cancelled'
    );
  };

  const handleAppointmentSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const newApt = await saveWellnessAppointment({
        practitionerId: selectedPractitioner.id,
        practitionerName: selectedPractitioner.name,
        category: selectedPractitioner.category,
        specialization: selectedPractitioner.specialization,
        patientName,
        patientEmail,
        patientPhone,
        date: selectedDate,
        timeSlot: selectedSlot,
        consultationMode: selectedPractitioner.consultationMode,
        duration: selectedPractitioner.duration,
        price: selectedPractitioner.price,
        notes: healthNotes,
        providerId: selectedPractitioner.providerId || null,
        listingId: selectedPractitioner.listingId || null,
      });

      setIsSubmitting(false);
      setSubmitSuccess(newApt);
    } catch (err) {
      setIsSubmitting(false);
      setErrorMessage(err.message || 'Error booking appointment slot.');
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.replace(/Dr\.\s*/i, '').replace(/,.*$/, '').trim().split(' ');
    if (parts.length >= 2 && parts[0] && parts[1]) return (parts[0][0] + parts[1][0]).toUpperCase();
    if (parts[0] && parts[0].length > 0) return parts[0][0].toUpperCase();
    return '?';
  };

  const getCategoryColor = (cat) => CATEGORY_COLORS[cat] || CATEGORY_COLORS.alternative;

  const getCategoryIcon = (catId) => {
    const Icon = CATEGORY_ICONS[catId] || Sparkles;
    return Icon;
  };

  const getPractitionerTags = (prac) => {
    const tags = [];
    if ((prac.rating || 0) >= 4.8) tags.push({ label: 'TOP RATED', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Award });
    if ((prac.experienceYears || 0) >= 10) tags.push({ label: 'VERIFIED', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: BadgeCheck });
    const mode = (prac.consultationMode || '').toLowerCase();
    if (mode.includes('online') || mode.includes('video') || mode.includes('virtual')) {
      tags.push({ label: 'ONLINE AVAILABLE', color: 'bg-green-50 text-green-700 border-green-200', icon: Wifi });
    }
    return tags;
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCity('');
    setCitySearch('');
    setCurrency('INR');
    setConsultationMode('all');
    setFeeRange(5000);
    setMinRating(0);
    setMinExperience(0);
    setGenderPref('all');
    setSelectedLanguage('');
    setSelectedCategory('all');
    setSortBy('rating');
  };

  const renderFilterSidebar = (isMobile = false) => (
    <div className={`${isMobile ? '' : 'sticky top-24'}`}>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-teal-600" />
            Filters
          </h3>
          <button
            onClick={resetFilters}
            className="text-xs text-teal-600 hover:text-teal-700 font-semibold"
          >
            Reset All
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* Consultation Mode */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 mb-3 uppercase tracking-wider">Consultation Mode</h4>
            <div className="space-y-2">
              {[
                { value: 'all', label: 'All Modes' },
                { value: 'in-person', label: 'In-Person' },
                { value: 'online', label: 'Online / Video' },
              ].map((opt) => (
                <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer group">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition ${
                    consultationMode === opt.value ? 'border-teal-600 bg-teal-600' : 'border-slate-300 group-hover:border-teal-400'
                  }`}>
                    {consultationMode === opt.value && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <span className={`text-sm ${consultationMode === opt.value ? 'text-slate-900 font-semibold' : 'text-slate-600'}`}>
                    {opt.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Fee Range */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 mb-3 uppercase tracking-wider">Fee Range</h4>
            <div className="px-1">
              <input
                type="range"
                min={200}
                max={5000}
                step={100}
                value={feeRange}
                onChange={(e) => setFeeRange(Number(e.target.value))}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-teal-600 bg-slate-200"
              />
              <div className="flex justify-between mt-2 text-xs text-slate-500">
                <span>{formatPrice(200)}</span>
                <span className="font-bold text-teal-700">Up to {formatPrice(feeRange)}</span>
              </div>
            </div>
          </div>

          {/* Rating */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 mb-3 uppercase tracking-wider">Rating</h4>
            <div className="space-y-2">
              {RATING_OPTIONS.map((opt) => (
                <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer group">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition ${
                    minRating === opt.value ? 'border-teal-600 bg-teal-600' : 'border-slate-300 group-hover:border-teal-400'
                  }`}>
                    {minRating === opt.value && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <span className={`text-sm flex items-center gap-1 ${minRating === opt.value ? 'text-slate-900 font-semibold' : 'text-slate-600'}`}>
                    {opt.value > 0 && <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
                    {opt.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Experience */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 mb-3 uppercase tracking-wider">Experience Level</h4>
            <div className="space-y-2">
              {EXPERIENCE_LEVELS.map((opt) => (
                <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer group">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition ${
                    minExperience === opt.value ? 'border-teal-600 bg-teal-600' : 'border-slate-300 group-hover:border-teal-400'
                  }`}>
                    {minExperience === opt.value && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <span className={`text-sm ${minExperience === opt.value ? 'text-slate-900 font-semibold' : 'text-slate-600'}`}>
                    {opt.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* City */}
          <div className="relative" ref={cityRef}>
            <h4 className="text-xs font-bold text-slate-700 mb-3 uppercase tracking-wider">City</h4>
            <input
              type="text"
              placeholder="Select city..."
              value={citySearch}
              onChange={(e) => { setCitySearch(e.target.value); setShowCityDropdown(true); }}
              onFocus={() => { setShowCityDropdown(true); setCitySearch(''); setSelectedCity(''); setCurrency('INR'); }}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
            {showCityDropdown && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-48 overflow-y-auto z-50">
                {getFilteredCities(citySearch).map(c => (
                  <button key={`c-${c.name}-${c.country}`} onClick={() => handleCitySelect(c)}
                    className={`w-full text-left px-3 py-2 hover:bg-teal-50 text-sm flex justify-between ${c.name === selectedCity ? 'bg-teal-50' : ''}`}>
                    <span className="font-medium text-gray-800">{c.name}</span>
                    <span className="text-xs text-gray-400">{c.country === 'IN' ? c.state : (COUNTRY_NAMES[c.country] || c.country)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Gender Preference */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 mb-3 uppercase tracking-wider">Gender Preference</h4>
            <div className="flex gap-2">
              {[
                { value: 'all', label: 'Any' },
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setGenderPref(opt.value)}
                  className={`flex-1 px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                    genderPref === opt.value
                      ? 'bg-teal-600 text-white border-teal-600'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Language */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 mb-3 uppercase tracking-wider">Language</h4>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang}
                  onClick={() => setSelectedLanguage(selectedLanguage === lang ? '' : lang)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                    selectedLanguage === lang
                      ? 'bg-teal-600 text-white border-teal-600'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f0fdf4]">
      {/* Hero / Search Section */}
      <div className="bg-gradient-to-br from-[#00695c] via-[#00796b] to-[#00897b] relative">
        <div className="absolute inset-0 opacity-10 overflow-hidden">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-teal-300/10 rounded-full blur-2xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-16 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-teal-100 text-xs font-semibold mb-4 border border-white/10">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Certified Alternative & Integrative Practitioners</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-3">
              Health & Wellness Services
            </h1>
            <p className="text-teal-100 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
              Book consultations with verified Ayurvedic doctors, yoga instructors, nutritionists, physiotherapists, and holistic therapists near you.
            </p>
          </div>

          {/* Currency selector - in dark header like flights */}
          <div className="max-w-5xl mx-auto flex justify-end mb-3">
            <InlineCurrencySelector variant="dark" />
          </div>

          {/* Search Bar */}
          <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl shadow-black/10 p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row gap-2 items-stretch">
                {/* Search text */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search doctors, therapies..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 text-sm text-slate-800 placeholder-slate-400 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                  />
                </div>
                {/* City */}
                <div className="relative min-w-[180px]" ref={cityRef}>
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-500 pointer-events-none z-10" />
                  <input
                    type="text"
                    placeholder="Select city..."
                    value={citySearch}
                    onChange={(e) => { setCitySearch(e.target.value); setShowCityDropdown(true); }}
                    onFocus={() => { setShowCityDropdown(true); setCitySearch(''); setSelectedCity(''); setCurrency('INR'); }}
                    className="w-full pl-9 pr-3 py-3 text-sm text-slate-700 font-semibold bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                  />
                  {showCityDropdown && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-48 overflow-y-auto z-50">
                      {getFilteredCities(citySearch).map(c => (
                        <button key={`hc-${c.name}-${c.country}`} onClick={() => handleCitySelect(c)}
                          className={`w-full text-left px-3 py-2 hover:bg-teal-50 text-sm flex justify-between ${c.name === selectedCity ? 'bg-teal-50' : ''}`}>
                          <span className="font-medium text-gray-800">{c.name}</span>
                          <span className="text-xs text-gray-400">{c.country === 'IN' ? c.state : (COUNTRY_NAMES[c.country] || c.country)}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Search Button */}
                <button
                  onClick={() => {}}
                  className="px-6 py-3 bg-[#00695c] hover:bg-[#004d40] text-white font-bold text-sm rounded-xl transition shadow-lg shadow-teal-700/20 flex items-center justify-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto py-3 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
            {(Array.isArray(categories) ? categories : WELLNESS_CATEGORIES).map((cat) => {
              const CatIcon = getCategoryIcon(cat.id);
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold transition-all shrink-0 flex items-center gap-2 border ${
                    selectedCategory === cat.id
                      ? 'bg-[#00695c] text-white border-[#00695c] shadow-md shadow-teal-600/20'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200'
                  }`}
                >
                  <CatIcon className="w-3.5 h-3.5" />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results Header & Sort */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              {filteredPractitioners.length} Practitioner{filteredPractitioners.length !== 1 ? 's' : ''} Found
            </h2>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <span className="text-xs text-slate-500">
                {selectedCategory !== 'all'
                  ? `Showing ${(Array.isArray(categories) ? categories : WELLNESS_CATEGORIES).find(c => c.id === selectedCategory)?.name || ''} specialists`
                  : 'Showing all wellness categories'
                }
                {selectedCity ? ` in ${selectedCity}` : ''}
              </span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100">
                OneConnect API
              </span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[10px] font-bold border border-purple-100">
                Provider Listed
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Mobile filter toggle */}
            <button
              onClick={() => setShowMobileFilters(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs text-slate-500">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none pr-8"
              >
                <option value="rating">Top Rated</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="experience">Most Experienced</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Desktop Filter Sidebar */}
          <div className="hidden lg:block w-72 shrink-0">
            {renderFilterSidebar()}
          </div>

          {/* Practitioner Listing */}
          <div className="flex-1 space-y-4">
            {/* Data Sources Banner */}
            <DataSourceBanner
              sources={['supabase', 'oneconnect', 'unsplash']}
              counts={{
                supabase: practitioners.filter(p => p.source === 'provider').length,
                oneconnect: practitioners.filter(p => p.source === 'live').length,
                total: filteredPractitioners.length,
              }}
            />

            {filteredPractitioners.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
                <div className="w-20 h-20 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-700 mb-2">No practitioners available</h3>
                <p className="text-sm text-slate-500 mb-4">
                  {practitioners.length === 0
                    ? 'No providers have listed wellness services yet. Check back soon!'
                    : 'Try adjusting your filters or search query to find more results.'}
                </p>
                {practitioners.length > 0 && (
                  <button
                    onClick={resetFilters}
                    className="px-5 py-2.5 bg-[#00695c] text-white rounded-xl text-sm font-semibold hover:bg-[#004d40] transition"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            ) : (
              filteredPractitioners.map((prac, pracIndex) => {
                const catColor = getCategoryColor(prac.category);
                const tags = getPractitionerTags(prac);
                const originalPrice = prac.originalFee || Math.round((prac.price || 0) * 1.25);

                return (
                  <div
                    key={prac.id}
                    className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden group"
                  >
                    <div className="p-5 sm:p-6">
                      <div className="flex flex-col sm:flex-row gap-5">
                        {/* Left: Avatar */}
                        <div className="shrink-0 flex flex-col items-center gap-2">
                          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden ring-4 ring-slate-100 shadow-md">
                            <img
                              src={getWellnessImage(pracIndex, prac)}
                              alt={prac.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          {/* Rating Badge below avatar */}
                          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200">
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                            <span className="text-xs font-bold text-amber-700">{prac.rating}</span>
                          </div>
                        </div>

                        {/* Center: Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-start gap-2 mb-1">
                            <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">{prac.name}</h3>
                            {prac.source === 'provider' && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-50 text-purple-600 border border-purple-200 self-center">Provider Listed</span>
                            )}
                            {prac.source === 'live' && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-teal-50 text-teal-600 border border-teal-200 self-center">OneConnect API</span>
                            )}
                            {tags.map((tag, i) => {
                              const TagIcon = tag.icon;
                              return (
                                <span
                                  key={i}
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${tag.color}`}
                                >
                                  <TagIcon className="w-3 h-3" />
                                  {tag.label}
                                </span>
                              );
                            })}
                          </div>

                          <p className="text-sm font-medium text-[#00695c] mb-1">{prac.specialization}</p>
                          <p className="text-xs text-slate-500 mb-2">{prac.qualifications}</p>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-600 mb-3">
                            <span className="flex items-center gap-1.5">
                              <Stethoscope className="w-3.5 h-3.5 text-slate-400" />
                              {prac.experienceYears || '5+'}yrs experience
                            </span>
                            <span className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              {prac.location}
                            </span>
                            <span className="flex items-center gap-1.5">
                              {(prac.consultationMode || '').toLowerCase().includes('online') || (prac.consultationMode || '').toLowerCase().includes('video') ? (
                                <Video className="w-3.5 h-3.5 text-green-500" />
                              ) : (
                                <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                              )}
                              {prac.consultationMode}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              {prac.duration}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3">
                            <ThumbsUp className="w-3.5 h-3.5 text-slate-400" />
                            <span>{prac.reviewsCount} patient reviews</span>
                            <span className="mx-1 text-slate-300">|</span>
                            <span className="text-slate-500">{prac.about?.substring(0, 100)}{(prac.about?.length || 0) > 100 ? '...' : ''}</span>
                          </div>

                          {/* Services offered */}
                          {Array.isArray(prac.services) && prac.services.length > 0 && (
                            <div className="mb-3">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Services:</span>
                              <div className="flex flex-wrap gap-1.5 mt-1">
                                {prac.services.map((svc, i) => (
                                  <span key={i} className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${catColor.bg} ${catColor.text}`}>
                                    {typeof svc === 'object' ? `${svc.name} - ${formatPrice(svc.price)}` : svc}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Available Slots Preview */}
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Next Available Slots:</span>
                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                              {(Array.isArray(prac.availableSlots) ? prac.availableSlots : []).slice(0, 3).map((slot, i) => (
                                <span
                                  key={i}
                                  className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-green-50 text-green-700 border border-green-200 flex items-center gap-1"
                                >
                                  <Clock className="w-3 h-3" />
                                  {slot}
                                </span>
                              ))}
                              {Array.isArray(prac.availableSlots) && prac.availableSlots.length > 3 && (
                                <span className="text-[11px] text-slate-400 self-center font-medium">
                                  +{prac.availableSlots.length - 3} more slots
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right: Price & CTA */}
                        <div className="shrink-0 flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 sm:gap-4 sm:pl-6 sm:border-l sm:border-slate-100 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                          <div className="text-right">
                            <span className="text-xs text-slate-400 line-through block">{formatPrice(originalPrice || 0)}</span>
                            <div className="flex items-baseline gap-1">
                              <span className="text-2xl font-extrabold text-slate-900">{formatPrice(prac.price || 0)}</span>
                            </div>
                            <span className="text-[10px] text-slate-500">per consultation</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleOpenBooking(prac)}
                            className="px-6 py-3 rounded-xl bg-[#00695c] hover:bg-[#004d40] text-white font-bold text-sm shadow-lg shadow-teal-700/20 transition-all flex items-center gap-2 whitespace-nowrap"
                          >
                            <Calendar className="w-4 h-4" />
                            Book Appointment
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowMobileFilters(false)} />
          <div className="absolute right-0 top-0 h-full w-80 max-w-[90vw] bg-[#f0fdf4] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-white sticky top-0 z-10">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-teal-600" />
                Filters
              </h3>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="p-2 hover:bg-slate-100 rounded-xl transition"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="p-4">
              {renderFilterSidebar(true)}
            </div>
            <div className="sticky bottom-0 p-4 bg-white border-t border-slate-200">
              <button
                onClick={() => setShowMobileFilters(false)}
                className="w-full py-3 bg-[#00695c] text-white font-bold text-sm rounded-xl hover:bg-[#004d40] transition"
              >
                Apply Filters ({filteredPractitioners.length} results)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* APPOINTMENT BOOKING MODAL */}
      {isBookingModalOpen && selectedPractitioner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="shrink-0 bg-gradient-to-r from-[#00695c] to-[#00897b] px-6 py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-full ${getCategoryColor(selectedPractitioner.category).avatar} text-white text-xl font-bold flex items-center justify-center ring-2 ring-white/20`}>
                    {getInitials(selectedPractitioner.name)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{selectedPractitioner.name}</h3>
                    <p className="text-teal-100 text-sm">{selectedPractitioner.specialization}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-xs text-teal-200">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        {selectedPractitioner.rating} ({selectedPractitioner.reviewsCount} reviews)
                      </span>
                      <span className="flex items-center gap-1 text-xs text-teal-200">
                        <Clock className="w-3 h-3" />
                        {selectedPractitioner.duration}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsBookingModalOpen(false)}
                  className="p-2 rounded-xl hover:bg-white/10 text-white/70 hover:text-white transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {submitSuccess ? (
                <div className="text-center py-8 space-y-5">
                  <div className="w-20 h-20 mx-auto bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-amber-50 text-amber-700 border border-amber-200">
                      Pending Practitioner Acceptance
                    </span>
                    <h3 className="text-xl font-bold text-slate-900 mt-3">Appointment Request Submitted!</h3>
                    <p className="text-sm text-slate-500 max-w-md mx-auto mt-2">
                      Your request has been sent to {selectedPractitioner.name}. You can switch to the <strong>Provider Persona</strong> to simulate accepting or declining.
                    </p>
                  </div>

                  <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 text-sm text-left space-y-2 max-w-sm mx-auto">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Appointment ID</span>
                      <span className="font-semibold text-slate-800">{submitSuccess.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Date & Time</span>
                      <span className="font-semibold text-slate-800">{submitSuccess.date} at {submitSuccess.timeSlot}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Patient</span>
                      <span className="font-semibold text-slate-800">{submitSuccess.patientName}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-200 pt-2 mt-2">
                      <span className="text-slate-500">Session Fee</span>
                      <span className="font-bold text-[#00695c] text-base">{formatPrice(submitSuccess.price)}</span>
                    </div>
                  </div>

                  <div className="flex justify-center gap-3 pt-2">
                    <button
                      onClick={() => setIsBookingModalOpen(false)}
                      className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition"
                    >
                      Close
                    </button>
                    <Link
                      href="/dashboard/customer"
                      className="px-5 py-2.5 rounded-xl bg-[#00695c] hover:bg-[#004d40] text-white text-sm font-semibold shadow-md transition"
                    >
                      View in Dashboard
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleAppointmentSubmit} className="space-y-5">
                  {errorMessage && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* Date Selection */}
                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#00695c]" />
                      Select Date
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {(selectedPractitioner.availableDates || []).map((date) => {
                        const isActive = selectedDate === date;
                        return (
                          <button
                            key={date}
                            type="button"
                            onClick={() => setSelectedDate(date)}
                            className={`px-4 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                              isActive
                                ? 'bg-[#00695c] text-white border-[#00695c] shadow-md shadow-teal-600/20'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-teal-300 hover:bg-teal-50'
                            }`}
                          >
                            {date}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Time Slot Selection */}
                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#00695c]" />
                      Select Time Slot
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {(Array.isArray(selectedPractitioner.availableSlots) ? selectedPractitioner.availableSlots : []).map((slot) => {
                        const booked = isSlotBooked(selectedDate, slot);
                        const isSelected = selectedSlot === slot;
                        return (
                          <button
                            key={slot}
                            type="button"
                            disabled={booked}
                            onClick={() => setSelectedSlot(slot)}
                            className={`p-2.5 rounded-xl text-sm font-semibold border-2 transition-all flex flex-col items-center justify-center gap-0.5 ${
                              booked
                                ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                                : isSelected
                                ? 'bg-[#00695c] text-white border-[#00695c] shadow-md shadow-teal-600/20'
                                : 'bg-green-50 text-green-700 border-green-200 hover:border-[#00695c] hover:bg-teal-50'
                            }`}
                          >
                            <span>{slot}</span>
                            <span className={`text-[10px] ${booked ? 'text-slate-400' : isSelected ? 'text-teal-100' : 'text-green-500'}`}>
                              {booked ? 'Booked' : 'Available'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Patient Details */}
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                      <User className="w-4 h-4 text-[#00695c]" />
                      Patient Details
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1.5">Full Name</label>
                        <input
                          type="text"
                          value={patientName}
                          onChange={(e) => setPatientName(e.target.value)}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1.5">Email</label>
                        <input
                          type="email"
                          value={patientEmail}
                          onChange={(e) => setPatientEmail(e.target.value)}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1.5">Phone Number</label>
                        <input
                          type="tel"
                          value={patientPhone}
                          onChange={(e) => setPatientPhone(e.target.value)}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Health Concerns */}
                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#00695c]" />
                      Health Concerns / Notes
                    </label>
                    <textarea
                      rows={3}
                      value={healthNotes}
                      onChange={(e) => setHealthNotes(e.target.value)}
                      placeholder="Describe your health concerns, symptoms, or what you'd like to discuss with the practitioner..."
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition resize-none"
                    />
                  </div>

                  {/* Service Selection (if practitioner has services) */}
                  {Array.isArray(selectedPractitioner.services) && selectedPractitioner.services.length > 0 && (
                    <div>
                      <label className="block text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
                        <Stethoscope className="w-4 h-4 text-[#00695c]" />
                        Select Services
                      </label>
                      <div className="space-y-2">
                        {selectedPractitioner.services.map((svc, i) => {
                          const svcName = typeof svc === 'object' ? svc.name : svc;
                          const svcPrice = typeof svc === 'object' ? svc.price : null;
                          const isChecked = selectedServices.includes(svcName);
                          return (
                            <label
                              key={i}
                              className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${
                                isChecked
                                  ? 'bg-teal-50 border-[#00695c]'
                                  : 'bg-white border-slate-200 hover:border-teal-300'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition ${
                                  isChecked ? 'bg-[#00695c] border-[#00695c]' : 'border-slate-300'
                                }`}>
                                  {isChecked && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                                </div>
                                <span className={`text-sm ${isChecked ? 'font-semibold text-slate-800' : 'text-slate-600'}`}>{svcName}</span>
                              </div>
                              {svcPrice && <span className="text-sm font-bold text-slate-700">{formatPrice(svcPrice)}</span>}
                              <input
                                type="checkbox"
                                className="hidden"
                                checked={isChecked}
                                onChange={() => {
                                  setSelectedServices(prev =>
                                    isChecked ? prev.filter(s => s !== svcName) : [...prev, svcName]
                                  );
                                }}
                              />
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Price Summary */}
                  <div className="p-4 bg-gradient-to-r from-teal-50 to-green-50 rounded-xl border border-teal-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs text-slate-500 block">Total Consultation Fee</span>
                        <span className="text-2xl font-extrabold text-[#00695c]">{formatPrice(selectedPractitioner.price || 0)}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-teal-600 font-semibold block">Payable upon confirmation</span>
                        <span className="text-[10px] text-slate-500">Status: Pending Verification</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsBookingModalOpen(false)}
                      className="flex-1 px-5 py-3 rounded-xl border-2 border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 px-5 py-3 rounded-xl bg-[#00695c] hover:bg-[#004d40] text-white text-sm font-bold shadow-lg shadow-teal-700/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          Confirm Appointment
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
    </div>
  );
}
