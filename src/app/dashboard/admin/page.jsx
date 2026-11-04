'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldAlert,
  Users,
  Briefcase,
  Ticket,
  Sparkles,
  Home,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  FileText,
  Building,
  Check,
  X,
  Search,
  Filter,
  LogOut
} from 'lucide-react';
import {
  getPartners,
  updatePartnerStatus,
  getBookings,
  getWellnessAppointments,
  getPropertyEnquiries,
  logoutUser
} from '@/services/storage';
import Badge from '@/components/ui/Badge';
import AuthGuard from '@/components/auth/AuthGuard';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('partners'); // 'partners', 'bookings', 'categories', 'metrics'
  const [partners, setPartners] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [wellnessAppointments, setWellnessAppointments] = useState([]);
  const [enquiries, setEnquiries] = useState([]);

  // Category status toggles
  const [categories, setCategories] = useState([
    { id: 'flights', name: 'Flight Booking Engine', status: 'Active', partnersCount: 4 },
    { id: 'buses', name: 'Bus & Sleeper Operators', status: 'Active', partnersCount: 5 },
    { id: 'hotels', name: 'Hotels & Wellness Spas', status: 'Active', partnersCount: 6 },
    { id: 'wellness', name: 'Holistic Alternative Therapies', status: 'Active', partnersCount: 8 },
    { id: 'properties', name: 'Property Buying & Renting', status: 'Active', partnersCount: 3 }
  ]);

  const sync = () => {
    setPartners(getPartners());
    setBookings(getBookings());
    setWellnessAppointments(getWellnessAppointments());
    setEnquiries(getPropertyEnquiries());
  };

  useEffect(() => {
    sync();
    window.addEventListener('auralife_storage_update', sync);
    return () => window.removeEventListener('auralife_storage_update', sync);
  }, []);

  const handleApprovePartner = (id) => {
    updatePartnerStatus(id, 'Approved');
    sync();
  };

  const handleRejectPartner = (id) => {
    updatePartnerStatus(id, 'Rejected');
    sync();
  };

  const pendingPartners = partners.filter((p) => p.status === 'Pending Verification');
  const approvedPartners = partners.filter((p) => p.status === 'Approved');

  const totalGMV = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  return (
    <AuthGuard allowedRole="admin" roleTitle="Administrator">
      <div className="min-h-screen bg-slate-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Admin Header */}
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-white">Administrator Command Console</h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-400/30">
                    Super Admin
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">Platform Auditing • Partner Licensing • Central Ledger</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs text-emerald-400 font-semibold bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-500/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                All 5 Verticals Operational
              </span>

              <button
                type="button"
                onClick={() => {
                  logoutUser();
                  router.push('/login');
                }}
                className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition flex items-center gap-1.5 border border-white/10"
                title="Sign Out of Admin Account"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          </div>

        {/* METRICS GRID */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
            <span className="text-xs font-semibold text-slate-400 uppercase">Pending Approvals</span>
            <div className="text-3xl font-black text-amber-600 mt-2">{pendingPartners.length}</div>
            <p className="text-[11px] text-slate-500 mt-1">Requires License Review</p>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
            <span className="text-xs font-semibold text-slate-400 uppercase">Verified Partners</span>
            <div className="text-3xl font-black text-emerald-600 mt-2">{approvedPartners.length}</div>
            <p className="text-[11px] text-slate-500 mt-1">Active Businesses</p>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
            <span className="text-xs font-semibold text-slate-400 uppercase">Total Bookings</span>
            <div className="text-3xl font-black text-indigo-600 mt-2">{bookings.length}</div>
            <p className="text-[11px] text-slate-500 mt-1">Flights, Buses & Hotels</p>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
            <span className="text-xs font-semibold text-slate-400 uppercase">Wellness Sessions</span>
            <div className="text-3xl font-black text-teal-600 mt-2">{wellnessAppointments.length}</div>
            <p className="text-[11px] text-slate-500 mt-1">Appointments Tracked</p>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm col-span-2 lg:col-span-1">
            <span className="text-xs font-semibold text-slate-400 uppercase">Platform Volume</span>
            <div className="text-2xl font-black text-slate-900 mt-2">₹{totalGMV.toLocaleString()}</div>
            <p className="text-[11px] text-slate-400 mt-1">Total Simulated Volume</p>
          </div>
        </div>

        {/* Dashboard Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 text-xs font-bold">
          <button
            onClick={() => setActiveTab('partners')}
            className={`px-4 py-2.5 rounded-xl transition shrink-0 flex items-center gap-2 ${
              activeTab === 'partners' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:bg-white'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Partner Verification ({pendingPartners.length} Pending)</span>
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2.5 rounded-xl transition shrink-0 flex items-center gap-2 ${
              activeTab === 'bookings' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:bg-white'
            }`}
          >
            <Ticket className="w-3.5 h-3.5" />
            <span>Platform Bookings Ledger ({bookings.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-2.5 rounded-xl transition shrink-0 flex items-center gap-2 ${
              activeTab === 'categories' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:bg-white'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Service Categories Control</span>
          </button>
        </div>

        {/* TAB 1: PARTNER VERIFICATION & APPROVAL / REJECTION */}
        {activeTab === 'partners' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Partner Registration Requests</h3>
                <p className="text-xs text-slate-500">
                  Review applicant licenses and approve or reject prospective travel, hotel, and wellness operators.
                </p>
              </div>
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full">
                {pendingPartners.length} Pending Review
              </span>
            </div>

            <div className="space-y-4">
              {partners.map((partner) => {
                const isPending = partner.status === 'Pending Verification';
                return (
                  <div
                    key={partner.id}
                    className={`p-5 rounded-2xl border transition flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs ${
                      isPending ? 'bg-amber-50/40 border-amber-200' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-500">{partner.id}</span>
                        <span className="text-slate-300">•</span>
                        <span className="font-bold text-slate-900 text-sm">{partner.businessName}</span>
                        <span className="text-indigo-600 font-semibold text-[11px]">({partner.categoryLabel})</span>
                        <Badge status={partner.status} size="sm" />
                      </div>

                      <div className="text-slate-600">
                        Contact: <strong>{partner.contactPerson}</strong> • {partner.email} • {partner.phone}
                      </div>

                      <div className="flex flex-wrap gap-2 text-slate-500 pt-1">
                        <span>License / Reg: <strong>{partner.licenseNumber}</strong></span>
                        <span>•</span>
                        <span>Experience: {partner.yearsInBusiness} yrs</span>
                        <span>•</span>
                        <span>Address: {partner.address}</span>
                      </div>

                      {partner.documentsUploaded && (
                        <div className="flex items-center gap-2 pt-1 text-[11px] text-teal-700">
                          <FileText className="w-3.5 h-3.5" />
                          <span>Documents: {partner.documentsUploaded.join(', ')}</span>
                        </div>
                      )}
                    </div>

                    {/* Admin Actions */}
                    <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                      {isPending ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleApprovePartner(partner.id)}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve Partner</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRejectPartner(partner.id)}
                            className="px-3.5 py-2 rounded-xl bg-white border border-rose-300 text-rose-600 hover:bg-rose-50 font-bold text-xs transition flex items-center gap-1.5"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </>
                      ) : (
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block">Status Decided</span>
                          <span className="font-bold text-slate-700">{partner.status}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: GLOBAL BOOKINGS LEDGER */}
        {activeTab === 'bookings' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Global Platform Bookings ({bookings.length})
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px]">
                    <th className="py-2.5 px-3">Ref ID</th>
                    <th className="py-2.5 px-3">Service</th>
                    <th className="py-2.5 px-3">Operator / Hotel</th>
                    <th className="py-2.5 px-3">Customer</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bookings.map((b) => (
                    <tr key={b.id} className="text-slate-700">
                      <td className="py-3 px-3 font-mono font-bold text-indigo-600">{b.reference}</td>
                      <td className="py-3 px-3 font-semibold text-slate-800">{b.categoryTitle}</td>
                      <td className="py-3 px-3 text-slate-600">{b.airline || b.operator || b.hotelName}</td>
                      <td className="py-3 px-3">{b.contactEmail}</td>
                      <td className="py-3 px-3 font-bold text-slate-900">₹{b.totalAmount?.toLocaleString()}</td>
                      <td className="py-3 px-3">
                        <Badge status={b.status} size="sm" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: CATEGORIES MANAGEMENT */}
        {activeTab === 'categories' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Platform Service Verticals
            </h3>
            <div className="divide-y divide-slate-100">
              {categories.map((cat) => (
                <div key={cat.id} className="py-4 flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{cat.name}</h4>
                    <span className="text-slate-400">{cat.partnersCount} Connected Integrations</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {cat.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  </AuthGuard>
  );
}
