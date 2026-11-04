'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Ticket,
  Plane,
  Bus,
  Building2,
  Sparkles,
  Printer,
  Calendar,
  Clock,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  Home
} from 'lucide-react';
import { getBookings, getWellnessAppointments, cancelBooking } from '@/services/storage';
import Badge from '@/components/ui/Badge';
import TicketModal from '@/components/ui/TicketModal';

export default function MyBookingsPage() {
  const [selectedTab, setSelectedTab] = useState('all'); // 'all', 'flights', 'buses', 'hotels', 'wellness'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'Confirmed', 'Pending', 'Cancelled'
  const [bookings, setBookings] = useState([]);
  const [wellnessAppointments, setWellnessAppointments] = useState([]);

  // Ticket Modal state
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

  const loadData = () => {
    setBookings(getBookings());
    setWellnessAppointments(getWellnessAppointments());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('auralife_storage_update', loadData);
    return () => window.removeEventListener('auralife_storage_update', loadData);
  }, []);

  // Format wellness appointments into unified booking list structure for display
  const formattedWellness = wellnessAppointments.map((w) => ({
    id: w.id,
    type: 'wellness',
    categoryTitle: 'Wellness Appointment',
    reference: w.id,
    airline: w.practitionerName,
    flightNumber: w.specialization,
    fromCity: w.consultationMode,
    toCity: w.practitionerName,
    date: w.date,
    time: `${w.timeSlot} (${w.duration})`,
    totalAmount: w.price,
    status: w.status,
    passengers: [{ name: w.patientName, age: 'Adult', gender: 'Patient' }],
    notes: w.notes,
    isWellness: true
  }));

  // Combine standard bookings + wellness appointments
  const allReservations = [...bookings, ...formattedWellness];

  // Filter based on tabs
  const filteredReservations = allReservations.filter((item) => {
    const categoryMatch =
      selectedTab === 'all' ||
      (selectedTab === 'flights' && item.type === 'flight') ||
      (selectedTab === 'buses' && item.type === 'bus') ||
      (selectedTab === 'hotels' && item.type === 'hotel') ||
      (selectedTab === 'wellness' && item.type === 'wellness');

    const statusMatch = statusFilter === 'all' || item.status?.toLowerCase() === statusFilter.toLowerCase();
    return categoryMatch && statusMatch;
  });

  const handleCancel = (id) => {
    if (confirm('Are you sure you want to cancel this reservation? (Simulated demo cancellation)')) {
      cancelBooking(id);
      loadData();
    }
  };

  const handleViewTicket = (item) => {
    setSelectedTicket(item);
    setIsTicketModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-2">
              <Ticket className="w-3.5 h-3.5" />
              <span>Central Reservations Ledger</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">My Bookings & Tickets</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Manage your confirmed flight passes, bus tickets, hotel vouchers, and pending wellness appointments in one unified ledger.
            </p>
          </div>

          <Link
            href="/dashboard/customer"
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5"
          >
            <span>Customer Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Tab Filters */}
        <div className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setSelectedTab('all')}
              className={`px-3.5 py-2 rounded-xl font-bold transition shrink-0 ${
                selectedTab === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              All Services ({allReservations.length})
            </button>
            <button
              onClick={() => setSelectedTab('flights')}
              className={`px-3.5 py-2 rounded-xl font-bold transition shrink-0 flex items-center gap-1.5 ${
                selectedTab === 'flights' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Plane className="w-3.5 h-3.5" />
              <span>Flights</span>
            </button>
            <button
              onClick={() => setSelectedTab('buses')}
              className={`px-3.5 py-2 rounded-xl font-bold transition shrink-0 flex items-center gap-1.5 ${
                selectedTab === 'buses' ? 'bg-amber-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Bus className="w-3.5 h-3.5" />
              <span>Buses</span>
            </button>
            <button
              onClick={() => setSelectedTab('hotels')}
              className={`px-3.5 py-2 rounded-xl font-bold transition shrink-0 flex items-center gap-1.5 ${
                selectedTab === 'hotels' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Hotels</span>
            </button>
            <button
              onClick={() => setSelectedTab('wellness')}
              className={`px-3.5 py-2 rounded-xl font-bold transition shrink-0 flex items-center gap-1.5 ${
                selectedTab === 'wellness' ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Wellness</span>
            </button>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
            >
              <option value="all">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
              <option value="declined">Declined</option>
            </select>
          </div>
        </div>

        {/* Bookings List */}
        <div className="space-y-4">
          {filteredReservations.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm space-y-3">
              <Ticket className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No bookings found for this filter</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Explore our flights, luxury bus coaches, wellness retreats, or hotels to create your first reservation.
              </p>
              <Link
                href="/flights"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-xs"
              >
                <span>Search Flights</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            filteredReservations.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
              >
                {/* Left: Icon & Service Details */}
                <div className="flex items-start gap-4 flex-1">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                      item.type === 'flight'
                        ? 'bg-indigo-50 text-indigo-600'
                        : item.type === 'bus'
                        ? 'bg-amber-50 text-amber-600'
                        : item.type === 'hotel'
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-teal-50 text-teal-600'
                    }`}
                  >
                    {item.type === 'flight' && <Plane className="w-6 h-6" />}
                    {item.type === 'bus' && <Bus className="w-6 h-6" />}
                    {item.type === 'hotel' && <Building2 className="w-6 h-6" />}
                    {item.type === 'wellness' && <Sparkles className="w-6 h-6" />}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {item.categoryTitle}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="font-mono text-xs font-bold text-indigo-600">
                        {item.reference || item.id}
                      </span>
                      <Badge status={item.status} size="sm" />
                    </div>

                    <h3 className="font-bold text-slate-900 text-base">
                      {item.type === 'flight' && `${item.airline} (${item.flightNumber})`}
                      {item.type === 'bus' && `${item.operator}`}
                      {item.type === 'hotel' && `${item.hotelName}`}
                      {item.type === 'wellness' && `${item.airline}`}
                    </h3>

                    <p className="text-xs text-slate-500">
                      {item.type === 'flight' && `${item.fromCity} ➔ ${item.toCity}`}
                      {item.type === 'bus' && `${item.fromCity} ➔ ${item.toCity} (Seats: ${item.selectedSeats?.join(', ') || 'Confirmed'})`}
                      {item.type === 'hotel' && `${item.city} • ${item.roomName}`}
                      {item.type === 'wellness' && `${item.flightNumber} • Mode: ${item.fromCity}`}
                    </p>
                  </div>
                </div>

                {/* Middle: Timing & Schedule */}
                <div className="flex items-center gap-6 text-xs text-slate-600 border-y md:border-y-0 md:border-x border-slate-100 py-3 md:py-0 md:px-6 w-full md:w-auto justify-between md:justify-center">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Date</span>
                    <strong className="text-slate-800 text-xs block mt-0.5">{item.date || item.checkInDate}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Schedule</span>
                    <strong className="text-slate-800 text-xs block mt-0.5">{item.time || `${item.nights} Nights`}</strong>
                  </div>
                </div>

                {/* Right: Amount & Actions */}
                <div className="flex items-center justify-between md:flex-col md:items-end gap-3 w-full md:w-auto">
                  <div className="text-left md:text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Fare</span>
                    <div className="text-xl font-black text-slate-900">
                      ₹{item.totalAmount?.toLocaleString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* View / Print Ticket */}
                    {item.status === 'Confirmed' && !item.isWellness && (
                      <button
                        type="button"
                        onClick={() => handleViewTicket(item)}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Voucher</span>
                      </button>
                    )}

                    {/* Cancel action */}
                    {item.status === 'Confirmed' && !item.isWellness && (
                      <button
                        type="button"
                        onClick={() => handleCancel(item.id)}
                        className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs transition"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Ticket Modal */}
      <TicketModal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
        booking={selectedTicket}
      />
    </div>
  );
}
