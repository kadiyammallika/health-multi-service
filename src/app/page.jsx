'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Plane,
  Bus,
  Building2,
  Sparkles,
  Home,
  Search,
  MapPin,
  Calendar,
  Users,
  ShieldCheck,
  Zap,
  ArrowRight,
  Star,
  CheckCircle2,
  Heart,
  Activity,
  Award,
  Layers,
  ChevronRight
} from 'lucide-react';
import { SAMPLE_HOTELS } from '@/data/hotelsData';
import { SAMPLE_PRACTITIONERS } from '@/data/wellnessData';
import { SAMPLE_PROPERTIES } from '@/data/propertiesData';

export default function HomePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('flights');

  // Quick search form state
  const [flightFrom, setFlightFrom] = useState('New Delhi');
  const [flightTo, setFlightTo] = useState('Mumbai');
  const [flightDate, setFlightDate] = useState('2026-11-15');

  const [busFrom, setBusFrom] = useState('New Delhi');
  const [busTo, setBusTo] = useState('Jaipur');
  const [busDate, setBusDate] = useState('2026-11-16');

  const [hotelCity, setHotelCity] = useState('Goa');
  const [hotelCheckIn, setHotelCheckIn] = useState('2026-11-18');

  const [wellnessCategory, setWellnessCategory] = useState('ayurveda');
  const [propertyPurpose, setPropertyPurpose] = useState('buy');

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (activeTab === 'flights') {
      router.push(`/flights?from=${encodeURIComponent(flightFrom)}&to=${encodeURIComponent(flightTo)}&date=${flightDate}`);
    } else if (activeTab === 'buses') {
      router.push(`/buses?from=${encodeURIComponent(busFrom)}&to=${encodeURIComponent(busTo)}&date=${busDate}`);
    } else if (activeTab === 'hotels') {
      router.push(`/hotels?city=${encodeURIComponent(hotelCity)}&checkin=${hotelCheckIn}`);
    } else if (activeTab === 'wellness') {
      router.push(`/wellness?category=${wellnessCategory}`);
    } else if (activeTab === 'properties') {
      router.push(`/properties?purpose=${propertyPurpose}`);
    }
  };

  const categories = [
    {
      id: 'flights',
      title: 'Flight Booking',
      desc: 'Domestic & global air carriers with guaranteed seat availability and instant e-ticket issuance.',
      icon: Plane,
      href: '/flights',
      badge: 'Fast & Secure',
      gradient: 'from-blue-600 to-indigo-600',
      lightBg: 'bg-blue-50/80',
      textColor: 'text-blue-600'
    },
    {
      id: 'buses',
      title: 'Bus Booking',
      desc: 'Luxury multi-axle Volvos & AC sleepers with interactive seat layouts and live tracking.',
      icon: Bus,
      href: '/buses',
      badge: 'Zero Booking Fee',
      gradient: 'from-amber-500 to-orange-600',
      lightBg: 'bg-amber-50/80',
      textColor: 'text-amber-600'
    },
    {
      id: 'hotels',
      title: 'Hotel & Stays',
      desc: 'Boutique heritage resorts, tranquil beach villas, and urban luxury suites with transparent pricing.',
      icon: Building2,
      href: '/hotels',
      badge: 'Best Rates',
      gradient: 'from-emerald-600 to-teal-600',
      lightBg: 'bg-emerald-50/80',
      textColor: 'text-emerald-600'
    },
    {
      id: 'wellness',
      title: 'Wellness & Health',
      desc: 'Ayurveda, yoga, clinical nutrition, sound therapy, and physiotherapy with certified experts.',
      icon: Sparkles,
      href: '/wellness',
      badge: 'Verified Healers',
      gradient: 'from-teal-600 to-cyan-600',
      lightBg: 'bg-teal-50/80',
      textColor: 'text-teal-600'
    },
    {
      id: 'properties',
      title: 'Property Buy & Rent',
      desc: 'Verified prime residential villas, skyline penthouses, and managed spaces with on-site visits.',
      icon: Home,
      href: '/properties',
      badge: 'Verified Listings',
      gradient: 'from-rose-600 to-pink-600',
      lightBg: 'bg-rose-50/80',
      textColor: 'text-rose-600'
    }
  ];

  return (
    <div className="space-y-20 pb-20">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-950 text-white pt-16 pb-28">
        {/* Glow ambient effects */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-teal-300 text-xs font-semibold">
              <Sparkles className="w-4 h-4 text-teal-400" />
              <span>One Platform • Infinite Living, Travel & Wellness Possibilities</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              Discover, Book & Experience <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-indigo-300 to-rose-300">
                All Your Services in One Place
              </span>
            </h1>

            <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto font-normal leading-relaxed">
              From air travel and sleeper buses to holistic healing sessions, luxury retreats, and dream properties — manage all your lifestyle bookings with a single unified account.
            </p>
          </div>

          {/* Interactive Search Card */}
          <div className="mt-12 max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl p-3 sm:p-5 text-slate-900 border border-slate-100">
            {/* Search Tabs */}
            <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-3 sm:pb-4 border-b border-slate-100">
              <button
                type="button"
                onClick={() => setActiveTab('flights')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition shrink-0 ${
                  activeTab === 'flights'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Plane className="w-4 h-4" />
                <span>Flights</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('buses')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition shrink-0 ${
                  activeTab === 'buses'
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Bus className="w-4 h-4" />
                <span>Buses</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('hotels')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition shrink-0 ${
                  activeTab === 'hotels'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Hotels</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('wellness')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition shrink-0 ${
                  activeTab === 'wellness'
                    ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Wellness</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('properties')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition shrink-0 ${
                  activeTab === 'properties'
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>Properties</span>
              </button>
            </div>

            {/* Form Fields Depending on Tab */}
            <form onSubmit={handleHeroSearch} className="mt-4">
              {activeTab === 'flights' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 items-end">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Departure City</label>
                    <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold">
                      <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
                      <input
                        type="text"
                        value={flightFrom}
                        onChange={(e) => setFlightFrom(e.target.value)}
                        className="bg-transparent w-full focus:outline-none text-slate-800"
                        placeholder="From City"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Destination City</label>
                    <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold">
                      <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
                      <input
                        type="text"
                        value={flightTo}
                        onChange={(e) => setFlightTo(e.target.value)}
                        className="bg-transparent w-full focus:outline-none text-slate-800"
                        placeholder="To City"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Travel Date</label>
                    <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold">
                      <Calendar className="w-4 h-4 text-indigo-600 shrink-0" />
                      <input
                        type="date"
                        value={flightDate}
                        onChange={(e) => setFlightDate(e.target.value)}
                        className="bg-transparent w-full focus:outline-none text-slate-800 text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <button
                      type="submit"
                      className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2"
                    >
                      <Search className="w-4 h-4" />
                      <span>Search Flights</span>
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'buses' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 items-end">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Boarding City</label>
                    <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold">
                      <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                      <input
                        type="text"
                        value={busFrom}
                        onChange={(e) => setBusFrom(e.target.value)}
                        className="bg-transparent w-full focus:outline-none text-slate-800"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Destination City</label>
                    <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold">
                      <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                      <input
                        type="text"
                        value={busTo}
                        onChange={(e) => setBusTo(e.target.value)}
                        className="bg-transparent w-full focus:outline-none text-slate-800"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Journey Date</label>
                    <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold">
                      <Calendar className="w-4 h-4 text-amber-600 shrink-0" />
                      <input
                        type="date"
                        value={busDate}
                        onChange={(e) => setBusDate(e.target.value)}
                        className="bg-transparent w-full focus:outline-none text-slate-800 text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <button
                      type="submit"
                      className="w-full py-3.5 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-amber-600/30 transition flex items-center justify-center gap-2"
                    >
                      <Search className="w-4 h-4" />
                      <span>Search Buses</span>
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'hotels' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Destination or City</label>
                    <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold">
                      <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                      <input
                        type="text"
                        value={hotelCity}
                        onChange={(e) => setHotelCity(e.target.value)}
                        className="bg-transparent w-full focus:outline-none text-slate-800"
                        placeholder="e.g. Goa, Jaipur, Udaipur"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Check-in Date</label>
                    <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold">
                      <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
                      <input
                        type="date"
                        value={hotelCheckIn}
                        onChange={(e) => setHotelCheckIn(e.target.value)}
                        className="bg-transparent w-full focus:outline-none text-slate-800 text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <button
                      type="submit"
                      className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2"
                    >
                      <Search className="w-4 h-4" />
                      <span>Find Stays & Spas</span>
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'wellness' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Holistic Therapy Category</label>
                    <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold">
                      <Sparkles className="w-4 h-4 text-teal-600 shrink-0" />
                      <select
                        value={wellnessCategory}
                        onChange={(e) => setWellnessCategory(e.target.value)}
                        className="bg-transparent w-full focus:outline-none text-slate-800"
                      >
                        <option value="ayurveda">Ayurveda & Panchakarma Detox</option>
                        <option value="yoga">Yoga Masters & Therapeutic Alignment</option>
                        <option value="meditation">Meditation & Tibetan Sound Healing</option>
                        <option value="physiotherapy">Physiotherapy & Sports Rehab</option>
                        <option value="nutrition">Clinical Nutrition & Gut Microbiome</option>
                        <option value="alternative">Acupuncture & Naturopathy</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <button
                      type="submit"
                      className="w-full py-3.5 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-teal-600/30 transition flex items-center justify-center gap-2"
                    >
                      <Search className="w-4 h-4" />
                      <span>Explore Practitioners</span>
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'properties' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Looking to Buy or Rent?</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPropertyPurpose('buy')}
                        className={`p-3 rounded-2xl text-xs font-bold border transition text-center ${
                          propertyPurpose === 'buy'
                            ? 'border-rose-600 bg-rose-50 text-rose-700'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        🏡 Buy Luxury Property
                      </button>
                      <button
                        type="button"
                        onClick={() => setPropertyPurpose('rent')}
                        className={`p-3 rounded-2xl text-xs font-bold border transition text-center ${
                          propertyPurpose === 'rent'
                            ? 'border-rose-600 bg-rose-50 text-rose-700'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        🔑 Rent Elite Residences
                      </button>
                    </div>
                  </div>
                  <div>
                    <button
                      type="submit"
                      className="w-full py-3.5 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-rose-600/30 transition flex items-center justify-center gap-2"
                    >
                      <Search className="w-4 h-4" />
                      <span>Explore Properties</span>
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* 5 MAIN SERVICE CATEGORIES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Unified Architecture</span>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-1">Five Premium Verticals. One Portal.</h2>
          <p className="text-sm text-slate-500 mt-2">
            No need to juggle multiple apps or separate logins. Explore the core service categories below:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.id}
                href={cat.href}
                className="group relative bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white bg-gradient-to-tr ${cat.gradient} shadow-md`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition">
                      {cat.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition">
                    {cat.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    {cat.desc}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700 group-hover:text-indigo-600">
                  <span>Explore Now</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}

          {/* Become a Partner Callout Card */}
          <div className="relative bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white flex flex-col justify-between shadow-xl">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold mb-4">
                <Award className="w-4 h-4" />
                <span>Business Expansion</span>
              </div>
              <h3 className="text-xl font-bold text-white">Offer Services on AuraLife</h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Airlines, bus fleets, luxury hotels, certified practitioners, and realty agents can list inventory and receive bookings seamlessly.
              </p>
            </div>

            <div className="pt-6 mt-6 border-t border-white/10">
              <Link
                href="/partner/register"
                className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-md transition"
              >
                <span>Register as Partner</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* POPULAR WELLNESS PRACTITIONERS SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600">Holistic Care</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">Featured Wellness Healers</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Connect 1-on-1 with verified masters of traditional and integrative medicine.
            </p>
          </div>
          <Link
            href="/wellness"
            className="mt-3 sm:mt-0 inline-flex items-center gap-1 text-xs font-bold text-teal-600 hover:text-teal-700"
          >
            <span>View All Practitioners</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SAMPLE_PRACTITIONERS.slice(0, 3).map((prac) => (
            <div
              key={prac.id}
              className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3.5 mb-4">
                  <img
                    src={prac.avatar}
                    alt={prac.name}
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-200"
                  />
                  <div>
                    <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{prac.rating}</span>
                      <span className="text-slate-400 font-normal">({prac.reviewsCount})</span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm">{prac.name}</h3>
                    <p className="text-xs text-teal-600 font-medium truncate max-w-[200px]">{prac.specialization}</p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                  {prac.about}
                </p>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[11px] font-medium text-slate-600">
                    ⏱️ {prac.duration}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[11px] font-medium text-slate-600">
                    💻 {prac.consultationMode}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Consultation</span>
                  <div className="text-base font-black text-slate-900">₹{prac.price}</div>
                </div>
                <Link
                  href={`/wellness?practitioner=${prac.id}`}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-xs transition"
                >
                  Book Session
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED HOTELS & RESORTS SHOWCASE */}
      <section className="bg-slate-100/70 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Accommodations</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">Handpicked Luxury Retreats</h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                From lakeside Rajasthani sanctuaries to tranquil beachfront retreats.
              </p>
            </div>
            <Link
              href="/hotels"
              className="mt-3 sm:mt-0 inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700"
            >
              <span>Explore All Hotels</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SAMPLE_HOTELS.slice(0, 3).map((hotel) => (
              <div
                key={hotel.id}
                className="bg-white rounded-3xl overflow-hidden border border-slate-200/70 shadow-sm hover:shadow-xl transition flex flex-col justify-between"
              >
                <div className="relative h-48 w-full">
                  <img
                    src={hotel.image}
                    alt={hotel.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md text-xs font-bold text-slate-800 flex items-center gap-1 shadow-sm">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-current" />
                    <span>{hotel.rating}</span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{hotel.location}</span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-base">{hotel.name}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1">{hotel.description}</p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Starting from</span>
                      <div className="text-lg font-black text-slate-900">
                        ₹{hotel.pricePerNight?.toLocaleString()} <span className="text-xs font-normal text-slate-500">/ night</span>
                      </div>
                    </div>
                    <Link
                      href={`/hotels?selected=${hotel.id}`}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition"
                    >
                      View Rooms
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PROPERTIES SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600">Prime Realty</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">Curated Residences & Villas</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Schedule direct site walkthroughs with verified real estate partners.
            </p>
          </div>
          <Link
            href="/properties"
            className="mt-3 sm:mt-0 inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700"
          >
            <span>Browse All Properties</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {SAMPLE_PROPERTIES.slice(0, 2).map((prop) => (
            <div
              key={prop.id}
              className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-lg transition flex flex-col sm:flex-row"
            >
              <div className="sm:w-2/5 relative h-56 sm:h-auto">
                <img
                  src={prop.image}
                  alt={prop.title}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white shadow-sm">
                  {prop.purpose === 'buy' ? 'For Sale' : 'For Rent'}
                </span>
              </div>

              <div className="p-5 sm:w-3/5 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center gap-1 text-xs text-slate-400 mb-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    <span>{prop.location}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base leading-snug">{prop.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-slate-600 mt-2 font-medium">
                    <span>🛏️ {prop.bedrooms} BHK</span>
                    <span>•</span>
                    <span>🛁 {prop.bathrooms} Baths</span>
                    <span>•</span>
                    <span>📐 {prop.areaSqFt} sq ft</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-xl font-black text-rose-600">{prop.priceDisplay}</div>
                  <Link
                    href={`/properties?id=${prop.id}`}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition"
                  >
                    Request Visit
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW THE PLATFORM WORKS */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-400">Streamlined Workflow</span>
            <h2 className="text-3xl font-extrabold text-white mt-1">How AuraLife Works</h2>
            <p className="text-sm text-slate-400 mt-2">
              A transparent, friction-free booking journey from discovery to instant verification.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-3xl bg-slate-800/60 border border-slate-700/60 relative">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-400/30 flex items-center justify-center font-black text-lg mb-4">
                1
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Search & Compare</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Explore flights, sleeper buses, luxury hotels, certified healers, or prime real estate with interactive filters and live prices.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-800/60 border border-slate-700/60 relative">
              <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-400/30 flex items-center justify-center font-black text-lg mb-4">
                2
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Select Seats & Slots</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Choose bus berth configurations, doctor consultation timings, or book hotel rooms with instant breakdown of base fees and taxes.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-800/60 border border-slate-700/60 relative">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-400/30 flex items-center justify-center font-black text-lg mb-4">
                3
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Checkout & E-Ticket</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Complete simulated checkout, receive unique reference identifiers, and download or print official printable vouchers instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE AURALIFE - TRUST FACTORS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
          <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Verified Operators</h4>
            <p className="text-xs text-slate-500 mt-1">All airlines, buses, and healers undergo rigorous platform credential audits.</p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-3">
              <Zap className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Instant Confirmation</h4>
            <p className="text-xs text-slate-500 mt-1">Real-time seat reservations and printable e-tickets generated immediately.</p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
              <Heart className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Holistic Integration</h4>
            <p className="text-xs text-slate-500 mt-1">Combine restorative wellness breaks directly with hotel and travel schedules.</p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
              <Layers className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Unified Account</h4>
            <p className="text-xs text-slate-500 mt-1">All bookings, receipts, and property visits managed under one dashboard.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
