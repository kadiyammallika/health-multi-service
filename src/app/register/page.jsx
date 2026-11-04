'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, UserCheck, Briefcase } from 'lucide-react';
import { setCurrentUser, switchRole } from '@/services/storage';

export default function RegisterPage() {
  const router = useRouter();
  const [accountType, setAccountType] = useState('customer');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = (e) => {
    e.preventDefault();

    if (accountType === 'provider') {
      router.push('/partner/register');
      return;
    }

    const newUser = {
      id: `USR-${Date.now().toString(36).toUpperCase()}`,
      name: fullName,
      email,
      phone,
      role: 'customer',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      memberSince: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    };

    setCurrentUser(newUser);
    router.push('/dashboard/customer');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-3xl border border-slate-100 shadow-xl">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-indigo-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Sparkles className="w-6 h-6 text-teal-200" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Create an AuraLife Account</h2>
          <p className="text-xs text-slate-400">Join our multi-service living, wellness & travel network</p>
        </div>

        {/* Account Type Selector */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setAccountType('customer')}
            className={`p-3 rounded-2xl border text-xs font-bold transition flex flex-col items-center gap-1 ${
              accountType === 'customer'
                ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-xs'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Customer Account</span>
          </button>

          <button
            type="button"
            onClick={() => setAccountType('provider')}
            className={`p-3 rounded-2xl border text-xs font-bold transition flex flex-col items-center gap-1 ${
              accountType === 'provider'
                ? 'border-teal-600 bg-teal-50 text-teal-700 shadow-xs'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Service Provider</span>
          </button>
        </div>

        {accountType === 'provider' ? (
          <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-2xl text-center space-y-3">
            <p className="text-xs text-teal-900 leading-relaxed">
              Service providers (Airlines, bus operators, hotels, wellness practitioners, and real estate agents) register via the dedicated Partner Onboarding Portal.
            </p>
            <Link
              href="/partner/register"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs"
            >
              <span>Go to Partner Registration</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-600 mb-1">Full Legal Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Alex Morgan"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-600 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex.morgan@example.com"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-600 mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-600 mb-1">Create Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5"
            >
              <span>Complete Customer Registration</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        )}

        <p className="text-center text-xs text-slate-500">
          Already registered?{' '}
          <Link href="/login" className="text-indigo-600 font-bold hover:underline">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}
