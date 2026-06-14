'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  icon: string;
  link: string;
  actionLabel: string;
}

const CHECKLIST_ITEMS: ChecklistItem[] = [
  {
    id: 'site',
    label: 'Add your first site',
    description: 'Set up a physical location your guards will secure',
    icon: 'ri-building-line',
    link: '/sites/new',
    actionLabel: 'Add Site',
  },
  {
    id: 'guard',
    label: 'Add your first guard',
    description: 'Onboard a security officer with their credentials',
    icon: 'ri-shield-user-line',
    link: '/guards',
    actionLabel: 'Add Guard',
  },
  {
    id: 'patrol',
    label: 'Create your first patrol',
    description: 'Define a patrol route with checkpoints',
    icon: 'ri-route-line',
    link: '/dashboard/patrol-checkpoints',
    actionLabel: 'Create Patrol',
  },
  {
    id: 'sop',
    label: 'Upload your first SOP',
    description: 'Standard operating procedures for your team',
    icon: 'ri-book-open-line',
    link: '/sops',
    actionLabel: 'Upload SOP',
  },
  {
    id: 'risk',
    label: 'Create your first risk assessment',
    description: 'Evaluate and document site risk levels',
    icon: 'ri-shield-star-line',
    link: '/dashboard/ai-automation',
    actionLabel: 'Create Assessment',
  },
  {
    id: 'profile',
    label: 'Complete company profile',
    description: 'Fill in all company details and branding',
    icon: 'ri-building-2-line',
    link: '/dashboard/settings',
    actionLabel: 'Complete Profile',
  },
  {
    id: 'subscription',
    label: 'Check subscription plan',
    description: 'Review your plan and upgrade if needed',
    icon: 'ri-vip-crown-line',
    link: '/pricing',
    actionLabel: 'View Plans',
  },
];

export default function SetupChecklist({ companyId }: { companyId: string | null }) {
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!companyId) {
      setLoading(false);
      return;
    }

    const stored = localStorage.getItem(`checklist-dismissed-${companyId}`);
    if (stored === 'true') {
      setDismissed(true);
      setLoading(false);
      return;
    }

    async function checkAll() {
      const done = new Set<string>();

      try {
        const [
          sitesRes,
          guardsRes,
          shiftsRes,
          sopsRes,
          riskRes,
          companyRes,
        ] = await Promise.all([
          supabase.from('sites').select('id', { count: 'exact', head: true }).eq('company_id', companyId),
          supabase.from('guards').select('id', { count: 'exact', head: true }).eq('company_id', companyId).eq('status', 'active'),
          supabase.from('shifts').select('id', { count: 'exact', head: true }).eq('company_id', companyId),
          supabase.from('sop_documents').select('id', { count: 'exact', head: true }).eq('company_id', companyId),
          supabase.from('sop_documents').select('id', { count: 'exact', head: true }).eq('company_id', companyId).eq('category', 'risk_assessment'),
          supabase.from('companies').select('name, contact_email, phone, address, subscription_status').eq('id', companyId).maybeSingle(),
        ]);

        if ((sitesRes.count || 0) > 0) done.add('site');
        if ((guardsRes.count || 0) > 0) done.add('guard');
        if ((shiftsRes.count || 0) > 0) done.add('patrol');
        if ((sopsRes.count || 0) > 0) done.add('sop');
        if ((riskRes.count || 0) > 0) done.add('risk');

        const co = companyRes.data;
        if (co && co.name && co.contact_email && co.subscription_status && co.subscription_status !== 'incomplete') {
          done.add('profile');
        }

        if (co && (co.subscription_status === 'active' || co.subscription_status === 'trialing')) {
          done.add('subscription');
        }
      } catch {
        // silently fail, checklist will show unchecked
      }

      setCompleted(done);
      setLoading(false);
    }

    checkAll();
  }, [companyId]);

  const handleDismiss = () => {
    setDismissed(true);
    if (companyId) {
      localStorage.setItem(`checklist-dismissed-${companyId}`, 'true');
    }
  };

  if (loading) {
    return (
      <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5 mb-5 animate-pulse">
        <div className="h-5 w-36 bg-white/5 rounded mb-3" />
        <div className="h-2 w-full bg-white/5 rounded-full mb-4" />
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 bg-white/5 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (dismissed) return null;

  const completedCount = completed.size;
  const totalCount = CHECKLIST_ITEMS.length;
  const pct = Math.round((completedCount / totalCount) * 100);
  const allDone = completedCount === totalCount;

  if (allDone) {
    return (
      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-5 mb-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
              <div className="w-5 h-5 flex items-center justify-center text-emerald-400">
                <i className="ri-check-double-line text-sm"></i>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-emerald-400">Setup Complete</h3>
              <p className="text-xs text-gray-400">All checklist items are done. Your operation is ready.</p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-500 hover:text-gray-400 transition-colors cursor-pointer"
          >
            <div className="w-5 h-5 flex items-center justify-center">
              <i className="ri-close-line text-sm"></i>
            </div>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5 mb-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <div className="w-5 h-5 flex items-center justify-center text-blue-400">
              <i className="ri-task-line text-sm"></i>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Setup Checklist</h3>
            <p className="text-xs text-gray-400">
              {completedCount} of {totalCount} completed
            </p>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-gray-500 hover:text-gray-400 transition-colors cursor-pointer"
        >
          <div className="w-5 h-5 flex items-center justify-center">
            <i className="ri-close-line text-sm"></i>
          </div>
        </button>
      </div>

      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-blue-500 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="space-y-1.5">
        {CHECKLIST_ITEMS.map((item) => {
          const isDone = completed.has(item.id);
          return (
            <Link
              key={item.id}
              href={item.link}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all cursor-pointer group ${
                isDone
                  ? 'bg-emerald-500/5 border border-emerald-500/10 hover:border-emerald-500/20'
                  : 'bg-white/5 border border-white/5 hover:border-white/10'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  isDone ? 'bg-emerald-500/15' : 'bg-white/10'
                }`}
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  <i
                    className={`${
                      isDone ? 'ri-check-line text-emerald-400' : `${item.icon} text-gray-500 group-hover:text-gray-300`
                    } text-sm`}
                  ></i>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <span className={`text-sm ${isDone ? 'text-gray-500 line-through' : 'text-gray-300 group-hover:text-white'}`}>
                  {item.label}
                </span>
                <p className="text-xs text-gray-500">{item.description}</p>
              </div>
              {!isDone && (
                <span className="text-xs text-blue-400 group-hover:text-blue-300 font-medium whitespace-nowrap">
                  {item.actionLabel} &rarr;
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}