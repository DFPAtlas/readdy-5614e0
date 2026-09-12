'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { usePlatformAccess } from '@/lib/usePlatformAccess';

interface FeatureFlag {
  id: string;
  flag_key: string;
  description: string | null;
  risk_level: string;
  default_state: boolean;
  target_type: string;
  is_active: boolean;
  is_kill_switch: boolean;
  rollout_percentage: number;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
}

export default function FeatureFlagsPage() {
  const { profile } = useAuth();
  const { can } = usePlatformAccess(profile?.id || null);
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('feature_flags').select('*').order('flag_key');
      if (data) setFlags(data);
      setLoading(false);
    };
    load();
  }, []);

  const toggleFlag = async (id: string, currentActive: boolean) => {
    if (!can('feature_flags.manage')) return;
    const { error } = await supabase.from('feature_flags').update({ is_active: !currentActive }).eq('id', id);
    if (!error) {
      setFlags(prev => prev.map(f => f.id === id ? { ...f, is_active: !currentActive } : f));
      await supabase.from('feature_flag_history').insert({
        flag_id: id,
        changed_by: profile?.id,
        change_type: currentActive ? 'disabled' : 'enabled',
        previous_state: { is_active: currentActive },
        new_state: { is_active: !currentActive },
      });
    }
  };

  const riskColors: Record<string, string> = {
    low: 'bg-emerald-600/15 text-emerald-400',
    medium: 'bg-amber-600/15 text-amber-400',
    high: 'bg-red-600/15 text-red-400',
    critical: 'bg-red-700/20 text-red-500',
  };

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Feature Flags</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage staged rollouts and kill switches</p>
        </div>
      </div>

      {!can('feature_flags.manage') && (
        <div className="mb-4 p-3 bg-amber-600/10 border border-amber-600/20 rounded-lg text-sm text-amber-400">
          Read-only mode. Contact a Platform Owner to manage flags.
        </div>
      )}

      <div className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-800">
          <div className="grid grid-cols-12 gap-4 text-xs text-gray-500 uppercase tracking-wider">
            <div className="col-span-3">Flag</div>
            <div className="col-span-4">Description</div>
            <div className="col-span-2">Target</div>
            <div className="col-span-1">Risk</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-1">Action</div>
          </div>
        </div>
        <div className="divide-y divide-gray-800">
          {flags.map((f) => (
            <div key={f.id} className="px-5 py-3 grid grid-cols-12 gap-4 items-center hover:bg-white/[0.02] transition-colors">
              <div className="col-span-3">
                <code className="text-sm text-indigo-400 font-mono">{f.flag_key}</code>
                {f.is_kill_switch && <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-600/15 text-red-400">Kill Switch</span>}
              </div>
              <div className="col-span-4 text-sm text-gray-400 truncate">{f.description || '-'}</div>
              <div className="col-span-2">
                <span className="text-xs text-gray-500 capitalize">{f.target_type.replace(/_/g, ' ')}</span>
                {f.target_type === 'percentage' && <span className="text-xs text-gray-500 ml-1">({f.rollout_percentage}%)</span>}
              </div>
              <div className="col-span-1">
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${riskColors[f.risk_level] || ''}`}>{f.risk_level}</span>
              </div>
              <div className="col-span-1">
                <span className={`inline-flex items-center gap-1 text-xs ${f.is_active ? 'text-emerald-400' : 'text-gray-500'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${f.is_active ? 'bg-emerald-400' : 'bg-gray-600'}`}></span>
                  {f.is_active ? 'Active' : 'Off'}
                </span>
              </div>
              <div className="col-span-1">
                {can('feature_flags.manage') && (
                  <button onClick={() => toggleFlag(f.id, f.is_active)} className={`px-2 py-1 rounded text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${f.is_active ? 'bg-red-600/15 text-red-400 hover:bg-red-600/25' : 'bg-emerald-600/15 text-emerald-400 hover:bg-emerald-600/25'}`}>
                    {f.is_active ? 'Disable' : 'Enable'}
                  </button>
                )}
              </div>
            </div>
          ))}
          {flags.length === 0 && !loading && (
            <div className="px-5 py-12 text-center text-sm text-gray-500">No feature flags configured</div>
          )}
        </div>
      </div>
    </div>
  );
}