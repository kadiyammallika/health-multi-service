'use client';

import { Printer, X, Download, ShieldCheck, Plane, Bus, Building2, Calendar, MapPin, User, Clock } from 'lucide-react';

export default function TicketModal({ isOpen, onClose, booking }) {
  if (!isOpen || !booking) return null;

  const handlePrint = () => {
    window.print();
  };

  const isFlight = booking.type === 'flight';
  const isBus = booking.type === 'bus';
  const isHotel = booking.type === 'hotel';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden print:shadow-none print:border-none print:w-full print:max-w-none">
        {/* Top Control Bar (Hidden when printing) */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-slate-900 text-white print:hidden">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              E-Ticket & Confirmation Voucher
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
                  A
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">AuraLife</h2>
                  <p className="text-[11px] text-slate-400">Unified Living & Booking Platform</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                Confirmed & Issued
              </span>
              <p className="text-xs font-mono text-slate-500 mt-1">Ref: {booking.reference || booking.id}</p>
            </div>
          </div>

          {/* Service Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-1">
                {isFlight && <Plane className="w-4 h-4" />}
                {isBus && <Bus className="w-4 h-4" />}
                {isHotel && <Building2 className="w-4 h-4 text-emerald-300" />}
                <span>{booking.categoryTitle || 'Service Voucher'}</span>
              </div>
              <h3 className="text-xl font-bold text-white">
                {isFlight && `${booking.airline} (${booking.flightNumber})`}
                {isBus && `${booking.operator}`}
                {isHotel && `${booking.hotelName}`}
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                {isFlight && `${booking.fromCity} (${booking.from}) ➔ ${booking.toCity} (${booking.to})`}
                {isBus && `${booking.fromCity} ➔ ${booking.toCity} • ${booking.busType}`}
                {isHotel && `${booking.city} • ${booking.roomName}`}
              </p>
            </div>

            <div className="text-right sm:border-l sm:border-white/10 sm:pl-6">
              <div className="text-xs text-indigo-200">Total Paid</div>
              <div className="text-2xl font-black text-white">₹{booking.totalAmount?.toLocaleString()}</div>
              <div className="text-[10px] text-emerald-300">Simulated Payment Verified</div>
            </div>
          </div>

          {/* Journey Details Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 font-medium block">Date</span>
              <span className="font-semibold text-slate-800 text-sm mt-0.5 block">
                {booking.date || booking.checkInDate}
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Timing / Schedule</span>
              <span className="font-semibold text-slate-800 text-sm mt-0.5 block">
                {booking.time || `${booking.nights || 1} Night(s)`}
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Passenger / Guest</span>
              <span className="font-semibold text-slate-800 text-sm mt-0.5 block truncate">
                {booking.passengers?.[0]?.name || booking.contactEmail || 'Guest'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Seat / Room Info</span>
              <span className="font-semibold text-indigo-600 text-sm mt-0.5 block">
                {booking.selectedSeats?.join(', ') || booking.passengers?.[0]?.seat || 'Allocated at Check-in'}
              </span>
            </div>
          </div>

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
                      <td className="px-4 py-2 text-slate-500">{p.age} yrs • {p.gender}</td>
                      <td className="px-4 py-2 font-semibold text-indigo-600">{p.seat || booking.selectedSeats?.[idx] || 'Confirmed'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
              <span>Present this digital pass or printed copy at the terminal / reception.</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 print:hidden">
          <span>AuraLife Digital Travel & Living Engine</span>
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
