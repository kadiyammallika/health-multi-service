'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
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
  Eye,
  Mail,
  Phone,
  Calendar,
  ChevronDown,
  MoreVertical,
  UserCheck,
  UserX,
  AlertCircle,
  Database,
  Plane,
  MapPin,
  Plus,
  Pencil,
  ToggleLeft,
  ToggleRight,
  Save
} from 'lucide-react';
import {
  getPartners,
  updatePartnerStatus,
  logoutUser,
  authFetch
} from '@/services/storage';
import Badge from '@/components/ui/Badge';
import AuthGuard from '@/components/auth/AuthGuard';
import { useCurrency } from '@/components/ui/CurrencyProvider';

export default function AdminDashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { formatPrice } = useCurrency();
  const [activeTab, setActiveTab] = useState('overview');

  // Sync activeTab with URL ?tab= parameter (from sidebar links)
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    } else {
      setActiveTab('overview');
    }
  }, [searchParams]);
  const [partners, setPartners] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [wellnessAppointments, setWellnessAppointments] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [actionMessage, setActionMessage] = useState({ type: '', text: '' });
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('all');
  const [bookingTypeFilter, setBookingTypeFilter] = useState('all');
  const [expandedBooking, setExpandedBooking] = useState(null);
  const [rejectionModal, setRejectionModal] = useState({ open: false, bookingId: null });
  const [rejectionReason, setRejectionReason] = useState('');

  // MDM State
  const [mdmTab, setMdmTab] = useState('airlines');
  const [mdmAirlines, setMdmAirlines] = useState([]);
  const [mdmAirports, setMdmAirports] = useState([]);
  const [mdmAircraft, setMdmAircraft] = useState([]);
  const [mdmLoading, setMdmLoading] = useState(false);
  const [mdmSearch, setMdmSearch] = useState('');
  const [mdmShowForm, setMdmShowForm] = useState(false);
  const [mdmEditingId, setMdmEditingId] = useState(null);
  const [mdmFormData, setMdmFormData] = useState({});
  const [mdmSaving, setMdmSaving] = useState(false);
  const [mdmError, setMdmError] = useState('');
  const [mdmSuccess, setMdmSuccess] = useState('');

  const [categories] = useState([
    { id: 'flights', name: 'Flight Booking', status: 'Active', icon: '✈️', partnersCount: 4, color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { id: 'buses', name: 'Bus & Sleeper', status: 'Active', icon: '🚌', partnersCount: 5, color: 'bg-amber-50 text-amber-700 border-amber-200' },
    { id: 'hotels', name: 'Hotels & Stays', status: 'Active', icon: '🏨', partnersCount: 6, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { id: 'wellness', name: 'Health & Healing Services', status: 'Active', icon: '🧘', partnersCount: 8, color: 'bg-teal-50 text-teal-700 border-teal-200' },
    { id: 'properties', name: 'Properties', status: 'Active', icon: '🏠', partnersCount: 3, color: 'bg-rose-50 text-rose-700 border-rose-200' }
  ]);

  // Fetch providers from API
  const fetchProviders = async () => {
    try {
      const res = await authFetch('/api/admin/providers');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.providers?.length > 0) {
          const apiPartners = data.providers.map((p) => ({
            id: p.provider_id,
            userId: p.user_id,
            businessName: p.business_name,
            category: p.category,
            categoryLabel: p.category_label || p.category,
            contactPerson: p.contact_person,
            email: p.email,
            phone: p.phone,
            licenseNumber: p.license_number,
            yearsInBusiness: p.years_in_business,
            address: p.address,
            specialization: p.specialization,
            services: p.services || [],
            appliedDate: p.applied_at,
            status: p.application_status === 'pending' ? 'Pending Verification'
              : p.application_status === 'approved' ? 'Approved'
              : p.application_status === 'rejected' ? 'Rejected'
              : p.application_status,
            _fromApi: true,
          }));
          setPartners(apiPartners);
          return;
        }
      }
    } catch (e) {
      console.error('Failed to fetch providers:', e);
    }
    // Fallback to empty — API might be down
    setPartners(prev => prev.length > 0 ? prev : []);
  };

  // Fetch all users from API
  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await authFetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setAllUsers(data.users);
        }
      }
    } catch (e) {}
    setUsersLoading(false);
  };

  // MDM Functions
  const fetchMdmData = async () => {
    setMdmLoading(true);
    try {
      const [airlinesRes, airportsRes, aircraftRes] = await Promise.all([
        authFetch('/api/admin/master-data/airlines'),
        authFetch('/api/admin/master-data/airports'),
        authFetch('/api/admin/master-data/aircraft'),
      ]);
      if (airlinesRes.ok) { const d = await airlinesRes.json(); setMdmAirlines(d.airlines || []); }
      if (airportsRes.ok) { const d = await airportsRes.json(); setMdmAirports(d.airports || []); }
      if (aircraftRes.ok) { const d = await aircraftRes.json(); setMdmAircraft(d.aircraft || []); }
    } catch (e) { console.error('MDM fetch error:', e); }
    setMdmLoading(false);
  };

  const mdmOpenAdd = () => {
    setMdmEditingId(null);
    setMdmFormData({});
    setMdmError('');
    setMdmShowForm(true);
  };

  const mdmOpenEdit = (item) => {
    setMdmEditingId(item.id);
    setMdmFormData({ ...item });
    setMdmError('');
    setMdmShowForm(true);
  };

  const mdmSave = async () => {
    setMdmSaving(true);
    setMdmError('');
    try {
      const endpoint = `/api/admin/master-data/${mdmTab}`;
      const method = mdmEditingId ? 'PUT' : 'POST';
      const payload = mdmEditingId ? { ...mdmFormData, id: mdmEditingId } : mdmFormData;

      const res = await authFetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setMdmError(data.error || 'Failed to save');
      } else {
        setMdmSuccess(mdmEditingId ? 'Record updated successfully!' : 'Record added successfully!');
        setMdmShowForm(false);
        setMdmEditingId(null);
        setMdmFormData({});
        fetchMdmData();
        setTimeout(() => setMdmSuccess(''), 3000);
      }
    } catch (e) {
      setMdmError('Network error');
    }
    setMdmSaving(false);
  };

  const mdmToggleActive = async (item) => {
    try {
      await authFetch(`/api/admin/master-data/${mdmTab}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, is_active: !item.is_active }),
      });
      fetchMdmData();
    } catch (e) { console.error('Toggle error:', e); }
  };

  const sync = async () => {
    fetchProviders();
    fetchUsers();
    fetchMdmData();
    // Fetch bookings from API (admin view)
    try {
      const bookingsRes = await authFetch('/api/bookings?role=admin');
      const bookingsData = await bookingsRes.json();
      if (bookingsData.success) setBookings(bookingsData.bookings || []);
    } catch (e) { console.error('Fetch bookings error:', e); }
  };

  useEffect(() => {
    sync();
    window.addEventListener('auralife_storage_update', sync);
    return () => window.removeEventListener('auralife_storage_update', sync);
  }, []);

  const handleApprovePartner = async (partner) => {
    try {
      const res = await authFetch(`/api/admin/providers/${partner.id}/approve`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setActionMessage({
          type: 'success',
          text: data.message || 'Provider approved successfully!',
        });
      } else {
        setActionMessage({ type: 'error', text: data.error || 'Failed to approve provider' });
      }
    } catch (e) {
      setActionMessage({ type: 'error', text: 'Network error approving provider' });
    }
    if (!partner._fromApi) {
      updatePartnerStatus(partner.id, 'Approved');
    }
    sync();
    setTimeout(() => setActionMessage({ type: '', text: '' }), 5000);
  };

  const handleRejectPartner = async (partner) => {
    try {
      const res = await authFetch(`/api/admin/providers/${partner.id}/reject`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setActionMessage({
          type: 'success',
          text: data.message || 'Provider rejected.',
        });
      } else {
        setActionMessage({ type: 'error', text: data.error || 'Failed to reject provider' });
      }
    } catch (e) {
      setActionMessage({ type: 'error', text: 'Network error rejecting provider' });
    }
    if (!partner._fromApi) {
      updatePartnerStatus(partner.id, 'Rejected');
    }
    sync();
    setTimeout(() => setActionMessage({ type: '', text: '' }), 5000);
  };

  // Admin Booking Approval Actions
  const handleApproveBooking = async (booking) => {
    try {
      const res = await authFetch('/api/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: booking.id, approvalAction: 'approve' }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage({
          type: 'success',
          text: data.message || `Booking ${booking.reference} approved! Confirmation email sent to customer.`,
        });
        sync();
      } else {
        setActionMessage({ type: 'error', text: data.error || 'Failed to approve booking' });
      }
    } catch (e) {
      setActionMessage({ type: 'error', text: 'Network error approving booking' });
    }
    setTimeout(() => setActionMessage({ type: '', text: '' }), 5000);
  };

  const handleRejectBooking = async () => {
    const bId = rejectionModal.bookingId;
    if (!bId) return;
    try {
      const res = await authFetch('/api/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: bId, approvalAction: 'reject', rejectionReason: rejectionReason || 'Rejected by admin' }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage({ type: 'success', text: `Booking rejected. Rejection email sent to customer.` });
        sync();
      } else {
        setActionMessage({ type: 'error', text: data.error || 'Failed to reject booking' });
      }
    } catch (e) {
      setActionMessage({ type: 'error', text: 'Network error rejecting booking' });
    }
    setRejectionModal({ open: false, bookingId: null });
    setRejectionReason('');
    setTimeout(() => setActionMessage({ type: '', text: '' }), 5000);
  };

  const pendingPartners = partners.filter((p) => p.status === 'Pending Verification');
  const approvedPartners = partners.filter((p) => p.status === 'Approved');
  const totalGMV = bookings.reduce((sum, b) => sum + (parseFloat(b.total_amount || 0) || 0), 0);

  // Filter users
  const filteredUsers = allUsers.filter((u) => {
    const matchSearch = !searchTerm ||
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.phone?.includes(searchTerm);
    const matchType = filterType === 'all' || u.account_type === filterType;
    return matchSearch && matchType;
  });

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'users', label: 'All Users', icon: Users, count: allUsers.length },
    { id: 'partners', label: 'Partners', icon: Briefcase, count: pendingPartners.length },
    { id: 'bookings', label: 'Bookings', icon: Ticket, count: bookings.length },
    { id: 'categories', label: 'Categories', icon: Building },
    { id: 'master-data', label: 'Master Data', icon: Database },
  ];

  return (
    <AuthGuard allowedRole="admin" roleTitle="Administrator">
      <div>
        {/* Page Header */}
        <div className="bg-white border-b border-gray-200 px-5 sm:px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-gray-900">Dashboard</h1>
              <p className="text-[13px] text-gray-500 mt-0.5">Overview of your platform activity</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-emerald-600 font-medium bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Live
              </span>
            </div>
          </div>

          {/* Tabs — Clean underline style */}
          <div className="flex items-center gap-0 mt-5 overflow-x-auto scrollbar-hide border-b border-gray-100 -mb-5 -mx-5 sm:-mx-6 px-5 sm:px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    router.push(tab.id === 'overview' ? '/dashboard/admin' : `/dashboard/admin?tab=${tab.id}`, { scroll: false });
                  }}
                  className={`flex items-center gap-1.5 px-4 py-3 text-[13px] font-medium transition shrink-0 border-b-2 ${
                    isActive
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                      isActive ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-6">

          {/* Action Message Banner */}
          {actionMessage.text && (
            <div className={`px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 ${
              actionMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}>
              {actionMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {actionMessage.text}
            </div>
          )}

          {/* ===== OVERVIEW TAB ===== */}
          {activeTab === 'overview' && (
            <>
              {/* Metrics */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                {[
                  { label: 'Total Users', value: allUsers.length, color: 'text-indigo-600', icon: Users, bg: 'bg-indigo-50' },
                  { label: 'Pending Approvals', value: pendingPartners.length, color: 'text-amber-600', icon: Clock, bg: 'bg-amber-50' },
                  { label: 'Active Partners', value: approvedPartners.length, color: 'text-emerald-600', icon: UserCheck, bg: 'bg-emerald-50' },
                  { label: 'Total Bookings', value: bookings.length, color: 'text-blue-600', icon: Ticket, bg: 'bg-blue-50' },
                  { label: 'Platform GMV', value: formatPrice(totalGMV), color: 'text-purple-600', icon: TrendingUp, bg: 'bg-purple-50' },
                ].map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <div key={i} className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase">{stat.label}</span>
                        <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center`}>
                          <Icon className={`w-4 h-4 ${stat.color}`} />
                        </div>
                      </div>
                      <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
                    </div>
                  );
                })}
              </div>

              {/* Recent Users Table */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">Recent Users</h3>
                  <button
                    onClick={() => setActiveTab('users')}
                    className="text-xs text-indigo-600 font-semibold hover:underline"
                  >
                    View All →
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="py-3 px-5 text-[11px] font-semibold text-slate-400 uppercase">Name</th>
                        <th className="py-3 px-5 text-[11px] font-semibold text-slate-400 uppercase">Email</th>
                        <th className="py-3 px-5 text-[11px] font-semibold text-slate-400 uppercase">Phone</th>
                        <th className="py-3 px-5 text-[11px] font-semibold text-slate-400 uppercase">Type</th>
                        <th className="py-3 px-5 text-[11px] font-semibold text-slate-400 uppercase">Joined</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {allUsers.slice(0, 5).map((user) => (
                        <tr key={user.id} className="hover:bg-slate-50 transition">
                          <td className="py-3 px-5">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                                user.account_type === 'admin' ? 'bg-amber-500' :
                                user.account_type === 'provider' ? 'bg-purple-500' : 'bg-indigo-500'
                              }`}>
                                {user.name?.charAt(0)?.toUpperCase() || '?'}
                              </div>
                              <span className="text-sm font-semibold text-slate-900">{user.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-5 text-xs text-slate-600">{user.email}</td>
                          <td className="py-3 px-5 text-xs text-slate-600">{user.phone || '—'}</td>
                          <td className="py-3 px-5">
                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold border ${
                              user.account_type === 'admin' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                              user.account_type === 'provider' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                              'bg-indigo-50 text-indigo-700 border-indigo-200'
                            }`}>
                              {user.account_type === 'admin' ? 'Admin' :
                               user.account_type === 'provider' ? 'Provider' : 'Customer'}
                            </span>
                          </td>
                          <td className="py-3 px-5 text-xs text-slate-400">
                            {user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}
                          </td>
                        </tr>
                      ))}
                      {allUsers.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-sm text-slate-400">
                            No users found. Users will appear here when they register.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pending Partners (Quick View) */}
              {pendingPartners.length > 0 && (
                <div className="bg-white rounded-xl border border-amber-200 shadow-sm overflow-hidden">
                  <div className="px-5 py-4 bg-amber-50 border-b border-amber-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      <h3 className="text-sm font-bold text-amber-800">
                        {pendingPartners.length} Pending Partner Approval{pendingPartners.length > 1 ? 's' : ''}
                      </h3>
                    </div>
                    <button
                      onClick={() => setActiveTab('partners')}
                      className="text-xs text-amber-700 font-semibold hover:underline"
                    >
                      Review All →
                    </button>
                  </div>
                  <div className="divide-y divide-slate-50">
                    {pendingPartners.slice(0, 3).map((partner) => (
                      <div key={partner.id} className="px-5 py-3 flex items-center justify-between">
                        <div>
                          <div className="text-sm font-semibold text-slate-900">{partner.businessName}</div>
                          <div className="text-[11px] text-slate-500">{partner.contactPerson} • {partner.email}</div>
                          {Array.isArray(partner.services) && partner.services.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {partner.services.map(svc => {
                                const labels = { flights: 'Flights', hotels: 'Hotels', buses: 'Buses', wellness: 'Health & Healing', properties: 'Properties' };
                                return <span key={svc} className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-600">{labels[svc] || svc}</span>;
                              })}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleApprovePartner(partner)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectPartner(partner)}
                            className="px-3 py-1.5 rounded-lg bg-white border border-rose-300 text-rose-600 hover:bg-rose-50 text-xs font-bold transition"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ===== ALL USERS TAB ===== */}
          {activeTab === 'users' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              {/* Search & Filter */}
              <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by name, email, or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-center gap-2">
                  {['all', 'customer', 'provider', 'admin'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setFilterType(type)}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold transition ${
                        filterType === type
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {type === 'all' ? 'All' : (type || '').charAt(0).toUpperCase() + (type || '').slice(1) + 's'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Users Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="py-3 px-5 text-[11px] font-semibold text-slate-400 uppercase">User</th>
                      <th className="py-3 px-5 text-[11px] font-semibold text-slate-400 uppercase">Email</th>
                      <th className="py-3 px-5 text-[11px] font-semibold text-slate-400 uppercase">Phone</th>
                      <th className="py-3 px-5 text-[11px] font-semibold text-slate-400 uppercase">Account Type</th>
                      <th className="py-3 px-5 text-[11px] font-semibold text-slate-400 uppercase">Status</th>
                      <th className="py-3 px-5 text-[11px] font-semibold text-slate-400 uppercase">Joined</th>
                      <th className="py-3 px-5 text-[11px] font-semibold text-slate-400 uppercase">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {usersLoading ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center">
                          <div className="inline-flex items-center gap-2 text-sm text-slate-500">
                            <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                            Loading users...
                          </div>
                        </td>
                      </tr>
                    ) : filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-sm text-slate-400">
                          {searchTerm || filterType !== 'all' ? 'No users match your search.' : 'No users registered yet.'}
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-slate-50 transition">
                          <td className="py-3.5 px-5">
                            <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 ${
                                user.account_type === 'admin' ? 'bg-gradient-to-br from-amber-500 to-orange-600' :
                                user.account_type === 'provider' ? 'bg-gradient-to-br from-purple-500 to-indigo-600' :
                                'bg-gradient-to-br from-blue-500 to-indigo-600'
                              }`}>
                                {user.name?.charAt(0)?.toUpperCase() || '?'}
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-slate-900">{user.name}</div>
                                <div className="text-[11px] text-slate-400">ID: {user.id?.slice(0, 8)}...</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-5">
                            <div className="flex items-center gap-1.5">
                              <Mail className="w-3.5 h-3.5 text-slate-400" />
                              <span className="text-xs text-slate-700">{user.email}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-5">
                            <div className="flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 text-slate-400" />
                              <span className="text-xs text-slate-700">{user.phone || '—'}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-5">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                              user.account_type === 'admin' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                              user.account_type === 'provider' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                              'bg-blue-50 text-blue-700 border-blue-200'
                            }`}>
                              {user.account_type === 'admin' ? '🛡️ Admin' :
                               user.account_type === 'provider' ? '🏪 Provider' : '👤 Customer'}
                            </span>
                          </td>
                          <td className="py-3.5 px-5">
                            {user.account_type === 'provider' ? (
                              <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                                user.application_status === 'approved' ? 'bg-emerald-50 text-emerald-700' :
                                user.application_status === 'rejected' ? 'bg-rose-50 text-rose-700' :
                                'bg-amber-50 text-amber-700'
                              }`}>
                                {user.application_status === 'approved' ? '✓ Approved' :
                                 user.application_status === 'rejected' ? '✕ Rejected' :
                                 '⏳ Pending'}
                              </span>
                            ) : (
                              <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                                ✓ Active
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-5">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              <span className="text-xs text-slate-500">
                                {user.created_at ? new Date(user.created_at).toLocaleDateString('en-IN', {
                                  day: 'numeric', month: 'short', year: 'numeric'
                                }) : '—'}
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-5">
                            {user.account_type === 'provider' && user.business_name && (
                              <span className="text-[11px] text-slate-500">{user.business_name}</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-500">
                Showing {filteredUsers.length} of {allUsers.length} users
              </div>
            </div>
          )}

          {/* ===== PARTNERS TAB ===== */}
          {activeTab === 'partners' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Partner Applications</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Review and manage partner registrations</p>
                </div>
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">
                  {pendingPartners.length} Pending
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="py-3 px-5 text-[11px] font-semibold text-slate-400 uppercase">Business</th>
                      <th className="py-3 px-5 text-[11px] font-semibold text-slate-400 uppercase">Contact</th>
                      <th className="py-3 px-5 text-[11px] font-semibold text-slate-400 uppercase">Services</th>
                      <th className="py-3 px-5 text-[11px] font-semibold text-slate-400 uppercase">License</th>
                      <th className="py-3 px-5 text-[11px] font-semibold text-slate-400 uppercase">Experience</th>
                      <th className="py-3 px-5 text-[11px] font-semibold text-slate-400 uppercase">Status</th>
                      <th className="py-3 px-5 text-[11px] font-semibold text-slate-400 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {partners.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-sm text-slate-400">
                          No partner applications yet.
                        </td>
                      </tr>
                    ) : (
                      partners.map((partner) => {
                        const isPending = partner.status === 'Pending Verification';
                        return (
                          <tr key={partner.id} className={`hover:bg-slate-50 transition ${isPending ? 'bg-amber-50/30' : ''}`}>
                            <td className="py-3.5 px-5">
                              <div className="text-sm font-semibold text-slate-900">{partner.businessName}</div>
                              <div className="text-[11px] text-slate-400">{partner.address}</div>
                            </td>
                            <td className="py-3.5 px-5">
                              <div className="text-xs font-medium text-slate-800">{partner.contactPerson}</div>
                              <div className="text-[11px] text-slate-500">{partner.email}</div>
                              <div className="text-[11px] text-slate-400">{partner.phone}</div>
                            </td>
                            <td className="py-3.5 px-5">
                              <div className="flex flex-wrap gap-1">
                                {(Array.isArray(partner.services) ? partner.services : [partner.category]).map(svc => {
                                  const labels = { flights: 'Flights', hotels: 'Hotels', buses: 'Buses', wellness: 'Health & Healing', properties: 'Properties' };
                                  const colors = { flights: 'bg-blue-50 text-blue-700 border-blue-200', hotels: 'bg-emerald-50 text-emerald-700 border-emerald-200', buses: 'bg-amber-50 text-amber-700 border-amber-200', wellness: 'bg-teal-50 text-teal-700 border-teal-200', properties: 'bg-rose-50 text-rose-700 border-rose-200' };
                                  return (
                                    <span key={svc} className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${colors[svc] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                                      {labels[svc] || svc}
                                    </span>
                                  );
                                })}
                              </div>
                            </td>
                            <td className="py-3.5 px-5">
                              <span className="text-xs font-mono text-slate-700">{partner.licenseNumber}</span>
                            </td>
                            <td className="py-3.5 px-5">
                              <span className="text-xs text-slate-600">{partner.yearsInBusiness} yrs</span>
                            </td>
                            <td className="py-3.5 px-5">
                              <Badge status={partner.status} size="sm" />
                            </td>
                            <td className="py-3.5 px-5">
                              {isPending ? (
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() => handleApprovePartner(partner)}
                                    className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition"
                                    title="Approve"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleRejectPartner(partner)}
                                    className="p-1.5 rounded-lg bg-white border border-rose-300 text-rose-600 hover:bg-rose-50 transition"
                                    title="Reject"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <span className="text-[11px] text-slate-500 font-medium">{partner.status}</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ===== BOOKINGS TAB ===== */}
          {activeTab === 'bookings' && (() => {
            const filteredBookings = bookings.filter((b) => {
              const matchSearch = !bookingSearch ||
                b.reference?.toLowerCase().includes(bookingSearch.toLowerCase()) ||
                b.customer_name?.toLowerCase().includes(bookingSearch.toLowerCase()) ||
                b.customer_email?.toLowerCase().includes(bookingSearch.toLowerCase());
              const matchStatus = bookingStatusFilter === 'all' || b.status?.toLowerCase() === bookingStatusFilter.toLowerCase() || (bookingStatusFilter === 'awaiting_approval' && b.admin_approval_status === 'AWAITING_ADMIN_APPROVAL');
              const matchType = bookingTypeFilter === 'all' || b.type?.toLowerCase() === bookingTypeFilter.toLowerCase();
              return matchSearch && matchStatus && matchType;
            });
            const confirmedCount = bookings.filter(b => b.status?.toLowerCase() === 'confirmed').length;
            const pendingCount = bookings.filter(b => b.status?.toLowerCase() === 'pending').length;
            const awaitingApprovalCount = bookings.filter(b => b.admin_approval_status === 'AWAITING_ADMIN_APPROVAL').length;
            const cancelledCount = bookings.filter(b => b.status?.toLowerCase() === 'cancelled').length;
            const totalRevenue = bookings.filter(b => b.status?.toLowerCase() === 'confirmed' || b.status?.toLowerCase() === 'completed')
              .reduce((sum, b) => sum + (parseFloat(b.total_amount || 0) || 0), 0);

            return (
            <div className="space-y-4">
              {/* Filters */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                <div className="flex flex-wrap gap-3 items-center">
                  <div className="flex-1 min-w-[200px]">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search by reference, customer name..."
                        value={bookingSearch}
                        onChange={(e) => setBookingSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      />
                    </div>
                  </div>
                  <select
                    value={bookingStatusFilter}
                    onChange={(e) => setBookingStatusFilter(e.target.value)}
                    className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="awaiting_approval">Awaiting Approval</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="rejected">Rejected</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="completed">Completed</option>
                  </select>
                  <select
                    value={bookingTypeFilter}
                    onChange={(e) => setBookingTypeFilter(e.target.value)}
                    className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  >
                    <option value="all">All Types</option>
                    <option value="flights">Flights</option>
                    <option value="hotels">Hotels</option>
                    <option value="buses">Buses</option>
                    <option value="wellness">Wellness</option>
                    <option value="properties">Properties</option>
                  </select>
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                {[
                  { label: 'Total Bookings', value: bookings.length, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                  { label: 'Awaiting Approval', value: awaitingApprovalCount, color: 'text-orange-600', bg: 'bg-orange-50' },
                  { label: 'Confirmed', value: confirmedCount, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                  { label: 'Cancelled', value: cancelledCount, color: 'text-red-600', bg: 'bg-red-50' },
                  { label: 'Total Revenue', value: formatPrice(totalRevenue), color: 'text-purple-600', bg: 'bg-purple-50' },
                ].map((stat, i) => (
                  <div key={i} className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase">{stat.label}</span>
                    <div className={`text-2xl font-black ${stat.color} mt-1`}>{stat.value}</div>
                  </div>
                ))}
              </div>

              {/* Bookings Table */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900">Platform Bookings ({filteredBookings.length})</h3>
                  <p className="text-xs text-slate-500 mt-0.5">All booking transactions across the platform</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="py-3 px-4 text-[11px] font-semibold text-slate-400 uppercase">Reference</th>
                        <th className="py-3 px-4 text-[11px] font-semibold text-slate-400 uppercase">Service Type</th>
                        <th className="py-3 px-4 text-[11px] font-semibold text-slate-400 uppercase">Customer</th>
                        <th className="py-3 px-4 text-[11px] font-semibold text-slate-400 uppercase">Provider</th>
                        <th className="py-3 px-4 text-[11px] font-semibold text-slate-400 uppercase">Date</th>
                        <th className="py-3 px-4 text-[11px] font-semibold text-slate-400 uppercase">Amount</th>
                        <th className="py-3 px-4 text-[11px] font-semibold text-slate-400 uppercase">Approval</th>
                        <th className="py-3 px-4 text-[11px] font-semibold text-slate-400 uppercase">Status</th>
                        <th className="py-3 px-4 text-[11px] font-semibold text-slate-400 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredBookings.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="py-12 text-center text-sm text-slate-400">
                            {bookings.length === 0
                              ? 'No bookings yet. Bookings will appear here when customers book services.'
                              : 'No bookings match your filters.'}
                          </td>
                        </tr>
                      ) : (
                        filteredBookings.map((b) => (
                          <React.Fragment key={b.id}>
                            <tr className="hover:bg-slate-50 transition">
                              <td className="py-3 px-4 font-mono font-bold text-xs text-indigo-600">{b.reference}</td>
                              <td className="py-3 px-4">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 capitalize">
                                  {b.type || '—'}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <div className="text-xs font-semibold text-slate-800">{b.customer_name || '—'}</div>
                                <div className="text-[11px] text-slate-400">{b.customer_email || ''}</div>
                              </td>
                              <td className="py-3 px-4 text-xs text-slate-600">{b.provider_name || '—'}</td>
                              <td className="py-3 px-4 text-xs text-slate-600">
                                {b.travel_date ? new Date(b.travel_date).toLocaleDateString() : '—'}
                              </td>
                              <td className="py-3 px-4 text-xs font-bold text-slate-900">
                                {formatPrice(parseFloat(b.total_amount || 0))}
                              </td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                  b.admin_approval_status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                  b.admin_approval_status === 'REJECTED' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                  'bg-orange-50 text-orange-700 border-orange-200 animate-pulse'
                                }`}>
                                  {b.admin_approval_status === 'APPROVED' ? '✓ Approved' :
                                   b.admin_approval_status === 'REJECTED' ? '✕ Rejected' :
                                   '⏳ Awaiting'}
                                </span>
                              </td>
                              <td className="py-3 px-4"><Badge status={b.status} size="sm" /></td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => setExpandedBooking(expandedBooking === b.id ? null : b.id)}
                                    className="p-1.5 rounded-lg hover:bg-indigo-50 text-indigo-600 transition"
                                    title="View Details"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>
                                  {(b.admin_approval_status === 'AWAITING_ADMIN_APPROVAL' || (b.status === 'Pending' && b.admin_approval_status !== 'APPROVED')) && (
                                    <>
                                      <button
                                        onClick={() => handleApproveBooking(b)}
                                        className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition"
                                        title="Approve Booking"
                                      >
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => setRejectionModal({ open: true, bookingId: b.id })}
                                        className="p-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition"
                                        title="Reject Booking"
                                      >
                                        <XCircle className="w-3.5 h-3.5" />
                                      </button>
                                    </>
                                  )}
                                  {b.admin_approval_status !== 'AWAITING_ADMIN_APPROVAL' && b.status !== 'Cancelled' && b.status !== 'Completed' && (
                                    <button
                                      onClick={async () => {
                                        try {
                                          const res = await authFetch('/api/bookings', {
                                            method: 'PATCH',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ bookingId: b.id, status: 'Cancelled', notes: 'Cancelled by admin' }),
                                          });
                                          const data = await res.json();
                                          if (data.success) { setActionMessage({ type: 'success', text: `Booking ${b.reference} cancelled` }); sync(); }
                                          else { setActionMessage({ type: 'error', text: data.error || 'Failed' }); }
                                        } catch (e) { setActionMessage({ type: 'error', text: 'Network error' }); }
                                        setTimeout(() => setActionMessage({ type: '', text: '' }), 5000);
                                      }}
                                      className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition"
                                      title="Cancel Booking"
                                    >
                                      <XCircle className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                            {expandedBooking === b.id && (
                              <tr>
                                <td colSpan={9} className="bg-slate-50 px-6 py-4">
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                                    <div>
                                      <span className="font-semibold text-slate-500">Booking ID:</span>
                                      <p className="text-slate-800 mt-0.5">{b.id}</p>
                                    </div>
                                    <div>
                                      <span className="font-semibold text-slate-500">Customer Email:</span>
                                      <p className="text-slate-800 mt-0.5">{b.customer_email || '—'}</p>
                                    </div>
                                    <div>
                                      <span className="font-semibold text-slate-500">Provider:</span>
                                      <p className="text-slate-800 mt-0.5">{b.provider_name || '—'}</p>
                                    </div>
                                    <div>
                                      <span className="font-semibold text-slate-500">Created:</span>
                                      <p className="text-slate-800 mt-0.5">
                                        {b.created_at ? new Date(b.created_at).toLocaleString() : '—'}
                                      </p>
                                    </div>
                                    <div>
                                      <span className="font-semibold text-slate-500">Service:</span>
                                      <p className="text-slate-800 mt-0.5">{b.service_name || b.category_title || '—'}</p>
                                    </div>
                                    <div>
                                      <span className="font-semibold text-slate-500">Route/Location:</span>
                                      <p className="text-slate-800 mt-0.5">{b.from_location && b.to_location ? `${b.from_location} → ${b.to_location}` : '—'}</p>
                                    </div>
                                    <div>
                                      <span className="font-semibold text-slate-500">Travel Date:</span>
                                      <p className="text-slate-800 mt-0.5">
                                        {b.travel_date ? new Date(b.travel_date).toLocaleDateString() : '—'}
                                      </p>
                                    </div>
                                    <div>
                                      <span className="font-semibold text-slate-500">Payment Method:</span>
                                      <p className="text-slate-800 mt-0.5">{b.payment_method || '—'}</p>
                                    </div>
                                    <div>
                                      <span className="font-semibold text-slate-500">Payment Status:</span>
                                      <p className="text-slate-800 mt-0.5 capitalize">{b.payment_status || '—'}</p>
                                    </div>
                                    <div>
                                      <span className="font-semibold text-slate-500">Admin Approval:</span>
                                      <p className="text-slate-800 mt-0.5">{b.admin_approval_status || 'N/A'}</p>
                                    </div>
                                    {b.approved_by_name && (
                                      <div>
                                        <span className="font-semibold text-slate-500">Approved By:</span>
                                        <p className="text-slate-800 mt-0.5">{b.approved_by_name}</p>
                                      </div>
                                    )}
                                    {b.approval_timestamp && (
                                      <div>
                                        <span className="font-semibold text-slate-500">Approval Time:</span>
                                        <p className="text-slate-800 mt-0.5">{new Date(b.approval_timestamp).toLocaleString()}</p>
                                      </div>
                                    )}
                                    {b.rejection_reason && (
                                      <div className="md:col-span-2">
                                        <span className="font-semibold text-rose-500">Rejection Reason:</span>
                                        <p className="text-rose-700 mt-0.5">{b.rejection_reason}</p>
                                      </div>
                                    )}
                                    {b.email_notification_status && (
                                      <div>
                                        <span className="font-semibold text-slate-500">Email Status:</span>
                                        <p className="text-slate-800 mt-0.5 capitalize">{b.email_notification_status}</p>
                                      </div>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            );
          })()}

          {/* ===== CATEGORIES TAB ===== */}
          {activeTab === 'categories' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">Service Categories</h3>
                <p className="text-xs text-slate-500 mt-0.5">All service verticals on the platform</p>
              </div>
              <div className="divide-y divide-slate-100">
                {categories.map((cat) => (
                  <div key={cat.id} className="px-5 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{cat.icon}</span>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{cat.name}</h4>
                        <span className="text-[11px] text-slate-400">{cat.partnersCount} connected partners</span>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${cat.color}`}>
                      {cat.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===== MASTER DATA TAB ===== */}
          {activeTab === 'master-data' && (
            <div className="space-y-4">
              {/* MDM Sub-tabs */}
              <div className="flex items-center gap-2">
                {[
                  { id: 'airlines', label: 'Airlines', icon: Plane, count: mdmAirlines.length },
                  { id: 'airports', label: 'Airports', icon: MapPin, count: mdmAirports.length },
                  { id: 'aircraft', label: 'Aircraft', icon: Plane, count: mdmAircraft.length },
                ].map((t) => {
                  const Icon = t.icon;
                  return (
                    <button key={t.id} onClick={() => { setMdmTab(t.id); setMdmShowForm(false); setMdmSearch(''); }}
                      className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
                        mdmTab === t.id ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                      }`}>
                      <Icon className="w-3.5 h-3.5" /> {t.label}
                      <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                        mdmTab === t.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                      }`}>{t.count}</span>
                    </button>
                  );
                })}
              </div>

              {/* Success / Error Messages */}
              {mdmSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2 text-sm text-emerald-700">
                  <CheckCircle2 className="w-4 h-4" /> {mdmSuccess}
                </div>
              )}

              {/* MDM Add/Edit Form */}
              {mdmShowForm && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="bg-indigo-600 px-5 py-3 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">{mdmEditingId ? 'Edit' : 'Add New'} {mdmTab === 'airlines' ? 'Airline' : mdmTab === 'airports' ? 'Airport' : 'Aircraft'}</h3>
                    <button onClick={() => { setMdmShowForm(false); setMdmEditingId(null); }} className="text-white/70 hover:text-white"><X className="w-4 h-4" /></button>
                  </div>
                  <div className="p-5 space-y-4">
                    {mdmError && (
                      <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-center gap-2 text-sm text-rose-700">
                        <AlertCircle className="w-4 h-4 shrink-0" /> {mdmError}
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {mdmTab === 'airlines' && (
                        <>
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Airline Name <span className="text-rose-500">*</span></label>
                            <input type="text" value={mdmFormData.airline_name || ''} onChange={(e) => setMdmFormData({ ...mdmFormData, airline_name: e.target.value })}
                              placeholder="e.g. IndiGo" className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 outline-none" />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Airline Code (IATA) <span className="text-rose-500">*</span></label>
                            <input type="text" value={mdmFormData.airline_code || ''} onChange={(e) => setMdmFormData({ ...mdmFormData, airline_code: e.target.value })}
                              placeholder="e.g. 6E" maxLength={3} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm font-mono uppercase focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 outline-none" />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Logo URL</label>
                            <input type="url" value={mdmFormData.logo_url || ''} onChange={(e) => setMdmFormData({ ...mdmFormData, logo_url: e.target.value })}
                              placeholder="https://..." className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 outline-none" />
                          </div>
                        </>
                      )}
                      {mdmTab === 'airports' && (
                        <>
                          <div className="sm:col-span-2">
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Airport Name <span className="text-rose-500">*</span></label>
                            <input type="text" value={mdmFormData.airport_name || ''} onChange={(e) => setMdmFormData({ ...mdmFormData, airport_name: e.target.value })}
                              placeholder="e.g. Kempegowda International Airport" className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 outline-none" />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Airport Code (IATA) <span className="text-rose-500">*</span></label>
                            <input type="text" value={mdmFormData.airport_code || ''} onChange={(e) => setMdmFormData({ ...mdmFormData, airport_code: e.target.value })}
                              placeholder="e.g. BLR" maxLength={4} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm font-mono uppercase focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 outline-none" />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">City <span className="text-rose-500">*</span></label>
                            <input type="text" value={mdmFormData.city || ''} onChange={(e) => setMdmFormData({ ...mdmFormData, city: e.target.value })}
                              placeholder="e.g. Bengaluru" className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 outline-none" />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
                            <input type="text" value={mdmFormData.state || ''} onChange={(e) => setMdmFormData({ ...mdmFormData, state: e.target.value })}
                              placeholder="e.g. Karnataka" className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 outline-none" />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Country</label>
                            <input type="text" value={mdmFormData.country || 'India'} onChange={(e) => setMdmFormData({ ...mdmFormData, country: e.target.value })}
                              placeholder="India" className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 outline-none" />
                          </div>
                        </>
                      )}
                      {mdmTab === 'aircraft' && (
                        <>
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Aircraft Name <span className="text-rose-500">*</span></label>
                            <input type="text" value={mdmFormData.aircraft_name || ''} onChange={(e) => setMdmFormData({ ...mdmFormData, aircraft_name: e.target.value })}
                              placeholder="e.g. Airbus A320neo" className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 outline-none" />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Aircraft Code <span className="text-rose-500">*</span></label>
                            <input type="text" value={mdmFormData.aircraft_code || ''} onChange={(e) => setMdmFormData({ ...mdmFormData, aircraft_code: e.target.value })}
                              placeholder="e.g. A320N" className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm font-mono uppercase focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 outline-none" />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Manufacturer</label>
                            <input type="text" value={mdmFormData.manufacturer || ''} onChange={(e) => setMdmFormData({ ...mdmFormData, manufacturer: e.target.value })}
                              placeholder="e.g. Airbus" className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 outline-none" />
                          </div>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                      <button onClick={mdmSave} disabled={mdmSaving}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 shadow-sm">
                        {mdmSaving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        {mdmSaving ? 'Saving...' : (mdmEditingId ? 'Update' : 'Add Record')}
                      </button>
                      <button onClick={() => { setMdmShowForm(false); setMdmEditingId(null); }}
                        className="px-4 py-2.5 rounded-xl text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200">Cancel</button>
                    </div>
                  </div>
                </div>
              )}

              {/* MDM Table */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" placeholder={`Search ${mdmTab}...`} value={mdmSearch} onChange={(e) => setMdmSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                  </div>
                  {!mdmShowForm && (
                    <button onClick={mdmOpenAdd}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shrink-0">
                      <Plus className="w-3.5 h-3.5" /> Add {mdmTab === 'airlines' ? 'Airline' : mdmTab === 'airports' ? 'Airport' : 'Aircraft'}
                    </button>
                  )}
                </div>

                {mdmLoading ? (
                  <div className="py-12 text-center">
                    <div className="inline-flex items-center gap-2 text-sm text-slate-500">
                      <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                      Loading master data...
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    {/* Airlines Table */}
                    {mdmTab === 'airlines' && (
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100">
                            <th className="py-3 px-5 text-[11px] font-semibold text-slate-400 uppercase">Airline</th>
                            <th className="py-3 px-5 text-[11px] font-semibold text-slate-400 uppercase">Code</th>
                            <th className="py-3 px-5 text-[11px] font-semibold text-slate-400 uppercase">Status</th>
                            <th className="py-3 px-5 text-[11px] font-semibold text-slate-400 uppercase">Created</th>
                            <th className="py-3 px-5 text-[11px] font-semibold text-slate-400 uppercase">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {mdmAirlines
                            .filter(a => !mdmSearch || (a.airline_name || '').toLowerCase().includes(mdmSearch.toLowerCase()) || (a.airline_code || '').toLowerCase().includes(mdmSearch.toLowerCase()))
                            .map((airline) => (
                            <tr key={airline.id} className={`hover:bg-slate-50 transition ${!airline.is_active ? 'opacity-50' : ''}`}>
                              <td className="py-3 px-5">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                                    <Plane className="w-4 h-4 text-indigo-600" />
                                  </div>
                                  <span className="text-sm font-semibold text-slate-900">{airline.airline_name}</span>
                                </div>
                              </td>
                              <td className="py-3 px-5"><span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">{airline.airline_code}</span></td>
                              <td className="py-3 px-5">
                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${airline.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                  {airline.is_active ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td className="py-3 px-5 text-xs text-slate-400">{airline.created_at ? new Date(airline.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</td>
                              <td className="py-3 px-5">
                                <div className="flex items-center gap-1.5">
                                  <button onClick={() => mdmOpenEdit(airline)} className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50" title="Edit">
                                    <Pencil className="w-3 h-3" />
                                  </button>
                                  <button onClick={() => mdmToggleActive(airline)} className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50" title={airline.is_active ? 'Deactivate' : 'Activate'}>
                                    {airline.is_active ? <ToggleRight className="w-3.5 h-3.5 text-emerald-600" /> : <ToggleLeft className="w-3.5 h-3.5 text-slate-400" />}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                          {mdmAirlines.length === 0 && (
                            <tr><td colSpan={5} className="py-8 text-center text-sm text-slate-400">No airlines found. Run the MDM migration first.</td></tr>
                          )}
                        </tbody>
                      </table>
                    )}

                    {/* Airports Table */}
                    {mdmTab === 'airports' && (
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100">
                            <th className="py-3 px-5 text-[11px] font-semibold text-slate-400 uppercase">Airport</th>
                            <th className="py-3 px-5 text-[11px] font-semibold text-slate-400 uppercase">Code</th>
                            <th className="py-3 px-5 text-[11px] font-semibold text-slate-400 uppercase">City</th>
                            <th className="py-3 px-5 text-[11px] font-semibold text-slate-400 uppercase">State</th>
                            <th className="py-3 px-5 text-[11px] font-semibold text-slate-400 uppercase">Status</th>
                            <th className="py-3 px-5 text-[11px] font-semibold text-slate-400 uppercase">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {mdmAirports
                            .filter(a => !mdmSearch || (a.airport_name || '').toLowerCase().includes(mdmSearch.toLowerCase()) || (a.airport_code || '').toLowerCase().includes(mdmSearch.toLowerCase()) || (a.city || '').toLowerCase().includes(mdmSearch.toLowerCase()))
                            .map((airport) => (
                            <tr key={airport.id} className={`hover:bg-slate-50 transition ${!airport.is_active ? 'opacity-50' : ''}`}>
                              <td className="py-3 px-5">
                                <div className="text-sm font-semibold text-slate-900">{airport.airport_name}</div>
                              </td>
                              <td className="py-3 px-5"><span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">{airport.airport_code}</span></td>
                              <td className="py-3 px-5 text-xs font-medium text-slate-700">{airport.city}</td>
                              <td className="py-3 px-5 text-xs text-slate-500">{airport.state || '—'}</td>
                              <td className="py-3 px-5">
                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${airport.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                  {airport.is_active ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td className="py-3 px-5">
                                <div className="flex items-center gap-1.5">
                                  <button onClick={() => mdmOpenEdit(airport)} className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50" title="Edit">
                                    <Pencil className="w-3 h-3" />
                                  </button>
                                  <button onClick={() => mdmToggleActive(airport)} className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50" title={airport.is_active ? 'Deactivate' : 'Activate'}>
                                    {airport.is_active ? <ToggleRight className="w-3.5 h-3.5 text-emerald-600" /> : <ToggleLeft className="w-3.5 h-3.5 text-slate-400" />}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                          {mdmAirports.length === 0 && (
                            <tr><td colSpan={6} className="py-8 text-center text-sm text-slate-400">No airports found. Run the MDM migration first.</td></tr>
                          )}
                        </tbody>
                      </table>
                    )}

                    {/* Aircraft Table */}
                    {mdmTab === 'aircraft' && (
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100">
                            <th className="py-3 px-5 text-[11px] font-semibold text-slate-400 uppercase">Aircraft</th>
                            <th className="py-3 px-5 text-[11px] font-semibold text-slate-400 uppercase">Code</th>
                            <th className="py-3 px-5 text-[11px] font-semibold text-slate-400 uppercase">Manufacturer</th>
                            <th className="py-3 px-5 text-[11px] font-semibold text-slate-400 uppercase">Status</th>
                            <th className="py-3 px-5 text-[11px] font-semibold text-slate-400 uppercase">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {mdmAircraft
                            .filter(a => !mdmSearch || (a.aircraft_name || '').toLowerCase().includes(mdmSearch.toLowerCase()) || (a.aircraft_code || '').toLowerCase().includes(mdmSearch.toLowerCase()) || (a.manufacturer || '').toLowerCase().includes(mdmSearch.toLowerCase()))
                            .map((ac) => (
                            <tr key={ac.id} className={`hover:bg-slate-50 transition ${!ac.is_active ? 'opacity-50' : ''}`}>
                              <td className="py-3 px-5">
                                <span className="text-sm font-semibold text-slate-900">{ac.aircraft_name}</span>
                              </td>
                              <td className="py-3 px-5"><span className="text-xs font-mono font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded">{ac.aircraft_code}</span></td>
                              <td className="py-3 px-5 text-xs font-medium text-slate-700">{ac.manufacturer || '—'}</td>
                              <td className="py-3 px-5">
                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${ac.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                  {ac.is_active ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td className="py-3 px-5">
                                <div className="flex items-center gap-1.5">
                                  <button onClick={() => mdmOpenEdit(ac)} className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50" title="Edit">
                                    <Pencil className="w-3 h-3" />
                                  </button>
                                  <button onClick={() => mdmToggleActive(ac)} className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50" title={ac.is_active ? 'Deactivate' : 'Activate'}>
                                    {ac.is_active ? <ToggleRight className="w-3.5 h-3.5 text-emerald-600" /> : <ToggleLeft className="w-3.5 h-3.5 text-slate-400" />}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                          {mdmAircraft.length === 0 && (
                            <tr><td colSpan={5} className="py-8 text-center text-sm text-slate-400">No aircraft found. Run the MDM migration first.</td></tr>
                          )}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}

                {/* Footer */}
                <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-500">
                  {mdmTab === 'airlines' && `${mdmAirlines.length} airlines`}
                  {mdmTab === 'airports' && `${mdmAirports.length} airports`}
                  {mdmTab === 'aircraft' && `${mdmAircraft.length} aircraft`}
                  {' '} &middot; Master data is centrally managed and used across all provider forms
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Rejection Reason Modal */}
        {rejectionModal.open && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
              <h3 className="text-lg font-bold text-slate-900">Reject Booking</h3>
              <p className="text-sm text-slate-500">Please provide a reason for rejecting this booking. The customer will receive an email with this reason.</p>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter rejection reason..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none resize-none"
              />
              <div className="flex items-center gap-3 justify-end">
                <button
                  onClick={() => { setRejectionModal({ open: false, bookingId: null }); setRejectionReason(''); }}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectBooking}
                  className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-rose-600 hover:bg-rose-700"
                >
                  Reject & Send Email
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
