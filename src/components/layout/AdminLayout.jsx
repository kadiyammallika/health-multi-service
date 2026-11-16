'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Ticket,
  Building,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Bell,
  Activity,
  FileText,
  Database,
  Search
} from 'lucide-react';
import { getCurrentUser, logoutUser, getNotifications } from '@/services/storage';
import NavbarCurrencyConverter from '@/components/layout/NavbarCurrencyConverter';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentUser, setCurrentUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    setCurrentUser(getCurrentUser());
    setNotifications(getNotifications());
    const sync = () => {
      setCurrentUser(getCurrentUser());
      setNotifications(getNotifications());
    };
    window.addEventListener('auralife_storage_update', sync);
    return () => window.removeEventListener('auralife_storage_update', sync);
  }, []);

  const handleLogout = () => {
    logoutUser();
    router.push('/login');
  };

  const managementLinks = [
    { name: 'Dashboard', href: '/dashboard/admin', icon: LayoutDashboard, exact: true },
    { name: 'All Users', href: '/dashboard/admin?tab=users', icon: Users, tab: 'users' },
    { name: 'Partner Verification', href: '/dashboard/admin?tab=partners', icon: Briefcase, tab: 'partners' },
    { name: 'Bookings Ledger', href: '/dashboard/admin?tab=bookings', icon: Ticket, tab: 'bookings' },
    { name: 'Service Categories', href: '/dashboard/admin?tab=categories', icon: Building, tab: 'categories' },
    { name: 'Master Data', href: '/dashboard/admin?tab=master-data', icon: Database, tab: 'master-data' },
  ];

  const systemLinks = [
    { name: 'Platform Health', href: '/dashboard/admin', icon: Activity },
    { name: 'Audit Logs', href: '/dashboard/admin', icon: FileText },
  ];

  const unreadCount = notifications.filter((n) => !n.read).length;

  const isLinkActive = (link) => {
    const currentTab = searchParams.get('tab') || 'overview';
    if (link.tab) return currentTab === link.tab;
    if (link.exact) return !searchParams.get('tab') || currentTab === 'overview';
    return false;
  };

  const getBreadcrumb = () => {
    const tab = searchParams.get('tab');
    const tabNames = {
      users: 'All Users',
      partners: 'Partner Verification',
      bookings: 'Bookings Ledger',
      categories: 'Service Categories',
      'master-data': 'Master Data',
    };
    return tabNames[tab] || 'Dashboard';
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar Backdrop (Mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — Clean White */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 w-[260px] bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } flex flex-col`}
      >
        {/* Logo Area */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-gray-100">
          <Link href="/dashboard/admin" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-sm">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-sm font-bold text-gray-900 tracking-tight">OneConnect</span>
              <span className="block text-[10px] font-semibold text-indigo-600 uppercase tracking-wider">Admin Panel</span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Admin User Info */}
        {currentUser && (
          <div className="px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-50 border-2 border-indigo-100 flex items-center justify-center">
                <span className="text-sm font-bold text-indigo-600">
                  {currentUser.name?.charAt(0)?.toUpperCase() || 'A'}
                </span>
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-gray-900 truncate">{currentUser.name}</div>
                <div className="text-[11px] text-gray-400 truncate">{currentUser.email}</div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {/* Management Section */}
          <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 px-3 mb-2">
            Management
          </div>
          <div className="space-y-0.5">
            {managementLinks.map((link) => {
              const Icon = link.icon;
              const active = isLinkActive(link);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all ${
                    active
                      ? 'bg-indigo-50 text-indigo-700 font-semibold'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`w-[18px] h-[18px] ${active ? 'text-indigo-600' : 'text-gray-400'}`} strokeWidth={1.8} />
                  <span>{link.name}</span>
                  {active && (
                    <ChevronRight className="w-3.5 h-3.5 ml-auto text-indigo-400" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* System Section */}
          <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 px-3 mt-5 mb-2">
            System
          </div>
          <div className="space-y-0.5">
            {systemLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-all"
                >
                  <Icon className="w-[17px] h-[17px] text-gray-400" strokeWidth={1.8} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Notifications */}
          <div className="mt-5 px-3">
            <Link
              href="#notifications"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-all"
            >
              <Bell className="w-[17px] h-[17px] text-gray-400" strokeWidth={1.8} />
              <span>Notifications</span>
              {unreadCount > 0 && (
                <span className="ml-auto px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold">
                  {unreadCount}
                </span>
              )}
            </Link>
          </div>
        </nav>

        {/* Bottom — Sign Out */}
        <div className="px-3 py-3 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium text-red-500 hover:bg-red-50 transition-all"
          >
            <LogOut className="w-[18px] h-[18px]" strokeWidth={1.8} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar — Clean White */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100 transition lg:hidden"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            {/* Breadcrumb style */}
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <span className="text-gray-400">Admin</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
              <span className="font-semibold text-gray-700">{getBreadcrumb()}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="hidden md:flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent text-sm text-gray-600 placeholder:text-gray-400 outline-none w-40"
              />
            </div>

            {/* Currency Selector */}
            <NavbarCurrencyConverter />

            {/* Notifications */}
            <button className="relative p-2 rounded-lg hover:bg-gray-100 transition">
              <Bell className="w-5 h-5 text-gray-500" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Admin Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-100">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span className="text-xs font-semibold text-indigo-700">Admin</span>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}
