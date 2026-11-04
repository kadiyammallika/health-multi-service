'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Stethoscope,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Users,
  ShieldCheck,
  TrendingUp,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Home,
  Building2,
  MessageSquare,
  FileCheck
} from 'lucide-react';
import {
  getCurrentUser,
  getWellnessAppointments,
  updateWellnessAppointmentStatus,
  getPropertyEnquiries,
  getBookings
} from '@/services/storage';
import Badge from '@/components/ui/Badge';

export default function ProviderDashboardPage() {
  const [activeTab, setActiveTab] = useState('appointments'); // 'appointments', 'enquiries', 'availability', 'profile'
  const [appointments, setAppointments] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  // Availability toggle state
  const [isAcceptingBookings, setIsAcceptingBookings] = useState(true);
  const [selectedSlotStatus, setSelectedSlotStatus] = useState({
    '10:00 AM': true,
    '11:30 AM': true,
    '03:00 PM': true,
    '04:30 PM': false,
    '06:00 PM': true
  });

  const sync = () => {
    setCurrentUser(getCurrentUser());
    setAppointments(getWellnessAppointments());
    setEnquiries(getPropertyEnquiries());
  };

  useEffect(() => {
    sync();
    window.addEventListener('auralife_storage_update', sync);
    return () => window.removeEventListener('auralife_storage_update', sync);
  }, []);

  const handleAcceptAppointment = (aptId) => {
    updateWellnessAppointmentStatus(aptId, 'Confirmed');
    sync();
  };

  const handleDeclineAppointment = (aptId) => {
    updateWellnessAppointmentStatus(aptId, 'Declined');
    sync();
  };

  const pendingAppointments = appointments.filter((a) => a.status === 'Pending');
  const confirmedAppointments = appointments.filter((a) => a.status === 'Confirmed');

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Provider Profile Banner */}
        <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=200&q=80"
              alt="Dr. Aarav Patel"
              className="w-16 h-16 rounded-2xl object-cover border-2 border-teal-400/40"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-white">Dr. Aarav Patel, BAMS, MD</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-400/30">
                  Verified Healer
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">Zenith Ayurvedic & Holistic Healing • Reg # AYUSH-2018-994</p>
              <div className="text-[11px] text-teal-300 mt-1">Specialization: Ayurvedic Medicine & Panchakarma Detox</div>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/10 px-4 py-2.5 rounded-2xl border border-white/10 text-xs">
            <span>Accepting New Appointments:</span>
            <button
              onClick={() => setIsAcceptingBookings(!isAcceptingBookings)}
              className="font-bold flex items-center gap-1 text-teal-300"
            >
              {isAcceptingBookings ? (
                <>
                  <ToggleRight className="w-6 h-6 text-emerald-400" />
                  <span>ONLINE</span>
                </>
              ) : (
                <>
                  <ToggleLeft className="w-6 h-6 text-slate-400" />
                  <span>PAUSED</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 text-xs font-bold">
          <button
            onClick={() => setActiveTab('appointments')}
            className={`px-4 py-2.5 rounded-xl transition shrink-0 flex items-center gap-2 ${
              activeTab === 'appointments' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600 hover:bg-white'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Appointment Requests ({pendingAppointments.length} Pending)</span>
          </button>
          <button
            onClick={() => setActiveTab('enquiries')}
            className={`px-4 py-2.5 rounded-xl transition shrink-0 flex items-center gap-2 ${
              activeTab === 'enquiries' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600 hover:bg-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Property & Client Leads ({enquiries.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('availability')}
            className={`px-4 py-2.5 rounded-xl transition shrink-0 flex items-center gap-2 ${
              activeTab === 'availability' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600 hover:bg-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Schedule & Slot Management</span>
          </button>
        </div>

        {/* METRICS ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
            <span className="text-xs font-semibold text-slate-400 uppercase">Pending Requests</span>
            <div className="text-3xl font-black text-amber-600 mt-2">{pendingAppointments.length}</div>
            <p className="text-[11px] text-slate-500 mt-1">Requires your Accept or Decline action</p>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
            <span className="text-xs font-semibold text-slate-400 uppercase">Confirmed Sessions</span>
            <div className="text-3xl font-black text-emerald-600 mt-2">{confirmedAppointments.length}</div>
            <p className="text-[11px] text-slate-500 mt-1">Active tele-health & clinic sessions</p>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
            <span className="text-xs font-semibold text-slate-400 uppercase">Estimated Practitioner Payout</span>
            <div className="text-3xl font-black text-teal-600 mt-2">
              ₹{(confirmedAppointments.length * 1200).toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Simulated escrow disbursement</p>
          </div>
        </div>

        {/* TAB 1: APPOINTMENTS MANAGEMENT (ACCEPT / DECLINE ACTIONS) */}
        {activeTab === 'appointments' && (
          <div className="space-y-6">
            {/* Pending Requests Section */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
                  <h3 className="text-base font-bold text-slate-900">
                    Incoming Session Requests (Requires Immediate Action)
                  </h3>
                </div>
                <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md">
                  {pendingAppointments.length} Pending
                </span>
              </div>

              {pendingAppointments.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  No pending appointment requests right now. (Go to the Wellness page as Customer to submit a test request!)
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingAppointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="p-5 rounded-2xl bg-amber-50/50 border border-amber-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-amber-800">{apt.id}</span>
                          <span className="text-slate-300">•</span>
                          <span className="font-bold text-slate-900">{apt.patientName}</span>
                          <Badge status={apt.status} size="sm" />
                        </div>
                        <p className="text-slate-600">
                          Date: <strong>{apt.date}</strong> | Slot: <strong>{apt.timeSlot}</strong> ({apt.duration})
                        </p>
                        <p className="text-slate-500">
                          Mode: {apt.consultationMode} • Phone: {apt.patientPhone}
                        </p>
                        {apt.notes && (
                          <div className="p-2 bg-white rounded-lg border border-amber-100 text-slate-600 italic mt-1">
                            Patient Health Query: "{apt.notes}"
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                        <button
                          type="button"
                          onClick={() => handleAcceptAppointment(apt.id)}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Accept Request</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeclineAppointment(apt.id)}
                          className="px-3.5 py-2 rounded-xl bg-white border border-rose-300 text-rose-600 hover:bg-rose-50 font-bold text-xs transition flex items-center gap-1.5"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Decline</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Confirmed Sessions Ledger */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                Confirmed Consultations ({confirmedAppointments.length})
              </h3>
              <div className="space-y-3">
                {confirmedAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-500">{apt.id}</span>
                        <span className="font-bold text-slate-900">{apt.patientName}</span>
                        <Badge status="Confirmed" size="sm" />
                      </div>
                      <div className="text-slate-500 mt-0.5">
                        {apt.date} at {apt.timeSlot} • Mode: {apt.consultationMode}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-bold text-slate-900">₹{apt.price}</div>
                      <span className="text-[10px] text-emerald-600 font-semibold">Active Session</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PROPERTY LEADS (For Real Estate Partners) */}
        {activeTab === 'enquiries' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Client Enquiries & Site Visits ({enquiries.length})
            </h3>
            <div className="space-y-3 text-xs">
              {enquiries.map((enq) => (
                <div key={enq.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-mono font-bold text-rose-600">{enq.id}</span>
                      <h4 className="font-bold text-slate-900 text-sm mt-0.5">{enq.propertyTitle}</h4>
                      <p className="text-slate-500">{enq.propertyLocation} ({enq.priceDisplay})</p>
                    </div>
                    <Badge status={enq.status || 'Received'} size="sm" />
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-slate-700">
                    <div>Client: <strong>{enq.clientName}</strong> ({enq.clientPhone})</div>
                    <div>Requested: <strong>{enq.preferredDate} ({enq.preferredTime})</strong></div>
                    {enq.message && <div className="italic text-slate-500 mt-1">"{enq.message}"</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: AVAILABILITY & SLOTS */}
        {activeTab === 'availability' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Daily Consultation Time Slots</h3>
              <p className="text-xs text-slate-500">Toggle slot availability for upcoming patient appointments</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(selectedSlotStatus).map(([slot, isOpen]) => (
                <div
                  key={slot}
                  className={`p-4 rounded-2xl border flex items-center justify-between text-xs transition ${
                    isOpen ? 'border-teal-300 bg-teal-50/50' : 'border-slate-200 bg-slate-50 opacity-60'
                  }`}
                >
                  <div>
                    <span className="font-bold text-slate-900 text-sm block">{slot}</span>
                    <span className="text-[10px] text-slate-500">{isOpen ? 'Available for Booking' : 'Slot Blocked'}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setSelectedSlotStatus({
                        ...selectedSlotStatus,
                        [slot]: !isOpen
                      })
                    }
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                      isOpen ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {isOpen ? 'Open' : 'Blocked'}
                  </button>
                </div>
              ))}
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-1">
              <strong>💡 Integration Note:</strong>
              <p>Slot toggles dynamically alter real-time slot selection on the customer wellness booking page.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
