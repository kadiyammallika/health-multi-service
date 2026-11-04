'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  Ticket,
  Sparkles,
  Home,
  CreditCard,
  Bell,
  Clock,
  CheckCircle2,
  XCircle,
  MapPin,
  Calendar,
  Printer,
  ChevronRight,
  ShieldCheck,
  Plane,
  Bus,
  Building2,
  Trash2,
  LogOut
} from 'lucide-react';
import {
  getCurrentUser,
  getBookings,
  getWellnessAppointments,
  getPropertyEnquiries,
  cancelBooking,
  logoutUser
} from '@/services/storage';
import Badge from '@/components/ui/Badge';
import TicketModal from '@/components/ui/TicketModal';
import AuthGuard from '@/components/auth/AuthGuard';

export default function CustomerDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'bookings', 'wellness', 'enquiries', 'payments', 'profile'
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [wellnessAppointments, setWellnessAppointments] = useState([]);
  const [enquiries, setEnquiries] = useState([]);

  // Ticket modal
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isTicketOpen, setIsTicketOpen] = useState(false);

  const sync = () => {
    setUser(getCurrentUser());
    setBookings(getBookings());
    setWellnessAppointments(getWellnessAppointments());
    setEnquiries(getPropertyEnquiries());
  };

  useEffect(() => {
    sync();
    window.addEventListener('auralife_storage_update', sync);
    return () => window.removeEventListener('auralife_storage_update', sync);
  }, []);

  const handleCancelBooking = (id) => {
    if (confirm('Cancel this booking?')) {
      cancelBooking(id);
      sync();
    }
  };

  const totalSpent = bookings
    .filter((b) => b.status === 'Confirmed')
    .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  const confirmedBookingsCount = bookings.filter((b) => b.status === 'Confirmed').length;
  const pendingWellnessCount = wellnessAppointments.filter((w) => w.status === 'Pending').length;

  return (
    <AuthGuard allowedRole="customer" roleTitle="Customer">
      <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Profile Welcome Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
              alt={user?.name || 'User'}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-400/30"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-white">{user?.name || 'Alex Morgan'}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Customer Account
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">{user?.email || 'alex.morgan@example.com'} • {user?.phone || '+91 98765 43210'}</p>
              <div className="text-[11px] text-indigo-300 mt-1">Verified Member Since Jan 2025</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/flights"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition"
            >
              + New Booking
            </Link>

            <button
              type="button"
              onClick={() => {
                logoutUser();
                router.push('/login');
              }}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition flex items-center gap-1.5 border border-white/10"
              title="Sign Out of Customer Account"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 text-xs font-bold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 rounded-xl transition shrink-0 ${
              activeTab === 'overview' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-white'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2.5 rounded-xl transition shrink-0 flex items-center gap-1.5 ${
              activeTab === 'bookings' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-white'
            }`}
          >
            <Ticket className="w-3.5 h-3.5" />
            <span>Travel & Hotel Bookings ({bookings.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('wellness')}
            className={`px-4 py-2.5 rounded-xl transition shrink-0 flex items-center gap-1.5 ${
              activeTab === 'wellness' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600 hover:bg-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Wellness Sessions ({wellnessAppointments.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('enquiries')}
            className={`px-4 py-2.5 rounded-xl transition shrink-0 flex items-center gap-1.5 ${
              activeTab === 'enquiries' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:bg-white'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Property Enquiries ({enquiries.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`px-4 py-2.5 rounded-xl transition shrink-0 flex items-center gap-1.5 ${
              activeTab === 'payments' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-white'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Payment History</span>
          </button>
        </div>

        {/* TAB 1: OVERVIEW METRICS */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
                <span className="text-xs font-semibold text-slate-400 uppercase">Confirmed Bookings</span>
                <div className="text-3xl font-black text-slate-900 mt-2">{confirmedBookingsCount}</div>
                <div className="text-[11px] text-emerald-600 font-semibold mt-1">Flights, Buses & Hotels</div>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
                <span className="text-xs font-semibold text-slate-400 uppercase">Wellness Sessions</span>
                <div className="text-3xl font-black text-teal-600 mt-2">{wellnessAppointments.length}</div>
                <div className="text-[11px] text-amber-600 font-semibold mt-1">
                  {pendingWellnessCount} Pending Acceptance
                </div>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
                <span className="text-xs font-semibold text-slate-400 uppercase">Property Enquiries</span>
                <div className="text-3xl font-black text-rose-600 mt-2">{enquiries.length}</div>
                <div className="text-[11px] text-slate-500 font-semibold mt-1">Direct Agent Leads</div>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
                <span className="text-xs font-semibold text-slate-400 uppercase">Total Demo Spend</span>
                <div className="text-3xl font-black text-indigo-600 mt-2">₹{totalSpent.toLocaleString()}</div>
                <div className="text-[11px] text-slate-400 font-medium mt-1">Simulated Ledger Total</div>
              </div>
            </div>

            {/* Recent Travel & Stays Preview */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-sm">Recent Travel & Stays</h3>
                <button onClick={() => setActiveTab('bookings')} className="text-xs text-indigo-600 font-bold hover:underline">
                  View All ({bookings.length})
                </button>
              </div>

              <div className="space-y-3">
                {bookings.slice(0, 3).map((b) => (
                  <div key={b.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-4 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-white text-indigo-600 shadow-xs">
                        {b.type === 'flight' && <Plane className="w-4 h-4" />}
                        {b.type === 'bus' && <Bus className="w-4 h-4 text-amber-600" />}
                        {b.type === 'hotel' && <Building2 className="w-4 h-4 text-emerald-600" />}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">
                          {b.airline || b.operator || b.hotelName} ({b.reference})
                        </div>
                        <div className="text-slate-500 mt-0.5">
                          {b.fromCity ? `${b.fromCity} ➔ ${b.toCity}` : `${b.city} (${b.roomName})`} • {b.date || b.checkInDate}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge status={b.status} size="sm" />
                      <div className="text-right font-black text-slate-900">₹{b.totalAmount?.toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pending Wellness Requests Banner */}
            <div className="bg-teal-50/60 rounded-3xl p-6 border border-teal-100 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-teal-600" />
                  <h3 className="font-bold text-teal-950 text-sm">Active Wellness Consultations</h3>
                </div>
                <button onClick={() => setActiveTab('wellness')} className="text-xs text-teal-700 font-bold hover:underline">
                  Manage Sessions ({wellnessAppointments.length})
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {wellnessAppointments.map((w) => (
                  <div key={w.id} className="p-4 bg-white rounded-2xl border border-teal-200 space-y-2">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-slate-900">{w.practitionerName}</h4>
                      <Badge status={w.status} size="sm" />
                    </div>
                    <p className="text-slate-500">{w.specialization}</p>
                    <div className="flex justify-between text-slate-700 font-medium pt-1 border-t border-slate-100">
                      <span>📅 {w.date} at {w.timeSlot}</span>
                      <span className="font-bold text-teal-700">₹{w.price}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TRAVEL & HOTEL BOOKINGS */}
        {activeTab === 'bookings' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Confirmed Reservations ({bookings.length})
            </h3>

            <div className="space-y-4">
              {bookings.map((b) => (
                <div
                  key={b.id}
                  className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-indigo-600">{b.reference}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-500 uppercase font-semibold">{b.categoryTitle}</span>
                      <Badge status={b.status} size="sm" />
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      {b.airline || b.operator || b.hotelName}
                    </h4>
                    <p className="text-slate-500">
                      {b.fromCity ? `${b.fromCity} ➔ ${b.toCity}` : `${b.city} • ${b.roomName}`}
                    </p>
                    <p className="text-slate-400">
                      Date: {b.date || b.checkInDate} | Time: {b.time || `${b.nights} Nights`}
                    </p>
                  </div>

                  <div className="flex items-center justify-between md:flex-col md:items-end w-full md:w-auto gap-2">
                    <div className="text-lg font-black text-slate-900">₹{b.totalAmount?.toLocaleString()}</div>
                    <div className="flex items-center gap-2">
                      {b.status === 'Confirmed' && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedTicket(b);
                            setIsTicketOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs"
                        >
                          Print Voucher
                        </button>
                      )}
                      {b.status === 'Confirmed' && (
                        <button
                          type="button"
                          onClick={() => handleCancelBooking(b.id)}
                          className="px-2.5 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: WELLNESS APPOINTMENTS */}
        {activeTab === 'wellness' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Wellness Appointments ({wellnessAppointments.length})</h3>
                <p className="text-xs text-slate-500">Real-time status changes when accepted or declined by the healer</p>
              </div>
              <Link
                href="/wellness"
                className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs"
              >
                + Book Another Healer
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {wellnessAppointments.map((w) => (
                <div key={w.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-mono text-[10px] text-teal-700 font-bold">{w.id}</span>
                      <h4 className="font-bold text-slate-900 text-sm mt-0.5">{w.practitionerName}</h4>
                      <span className="text-teal-600 font-medium text-xs">{w.specialization}</span>
                    </div>
                    <Badge status={w.status} />
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-slate-100 space-y-1">
                    <div><strong>Scheduled:</strong> {w.date} at {w.timeSlot} ({w.duration})</div>
                    <div><strong>Mode:</strong> {w.consultationMode}</div>
                    <div><strong>Patient:</strong> {w.patientName} ({w.patientPhone})</div>
                    {w.notes && <div className="text-slate-500 italic mt-1 font-sans">"{w.notes}"</div>}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                    <span className="text-xs text-slate-500">Session Fee: <strong className="text-slate-900 font-bold">₹{w.price}</strong></span>
                    {w.status === 'Pending' && (
                      <span className="text-[10px] text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded-md">
                        Awaiting Healer Confirmation
                      </span>
                    )}
                    {w.status === 'Confirmed' && (
                      <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">
                        Session Confirmed
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: PROPERTY ENQUIRIES (Kept strictly separate from ticket bookings!) */}
        {activeTab === 'enquiries' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Property Enquiries & Site Visits ({enquiries.length})</h3>
                <p className="text-xs text-slate-500">Kept distinct from ticket bookings. Track site walkthrough appointments and agent callbacks.</p>
              </div>
              <Link
                href="/properties"
                className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
              >
                + Browse More Properties
              </Link>
            </div>

            <div className="space-y-4 text-xs">
              {enquiries.length === 0 ? (
                <div className="text-center py-10 text-slate-400">No property enquiries submitted yet.</div>
              ) : (
                enquiries.map((enq) => (
                  <div key={enq.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-rose-600">{enq.id}</span>
                        <span className="text-slate-300">•</span>
                        <span className="font-bold text-slate-800">{enq.enquiryType}</span>
                      </div>
                      <Badge status={enq.status || 'Received'} size="sm" />
                    </div>

                    <div className="p-4 bg-white rounded-xl border border-slate-100 space-y-2">
                      <h4 className="font-bold text-slate-900 text-sm">{enq.propertyTitle}</h4>
                      <p className="text-slate-500">{enq.propertyLocation} • {enq.priceDisplay} ({enq.purpose === 'buy' ? 'For Sale' : 'For Rent'})</p>
                      <div className="text-slate-600">
                        Scheduled Visit: <strong>{enq.preferredDate} ({enq.preferredTime})</strong>
                      </div>
                      {enq.message && <div className="text-slate-500 italic">Client Note: "{enq.message}"</div>}
                    </div>

                    <div className="flex justify-between items-center text-slate-400 text-[11px] pt-1">
                      <span>Assigned Agent: {enq.agentName} ({enq.agentEmail})</span>
                      <span>Submitted: {new Date(enq.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 5: PAYMENT HISTORY */}
        {activeTab === 'payments' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Simulated Payment Ledger</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px]">
                    <th className="py-2.5 px-3">Transaction Ref</th>
                    <th className="py-2.5 px-3">Service</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Method</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bookings.map((b) => (
                    <tr key={b.id} className="text-slate-700">
                      <td className="py-3 px-3 font-mono font-bold text-indigo-600">{b.reference}</td>
                      <td className="py-3 px-3 font-semibold text-slate-800">{b.categoryTitle}</td>
                      <td className="py-3 px-3 text-slate-500">{new Date(b.bookedAt).toLocaleDateString()}</td>
                      <td className="py-3 px-3">{b.paymentMethod || 'Simulated Card'}</td>
                      <td className="py-3 px-3 font-black text-slate-900">₹{b.totalAmount?.toLocaleString()}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Settled (Demo)
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Ticket Modal */}
      <TicketModal
        isOpen={isTicketOpen}
        onClose={() => setIsTicketOpen(false)}
        booking={selectedTicket}
      />
    </div>
  </AuthGuard>
  );
}
