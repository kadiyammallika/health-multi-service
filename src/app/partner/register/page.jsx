'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Briefcase, Plane, Bus, Building2, Sparkles, Home,
  Clock, ArrowRight, AlertCircle, Mail, ShieldCheck, RefreshCw,
  CheckCircle2
} from 'lucide-react';
import { registerProviderWithApi } from '@/services/storage';

export default function PartnerRegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full" /></div>}>
      <PartnerRegisterContent />
    </Suspense>
  );
}

function PartnerRegisterContent() {
  const searchParams = useSearchParams();

  // Steps: 'email' → 'waiting' (magic link) or 'otp' (6-digit code) → 'form' → 'submitted'
  const [step, setStep] = useState('email');
  const [verifyMethod, setVerifyMethod] = useState(''); // 'magic_link' or 'otp'

  // Email & OTP
  const [email, setEmail] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  // devOtp removed — codes are sent via email only
  const [emailError, setEmailError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const otpRefs = useRef([]);

  // Form fields
  const [selectedServices, setSelectedServices] = useState([]);
  const [businessName, setBusinessName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [yearsInBusiness, setYearsInBusiness] = useState(4);
  const [address, setAddress] = useState('');
  const [specialization, setSpecialization] = useState('');

  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedPartner, setSubmittedPartner] = useState(null);

  // Check if user came back from Supabase magic link (#access_token=...)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const hash = window.location.hash;
    if (hash && hash.includes('access_token')) {
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get('access_token');
      if (accessToken) {
        try {
          const payload = JSON.parse(atob(accessToken.split('.')[1]));
          if (payload.email) {
            setEmail(payload.email);
            setStep('form');
            window.history.replaceState(null, '', '/partner/register');
            return;
          }
        } catch (e) {
          console.error('Token parse error:', e);
        }
      }
    }

    // Check query param fallback
    const verified = searchParams.get('verified');
    const emailParam = searchParams.get('email');
    if (verified === 'true' && emailParam) {
      setEmail(decodeURIComponent(emailParam));
      setStep('form');
    }
  }, [searchParams]);

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  const serviceOptions = [
    { id: 'flights', name: 'Flights', desc: 'Airline tickets & aviation', icon: Plane, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-300', activeBg: 'bg-indigo-100' },
    { id: 'hotels', name: 'Hotels', desc: 'Stays & accommodation', icon: Building2, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-300', activeBg: 'bg-emerald-100' },
    { id: 'buses', name: 'Buses', desc: 'Bus travel & transport', icon: Bus, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-300', activeBg: 'bg-amber-100' },
    { id: 'wellness', name: 'Health & Healing', desc: 'Health & healing services', icon: Sparkles, color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-300', activeBg: 'bg-teal-100' },
    { id: 'properties', name: 'Properties', desc: 'Real estate & rentals', icon: Home, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-300', activeBg: 'bg-rose-100' },
  ];

  const toggleService = (serviceId) => {
    setSelectedServices(prev =>
      prev.includes(serviceId)
        ? prev.filter(s => s !== serviceId)
        : [...prev, serviceId]
    );
  };

  // Send verification email
  const handleSendEmail = async () => {
    if (!email || !email.includes('@') || !email.includes('.')) {
      setEmailError('Please enter a valid email address.');
      return;
    }
    setEmailError('');
    setLoading(true);

    try {
      const res = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setEmailError(data.error || 'Failed to send verification email.');
        setLoading(false);
        return;
      }

      setResendTimer(60);
      setVerifyMethod('otp');
      setStep('otp');
    } catch (err) {
      setEmailError('Network error. Please try again.');
    }
    setLoading(false);
  };

  // Handle OTP input
  const handleOtpChange = (idx, value) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...otpDigits];
    newDigits[idx] = value.slice(-1);
    setOtpDigits(newDigits);
    if (value && idx < 5) otpRefs.current[idx + 1]?.focus();
  };

  const handleOtpKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !otpDigits[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (paste.length === 6) {
      setOtpDigits(paste.split(''));
      otpRefs.current[5]?.focus();
    }
  };

  // Verify 6-digit OTP
  const handleVerifyOtp = async () => {
    const otp = otpDigits.join('');
    if (otp.length !== 6) {
      setOtpError('Please enter all 6 digits.');
      return;
    }
    setOtpError('');
    setLoading(true);

    try {
      const res = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), otp }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setOtpError(data.error || 'Invalid verification code.');
        setLoading(false);
        return;
      }

      setStep('form');
    } catch (err) {
      setOtpError('Network error. Please try again.');
    }
    setLoading(false);
  };

  // Submit registration
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }
    if (selectedServices.length === 0) {
      setErrorMessage('Please select at least one service you will provide.');
      return;
    }

    setIsSubmitting(true);
    const serviceLabels = selectedServices.map(s => serviceOptions.find(o => o.id === s)?.name).join(', ');

    const res = await registerProviderWithApi({
      businessName,
      category: selectedServices[0],
      categoryLabel: serviceLabels,
      services: selectedServices,
      contactPerson, email: email.trim(), phone, password,
      licenseNumber, yearsInBusiness, address, specialization,
    });

    setIsSubmitting(false);

    if (!res.success) {
      setErrorMessage(res.error || 'Failed to register.');
      return;
    }

    setSubmittedPartner({
      businessName,
      categoryLabel: serviceLabels,
      services: selectedServices,
      licenseNumber,
      id: res.provider?.id || 'PTR-' + Date.now(),
      status: 'Pending Verification',
    });
    setStep('submitted');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30 flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-lg space-y-6">
        {/* Logo */}
        <div className="text-center">
          <Link href="/login" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black text-slate-900">OneConnect</span>
          </Link>
          <p className="text-xs text-slate-500 mt-1">Partner Onboarding Portal</p>
        </div>

        {/* Step 1: Email Input */}
        {step === 'email' && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-lg space-y-5">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 mx-auto rounded-full bg-teal-50 flex items-center justify-center">
                <Mail className="w-7 h-7 text-teal-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Verify Your Email</h2>
              <p className="text-sm text-slate-500">Enter your business email to start registration</p>
            </div>

            {emailError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" /> {emailError}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Business Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendEmail()}
                placeholder="partner@yourbusiness.com"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
                autoFocus
              />
            </div>

            <button
              onClick={handleSendEmail}
              disabled={loading || !email}
              className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <><RefreshCw className="w-4 h-4 animate-spin" /> Sending...</>
              ) : (
                <><Mail className="w-4 h-4" /> Send Verification</>
              )}
            </button>

            <p className="text-center text-xs text-slate-500">
              Already have an account?{' '}
              <Link href="/login" className="text-teal-600 font-bold hover:underline">Sign In</Link>
            </p>
          </div>
        )}

        {/* Step 2a: Waiting for Magic Link */}
        {step === 'waiting' && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-lg space-y-5">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 mx-auto rounded-full bg-blue-50 flex items-center justify-center">
                <Mail className="w-7 h-7 text-blue-600 animate-bounce" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Check Your Email</h2>
              <p className="text-sm text-slate-500">
                We sent a verification link to
              </p>
              <p className="text-sm font-bold text-slate-800">{email}</p>
            </div>

            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold shrink-0">1</div>
                <p className="text-sm text-blue-800">Open your email inbox (check spam too)</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold shrink-0">2</div>
                <p className="text-sm text-blue-800">Click <strong>"Confirm your mail"</strong> in the email</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold shrink-0">3</div>
                <p className="text-sm text-blue-800">You'll be redirected back here automatically</p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-2">
              <button
                onClick={() => { setStep('email'); setEmailError(''); }}
                className="text-slate-500 hover:text-slate-700"
              >
                ← Change email
              </button>
              <button
                onClick={handleSendEmail}
                disabled={resendTimer > 0 || loading}
                className="text-teal-600 font-bold hover:underline disabled:opacity-50"
              >
                {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Link'}
              </button>
            </div>
          </div>
        )}

        {/* Step 2b: OTP Code Entry (fallback) */}
        {step === 'otp' && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-lg space-y-5">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 flex items-center justify-center">
                <ShieldCheck className="w-7 h-7 text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Enter Verification Code</h2>
              <p className="text-sm text-slate-500">
                We sent a 6-digit code to <strong className="text-slate-800">{email}</strong>
              </p>
            </div>

            {otpError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" /> {otpError}
              </div>
            )}

            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs text-center">
              Check your email inbox (and spam folder) for the verification code.
            </div>

            <div className="flex justify-center gap-2 sm:gap-3" onPaste={handleOtpPaste}>
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (otpRefs.current[idx] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  className="w-12 h-14 text-center text-xl font-bold border-2 border-slate-300 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition bg-slate-50"
                  autoFocus={idx === 0}
                />
              ))}
            </div>

            <button
              onClick={handleVerifyOtp}
              disabled={loading || otpDigits.join('').length < 6}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <><RefreshCw className="w-4 h-4 animate-spin" /> Verifying...</>
              ) : (
                <><ShieldCheck className="w-4 h-4" /> Verify & Continue</>
              )}
            </button>

            <div className="flex items-center justify-between text-xs">
              <button
                onClick={() => { setStep('email'); setOtpDigits(['','','','','','']); setOtpError(''); }}
                className="text-slate-500 hover:text-slate-700"
              >
                ← Change email
              </button>
              <button
                onClick={handleSendEmail}
                disabled={resendTimer > 0 || loading}
                className="text-teal-600 font-bold hover:underline disabled:opacity-50"
              >
                {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Registration Form */}
        {step === 'form' && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-lg">
            <div className="flex items-center gap-2 mb-5 p-2.5 bg-emerald-50 rounded-xl border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-emerald-700">Email verified: {email}</span>
            </div>

            <h2 className="text-xl font-bold text-slate-900 mb-1">Complete Registration</h2>
            <p className="text-xs text-slate-500 mb-5">Fill in your business details to join OneConnect</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {errorMessage}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">What services will you provide?</label>
                <p className="text-[11px] text-slate-500 mb-3">Select all services you want to offer on OneConnect</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {serviceOptions.map((svc) => {
                    const Icon = svc.icon;
                    const isSelected = selectedServices.includes(svc.id);
                    return (
                      <button key={svc.id} type="button" onClick={() => toggleService(svc.id)}
                        className={`p-3 rounded-xl border-2 text-xs transition flex items-center gap-3 text-left relative ${
                          isSelected
                            ? `${svc.border} ${svc.activeBg} ring-1 ring-offset-1 ring-current`
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}>
                        <div className={`w-9 h-9 rounded-lg ${isSelected ? svc.activeBg : svc.bg} flex items-center justify-center shrink-0`}>
                          <Icon className={`w-4.5 h-4.5 ${svc.color}`} />
                        </div>
                        <div>
                          <span className={`font-bold block ${isSelected ? 'text-slate-900' : 'text-slate-700'}`}>{svc.name}</span>
                          <span className="text-[10px] text-slate-500">{svc.desc}</span>
                        </div>
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-teal-600 flex items-center justify-center">
                            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
                {selectedServices.length > 0 && (
                  <p className="text-[11px] text-teal-600 font-semibold mt-2">
                    {selectedServices.length} service{selectedServices.length > 1 ? 's' : ''} selected
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Business Name</label>
                  <input type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Lotus Health & Healing Studio" className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Contact Person</label>
                  <input type="text" value={contactPerson} onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="e.g. Dr. Priya Nair" className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Phone Number</label>
                  <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 00000" className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">License Number</label>
                  <input type="text" value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)}
                    placeholder="e.g. AYUSH-DL-2023-401" className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Years in Operation</label>
                  <input type="number" value={yearsInBusiness} onChange={(e) => setYearsInBusiness(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Specialization</label>
                  <input type="text" value={specialization} onChange={(e) => setSpecialization(e.target.value)}
                    placeholder="e.g. Ayurvedic Medicine" className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Password</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 characters" className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Confirm Password</label>
                  <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password" className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono" required />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Business Address</label>
                <input type="text" value={address} onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Suite 402, Indiranagar, Bengaluru" className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs" required />
              </div>

              <button type="submit" disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 disabled:opacity-60">
                {isSubmitting ? 'Submitting...' : 'Submit Partner Registration'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 'submitted' && submittedPartner && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-lg text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-amber-100 text-amber-600 rounded-full flex items-center justify-center">
              <Clock className="w-9 h-9" />
            </div>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase bg-amber-50 text-amber-700 border border-amber-200">
              Application Submitted: Pending Verification
            </span>
            <h2 className="text-xl font-bold text-slate-900">Welcome, {submittedPartner.businessName}!</h2>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              Your partnership registration has been submitted. Our team will review and approve your application.
              Once approved, you can sign in to the Provider Portal!
            </p>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-left max-w-sm mx-auto space-y-1">
              <div><strong>Business:</strong> {submittedPartner.businessName}</div>
              <div><strong>Services:</strong> {submittedPartner.categoryLabel}</div>
              <div><strong>License:</strong> {submittedPartner.licenseNumber}</div>
              <div><strong>Email:</strong> {email}</div>
              <div><strong>Status:</strong> <span className="text-amber-600 font-bold">{submittedPartner.status}</span></div>
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <Link href="/login" className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md transition">
                Go to Sign In
              </Link>
              <Link href="/" className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition">
                Return to Home
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
