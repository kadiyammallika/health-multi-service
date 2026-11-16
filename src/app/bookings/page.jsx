'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  Home,
  Loader2,
  ChevronDown,
  ChevronUp,
  CreditCard,
  MapPin,
  User,
  Users,
  BedDouble,
  Armchair,
  FileText,
  RefreshCw,
} from 'lucide-react';
import Badge from '@/components/ui/Badge';
import TicketModal from '@/components/ui/TicketModal';
import { useCurrency } from '@/components/ui/CurrencyProvider';

// ---------- helpers ----------

function safeParse(val) {
  if (!val) return {};
  if (typeof val === 'object') return val;
  try { return JSON.parse(val); } catch { return {}; }
}

function formatDate(dateStr) {
  if (!dateStr) return '--';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch { return dateStr; }
}

function formatDateTime(dateStr) {
  if (!dateStr) return '--';
  try {
    const d = new Date(dateStr);
    return d.toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch { return dateStr; }
}

function isFutureDate(dateStr) {
  if (!dateStr) return false;
  try {
    return new Date(dateStr) > new Date();
  } catch { return false; }
}

// Icon + color for service types
const SERVICE_META = {
  flight: { icon: Plane, bg: 'bg-indigo-50', text: 'text-indigo-600', activeBg: 'bg-indigo-600' },
  bus:    { icon: Bus,   bg: 'bg-amber-50',  text: 'text-amber-600',  activeBg: 'bg-amber-600' },
  hotel:  { icon: Building2, bg: 'bg-emerald-50', text: 'text-emerald-600', activeBg: 'bg-emerald-600' },
  properties: { icon: Home, bg: 'bg-violet-50', text: 'text-violet-600', activeBg: 'bg-violet-600' },
  wellness: { icon: Sparkles, bg: 'bg-teal-50', text: 'text-teal-600', activeBg: 'bg-teal-600' },
};

const SERVICE_TABS = [
  { key: 'all', label: 'All Bookings', icon: Ticket, activeBg: 'bg-indigo-600' },
  { key: 'flight', label: 'Flights', icon: Plane, activeBg: 'bg-indigo-600' },
  { key: 'bus', label: 'Buses', icon: Bus, activeBg: 'bg-amber-600' },
  { key: 'hotel', label: 'Hotels', icon: Building2, activeBg: 'bg-emerald-600' },
  { key: 'properties', label: 'Properties', icon: Home, activeBg: 'bg-violet-600' },
  { key: 'wellness', label: 'Health & Healing', icon: Sparkles, activeBg: 'bg-teal-600' },
];

const STATUS_TABS = [
  { key: 'all', label: 'All Statuses' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'Pending', label: 'Pending' },
  { key: 'Awaiting Payment', label: 'Awaiting Payment' },
  { key: 'Confirmed', label: 'Confirmed' },
  { key: 'Completed', label: 'Completed' },
  { key: 'Cancelled', label: 'Cancelled' },
  { key: 'Rejected', label: 'Rejected' },
];

const PAYMENT_STATUS_COLORS = {
  Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Pending:   'bg-amber-50 text-amber-700 border-amber-200',
  Failed:    'bg-rose-50 text-rose-700 border-rose-200',
  'Refund Pending': 'bg-blue-50 text-blue-700 border-blue-200',
  Refunded:  'bg-indigo-50 text-indigo-700 border-indigo-200',
};

// ---------- main component ----------

export default function MyBookingsPage() {
  const router = useRouter();
  const { formatPrice } = useCurrency();
  const [selectedTab, setSelectedTab] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  // Ticket Modal state
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

  // Redirect admin users to admin dashboard
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('oneconnect_current_user');
        if (raw) {
          const user = JSON.parse(raw);
          if (user?.accountType === 'admin' || user?.role === 'admin') {
            router.replace('/dashboard/admin');
            return;
          }
        }
      } catch {}
    }
  }, [router]);

  // ---------- data fetching ----------

  const hasLoadedOnce = useRef(false);

  const loadData = useCallback(async () => {
    if (!hasLoadedOnce.current) setLoading(true);
    setError(null);
    try {
      const [bookingsRes, wellnessRes] = await Promise.all([
        fetch('/api/bookings').then(r => r.json()).catch(() => ({ success: false, bookings: [] })),
        fetch('/api/wellness').then(r => r.json()).catch(() => ({ success: false, appointments: [] })),
      ]);

      const bookings = (bookingsRes.bookings || []).map(b => ({
        ...b,
        details: safeParse(b.details),
        fare_breakdown: safeParse(b.fare_breakdown),
      }));

      // Map wellness appointments into the unified booking format
      const wellnessItems = (wellnessRes.appointments || []).map(w => ({
        id: w.id,
        type: 'wellness',
        reference: w.booking_reference || `WLN-${w.id}`,
        category_title: 'Health & Healing Appointment',
        service_name: w.practitioner_name || w.practitionerName || '--',
        from_location: w.consultation_mode || w.consultationMode || 'Online',
        to_location: null,
        travel_date: w.date,
        travel_time: w.time_slot || w.timeSlot,
        total_amount: w.price || 0,
        status: w.status || 'Pending',
        payment_method: 'Online Payment',
        payment_status: w.status === 'Confirmed' ? 'Completed' : 'Pending',
        provider_name: w.practitioner_name || w.practitionerName,
        created_at: w.created_at,
        details: {
          practitioner_name: w.practitioner_name || w.practitionerName,
          specialization: w.specialization,
          consultation_mode: w.consultation_mode || w.consultationMode,
          duration: w.duration,
          patient_name: w.patient_name || w.patientName,
          patient_phone: w.patient_phone || w.patientPhone,
          notes: w.notes,
        },
        fare_breakdown: {},
        _isWellnessAppointment: true,
      }));

      setAllBookings([...bookings, ...wellnessItems]);
    } catch (err) {
      console.error('Failed to load bookings:', err);
      setError('Failed to load your bookings. Please try again.');
    } finally {
      setLoading(false);
      hasLoadedOnce.current = true;
    }
  }, []);

  useEffect(() => {
    loadData();
    // Auto-refresh every 30 seconds to pick up admin approval changes
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  // ---------- filtering ----------

  const filteredBookings = allBookings.filter(item => {
    // Service type filter
    const typeMatch = selectedTab === 'all' || item.type === selectedTab;

    // Status filter
    let statusMatch = true;
    if (statusFilter === 'upcoming') {
      statusMatch = item.status === 'Confirmed' && isFutureDate(item.travel_date);
    } else if (statusFilter !== 'all') {
      statusMatch = item.status === statusFilter;
    }

    return typeMatch && statusMatch;
  });

  // Counts for tabs
  const typeCounts = allBookings.reduce((acc, b) => {
    acc[b.type] = (acc[b.type] || 0) + 1;
    return acc;
  }, {});

  // ---------- actions ----------

  const handleCancel = async (booking) => {
    const msg = `Are you sure you want to cancel booking ${booking.reference || booking.id}? This action cannot be undone.`;
    if (!confirm(msg)) return;

    setCancellingId(booking.id);
    try {
      const endpoint = booking._isWellnessAppointment ? '/api/wellness' : '/api/bookings';
      const body = booking._isWellnessAppointment
        ? { appointmentId: booking.id, status: 'Cancelled' }
        : { bookingId: booking.id, status: 'Cancelled' };

      const res = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Cancellation failed');
      }
      // Refresh data
      await loadData();
    } catch (err) {
      alert('Failed to cancel: ' + err.message);
    } finally {
      setCancellingId(null);
    }
  };

  const handleViewTicket = (item) => {
    // Map API fields to what TicketModal expects
    const details = item.details || {};
    const ticketData = {
      ...item,
      reference: item.reference,
      categoryTitle: item.category_title,
      totalAmount: parseFloat(item.total_amount) || 0,
      type: item.type,
      // Flight fields
      airline: item.service_name,
      flightNumber: details.flight_number || details.flightNumber || '',
      fromCity: item.from_location,
      toCity: item.to_location,
      from: details.from_code || '',
      to: details.to_code || '',
      date: item.travel_date,
      time: item.travel_time,
      // Bus fields
      operator: item.service_name,
      busType: details.bus_type || details.busType || '',
      selectedSeats: details.selected_seats || details.selectedSeats || [],
      // Hotel fields
      hotelName: item.service_name,
      city: item.from_location,
      roomName: details.room_name || details.roomName || details.room_type || '',
      checkInDate: details.checkInDate || details.check_in_date || item.travel_date,
      nights: details.nights || 1,
      // Passenger info
      passengers: details.passengerDetails || details.passengers || details.guestDetails || [],
      contactEmail: details.email || details.contactEmail || '',
    };
    setSelectedTicket(ticketData);
    setIsTicketModalOpen(true);
  };

  const toggleExpand = (id) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  // ---------- render helpers ----------

  const renderServiceIcon = (type) => {
    const meta = SERVICE_META[type] || SERVICE_META.flight;
    const Icon = meta.icon;
    return (
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${meta.bg} ${meta.text}`}>
        <Icon className="w-6 h-6" />
      </div>
    );
  };

  const renderPaymentBadge = (paymentStatus) => {
    const colors = PAYMENT_STATUS_COLORS[paymentStatus] || PAYMENT_STATUS_COLORS.Pending;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-semibold ${colors}`}>
        <CreditCard className="w-3 h-3" />
        {paymentStatus || 'Unknown'}
      </span>
    );
  };

  // ---------- expanded detail panel ----------

  const renderExpandedDetails = (item) => {
    const details = item.details || {};
    const fareBreakdown = item.fare_breakdown || {};
    const hasFareBreakdown = Object.keys(fareBreakdown).length > 0;

    return (
      <div className="mt-4 pt-4 border-t border-slate-100 space-y-4 animate-in fade-in">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Common info */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Booking Info</h4>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Reference</span>
                <span className="font-mono font-bold text-indigo-600">{item.reference || '--'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Booked On</span>
                <span className="font-semibold text-slate-700">{formatDateTime(item.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Service Type</span>
                <span className="font-semibold text-slate-700 capitalize">{item.type}</span>
              </div>
              {item.provider_name && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Provider</span>
                  <span className="font-semibold text-slate-700">{item.provider_name}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Payment</span>
                {renderPaymentBadge(item.payment_status)}
              </div>
              {item.payment_method && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Method</span>
                  <span className="font-semibold text-slate-700">{item.payment_method}</span>
                </div>
              )}
            </div>
          </div>

          {/* Type-specific details */}
          {item.type === 'flight' && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Flight Details</h4>
              <div className="space-y-1.5 text-xs">
                {details.flight_number && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Flight No.</span>
                    <span className="font-semibold text-slate-700">{details.flight_number}</span>
                  </div>
                )}
                {details.pnr && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">PNR</span>
                    <span className="font-mono font-bold text-indigo-600">{details.pnr}</span>
                  </div>
                )}
                {(details.cabin_class || details.class) && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Class</span>
                    <span className="font-semibold text-slate-700">{details.cabin_class || details.class}</span>
                  </div>
                )}
                {details.baggage && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Baggage</span>
                    <span className="font-semibold text-slate-700">{details.baggage}</span>
                  </div>
                )}
                {details.aircraft && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Aircraft</span>
                    <span className="font-semibold text-slate-700">{details.aircraft}</span>
                  </div>
                )}
                {(details.departure_time || details.departureTime) && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Departure</span>
                    <span className="font-semibold text-slate-700">{details.departure_time || details.departureTime}</span>
                  </div>
                )}
                {(details.arrival_time || details.arrivalTime) && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Arrival</span>
                    <span className="font-semibold text-slate-700">{details.arrival_time || details.arrivalTime}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {item.type === 'hotel' && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hotel Details</h4>
              <div className="space-y-1.5 text-xs">
                {(details.checkInDate || details.check_in_date) && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Check-in</span>
                    <span className="font-semibold text-slate-700">{formatDate(details.checkInDate || details.check_in_date)}</span>
                  </div>
                )}
                {(details.checkOutDate || details.check_out_date) && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Check-out</span>
                    <span className="font-semibold text-slate-700">{formatDate(details.checkOutDate || details.check_out_date)}</span>
                  </div>
                )}
                {(details.room_type || details.roomName || details.room_name) && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Room Type</span>
                    <span className="font-semibold text-slate-700">{details.room_type || details.roomName || details.room_name}</span>
                  </div>
                )}
                {details.nights && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Nights</span>
                    <span className="font-semibold text-slate-700">{details.nights}</span>
                  </div>
                )}
                {(details.guests || details.guest_count) && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Guests</span>
                    <span className="font-semibold text-slate-700">{details.guests || details.guest_count}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {item.type === 'bus' && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Bus Details</h4>
              <div className="space-y-1.5 text-xs">
                {(details.bus_type || details.busType) && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Bus Type</span>
                    <span className="font-semibold text-slate-700">{details.bus_type || details.busType}</span>
                  </div>
                )}
                {(details.selected_seats || details.selectedSeats) && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Seats</span>
                    <span className="font-semibold text-indigo-600">{(details.selected_seats || details.selectedSeats || []).join(', ')}</span>
                  </div>
                )}
                {(details.boarding_point || details.boardingPoint) && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Boarding</span>
                    <span className="font-semibold text-slate-700">{details.boarding_point || details.boardingPoint}</span>
                  </div>
                )}
                {(details.dropping_point || details.droppingPoint) && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Dropping</span>
                    <span className="font-semibold text-slate-700">{details.dropping_point || details.droppingPoint}</span>
                  </div>
                )}
                {(details.departure_time || details.departureTime) && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Departure</span>
                    <span className="font-semibold text-slate-700">{details.departure_time || details.departureTime}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {item.type === 'properties' && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Property Details</h4>
              <div className="space-y-1.5 text-xs">
                {(details.property_type || details.propertyType) && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Property Type</span>
                    <span className="font-semibold text-slate-700">{details.property_type || details.propertyType}</span>
                  </div>
                )}
                {(details.checkInDate || details.check_in_date) && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Check-in</span>
                    <span className="font-semibold text-slate-700">{formatDate(details.checkInDate || details.check_in_date)}</span>
                  </div>
                )}
                {(details.checkOutDate || details.check_out_date) && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Check-out</span>
                    <span className="font-semibold text-slate-700">{formatDate(details.checkOutDate || details.check_out_date)}</span>
                  </div>
                )}
                {details.guests && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Guests</span>
                    <span className="font-semibold text-slate-700">{details.guests}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {item.type === 'wellness' && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Appointment Details</h4>
              <div className="space-y-1.5 text-xs">
                {details.practitioner_name && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Practitioner</span>
                    <span className="font-semibold text-slate-700">{details.practitioner_name}</span>
                  </div>
                )}
                {details.specialization && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Specialization</span>
                    <span className="font-semibold text-slate-700">{details.specialization}</span>
                  </div>
                )}
                {details.consultation_mode && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Mode</span>
                    <span className="font-semibold text-slate-700">{details.consultation_mode}</span>
                  </div>
                )}
                {details.duration && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Duration</span>
                    <span className="font-semibold text-slate-700">{details.duration}</span>
                  </div>
                )}
                {details.patient_name && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Patient</span>
                    <span className="font-semibold text-slate-700">{details.patient_name}</span>
                  </div>
                )}
                {details.notes && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Notes</span>
                    <span className="font-semibold text-slate-700 max-w-[200px] text-right">{details.notes}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Fare breakdown */}
          {hasFareBreakdown && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Price Breakdown</h4>
              <div className="space-y-1.5 text-xs">
                {Object.entries(fareBreakdown).map(([key, val]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-slate-500 capitalize">{key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1')}</span>
                    <span className="font-semibold text-slate-700">
                      {typeof val === 'number' ? formatPrice(val) : String(val)}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between pt-1.5 border-t border-slate-100">
                  <span className="font-bold text-slate-800">Total</span>
                  <span className="font-black text-slate-900">{formatPrice(item.total_amount)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Passenger / Guest details table */}
          {(details.passengerDetails || details.passengers || details.guestDetails) && (
            <div className="space-y-2 md:col-span-2 lg:col-span-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                {item.type === 'hotel' || item.type === 'properties' ? 'Guest Details' : 'Passenger Details'}
              </h4>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500">
                      <th className="px-4 py-2">#</th>
                      <th className="px-4 py-2">Name</th>
                      <th className="px-4 py-2">Age / Gender</th>
                      <th className="px-4 py-2">Info</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(details.passengerDetails || details.passengers || details.guestDetails || []).map((p, idx) => (
                      <tr key={idx} className="text-slate-800">
                        <td className="px-4 py-2 font-mono">{idx + 1}</td>
                        <td className="px-4 py-2 font-medium">{p.name || p.fullName || '--'}</td>
                        <td className="px-4 py-2 text-slate-500">{p.age ? `${p.age} yrs` : '--'} {p.gender ? `/ ${p.gender}` : ''}</td>
                        <td className="px-4 py-2 text-indigo-600 font-semibold">{p.seat || p.seatNumber || p.email || '--'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ---------- render ----------

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-2">
              <Ticket className="w-3.5 h-3.5" />
              <span>Central Reservations Ledger</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">My Bookings & Tickets</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Manage your confirmed flight passes, bus tickets, hotel vouchers, property bookings, and health & healing appointments in one unified ledger.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              disabled={loading}
              className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <Link
              href="/dashboard/customer"
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5"
            >
              <span>Customer Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Service Type Tabs */}
        <div className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm space-y-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {SERVICE_TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = selectedTab === tab.key;
              const count = tab.key === 'all' ? allBookings.length : (typeCounts[tab.key] || 0);
              return (
                <button
                  key={tab.key}
                  onClick={() => setSelectedTab(tab.key)}
                  className={`px-3.5 py-2 rounded-xl font-bold text-xs transition shrink-0 flex items-center gap-1.5 ${
                    isActive ? `${tab.activeBg} text-white` : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto border-t border-slate-100 pt-3">
            <span className="text-slate-400 font-medium text-xs shrink-0 mr-1">
              <Filter className="w-3.5 h-3.5 inline-block mr-1" />
              Status:
            </span>
            {STATUS_TABS.map(tab => {
              const isActive = statusFilter === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setStatusFilter(tab.key)}
                  className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition shrink-0 ${
                    isActive
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-500 hover:bg-slate-100 border border-transparent hover:border-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-3xl p-16 text-center border border-slate-100 shadow-sm">
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mx-auto mb-4" />
            <p className="text-sm font-semibold text-slate-600">Loading your bookings...</p>
            <p className="text-xs text-slate-400 mt-1">Fetching from the database</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="bg-white rounded-3xl p-12 text-center border border-rose-100 shadow-sm space-y-3">
            <AlertTriangle className="w-12 h-12 text-rose-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">Something went wrong</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">{error}</p>
            <button
              onClick={loadData}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Try Again</span>
            </button>
          </div>
        )}

        {/* Bookings List */}
        {!loading && !error && (
          <div className="space-y-4">
            {filteredBookings.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm space-y-3">
                <Ticket className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">
                  {allBookings.length === 0
                    ? 'No bookings yet'
                    : 'No bookings match this filter'}
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {allBookings.length === 0
                    ? 'Explore our flights, luxury bus coaches, health & healing services, hotels, or properties to create your first reservation.'
                    : 'Try adjusting your service type or status filters to find what you are looking for.'}
                </p>
                {allBookings.length === 0 && (
                  <Link
                    href="/flights"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-xs"
                  >
                    <span>Search Flights</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            ) : (
              filteredBookings.map((item) => {
                const isExpanded = expandedId === item.id;
                const canCancel = item.status === 'Confirmed' || item.status === 'Pending';
                const canViewTicket = item.status === 'Confirmed' || item.status === 'Completed';
                const isCancelling = cancellingId === item.id;

                return (
                  <div
                    key={`${item.type}-${item.id}`}
                    className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition overflow-hidden"
                  >
                    {/* Main card row */}
                    <div
                      className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 cursor-pointer"
                      onClick={() => toggleExpand(item.id)}
                    >
                      {/* Left: Icon & Service Details */}
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        {renderServiceIcon(item.type)}

                        <div className="space-y-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              {item.category_title || item.type}
                            </span>
                            <span className="text-slate-300">|</span>
                            <span className="font-mono text-xs font-bold text-indigo-600 truncate">
                              {item.reference || item.id}
                            </span>
                            <Badge status={item.status} size="sm" />
                          </div>

                          <h3 className="font-bold text-slate-900 text-base truncate">
                            {item.service_name || '--'}
                          </h3>

                          <p className="text-xs text-slate-500 truncate">
                            {item.from_location && item.to_location
                              ? `${item.from_location} → ${item.to_location}`
                              : item.from_location
                              ? item.from_location
                              : item.type === 'wellness'
                              ? `${(item.details || {}).specialization || 'Consultation'} — ${(item.details || {}).consultation_mode || 'Online'}`
                              : '--'}
                          </p>
                        </div>
                      </div>

                      {/* Middle: Timing */}
                      <div className="flex items-center gap-6 text-xs text-slate-600 border-y md:border-y-0 md:border-x border-slate-100 py-3 md:py-0 md:px-6 w-full md:w-auto justify-between md:justify-center">
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                            <Calendar className="w-3 h-3 inline-block mr-0.5" /> Date
                          </span>
                          <strong className="text-slate-800 text-xs block mt-0.5">
                            {formatDate(item.travel_date)}
                          </strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                            <Clock className="w-3 h-3 inline-block mr-0.5" /> Schedule
                          </span>
                          <strong className="text-slate-800 text-xs block mt-0.5">
                            {item.travel_time || '--'}
                          </strong>
                        </div>
                      </div>

                      {/* Right: Amount & Actions */}
                      <div className="flex items-center justify-between md:flex-col md:items-end gap-3 w-full md:w-auto">
                        <div className="text-left md:text-right">
                          <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Fare</span>
                          <div className="text-xl font-black text-slate-900">
                            {formatPrice(item.total_amount)}
                          </div>
                        </div>

                        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                          {/* View / Print Ticket */}
                          {canViewTicket && (
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
                          {canCancel && (
                            <button
                              type="button"
                              disabled={isCancelling}
                              onClick={() => handleCancel(item)}
                              className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs transition disabled:opacity-50 flex items-center gap-1"
                            >
                              {isCancelling && <Loader2 className="w-3 h-3 animate-spin" />}
                              Cancel
                            </button>
                          )}

                          {/* Expand toggle */}
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); toggleExpand(item.id); }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                            title={isExpanded ? 'Collapse details' : 'Expand details'}
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Expanded detail panel */}
                    {isExpanded && (
                      <div className="px-6 pb-6">
                        {renderExpandedDetails(item)}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
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
