'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, Lock, Mail, ArrowRight, UserCheck, Stethoscope, ShieldAlert, Check } from 'lucide-react';
import { DEMO_USERS, switchRole, setCurrentUser } from '@/services/storage';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('alex.morgan@example.com');
  const [password, setPassword] = useState('demo123456');
  const [role, setRole] = useState('customer');

  const handleQuickLogin = (roleKey, redirectUrl) => {
    switchRole(roleKey);
    router.push(redirectUrl);
  };

  const handleFormLogin = (e) => {
    e.preventDefault();
    if (role === 'provider') {
      switchRole('provider');
      router.push('/dashboard/provider');
    } else if (role === 'admin') {
      switchRole('admin');
      router.push('/dashboard/admin');
    } else {
      switchRole('customer');
      router.push('/dashboard/customer');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-3xl border border-slate-100 shadow-xl">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-indigo-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Sparkles className="w-6 h-6 text-teal-200" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Sign in to AuraLife</h2>
          <p className="text-xs text-slate-400">Select an account persona or enter demo credentials</p>
        </div>

        {/* 1-Click Persona Quick Access */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block text-center">
            ⚡ 1-Click Demo Persona Access
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('customer', '/dashboard/customer')}
              className="p-3 rounded-2xl border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100/70 transition flex flex-col items-center text-center"
            >
              <UserCheck className="w-5 h-5 text-indigo-600 mb-1" />
              <span className="text-xs font-bold text-indigo-900">Customer</span>
              <span className="text-[9px] text-indigo-500">Alex Morgan</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('provider', '/dashboard/provider')}
              className="p-3 rounded-2xl border border-teal-200 bg-teal-50/50 hover:bg-teal-100/70 transition flex flex-col items-center text-center"
            >
              <Stethoscope className="w-5 h-5 text-teal-600 mb-1" />
              <span className="text-xs font-bold text-teal-900">Provider</span>
              <span className="text-[9px] text-teal-600">Dr. Aarav</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('admin', '/dashboard/admin')}
              className="p-3 rounded-2xl border border-amber-200 bg-amber-50/50 hover:bg-amber-100/70 transition flex flex-col items-center text-center"
            >
              <ShieldAlert className="w-5 h-5 text-amber-600 mb-1" />
              <span className="text-xs font-bold text-amber-900">Admin</span>
              <span className="text-[9px] text-amber-600">Sarah J.</span>
            </button>
          </div>
        </div>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-slate-100"></div>
          <span className="flex-shrink mx-3 text-slate-400 text-[10px] uppercase font-bold">Or Standard Login</span>
          <div className="flex-grow border-t border-slate-100"></div>
        </div>

        {/* Form */}
        <form onSubmit={handleFormLogin} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-600 mb-1">Account Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold"
            >
              <option value="customer">Customer Account (Bookings & Enquiries)</option>
              <option value="provider">Service Provider (Healer / Partner)</option>
              <option value="admin">Platform Administrator</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5"
          >
            <span>Log In to Account</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <p className="text-center text-xs text-slate-500">
          Don't have an account yet?{' '}
          <Link href="/register" className="text-indigo-600 font-bold hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
