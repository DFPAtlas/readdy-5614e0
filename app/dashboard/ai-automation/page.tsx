'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useIncidents } from '@/lib/useIncidents';
import { useSupportTickets } from '@/lib/useSupportTickets';
import { useSOPAcknowledgements } from '@/lib/useSOPAcknowledgements';
import { useAvailableSOPs } from '@/lib/useAvailableSOPs';
import RotaHelperCard from './RotaHelperCard';
import { FeatureGate } from '@/lib/useEntitlements';

interface AIModuleCard {
  number: number;
  title: string;
  description: string;
  icon: string;
  iconColor: string;
  bgColor: string;
  status: 'Active' | 'Needs Review' | 'Disabled';
  href: string;
  metrics: Array<{ label: string; value: number | string; color?: string }>;
  badge?: { value: number; color: string };
}

function StatusBadge({ status }: { status: AIModuleCard['status'] }) {
  const color =
    status === 'Active'
      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25'
      : status === 'Needs Review'
      ? 'bg-amber-500/15 text-amber-400 border-amber-500/25'
      : 'bg-gray-500/15 text-gray-400 border-gray-500/25';

  const dot = status === 'Active' ? 'bg-emerald-400' : status === 'Needs Review' ? 'bg-amber-400' : 'bg-gray-400';

  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full border ${color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`}></span>
      {status}
    </span>
  );
}

function AIModuleCardUI({ module }: { module: AIModuleCard }) {
  return (
    <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 flex flex-col gap-4 hover:border-blue-500/30 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${module.bgColor} flex items-center justify-center flex-shrink-0`}>
            <div className={`w-6 h-6 flex items-center justify-center ${module.iconColor}`}>
              <i className={`${module.icon} text-lg`}></i>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Module {module.number}</span>
              {module.badge && module.badge.value > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${module.badge.color}`}>
                  {module.badge.value}
                </span>
              )}
            </div>
            <h3 className="text-base font-semibold text-white leading-tight">{module.title}</h3>
          </div>
        </div>
        <StatusBadge status={module.status} />
      </div>

      <p className="text-xs text-gray-500 leading-relaxed">{module.description}</p>

      <div className="grid grid-cols-1 gap-2">
        {module.metrics.map((m) => (
          <div key={m.label} className="flex items-center justify-between py-1.5 border-b border-gray-800/60 last:border-0">
            <span className="text-xs text-gray-400">{m.label}</span>
            <span className={`text-sm font-semibold ${m.color || 'text-gray-300'}`}>{m.value}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 pt-1">
        <Link
          href={module.href}
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors cursor-pointer whitespace-nowrap"
        >
          <div className="w-4 h-4 flex items-center justify-center">
            <i className="ri-external-link-line text-sm"></i>
          </div>
          Open Module
        </Link>
        {module.number === 4 && (
          <Link
            href="/sop-builder"
            className="px-3 py-2.5 rounded-lg border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 text-sm transition-colors cursor-pointer whitespace-nowrap"
            title="SOP Builder"
          >
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-draft-line text-sm"></i>
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}

export default function AIAutomationHub() {
  const { profile, company } = useAuth();
  const [mounted, setMounted] = useState(false);

  const { tickets } = useSupportTickets();
  const { incidents } = useIncidents();
  const { docs: sops, loading: sopsLoading } = useAvailableSOPs();
  const { stats } = useSOPAcknowledgements();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Module 1: Support Ticket AI Triage
  const unresolvedTickets = tickets.filter(t => t.status !== 'resolved' && t.status !== 'closed').length;
  const highPriorityTickets = tickets.filter(t => t.priority === 'high' || t.priority === 'urgent').length;
  const newTickets = tickets.filter(t => t.status === 'new').length;

  const module1: AIModuleCard = {
    number: 1,
    title: 'Support Ticket AI Triage',
    description: 'AI automatically triages, categorises, and routes support tickets to the right team member based on urgency, keywords, and client history.',
    icon: 'ri-customer-service-2-line',
    iconColor: 'text-cyan-400',
    bgColor: 'bg-cyan-500/15',
    status: unresolvedTickets > 5 ? 'Needs Review' : 'Active',
    href: profile?.role === 'super_admin' ? '/super-admin/support' : '/client/support',
    metrics: [
      { label: 'Open Tickets', value: unresolvedTickets, color: unresolvedTickets > 5 ? 'text-amber-400' : 'text-gray-300' },
      { label: 'High Priority', value: highPriorityTickets, color: highPriorityTickets > 0 ? 'text-red-400' : 'text-gray-300' },
      { label: 'New Today', value: newTickets, color: newTickets > 0 ? 'text-cyan-400' : 'text-gray-300' },
    ],
    badge: unresolvedTickets > 0 ? { value: unresolvedTickets, color: 'bg-cyan-500/20 text-cyan-400' } : undefined,
  };

  // Module 2: Incident Report Checker
  const openIncidents = incidents.filter(i => i.status !== 'resolved' && i.status !== 'closed').length;
  const criticalIncidents = incidents.filter(i => i.severity === 'critical').length;
  const highIncidents = incidents.filter(i => i.severity === 'high').length;

  const module2: AIModuleCard = {
    number: 2,
    title: 'Incident Report Checker',
    description: 'AI reviews incident reports for completeness, flags missing details, detects severity mismatches, and ensures all mandatory fields are filled.',
    icon: 'ri-alarm-warning-line',
    iconColor: 'text-rose-400',
    bgColor: 'bg-rose-500/15',
    status: criticalIncidents > 0 ? 'Needs Review' : 'Active',
    href: '/incidents',
    metrics: [
      { label: 'Open Incidents', value: openIncidents, color: openIncidents > 0 ? 'text-amber-400' : 'text-gray-300' },
      { label: 'Critical', value: criticalIncidents, color: criticalIncidents > 0 ? 'text-red-400' : 'text-gray-300' },
      { label: 'High Severity', value: highIncidents, color: highIncidents > 0 ? 'text-orange-400' : 'text-gray-300' },
    ],
    badge: criticalIncidents > 0 ? { value: criticalIncidents, color: 'bg-red-500/20 text-red-400' } : openIncidents > 0 ? { value: openIncidents, color: 'bg-amber-500/20 text-amber-400' } : undefined,
  };

  // Module 3: Daily Site Summary
  const module3: AIModuleCard = {
    number: 3,
    title: 'Daily Site Summary',
    description: 'AI generates daily summaries of site activity — patrol completions, incidents, occurrence book entries, and guard status — delivered automatically.',
    icon: 'ri-file-list-3-line',
    iconColor: 'text-sky-400',
    bgColor: 'bg-sky-500/15',
    status: 'Active',
    href: '/dashboard/ai-assistant',
    metrics: [
      { label: 'Sites Monitored', value: company?.site_count || 0, color: 'text-gray-300' },
      { label: 'Reports Generated', value: 0, color: 'text-gray-300' },
      { label: 'Last Summary', value: '—', color: 'text-gray-300' },
    ],
    badge: undefined,
  };

  // Module 4: SOP and Risk Assessment Builder
  const pendingAcks = stats?.pending_count || 0;
  const ackRate = stats?.acknowledgement_rate ?? 0;
  const sopCount = sops.length;

  const module4: AIModuleCard = {
    number: 4,
    title: 'SOP and Risk Assessment Builder',
    description: 'AI-powered SOP builder with risk assessment templates. Generate, review, and manage standard operating procedures with intelligent suggestions.',
    icon: 'ri-book-open-line',
    iconColor: 'text-indigo-400',
    bgColor: 'bg-indigo-500/15',
    status: pendingAcks > 0 ? 'Needs Review' : 'Active',
    href: '/sops',
    metrics: [
      { label: 'SOP Documents', value: sopCount, color: 'text-gray-300' },
      { label: 'Pending Acknowledgements', value: pendingAcks, color: pendingAcks > 0 ? 'text-amber-400' : 'text-gray-300' },
      { label: 'Acknowledgement Rate', value: `${Math.round(ackRate)}%`, color: ackRate < 80 ? 'text-amber-400' : 'text-emerald-400' },
    ],
    badge: pendingAcks > 0 ? { value: pendingAcks, color: 'bg-indigo-500/20 text-indigo-400' } : undefined,
  };

  // Module 5: Compliance Monitor
  const trialDaysLeft = company?.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(company.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  const module5: AIModuleCard = {
    number: 5,
    title: 'Compliance Monitor',
    description: 'Tracks guard licence expiry, training certifications, site compliance scores, and alerts on upcoming renewals or violations before they become problems.',
    icon: 'ri-shield-check-line',
    iconColor: 'text-emerald-400',
    bgColor: 'bg-emerald-500/15',
    status: 'Active',
    href: '/dashboard/settings',
    metrics: [
      { label: 'Licences Expiring Soon', value: 0, color: 'text-gray-300' },
      { label: 'Training Overdue', value: 0, color: 'text-gray-300' },
      { label: 'Trial Days Left', value: trialDaysLeft, color: trialDaysLeft < 7 ? 'text-amber-400' : 'text-gray-300' },
    ],
    badge: trialDaysLeft < 7 && trialDaysLeft > 0 ? { value: trialDaysLeft, color: 'bg-amber-500/20 text-amber-400' } : undefined,
  };

  const modules: AIModuleCard[] = [module1, module2, module3, module4, module5];

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <FeatureGate feature="hasAiRota">
    <div className="min-h-screen bg-[#0a0e1a]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center">
                  <div className="w-5 h-5 flex items-center justify-center text-blue-400">
                    <i className="ri-robot-2-line text-sm"></i>
                  </div>
                </div>
                <h1 className="text-3xl font-bold text-white">Guardian Hub AI Automation Hub</h1>
              </div>
              <p className="text-gray-400">Six AI-powered modules automating your security operations from tickets to rota scheduling</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm font-medium text-gray-300">AI Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* Module Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {modules.map((m) => (
            <AIModuleCardUI key={m.number} module={m} />
          ))}
          <RotaHelperCard />
        </div>

        {/* AI Governance Rules */}
        <div className="mt-8 bg-[#111827]/60 border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-800 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center">
              <div className="w-4 h-4 flex items-center justify-center text-gray-400">
                <i className="ri-shield-keyhole-line text-sm"></i>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">AI Rota Helper — Governance Rules</p>
              <p className="text-xs text-gray-500">Every AI suggestion must pass these rules before it reaches the rota</p>
            </div>
          </div>
          <div className="px-5 py-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">Allowed</h4>
              <ul className="space-y-1.5">
                {[
                  'Suggest guards for open shifts',
                  'Generate draft rota suggestions',
                  'Find uncovered shifts',
                  'Find double-booked guards',
                  'Check guard availability',
                  'Check SIA licence expiry',
                  'Check site skill requirements',
                  'Suggest sick cover',
                  'Warn about overtime',
                  'Warn about rest period issues',
                  'Recommend fair shift distribution',
                ].map((rule) => (
                  <li key={rule} className="flex items-center gap-2 text-xs text-gray-400">
                    <span className="w-3.5 h-3.5 flex items-center justify-center text-emerald-400 flex-shrink-0">
                      <i className="ri-check-line"></i>
                    </span>
                    {rule}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-2">Not Allowed</h4>
              <ul className="space-y-1.5">
                {[
                  'Publish rotas without approval',
                  'Assign guards permanently without approval',
                  'Ignore guard availability',
                  'Ignore company_id or site_id',
                  "Show one company's guards to another company",
                  'Override manager decisions',
                  'Delete shifts',
                  'Change pay rates',
                  'Change billing',
                  'Change user permissions',
                ].map((rule) => (
                  <li key={rule} className="flex items-center gap-2 text-xs text-gray-400">
                    <span className="w-3.5 h-3.5 flex items-center justify-center text-red-400 flex-shrink-0">
                      <i className="ri-close-line"></i>
                    </span>
                    {rule}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="px-5 py-3 border-t border-gray-800 bg-gray-900/40">
            <div className="flex items-start gap-2">
              <span className="w-4 h-4 flex items-center justify-center text-amber-400 flex-shrink-0 mt-0.5">
                <i className="ri-information-line text-xs"></i>
              </span>
              <p className="text-xs text-gray-400">
                All AI rota outputs must include: <strong className="text-gray-300">module_name = 'ai_rota_helper'</strong>, company_id, site_id, shift_id, suggested_guard_id, confidence_score, reasoning, warnings, requires_human_review, and created_at. Suggestions with confidence below 80% are automatically flagged as <strong className="text-amber-300">Needs Review</strong> and cannot be bulk-approved.
              </p>
            </div>
          </div>
        </div>

        {/* Footer helper */}
        <div className="mt-6 bg-[#111827]/60 border border-gray-800 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0">
              <div className="w-4 h-4 flex items-center justify-center text-gray-400">
                <i className="ri-information-line text-sm"></i>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-300 font-medium">About the AI Automation Hub</p>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Each module connects to existing Guardian Hub tools — there is no separate setup required. The AI Rota Helper (Module 6) uses the existing rota engine, AI suggestions, and sick cover systems already built into the rotas page. Click any module card to jump directly to its tool.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </FeatureGate>
  );
}