'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getCurrentUser, switchRole } from '@/services/storage';
import { UserCheck, Stethoscope, ShieldAlert, Sparkles, RefreshCw } from 'lucide-react';

export default function RoleSwitcher() {
  const router = useRouter();
  const [currentUser, setUser] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const syncUser = () => {
    setUser(getCurrentUser());
  };

  useEffect(() => {
    syncUser();
    window.addEventListener('auralife_storage_update', syncUser);
    return () => window.removeEventListener('auralife_storage_update', syncUser);
  }, []);

  const handleSwitch = (roleKey, redirectUrl) => {
    const updated = switchRole(roleKey);
    setUser(updated);
    if (redirectUrl) {
      router.push(redirectUrl);
    }
  };

  if (!currentUser) return null;

  return (
    <aside aria-label="Demo Role Simulator" className="bg-slate-900 text-white text-xs border-b border-slate-800 relative z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-wrap items-center justify-between gap-2">
        {/* Left: Role Indicator */}
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-slate-400 hidden sm:inline">Role Simulator:</span>
          <span className="font-semibold text-slate-100 flex items-center gap-1.5">
            {currentUser.role === 'customer' && <UserCheck className="w-3.5 h-3.5 text-indigo-400" />}
            {currentUser.role === 'provider' && <Stethoscope className="w-3.5 h-3.5 text-teal-400" />}
            {currentUser.role === 'admin' && <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />}
            <span>{currentUser.name}</span>
            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] uppercase font-bold text-slate-300">
              {currentUser.role}
            </span>
          </span>
        </div>

        {/* Right: Quick Switch Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="text-slate-400 text-[11px] hidden md:inline mr-1">Switch Persona:</span>

          <button
            onClick={() => handleSwitch('customer', '/dashboard/customer')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition flex items-center gap-1 ${
              currentUser.role === 'customer'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <span>👤 Customer</span>
          </button>

          <button
            onClick={() => handleSwitch('provider', '/dashboard/provider')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition flex items-center gap-1 ${
              currentUser.role === 'provider'
                ? 'bg-teal-600 text-white font-semibold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <span>🩺 Provider</span>
          </button>

          <button
            onClick={() => handleSwitch('admin', '/dashboard/admin')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition flex items-center gap-1 ${
              currentUser.role === 'admin'
                ? 'bg-amber-600 text-white font-semibold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <span>🛡️ Admin</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
