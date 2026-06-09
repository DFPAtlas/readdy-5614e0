'use client';

import Link from 'next/link';

const actions = [
  { label: 'Create Incident', icon: 'ri-alarm-warning-line', href: '/incidents', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
  { label: 'Add OB Entry', icon: 'ri-book-line', href: '/occurrence-book', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  { label: 'Patrol Monitoring', icon: 'ri-route-line', href: '/dashboard/patrol-monitoring', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  { label: 'Open Rota', icon: 'ri-calendar-event-line', href: '/rotas', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  { label: 'Raise Ticket', icon: 'ri-customer-service-2-line', href: '/client/support/new', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
];

export default function QuickActionBar() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {actions.map((a) => (
        <Link key={a.label} href={a.href} className="flex items-center gap-3 px-4 py-3 rounded-lg border bg-[#0f172a]/70 backdrop-blur-sm hover:bg-white/5 transition-all cursor-pointer">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${a.color}`}>
            <div className="w-4 h-4 flex items-center justify-center">
              <i className={`${a.icon}`}></i>
            </div>
          </div>
          <span className="text-sm font-medium text-gray-300">{a.label}</span>
        </Link>
      ))}
    </div>
  );
}