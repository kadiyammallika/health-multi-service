'use client';

import { useState } from 'react';
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
  Building
} from 'lucide-react';
import { PROPERTY_LOCATIONS, PROPERTY_TYPES, SAMPLE_PROPERTIES } from '@/data/propertiesData';
import { savePropertyEnquiry } from '@/services/storage';

export default function PropertiesPage() {
  const [purpose, setPurpose] = useState('buy'); // 'buy' or 'rent'
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedType, setSelectedType] = useState('All Types');
  const [selectedBedrooms, setSelectedBedrooms] = useState('all');

  // Selected property for site visit / enquiry modal
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);
  const [enquiryType, setEnquiryType] = useState('Site Visit & Inspection Request');
  const [clientName, setClientName] = useState('Alex Morgan');
  const [clientEmail, setClientEmail] = useState('alex.morgan@example.com');
  const [clientPhone, setClientPhone] = useState('+91 98765 43210');
  const [preferredDate, setPreferredDate] = useState('2026-11-25');
  const [preferredTime, setPreferredTime] = useState('Morning (10:00 AM - 12:00 PM)');
  const [message, setMessage] = useState('Interested in viewing the floor plans and scheduling an on-site visit with our family.');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedEnquiry, setSubmittedEnquiry] = useState(null);

  const filteredProperties = SAMPLE_PROPERTIES.filter((p) => {
    const purposeMatch = p.purpose === purpose;
    const typeMatch = selectedType === 'All Types' || p.propertyType === selectedType;
    const bedMatch = selectedBedrooms === 'all' || p.bedrooms === Number(selectedBedrooms);
    return purposeMatch && typeMatch && bedMatch;
  });

  const handleOpenEnquiry = (property) => {
    setSelectedProperty(property);
    setSubmittedEnquiry(null);
    setIsEnquiryModalOpen(true);
  };

  const handleEnquirySubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newEnquiry = savePropertyEnquiry({
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
      agentEmail: selectedProperty.agent.email,
      agentName: selectedProperty.agent.name
    });

    setIsSubmitting(false);
    setSubmittedEnquiry(newEnquiry);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Hero Header */}
        <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-indigo-950 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden">
          <div className="max-w-2xl relative z-10 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-semibold">
              <Home className="w-3.5 h-3.5" />
              <span>Verified Residential & Commercial Real Estate</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Premium Property Buying & Renting
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Explore bespoke private villas, luxury sea-facing penthouses, and prime corporate suites. Connect directly with verified agents and schedule official site visits.
            </p>
          </div>
        </div>

        {/* Buy / Rent Switcher & Search Bar */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-md space-y-5">
          {/* Purpose Tabs */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPurpose('buy')}
              className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
                purpose === 'buy'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>🏡 Buy Property</span>
            </button>
            <button
              type="button"
              onClick={() => setPurpose('rent')}
              className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
                purpose === 'rent'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>🔑 Rent Property</span>
            </button>
          </div>

          {/* Filters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
              <span className="block text-[10px] uppercase font-bold text-slate-400">Property Type</span>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="bg-transparent font-bold text-slate-800 w-full focus:outline-none text-xs mt-1"
              >
                {PROPERTY_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
              <span className="block text-[10px] uppercase font-bold text-slate-400">Bedrooms</span>
              <select
                value={selectedBedrooms}
                onChange={(e) => setSelectedBedrooms(e.target.value)}
                className="bg-transparent font-bold text-slate-800 w-full focus:outline-none text-xs mt-1"
              >
                <option value="all">Any BHK Configuration</option>
                <option value="2">2 BHK</option>
                <option value="3">3 BHK</option>
                <option value="4">4 BHK</option>
                <option value="5">5+ BHK</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-3 bg-rose-50/60 border border-rose-100 rounded-2xl text-xs text-rose-900 font-semibold">
              <span>Verified Agent Listings Only</span>
              <ShieldCheck className="w-5 h-5 text-rose-600 shrink-0" />
            </div>
          </div>
        </div>

        {/* Property Listings */}
        <div className="space-y-6">
          <div className="text-xs text-slate-500 font-semibold">
            Showing {filteredProperties.length} properties for {purpose === 'buy' ? 'Sale' : 'Rent'}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredProperties.map((prop) => (
              <div
                key={prop.id}
                className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition flex flex-col justify-between"
              >
                {/* Image Gallery Header */}
                <div className="relative h-64 w-full">
                  <img src={prop.image} alt={prop.title} className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-rose-600 text-white shadow-sm">
                      {prop.purpose === 'buy' ? 'For Sale' : 'For Rent'}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/90 backdrop-blur-md text-slate-800 shadow-sm">
                      {prop.propertyType}
                    </span>
                  </div>
                  <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-slate-950/80 backdrop-blur-md text-white font-mono font-bold text-sm">
                    {prop.priceDisplay}
                  </div>
                </div>

                {/* Details */}
                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      <span>{prop.location}</span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-lg leading-snug">{prop.title}</h3>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{prop.description}</p>
                  </div>

                  {/* Specs Matrix */}
                  <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Bedrooms</span>
                      <strong className="text-slate-800">{prop.bedrooms} BHK</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Baths</span>
                      <strong className="text-slate-800">{prop.bathrooms} Baths</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Carpet Area</span>
                      <strong className="text-slate-800">{prop.areaSqFt} sq ft</strong>
                    </div>
                  </div>

                  {/* Amenities */}
                  <div className="flex flex-wrap gap-1.5">
                    {prop.amenities.slice(0, 4).map((amen, idx) => (
                      <span key={idx} className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                        {amen}
                      </span>
                    ))}
                  </div>

                  {/* Agent Info & Action Button */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={prop.agent.avatar}
                        alt={prop.agent.name}
                        className="w-10 h-10 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-800">{prop.agent.name}</div>
                        <div className="text-[10px] text-slate-400">Verified Realty Partner</div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenEnquiry(prop)}
                      className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Request Site Visit</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PROPERTY ENQUIRY & SITE VISIT MODAL */}
      {isEnquiryModalOpen && selectedProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-slate-900 to-rose-950 text-white">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-rose-500/20 rounded-xl">
                  <Home className="w-5 h-5 text-rose-300" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Property Visit & Enquiry</h3>
                  <p className="text-xs text-rose-200 truncate max-w-xs">{selectedProperty.title}</p>
                </div>
              </div>
              <button
                onClick={() => setIsEnquiryModalOpen(false)}
                className="text-slate-300 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {submittedEnquiry ? (
                <div className="text-center py-6 space-y-4">
                  <div className="w-16 h-16 mx-auto bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center animate-bounce">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>
                  <div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Enquiry Generated
                    </span>
                    <h3 className="text-xl font-bold text-slate-900 mt-2">Enquiry Reference: {submittedEnquiry.id}</h3>
                    <p className="text-xs text-slate-600 max-w-md mx-auto mt-1">
                      Your visit request has been dispatched directly to <strong>{selectedProperty.agent.name}</strong>. This enquiry is tracked under your Customer Dashboard under the "Property Enquiries" tab (kept separate from ticket bookings).
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-left space-y-1">
                    <div><strong>Property:</strong> {submittedEnquiry.propertyTitle}</div>
                    <div><strong>Scheduled Date:</strong> {submittedEnquiry.preferredDate} ({submittedEnquiry.preferredTime})</div>
                    <div><strong>Contact:</strong> {submittedEnquiry.clientName} • {submittedEnquiry.clientPhone}</div>
                  </div>

                  <div className="flex justify-center gap-3 pt-2">
                    <button
                      onClick={() => setIsEnquiryModalOpen(false)}
                      className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold"
                    >
                      Close
                    </button>
                    <Link
                      href="/dashboard/customer"
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs"
                    >
                      View Enquiries in Dashboard
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleEnquirySubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Enquiry Purpose</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setEnquiryType('Site Visit & Inspection Request')}
                        className={`p-2.5 rounded-xl text-xs font-semibold border transition text-center ${
                          enquiryType.includes('Site Visit')
                            ? 'bg-rose-50 text-rose-700 border-rose-300'
                            : 'bg-slate-50 text-slate-600 border-slate-200'
                        }`}
                      >
                        📅 Schedule Site Visit
                      </button>
                      <button
                        type="button"
                        onClick={() => setEnquiryType('Callback & Price Negotiation')}
                        className={`p-2.5 rounded-xl text-xs font-semibold border transition text-center ${
                          enquiryType.includes('Callback')
                            ? 'bg-rose-50 text-rose-700 border-rose-300'
                            : 'bg-slate-50 text-slate-600 border-slate-200'
                        }`}
                      >
                        📞 Request Agent Callback
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Preferred Date</label>
                      <input
                        type="date"
                        value={preferredDate}
                        onChange={(e) => setPreferredDate(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Preferred Slot</label>
                      <select
                        value={preferredTime}
                        onChange={(e) => setPreferredTime(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800"
                      >
                        <option>Morning (10:00 AM - 12:00 PM)</option>
                        <option>Afternoon (02:00 PM - 04:00 PM)</option>
                        <option>Evening (04:30 PM - 06:30 PM)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Your Name</label>
                      <input
                        type="text"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Mobile Number</label>
                      <input
                        type="text"
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Special Message / Questions</label>
                    <textarea
                      rows={2}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEnquiryModalOpen(false)}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-md transition"
                    >
                      {isSubmitting ? 'Submitting...' : 'Send Visit Request'}
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
