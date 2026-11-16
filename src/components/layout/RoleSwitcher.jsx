'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getCurrentUser, logoutUser, getDashboardUrl, syncSessionFromBackend, switchRole } from '@/services/storage';
import { UserCheck, Stethoscope, ShieldAlert, LogOut, LogIn, LayoutDashboard, ArrowLeftRight } from 'lucide-react';

export default function RoleSwitcher() {
  const router = useRouter();
  const [currentUser, setUser] = useState(null);

  const syncUser = async () => {
    let user = getCurrentUser();
    if (!user) {
      user = await syncSessionFromBackend();
    }
    setUser(user);
  };

  useEffect(() => {
    syncUser();
    window.addEventListener('auralife_storage_update', syncUser);
    return () => window.removeEventListener('auralife_storage_update', syncUser);
  }, []);

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    router.push('/login');
  };

  const accountType = currentUser?.accountType || currentUser?.role;
  const roles = currentUser?.roles || (accountType ? [accountType] : []);
  const hasMultipleRoles = roles.length > 1;

  const handleSwitchRole = (newRole) => {
    const updated = switchRole(newRole);
    if (updated) {
      setUser(updated);
      router.push(getDashboardUrl(newRole));
    }
  };

  const getRoleLabel = (role) => {
    if (role === 'customer') return 'Customer';
    if (role === 'provider') return 'Provider';
    if (role === 'admin') return 'Administrator';
    return role;
  };

  return (
    <aside aria-label="Account Session Bar" className="bg-slate-900 text-white text-xs border-b border-slate-800 relative z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-wrap items-center justify-between gap-2">
        {/* Left: Live Authenticated Account Status */}
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${currentUser ? 'bg-emerald-400' : 'bg-slate-500'}`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${currentUser ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
          </span>
          <span className="text-slate-400 hidden sm:inline">Session:</span>
          {currentUser ? (
            <span className="font-semibold text-slate-100 flex items-center gap-1.5">
              {accountType === 'customer' && <UserCheck className="w-3.5 h-3.5 text-indigo-400" />}
              {accountType === 'provider' && <Stethoscope className="w-3.5 h-3.5 text-teal-400" />}
              {accountType === 'admin' && <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />}
              <span>{currentUser.name}</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] uppercase font-bold tracking-wider text-slate-300 border border-slate-700">
                {getRoleLabel(accountType)}
              </span>
            </span>
          ) : (
            <span className="text-slate-400 font-medium italic">
              Guest (Not Authenticated)
            </span>
          )}
        </div>

        {/* Right: Role switch, Dashboard link and Authentication Action */}
        <div className="flex items-center gap-2">
          {currentUser ? (
            <>
              {/* Role switch buttons — shown only if user has multiple roles */}
              {hasMultipleRoles && roles.filter(r => r !== accountType).map(otherRole => (
                <button
                  key={otherRole}
                  type="button"
                  onClick={() => handleSwitchRole(otherRole)}
                  className="px-2.5 py-1 rounded-md bg-teal-950/60 hover:bg-teal-900 text-teal-300 border border-teal-800/40 text-[11px] font-semibold transition flex items-center gap-1"
                  title={`Switch to ${getRoleLabel(otherRole)}`}
                >
                  <ArrowLeftRight className="w-3 h-3" />
                  <span>Switch to {getRoleLabel(otherRole)}</span>
                </button>
              ))}

              <Link
                href={getDashboardUrl(accountType)}
                className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold transition flex items-center gap-1.5 border border-slate-700"
              >
                <LayoutDashboard className="w-3 h-3 text-indigo-400" />
                <span>My Dashboard</span>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="px-2.5 py-1 rounded-md bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/40 text-[11px] font-semibold transition flex items-center gap-1"
                title="Sign Out of Session"
              >
                <LogOut className="w-3 h-3" />
                <span>Sign Out</span>
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="px-3 py-1 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold transition flex items-center gap-1 shadow-xs"
            >
              <LogIn className="w-3 h-3" />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </aside>
  );
}
