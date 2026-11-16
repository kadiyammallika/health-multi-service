'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser, getDashboardUrl, syncSessionFromBackend } from '@/services/storage';
import { ShieldAlert, Lock, ArrowRight, Clock, LogIn, LogOut } from 'lucide-react';

export default function AuthGuard({ allowedRole, roleTitle, children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [currentUser, setUser] = useState(null);
  const [isChecking, setIsChecking] = useState(true);

  const checkAuth = async () => {
    let user = getCurrentUser();
    // Always verify with backend to catch expired sessions
    const backendUser = await syncSessionFromBackend();
    if (backendUser) {
      user = backendUser;
    } else if (user) {
      // localStorage has stale data but backend says not authenticated
      user = null;
    }
    setUser(user);
    setIsChecking(false);
  };

  useEffect(() => {
    checkAuth();
    window.addEventListener('auralife_storage_update', checkAuth);
    return () => window.removeEventListener('auralife_storage_update', checkAuth);
  }, []);

  // Case 1: User is not logged in — redirect to login page via useEffect
  const shouldRedirectToLogin = !isChecking && !currentUser;
  useEffect(() => {
    if (shouldRedirectToLogin) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [shouldRedirectToLogin, router, pathname]);

  if (isChecking) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (shouldRedirectToLogin) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 mx-auto border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-500">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  const effectiveType = currentUser.accountType || currentUser.role;
  const userRoles = currentUser.roles || [effectiveType];
  const hasProviderRole = userRoles.includes('provider');

  // Case 2: Pending Provider trying to access Provider Dashboard
  if (allowedRole === 'provider' && hasProviderRole && currentUser.applicationStatus === 'pending') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-amber-200 shadow-xl text-center space-y-5 animate-fadeIn">
          <div className="w-16 h-16 mx-auto bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center border border-amber-200">
            <Clock className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-amber-50 text-amber-700 border border-amber-200">
              Verification Pending
            </span>
            <h2 className="text-2xl font-black text-slate-900 mt-3">Application Under Review</h2>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Your provider registration has been received and is awaiting administrative compliance approval.
              You will gain full access to the Provider Portal once verified by the platform administrators.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2.5">
            <Link
              href="/"
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
            >
              <span>Explore Marketplace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Case 2b: Rejected Provider trying to access Provider Dashboard
  if (allowedRole === 'provider' && hasProviderRole && currentUser.applicationStatus === 'rejected') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-rose-200 shadow-xl text-center space-y-5 animate-fadeIn">
          <div className="w-16 h-16 mx-auto bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center border border-rose-200">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-rose-50 text-rose-700 border border-rose-200">
              Application Rejected
            </span>
            <h2 className="text-2xl font-black text-slate-900 mt-3">Application Not Approved</h2>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Your provider application was reviewed and not approved. You may contact support or reapply with updated information.
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-2.5">
            <Link
              href="/"
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
            >
              <span>Return to Homepage</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Case 3: User is logged in, but database profile type does not match requested section
  if (allowedRole && effectiveType !== allowedRole && !userRoles.includes(allowedRole)) {
    const roleLabels = {
      customer: 'Customer',
      provider: 'Service Provider',
      admin: 'Administrator'
    };
    const currentLabel = roleLabels[effectiveType] || effectiveType;
    const requiredLabel = roleLabels[allowedRole] || allowedRole;
    const properDashboardUrl = getDashboardUrl(effectiveType);

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
            <h2 className="text-2xl font-black text-slate-900 mt-3">Account Boundary Notice</h2>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              You are currently signed in as <strong>{currentUser.name}</strong> ({currentLabel}).
              This section is restricted strictly to verified <strong>{requiredLabel}</strong> database accounts.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-1 text-left">
            <div>• Your Account Type: <strong>{currentLabel}</strong></div>
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
              href={`/login?redirect=${encodeURIComponent(pathname)}`}
              className="flex-1 py-3 px-4 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs transition flex items-center justify-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Switch Account</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Case 4: Authorized!
  return <>{children}</>;
}
