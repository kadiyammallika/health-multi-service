'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Plane,
  Bus,
  Building2,
  Sparkles,
  Home as HomeIcon,
  Bell,
  ChevronDown,
  LogOut,
  LayoutDashboard,
  Ticket,
  User,
  Phone,
  Menu,
  X,
  Heart
} from 'lucide-react';
import {
  getCurrentUser,
  getNotifications,
  markNotificationRead,
  logoutUser,
  getDashboardUrl
} from '@/services/storage';

const SERVICE_TABS = [
  { name: 'Flights', href: '/flights', icon: Plane, color: 'text-blue-600', bg: 'bg-blue-50', activeBorder: 'border-blue-600' },
  { name: 'Hotels', href: '/hotels', icon: Building2, color: 'text-orange-600', bg: 'bg-orange-50', activeBorder: 'border-orange-600', badge: 'Flat 85% Off' },
  { name: 'Buses', href: '/buses', icon: Bus, color: 'text-green-600', bg: 'bg-green-50', activeBorder: 'border-green-600' },
  { name: 'Health & Healing', href: '/wellness', icon: Sparkles, color: 'text-teal-600', bg: 'bg-teal-50', activeBorder: 'border-teal-600' },
  { name: 'Properties', href: '/properties', icon: Heart, color: 'text-rose-600', bg: 'bg-rose-50', activeBorder: 'border-rose-600' },
];

export default function TopBar({ onMenuToggle }) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const notifRef = useRef(null);

  const syncData = () => {
    setCurrentUser(getCurrentUser());
    setNotifications(getNotifications());
  };

  useEffect(() => {
    syncData();
    window.addEventListener('auralife_storage_update', syncData);
    return () => window.removeEventListener('auralife_storage_update', syncData);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowUserMenu(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    logoutUser();
    setShowUserMenu(false);
    router.push('/login');
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotifClick = (id) => {
    markNotificationRead(id);
    setNotifications(getNotifications());
  };

  const isHomePage = pathname === '/';

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm">
      {/* Top Row: Logo + Right Actions */}
      <div className="border-b border-slate-100">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-4 lg:px-8">
          {/* Left: Logo */}
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-slate-100 transition lg:hidden"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-slate-700" /> : <Menu className="w-5 h-5 text-slate-700" />}
            </button>

            <Link href="/" prefetch={false} className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-teal-500 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="hidden sm:block">
                <span className="text-xl font-black tracking-tight text-slate-900">
                  One<span className="text-indigo-600">Connect</span>
                </span>
                <div className="text-[10px] text-slate-400 font-medium -mt-0.5">Multi-Service Marketplace</div>
              </div>
            </Link>
          </div>

          {/* Right: Support + Notifications + User */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* 24x7 Support - desktop only */}
            <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-600 mr-4">
              <Phone className="w-3.5 h-3.5 text-green-600" />
              <span className="font-medium">24x7 Customer Support</span>
            </div>

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => { setShowNotifs(!showNotifs); setShowUserMenu(false); }}
                className="relative p-2.5 rounded-xl hover:bg-slate-100 transition"
              >
                <Bell className="w-5 h-5 text-slate-600" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifs && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 z-50">
                  <div className="flex items-center justify-between px-2 pb-2 border-b border-slate-100">
                    <span className="text-sm font-bold text-slate-800">Notifications</span>
                    <span className="text-xs text-slate-400">{unreadCount} unread</span>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-50 my-1">
                    {notifications.length === 0 ? (
                      <div className="text-center py-8 text-sm text-slate-400">No notifications yet</div>
                    ) : (
                      notifications.slice(0, 5).map((n) => (
                        <div
                          key={n.id}
                          onClick={() => handleNotifClick(n.id)}
                          className={`p-3 rounded-lg text-sm cursor-pointer transition ${
                            n.read ? 'opacity-60 hover:bg-slate-50' : 'bg-indigo-50/50 hover:bg-indigo-50'
                          }`}
                        >
                          <div className="font-semibold text-slate-800">{n.title}</div>
                          <div className="text-slate-500 text-xs mt-0.5">{n.message}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Menu */}
            {currentUser ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifs(false); }}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-200"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                    {currentUser.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="hidden md:block text-left">
                    <div className="text-xs font-semibold text-slate-800 max-w-[120px] truncate">
                      {currentUser.name}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 z-50">
                    <div className="px-3 py-3 border-b border-slate-100">
                      <div className="font-bold text-sm text-slate-800">{currentUser.name}</div>
                      <div className="text-xs text-slate-400 truncate">{currentUser.email}</div>
                    </div>
                    <div className="py-1">
                      <Link
                        href={getDashboardUrl(currentUser.role)}
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
                      >
                        <LayoutDashboard className="w-4 h-4 text-slate-500" />
                        My Dashboard
                      </Link>
                      <Link
                        href="/bookings"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
                      >
                        <Ticket className="w-4 h-4 text-slate-500" />
                        My Bookings
                      </Link>
                    </div>
                    <div className="pt-1 border-t border-slate-100">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 transition"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition"
              >
                <User className="w-4 h-4" />
                Log in / Sign up
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Service Tabs Row — desktop */}
      <div className="hidden lg:block bg-white">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex items-center gap-1">
            {/* Home tab */}
            <Link
              href="/"
              className={`flex items-center gap-2 px-5 py-3.5 border-b-[3px] transition-all text-sm font-semibold ${
                isHomePage
                  ? 'border-indigo-600 text-indigo-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <HomeIcon className="w-5 h-5" />
              Home
            </Link>

            {SERVICE_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = pathname === tab.href || pathname.startsWith(tab.href + '/');
              return (
                <Link
                  key={tab.name}
                  href={tab.href}
                  className={`relative flex items-center gap-2 px-5 py-3.5 border-b-[3px] transition-all text-sm font-semibold ${
                    isActive
                      ? `${tab.activeBorder} ${tab.color}`
                      : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? tab.color : 'text-slate-400'}`} />
                  {tab.name}
                  {tab.badge && (
                    <span className="absolute -top-0.5 right-0 px-1.5 py-0.5 rounded text-[8px] font-bold bg-orange-500 text-white leading-none whitespace-nowrap">
                      {tab.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            {/* Right side - booking link */}
            <div className="ml-auto flex items-center gap-2">
              <Link
                href="/bookings"
                className={`flex items-center gap-2 px-4 py-3.5 border-b-[3px] transition-all text-sm font-medium ${
                  pathname === '/bookings'
                    ? 'border-indigo-600 text-indigo-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Ticket className="w-4 h-4" />
                My Bookings
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-slate-100 shadow-lg">
          <div className="p-4 space-y-1">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                isHomePage ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <HomeIcon className="w-5 h-5" />
              Home
            </Link>
            {SERVICE_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = pathname === tab.href || pathname.startsWith(tab.href + '/');
              return (
                <Link
                  key={tab.name}
                  href={tab.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                    isActive ? `bg-slate-50 ${tab.color}` : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? tab.color : 'text-slate-400'}`} />
                  {tab.name}
                  {tab.badge && (
                    <span className="ml-auto px-2 py-0.5 rounded text-[10px] font-bold bg-orange-500 text-white">
                      {tab.badge}
                    </span>
                  )}
                </Link>
              );
            })}
            <div className="border-t border-slate-100 pt-2 mt-2">
              <Link
                href="/bookings"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                <Ticket className="w-5 h-5 text-slate-400" />
                My Bookings
              </Link>
              {currentUser && (
                <Link
                  href={getDashboardUrl(currentUser.role)}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  <LayoutDashboard className="w-5 h-5 text-slate-400" />
                  My Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
