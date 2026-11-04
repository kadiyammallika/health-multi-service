'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Plane,
  Bus,
  Building2,
  Sparkles,
  Home,
  Bell,
  Ticket,
  LayoutDashboard,
  Menu,
  X,
  ChevronDown,
  UserCheck,
  Stethoscope,
  Shield,
  Briefcase
} from 'lucide-react';
import { getCurrentUser, getNotifications, markNotificationRead } from '@/services/storage';

export default function Navbar() {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showDashMenu, setShowDashMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const syncData = () => {
    setCurrentUser(getCurrentUser());
    setNotifications(getNotifications());
  };

  useEffect(() => {
    syncData();
    window.addEventListener('auralife_storage_update', syncData);
    return () => window.removeEventListener('auralife_storage_update', syncData);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const navLinks = [
    { name: 'Flights', href: '/flights', icon: Plane, color: 'text-indigo-600' },
    { name: 'Buses', href: '/buses', icon: Bus, color: 'text-amber-600' },
    { name: 'Hotels', href: '/hotels', icon: Building2, color: 'text-emerald-600' },
    { name: 'Wellness', href: '/wellness', icon: Sparkles, color: 'text-teal-600' },
    { name: 'Properties', href: '/properties', icon: Home, color: 'text-rose-600' },
  ];

  const handleNotifClick = (id) => {
    markNotificationRead(id);
    setNotifications(getNotifications());
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-teal-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-teal-200" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-slate-900 group-hover:text-indigo-600 transition">
                Aura<span className="text-indigo-600">Life</span>
              </span>
              <span className="block text-[10px] uppercase font-bold tracking-widest text-slate-400">
                Unified Marketplace
              </span>
            </div>
          </Link>

          {/* Desktop Service Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : item.color}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action Icons & Profile */}
          <div className="hidden sm:flex items-center gap-2.5">
            {/* My Bookings link */}
            <Link
              href="/bookings"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                pathname === '/bookings'
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                  : 'border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Ticket className="w-4 h-4 text-indigo-600" />
              <span>My Bookings</span>
            </Link>

            {/* Dashboards Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowDashMenu(!showDashMenu);
                  setShowNotifs(false);
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 transition"
              >
                <LayoutDashboard className="w-4 h-4 text-slate-600" />
                <span>Dashboards</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </button>

              {showDashMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 animate-fadeIn">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Switch Dashboard
                  </div>
                  <Link
                    href="/dashboard/customer"
                    onClick={() => setShowDashMenu(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition"
                  >
                    <UserCheck className="w-4 h-4 text-indigo-600" />
                    <div>
                      <div>Customer Dashboard</div>
                      <span className="text-[10px] font-normal text-slate-400">Bookings, Enquiries & Profile</span>
                    </div>
                  </Link>
                  <Link
                    href="/dashboard/provider"
                    onClick={() => setShowDashMenu(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-teal-50 hover:text-teal-700 transition"
                  >
                    <Stethoscope className="w-4 h-4 text-teal-600" />
                    <div>
                      <div>Provider Dashboard</div>
                      <span className="text-[10px] font-normal text-slate-400">Requests, Approvals & Leads</span>
                    </div>
                  </Link>
                  <Link
                    href="/dashboard/admin"
                    onClick={() => setShowDashMenu(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-amber-50 hover:text-amber-700 transition"
                  >
                    <Shield className="w-4 h-4 text-amber-600" />
                    <div>
                      <div>Admin Dashboard</div>
                      <span className="text-[10px] font-normal text-slate-400">Partner Verification & Control</span>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            {/* Notifications Popover */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifs(!showNotifs);
                  setShowDashMenu(false);
                }}
                className="relative p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifs && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 p-3 z-50 animate-fadeIn">
                  <div className="flex items-center justify-between px-2 pb-2 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-800">Notifications</span>
                    <span className="text-[11px] text-slate-400">{unreadCount} unread</span>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-50 my-1">
                    {notifications.length === 0 ? (
                      <div className="text-center py-6 text-xs text-slate-400">No notifications yet</div>
                    ) : (
                      notifications.slice(0, 5).map((n) => (
                        <div
                          key={n.id}
                          onClick={() => handleNotifClick(n.id)}
                          className={`p-2.5 rounded-lg text-xs cursor-pointer transition ${
                            n.read ? 'opacity-60 hover:bg-slate-50' : 'bg-indigo-50/50 hover:bg-indigo-50'
                          }`}
                        >
                          <div className="font-semibold text-slate-800">{n.title}</div>
                          <div className="text-slate-600 text-[11px] mt-0.5">{n.message}</div>
                          <div className="text-[10px] text-slate-400 mt-1">
                            {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Become a Partner CTA */}
            <Link
              href="/partner/register"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-xs font-semibold shadow-xs shadow-teal-600/20 transition"
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Become a Partner</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            <Link
              href="/bookings"
              className="p-2 rounded-lg border border-slate-200 text-slate-700"
              aria-label="My Bookings"
            >
              <Ticket className="w-4 h-4 text-indigo-600" />
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-4 animate-fadeIn">
          <div className="grid grid-cols-2 gap-2">
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-3 rounded-xl border border-slate-100 bg-slate-50 text-xs font-semibold text-slate-700 hover:bg-indigo-50"
                >
                  <Icon className={`w-4 h-4 ${item.color}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Dashboards</div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <Link
                href="/dashboard/customer"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg bg-indigo-50 text-indigo-700 font-medium"
              >
                Customer
              </Link>
              <Link
                href="/dashboard/provider"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg bg-teal-50 text-teal-700 font-medium"
              >
                Provider
              </Link>
              <Link
                href="/dashboard/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg bg-amber-50 text-amber-700 font-medium"
              >
                Admin
              </Link>
            </div>
          </div>

          <div className="pt-2">
            <Link
              href="/partner/register"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-semibold"
            >
              <Briefcase className="w-4 h-4" />
              <span>Become a Partner</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
