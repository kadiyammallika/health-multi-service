'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home, Plane, Bus, Building2, Sparkles, Heart, Ticket,
  LayoutDashboard, Briefcase, LogOut, HelpCircle, Bell,
  X, Menu, Settings, MapPin, Globe
} from 'lucide-react';
import {
  getCurrentUser, getNotifications, logoutUser, getDashboardUrl
} from '@/services/storage';
import NavbarCurrencyConverter from '@/components/layout/NavbarCurrencyConverter';
import { useCurrency } from '@/components/ui/CurrencyProvider';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const sidebarRef = useRef(null);
  const hoverTimeout = useRef(null);
  const { currency, currencies } = useCurrency();
  const activeCurrencyInfo = currencies.find((c) => c.code === currency) || currencies[0];

  useEffect(() => {
    const sync = () => {
      setCurrentUser(getCurrentUser());
      setNotifications(getNotifications());
    };
    sync();
    window.addEventListener('auralife_storage_update', sync);
    return () => window.removeEventListener('auralife_storage_update', sync);
  }, []);

  const handleLogout = () => {
    logoutUser();
    router.push('/login');
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const isActive = (href) => {
    if (href === '/') return pathname === '/';
    return href && (pathname === href || pathname.startsWith(href + '/'));
  };

  const getDashHref = () => {
    if (!currentUser) return '/login';
    return getDashboardUrl(currentUser.role);
  };

  const handleMouseEnter = () => {
    clearTimeout(hoverTimeout.current);
    setExpanded(true);
  };

  const handleMouseLeave = () => {
    hoverTimeout.current = setTimeout(() => setExpanded(false), 200);
  };

  // All service nav items
  const allServiceItems = [
    { name: 'Flights', href: '/flights', icon: Plane, serviceKey: 'flights' },
    { name: 'Hotels', href: '/hotels', icon: Building2, serviceKey: 'hotels' },
    { name: 'Buses', href: '/buses', icon: Bus, serviceKey: 'buses' },
    { name: 'Health & Healing', href: '/wellness', icon: Sparkles, serviceKey: 'wellness' },
    { name: 'Properties', href: '/properties', icon: MapPin, serviceKey: 'properties' },
  ];

  // Filter services for providers — only show services they registered for
  const isProvider = currentUser?.role === 'provider' || currentUser?.accountType === 'provider';
  const isAdmin = currentUser?.role === 'admin' || currentUser?.accountType === 'admin';
  const providerServices = currentUser?.services || [];

  const visibleServiceItems = isProvider && providerServices.length > 0
    ? allServiceItems.filter(item => providerServices.includes(item.serviceKey))
    : allServiceItems; // customers and admins see all

  // Navigation items for the icon strip
  const iconItems = isAdmin
    ? [
        { name: 'Home', href: '/', icon: Home },
        ...visibleServiceItems,
        { divider: true },
        { name: 'Admin Dashboard', href: '/dashboard/admin', icon: LayoutDashboard },
        { name: 'Notifications', href: '#notifications', icon: Bell, badge: unreadCount || null },
      ]
    : [
        { name: 'Home', href: '/', icon: Home },
        ...visibleServiceItems,
        { divider: true },
        { name: 'Dashboard', href: getDashHref(), icon: LayoutDashboard },
        { name: 'Bookings', href: '/bookings', icon: Ticket },
        { name: 'Notifications', href: '#notifications', icon: Bell, badge: unreadCount || null },
      ];

  // Expanded panel sections
  const expandedSections = isAdmin
    ? [
        { items: [{ name: 'Home', href: '/', icon: Home }] },
        { label: 'Browse Services', items: visibleServiceItems },
        {
          label: 'Administration',
          items: [
            { name: 'Admin Dashboard', href: '/dashboard/admin', icon: LayoutDashboard },
            { name: 'Notifications', href: '#notifications', icon: Bell, badge: unreadCount || null },
          ],
        },
      ]
    : [
        { items: [{ name: 'Home', href: '/', icon: Home }] },
        { label: isProvider ? 'My Services' : 'Browse Services', items: visibleServiceItems },
        {
          items: [
            { name: 'Dashboard', href: getDashHref(), icon: LayoutDashboard },
            { name: 'My Bookings', href: '/bookings', icon: Ticket },
            { name: 'Notifications', href: '#notifications', icon: Bell, badge: unreadCount || null },
          ],
        },
        {
          items: [
            ...(isProvider ? [] : [{ name: 'List Your Services', href: '/partner/register', icon: Briefcase }]),
            { name: 'Help & Support', href: '#', icon: HelpCircle },
          ].filter(Boolean),
        },
      ];

  return (
    <>
      {/* ===== DESKTOP: Two-panel Supabase sidebar ===== */}
      <div
        ref={sidebarRef}
        className="hidden lg:flex h-screen sticky top-0 z-40"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Panel 1: Thin icon strip (always visible) */}
        <div className="w-[52px] bg-[#1c1c1c] flex flex-col items-center border-r border-[#2e2e2e] shrink-0">
          {/* Logo */}
          <div className="w-full flex justify-center py-3 border-b border-[#2e2e2e]">
            <Link href="/" prefetch={false}>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            </Link>
          </div>

          {/* Icon list */}
          <div className="flex-1 w-full flex flex-col items-center py-2 gap-0.5 overflow-y-auto">
            {iconItems.map((item, i) => {
              if (item.divider) {
                return <div key={`d-${i}`} className="w-6 h-px bg-[#2e2e2e] my-2" />;
              }
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group relative w-10 h-10 flex items-center justify-center rounded-md transition-colors
                    ${active
                      ? 'bg-[#2a2a2a] text-white'
                      : 'text-[#8f8f8f] hover:bg-[#252525] hover:text-[#ededed]'
                    }`}
                >
                  {/* Active indicator - green left bar like Supabase */}
                  {active && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-emerald-500" />
                  )}
                  <Icon className="w-[18px] h-[18px]" strokeWidth={1.8} />
                  {item.badge && (
                    <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-amber-500 text-[9px] font-bold text-black flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Bottom icons */}
          <div className="w-full flex flex-col items-center py-2 border-t border-[#2e2e2e] gap-0.5">
            {/* Currency selector icon */}
            <div className="relative group">
              <NavbarCurrencyConverter compact />
            </div>
            <button
              onClick={handleLogout}
              className="w-10 h-10 flex items-center justify-center rounded-md text-[#8f8f8f] hover:bg-[#252525] hover:text-red-400 transition-colors"
            >
              <LogOut className="w-[18px] h-[18px]" strokeWidth={1.8} />
            </button>
            {/* User avatar */}
            {currentUser && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold mt-1 mb-1">
                {currentUser.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            )}
          </div>
        </div>

        {/* Panel 2: Expanded text panel (slides out on hover) */}
        <div
          className={`bg-[#1c1c1c] border-r border-[#2e2e2e] overflow-hidden transition-all duration-200 ease-in-out flex flex-col
            ${expanded ? 'w-[220px] opacity-100' : 'w-0 opacity-0'}`}
        >
          {/* Header with app name */}
          <div className="h-[52px] flex items-center px-4 border-b border-[#2e2e2e] shrink-0">
            <span className="text-[14px] font-semibold text-white truncate">
              OneConnect
            </span>
          </div>

          {/* Nav sections */}
          <nav className="flex-1 overflow-y-auto py-2">
            {expandedSections.map((section, si) => (
              section.items.length === 0 ? null : (
              <div key={si}>
                {si > 0 && <div className="mx-3 my-2 h-px bg-[#2e2e2e]" />}
                {section.label && (
                  <div className="px-4 pt-1 pb-1 text-[10px] font-semibold text-[#555] uppercase tracking-wider">
                    {section.label}
                  </div>
                )}
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-[7px] mx-1 rounded-md text-[13px] transition-colors
                        ${active
                          ? 'bg-[#2a2a2a] text-white font-medium'
                          : 'text-[#a0a0a0] hover:bg-[#252525] hover:text-[#ededed]'
                        }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" strokeWidth={1.8} />
                      <span className="truncate">{item.name}</span>
                      {item.badge && (
                        <span className="ml-auto px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
              )
            ))}
          </nav>

          {/* Currency info in expanded panel */}
          <div className="border-t border-[#2e2e2e] px-4 py-2 shrink-0">
            <div className="flex items-center gap-2 text-[12px] text-[#a0a0a0]">
              <span className="text-base">{activeCurrencyInfo.flag}</span>
              <span className="font-medium text-white">{activeCurrencyInfo.code}</span>
              <span className="text-[10px] text-[#666]">{activeCurrencyInfo.country}</span>
            </div>
          </div>

          {/* Bottom user info */}
          {currentUser && (
            <div className="border-t border-[#2e2e2e] px-4 py-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                  {currentUser.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="min-w-0">
                  <div className="text-[12px] font-medium text-white truncate">{currentUser.name}</div>
                  <div className="text-[10px] text-[#666] truncate">{currentUser.email}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ===== MOBILE: Hamburger + slide-in ===== */}
      <div className="fixed top-3 left-3 z-50 lg:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="w-10 h-10 rounded-xl bg-[#1c1c1c]/90 backdrop-blur text-white flex items-center justify-center shadow-lg"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div
        className={`fixed top-0 left-0 bottom-0 w-[280px] bg-[#1c1c1c] z-50 transform transition-transform duration-300 lg:hidden flex flex-col
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Mobile header */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-[#2e2e2e] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-[15px] font-bold text-white">OneConnect</span>
          </div>
          <button onClick={() => setMobileOpen(false)} className="p-1 text-[#8f8f8f]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User info */}
        {currentUser && (
          <div className="px-4 py-3 border-b border-[#2e2e2e]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                {currentUser.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div>
                <div className="text-[13px] font-semibold text-white">{currentUser.name}</div>
                <div className="text-[11px] text-[#666]">{currentUser.email}</div>
              </div>
            </div>
          </div>
        )}

        {/* Mobile nav */}
        <nav className="flex-1 overflow-y-auto py-2">
          {expandedSections.map((section, si) => (
            <div key={si}>
              {si > 0 && <div className="mx-4 my-2 h-px bg-[#2e2e2e]" />}
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded-md text-[14px] transition-colors
                      ${active
                        ? 'bg-[#2a2a2a] text-white font-medium'
                        : 'text-[#a0a0a0] hover:bg-[#252525] hover:text-white'
                      }`}
                  >
                    <Icon className="w-[18px] h-[18px] shrink-0" strokeWidth={1.8} />
                    <span>{item.name}</span>
                    {item.badge && (
                      <span className="ml-auto px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Mobile currency selector */}
        <div className="border-t border-[#2e2e2e] px-3 py-2">
          <NavbarCurrencyConverter isMobile onCloseMobile={() => setMobileOpen(false)} />
        </div>

        {/* Mobile bottom */}
        <div className="border-t border-[#2e2e2e] p-3 space-y-1">
          {!isAdmin && !isProvider && (
            <Link
              href="/partner/register"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-md text-[#a0a0a0] hover:bg-[#252525] hover:text-white text-[14px]"
            >
              <Briefcase className="w-[18px] h-[18px]" strokeWidth={1.8} />
              <span>List Your Services</span>
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-md text-[#a0a0a0] hover:bg-red-500/10 hover:text-red-400 text-[14px] w-full"
          >
            <LogOut className="w-[18px] h-[18px]" strokeWidth={1.8} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );
}
