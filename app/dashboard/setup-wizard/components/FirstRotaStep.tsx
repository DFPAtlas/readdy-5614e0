'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';

export interface RotaFormData {
  site_id: string;
  guard_id: string;
  shift_date: string;
  shift_start: string;
  shift_end: string;
  notes: string;
}

interface FirstRotaStepProps {
  data: RotaFormData;
  onChange: (data: RotaFormData) => void;
  companyId: string | null;
}

interface SiteOption {
  id: string;
  site_name: string;
}

interface GuardOption {
  id: string;
  first_name: string | null;
  last_name: string | null;
}

const inputBase =
  'w-full bg-white/5 border rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors';
const inputNormal = 'border-white/10';

export default function FirstRotaStep({ data, onChange, companyId }: FirstRotaStepProps) {
  const [sites, setSites] = useState<SiteOption[]>([]);
  const [guards, setGuards] = useState<GuardOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const defaultsSet = useRef(false);

  useEffect(() => {
    if (!companyId) return;
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setLoadError('');
      try {
        const [{ data: siteData }, { data: guardData }] = await Promise.all([
          supabase.from('sites').select('id, site_name').eq('company_id', companyId).order('created_at', { ascending: false }),
          supabase.from('guards').select('id, first_name, last_name').eq('company_id', companyId).order('created_at', { ascending: false }),
        ]);
        if (cancelled) return;
        setSites(siteData || []);
        setGuards(guardData || []);
      } catch (e: any) {
        if (!cancelled) setLoadError(e?.message || 'Failed to load data');
      }
      if (!cancelled) setLoading(false);
    };
    load();
    return () => { cancelled = true; };
  }, [companyId]);

  useEffect(() => {
    if (defaultsSet.current) return;
    if (!data.shift_date && !loading) {
      defaultsSet.current = true;
      const today = new Date().toISOString().split('T')[0];
      onChange({ ...data, shift_date: today, shift_start: '08:00', shift_end: '20:00' });
    }
  }, [data.shift_date, loading, onChange, data]);

  useEffect(() => {
    if (defaultsSet.current) return;
    if (sites.length > 0 && !data.site_id) {
      defaultsSet.current = true;
      onChange({ ...data, site_id: sites[0].id });
    }
    if (guards.length > 0 && !data.guard_id) {
      if (!defaultsSet.current) defaultsSet.current = true;
      onChange((prev: RotaFormData) => {
        if (prev.guard_id) return prev;
        return { ...prev, guard_id: guards[0].id };
      });
    }
  }, [sites, guards, data.site_id, data.guard_id, onChange]);

  if (loadError) {
    return (
      <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-lg text-center">
        <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-3">
          <i className="ri-error-warning-line text-red-400 text-lg" />
        </div>
        <p className="text-sm text-red-400">{loadError}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-3 text-sm text-red-300 hover:text-red-200 underline cursor-pointer"
        >
          Retry
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-10 bg-white/5 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (sites.length === 0) {
    return (
      <div className="p-6 bg-white/5 rounded-lg border border-white/10 text-center">
        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-3">
          <i className="ri-map-pin-line text-gray-500 text-lg" />
        </div>
        <p className="text-sm text-gray-400">No sites found.</p>
        <p className="text-xs text-gray-500 mt-1">Add a site in Step 2 first.</p>
      </div>
    );
  }

  if (guards.length === 0) {
    return (
      <div className="p-6 bg-white/5 rounded-lg border border-white/10 text-center">
        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-3">
          <i className="ri-shield-user-line text-gray-500 text-lg" />
        </div>
        <p className="text-sm text-gray-400">No guards found.</p>
        <p className="text-xs text-gray-500 mt-1">Add a guard in Step 3 first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
          Site <span className="text-red-400">*</span>
        </label>
        <div className="grid grid-cols-1 gap-2">
          {sites.map((site) => (
            <button
              key={site.id}
              onClick={() => onChange({ ...data, site_id: site.id })}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm border transition-all cursor-pointer text-left ${
                data.site_id === site.id
                  ? 'bg-blue-600/20 border-blue-500/50 text-blue-400'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                <i className="ri-building-line text-gray-500" />
              </div>
              <span className="font-medium">{site.site_name}</span>
              {data.site_id === site.id && <i className="ri-check-line ml-auto text-blue-400" />}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
          Guard <span className="text-red-400">*</span>
        </label>
        <div className="grid grid-cols-1 gap-2">
          {guards.map((guard) => (
            <button
              key={guard.id}
              onClick={() => onChange({ ...data, guard_id: guard.id })}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm border transition-all cursor-pointer text-left ${
                data.guard_id === guard.id
                  ? 'bg-blue-600/20 border-blue-500/50 text-blue-400'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                <span className="text-xs text-gray-500">
                  {(guard.first_name?.[0] || '') + (guard.last_name?.[0] || '')}
                </span>
              </div>
              <span className="font-medium">
                {guard.first_name} {guard.last_name}
              </span>
              {data.guard_id === guard.id && <i className="ri-check-line ml-auto text-blue-400" />}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
          Shift Date <span className="text-red-400">*</span>
        </label>
        <input
          type="date"
          value={data.shift_date}
          onChange={(e) => onChange({ ...data, shift_date: e.target.value })}
          className={`${inputBase} ${inputNormal}`}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Start Time <span className="text-red-400">*</span>
          </label>
          <input
            type="time"
            value={data.shift_start}
            onChange={(e) => onChange({ ...data, shift_start: e.target.value })}
            className={`${inputBase} ${inputNormal}`}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            End Time <span className="text-red-400">*</span>
          </label>
          <input
            type="time"
            value={data.shift_end}
            onChange={(e) => onChange({ ...data, shift_end: e.target.value })}
            className={`${inputBase} ${inputNormal}`}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">Shift Notes</label>
        <input
          type="text"
          value={data.notes}
          onChange={(e) => onChange({ ...data, notes: e.target.value })}
          className={`${inputBase} ${inputNormal}`}
          placeholder="Any special instructions for this shift"
        />
      </div>
    </div>
  );
}