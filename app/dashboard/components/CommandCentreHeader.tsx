'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { DashboardKPIs } from '@/lib/dashboardFetch';
import { usePanicMode } from './PanicModeContext';

interface CommandCentreHeaderProps {
  kpis: DashboardKPIs;
  lastUpdated: Date | null;
  onRefresh: () => void;
}

function PulsingDot({ color }: { color: string }) {
  return (
    <span className="relative flex h-3 w-3 shrink-0">
      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${color} opacity-75`}></span>
      <span className={`relative inline-flex rounded-full h-3 w-3 ${color}`}></span>
    </span>
  );
}

function StatusPill({ label, value, color, dotColor, href }: { label: string; value: number | string; color: string; dotColor: string; href: string }) {
  const isWarning = typeof value === 'number' && value > 0;
  return (
    <Link href={href} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-all cursor-pointer">
      <PulsingDot color={dotColor} />
      <div>
        <div className={`text-xs font-medium ${color}`}>{label}</div>
        <div className={`text-lg font-bold text-white ${isWarning ? 'animate-pulse' : ''}`}>{value}</div>
      </div>
    </Link>
  );
}

export default function CommandCentreHeader({ kpis, lastUpdated, onRefresh }: CommandCentreHeaderProps) {
  const [clock, setClock] = useState(new Date());
  const { triggerPanicMode, panicMode } = usePanicMode();

  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const formatTime = (d: Date) => d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

  const canTriggerPanic = kpis.highCriticalIncidents > 0 || kpis.openIncidents > 0;

  return (
    <div className="mb-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-white tracking-tight">Operation Dashboard</h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
              <PulsingDot color="bg-emerald-500" />
              LIVE
            </span>

            {/* Panic Mode trigger */}
            {canTriggerPanic && !panicMode && (
              <button
                onClick={triggerPanicMode}
                className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-400 text-xs font-semibold border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/40 transition-all cursor-pointer"
                title="Dim non-critical widgets, spotlight active incidents"
              >
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                </span>
                Panic Mode
              </button>
            )}
          </div>
          <p className="text-sm text-gray-500">{today} <span className="text-gray-400 font-mono ml-2">{formatTime(clock)} UTC</span></p>
        </div>
        <button
          onClick={onRefresh}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 cursor-pointer mt-1 whitespace-nowrap px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-all"
        >
          <div className="w-4 h-4 flex items-center justify-center">
            <i className="ri-refresh-line"></i>
          </div>
          <span>Last updated: {lastUpdated ? Math.floor((Date.now() - lastUpdated.getTime()) / 1000) < 60 ? 'Just now' : `${Math.floor((Date.now() - lastUpdated.getTime()) / 1000 / 60)}m ago` : 'Never'}</span>
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <StatusPill label="On Shift" value={kpis.activeGuards} color="text-emerald-400" dotColor="bg-emerald-500" href="/guards" />
        <StatusPill label="Late" value={kpis.lateGuards} color={kpis.lateGuards > 0 ? 'text-amber-400' : 'text-gray-500'} dotColor={kpis.lateGuards > 0 ? 'bg-amber-500' : 'bg-gray-600'} href="/guards" />
        <StatusPill label="Missing" value={kpis.openShifts} color={kpis.openShifts > 0 ? 'text-red-400' : 'text-gray-500'} dotColor={kpis.openShifts > 0 ? 'bg-red-500' : 'bg-gray-600'} href="/rotas" />
        <StatusPill label="Open Incidents" value={kpis.openIncidents} color={kpis.openIncidents > 0 ? 'text-red-400' : 'text-gray-500'} dotColor={kpis.openIncidents > 0 ? 'bg-red-500' : 'bg-gray-600'} href="/incidents?status=open" />
        <StatusPill label="Critical" value={kpis.highCriticalIncidents} color={kpis.highCriticalIncidents > 0 ? 'text-red-500' : 'text-gray-500'} dotColor={kpis.highCriticalIncidents > 0 ? 'bg-red-500' : 'bg-gray-600'} href="/incidents?severity=critical,high" />
        <StatusPill label="Patrol %" value={`${kpis.patrolCompletion}%`} color={kpis.patrolCompletion >= 90 ? 'text-emerald-400' : kpis.patrolCompletion >= 75 ? 'text-amber-400' : 'text-red-400'} dotColor={kpis.patrolCompletion >= 90 ? 'bg-emerald-500' : kpis.patrolCompletion >= 75 ? 'bg-amber-500' : 'bg-red-500'} href="/sites" />
        <StatusPill label="Missed Patrols" value={kpis.missedPatrols} color={kpis.missedPatrols > 0 ? 'text-red-400' : 'text-gray-500'} dotColor={kpis.missedPatrols > 0 ? 'bg-red-500' : 'bg-gray-600'} href="/sites" />
        <StatusPill label="Avg Risk" value={kpis.avgRiskScore} color={kpis.avgRiskScore <= 30 ? 'text-emerald-400' : kpis.avgRiskScore <= 60 ? 'text-amber-400' : 'text-red-400'} dotColor={kpis.avgRiskScore <= 30 ? 'bg-emerald-500' : kpis.avgRiskScore <= 60 ? 'bg-amber-500' : 'bg-red-500'} href="/sites" />
      </div>
    </div>
  );
}