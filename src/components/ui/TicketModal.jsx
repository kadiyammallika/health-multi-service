'use client';

import { Printer, X, Download, ShieldCheck, Plane, Bus, Building2, Calendar, MapPin, User, Clock, Heart, Home } from 'lucide-react';

const CURRENCY_SYMBOLS = {
  INR: '₹', USD: '$', EUR: '€', GBP: '£', AED: 'د.إ', CAD: 'CA$', AUD: 'A$', SGD: 'S$', JPY: '¥', THB: '฿', MYR: 'RM', SAR: '﷼', CHF: 'CHF', CNY: '¥', NZD: 'NZ$'
};

function formatBookingPrice(amount, booking) {
  const curr = booking?.display_currency || booking?.displayCurrency || 'INR';
  const rate = parseFloat(booking?.exchange_rate || booking?.exchangeRate || 1);
  const symbol = CURRENCY_SYMBOLS[curr] || '₹';
  const converted = curr === 'INR' ? Number(amount || 0) : Math.round(Number(amount || 0) * rate * 100) / 100;
  if (curr === 'JPY') return `${symbol}${Math.round(converted).toLocaleString()}`;
  return `${symbol}${converted.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

export default function TicketModal({ isOpen, onClose, booking }) {
  if (!isOpen || !booking) return null;

  const handlePrint = () => {
    window.print();
  };

  const isFlight = booking.type === 'flight';
  const isBus = booking.type === 'bus';
  const isHotel = booking.type === 'hotel';
  const isWellness = booking.type === 'wellness';
  const isProperty = booking.type === 'property';

  const getServiceIcon = () => {
    if (isFlight) return <Plane className="w-4 h-4" />;
    if (isBus) return <Bus className="w-4 h-4" />;
    if (isHotel) return <Building2 className="w-4 h-4 text-emerald-300" />;
    if (isWellness) return <Heart className="w-4 h-4 text-pink-300" />;
    if (isProperty) return <Home className="w-4 h-4 text-violet-300" />;
    return <Calendar className="w-4 h-4" />;
  };

  const getServiceTitle = () => {
    if (isFlight) return `${booking.airline} (${booking.flightNumber})`;
    if (isBus) return booking.operator;
    if (isHotel) return booking.hotelName || booking.service_name;
    if (isWellness) return booking.service_name || booking.practitionerName || 'Wellness Appointment';
    if (isProperty) return booking.service_name || 'Property Enquiry';
    return booking.service_name || booking.categoryTitle || 'Service Booking';
  };

  const getServiceSubtitle = () => {
    if (isFlight) return `${booking.fromCity} (${booking.from}) ➔ ${booking.toCity} (${booking.to})`;
    if (isBus) return `${booking.fromCity} ➔ ${booking.toCity} • ${booking.busType}`;
    if (isHotel) return `${booking.city} • ${booking.roomName}`;
    if (isWellness) {
      const details = typeof booking.details === 'string' ? JSON.parse(booking.details || '{}') : (booking.details || {});
      return `${details.specialization || 'General'} • ${details.consultationMode || 'Online'} • ${details.duration || '45 mins'}`;
    }
    if (isProperty) return booking.from_location || '';
    return '';
  };

  const details = typeof booking.details === 'string' ? JSON.parse(booking.details || '{}') : (booking.details || {});

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden print:shadow-none print:border-none print:w-full print:max-w-none">
        {/* Top Control Bar (Hidden when printing) */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-slate-900 text-white print:hidden">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              {isWellness ? 'Appointment Confirmation' : 'E-Ticket & Confirmation Voucher'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Ticket Content */}
        <div className="p-8 space-y-6">
          {/* Header Brand */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-teal-500 flex items-center justify-center text-white font-bold text-lg">
                  O
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">OneConnect</h2>
                  <p className="text-[11px] text-slate-400">Multi-Service Booking Platform</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase border ${
                booking.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                booking.status === 'Completed' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                booking.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                {booking.status || 'Confirmed'} & Issued
              </span>
              <p className="text-xs font-mono text-slate-500 mt-1">Ref: {booking.reference || booking.id}</p>
            </div>
          </div>

          {/* Service Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-1">
                {getServiceIcon()}
                <span>{booking.categoryTitle || booking.category_title || 'Service Voucher'}</span>
              </div>
              <h3 className="text-xl font-bold text-white">{getServiceTitle()}</h3>
              <p className="text-xs text-slate-300 mt-0.5">{getServiceSubtitle()}</p>
            </div>

            <div className="text-right sm:border-l sm:border-white/10 sm:pl-6">
              <div className="text-xs text-indigo-200">Total Amount</div>
              <div className="text-2xl font-black text-white">{formatBookingPrice(booking.totalAmount || booking.total_amount, booking)}</div>
              <div className="text-[10px] text-emerald-300">
                {booking.payment_status === 'Completed' ? 'Payment Verified' : booking.payment_status === 'Pending' ? 'Payment Pending' : 'Simulated Payment'}
              </div>
            </div>
          </div>

          {/* Journey/Booking Details Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 font-medium block">Date</span>
              <span className="font-semibold text-slate-800 text-sm mt-0.5 block">
                {booking.date || booking.travel_date || booking.checkInDate || details.checkInDate || details.date || '—'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">
                {isHotel ? 'Check-out' : isWellness ? 'Time Slot' : 'Timing'}
              </span>
              <span className="font-semibold text-slate-800 text-sm mt-0.5 block">
                {isHotel ? (booking.checkOutDate || details.checkOutDate || `${booking.nights || details.nights || 1} Night(s)`) :
                 isWellness ? (booking.travel_time || details.timeSlot || details.time_slot || '—') :
                 (booking.time || booking.travel_time || '—')}
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">
                {isWellness ? 'Patient' : isHotel ? 'Guest' : 'Passenger'}
              </span>
              <span className="font-semibold text-slate-800 text-sm mt-0.5 block truncate">
                {isWellness ? (details.patientName || details.patient_name || booking.contactEmail || 'Patient') :
                 booking.passengers?.[0]?.name || details.guestName || booking.guestName || booking.contactEmail || 'Guest'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">
                {isWellness ? 'Consultation' : isBus ? 'Seat Info' : isHotel ? 'Room' : 'Seat / Room'}
              </span>
              <span className="font-semibold text-indigo-600 text-sm mt-0.5 block">
                {isWellness ? (details.consultationMode || 'Online') :
                 booking.selectedSeats?.join(', ') || booking.passengers?.[0]?.seat ||
                 booking.roomName || details.roomType || 'Allocated at Check-in'}
              </span>
            </div>
          </div>

          {/* Wellness-specific details */}
          {isWellness && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-pink-50 border border-pink-200 text-xs">
              <div>
                <span className="text-pink-400 font-medium block">Practitioner</span>
                <span className="font-semibold text-slate-800 text-sm mt-0.5 block">
                  {booking.service_name || details.practitionerName || details.practitioner_name || '—'}
                </span>
              </div>
              <div>
                <span className="text-pink-400 font-medium block">Specialization</span>
                <span className="font-semibold text-slate-800 text-sm mt-0.5 block">
                  {details.specialization || '—'}
                </span>
              </div>
              <div>
                <span className="text-pink-400 font-medium block">Duration</span>
                <span className="font-semibold text-slate-800 text-sm mt-0.5 block">
                  {details.duration || '45 mins'}
                </span>
              </div>
              {details.notes && (
                <div className="col-span-2 sm:col-span-3">
                  <span className="text-pink-400 font-medium block">Notes</span>
                  <span className="text-slate-700 mt-0.5 block">{details.notes}</span>
                </div>
              )}
            </div>
          )}

          {/* Hotel-specific details */}
          {isHotel && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
              <div>
                <span className="text-emerald-500 font-medium block">Check-in</span>
                <span className="font-semibold text-slate-800 text-sm mt-0.5 block">{booking.checkInDate || details.checkInDate || '—'}</span>
              </div>
              <div>
                <span className="text-emerald-500 font-medium block">Check-out</span>
                <span className="font-semibold text-slate-800 text-sm mt-0.5 block">{booking.checkOutDate || details.checkOutDate || '—'}</span>
              </div>
              <div>
                <span className="text-emerald-500 font-medium block">Nights</span>
                <span className="font-semibold text-slate-800 text-sm mt-0.5 block">{booking.nights || details.nights || '—'}</span>
              </div>
              <div>
                <span className="text-emerald-500 font-medium block">Guests</span>
                <span className="font-semibold text-slate-800 text-sm mt-0.5 block">{booking.guestsCount || details.guestsCount || '—'}</span>
              </div>
            </div>
          )}

          {/* Bus-specific boarding/dropping points */}
          {isBus && (booking.boardingPoint || details.boardingPoint) && (
            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-orange-50 border border-orange-200 text-xs">
              <div>
                <span className="text-orange-500 font-medium block">Boarding Point</span>
                <span className="font-semibold text-slate-800 text-sm mt-0.5 block">{booking.boardingPoint || details.boardingPoint || '—'}</span>
              </div>
              <div>
                <span className="text-orange-500 font-medium block">Dropping Point</span>
                <span className="font-semibold text-slate-800 text-sm mt-0.5 block">{booking.droppingPoint || details.droppingPoint || '—'}</span>
              </div>
            </div>
          )}

          {/* Passenger List if available */}
          {booking.passengers && booking.passengers.length > 0 && (
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                Passenger Information
              </div>
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="px-4 py-2">#</th>
                    <th className="px-4 py-2">Full Name</th>
                    <th className="px-4 py-2">Age / Gender</th>
                    <th className="px-4 py-2">Allocated Seat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {booking.passengers.map((p, idx) => (
                    <tr key={idx} className="text-slate-800">
                      <td className="px-4 py-2 font-mono">{idx + 1}</td>
                      <td className="px-4 py-2 font-medium">{p.name}</td>
                      <td className="px-4 py-2 text-slate-500">
                        {p.age ? `${p.age} yrs` : ''}{p.age && p.gender ? ' • ' : ''}{p.gender || ''}
                      </td>
                      <td className="px-4 py-2 font-semibold text-indigo-600">{p.seat || booking.selectedSeats?.[idx] || 'Confirmed'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Fare Breakdown */}
          {booking.fareBreakdown && Object.keys(booking.fareBreakdown).length > 0 && (
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                Fare Breakdown
              </div>
              <div className="p-4 space-y-2 text-xs">
                {Object.entries(booking.fareBreakdown).map(([key, val]) => (
                  <div key={key} className="flex justify-between text-slate-600">
                    <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <span className="font-medium">{formatBookingPrice(val, booking)}</span>
                  </div>
                ))}
                <div className="flex justify-between text-slate-900 font-bold border-t border-slate-200 pt-2 mt-2">
                  <span>Total</span>
                  <span>{formatBookingPrice(booking.totalAmount || booking.total_amount, booking)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Barcode & Verification Stub */}
          <div className="pt-4 border-t-2 border-dashed border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <div className="font-mono text-xs text-slate-500 tracking-widest">
                ||||| | |||| |||||| || | |||| ||||| |||| |||||||| ||||
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                AUTH-TOKEN: {booking.reference || booking.id}-SECURE-VERIFIED
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>
                {isWellness
                  ? 'Present this confirmation at your appointment.'
                  : 'Present this digital pass or printed copy at the terminal / reception.'}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 print:hidden">
          <span>OneConnect Digital Booking Platform</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold transition"
          >
            Close Voucher
          </button>
        </div>
      </div>
    </div>
  );
}
