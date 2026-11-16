'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Sparkles,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  X,
  Clock,
  ShieldCheck,
  Heart,
  Plane,
  Hotel,
  Bus,
  Leaf
} from 'lucide-react';
import {
  loginWithApi,
  getRememberedEmail,
  setRememberedEmail
} from '@/services/storage';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');
  const [pendingMessage, setPendingMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  useEffect(() => {
    const remembered = getRememberedEmail();
    if (remembered) {
      setEmail(remembered);
      setRememberMe(true);
    }
  }, []);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setPendingMessage('');
    setIsSubmitting(true);

    setRememberedEmail(email, rememberMe);

    const result = await loginWithApi(email, password);
    setIsSubmitting(false);

    if (!result.success) {
      if (result.isPendingProvider) {
        setPendingMessage(
          result.error ||
          'Your application is currently under review. Please wait for approval before signing in.'
        );
      } else {
        setErrorMessage(result.error || 'Invalid email or password.');
      }
      return;
    }

    const targetUrl = redirectParam || result.redirectUrl || '/dashboard/customer';
    router.push(targetUrl);
  };

  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!forgotEmail || !forgotEmail.includes('@') || !forgotEmail.includes('.')) {
      setForgotError('Please enter a valid email address.');
      return;
    }
    setForgotLoading(true);
    setForgotError('');
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await res.json();
      if (!res.ok) {
        setForgotError(data.error || 'Failed to send reset email.');
        return;
      }
      setForgotSuccess(true);
    } catch {
      setForgotError('Something went wrong. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-teal-50 flex">
      {/* Left Panel - Illustration / Branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-[48%] relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-teal-600 items-center justify-center p-12">
        {/* Decorative circles */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/5 rounded-full" />
        <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-white/5 rounded-full" />
        <div className="absolute top-1/4 right-12 w-48 h-48 bg-teal-400/10 rounded-full blur-2xl" />

        <div className="relative z-10 max-w-md text-white space-y-8">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
              <Sparkles className="w-7 h-7 text-teal-200" />
            </div>
            <span className="text-3xl font-black tracking-tight">
              One<span className="text-teal-300">Connect</span>
            </span>
          </div>

          <div className="space-y-4">
            <h2 className="text-3xl font-extrabold leading-tight">
              Your gateway to<br />
              health & travel services
            </h2>
            <p className="text-indigo-200 text-sm leading-relaxed">
              Book flights, buses, hotels, health & healing sessions, and explore properties — all from one unified platform.
            </p>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-3 pt-2">
            {[
              { icon: Plane, label: 'Flights' },
              { icon: Bus, label: 'Buses' },
              { icon: Hotel, label: 'Hotels' },
              { icon: Leaf, label: 'Health & Healing' },
              { icon: Heart, label: 'Properties' },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 text-xs font-medium text-white/90"
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </div>
            ))}
          </div>

          {/* Trust badge */}
          <div className="flex items-center gap-2 pt-6 text-indigo-200 text-xs">
            <ShieldCheck className="w-4 h-4 text-teal-300" />
            <span>Trusted by thousands of users across India</span>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-[420px] space-y-7">
          {/* Mobile Logo (hidden on desktop) */}
          <div className="lg:hidden text-center">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                <Sparkles className="w-5.5 h-5.5 text-teal-200" />
              </div>
              <span className="text-2xl font-black tracking-tight text-slate-900">
                One<span className="text-indigo-600">Connect</span>
              </span>
            </Link>
          </div>

          {/* Welcome text */}
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-[28px] font-extrabold text-slate-900 tracking-tight">
              Welcome back
            </h1>
            <p className="text-sm text-slate-500">
              Sign in to your account to continue
            </p>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-[13px] flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-semibold text-sm">Sign in failed</strong>
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          {/* Pending Alert */}
          {pendingMessage && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[13px] flex items-start gap-2.5 animate-fadeIn">
              <Clock className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
              <div>
                <strong className="block font-semibold text-sm">Account under review</strong>
                <span>{pendingMessage}</span>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-[13px] font-semibold text-slate-700">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-[18px] h-[18px]" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50/80 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 focus:bg-white transition-all"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-[13px] font-semibold text-slate-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(true)}
                  className="text-[13px] text-indigo-600 hover:text-indigo-800 font-semibold transition"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-[18px] h-[18px]" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-11 pr-12 py-3 bg-slate-50/80 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 focus:bg-white transition-all"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none transition"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
                />
                <span className="text-[13px] text-slate-600">Remember me</span>
              </label>
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                Secure connection
              </span>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl text-white font-bold text-sm bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 active:scale-[0.98] shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign in</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-gradient-to-br from-indigo-50 via-white to-teal-50 lg:bg-white px-3 text-xs text-slate-400">
                New to OneConnect?
              </span>
            </div>
          </div>

          {/* Registration Links */}
          <div className="space-y-3">
            <Link
              href="/register"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-sm font-semibold text-slate-700 transition-all hover:border-slate-300"
            >
              Create an account
            </Link>
            <p className="text-center text-[12px] text-slate-400">
              Want to list your services?{' '}
              <Link href="/partner/register" className="text-teal-600 font-semibold hover:underline">
                Register as a partner
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-indigo-50 text-indigo-600">
                  <KeyRound className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Reset password</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsForgotModalOpen(false);
                  setForgotSuccess(false);
                }}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {forgotSuccess ? (
              <div className="text-center py-4 space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Check your email!</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  We've sent a password reset link to <strong>{forgotEmail}</strong>. Check your inbox (and spam folder) and click the link to create a new password.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotModalOpen(false);
                    setForgotSuccess(false);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition"
                >
                  Back to sign in
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-3 text-xs">
                <p className="text-slate-600 text-[13px] leading-relaxed">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
                {forgotError && (
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {forgotError}
                  </div>
                )}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1 text-[13px]">Email address</label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400"
                    required
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition text-[13px]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition text-[13px] disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    {forgotLoading ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Send reset link'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-teal-50">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
