'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

const SKILL_OPTIONS = [
  'CCTV', 'Door Supervision', 'Close Protection', 'Public Space Surveillance',
  'Vehicle Immobilisation', 'First Aid', 'Conflict Management',
  'Search & Frisk', 'Manned Guarding', 'Mobile Patrol',
];

interface SiteRequirementsEditorProps {
  siteId: string;
  onSaved?: () => void;
}

export default function SiteRequirementsEditor({ siteId, onSaved }: SiteRequirementsEditorProps) {
  const { companyId } = useAuth();
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const [preferredGuardIds, setPreferredGuardIds] = useState<string[]>([]);
  const [bannedGuardIds, setBannedGuardIds] = useState<string[]>([]);
  const [guards, setGuards] = useState<{ id: string; first_name: string | null; last_name: string | null }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [customSkill, setCustomSkill] = useState('');

  useEffect(() => {
    if (!siteId || !companyId) return;
    (async () => {
      const [{ data: siteData }, { data: guardsData }] = await Promise.all([
        supabase.from('sites').select('required_skills, preferred_guard_ids, banned_guard_ids').eq('id', siteId).eq('company_id', companyId).maybeSingle(),
        supabase.from('guards').select('id, first_name, last_name').eq('company_id', companyId).eq('status', 'active').order('last_name'),
      ]);
      if (siteData) {
        setRequiredSkills(siteData.required_skills || []);
        setPreferredGuardIds(siteData.preferred_guard_ids || []);
        setBannedGuardIds(siteData.banned_guard_ids || []);
      }
      setGuards(guardsData || []);
      setLoading(false);
    })();
  }, [siteId, companyId]);

  const handleSave = async () => {
    setSaving(true);
    await supabase.from('sites').update({
      required_skills: requiredSkills.length > 0 ? requiredSkills : null,
      preferred_guard_ids: preferredGuardIds.length > 0 ? preferredGuardIds : null,
      banned_guard_ids: bannedGuardIds.length > 0 ? bannedGuardIds : null,
    }).eq('id', siteId).eq('company_id', companyId);
    setSaving(false);
    onSaved?.();
  };

  const toggleSkill = (skill: string) => {
    setRequiredSkills((prev) => prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]);
  };

  const togglePreferred = (guardId: string) => {
    setPreferredGuardIds((prev) => prev.includes(guardId) ? prev.filter((id) => id !== guardId) : [...prev, guardId]);
  };

  const toggleBanned = (guardId: string) => {
    setBannedGuardIds((prev) => prev.includes(guardId) ? prev.filter((id) => id !== guardId) : [...prev, guardId]);
    // Remove from preferred if banned
    setPreferredGuardIds((prev) => prev.filter((id) => id !== guardId));
  };

  const guardName = (id: string) => {
    const g = guards.find((x) => x.id === id);
    return g ? `${g.first_name || ''} ${g.last_name || ''}`.trim() || 'Unnamed' : id.slice(0, 8);
  };

  const availableGuards = useMemo(() => {
    return guards.filter((g) => !bannedGuardIds.includes(g.id));
  }, [guards, bannedGuardIds]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500 py-8">
        <div className="w-4 h-4 border-2 border-gray-600/30 border-t-gray-500 rounded-full animate-spin"></div>
        Loading requirements...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Required Skills */}
      <div className="bg-[#111827]/60 border border-gray-800 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
          <div className="w-4 h-4 flex items-center justify-center"><i className="ri-medal-line text-blue-400"></i></div>
          Required Skills
        </h3>
        <p className="text-xs text-gray-500 mb-3">Guards without these skills will be deprioritised for this site.</p>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {requiredSkills.map((skill) => (
            <span key={skill} className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-blue-500/15 text-blue-400 border border-blue-500/20">
              {skill}
              <button onClick={() => toggleSkill(skill)} className="cursor-pointer"><i className="ri-close-line text-[10px]"></i></button>
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={customSkill}
            onChange={(e) => setCustomSkill(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (customSkill.trim()) { toggleSkill(customSkill.trim()); setCustomSkill(''); } } }}
            placeholder="Add skill..."
            className="flex-1 max-w-xs bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
          <div className="flex gap-1 flex-wrap">
            {SKILL_OPTIONS.filter((s) => !requiredSkills.includes(s)).slice(0, 6).map((s) => (
              <button key={s} onClick={() => toggleSkill(s)} className="px-2 py-1 rounded text-[10px] bg-gray-800/60 text-gray-400 border border-gray-700 hover:text-white hover:border-gray-600 transition-colors cursor-pointer whitespace-nowrap">
                + {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Preferred Guards */}
      <div className="bg-[#111827]/60 border border-gray-800 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
          <div className="w-4 h-4 flex items-center justify-center"><i className="ri-star-line text-emerald-400"></i></div>
          Preferred Guards
        </h3>
        <p className="text-xs text-gray-500 mb-3">AI will prioritise assigning these guards to this site.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {availableGuards.map((g) => (
            <button
              key={g.id}
              onClick={() => togglePreferred(g.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs transition-colors cursor-pointer ${
                preferredGuardIds.includes(g.id)
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                  : 'bg-gray-800/40 text-gray-400 border-gray-700 hover:border-gray-600'
              }`}
            >
              <div className="w-5 h-5 rounded-full bg-gray-700 flex items-center justify-center text-[9px] font-bold text-gray-400">
                {((g.first_name || '')[0] || '') + ((g.last_name || '')[0] || '')}
              </div>
              <span className="truncate">{guardName(g.id)}</span>
              {preferredGuardIds.includes(g.id) && <i className="ri-check-line text-[10px] ml-auto"></i>}
            </button>
          ))}
        </div>
        {availableGuards.length === 0 && <p className="text-sm text-gray-500">No active guards available.</p>}
      </div>

      {/* Banned Guards */}
      <div className="bg-[#111827]/60 border border-gray-800 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
          <div className="w-4 h-4 flex items-center justify-center"><i className="ri-forbid-line text-red-400"></i></div>
          Banned Guards
        </h3>
        <p className="text-xs text-gray-500 mb-3">Client-requested exclusions — these guards will never be assigned to this site.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {guards.map((g) => (
            <button
              key={g.id}
              onClick={() => toggleBanned(g.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs transition-colors cursor-pointer ${
                bannedGuardIds.includes(g.id)
                  ? 'bg-red-500/10 text-red-400 border-red-500/25'
                  : 'bg-gray-800/40 text-gray-400 border-gray-700 hover:border-gray-600'
              }`}
            >
              <div className="w-5 h-5 rounded-full bg-gray-700 flex items-center justify-center text-[9px] font-bold text-gray-400">
                {((g.first_name || '')[0] || '') + ((g.last_name || '')[0] || '')}
              </div>
              <span className="truncate">{guardName(g.id)}</span>
              {bannedGuardIds.includes(g.id) && <i className="ri-forbid-line text-[10px] ml-auto"></i>}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
        >
          {saving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
          Save Requirements
        </button>
      </div>
    </div>
  );
}