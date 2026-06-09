'use client';

import { useAuth } from '@/lib/auth';

interface WelcomeHeaderProps {
  activeShifts: number;
  activeSites: number;
  openIncidents: number;
  lastUpdated: Date | null;
  onRefresh: () => void;
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function formatLastUpdated(d: Date | null): string {
  if (!d) return 'Never';
  const diff = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

export default function WelcomeHeader({ activeShifts, activeSites, openIncidents, lastUpdated, onRefresh }: WelcomeHeaderProps) {
  const { profile } = useAuth();
  const firstName = profile?.first_name || 'there';
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const summary = `${activeShifts} active shift${activeShifts !== 1 ? 's' : ''} across ${activeSites} site${activeSites !== 1 ? 's' : ''}${openIncidents > 0 ? `. ${openIncidents} incident${openIncidents !== 1 ? 's' : ''} open.` : '. No open incidents.'}`;

  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">
          {getGreeting()}, {firstName}
        </h1>
        <p className="text-gray-500 text-sm mb-1">{today}</p>
        <p className="text-gray-400 text-base">{summary}</p>
      </div>
      <button
        onClick={onRefresh}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 cursor-pointer mt-1 whitespace-nowrap"
      >
        <div className="w-4 h-4 flex items-center justify-center">
          <i className="ri-refresh-line"></i>
        </div>
        <span>Last updated: {formatLastUpdated(lastUpdated)}</span>
      </button>
    </div>
  );
}