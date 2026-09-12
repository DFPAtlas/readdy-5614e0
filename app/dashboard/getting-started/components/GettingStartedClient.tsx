'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { useOnboarding, useOnboardingStats } from '@/lib/useOnboarding';
import HelpTip from '@/components/HelpTip';

interface Update { id: string; title: string; change_type: string; published_at: string | null; }

interface RoleGuide {
  label: string;
  welcome: string;
  responsibilities: string[];
  actions: string[];
  helpCategory: string;
}

const ROLE_GUIDES: Record<string, RoleGuide> = {
  super_admin: { label: 'Platform Operator', welcome: 'You operate the platform for every tenant.', responsibilities: ['Manage tenants and subscriptions', 'Oversee platform and agent health', 'Run the help centre and support operations'], actions: ['Review platform health', 'Check support queues', 'Manage help articles'], helpCategory: 'integrations-agents' },
  company_admin: { label: 'Administrator', welcome: 'You own the security and success of your operation.', responsibilities: ['Protect privileged accounts and enable MFA', 'Own company profile, billing and settings', 'Approve go-live readiness'], actions: ['Complete your company profile', 'Add your first site and guards', 'Configure billing', 'Review go-live readiness'], helpCategory: 'company-setup' },
  operations_manager: { label: 'Operations Manager', welcome: 'You run the day-to-day operation.', responsibilities: ['Schedule shifts and manage rotas', 'Monitor check-ins and incidents', 'Manage guard assignments and conflicts'], actions: ['Define shift templates', 'Add guards and sites', 'Set up escalation paths', 'Open the command centre'], helpCategory: 'scheduling' },
  controller: { label: 'Controller', welcome: 'You are the live operations heartbeat.', responsibilities: ['Monitor live check-ins and alerts', 'Acknowledge SOS events', 'Escalate incidents'], actions: ['Review SOS escalation contacts', 'Open the command centre', 'Check notification settings'], helpCategory: 'incidents-sos' },
  supervisor: { label: 'Supervisor', welcome: 'You support your teams on the ground.', responsibilities: ['Oversee assigned sites and guards', 'Review incidents and check calls', 'Escalate where needed'], actions: ['Review your sites', 'Check guard status', 'Learn incident review'], helpCategory: 'incidents-sos' },
  guard: { label: 'Guard', welcome: 'You keep people and property safe.', responsibilities: ['Clock in and out on shift', 'Complete patrols and checkpoints', 'Report incidents and raise SOS when needed'], actions: ['View your shifts', 'Enable location permissions', 'Read the SOS guide', 'Complete guard training'], helpCategory: 'incidents-sos' },
  client_admin: { label: 'Client Administrator', welcome: 'Welcome to your client portal.', responsibilities: ['View your authorised sites and reports', 'Monitor shift coverage', 'Raise support requests'], actions: ['Explore your dashboard', 'Review site coverage', 'Read the client portal overview'], helpCategory: 'client-portal' },
  client: { label: 'Client Viewer', welcome: 'Welcome to your client portal.', responsibilities: ['View authorised sites and reports', 'Monitor shift coverage', 'Raise support requests'], actions: ['Explore your dashboard', 'Review site coverage', 'Read the client portal overview'], helpCategory: 'client-portal' },
  finance: { label: 'Finance User', welcome: 'You keep the money accurate.', responsibilities: ['Approve timesheets', 'Manage invoices and payments', 'Run pay and billing runs'], actions: ['Review timesheets', 'Configure billing preferences', 'Run a billing review'], helpCategory: 'timesheets-finance' },
  recruitment: { label: 'Recruitment User', welcome: 'You build the workforce.', responsibilities: ['Manage applications and vetting', 'Track SIA and training', 'Progress candidates'], actions: ['Review open applications', 'Check SIA expiry', 'Record vetting progress'], helpCategory: 'guards-compliance' },
};

