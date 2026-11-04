'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser, getDashboardUrl, logoutUser } from '@/services/storage';
import { ShieldAlert, Lock, ArrowRight, UserCheck, Stethoscope, LogIn, LogOut } from 'lucide-react';

export default function AuthGuard({ allowedRole, roleTitle, children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [currentUser, setUser] = useState(null);
  const [isChecking, setIsChecking] = useState(true);

  const checkAuth = () => {
    const user = getCurrentUser();
    setUser(user);
    setIsChecking(false);
  };

  useEffect(() => {
    checkAuth();
    window.addEventListener('auralife_storage_update', checkAuth);
    return () => window.removeEventListener('auralife_storage_update', checkAuth);
  }, []);

  if (isChecking) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Case 1: User is not logged in at all
  if (!currentUser) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xl text-center space-y-5 animate-fadeIn">
          <div className="w-16 h-16 mx-auto bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center border border-amber-200/60">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-amber-50 text-amber-700 border border-amber-200">
              Authentication Required
            </span>
            <h2 className="text-2xl font-black text-slate-900 mt-3">Protected Dashboard</h2>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Please sign in with your <strong>{roleTitle || allowedRole}</strong> credentials to access this dashboard.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2.5">
            <Link
              href={`/login?role=${allowedRole}&redirect=${encodeURIComponent(pathname)}`}
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Go to {roleTitle || allowedRole} Login</span>
            </Link>

            <Link
              href="/"
              className="w-full py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-xs transition"
            >
              Return to Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Case 2: User is logged in, but has a different role (e.g. Customer visiting Admin dashboard)
  if (allowedRole && currentUser.role !== allowedRole) {
    const roleLabels = {
      customer: 'Customer',
      provider: 'Service Provider',
      admin: 'Administrator'
    };
    const currentLabel = roleLabels[currentUser.role] || currentUser.role;
    const requiredLabel = roleLabels[allowedRole] || allowedRole;
    const properDashboardUrl = getDashboardUrl(currentUser.role);

    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white rounded-3xl p-8 border border-rose-100 shadow-xl text-center space-y-5 animate-fadeIn">
          <div className="w-16 h-16 mx-auto bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center border border-rose-200/60">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-rose-50 text-rose-700 border border-rose-200">
              Access Restricted
            </span>
            <h2 className="text-2xl font-black text-slate-900 mt-3">Role Boundary Check</h2>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              You are signed in as <strong>{currentUser.name}</strong> ({currentLabel}).
              This section is restricted strictly to <strong>{requiredLabel}</strong> accounts.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-1 text-left">
            <div>• Current Active Persona: <strong>{currentLabel}</strong></div>
            <div>• Target Section Required: <strong>{requiredLabel}</strong></div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
            <Link
              href={properDashboardUrl}
              className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
            >
              <span>Go to My {currentLabel} Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              href={`/login?role=${allowedRole}&redirect=${encodeURIComponent(pathname)}`}
              className="flex-1 py-3 px-4 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs transition flex items-center justify-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Switch / Re-login</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Case 3: Authorized!
  return <>{children}</>;
}
