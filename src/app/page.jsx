'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Plane, Bus, Building2, Sparkles, Home, Search, MapPin,
  ArrowRight, Shield, Users, CreditCard, Headphones,
  CheckCircle, Award, Calendar, Leaf,
  ChevronDown, BadgePercent, Timer
} from 'lucide-react';
import { getCurrentUser } from '@/services/storage';

/* ── Data ── */
const SERVICE_TABS = [
  { id: 'flights', label: 'Flights', icon: Plane, color: '#2563eb', bg: 'bg-blue-600' },
  { id: 'buses', label: 'Buses', icon: Bus, color: '#ea580c', bg: 'bg-orange-600' },
  { id: 'hotels', label: 'Hotels', icon: Building2, color: '#059669', bg: 'bg-emerald-600' },
  { id: 'properties', label: 'Properties', icon: Home, color: '#e11d48', bg: 'bg-rose-600' },
  { id: 'wellness', label: 'Wellness', icon: Leaf, color: '#0d9488', bg: 'bg-teal-600' },
];


const WHY_FEATURES = [
  { icon: BadgePercent, title: 'Lowest Price', desc: 'Best price guarantee on every booking', color: 'text-orange-500', bg: 'bg-orange-50' },
  { icon: Shield, title: 'Secure Payments', desc: '256-bit encrypted transactions', color: 'text-blue-500', bg: 'bg-blue-50' },
  { icon: Timer, title: 'Instant Confirm', desc: 'Bookings confirmed in seconds', color: 'text-green-500', bg: 'bg-green-50' },
  { icon: Headphones, title: '24/7 Support', desc: 'Help via chat, email & phone', color: 'text-purple-500', bg: 'bg-purple-50' },
  { icon: CheckCircle, title: 'Easy Cancellation', desc: 'Free cancellation on most bookings', color: 'text-rose-500', bg: 'bg-rose-50' },
  { icon: Award, title: 'Verified Partners', desc: 'All providers vetted & rated', color: 'text-teal-500', bg: 'bg-teal-50' },
];

