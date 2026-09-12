'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useNotifications } from '@/lib/useNotifications';
import { useAuth } from '@/lib/auth';

const tabs = [
  { route: '/guard', icon: 'ri-home-line', activeIcon: 'ri-home-fill', label: 'Home' },
  { route: '/guard/patrol', icon: 'ri-walk-line', activeIcon: 'ri-walk-fill', label: 'Patrols' },
  { route: '/guard/notices', icon: 'ri-article-line', activeIcon: 'ri-article-fill', label: 'Notices' },
  { route: '/guard/shifts', icon: 'ri-calendar-event-line', activeIcon: 'ri-calendar-event-fill', label: 'My Shifts' },
  { route: '/guard/messages', icon: 'ri-chat-3-line', activeIcon: 'ri-chat-3-fill', label: 'Messages' },
  { route: '/guard/training', icon: 'ri-graduation-cap-line', activeIcon: 'ri-graduation-cap-fill', label: 'Training' },
  { route: '/guard/menu', icon: 'ri-user-line', activeIcon: 'ri-user-fill', label: 'Profile' },
];

export default function GuardBottomNav() {
  const pathname = usePathname();
  const { profile } = useAuth();
  const { unreadCount } = useNotifications(profile?.id || null);

  const isActive = (route: string) => {
    if (route === '/guard') return pathname === '/guard' || pathname === '/guard/';
    return pathname?.startsWith(route);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-lg border-t border-white/5">
      <div className="flex items-stretch h-[72px] max-w-lg mx-auto">
        {tabs.map((tab) => {
          const active = isActive(tab.route);
          return (
            <Link
              key={tab.route}
              href={tab.route}
              className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer ${
                active ? 'text-[#3b82f6]' : 'text-gray-500'
              }`}
            >
              <div className="relative w-9 h-9 flex items-center justify-center">
                <i className={`${active ? tab.activeIcon : tab.icon} text-xl`}></i>
                {tab.route === '/guard' && unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              <span className="text-[11px] font-medium whitespace-nowrap">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}