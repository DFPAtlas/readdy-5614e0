'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import CheckInForm from './components/CheckInForm';
import PatrolLog from './components/PatrolLog';
import IncidentReport from './components/IncidentReport';
import SiteStatus from './components/SiteStatus';
import EmergencyActions from './components/EmergencyActions';

export default function GuardDashboard() {
  const { currentUser, profile, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('checkin');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    if (!authLoading) {
      if (!currentUser) {
        router.replace('/login');
      } else if (profile && profile.role !== 'guard' && !['super_admin', 'company_admin', 'operations_manager'].includes(profile.role)) {
        if (profile.role === 'client') router.replace('/client');
      }
    }

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, [currentUser, profile, authLoading, router]);

  if (authLoading || !currentUser) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const guardInfo = {
    name: profile?.first_name + ' ' + (profile?.last_name || '') || 'Guard',
    id: profile?.id?.slice(0, 8) || 'G-0000',
    site: 'Westfield Shopping Centre',
    shift: 'Day Shift (06:00 - 18:00)',
    position: 'Security Officer'
  };

  const siteInfo = {
    name: 'Westfield Shopping Centre',
    address: '123 High Street, Manchester M1 1AA',
    emergencyContact: '+44 161 999 0000',
    controlRoom: '+44 161 123 4567'
  };

  return (
    <div className="space-y-6">
      {/* Guard Status Bar */}
      <div className="bg-[#111827]/70 backdrop-blur-sm border border-white/10 rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
            <i className="ri-shield-user-line text-2xl text-blue-400"></i>
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">{guardInfo.name}</h1>
            <p className="text-sm text-gray-400">{guardInfo.position} — {guardInfo.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2 text-gray-300">
            <i className="ri-building-line text-blue-400"></i>
            {guardInfo.site}
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <i className="ri-time-line text-blue-400"></i>
            {guardInfo.shift}
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-emerald-400 font-medium">On Duty</span>
          </div>
          <div className="text-right hidden sm:block">
            <div className="text-xl font-mono font-bold text-white" suppressHydrationWarning={true}>
              {currentTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <button
          onClick={() => setActiveSection('checkin')}
          className={`p-4 rounded-xl text-left transition-all cursor-pointer whitespace-nowrap border ${
            activeSection === 'checkin'
              ? 'bg-blue-600/15 border-blue-500/30'
              : 'bg-[#111827]/60 border-white/10 hover:bg-white/5 hover:border-white/20'
          }`}
        >
          <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-blue-600/15 mb-3">
            <i className="ri-map-pin-line text-xl text-blue-400"></i>
          </div>
          <h3 className="font-medium text-white">Check-In</h3>
          <p className="text-sm text-gray-400 mt-1">Record location checks</p>
        </button>

        <button
          onClick={() => setActiveSection('patrol')}
          className={`p-4 rounded-xl text-left transition-all cursor-pointer whitespace-nowrap border ${
            activeSection === 'patrol'
              ? 'bg-emerald-600/15 border-emerald-500/30'
              : 'bg-[#111827]/60 border-white/10 hover:bg-white/5 hover:border-white/20'
          }`}
        >
          <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-emerald-600/15 mb-3">
            <i className="ri-walk-line text-xl text-emerald-400"></i>
          </div>
          <h3 className="font-medium text-white">Patrol</h3>
          <p className="text-sm text-gray-400 mt-1">Start/manage patrols</p>
        </button>

        <button
          onClick={() => setActiveSection('incident')}
          className={`p-4 rounded-xl text-left transition-all cursor-pointer whitespace-nowrap border ${
            activeSection === 'incident'
              ? 'bg-red-600/15 border-red-500/30'
              : 'bg-[#111827]/60 border-white/10 hover:bg-white/5 hover:border-white/20'
          }`}
        >
          <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-red-600/15 mb-3">
            <i className="ri-alert-line text-xl text-red-400"></i>
          </div>
          <h3 className="font-medium text-white">Incident</h3>
          <p className="text-sm text-gray-400 mt-1">Report incidents</p>
        </button>

        <button
          onClick={() => setActiveSection('status')}
          className={`p-4 rounded-xl text-left transition-all cursor-pointer whitespace-nowrap border ${
            activeSection === 'status'
              ? 'bg-purple-600/15 border-purple-500/30'
              : 'bg-[#111827]/60 border-white/10 hover:bg-white/5 hover:border-white/20'
          }`}
        >
          <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-purple-600/15 mb-3">
            <i className="ri-settings-2-line text-xl text-purple-400"></i>
          </div>
          <h3 className="font-medium text-white">Site Status</h3>
          <p className="text-sm text-gray-400 mt-1">Update systems</p>
        </button>
      </div>

      {/* Quick link to overrule */}
      <div className="flex justify-end">
        <Link
          href="/guard-dashboard/overrule"
          className="inline-flex items-center gap-2 bg-blue-600/15 hover:bg-blue-600/25 border border-blue-500/30 text-blue-400 px-4 py-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap text-sm font-medium"
        >
          <i className="ri-settings-line"></i>
          Site Management Dashboard
        </Link>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {activeSection === 'checkin' && <CheckInForm />}
          {activeSection === 'patrol' && <PatrolLog />}
          {activeSection === 'incident' && <IncidentReport />}
          {activeSection === 'status' && <SiteStatus />}
        </div>

        <div className="lg:col-span-1">
          <EmergencyActions />
        </div>
      </div>
    </div>
  );
}