/* ── Search Forms ── */
function FlightSearch({ router }) {
  const [tripType, setTripType] = useState('oneway');
  return (
    <div className="space-y-5">
      <div className="flex gap-6">
        {['oneway', 'roundtrip'].map(t => (
          <label key={t} className="flex items-center gap-2.5 cursor-pointer select-none">
            <span className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center transition-colors ${tripType === t ? 'border-blue-600' : 'border-gray-300'}`}>
              {tripType === t && <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
            </span>
            <span className={`text-sm font-medium ${tripType === t ? 'text-gray-900' : 'text-gray-500'}`}>
              {t === 'oneway' ? 'One Way' : 'Round Trip'}
            </span>
          </label>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <SearchField label="FROM" placeholder="Delhi (DEL)" icon={MapPin} accent="blue" />
        <SearchField label="TO" placeholder="Mumbai (BOM)" icon={MapPin} accent="blue" />
        <SearchField label="DEPARTURE" type="date" icon={Calendar} accent="blue" />
        <div>
          <label className="block text-[11px] font-bold text-gray-400 mb-1.5 tracking-widest">TRAVELLERS</label>
          <div className="relative">
            <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select className="w-full pl-10 pr-8 h-12 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none transition">
              {[1,2,3,4,5,6].map(n => <option key={n}>{n} Traveller{n > 1 ? 's' : ''}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
        <div className="flex items-end">
          <button onClick={() => router.push('/flights')}
            className="w-full h-12 bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2">
            <Search className="w-4 h-4" /> Search
          </button>
        </div>
      </div>
    </div>
  );
}

function BusSearch({ router }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
      <SearchField label="FROM" placeholder="Bangalore" icon={MapPin} accent="orange" />
      <SearchField label="TO" placeholder="Chennai" icon={MapPin} accent="orange" />
      <SearchField label="DATE" type="date" icon={Calendar} accent="orange" />
      <div className="flex items-end">
        <button onClick={() => router.push('/buses')}
          className="w-full h-12 bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2">
          <Search className="w-4 h-4" /> Search Buses
        </button>
      </div>
    </div>
  );
}

function HotelSearch({ router }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
      <SearchField label="CITY" placeholder="Goa" icon={MapPin} accent="emerald" />
      <SearchField label="CHECK-IN" type="date" icon={Calendar} accent="emerald" />
      <SearchField label="CHECK-OUT" type="date" icon={Calendar} accent="emerald" />
      <div>
        <label className="block text-[11px] font-bold text-gray-400 mb-1.5 tracking-widest">GUESTS</label>
        <div className="relative">
          <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select className="w-full pl-10 pr-8 h-12 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none transition">
            {[1,2,3,4,5].map(n => <option key={n}>{n} Guest{n > 1 ? 's' : ''}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>
      <div className="flex items-end">
        <button onClick={() => router.push('/hotels')}
          className="w-full h-12 bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2">
          <Search className="w-4 h-4" /> Search Hotels
        </button>
      </div>
    </div>
  );
}

function PropertySearch({ router }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
      <SearchField label="LOCATION" placeholder="Mumbai" icon={MapPin} accent="rose" />
      <div>
        <label className="block text-[11px] font-bold text-gray-400 mb-1.5 tracking-widest">TYPE</label>
        <div className="relative">
          <Home className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select className="w-full pl-10 pr-8 h-12 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 text-sm font-medium outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 appearance-none transition">
            <option>All Types</option><option>Apartment</option><option>House</option><option>Villa</option><option>Commercial</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>
      <div>
        <label className="block text-[11px] font-bold text-gray-400 mb-1.5 tracking-widest">BUDGET</label>
        <div className="relative">
          <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select className="w-full pl-10 pr-8 h-12 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 text-sm font-medium outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 appearance-none transition">
            <option>Any Budget</option><option>Under 20 Lakh</option><option>20-50 Lakh</option><option>50L - 1 Cr</option><option>1 Cr+</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>
      <div className="flex items-end">
        <button onClick={() => router.push('/properties')}
          className="w-full h-12 bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2">
          <Search className="w-4 h-4" /> Search
        </button>
      </div>
    </div>
  );
}

function WellnessSearch({ router }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
      <div>
        <label className="block text-[11px] font-bold text-gray-400 mb-1.5 tracking-widest">SERVICE</label>
        <div className="relative">
          <Leaf className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select className="w-full pl-10 pr-8 h-12 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 text-sm font-medium outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 appearance-none transition">
            <option>All Services</option><option>Yoga</option><option>Ayurveda</option><option>Meditation</option><option>Naturopathy</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>
      <SearchField label="LOCATION" placeholder="Rishikesh" icon={MapPin} accent="teal" />
      <SearchField label="DATE" type="date" icon={Calendar} accent="teal" />
      <div className="flex items-end">
        <button onClick={() => router.push('/wellness')}
          className="w-full h-12 bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2">
          <Search className="w-4 h-4" /> Find Sessions
        </button>
      </div>
    </div>
  );
}

function SearchField({ label, placeholder, icon: Icon, type = 'text', accent = 'blue' }) {
  const ring = `focus:ring-${accent}-500 focus:border-${accent}-500`;
  return (
    <div>
      <label className="block text-[11px] font-bold text-gray-400 mb-1.5 tracking-widest">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type={type} placeholder={placeholder}
          className={`w-full pl-10 pr-3 h-12 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 text-sm font-medium placeholder-gray-400 outline-none focus:ring-2 ${ring} transition`} />
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function HomePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('flights');

  useEffect(() => {
    setCurrentUser(getCurrentUser());
    const handler = () => setCurrentUser(getCurrentUser());
    window.addEventListener('storage', handler);
    window.addEventListener('auralife_storage_update', handler);
    return () => {
      window.removeEventListener('storage', handler);
      window.removeEventListener('auralife_storage_update', handler);
    };
  }, []);

  const searchForms = {
    flights: <FlightSearch router={router} />,
    buses: <BusSearch router={router} />,
    hotels: <HotelSearch router={router} />,
    properties: <PropertySearch router={router} />,
    wellness: <WellnessSearch router={router} />,
  };

  return (
    <div className="min-h-screen bg-white pb-20 lg:pb-0">

      {/* ═══ HERO + SEARCH ═══ */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-10 sm:pt-16 pb-10 sm:pb-14">
          <div className="text-center mb-8 sm:mb-10">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full mb-4">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
              <span className="text-xs font-semibold text-blue-200 tracking-wide">India&apos;s #1 Multi-Service Platform</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight">
              Book Your Perfect <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-300">Journey</span>
            </h1>
            <p className="mt-3 text-blue-200/80 text-base sm:text-lg font-medium max-w-xl mx-auto">
              Flights, Buses, Hotels, Properties & Wellness — all in one place
            </p>
          </div>

          {/* Search Card */}
          <div className="bg-white rounded-2xl shadow-2xl shadow-black/20 p-5 sm:p-7">
            {/* Tabs */}
            <div className="flex items-center gap-0.5 mb-5 border-b border-gray-100 overflow-x-auto scrollbar-hide">
              {SERVICE_TABS.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className={`relative flex items-center gap-2 px-5 py-3 text-sm font-semibold whitespace-nowrap transition-all ${
                      active ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'
                    }`}>
                    <Icon className="w-[18px] h-[18px]" style={active ? { color: tab.color } : {}} />
                    {tab.label}
                    {active && <span className="absolute bottom-0 left-2 right-2 h-[3px] bg-orange-500 rounded-full" />}
                  </button>
                );
              })}
            </div>
            {searchForms[activeTab]}
          </div>
        </div>
      </section>


      {/* ═══ OUR SERVICES ═══ */}
      <section className="py-14 bg-gray-50/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Our Services</h2>
            <p className="text-gray-500 text-sm mt-1">Everything you need, all in one place</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { title: 'Flights', desc: 'Lowest fares guaranteed', icon: Plane, color: 'text-blue-600', bg: 'bg-blue-50', ring: 'ring-blue-100', href: '/flights' },
              { title: 'Bus Tickets', desc: '500+ routes covered', icon: Bus, color: 'text-orange-600', bg: 'bg-orange-50', ring: 'ring-orange-100', href: '/buses' },
              { title: 'Hotels', desc: 'Best stays & resorts', icon: Building2, color: 'text-emerald-600', bg: 'bg-emerald-50', ring: 'ring-emerald-100', href: '/hotels' },
              { title: 'Properties', desc: 'Buy, sell or rent', icon: Home, color: 'text-rose-600', bg: 'bg-rose-50', ring: 'ring-rose-100', href: '/properties' },
              { title: 'Wellness', desc: 'Health & healing', icon: Leaf, color: 'text-teal-600', bg: 'bg-teal-50', ring: 'ring-teal-100', href: '/wellness' },
            ].map((svc) => {
              const Icon = svc.icon;
              return (
                <Link key={svc.title} href={svc.href}
                  className="bg-white rounded-2xl p-6 text-center ring-1 ring-gray-100 hover:ring-2 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                  <div className={`w-16 h-16 rounded-2xl ${svc.bg} ring-1 ${svc.ring} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-8 h-8 ${svc.color}`} />
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm">{svc.title}</h3>
                  <p className="text-xs text-gray-500 mt-1.5">{svc.desc}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>


      {/* ═══ WHY ONECONNECT ═══ */}
      <section className="py-14 bg-gray-50/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Why Choose OneConnect?</h2>
            <p className="text-gray-500 text-sm mt-1">Trusted by thousands of happy customers</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {WHY_FEATURES.map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="bg-white rounded-2xl p-5 text-center ring-1 ring-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group">
                  <div className={`w-14 h-14 rounded-2xl ${item.bg} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-7 h-7 ${item.color}`} />
                  </div>
                  <h3 className="font-bold text-gray-900 text-xs leading-tight">{item.title}</h3>
                  <p className="text-[11px] text-gray-400 mt-1.5 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>


      {/* ═══ CTA BANNER ═══ */}
      <section className="py-12 bg-gray-50/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="relative bg-gradient-to-r from-orange-500 via-orange-500 to-amber-500 rounded-2xl p-8 sm:p-12 overflow-hidden">
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full" />
            <div className="absolute -bottom-16 left-1/4 w-52 h-52 bg-white/10 rounded-full" />

            <div className="relative flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Ready to Get Started?</h2>
                <p className="text-orange-100 text-sm sm:text-base mt-2 max-w-lg leading-relaxed">
                  Join thousands of users who book flights, buses, hotels, properties, and wellness services all in one place.
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Link href="/register"
                  className="px-7 py-3.5 bg-white text-orange-600 font-bold text-sm rounded-xl hover:bg-orange-50 transition-all shadow-xl shadow-orange-600/20 flex items-center gap-2">
                  Sign Up Free <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/flights"
                  className="px-7 py-3.5 bg-white/15 text-white font-bold text-sm rounded-xl hover:bg-white/25 transition-all border border-white/30 backdrop-blur-sm flex items-center gap-2">
                  Explore Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