function statusMeta(status: string) {
  switch (status) {
    case 'completed': return { icon: 'ri-checkbox-circle-line', color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
    case 'blocked': return { icon: 'ri-error-warning-line', color: 'text-red-400', bg: 'bg-red-500/10' };
    default: return { icon: 'ri-checkbox-blank-circle-line', color: 'text-gray-500', bg: 'bg-white/5' };
  }
}

export default function GettingStartedClient() {
  const { profile, company } = useAuth();
  const { steps, blockers, project, snapshot, loading, loadTasks, tasks } = useOnboarding();
  const stats = useOnboardingStats(steps);
  const [updates, setUpdates] = useState<Update[]>([]);

  useEffect(() => {
    if (project?.id) loadTasks(project.id);
  }, [project?.id, loadTasks]);

  useEffect(() => {
    supabase.from('platform_announcements').select('id,title,change_type,published_at').eq('is_published', true).order('published_at', { ascending: false }).limit(3).then(({ data }) => setUpdates(data || []));
  }, []);

  const role = profile?.role ?? '';
  const guide = ROLE_GUIDES[role] ?? ROLE_GUIDES.company_admin;
  const requiredSteps = steps.filter((s) => s.is_required);
  const recommendedSteps = steps.filter((s) => !s.is_required);

  const attention: string[] = [];
  if (snapshot) {
    if (!snapshot.companyComplete) attention.push('Company profile incomplete');
    if (snapshot.adminCount === 0) attention.push('No privileged administrator configured');
    if (snapshot.sites === 0) attention.push('No sites created');
    if (snapshot.guards === 0) attention.push('No guards added');
    if (snapshot.sia === 0) attention.push('No SIA licence records');
    if (snapshot.shiftTypes === 0) attention.push('No shift templates defined');
    if (!snapshot.hasSubscription) attention.push('Billing or subscription not configured');
  }
  const goLiveReady = stats.goLiveReady && blockers.length === 0 && attention.length === 0;

  const stage = stats.percent >= 100 ? 'Ready for go-live review' : stats.percent >= 60 ? 'Mid-onboarding' : stats.percent >= 25 ? 'Early onboarding' : 'Getting started';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Getting Started</h1>
          <p className="text-sm text-gray-500 mt-1">{company?.name ? `${company.name} · ` : ''}{stage}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${goLiveReady ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'}`}>
            {goLiveReady ? 'Ready for go-live' : 'In progress'}
          </span>
          <Link href="/help" className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer whitespace-nowrap">
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-book-open-line text-sm"></i></div>
            Help Centre
          </Link>
          <Link href="/dashboard/support" className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm text-white transition-colors cursor-pointer whitespace-nowrap">
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-customer-service-2-line text-sm"></i></div>
            Request Support
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Overall setup progress</p>
          <div className="flex items-end justify-between">
            <span className="text-4xl font-bold text-white">{stats.percent}%</span>
            <span className="text-sm text-gray-400">{stats.totalDone} of {stats.total} complete</span>
          </div>
          <div className="mt-3 h-2 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${stats.percent}%` }}></div>
          </div>
          <p className="text-xs text-gray-500 mt-2">{stats.requiredDone} of {stats.requiredTotal} required steps complete</p>
        </div>

        <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <p className="text-xs text-gray-500 uppercase tracking-wider">Your role</p>
          </div>
          <p className="text-sm font-semibold text-white">{guide.label}</p>
          <p className="text-sm text-gray-400 mt-1 leading-relaxed">{guide.welcome}</p>
        </div>

        <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Implementation</p>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between"><span className="text-gray-400">Assigned contact</span><span className="text-white">{project?.assigned_contact || 'Not yet assigned'}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Go-live target</span><span className="text-white">{project?.go_live_target || 'Not set'}</span></div>
          </div>
          {tasks.length > 0 && (
            <div className="mt-3 space-y-1.5 border-t border-white/10 pt-3">
              {tasks.slice(0, 3).map((t) => (
                <div key={t.id} className="flex items-center gap-2 text-xs">
                  <span className={`w-1.5 h-1.5 rounded-full ${t.status === 'completed' ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                  <span className="text-gray-300">{t.title}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">Onboarding checklist</h2>
            <HelpTip text="Progress is calculated from real records in your account, not entered manually." />
          </div>

          <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Required</p>
          <div className="space-y-1">
            {requiredSteps.map((s) => {
              const m = statusMeta(s.status);
              return (
                <div key={s.id} className="flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors">
                  <div className={`w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5 ${m.color}`}><i className={m.icon}></i></div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-white">{s.title}</p>
                    {s.description && <p className="text-xs text-gray-500">{s.description}</p>}
                  </div>
                  {s.help_article_slug && (
                    <Link href={`/help/${s.help_article_slug}`} className="text-xs text-blue-400 hover:text-blue-300 whitespace-nowrap cursor-pointer">Guide</Link>
                  )}
                </div>
              );
            })}
          </div>

          <p className="text-xs text-gray-500 uppercase tracking-wider mb-3 mt-5">Recommended</p>
          <div className="space-y-1">
            {recommendedSteps.map((s) => {
              const m = statusMeta(s.status);
              return (
                <div key={s.id} className="flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors">
                  <div className={`w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5 ${m.color}`}><i className={m.icon}></i></div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-white">{s.title}</p>
                    {s.description && <p className="text-xs text-gray-500">{s.description}</p>}
                  </div>
                  {s.help_article_slug && (
                    <Link href={`/help/${s.help_article_slug}`} className="text-xs text-blue-400 hover:text-blue-300 whitespace-nowrap cursor-pointer">Guide</Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5">
            <h2 className="text-base font-semibold text-white mb-3">First actions for you</h2>
            <div className="space-y-2">
              {guide.actions.map((a) => (
                <div key={a} className="flex items-start gap-2 text-sm text-gray-300">
                  <div className="w-4 h-4 flex items-center justify-center text-blue-400 flex-shrink-0 mt-0.5"><i className="ri-arrow-right-line text-xs"></i></div>
                  {a}
                </div>
              ))}
            </div>
            <Link href={`/help?category=${guide.helpCategory}`} className="mt-3 inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 cursor-pointer">
              View guides for your role <i className="ri-arrow-right-line"></i>
            </Link>
          </div>

          {(blockers.length > 0 || attention.length > 0) && (
            <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5">
              <h2 className="text-base font-semibold text-white mb-3">Blocked items</h2>
              <div className="space-y-2">
                {blockers.map((b) => (
                  <div key={b.id} className="flex items-start gap-2 text-sm">
                    <div className="w-4 h-4 flex items-center justify-center text-red-400 flex-shrink-0 mt-0.5"><i className="ri-error-warning-line text-xs"></i></div>
                    <div><p className="text-gray-200">{b.title}</p>{b.description && <p className="text-xs text-gray-500">{b.description}</p>}</div>
                  </div>
                ))}
                {attention.map((a) => (
                  <div key={a} className="flex items-start gap-2 text-sm">
                    <div className="w-4 h-4 flex items-center justify-center text-amber-400 flex-shrink-0 mt-0.5"><i className="ri-alert-line text-xs"></i></div>
                    <p className="text-gray-200">{a}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {updates.length > 0 && (
            <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-white">Recent updates</h2>
                <Link href="/updates" className="text-xs text-blue-400 hover:text-blue-300 cursor-pointer">All</Link>
              </div>
              <div className="space-y-2">
                {updates.map((u) => (
                  <p key={u.id} className="text-sm text-gray-300 line-clamp-1">{u.title}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}