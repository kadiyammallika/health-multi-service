'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Leaf,
  Activity,
  Heart,
  Shield,
  Apple,
  Smile,
  Zap,
  Star,
  Calendar,
  Clock,
  Video,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  UserCheck,
  Stethoscope
} from 'lucide-react';
import { WELLNESS_CATEGORIES, SAMPLE_PRACTITIONERS } from '@/data/wellnessData';
import { saveWellnessAppointment, getWellnessAppointments } from '@/services/storage';

export default function WellnessPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPractitioner, setSelectedPractitioner] = useState(null);

  // Booking drawer / modal form
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('Tomorrow');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [patientName, setPatientName] = useState('Alex Morgan');
  const [patientEmail, setPatientEmail] = useState('alex.morgan@example.com');
  const [patientPhone, setPatientPhone] = useState('+91 98765 43210');
  const [healthNotes, setHealthNotes] = useState('Seeking holistic assessment for stress relief and chronic inflammation.');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Already booked slots from storage to prevent duplicates
  const [existingAppointments, setExistingAppointments] = useState([]);

  useEffect(() => {
    setExistingAppointments(getWellnessAppointments());
    const sync = () => setExistingAppointments(getWellnessAppointments());
    window.addEventListener('auralife_storage_update', sync);
    return () => window.removeEventListener('auralife_storage_update', sync);
  }, []);

  const filteredPractitioners = SAMPLE_PRACTITIONERS.filter((p) => {
    return selectedCategory === 'all' || p.category === selectedCategory;
  });

  const handleOpenBooking = (practitioner) => {
    setSelectedPractitioner(practitioner);
    setSelectedDate(practitioner.availableDates[0] || 'Tomorrow');
    setSelectedSlot(practitioner.availableSlots[0] || '10:00 AM');
    setErrorMessage('');
    setSubmitSuccess(null);
    setIsBookingModalOpen(true);
  };

  const isSlotBooked = (date, slot) => {
    if (!selectedPractitioner) return false;
    return existingAppointments.some(
      (a) =>
        a.practitionerId === selectedPractitioner.id &&
        a.date === date &&
        a.timeSlot === slot &&
        a.status !== 'Declined' &&
        a.status !== 'Cancelled'
    );
  };

  const handleAppointmentSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const newApt = saveWellnessAppointment({
        practitionerId: selectedPractitioner.id,
        practitionerName: selectedPractitioner.name,
        category: selectedPractitioner.category,
        specialization: selectedPractitioner.specialization,
        patientName,
        patientEmail,
        patientPhone,
        date: selectedDate,
        timeSlot: selectedSlot,
        consultationMode: selectedPractitioner.consultationMode,
        duration: selectedPractitioner.duration,
        price: selectedPractitioner.price,
        notes: healthNotes,
      });

      setIsSubmitting(false);
      setSubmitSuccess(newApt);
    } catch (err) {
      setIsSubmitting(false);
      setErrorMessage(err.message || 'Error booking appointment slot.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Hero */}
        <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden">
          <div className="max-w-2xl relative z-10 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Certified Alternative & Integrative Practitioners</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Holistic Wellness & Alternative Therapies
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Book consultations with vetted Ayurvedic MDs, master yoga instructors, clinical nutritionists, and holistic therapists. Requests are submitted directly to the healer for verification and approval.
            </p>
          </div>
        </div>

        {/* Therapy Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {WELLNESS_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition shrink-0 flex items-center gap-2 ${
                selectedCategory === cat.id
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Practitioners Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPractitioners.map((prac) => (
            <div
              key={prac.id}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-lg transition flex flex-col justify-between"
            >
              <div>
                {/* Avatar & Specialization Header */}
                <div className="flex items-center gap-3.5 mb-4">
                  <img
                    src={prac.avatar}
                    alt={prac.name}
                    className="w-16 h-16 rounded-2xl object-cover border border-slate-200"
                  />
                  <div>
                    <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{prac.rating}</span>
                      <span className="text-slate-400 font-normal">({prac.reviewsCount} reviews)</span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-base">{prac.name}</h3>
                    <p className="text-xs text-teal-600 font-medium">{prac.specialization}</p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
                  {prac.about}
                </p>

                {/* Badges / Credentials */}
                <div className="space-y-1.5 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-600">
                  <div className="font-medium text-[11px] text-slate-500">🎓 {prac.qualifications}</div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span>⏱️ Duration: <strong>{prac.duration}</strong></span>
                    <span>📍 Mode: <strong>{prac.consultationMode}</strong></span>
                  </div>
                </div>

                {/* Upcoming Slots Preview */}
                <div className="mt-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Next Available Timings
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {prac.availableSlots.slice(0, 3).map((slot, i) => (
                      <span key={i} className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-teal-50 text-teal-700">
                        {slot}
                      </span>
                    ))}
                    <span className="text-[10px] text-slate-400 self-center">+{prac.availableSlots.length - 3} more</span>
                  </div>
                </div>
              </div>

              {/* Fee & Action */}
              <div className="pt-5 mt-5 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Consultation Fee</span>
                  <div className="text-xl font-black text-slate-900">₹{prac.price}</div>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenBooking(prac)}
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 transition flex items-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Request Session</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* APPOINTMENT REQUEST MODAL */}
      {isBookingModalOpen && selectedPractitioner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-teal-900 to-slate-900 text-white">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-teal-500/20 rounded-xl">
                  <Sparkles className="w-5 h-5 text-teal-300" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Request Wellness Session</h3>
                  <p className="text-xs text-teal-200">{selectedPractitioner.name}</p>
                </div>
              </div>
              <button
                onClick={() => setIsBookingModalOpen(false)}
                className="text-slate-300 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {submitSuccess ? (
                <div className="text-center py-6 space-y-4">
                  <div className="w-16 h-16 mx-auto bg-amber-100 text-amber-600 rounded-full flex items-center justify-center animate-bounce">
                    <Clock className="w-9 h-9" />
                  </div>
                  <div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-amber-50 text-amber-700 border border-amber-200">
                      Status: Pending Practitioner Acceptance
                    </span>
                    <h3 className="text-xl font-bold text-slate-900 mt-2">Appointment Request Submitted!</h3>
                    <p className="text-xs text-slate-600 max-w-md mx-auto mt-1">
                      Your request has been routed directly to {selectedPractitioner.name}. You can switch to the <strong>Provider Persona</strong> on the top bar to simulate accepting or declining this request!
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-left space-y-1">
                    <div><strong>Appointment ID:</strong> {submitSuccess.id}</div>
                    <div><strong>Date & Time:</strong> {submitSuccess.date} at {submitSuccess.timeSlot}</div>
                    <div><strong>Patient:</strong> {submitSuccess.patientName}</div>
                    <div><strong>Session Fee:</strong> ₹{submitSuccess.price} (Payable upon confirmation)</div>
                  </div>

                  <div className="flex justify-center gap-3 pt-2">
                    <button
                      onClick={() => setIsBookingModalOpen(false)}
                      className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold"
                    >
                      Close Window
                    </button>
                    <Link
                      href="/dashboard/customer"
                      className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs"
                    >
                      View in My Dashboard
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleAppointmentSubmit} className="space-y-4">
                  {errorMessage && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* Date Selection */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Select Preferred Date</label>
                    <div className="flex flex-wrap gap-2">
                      {selectedPractitioner.availableDates.map((date) => (
                        <button
                          key={date}
                          type="button"
                          onClick={() => setSelectedDate(date)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                            selectedDate === date
                              ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {date}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Slot Selection */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Select Time Slot</label>
                    <div className="grid grid-cols-3 gap-2">
                      {selectedPractitioner.availableSlots.map((slot) => {
                        const booked = isSlotBooked(selectedDate, slot);
                        const isSelected = selectedSlot === slot;
                        return (
                          <button
                            key={slot}
                            type="button"
                            disabled={booked}
                            onClick={() => setSelectedSlot(slot)}
                            className={`p-2 rounded-xl text-xs font-semibold border transition flex flex-col items-center justify-center ${
                              booked
                                ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through'
                                : isSelected
                                ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-teal-50'
                            }`}
                          >
                            <span>{slot}</span>
                            <span className="text-[9px] opacity-75">{booked ? 'Unavailable' : 'Available'}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Patient Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Email</label>
                      <input
                        type="email"
                        value={patientEmail}
                        onChange={(e) => setPatientEmail(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Health Concern / Notes for Healer</label>
                    <textarea
                      rows={2}
                      value={healthNotes}
                      onChange={(e) => setHealthNotes(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800"
                    />
                  </div>

                  {/* Summary row */}
                  <div className="p-3 bg-teal-50/70 rounded-xl border border-teal-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-500">Session Charge:</span>
                      <strong className="text-teal-900 text-sm ml-1">₹{selectedPractitioner.price}</strong>
                    </div>
                    <span className="text-[10px] text-teal-700 font-semibold">
                      Initial Status: ⏳ Pending Verification
                    </span>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsBookingModalOpen(false)}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-md transition"
                    >
                      {isSubmitting ? 'Submitting...' : 'Send Appointment Request'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
