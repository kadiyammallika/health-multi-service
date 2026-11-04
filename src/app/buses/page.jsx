'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Bus,
  MapPin,
  Calendar,
  Users,
  Clock,
  ArrowRight,
  Filter,
  CheckCircle2,
  Ticket,
  Star,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { SAMPLE_BUS_CITIES, SAMPLE_BUSES } from '@/data/busesData';
import { saveBooking } from '@/services/storage';
import PaymentModal from '@/components/ui/PaymentModal';
import TicketModal from '@/components/ui/TicketModal';

export default function BusesPage() {
  // Step state: 'results', 'seats', 'passenger', 'summary', 'confirmed'
  const [step, setStep] = useState('results');

  // Search parameters
  const [fromCity, setFromCity] = useState('New Delhi');
  const [toCity, setToCity] = useState('Jaipur');
  const [journeyDate, setJourneyDate] = useState('2026-11-18');
  const [busTypeFilter, setBusTypeFilter] = useState('all');

  // Selected bus & interactive seats
  const [selectedBus, setSelectedBus] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [selectedBoardingPoint, setSelectedBoardingPoint] = useState('');
  const [selectedDroppingPoint, setSelectedDroppingPoint] = useState('');

  // Passenger details
  const [passengers, setPassengers] = useState([]);
  const [contactEmail, setContactEmail] = useState('alex.morgan@example.com');
  const [contactPhone, setContactPhone] = useState('+91 98765 43210');
  const [formErrors, setFormErrors] = useState({});

  // Payment & confirmation
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

  // Deck matrix for interactive seat layout: Upper deck and Lower deck
  const lowerDeckSeats = ['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'L8', 'L9', 'L10', 'L11', 'L12'];
  const upperDeckSeats = ['U1', 'U2', 'U3', 'U4', 'U5', 'U6', 'U7', 'U8', 'U9', 'U10', 'U11', 'U12', 'U13', 'U14'];

  const filteredBuses = SAMPLE_BUSES.filter((bus) => {
    const routeMatch = (bus.fromCity.toLowerCase() === fromCity.toLowerCase() && bus.toCity.toLowerCase() === toCity.toLowerCase()) ||
      (fromCity === 'New Delhi' && toCity === 'Jaipur'); // demo fallback
    const typeMatch = busTypeFilter === 'all' || bus.busType.toLowerCase().includes(busTypeFilter.toLowerCase());
    return typeMatch;
  });

  const handleSelectBus = (bus) => {
    setSelectedBus(bus);
    setSelectedSeats([]);
    setSelectedBoardingPoint(bus.boardingPoints[0]);
    setSelectedDroppingPoint(bus.droppingPoints[0]);
    setStep('seats');
  };

  const handleToggleSeat = (seatId) => {
    if (!selectedBus) return;
    if (selectedBus.bookedSeats.includes(seatId)) return; // cannot pick booked seat

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
      name: idx === 0 ? 'Alex Morgan' : '',
      age: idx === 0 ? '32' : '',
      gender: idx === 0 ? 'Female' : 'Male',
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
  const taxes = Math.round(baseFare * 0.05); // 5% GST on luxury buses
  const convenienceFee = 60;
  const totalAmount = baseFare + taxes + convenienceFee;

  const handlePaymentSuccess = (paymentDetails) => {
    setIsPaymentOpen(false);

    const bookingRef = `BUS-${selectedBus.operator.substring(0, 2).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
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
      status: 'Confirmed'
    };

    const saved = saveBooking(newBooking);
    setConfirmedBooking(saved);
    setStep('confirmed');
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Breadcrumb */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center justify-between overflow-x-auto text-xs font-semibold">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Bus className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900">Luxury Bus & Sleeper Fleet</h1>
              <span className="text-[10px] text-slate-400">Interactive Seat Selection • Verified Operators</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0 text-slate-400 text-xs">
            <span className={step === 'results' ? 'text-amber-600 font-bold' : ''}>1. Select Bus</span>
            <span>➔</span>
            <span className={step === 'seats' ? 'text-amber-600 font-bold' : ''}>2. Pick Seats</span>
            <span>➔</span>
            <span className={step === 'passenger' ? 'text-amber-600 font-bold' : ''}>3. Passenger Info</span>
            <span>➔</span>
            <span className={step === 'summary' ? 'text-amber-600 font-bold' : ''}>4. Review & Pay</span>
            <span>➔</span>
            <span className={step === 'confirmed' ? 'text-emerald-600 font-bold' : ''}>5. Ticket Issued</span>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-md">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
              <span className="block text-[10px] uppercase font-bold text-slate-400">Boarding City</span>
              <select
                value={fromCity}
                onChange={(e) => setFromCity(e.target.value)}
                className="bg-transparent font-bold text-slate-800 w-full focus:outline-none text-sm mt-1"
              >
                {SAMPLE_BUS_CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
              <span className="block text-[10px] uppercase font-bold text-slate-400">Destination</span>
              <select
                value={toCity}
                onChange={(e) => setToCity(e.target.value)}
                className="bg-transparent font-bold text-slate-800 w-full focus:outline-none text-sm mt-1"
              >
                {SAMPLE_BUS_CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
              <span className="block text-[10px] uppercase font-bold text-slate-400">Journey Date</span>
              <input
                type="date"
                value={journeyDate}
                onChange={(e) => setJourneyDate(e.target.value)}
                className="bg-transparent font-bold text-slate-800 w-full focus:outline-none text-xs mt-1"
              />
            </div>

            <div>
              <button
                type="button"
                onClick={() => setStep('results')}
                className="w-full py-3.5 px-4 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-md shadow-amber-600/30 transition flex items-center justify-center gap-2"
              >
                <Bus className="w-4 h-4" />
                <span>Search Buses</span>
              </button>
            </div>
          </div>
        </div>

        {/* STEP 1: BUS RESULTS LIST */}
        {step === 'results' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-500 bg-white p-3 rounded-2xl border border-slate-100">
              <span>Showing {filteredBuses.length} buses from {fromCity} to {toCity}</span>
              <div className="flex items-center gap-2">
                <span>Filter Bus Type:</span>
                <select
                  value={busTypeFilter}
                  onChange={(e) => setBusTypeFilter(e.target.value)}
                  className="p-1 rounded-lg border border-slate-200 font-semibold"
                >
                  <option value="all">All Fleet Types</option>
                  <option value="sleeper">AC Sleeper</option>
                  <option value="volvo">Volvo 9600</option>
                  <option value="seater">Executive Seater</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              {filteredBuses.map((bus) => (
                <div
                  key={bus.id}
                  className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
                >
                  {/* Operator & Type */}
                  <div className="lg:w-1/3 space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-base">{bus.operator}</h3>
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
                        <Star className="w-3 h-3 fill-current text-emerald-600" />
                        <span>{bus.rating}</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">{bus.busType}</p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {bus.amenities.slice(0, 3).map((a, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Route & Timing */}
                  <div className="flex items-center justify-between lg:justify-center gap-6 flex-1 w-full text-center">
                    <div>
                      <div className="text-lg font-black text-slate-900">{bus.departureTime}</div>
                      <span className="text-xs font-semibold text-slate-500">{bus.fromCity}</span>
                    </div>

                    <div className="flex flex-col items-center">
                      <span className="text-[11px] font-medium text-slate-400">{bus.duration}</span>
                      <div className="w-24 sm:w-32 h-0.5 bg-amber-200 relative my-1">
                        <Bus className="w-3 h-3 text-amber-600 absolute -top-1.5 left-1/2 -translate-x-1/2" />
                      </div>
                      <span className="text-[10px] text-emerald-600 font-medium">GPS Live Tracking</span>
                    </div>

                    <div>
                      <div className="text-lg font-black text-slate-900">{bus.arrivalTime}</div>
                      <span className="text-xs font-semibold text-slate-500">{bus.toCity}</span>
                    </div>
                  </div>

                  {/* Fare & Seat Action */}
                  <div className="flex lg:flex-col items-center lg:items-end justify-between w-full lg:w-auto pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    <div className="text-left lg:text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Starting at</span>
                      <div className="text-2xl font-black text-slate-900">₹{bus.fare}</div>
                      <span className="text-[10px] text-amber-600 font-semibold">{bus.availableSeatsCount} seats available</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSelectBus(bus)}
                      className="mt-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-600/20 transition flex items-center gap-1.5"
                    >
                      <span>Select Seats</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: INTERACTIVE SEAT SELECTION LAYOUT */}
        {step === 'seats' && selectedBus && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Bus Summary Banner */}
            <div className="bg-amber-900 text-white rounded-3xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <span className="text-xs text-amber-200 font-semibold uppercase">Selected Bus</span>
                <h3 className="text-lg font-bold">{selectedBus.operator}</h3>
                <p className="text-xs text-amber-100 mt-0.5">
                  {selectedBus.fromCity} ➔ {selectedBus.toCity} • {journeyDate} ({selectedBus.departureTime})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStep('results')}
                className="text-xs text-amber-200 hover:text-white underline"
              >
                Change Bus
              </button>
            </div>

            {/* Visual Seat Selection Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-md space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Interactive Seat Layout</h3>
                  <p className="text-xs text-slate-500">Click on berths or seats to reserve your preferred spot</p>
                </div>

                {/* Legend */}
                <div className="flex items-center gap-4 text-xs font-medium">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-md border border-slate-300 bg-white"></div>
                    <span className="text-slate-600">Available</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-md bg-amber-500 text-white"></div>
                    <span className="text-slate-900 font-bold">Selected</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-md bg-slate-300"></div>
                    <span className="text-slate-400">Booked</span>
                  </div>
                </div>
              </div>

              {/* Lower Deck & Upper Deck Grids */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 bg-slate-50 rounded-2xl border border-slate-200">
                {/* Lower Deck */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 uppercase">Lower Deck (Berths / Seater)</span>
                    <span className="text-[10px] text-slate-400">Front ➔</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2.5 p-4 bg-white rounded-xl border border-slate-200">
                    {lowerDeckSeats.map((seat) => {
                      const isBooked = selectedBus.bookedSeats.includes(seat);
                      const isSelected = selectedSeats.includes(seat);
                      return (
                        <button
                          key={seat}
                          type="button"
                          disabled={isBooked}
                          onClick={() => handleToggleSeat(seat)}
                          className={`h-12 rounded-lg text-xs font-mono font-bold transition flex flex-col items-center justify-center border ${
                            isBooked
                              ? 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed'
                              : isSelected
                              ? 'bg-amber-500 text-white border-amber-600 shadow-md scale-105'
                              : 'bg-white hover:bg-amber-50 text-slate-700 border-slate-300 hover:border-amber-400'
                          }`}
                        >
                          <span>{seat}</span>
                          <span className="text-[9px] opacity-75 font-sans">₹{selectedBus.fare}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Upper Deck */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 uppercase">Upper Deck (Sleepers)</span>
                    <span className="text-[10px] text-slate-400">Front ➔</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2.5 p-4 bg-white rounded-xl border border-slate-200">
                    {upperDeckSeats.map((seat) => {
                      const isBooked = selectedBus.bookedSeats.includes(seat);
                      const isSelected = selectedSeats.includes(seat);
                      return (
                        <button
                          key={seat}
                          type="button"
                          disabled={isBooked}
                          onClick={() => handleToggleSeat(seat)}
                          className={`h-12 rounded-lg text-xs font-mono font-bold transition flex flex-col items-center justify-center border ${
                            isBooked
                              ? 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed'
                              : isSelected
                              ? 'bg-amber-500 text-white border-amber-600 shadow-md scale-105'
                              : 'bg-white hover:bg-amber-50 text-slate-700 border-slate-300 hover:border-amber-400'
                          }`}
                        >
                          <span>{seat}</span>
                          <span className="text-[9px] opacity-75 font-sans">₹{selectedBus.fare}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Boarding and Dropping point selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Select Boarding Point</label>
                  <select
                    value={selectedBoardingPoint}
                    onChange={(e) => setSelectedBoardingPoint(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
                  >
                    {selectedBus.boardingPoints.map((bp) => (
                      <option key={bp} value={bp}>{bp}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Select Dropping Point</label>
                  <select
                    value={selectedDroppingPoint}
                    onChange={(e) => setSelectedDroppingPoint(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
                  >
                    {selectedBus.droppingPoints.map((dp) => (
                      <option key={dp} value={dp}>{dp}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Selected Seats summary bar & Proceed */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-slate-500">Selected Seats ({selectedSeats.length}):</span>
                  <div className="text-base font-bold text-slate-900">
                    {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None selected yet'}
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Estimated Total</span>
                    <div className="text-xl font-black text-amber-600">₹{baseFare.toLocaleString()}</div>
                  </div>

                  <button
                    type="button"
                    onClick={handleProceedToPassengers}
                    className="flex-1 sm:flex-initial px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
                  >
                    <span>Proceed with Seats</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: PASSENGER DETAILS FORM */}
        {step === 'passenger' && selectedBus && (
          <div className="max-w-2xl mx-auto space-y-6">
            <form onSubmit={handleProceedToSummary} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-md space-y-6">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">
                  Passenger Information for Selected Seats ({selectedSeats.join(', ')})
                </h3>
              </div>

              {passengers.map((p, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                    <span>Passenger {idx + 1}</span>
                    <span className="text-amber-600 bg-amber-100/70 px-2 py-0.5 rounded-md font-mono">
                      Seat: {p.seat}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={p.name}
                        onChange={(e) => handlePassengerChange(idx, 'name', e.target.value)}
                        placeholder="e.g. Alex Morgan"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800"
                        required
                      />
                      {formErrors[`name_${idx}`] && (
                        <p className="text-[10px] text-rose-500 mt-1">{formErrors[`name_${idx}`]}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Age</label>
                      <input
                        type="number"
                        value={p.age}
                        onChange={(e) => handlePassengerChange(idx, 'age', e.target.value)}
                        placeholder="32"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800"
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}

              <div className="border-t border-slate-100 pt-4 space-y-3">
                <h4 className="text-xs font-bold uppercase text-slate-700">Contact Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Email</label>
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Phone</label>
                    <input
                      type="text"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep('seats')}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Back to Seats
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition flex items-center gap-2"
                >
                  <span>Review Booking Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 4: REVIEW & FARE BREAKDOWN */}
        {step === 'summary' && selectedBus && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-lg space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-lg font-bold text-slate-900">Review Bus Reservation</h3>
                <p className="text-xs text-slate-400">Review selected berths and boarding stop</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
                <div className="flex justify-between font-bold text-slate-800">
                  <span>{selectedBus.operator}</span>
                  <span>{journeyDate}</span>
                </div>
                <div className="text-slate-600">{selectedBus.busType}</div>
                <div className="text-slate-500">
                  Boarding: {selectedBoardingPoint} | Dropping: {selectedDroppingPoint}
                </div>
                <div className="font-bold text-amber-700">
                  Selected Seats: {selectedSeats.join(', ')}
                </div>
              </div>

              {/* Fare Breakdown */}
              <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Base Seat Fare ({selectedSeats.length} Seats @ ₹{seatFare})</span>
                  <span>₹{baseFare.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>GST / Transport Tax (5%)</span>
                  <span>₹{taxes.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Live Tracking & SMS Service Fee</span>
                  <span>₹{convenienceFee}</span>
                </div>
                <div className="pt-2 border-t border-amber-200 flex justify-between text-base font-black text-amber-950">
                  <span>Total Amount</span>
                  <span>₹{totalAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* Action */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep('passenger')}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Edit Passengers
                </button>
                <button
                  type="button"
                  onClick={() => setIsPaymentOpen(true)}
                  className="px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition flex items-center gap-2"
                >
                  <span>Simulated Pay ₹{totalAmount.toLocaleString()}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: CONFIRMATION & E-TICKET */}
        {step === 'confirmed' && confirmedBooking && (
          <div className="max-w-2xl mx-auto bg-white rounded-3xl p-8 border border-slate-100 shadow-xl text-center space-y-6">
            <div className="w-16 h-16 mx-auto bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                Bus Reservation Confirmed!
              </span>
              <h2 className="text-2xl font-black text-slate-900 mt-3">Seats Locked Successfully</h2>
              <p className="text-xs text-slate-500 mt-1">
                Booking Reference: <strong className="font-mono text-amber-600">{confirmedBooking.reference}</strong>
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-left space-y-2">
              <div className="flex justify-between font-bold text-slate-800">
                <span>{confirmedBooking.operator}</span>
                <span>Seats: {confirmedBooking.selectedSeats?.join(', ')}</span>
              </div>
              <div className="text-slate-600">
                {confirmedBooking.fromCity} ➔ {confirmedBooking.toCity} ({confirmedBooking.date})
              </div>
              <div className="text-slate-500">Boarding Point: {confirmedBooking.boardingPoint}</div>
              <div className="font-bold text-emerald-700 pt-1">
                Amount Paid: ₹{confirmedBooking.totalAmount?.toLocaleString()}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsTicketModalOpen(true)}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
              >
                <Ticket className="w-4 h-4" />
                <span>View / Print Bus Ticket</span>
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
