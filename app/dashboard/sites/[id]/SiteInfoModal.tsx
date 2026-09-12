'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface SiteInfoModalProps {
  type: string;
  onClose: () => void;
  siteId: string;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function SiteInfoModal({ type, onClose, siteId }: SiteInfoModalProps) {
  const renderContent = () => {
    switch (type) {
      case 'contact':
        return <ContactContent siteId={siteId} />;
      case 'patrol-log':
        return <PatrolLogContent siteId={siteId} />;
      case 'details':
        return <GuardDetailsContent siteId={siteId} />;
      case 'risk-assessment':
        return <RiskContent siteId={siteId} />;
      case 'incident-report':
        return <IncidentContent siteId={siteId} />;
      default:
        return (
          <div className="text-center py-8">
            <p className="text-sm text-gray-400">Information not available</p>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-[#0f172a] border border-white/10 rounded-2xl p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="w-6"></div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center transition-colors cursor-pointer"
          >
            <i className="ri-close-line text-gray-400"></i>
          </button>
        </div>

        {renderContent()}

        <div className="mt-6 pt-4 border-t border-white/10">
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function ContactContent({ siteId }: { siteId: string }) {
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('site_contacts')
      .select('id, contact_type, contact_name, contact_phone, contact_email, is_primary')
      .eq('site_id', siteId)
      .order('is_primary', { ascending: false })
      .then(({ data }) => {
        setContacts(data || []);
        setLoading(false);
      });
  }, [siteId]);

  const typeIcons: Record<string, string> = {
    emergency: 'ri-police-car-line',
    client: 'ri-briefcase-line',
    building_manager: 'ri-building-line',
    facilities: 'ri-tools-line',
    out_of_hours: 'ri-moon-line',
    keyholder: 'ri-key-line',
    alarm_responder: 'ri-alarm-warning-line',
    other: 'ri-contacts-line',
  };
  const typeColors: Record<string, string> = {
    emergency: 'text-red-400',
    client: 'text-blue-400',
    building_manager: 'text-purple-400',
    facilities: 'text-amber-400',
    out_of_hours: 'text-cyan-400',
    keyholder: 'text-emerald-400',
    alarm_responder: 'text-orange-400',
    other: 'text-gray-400',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
          <i className="ri-phone-line text-blue-400"></i>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Contact Information</h3>
          <p className="text-xs text-gray-400">Site contacts</p>
        </div>
      </div>
      {loading ? (
        <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="h-14 bg-white/5 rounded-lg animate-pulse" />)}</div>
      ) : contacts.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-4">No contacts configured for this site</p>
      ) : (
        <div className="space-y-3">
          {contacts.map((c) => (
            <div key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                  <i className={`${typeIcons[c.contact_type] || 'ri-contacts-line'} ${typeColors[c.contact_type] || 'text-gray-400'} text-sm`}></i>
                </div>
                <div>
                  <span className="text-sm text-gray-300 flex items-center gap-1.5">
                    {c.contact_name}
                    {c.is_primary && <span className="text-[10px] text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">Primary</span>}
                  </span>
                  <span className="text-[11px] text-gray-500 capitalize block">{c.contact_type.replace(/_/g, ' ')}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-white">{c.contact_phone || '—'}</div>
                {c.contact_email && <div className="text-xs text-gray-500">{c.contact_email}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PatrolLogContent({ siteId }: { siteId: string }) {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('patrol_logs')
      .select('id, status, start_time, checkpoints_total, checkpoints_completed, missed_checkpoints, guard_id, guards(first_name, last_name)')
      .eq('site_id', siteId)
      .order('start_time', { ascending: false })
      .limit(8)
      .then(({ data }) => {
        setEntries((data || []).map((p: any) => ({
          id: p.id,
          guardName: p.guards ? `${p.guards.first_name || ''} ${p.guards.last_name || ''}`.trim() || 'Unknown' : 'Unknown',
          time: p.start_time ? timeAgo(p.start_time) : '—',
          checkpoints: `${p.checkpoints_completed || 0}/${p.checkpoints_total || 0}`,
          missed: p.missed_checkpoints || 0,
          status: p.status || 'unknown',
        })));
        setLoading(false);
      });
  }, [siteId]);

  const statusColors: Record<string, { dot: string; text: string; label: string }> = {
    completed: { dot: 'bg-emerald-500', text: 'text-emerald-400', label: 'Completed' },
    active: { dot: 'bg-blue-500', text: 'text-blue-400', label: 'In Progress' },
    missed: { dot: 'bg-red-500', text: 'text-red-400', label: 'Missed' },
    partial: { dot: 'bg-amber-500', text: 'text-amber-400', label: 'Partial' },
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
          <i className="ri-route-line text-cyan-400"></i>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Patrol Log</h3>
          <p className="text-xs text-gray-400">Recent patrol activity</p>
        </div>
      </div>
      {loading ? (
        <div className="space-y-3">{[1,2,3,4].map((i) => <div key={i} className="h-12 bg-white/5 rounded-lg animate-pulse" />)}</div>
      ) : entries.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-4">No patrols recorded yet</p>
      ) : (
        <div className="space-y-3">
          {entries.map((e) => {
            const cfg = statusColors[e.status] || statusColors.missed;
            return (
              <div key={e.id} className="flex gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/5">
                <span className={`w-2 h-2 rounded-full ${cfg.dot} mt-1.5 flex-shrink-0`}></span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-sm font-medium text-white">{e.guardName}</span>
                    <span className="text-xs text-gray-500">{e.time}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-gray-400">CP: {e.checkpoints}</span>
                    {e.missed > 0 && <span className="text-red-400">{e.missed} missed</span>}
                    <span className={cfg.text}>{cfg.label}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function GuardDetailsContent({ siteId }: { siteId: string }) {
  const [guards, setGuards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('shifts')
      .select('guard_id, status, guards:guard_id(first_name, last_name, phone, email)')
      .eq('site_id', siteId)
      .in('status', ['active', 'scheduled'])
      .order('start_time', { ascending: true })
      .limit(10)
      .then(({ data }) => {
        const unique = new Map();
        (data || []).forEach((s: any) => {
          if (s.guard_id && s.guards && !unique.has(s.guard_id)) {
            unique.set(s.guard_id, {
              id: s.guard_id,
              name: `${s.guards.first_name || ''} ${s.guards.last_name || ''}`.trim() || 'Unknown',
              phone: s.guards.phone || '—',
              email: s.guards.email || '—',
              status: s.status === 'active' ? 'On Duty' : 'Scheduled',
            });
          }
        });
        setGuards(Array.from(unique.values()));
        setLoading(false);
      });
  }, [siteId]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
          <i className="ri-shield-user-line text-violet-400"></i>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Guards</h3>
          <p className="text-xs text-gray-400">Currently assigned to this site</p>
        </div>
      </div>
      {loading ? (
        <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="h-16 bg-white/5 rounded-lg animate-pulse" />)}</div>
      ) : guards.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-4">No guards assigned to this site</p>
      ) : (
        <div className="space-y-2">
          {guards.map((g) => (
            <div key={g.id} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/5">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${g.status === 'On Duty' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                  <span className="text-xs font-medium">
                    {g.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || 'G'}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium text-white">{g.name}</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${g.status === 'On Duty' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                    <span className="text-[11px] text-gray-400">{g.status}</span>
                  </div>
                </div>
              </div>
              <div className="text-right text-xs text-gray-500">
                <div>{g.phone}</div>
                {g.email !== '—' && <div>{g.email}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RiskContent({ siteId }: { siteId: string }) {
  const [riskData, setRiskData] = useState<any>(null);
  const [siteInfo, setSiteInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.from('site_risk_scores').select('score, generated_at').eq('site_id', siteId).order('generated_at', { ascending: false }).limit(1),
      supabase.from('sites').select('risk_level').eq('id', siteId).maybeSingle(),
    ]).then(([riskRes, siteRes]) => {
      setRiskData(riskRes.data?.[0] || null);
      setSiteInfo(siteRes.data || null);
      setLoading(false);
    });
  }, [siteId]);

  const riskLevel = siteInfo?.risk_level || 'medium';
  const score = riskData?.score ?? null;

  const levelConfig: Record<string, { color: string; bg: string; label: string }> = {
    low: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Low' },
    medium: { color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'Medium' },
    high: { color: 'text-orange-400', bg: 'bg-orange-500/10', label: 'High' },
    critical: { color: 'text-red-400', bg: 'bg-red-500/10', label: 'Critical' },
  };
  const cfg = levelConfig[riskLevel] || levelConfig.medium;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
          <i className="ri-speed-mini-line text-amber-400"></i>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Risk Assessment</h3>
          <p className="text-xs text-gray-400">Site security risk profile</p>
        </div>
      </div>
      {loading ? (
        <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="h-12 bg-white/5 rounded-lg animate-pulse" />)}</div>
      ) : (
        <>
          <div className={`p-4 rounded-xl ${cfg.bg} border border-white/10 mb-4`}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-white">Overall Risk Level</span>
              <span className={`text-sm font-bold ${cfg.color} px-2 py-0.5 rounded bg-white/10`}>{cfg.label.toUpperCase()}</span>
            </div>
            {score !== null && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-[11px] text-gray-400 mb-1">
                  <span>AI Risk Score</span>
                  <span className={score >= 70 ? 'text-red-400' : score >= 40 ? 'text-amber-400' : 'text-emerald-400'}>{score}/100</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${score >= 70 ? 'bg-red-500' : score >= 40 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                    style={{ width: `${score}%` }}
                  ></div>
                </div>
                {riskData?.generated_at && (
                  <p className="text-[10px] text-gray-500 mt-1">Last assessed: {new Date(riskData.generated_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                )}
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 text-center">
            Risk level is configured in Site Profile. Run an AI risk assessment for a detailed score.
          </p>
        </>
      )}
    </div>
  );
}

function IncidentContent({ siteId }: { siteId: string }) {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('incidents')
      .select('id, title, incident_type, severity, status, description, occurred_at')
      .eq('site_id', siteId)
      .order('occurred_at', { ascending: false })
      .limit(10)
      .then(({ data }) => {
        setIncidents(data || []);
        setLoading(false);
      });
  }, [siteId]);

  const severityBorder: Record<string, string> = {
    high: 'border-l-red-500',
    critical: 'border-l-red-500',
    medium: 'border-l-amber-500',
    low: 'border-l-yellow-500',
  };
  const severityText: Record<string, string> = {
    high: 'text-red-400',
    critical: 'text-red-400',
    medium: 'text-amber-400',
    low: 'text-yellow-400',
  };
  const severityBg: Record<string, string> = {
    high: 'bg-red-500/5',
    critical: 'bg-red-500/5',
    medium: 'bg-amber-500/5',
    low: 'bg-yellow-500/5',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <i className="ri-error-warning-line text-red-400"></i>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Incidents</h3>
          <p className="text-xs text-gray-400">Site incident history</p>
        </div>
      </div>
      {loading ? (
        <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="h-16 bg-white/5 rounded-lg animate-pulse" />)}</div>
      ) : incidents.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-4">No incidents recorded for this site</p>
      ) : (
        <div className="space-y-3">
          {incidents.map((inc) => (
            <div key={inc.id} className={`p-3 rounded-lg border-l-4 ${severityBorder[inc.severity] || 'border-l-gray-500'} ${severityBg[inc.severity] || 'bg-white/[0.03]'} border border-white/5`}>
              <div className="flex items-center justify-between mb-1">
                <span className={`text-sm font-medium ${severityText[inc.severity] || 'text-gray-400'}`}>
                  {inc.title || inc.incident_type || 'Incident'}
                </span>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                    inc.severity === 'high' || inc.severity === 'critical' ? 'bg-red-500/10 text-red-400' :
                    inc.severity === 'medium' ? 'bg-amber-500/10 text-amber-400' : 'bg-gray-500/10 text-gray-400'
                  }`}>
                    {inc.severity || 'medium'}
                  </span>
                  <span className="text-[10px] text-gray-500">{inc.occurred_at ? timeAgo(inc.occurred_at) : ''}</span>
                </div>
              </div>
              {inc.description && (
                <p className="text-xs text-gray-400 line-clamp-2">{inc.description}</p>
              )}
              <div className="flex items-center gap-2 mt-1.5">
                <span className={`text-[10px] ${inc.status === 'open' ? 'text-red-400' : inc.status === 'in_progress' ? 'text-amber-400' : 'text-gray-400'}`}>
                  {inc.status === 'in_progress' ? 'In Progress' : inc.status === 'reviewing' ? 'Reviewing' : inc.status === 'resolved' ? 'Resolved' : 'Open'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}