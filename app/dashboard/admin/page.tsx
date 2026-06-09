'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAdminData } from '@/lib/useAdmin';
import AITooledOperationsCopilot from '@/app/dashboard/components/AITooledOperationsCopilot';
import CommandCentreHeader from '@/app/dashboard/components/CommandCentreHeader';

function StatCard({ label, value, icon, color, href }: { label: string; value: number; icon: string; color: string; href: string }) {
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    blue: { bg: 'bg-blue-600/10', text: 'text-blue-400', border: 'border-blue-600/20' },
    emerald: { bg: 'bg-emerald-600/10', text: 'text-emerald-400', border: 'border-emerald-600/20' },
    amber: { bg: 'bg-amber-600/10', text: 'text-amber-400', border: 'border-amber-600/20' },
    purple: { bg: 'bg-purple-600/10', text: 'text-purple-400', border: 'border-purple-600/20' },
    red: { bg: 'bg-red-600/10', text: 'text-red-400', border: 'border-red-600/20' },
  };
  const c = colors[color] || colors.blue;
  return (
    <Link
      href={href}
      className={`bg-[#111827] border ${c.border} rounded-xl p-5 hover:border-gray-700 transition-all group`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-lg ${c.bg} flex items-center justify-center`}>
          <div className={`w-5 h-5 flex items-center justify-center ${c.text}`}>
            <i className={icon}></i>
          </div>
        </div>
        <div className="w-6 h-6 flex items-center justify-center text-gray-600 group-hover:text-gray-400 transition-colors">
          <i className="ri-arrow-right-line"></i>
        </div>
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-sm text-gray-500 mt-0.5">{label}</div>
    </Link>
  );
}

function RecentList({
  title,
  items,
  icon,
  getLabel,
  getSub,
}: {
  title: string;
  items: { id: string; name: string; sub: string }[];
  icon: string;
  getLabel: (id: string) => string;
  getSub: (id: string) => string;
}) {
  return (
    <div className="bg-[#111827] border border-gray-800 rounded-xl">
      <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
        <h3 className="text-white font-semibold text-sm">{title}</h3>
        <div className="w-5 h-5 flex items-center justify-center text-gray-500">
          <i className={icon}></i>
        </div>
      </div>
      <div className="divide-y divide-gray-800">
        {items.length === 0 && (
          <div className="px-5 py-6 text-center text-sm text-gray-500">No records yet</div>
        )}
        {items.map((item) => (
          <div key={item.id} className="px-5 py-3 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
            <div>
              <p className="text-sm text-white font-medium">{getLabel(item.id)}</p>
              <p className="text-xs text-gray-500 mt-0.5">{getSub(item.id)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { sites, clients, guards, loading, error } = useAdminData();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="relative flex h-8 w-8">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-8 w-8 bg-blue-500"></span>
          </div>
          <p className="text-xs text-gray-500">Loading admin data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-sm text-gray-400 mt-0.5">Manage your sites, clients, and guards</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/admin/sites"
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600/15 text-blue-400 text-sm font-medium rounded-lg hover:bg-blue-600/25 transition-colors cursor-pointer whitespace-nowrap"
            >
              <div className="w-4 h-4 flex items-center justify-center">
                <i className="ri-building-line"></i>
              </div>
              Sites
            </Link>
            <Link
              href="/dashboard/admin/clients"
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600/15 text-emerald-400 text-sm font-medium rounded-lg hover:bg-emerald-600/25 transition-colors cursor-pointer whitespace-nowrap"
            >
              <div className="w-4 h-4 flex items-center justify-center">
                <i className="ri-briefcase-line"></i>
              </div>
              Clients
            </Link>
            <Link
              href="/dashboard/admin/guards"
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-amber-600/15 text-amber-400 text-sm font-medium rounded-lg hover:bg-amber-600/25 transition-colors cursor-pointer whitespace-nowrap"
            >
              <div className="w-4 h-4 flex items-center justify-center">
                <i className="ri-shield-user-line"></i>
              </div>
              Guards
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-sm text-red-400">
            <div className="w-5 h-5 flex items-center justify-center">
              <i className="ri-error-warning-line"></i>
            </div>
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard label="Total Sites" value={sites.length} icon="ri-building-line" color="blue" href="/dashboard/admin/sites" />
          <StatCard label="Clients" value={clients.length} icon="ri-briefcase-line" color="emerald" href="/dashboard/admin/clients" />
          <StatCard label="Guards" value={guards.length} icon="ri-shield-user-line" color="amber" href="/dashboard/admin/guards" />
          <StatCard label="Unassigned Sites" value={sites.filter(s => !s.client_id).length} icon="ri-alert-line" color="red" href="/dashboard/admin/sites" />
        </div>

        <div className="grid lg:grid-cols-2 gap-5">
          <RecentList
            title="Recent Sites"
            icon="ri-building-line"
            items={sites.slice(0, 5).map(s => ({ id: s.id, name: s.site_name, sub: s.client_name || 'No client' }))}
            getLabel={(id) => sites.find(s => s.id === id)?.site_name || ''}
            getSub={(id) => sites.find(s => s.id === id)?.client_name || 'No client'}
          />
          <RecentList
            title="Recent Clients"
            icon="ri-briefcase-line"
            items={clients.slice(0, 5).map(c => ({ id: c.id, name: c.name, sub: `${c.site_count || 0} sites · ${c.guard_count || 0} guards` }))}
            getLabel={(id) => clients.find(c => c.id === id)?.name || ''}
            getSub={(id) => {
              const c = clients.find(x => x.id === id);
              return `${c?.site_count || 0} sites · ${c?.guard_count || 0} guards`;
            }}
          />
        </div>
      </div>

      <AITooledOperationsCopilot />
    </div>
  );
}