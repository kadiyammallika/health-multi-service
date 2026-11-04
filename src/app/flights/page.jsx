'use client';

import { useState } from 'react';
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
  Sparkles,
  Luggage,
  Coffee,
  Ticket
} from 'lucide-react';
import { SAMPLE_AIRPORTS, SAMPLE_FLIGHTS } from '@/data/flightsData';
import { saveBooking, getCurrentUser } from '@/services/storage';
import PaymentModal from '@/components/ui/PaymentModal';
import TicketModal from '@/components/ui/TicketModal';

export default function FlightsPage() {
  // Step State: 'search', 'results', 'passenger', 'summary', 'confirmed'
  const [step, setStep] = useState('results'); // default to results to show interactive content immediately!

  // Search parameters
  const [tripType, setTripType] = useState('oneway'); // 'oneway' or 'roundtrip'
  const [fromCode, setFromCode] = useState('DEL');
  const [toCode, setToCode] = useState('BOM');
  const [departDate, setDepartDate] = useState('2026-11-15');
  const [returnDate, setReturnDate] = useState('2026-11-20');
  const [passengersCount, setPassengersCount] = useState(1);
  const [travelClass, setTravelClass] = useState('Economy');

  // Filters & Sorting
  const [sortBy, setSortBy] = useState('cheapest'); // 'cheapest', 'fastest', 'earliest'
  const [maxPrice, setMaxPrice] = useState(8000);
  const [selectedAirline, setSelectedAirline] = useState('all');

  // Selected Flight & Passenger Form
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [passengers, setPassengers] = useState([
    { name: 'Alex Morgan', age: '32', gender: 'Female' }
  ]);
  const [contactEmail, setContactEmail] = useState('alex.morgan@example.com');
  const [contactPhone, setContactPhone] = useState('+91 98765 43210');
  const [formErrors, setFormErrors] = useState({});

  // Payment & Confirmation state
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

  // Filter flights matching route or sample fallback
  const filteredFlights = SAMPLE_FLIGHTS.filter((flight) => {
    // If route matches or user switched cities
    const routeMatch = (flight.from === fromCode && flight.to === toCode) ||
      (fromCode === 'DEL' && toCode === 'BOM'); // generous fallback for demo
    const priceMatch = flight.price <= maxPrice;
    const airlineMatch = selectedAirline === 'all' || flight.airline === selectedAirline;
    return priceMatch && airlineMatch;
  }).sort((a, b) => {
    if (sortBy === 'cheapest') return a.price - b.price;
    if (sortBy === 'fastest') return a.duration.localeCompare(b.duration);
    return a.departureTime.localeCompare(b.departureTime);
  });

  const handleSwapAirports = () => {
    const temp = fromCode;
    setFromCode(toCode);
    setToCode(temp);
  };

  const handleSelectFlight = (flight) => {
    setSelectedFlight(flight);
    // adjust passenger array length to passengersCount
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

  const handlePaymentSuccess = (paymentDetails) => {
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
      status: 'Confirmed'
    };

    const saved = saveBooking(newBooking);
    setConfirmedBooking(saved);
    setStep('confirmed');
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Step Indicator Header */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center justify-between overflow-x-auto text-xs font-semibold">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Plane className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900">Commercial Flight Portal</h1>
              <span className="text-[10px] text-slate-400">Search • Compare • Reserve Instant E-Tickets</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0 text-slate-400 text-xs">
            <span className={step === 'results' ? 'text-indigo-600 font-bold' : ''}>1. Select Flight</span>
            <span>➔</span>
            <span className={step === 'passenger' ? 'text-indigo-600 font-bold' : ''}>2. Passenger Info</span>
            <span>➔</span>
            <span className={step === 'summary' ? 'text-indigo-600 font-bold' : ''}>3. Review & Pay</span>
            <span>➔</span>
            <span className={step === 'confirmed' ? 'text-emerald-600 font-bold' : ''}>4. E-Ticket Issued</span>
          </div>
        </div>

        {/* STEP 1: FLIGHT SEARCH BAR (Always accessible) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-md">
          {/* Trip Type & Class toggles */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 text-xs">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setTripType('oneway')}
                className={`px-3 py-1.5 rounded-full font-semibold transition ${
                  tripType === 'oneway' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                One-Way
              </button>
              <button
                type="button"
                onClick={() => setTripType('roundtrip')}
                className={`px-3 py-1.5 rounded-full font-semibold transition ${
                  tripType === 'roundtrip' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                Round-Trip
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                <Users className="w-3.5 h-3.5 text-indigo-600" />
                <span>Travelers:</span>
                <select
                  value={passengersCount}
                  onChange={(e) => setPassengersCount(Number(e.target.value))}
                  className="bg-slate-100 rounded-lg px-2 py-1 font-semibold text-slate-800 focus:outline-none"
                >
                  <option value={1}>1 Adult</option>
                  <option value={2}>2 Adults</option>
                  <option value={3}>3 Adults</option>
                  <option value={4}>4 Adults</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                <select
                  value={travelClass}
                  onChange={(e) => setTravelClass(e.target.value)}
                  className="bg-slate-100 rounded-lg px-2 py-1 font-semibold text-slate-800 focus:outline-none"
                >
                  <option value="Economy">Economy</option>
                  <option value="Premium Economy">Premium Economy</option>
                  <option value="Business">Business Class</option>
                </select>
              </div>
            </div>
          </div>

          {/* City & Date Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-4 items-center">
            {/* From */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
              <span className="block text-[10px] uppercase font-bold text-slate-400">From</span>
              <select
                value={fromCode}
                onChange={(e) => setFromCode(e.target.value)}
                className="bg-transparent font-bold text-slate-800 w-full focus:outline-none text-sm mt-1"
              >
                {SAMPLE_AIRPORTS.map((a) => (
                  <option key={a.code} value={a.code}>
                    {a.city} ({a.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Swap Button */}
            <div className="hidden lg:flex justify-center -mx-4 z-10">
              <button
                type="button"
                onClick={handleSwapAirports}
                className="p-2 rounded-full bg-white border border-slate-200 text-indigo-600 hover:bg-indigo-50 shadow-sm transition"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* To */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
              <span className="block text-[10px] uppercase font-bold text-slate-400">To</span>
              <select
                value={toCode}
                onChange={(e) => setToCode(e.target.value)}
                className="bg-transparent font-bold text-slate-800 w-full focus:outline-none text-sm mt-1"
              >
                {SAMPLE_AIRPORTS.map((a) => (
                  <option key={a.code} value={a.code}>
                    {a.city} ({a.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Depart Date */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
              <span className="block text-[10px] uppercase font-bold text-slate-400">Departure</span>
              <input
                type="date"
                value={departDate}
                onChange={(e) => setDepartDate(e.target.value)}
                className="bg-transparent font-bold text-slate-800 w-full focus:outline-none text-xs mt-1"
              />
            </div>

            {/* Return Date / Search CTA */}
            {tripType === 'roundtrip' ? (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                <span className="block text-[10px] uppercase font-bold text-slate-400">Return</span>
                <input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="bg-transparent font-bold text-slate-800 w-full focus:outline-none text-xs mt-1"
                />
              </div>
            ) : (
              <div>
                <button
                  type="button"
                  onClick={() => setStep('results')}
                  className="w-full py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/30 transition flex items-center justify-center gap-2"
                >
                  <Plane className="w-4 h-4" />
                  <span>Search Flights</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* STEP 2: FLIGHT RESULTS WITH SORTING & FILTERS */}
        {step === 'results' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
            {/* Filters Sidebar */}
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <Filter className="w-4 h-4 text-indigo-600" />
                  <span>Filters</span>
                </div>
                <button
                  onClick={() => {
                    setMaxPrice(8000);
                    setSelectedAirline('all');
                    setSortBy('cheapest');
                  }}
                  className="text-[11px] text-indigo-600 hover:underline"
                >
                  Reset All
                </button>
              </div>

              {/* Price Filter */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-2">
                  <span>Max Fare</span>
                  <span className="font-bold text-indigo-600">₹{maxPrice.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min={3000}
                  max={8000}
                  step={500}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              {/* Airline Filter */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Airline</label>
                <div className="space-y-1.5 text-xs text-slate-600">
                  {['all', 'AeroSky Air', 'Vistara Wings', 'IndiGo Express', 'Air India Premier'].map((al) => (
                    <label key={al} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="airline"
                        checked={selectedAirline === al}
                        onChange={() => setSelectedAirline(al)}
                        className="accent-indigo-600"
                      />
                      <span>{al === 'all' ? 'All Carriers' : al}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Stops Note */}
              <div className="p-3 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-[11px] text-indigo-900">
                <span className="font-bold block mb-1">Direct Authorized inventory</span>
                Schedules and seat configurations retrieved via connected airline API integrations.
              </div>
            </div>

            {/* Flight Results List */}
            <div className="lg:col-span-3 space-y-4">
              {/* Sorting Bar */}
              <div className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="text-slate-500 font-medium">
                  Showing <strong className="text-slate-800">{filteredFlights.length}</strong> available flights for {fromCode} ➔ {toCode}
                </span>

                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="p-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 bg-white"
                  >
                    <option value="cheapest">Price: Lowest First</option>
                    <option value="fastest">Fastest Duration</option>
                    <option value="earliest">Earliest Departure</option>
                  </select>
                </div>
              </div>

              {/* Flight Cards */}
              {filteredFlights.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-100">
                  <Plane className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-slate-800">No matching flights found</h3>
                  <p className="text-xs text-slate-500 mt-1">Try raising your price ceiling or resetting filters.</p>
                </div>
              ) : (
                filteredFlights.map((flight) => (
                  <div
                    key={flight.id}
                    className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5"
                  >
                    {/* Airline & Aircraft Info */}
                    <div className="flex items-center gap-3 w-full sm:w-1/4">
                      <div className="w-11 h-11 rounded-2xl bg-indigo-50 flex items-center justify-center text-xl shrink-0">
                        {flight.logo}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{flight.airline}</h4>
                        <span className="text-xs font-mono text-slate-400">{flight.flightNumber}</span>
                        <div className="text-[10px] text-slate-500 mt-0.5">{flight.aircraft}</div>
                      </div>
                    </div>

                    {/* Timings & Duration */}
                    <div className="flex items-center justify-between sm:justify-center gap-4 flex-1 w-full text-center">
                      <div>
                        <div className="text-lg font-black text-slate-900">{flight.departureTime}</div>
                        <span className="text-xs font-bold text-slate-500">{flight.from}</span>
                      </div>

                      <div className="flex flex-col items-center">
                        <span className="text-[11px] font-medium text-slate-400">{flight.duration}</span>
                        <div className="w-24 sm:w-32 h-0.5 bg-slate-200 relative my-1">
                          <Plane className="w-3 h-3 text-indigo-600 absolute -top-1.5 left-1/2 -translate-x-1/2 rotate-90" />
                        </div>
                        <span className="text-[10px] font-semibold text-emerald-600">{flight.stops}</span>
                      </div>

                      <div>
                        <div className="text-lg font-black text-slate-900">{flight.arrivalTime}</div>
                        <span className="text-xs font-bold text-slate-500">{flight.to}</span>
                      </div>
                    </div>

                    {/* Price & Book Action */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">Per Person</span>
                        <div className="text-2xl font-black text-slate-900">₹{flight.price.toLocaleString()}</div>
                        <span className="text-[10px] text-emerald-600 font-semibold">{flight.availableSeats} seats left</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSelectFlight(flight)}
                        className="mt-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition flex items-center gap-1.5"
                      >
                        <span>Select</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* STEP 4: PASSENGER DETAILS FORM */}
        {step === 'passenger' && selectedFlight && (
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Selected Flight Snapshot */}
            <div className="bg-indigo-900 text-white rounded-3xl p-5 flex items-center justify-between">
              <div>
                <span className="text-xs text-indigo-200 font-semibold uppercase">Selected Flight</span>
                <h3 className="text-lg font-bold">
                  {selectedFlight.airline} ({selectedFlight.flightNumber}) • {selectedFlight.from} ➔ {selectedFlight.to}
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  {departDate} • {selectedFlight.departureTime} • {passengersCount} Passenger(s)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStep('results')}
                className="text-xs text-indigo-200 hover:text-white underline"
              >
                Change Flight
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleProceedToSummary} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-md space-y-6">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                Passenger Details ({passengersCount} Traveler{passengersCount > 1 ? 's' : ''})
              </h3>

              {passengers.map((p, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                  <span className="text-xs font-bold text-slate-700 uppercase">Passenger {idx + 1} (Adult)</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name (As per Gov ID)</label>
                      <input
                        type="text"
                        value={p.name}
                        onChange={(e) => handlePassengerChange(idx, 'name', e.target.value)}
                        placeholder="e.g. Alex Morgan"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                      {formErrors[`name_${idx}`] && (
                        <p className="text-[10px] text-rose-500 mt-1">{formErrors[`name_${idx}`]}</p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Age</label>
                        <input
                          type="number"
                          value={p.age}
                          onChange={(e) => handlePassengerChange(idx, 'age', e.target.value)}
                          placeholder="30"
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none"
                          required
                        />
                        {formErrors[`age_${idx}`] && (
                          <p className="text-[10px] text-rose-500 mt-1">{formErrors[`age_${idx}`]}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Gender</label>
                        <select
                          value={p.gender}
                          onChange={(e) => handlePassengerChange(idx, 'gender', e.target.value)}
                          className="w-full px-2 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none"
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

              {/* Contact Information */}
              <div className="border-t border-slate-100 pt-4 space-y-3">
                <h4 className="text-xs font-bold uppercase text-slate-700">Contact & Ticket Delivery</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none"
                      required
                    />
                    {formErrors.email && <p className="text-[10px] text-rose-500 mt-1">{formErrors.email}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Mobile Number</label>
                    <input
                      type="text"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none"
                      required
                    />
                    {formErrors.phone && <p className="text-[10px] text-rose-500 mt-1">{formErrors.phone}</p>}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep('results')}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Back to Results
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition flex items-center gap-2"
                >
                  <span>Review Booking Summary</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 5: BOOKING SUMMARY & PAYMENT PREPARATION */}
        {step === 'summary' && selectedFlight && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-lg space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Booking Summary</h3>
                  <p className="text-xs text-slate-400">Please review before completing simulated payment</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md font-bold">
                    Class: {travelClass}
                  </span>
                </div>
              </div>

              {/* Journey details */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
                <div className="flex justify-between font-bold text-slate-800">
                  <span>{selectedFlight.airline} • {selectedFlight.flightNumber}</span>
                  <span>{departDate}</span>
                </div>
                <div className="text-slate-600">
                  {selectedFlight.fromCity} ({selectedFlight.from}) ➔ {selectedFlight.toCity} ({selectedFlight.to})
                </div>
                <div className="text-slate-500">
                  Departure: {selectedFlight.departureTime} | Arrival: {selectedFlight.arrivalTime} ({selectedFlight.duration})
                </div>
              </div>

              {/* Passengers list */}
              <div>
                <h4 className="text-xs font-bold uppercase text-slate-500 mb-2">Passengers ({passengers.length})</h4>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs">
                  {passengers.map((p, idx) => (
                    <div key={idx} className="p-3 flex justify-between bg-white">
                      <span className="font-semibold text-slate-800">{idx + 1}. {p.name}</span>
                      <span className="text-slate-500">{p.age} yrs • {p.gender}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fare Breakdown */}
              <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Base Airfare ({passengersCount} Traveler{passengersCount > 1 ? 's' : ''})</span>
                  <span>₹{baseFare.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Aviation Taxes & Passenger Service Fee</span>
                  <span>₹{taxes.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Instant E-Ticketing Fee</span>
                  <span>₹{convenienceFee}</span>
                </div>
                <div className="pt-2 border-t border-indigo-200 flex justify-between text-base font-black text-indigo-950">
                  <span>Total Amount Payable</span>
                  <span>₹{totalAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* Proceed to Payment Action */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep('passenger')}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Edit Passenger Details
                </button>
                <button
                  type="button"
                  onClick={() => setIsPaymentOpen(true)}
                  className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition flex items-center gap-2"
                >
                  <span>Proceed to Simulated Pay ₹{totalAmount.toLocaleString()}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 7: CONFIRMATION SCREEN */}
        {step === 'confirmed' && confirmedBooking && (
          <div className="max-w-2xl mx-auto bg-white rounded-3xl p-8 border border-slate-100 shadow-xl text-center space-y-6">
            <div className="w-16 h-16 mx-auto bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                Booking Confirmed & E-Ticket Issued
              </span>
              <h2 className="text-2xl font-black text-slate-900 mt-3">Ready for Takeoff!</h2>
              <p className="text-xs text-slate-500 mt-1">
                Booking Reference: <strong className="font-mono text-indigo-600">{confirmedBooking.reference}</strong>
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-left space-y-2">
              <div className="flex justify-between font-bold text-slate-800">
                <span>{confirmedBooking.airline} ({confirmedBooking.flightNumber})</span>
                <span>{confirmedBooking.date}</span>
              </div>
              <div className="text-slate-600">
                {confirmedBooking.fromCity} ➔ {confirmedBooking.toCity} ({confirmedBooking.time})
              </div>
              <div className="text-slate-500">
                Passenger(s): {confirmedBooking.passengers?.map((p) => p.name).join(', ')}
              </div>
              <div className="font-bold text-emerald-700 pt-1">
                Amount Paid: ₹{confirmedBooking.totalAmount?.toLocaleString()}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsTicketModalOpen(true)}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
              >
                <Ticket className="w-4 h-4" />
                <span>View & Print Boarding Pass</span>
              </button>

              <Link
                href="/bookings"
                className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs transition"
              >
                Go to My Bookings
              </Link>
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
    </div>
  );
}
