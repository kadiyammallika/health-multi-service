'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User, Ticket, Sparkles, Home, CreditCard, Bell,
  Clock, CheckCircle2, XCircle, MapPin, Calendar,
  Printer, ChevronRight, ShieldCheck, Plane, Bus,
  Building2, Trash2, LogOut, Search, TrendingUp, ArrowRight
} from 'lucide-react';
import { getCurrentUser, logoutUser } from '@/services/storage';
import Badge from '@/components/ui/Badge';
import AuthGuard from '@/components/auth/AuthGuard';
import { useCurrency } from '@/components/ui/CurrencyProvider';

export default function CustomerDashboardPage() {
  const router = useRouter();
  const { formatPrice } = useCurrency();
  const [activeTab, setActiveTab] = useState('overview');
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [wellnessAppointments, setWellnessAppointments] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch real data from database
  const fetchData = async (isBackground = false) => {
    try {
      setUser(getCurrentUser());

      const [bookingsRes, wellnessRes, enquiriesRes] = await Promise.all([
        fetch('/api/bookings').then(r => r.json()).catch(() => ({ bookings: [] })),
        fetch('/api/wellness').then(r => r.json()).catch(() => ({ appointments: [] })),
        fetch('/api/enquiries').then(r => r.json()).catch(() => ({ enquiries: [] })),
      ]);

      setBookings(bookingsRes.bookings || []);
      setWellnessAppointments(wellnessRes.appointments || []);
      setEnquiries(enquiriesRes.enquiries || []);
    } catch (err) {
      console.error('Dashboard data fetch error:', err);
    }
    if (!isBackground) setLoading(false);
  };

  // Redirect admin users to admin dashboard
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('oneconnect_current_user');
        if (raw) {
          const u = JSON.parse(raw);
          if (u?.accountType === 'admin' || u?.role === 'admin') {
            router.replace('/dashboard/admin');
            return;
          }
        }
      } catch {}
    }
  }, [router]);

  useEffect(() => {
    fetchData();
    // Auto-refresh every 10 seconds to pick up admin approval changes quickly
    const interval = setInterval(() => fetchData(true), 10000);
    return () => clearInterval(interval);
  }, []);

  const handleCancelBooking = async (id) => {
    if (!confirm('Cancel this booking?')) return;
    try {
      const res = await fetch('/api/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: id, status: 'Cancelled' }),
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error('Cancel error:', err);
    }
  };

  const totalSpent = bookings
    .filter(b => b.status === 'Confirmed')
    .reduce((sum, b) => sum + (parseFloat(b.total_amount || '0') || 0), 0);
  const confirmedCount = bookings.filter(b => b.status === 'Confirmed').length;
  const pendingWellness = wellnessAppointments.filter(w => w.status === 'Pending').length;

  // Time-based greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <AuthGuard allowedRole="customer" roleTitle="Customer">
      <div className="min-h-screen bg-slate-50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 text-white rounded-2xl p-6 sm:p-8 shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{greeting}, {user?.name?.split(' ')[0] || 'there'}! 👋</h1>
                  <p className="text-indigo-200 text-sm mt-0.5">{user?.email}</p>
                  <p className="text-indigo-300 text-xs mt-1">
                    Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : 'recently'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Link href="/flights" className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs transition">
                  + New Booking
                </Link>
                <button onClick={() => { logoutUser(); router.push('/login'); }}
                  className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition flex items-center gap-1.5">
                  <LogOut className="w-3.5 h-3.5" /> Log Out
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 text-xs font-bold">
            {[
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'bookings', label: `Bookings (${bookings.length})`, icon: Ticket },
              { id: 'wellness', label: `Health & Healing (${wellnessAppointments.length})`, icon: Sparkles },
              { id: 'enquiries', label: `Enquiries (${enquiries.length})`, icon: Home },
              { id: 'payments', label: 'Payments', icon: CreditCard },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 rounded-xl transition shrink-0 flex items-center gap-1.5 ${
                  activeTab === tab.id ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-white'
                }`}>
                <tab.icon className="w-3.5 h-3.5" /> {tab.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Overview */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                      <span className="text-xs font-semibold text-slate-400 uppercase">Bookings</span>
                      <div className="text-3xl font-black text-slate-900 mt-2">{confirmedCount}</div>
                      <div className="text-xs text-emerald-600 font-semibold mt-1">Confirmed</div>
                    </div>
                    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                      <span className="text-xs font-semibold text-slate-400 uppercase">Health & Healing</span>
                      <div className="text-3xl font-black text-teal-600 mt-2">{wellnessAppointments.length}</div>
                      <div className="text-xs text-amber-600 font-semibold mt-1">{pendingWellness} Pending</div>
                    </div>
                    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                      <span className="text-xs font-semibold text-slate-400 uppercase">Enquiries</span>
                      <div className="text-3xl font-black text-rose-600 mt-2">{enquiries.length}</div>
                      <div className="text-xs text-slate-500 font-semibold mt-1">Property Leads</div>
                    </div>
                    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                      <span className="text-xs font-semibold text-slate-400 uppercase">Total Spent</span>
                      <div className="text-3xl font-black text-indigo-600 mt-2">{formatPrice(totalSpent)}</div>
                      <div className="text-xs text-slate-400 font-medium mt-1">All Bookings</div>
                    </div>
                  </div>

                  {/* Recent Bookings */}
                  <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <h3 className="font-bold text-slate-900 text-sm">Recent Bookings</h3>
                      <button onClick={() => setActiveTab('bookings')} className="text-xs text-indigo-600 font-bold hover:underline">
                        View All
                      </button>
                    </div>
                    {bookings.length === 0 ? (
                      <div className="text-center py-10 space-y-3">
                        <Ticket className="w-10 h-10 text-slate-300 mx-auto" />
                        <p className="text-sm text-slate-500">No bookings yet</p>
                        <Link href="/flights" className="inline-flex items-center gap-1 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700">
                          Book Your First Trip <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {bookings.slice(0, 3).map(b => (
                          <div key={b.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4 text-xs">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-white shadow-sm">
                                {b.type === 'flight' && <Plane className="w-4 h-4 text-indigo-600" />}
                                {b.type === 'bus' && <Bus className="w-4 h-4 text-amber-600" />}
                                {b.type === 'hotel' && <Building2 className="w-4 h-4 text-emerald-600" />}
                                {!['flight','bus','hotel'].includes(b.type) && <Ticket className="w-4 h-4 text-slate-600" />}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900">{b.service_name || b.reference}</div>
                                <div className="text-slate-500 mt-0.5">
                                  {b.from_location && b.to_location ? `${b.from_location} → ${b.to_location}` : b.from_location || b.type} • {b.travel_date || ''}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge status={b.status} size="sm" />
                              <div className="text-right font-black text-slate-900">{formatPrice(parseFloat(b.total_amount || 0))}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Wellness */}
                  {wellnessAppointments.length > 0 && (
                    <div className="bg-teal-50/50 rounded-2xl p-6 border border-teal-100 shadow-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-teal-900 text-sm flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-teal-600" /> Health & Healing Appointments
                        </h3>
                        <button onClick={() => setActiveTab('wellness')} className="text-xs text-teal-700 font-bold hover:underline">
                          Manage
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        {wellnessAppointments.slice(0, 4).map(w => (
                          <div key={w.id} className="p-4 bg-white rounded-xl border border-teal-200 space-y-2">
                            <div className="flex justify-between items-start">
                              <h4 className="font-bold text-slate-900">{w.practitioner_name}</h4>
                              <Badge status={w.status} size="sm" />
                            </div>
                            <p className="text-slate-500">{w.specialization}</p>
                            <div className="flex justify-between text-slate-700 font-medium pt-1 border-t border-slate-100">
                              <span>{w.date} at {w.time_slot}</span>
                              <span className="font-bold text-teal-700">{formatPrice(parseFloat(w.price || 0))}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Bookings Tab */}
              {activeTab === 'bookings' && (
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
                  <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                    Your Bookings ({bookings.length})
                  </h3>
                  {bookings.length === 0 ? (
                    <div className="text-center py-16 space-y-3">
                      <Ticket className="w-12 h-12 text-slate-300 mx-auto" />
                      <p className="text-slate-500">No bookings yet. Start by booking a flight, hotel, or bus!</p>
                      <Link href="/flights" className="inline-flex items-center gap-1 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700">
                        Browse Services <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {bookings.map(b => (
                        <div key={b.id} className="p-5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono font-bold text-indigo-600">{b.reference}</span>
                              <span className="text-slate-300">•</span>
                              <span className="text-slate-500 uppercase font-semibold">{b.category_title || b.type}</span>
                              <Badge status={b.status} size="sm" />
                              {b.admin_approval_status === 'AWAITING_ADMIN_APPROVAL' && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-50 text-orange-700 border border-orange-200 animate-pulse">
                                  ⏳ Awaiting Admin Approval
                                </span>
                              )}
                              {b.admin_approval_status === 'APPROVED' && b.email_notification_status === 'sent' && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                  ✉ Email Sent
                                </span>
                              )}
                              {b.admin_approval_status === 'REJECTED' && b.rejection_reason && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200" title={b.rejection_reason}>
                                  Reason: {b.rejection_reason}
                                </span>
                              )}
                            </div>
                            <h4 className="font-bold text-slate-900 text-sm">{b.service_name || b.reference}</h4>
                            <p className="text-slate-500">
                              {b.from_location && b.to_location ? `${b.from_location} → ${b.to_location}` : b.from_location || ''}
                            </p>
                            <p className="text-slate-400">
                              {b.travel_date && `Date: ${b.travel_date}`} {b.travel_time && `| Time: ${b.travel_time}`}
                            </p>
                          </div>
                          <div className="flex items-center justify-between md:flex-col md:items-end w-full md:w-auto gap-2">
                            <div className="text-lg font-black text-slate-900">{formatPrice(parseFloat(b.total_amount || 0))}</div>
                            {b.status === 'Confirmed' && (
                              <button onClick={() => handleCancelBooking(b.id)}
                                className="px-2.5 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold">
                                Cancel
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Wellness Tab */}
              {activeTab === 'wellness' && (
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-base font-bold text-slate-900">Health & Healing Appointments ({wellnessAppointments.length})</h3>
                    <Link href="/wellness" className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs">
                      + Book Session
                    </Link>
                  </div>
                  {wellnessAppointments.length === 0 ? (
                    <div className="text-center py-16 space-y-3">
                      <Sparkles className="w-12 h-12 text-slate-300 mx-auto" />
                      <p className="text-slate-500">No health & healing appointments yet.</p>
                      <Link href="/wellness" className="inline-flex items-center gap-1 px-5 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-bold hover:bg-teal-700">
                        Explore Health & Healing <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      {wellnessAppointments.map(w => (
                        <div key={w.id} className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-bold text-slate-900 text-sm">{w.practitioner_name}</h4>
                              <span className="text-teal-600 font-medium">{w.specialization}</span>
                            </div>
                            <Badge status={w.status} />
                          </div>
                          <div className="p-3 rounded-lg bg-white border border-slate-100 space-y-1">
                            <div><strong>Date:</strong> {w.date} at {w.time_slot} ({w.duration})</div>
                            <div><strong>Mode:</strong> {w.consultation_mode}</div>
                            {w.notes && <div className="text-slate-500 italic">&quot;{w.notes}&quot;</div>}
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                            <span>Fee: <strong className="text-slate-900">{formatPrice(parseFloat(w.price || 0))}</strong></span>
                            {w.status === 'Pending' && (
                              <span className="text-xs text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded-md">Awaiting Confirmation</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Enquiries Tab */}
              {activeTab === 'enquiries' && (
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-base font-bold text-slate-900">Property Enquiries ({enquiries.length})</h3>
                    <Link href="/properties" className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs">
                      + Browse Properties
                    </Link>
                  </div>
                  {enquiries.length === 0 ? (
                    <div className="text-center py-16 space-y-3">
                      <Home className="w-12 h-12 text-slate-300 mx-auto" />
                      <p className="text-slate-500">No property enquiries yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-4 text-xs">
                      {enquiries.map(enq => (
                        <div key={enq.id} className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-bold text-slate-900 text-sm">{enq.property_title}</h4>
                              <p className="text-slate-500">{enq.property_location} • {enq.price_display}</p>
                            </div>
                            <Badge status={enq.status || 'Received'} size="sm" />
                          </div>
                          <div className="p-3 bg-white rounded-lg border border-slate-100">
                            <div>Visit: <strong>{enq.preferred_date} ({enq.preferred_time})</strong></div>
                            {enq.message && <div className="text-slate-500 italic mt-1">&quot;{enq.message}&quot;</div>}
                          </div>
                          {enq.agent_name && (
                            <div className="text-slate-400 text-[11px]">Agent: {enq.agent_name}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Payments Tab */}
              {activeTab === 'payments' && (
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
                  <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Payment History</h3>
                  {bookings.length === 0 ? (
                    <div className="text-center py-16 text-slate-500">No payment records yet.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px]">
                            <th className="py-2.5 px-3">Reference</th>
                            <th className="py-2.5 px-3">Service</th>
                            <th className="py-2.5 px-3">Date</th>
                            <th className="py-2.5 px-3">Method</th>
                            <th className="py-2.5 px-3">Amount</th>
                            <th className="py-2.5 px-3">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {bookings.map(b => (
                            <tr key={b.id} className="text-slate-700">
                              <td className="py-3 px-3 font-mono font-bold text-indigo-600">{b.reference}</td>
                              <td className="py-3 px-3 font-semibold">{b.category_title || b.type}</td>
                              <td className="py-3 px-3 text-slate-500">{new Date(b.created_at).toLocaleDateString()}</td>
                              <td className="py-3 px-3">{b.payment_method || 'Online'}</td>
                              <td className="py-3 px-3 font-black text-slate-900">{formatPrice(parseFloat(b.total_amount || 0))}</td>
                              <td className="py-3 px-3">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  b.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                  b.status === 'Cancelled' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                                  'bg-slate-50 text-slate-700 border border-slate-200'
                                }`}>
                                  {b.status === 'Confirmed' ? 'Paid' : b.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
