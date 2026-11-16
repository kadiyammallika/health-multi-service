'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Ticket, Compass, Heart, User } from 'lucide-react';
import { getCurrentUser, getDashboardUrl } from '@/services/storage';
import { useState, useEffect } from 'react';

export default function BottomNav() {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    setCurrentUser(getCurrentUser());
    const sync = () => setCurrentUser(getCurrentUser());
    window.addEventListener('auralife_storage_update', sync);
    return () => window.removeEventListener('auralife_storage_update', sync);
  }, []);

  const isAdmin = currentUser?.role === 'admin' || currentUser?.accountType === 'admin';

  const tabs = isAdmin
    ? [
        { name: 'Home', href: '/', icon: Home },
        { name: 'Explore', href: '/flights', icon: Compass, isCenter: true },
        { name: 'Admin', href: '/dashboard/admin', icon: User },
      ]
    : [
        { name: 'Home', href: '/', icon: Home },
        { name: 'My Trips', href: '/bookings', icon: Ticket },
        { name: 'Explore', href: '/flights', icon: Compass, isCenter: true },
        { name: 'Health & Healing', href: '/wellness', icon: Heart },
        { name: 'Profile', href: currentUser ? getDashboardUrl(currentUser.role) : '/login', icon: User },
      ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-slate-200 shadow-lg lg:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.href === '/'
            ? pathname === '/'
            : pathname.startsWith(tab.href);

          if (tab.isCenter) {
            return (
              <Link
                key={tab.name}
                href={tab.href}
                prefetch={false}
                className="flex flex-col items-center -mt-5"
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : 'bg-indigo-600 text-white'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-[10px] mt-1 font-semibold ${
                  isActive ? 'text-indigo-600' : 'text-slate-500'
                }`}>
                  {tab.name}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={tab.name}
              href={tab.href}
              prefetch={false}
              className="flex flex-col items-center gap-0.5 min-w-[56px]"
            >
              <Icon className={`w-5 h-5 ${
                isActive ? 'text-indigo-600' : 'text-slate-400'
              }`} />
              <span className={`text-[10px] font-semibold ${
                isActive ? 'text-indigo-600' : 'text-slate-500'
              }`}>
                {tab.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
