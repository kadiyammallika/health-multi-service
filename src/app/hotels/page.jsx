'use client';

import { useState } from 'react';
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
  ShieldCheck,
  Coffee,
  Wifi,
  Car,
  ChevronRight,
  Ticket
} from 'lucide-react';
import { SAMPLE_HOTEL_CITIES, SAMPLE_HOTELS } from '@/data/hotelsData';
import { saveBooking } from '@/services/storage';
import PaymentModal from '@/components/ui/PaymentModal';
import TicketModal from '@/components/ui/TicketModal';

export default function HotelsPage() {
  const [step, setStep] = useState('list'); // 'list', 'details', 'guests', 'summary', 'confirmed'

  // Search parameters
  const [selectedCity, setSelectedCity] = useState('Goa');
  const [checkInDate, setCheckInDate] = useState('2026-11-20');
  const [checkOutDate, setCheckOutDate] = useState('2026-11-23');
  const [guestsCount, setGuestsCount] = useState(2);
  const [roomsCount, setRoomsCount] = useState(1);

  // Selected hotel and room
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);

  // Guest details form
  const [guestName, setGuestName] = useState('Alex Morgan');
  const [guestEmail, setGuestEmail] = useState('alex.morgan@example.com');
  const [guestPhone, setGuestPhone] = useState('+91 98765 43210');
  const [specialRequests, setSpecialRequests] = useState('Quiet high-floor room with early check-in preference.');

  // Payment & confirmation
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

  // Calculate nights
  const calculateNights = () => {
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return isNaN(diffDays) || diffDays <= 0 ? 1 : diffDays;
  };

  const nights = calculateNights();

  const filteredHotels = SAMPLE_HOTELS.filter((h) => {
    return h.city.toLowerCase().includes(selectedCity.toLowerCase()) || selectedCity === 'Goa';
  });

  const handleSelectHotel = (hotel) => {
    setSelectedHotel(hotel);
    setSelectedRoom(hotel.rooms[0]);
    setStep('details');
  };

  const handleSelectRoomAndProceed = (room) => {
    setSelectedRoom(room);
    setStep('guests');
  };

  const handleProceedToSummary = (e) => {
    e.preventDefault();
    if (!guestName || !guestEmail || !guestPhone) {
      alert('Please fill in all required guest details.');
      return;
    }
    setStep('summary');
  };

  // Pricing calculations
  const pricePerNight = selectedRoom?.price || selectedHotel?.pricePerNight || 6000;
  const baseFare = pricePerNight * nights * roomsCount;
  const taxes = Math.round(baseFare * 0.18); // 18% hospitality luxury GST
  const resortFee = 500;
  const totalAmount = baseFare + taxes + resortFee;

  const handlePaymentSuccess = (paymentDetails) => {
    setIsPaymentOpen(false);

    const bookingRef = `HTL-${selectedHotel.city.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newBooking = {
      type: 'hotel',
      categoryTitle: 'Hotel & Stay Reservation',
      reference: bookingRef,
      hotelName: selectedHotel.name,
      city: selectedHotel.location,
      roomName: selectedRoom.name,
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
        {/* Step Header */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center justify-between overflow-x-auto text-xs font-semibold">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900">Luxury Hotels & Wellness Retreats</h1>
              <span className="text-[10px] text-slate-400">Verified Properties • Best Rate Assurance</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0 text-slate-400 text-xs">
            <span className={step === 'list' ? 'text-emerald-600 font-bold' : ''}>1. Stays</span>
            <span>➔</span>
            <span className={step === 'details' ? 'text-emerald-600 font-bold' : ''}>2. Room Details</span>
            <span>➔</span>
            <span className={step === 'guests' ? 'text-emerald-600 font-bold' : ''}>3. Guest Details</span>
            <span>➔</span>
            <span className={step === 'summary' ? 'text-emerald-600 font-bold' : ''}>4. Summary & Pay</span>
            <span>➔</span>
            <span className={step === 'confirmed' ? 'text-emerald-600 font-bold' : ''}>5. Confirmed</span>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-md">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
              <span className="block text-[10px] uppercase font-bold text-slate-400">City / Destination</span>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="bg-transparent font-bold text-slate-800 w-full focus:outline-none text-sm mt-1"
              >
                {SAMPLE_HOTEL_CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
              <span className="block text-[10px] uppercase font-bold text-slate-400">Check-in Date</span>
              <input
                type="date"
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
                className="bg-transparent font-bold text-slate-800 w-full focus:outline-none text-xs mt-1"
              />
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
              <span className="block text-[10px] uppercase font-bold text-slate-400">Check-out Date</span>
              <input
                type="date"
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
                className="bg-transparent font-bold text-slate-800 w-full focus:outline-none text-xs mt-1"
              />
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
              <span className="block text-[10px] uppercase font-bold text-slate-400">Guests & Rooms</span>
              <div className="flex gap-2 text-xs font-bold text-slate-800 mt-1">
                <span>{guestsCount} Guests</span> • <span>{roomsCount} Room</span>
              </div>
            </div>

            <div>
              <button
                type="button"
                onClick={() => setStep('list')}
                className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/30 transition flex items-center justify-center gap-2"
              >
                <Building2 className="w-4 h-4" />
                <span>Search Hotels</span>
              </button>
            </div>
          </div>
        </div>

        {/* STEP 1: HOTEL LISTINGS */}
        {step === 'list' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between text-xs text-slate-500 bg-white p-3 rounded-2xl border border-slate-100">
              <span>Found {filteredHotels.length} luxury properties in {selectedCity} for {nights} Night(s)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredHotels.map((hotel) => (
                <div
                  key={hotel.id}
                  className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition flex flex-col justify-between"
                >
                  <div className="relative h-60 w-full">
                    <img src={hotel.image} alt={hotel.name} className="w-full h-full object-cover" />
                    <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-xs font-bold text-slate-900 flex items-center gap-1 shadow-sm">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-current" />
                      <span>{hotel.rating}</span>
                      <span className="text-slate-400 font-normal">({hotel.reviewsCount})</span>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{hotel.location}</span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-lg">{hotel.name}</h3>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1">{hotel.description}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {hotel.amenities.slice(0, 4).map((a, i) => (
                        <span key={i} className="text-[11px] px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-medium">
                          {a}
                        </span>
                      ))}
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">From / Night</span>
                        <div className="text-xl font-black text-slate-900">
                          ₹{hotel.pricePerNight.toLocaleString()}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSelectHotel(hotel)}
                        className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
                      >
                        <span>View Rooms</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: HOTEL DETAILS & ROOM SELECTION */}
        {step === 'details' && selectedHotel && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-md">
              <div className="relative h-72 w-full">
                <img src={selectedHotel.image} alt={selectedHotel.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 text-white">
                  <span className="text-xs text-emerald-300 font-semibold uppercase">{selectedHotel.location}</span>
                  <h2 className="text-2xl font-bold">{selectedHotel.name}</h2>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">About The Resort</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{selectedHotel.description}</p>
                </div>

                {/* Available Room Types */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-base font-bold text-slate-900">Select Room Category</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedHotel.rooms.map((room) => (
                      <div
                        key={room.id}
                        className={`p-5 rounded-2xl border transition flex flex-col justify-between ${
                          selectedRoom?.id === room.id
                            ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-500/20'
                            : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex justify-between items-start">
                            <h4 className="font-bold text-slate-900 text-sm">{room.name}</h4>
                            <span className="text-emerald-700 font-black text-sm">₹{room.price.toLocaleString()}</span>
                          </div>
                          <p className="text-xs text-slate-500">{room.bed} • {room.capacity}</p>

                          <div className="space-y-1 pt-2">
                            {room.features.map((f, i) => (
                              <div key={i} className="flex items-center gap-1.5 text-xs text-slate-600">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span>{f}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleSelectRoomAndProceed(room)}
                          className="mt-5 w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition"
                        >
                          Book this Room
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setStep('list')}
                    className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                  >
                    Back to All Hotels
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: GUEST DETAILS */}
        {step === 'guests' && selectedHotel && selectedRoom && (
          <div className="max-w-2xl mx-auto space-y-6">
            <form onSubmit={handleProceedToSummary} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-md space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">Guest & Contact Information</h3>
                <p className="text-xs text-slate-500">
                  {selectedHotel.name} • {selectedRoom.name} ({nights} Night{nights > 1 ? 's' : ''})
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Primary Guest Full Name</label>
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Mobile Number</label>
                    <input
                      type="text"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Special Preferences / Requests</label>
                  <textarea
                    rows={2}
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Back to Rooms
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition flex items-center gap-2"
                >
                  <span>Review Reservation</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 4: REVIEW & TOTAL BREAKDOWN */}
        {step === 'summary' && selectedHotel && selectedRoom && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-lg space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-lg font-bold text-slate-900">Hotel Reservation Summary</h3>
                <p className="text-xs text-slate-400">Review check-in dates and total charges</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
                <div className="flex justify-between font-bold text-slate-800">
                  <span>{selectedHotel.name}</span>
                  <span>{nights} Nights ({checkInDate} to {checkOutDate})</span>
                </div>
                <div className="text-slate-600">{selectedRoom.name}</div>
                <div className="text-slate-500">
                  Guest: {guestName} • {guestEmail} • {guestsCount} Guests
                </div>
              </div>

              {/* Fare Breakdown */}
              <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Room Charges ({nights} Night(s) @ ₹{pricePerNight.toLocaleString()})</span>
                  <span>₹{baseFare.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Hospitality Goods & Service Tax (18%)</span>
                  <span>₹{taxes.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Resort Maintenance & Wellness Shala Fee</span>
                  <span>₹{resortFee}</span>
                </div>
                <div className="pt-2 border-t border-emerald-200 flex justify-between text-base font-black text-emerald-950">
                  <span>Total Amount Payable</span>
                  <span>₹{totalAmount.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep('guests')}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Edit Guest Details
                </button>
                <button
                  type="button"
                  onClick={() => setIsPaymentOpen(true)}
                  className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition flex items-center gap-2"
                >
                  <span>Simulated Pay ₹{totalAmount.toLocaleString()}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: CONFIRMATION */}
        {step === 'confirmed' && confirmedBooking && (
          <div className="max-w-2xl mx-auto bg-white rounded-3xl p-8 border border-slate-100 shadow-xl text-center space-y-6">
            <div className="w-16 h-16 mx-auto bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                Reservation Confirmed!
              </span>
              <h2 className="text-2xl font-black text-slate-900 mt-3">Stay Reserved Successfully</h2>
              <p className="text-xs text-slate-500 mt-1">
                Booking Reference: <strong className="font-mono text-emerald-600">{confirmedBooking.reference}</strong>
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-left space-y-2">
              <div className="flex justify-between font-bold text-slate-800">
                <span>{confirmedBooking.hotelName}</span>
                <span>{confirmedBooking.nights} Night(s)</span>
              </div>
              <div className="text-slate-600">{confirmedBooking.roomName}</div>
              <div className="text-slate-500">
                Check-in: {confirmedBooking.checkInDate} ➔ Check-out: {confirmedBooking.checkOutDate}
              </div>
              <div className="font-bold text-emerald-700 pt-1">
                Total Paid: ₹{confirmedBooking.totalAmount?.toLocaleString()}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsTicketModalOpen(true)}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
              >
                <Ticket className="w-4 h-4" />
                <span>View / Print Stay Voucher</span>
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
    </div>
  );
}
