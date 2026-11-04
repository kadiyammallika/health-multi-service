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
  UserCheck,
  Stethoscope,
  ShieldAlert,
  AlertCircle,
  CheckCircle2,
  Copy,
  Check,
  KeyRound,
  X,
  HelpCircle
} from 'lucide-react';
import {
  DEFAULT_DEMO_ACCOUNTS,
  authenticateUser,
  getRememberedEmail,
  setRememberedEmail
} from '@/services/storage';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialRoleParam = searchParams.get('role');
  const redirectParam = searchParams.get('redirect');

  // Active Role Tab: 'customer', 'provider', 'admin'
  const [selectedRole, setSelectedRole] = useState(
    initialRoleParam === 'provider' || initialRoleParam === 'admin'
      ? initialRoleParam
      : 'customer'
  );

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Status & Validation
  const [errorMessage, setErrorMessage] = useState('');
  const [roleMismatchError, setRoleMismatchError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedDemoRole, setCopiedDemoRole] = useState(null);

  // Forgot Password Modal State
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // Load remembered email on mount if any
  useEffect(() => {
    const remembered = getRememberedEmail();
    if (remembered) {
      setEmail(remembered);
      setRememberMe(true);
    }
  }, []);

  // Update selected role if query param changes
  useEffect(() => {
    if (initialRoleParam && ['customer', 'provider', 'admin'].includes(initialRoleParam)) {
      setSelectedRole(initialRoleParam);
    }
  }, [initialRoleParam]);

  // Quick Auto-Fill Demo Credentials Helper
  const handleUseDemoAccount = (demo) => {
    setSelectedRole(demo.role);
    setEmail(demo.email);
    setPassword(demo.password);
    setErrorMessage('');
    setRoleMismatchError('');
    setCopiedDemoRole(demo.role);
    setTimeout(() => setCopiedDemoRole(null), 2000);
  };

  const handleRoleTabChange = (role) => {
    setSelectedRole(role);
    setErrorMessage('');
    setRoleMismatchError('');
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    setRoleMismatchError('');
    setIsSubmitting(true);

    // Save or clear remembered email
    setRememberedEmail(email, rememberMe);

    // Authenticate with selected role
    const result = authenticateUser(email, password, selectedRole);

    setIsSubmitting(false);

    if (!result.success) {
      if (result.roleMismatch) {
        setRoleMismatchError(result.error);
      } else {
        setErrorMessage(result.error);
      }
      return;
    }

    // Role verified and login succeeded! Redirect to respective dashboard
    const targetUrl = redirectParam || result.redirectUrl;
    router.push(targetUrl);
  };

  const handleForgotPasswordSubmit = (e) => {
    e.preventDefault();
    if (!forgotEmail || !forgotEmail.includes('@')) {
      alert('Please enter a valid email address.');
      return;
    }
    setForgotSuccess(true);
  };

  // Role metadata configurations
  const roleConfig = {
    customer: {
      title: 'Customer Login',
      badge: 'Client Portal',
      icon: UserCheck,
      color: 'text-indigo-600',
      activeBorder: 'border-indigo-600 bg-indigo-50/60 text-indigo-900 ring-2 ring-indigo-500/20',
      btnGradient: 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/30',
      description: 'Access flight & bus bookings, hotel reservations, and wellness records.'
    },
    provider: {
      title: 'Provider Login',
      badge: 'Partner Portal',
      icon: Stethoscope,
      color: 'text-teal-600',
      activeBorder: 'border-teal-600 bg-teal-50/60 text-teal-900 ring-2 ring-teal-500/20',
      btnGradient: 'bg-teal-600 hover:bg-teal-700 shadow-teal-600/30',
      description: 'Manage session appointments, accept/decline client requests, and track leads.'
    },
    admin: {
      title: 'Admin Login',
      badge: 'System Command',
      icon: ShieldAlert,
      color: 'text-amber-600',
      activeBorder: 'border-amber-600 bg-amber-50/60 text-amber-900 ring-2 ring-amber-500/20',
      btnGradient: 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/30',
      description: 'Platform analytics, partner license verification, and bookings ledger oversight.'
    }
  };

  const currentRoleInfo = roleConfig[selectedRole];
  const CurrentRoleIcon = currentRoleInfo.icon;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-xl w-full space-y-6">
        {/* Main Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-100 shadow-2xl space-y-6">
          {/* OneConnect Brand & Welcome Header */}
          <div className="text-center space-y-2">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <Sparkles className="w-6 h-6 text-teal-200" />
              </div>
              <span className="text-2xl font-black tracking-tight text-slate-900">
                One<span className="text-indigo-600">Connect</span>
              </span>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight pt-1">
              Welcome Back
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
              Choose your account role and sign in to access your dedicated OneConnect dashboard.
            </p>
          </div>

          {/* Three Role-Selection Options (Customer, Provider, Admin) */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 text-center">
              Select Your Role
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {['customer', 'provider', 'admin'].map((roleKey) => {
                const conf = roleConfig[roleKey];
                const Icon = conf.icon;
                const isSelected = selectedRole === roleKey;
                return (
                  <button
                    key={roleKey}
                    type="button"
                    onClick={() => handleRoleTabChange(roleKey)}
                    className={`p-3.5 rounded-2xl border text-xs font-bold transition flex flex-col items-center justify-center gap-1.5 ${
                      isSelected
                        ? conf.activeBorder
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isSelected ? conf.color : 'text-slate-400'}`} />
                    <span className="text-xs">{conf.title.replace(' Login', '')}</span>
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold ${
                        isSelected ? 'bg-white shadow-xs text-slate-800' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {conf.badge}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-center text-slate-500 pt-1">
              {currentRoleInfo.description}
            </p>
          </div>

          {/* Error & Validation Alerts */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Authentication Failed</strong>
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          {roleMismatchError && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
              <div>
                <strong className="block font-bold">Account Role Mismatch</strong>
                <span>{roleMismatchError}</span>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={
                    selectedRole === 'customer'
                      ? 'customer@oneconnect.com'
                      : selectedRole === 'provider'
                      ? 'provider@oneconnect.com'
                      : 'admin@oneconnect.com'
                  }
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                  required
                />
              </div>
            </div>

            {/* Password Field with Show/Hide Toggle */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(true)}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold transition"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-11 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition font-mono"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between pt-1 text-xs">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
                />
                <span>Remember me on this browser</span>
              </label>

              <span className="text-[11px] text-slate-400">
                Role: <strong>{currentRoleInfo.title}</strong>
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3.5 px-4 rounded-xl text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 ${currentRoleInfo.btnGradient}`}
            >
              <CurrentRoleIcon className="w-4 h-4" />
              <span>{isSubmitting ? 'Authenticating...' : `Sign in as ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}`}</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </form>

          {/* Registration link */}
          <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            Don't have an account yet?{' '}
            <Link
              href={selectedRole === 'provider' ? '/partner/register' : '/register'}
              className="text-indigo-600 font-bold hover:underline"
            >
              {selectedRole === 'provider' ? 'Register as a Service Provider' : 'Create Customer Account'}
            </Link>
          </div>
        </div>

        {/* SECTION 4: DEMO LOGIN ACCOUNTS (Explicitly requested for fast testing) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
              <KeyRound className="w-4 h-4 text-indigo-600" />
              <span>OneConnect Demo Credentials</span>
            </div>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Click Any Card to Auto-Fill
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {DEFAULT_DEMO_ACCOUNTS.map((demo) => {
              const isSelected = selectedRole === demo.role && email === demo.email;
              const roleTitle = demo.role === 'customer' ? 'Customer' : demo.role === 'provider' ? 'Provider' : 'Admin';
              return (
                <div
                  key={demo.role}
                  onClick={() => handleUseDemoAccount(demo)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition text-xs space-y-1 relative ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/70 shadow-sm'
                      : 'border-slate-200 bg-slate-50/70 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{roleTitle}</span>
                    {copiedDemoRole === demo.role ? (
                      <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                        <Check className="w-3 h-3" /> Filled
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400">Fill</span>
                    )}
                  </div>
                  <div className="text-slate-600 truncate font-mono text-[11px]">{demo.email}</div>
                  <div className="text-slate-400 font-mono text-[10px]">Pass: {demo.password}</div>
                </div>
              );
            })}
          </div>

          <p className="text-[11px] text-slate-400 text-center leading-relaxed">
            🛡️ Frontend Demo Environment: You can test logging in with Customer, Provider, or Admin credentials, as well as newly registered accounts.
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-indigo-50 text-indigo-600">
                  <KeyRound className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Reset Password</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsForgotModalOpen(false);
                  setForgotSuccess(false);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {forgotSuccess ? (
              <div className="text-center py-4 space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Demo Reset Link Dispatched</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  A simulated password recovery link has been generated for <strong>{forgotEmail}</strong>.
                  For demo testing, you can sign in directly using the pre-configured password: <strong className="font-mono text-indigo-600">Password123!</strong>.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotModalOpen(false);
                    setForgotSuccess(false);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs"
                >
                  Return to Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-3 text-xs">
                <p className="text-slate-600 leading-relaxed">
                  Enter your registered OneConnect email address below. We'll send simulated instructions to reset your password.
                </p>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="Enter your registered email"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                    required
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(false)}
                    className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                  >
                    Send Reset Link
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
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
