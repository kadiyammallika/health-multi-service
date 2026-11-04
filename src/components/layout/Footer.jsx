'use client';

import Link from 'next/link';
import { Sparkles, ShieldCheck, HeartHandshake, PhoneCall, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-900 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-teal-500 flex items-center justify-center text-white font-bold text-lg">
                <Sparkles className="w-5 h-5 text-teal-200" />
              </div>
              <span className="text-xl font-black tracking-tight text-white">
                One<span className="text-indigo-400">Connect</span>
              </span>
            </Link>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              The unified multi-service marketplace bringing together flight reservations, luxury bus travels, boutique stays & hotels, alternative holistic therapies, and verified property investments into one seamless experience.
            </p>
            <div className="flex items-center gap-4 text-slate-300 pt-2">
              <div className="flex items-center gap-1.5 text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Verified Operators</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <HeartHandshake className="w-4 h-4 text-teal-400" />
                <span>Direct Practitioner Care</span>
              </div>
            </div>
          </div>

          {/* Service Modules */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Service Verticals</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/flights" className="hover:text-white transition">✈️ Flight Booking</Link>
              </li>
              <li>
                <Link href="/buses" className="hover:text-white transition">🚌 Bus Travel & Sleeper</Link>
              </li>
              <li>
                <Link href="/hotels" className="hover:text-white transition">🏨 Luxury Hotels & Spas</Link>
              </li>
              <li>
                <Link href="/wellness" className="hover:text-white transition">🌿 Alternative Wellness</Link>
              </li>
              <li>
                <Link href="/properties" className="hover:text-white transition">🏡 Buy & Rent Properties</Link>
              </li>
            </ul>
          </div>

          {/* Platform Portals */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Portals & Access</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/dashboard/customer" className="hover:text-white transition">Customer Dashboard</Link>
              </li>
              <li>
                <Link href="/dashboard/provider" className="hover:text-white transition">Service Provider Portal</Link>
              </li>
              <li>
                <Link href="/dashboard/admin" className="hover:text-white transition">Administrator Command</Link>
              </li>
              <li>
                <Link href="/bookings" className="hover:text-white transition">My Bookings & Tickets</Link>
              </li>
              <li>
                <Link href="/partner/register" className="text-teal-400 hover:text-teal-300 font-medium transition">
                  ✨ Become a Partner
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Support & Help</h4>
            <ul className="space-y-2.5 text-slate-400">
              <li className="flex items-center gap-2">
                <PhoneCall className="w-3.5 h-3.5 text-indigo-400" />
                <span>+91 1800 200 4882 (24/7 Demo)</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-teal-400" />
                <span>support@auralifemarketplace.com</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                <span>Indiranagar 100ft Rd, Bengaluru</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Disclaimer */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <div>
            © {new Date().getFullYear()} OneConnect Multi-Service Marketplace. Designed for commercial-grade living, wellness & travel discovery.
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Client-Side LocalStorage Architecture</span>
            <span>•</span>
            <span>Zero Real Payments Billed</span>
            <span>•</span>
            <span>Ready for Backend API Integrations</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
