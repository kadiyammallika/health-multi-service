'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  Plane,
  Bus,
  Building2,
  Sparkles,
  Home,
  CheckCircle2,
  Upload,
  ShieldCheck,
  ArrowRight,
  Clock
} from 'lucide-react';
import { savePartnerApplication } from '@/services/storage';

export default function PartnerRegisterPage() {
  const [category, setCategory] = useState('wellness');
  const [businessName, setBusinessName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [yearsInBusiness, setYearsInBusiness] = useState(4);
  const [address, setAddress] = useState('');
  const [specialization, setSpecialization] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedPartner, setSubmittedPartner] = useState(null);

  const categories = [
    { id: 'travel', name: 'Aviation & Flight Partner', icon: Plane, color: 'text-indigo-600' },
    { id: 'bus', name: 'Bus Operator Partner', icon: Bus, color: 'text-amber-600' },
    { id: 'hotel', name: 'Hotel & Luxury Stay Partner', icon: Building2, color: 'text-emerald-600' },
    { id: 'wellness', name: 'Wellness & Holistic Healer', icon: Sparkles, color: 'text-teal-600' },
    { id: 'property', name: 'Property Agent & Realty', icon: Home, color: 'text-rose-600' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const categoryObj = categories.find((c) => c.id === category);

    const newPartner = savePartnerApplication({
      businessName,
      category,
      categoryLabel: categoryObj?.name || 'Partner',
      contactPerson,
      email,
      phone,
      licenseNumber,
      yearsInBusiness,
      address,
      specialization,
      documentsUploaded: ['Gov_Registration_Cert.pdf', 'Tax_GST_Compliance.pdf']
    });

    setIsSubmitting(false);
    setSubmittedPartner(newPartner);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-bold">
            <Briefcase className="w-3.5 h-3.5" />
            <span>AuraLife Partner Onboarding Portal</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Partner With AuraLife
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
            Expand your customer reach by joining our unified digital marketplace. Travel operators, hoteliers, alternative health practitioners, and realty agents can list verified services.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xl">
          {submittedPartner ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 mx-auto bg-amber-100 text-amber-600 rounded-full flex items-center justify-center animate-bounce">
                <Clock className="w-9 h-9" />
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-amber-50 text-amber-700 border border-amber-200">
                Application Submitted: Pending Verification
              </span>
              <h2 className="text-2xl font-bold text-slate-900 mt-2">Welcome, {submittedPartner.businessName}!</h2>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                Your partnership registration has been submitted with reference ID <strong>{submittedPartner.id}</strong>.
                Our administration compliance team has received your documents. You can switch to the <strong>Administrator Persona</strong> in the top bar to review and approve this registration!
              </p>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-left max-w-md mx-auto space-y-1">
                <div><strong>Business Name:</strong> {submittedPartner.businessName}</div>
                <div><strong>Vertical:</strong> {submittedPartner.categoryLabel}</div>
                <div><strong>License:</strong> {submittedPartner.licenseNumber}</div>
                <div><strong>Status:</strong> {submittedPartner.status}</div>
              </div>

              <div className="flex justify-center gap-3 pt-3">
                <Link
                  href="/dashboard/admin"
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition"
                >
                  Go to Admin Verification
                </Link>
                <Link
                  href="/"
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition"
                >
                  Return to Home
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Category Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Select Your Service Category</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {categories.map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id)}
                        className={`p-3 rounded-2xl border text-xs font-bold transition flex items-center gap-2.5 text-left ${
                          category === cat.id
                            ? 'border-teal-600 bg-teal-50 text-teal-900 shadow-xs'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className={`w-4 h-4 shrink-0 ${cat.color}`} />
                        <span>{cat.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Form Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Business / Clinic / Agency Name
                  </label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Lotus Wellness Studio"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Authorized Contact Person
                  </label>
                  <input
                    type="text"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="e.g. Dr. Priya Nair"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Official Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="partner@business.com"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Mobile / Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 00000"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    License / Council Registration Number
                  </label>
                  <input
                    type="text"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    placeholder="e.g. AYUSH-DL-2023-401"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Years in Operation</label>
                  <input
                    type="number"
                    value={yearsInBusiness}
                    onChange={(e) => setYearsInBusiness(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Registered Business Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Suite 402, Indiranagar 100ft Rd, Bengaluru"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800"
                  required
                />
              </div>

              {/* Upload Simulation */}
              <div className="p-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 text-center space-y-2">
                <Upload className="w-8 h-8 text-slate-400 mx-auto" />
                <div className="text-xs font-bold text-slate-700">Attach Professional Verification Documents</div>
                <p className="text-[11px] text-slate-400">
                  Simulated upload: AYUSH registration certificate, STA travel license, or GST compliance PDF
                </p>
                <span className="inline-block px-3 py-1 bg-white border border-slate-200 text-slate-600 rounded-lg text-[10px] font-mono">
                  Gov_Registration_Certificate.pdf (Pre-attached)
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md shadow-teal-600/30 transition flex items-center justify-center gap-2"
              >
                <span>Submit Partner Registration</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
