'use client';

import { useEffect, useState, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getCurrentUser, syncSessionFromBackend } from '@/services/storage';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import AdminLayout from './AdminLayout';

const AUTH_PAGES = ['/login', '/register', '/partner/register', '/reset-password'];
const PROTECTED_ROUTES = ['/dashboard', '/bookings'];
const LOGIN_REQUIRED_ROUTES = ['/']; // Root page requires login

export default function AppShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [authState, setAuthState] = useState('checking');
  const [currentUser, setCurrentUser] = useState(null);

  // Suppress RSC payload fetch errors (dev-mode only, Next.js auto-recovers via browser navigation)
  useEffect(() => {
    const origError = window.console.error;
    window.console.error = (...args) => {
      const msg = typeof args[0] === 'string' ? args[0] : '';
      if (msg.includes('Failed to fetch RSC payload') || msg.includes('Falling back to browser navigation')) return;
      origError.apply(window.console, args);
    };
    const handleError = (e) => {
      if (e.message && (e.message.includes('Failed to fetch') || e.message.includes('RSC'))) {
        e.preventDefault();
      }
    };
    window.addEventListener('unhandledrejection', handleError);
    return () => {
      window.console.error = origError;
      window.removeEventListener('unhandledrejection', handleError);
    };
  }, []);

  const isAuthPage = AUTH_PAGES.some(
    (p) => pathname === p || pathname.startsWith(p + '/')
  );

  const isProtectedRoute = PROTECTED_ROUTES.some(
    (p) => pathname === p || pathname.startsWith(p + '/')
  );

  const isLoginRequiredRoute = LOGIN_REQUIRED_ROUTES.includes(pathname);

  useEffect(() => {
    if (isAuthPage) {
      setAuthState('skip');
      return;
    }

    // Root page and other login-required routes: redirect to login if not authenticated
    if (isLoginRequiredRoute && !isProtectedRoute) {
      const user = getCurrentUser();
      if (user) {
        setAuthState('public');
        setCurrentUser(user);
      } else {
        // Check if explicitly logged out
        const loggedOut = typeof window !== 'undefined' && localStorage.getItem('oneconnect_logged_out') === 'true';
        if (loggedOut) {
          router.replace('/login');
          return;
        }
        // Try session recovery before redirecting
        syncSessionFromBackend().then((recovered) => {
          if (recovered) {
            setAuthState('public');
            setCurrentUser(getCurrentUser());
          } else {
            router.replace('/login');
          }
        }).catch(() => {
          router.replace('/login');
        });
      }
      return;
    }

    // Public routes don't require auth — show content immediately
    if (!isProtectedRoute) {
      setAuthState('public');
      // Still check for user to determine layout
      setCurrentUser(getCurrentUser());
      return;
    }

    let cancelled = false;

    const checkAuth = async () => {
      // Step 1: Check localStorage instantly
      const user = getCurrentUser();
      if (user) {
        if (!cancelled) {
          setAuthState('authenticated');
          setCurrentUser(user);
        }
        return;
      }

      // Step 2: No user in localStorage — check if we should try cookie recovery
      const loggedOut = typeof window !== 'undefined' && localStorage.getItem('oneconnect_logged_out') === 'true';
      if (loggedOut) {
        if (!cancelled) router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
        return;
      }

      // Step 3: Try cookie-based session recovery with a timeout
      try {
        const syncPromise = syncSessionFromBackend();
        const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve(null), 3000));
        const recovered = await Promise.race([syncPromise, timeoutPromise]);

        if (cancelled) return;

        if (recovered) {
          setAuthState('authenticated');
          setCurrentUser(getCurrentUser());
        } else {
          router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
        }
      } catch {
        if (!cancelled) router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      }
    };

    checkAuth();

    const handleStorageUpdate = () => {
      const user = getCurrentUser();
      setCurrentUser(user);
      if (!user && isProtectedRoute) {
        router.replace('/login');
      } else if (user) {
        setAuthState('authenticated');
      }
    };

    window.addEventListener('auralife_storage_update', handleStorageUpdate);
    return () => {
      cancelled = true;
      window.removeEventListener('auralife_storage_update', handleStorageUpdate);
    };
  }, [pathname, isAuthPage, isProtectedRoute, isLoginRequiredRoute, router]);

  // Listen for user changes (login/logout) to update layout
  useEffect(() => {
    const sync = () => setCurrentUser(getCurrentUser());
    window.addEventListener('auralife_storage_update', sync);
    return () => window.removeEventListener('auralife_storage_update', sync);
  }, []);

  const isAdmin = currentUser?.role === 'admin' || currentUser?.accountType === 'admin';
  const shouldRedirectAdmin = isAdmin && !isAuthPage && !pathname.startsWith('/dashboard/admin');

  // Redirect admin to admin dashboard (must be in useEffect, not during render)
  useEffect(() => {
    if (shouldRedirectAdmin) {
      router.replace('/dashboard/admin');
    }
  }, [shouldRedirectAdmin, router]);

  // Auth pages - standalone, no chrome
  if (isAuthPage) {
    return <>{children}</>;
  }

  // Loading — minimal spinner while checking auth (only for protected routes)
  if (authState === 'checking' || shouldRedirectAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  // Admin users on admin dashboard
  if (isAdmin) {
    return <AdminLayout>{children}</AdminLayout>;
  }

  // Main layout: Supabase-style icon sidebar (left) + Content area
  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left icon sidebar (desktop) */}
      <Sidebar />

      {/* Main content */}
      <main className="flex-1 min-h-screen overflow-y-auto pb-20 lg:pb-0">
        {children}
      </main>

      {/* Mobile bottom nav */}
      <BottomNav />
    </div>
  );
}
