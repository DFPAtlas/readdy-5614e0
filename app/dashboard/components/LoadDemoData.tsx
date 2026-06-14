'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

interface Props {
  companyId: string | null;
  onComplete: () => void;
}

export default function LoadDemoData({ companyId, onComplete }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shouldAutoLoad, setShouldAutoLoad] = useState(false);
  const [checking, setChecking] = useState(true);
  const [done, setDone] = useState(false);
  const hasLoaded = useRef(false);

  useEffect(() => {
    if (!companyId || hasLoaded.current) return;

    async function check() {
      try {
        const { count, error: countErr } = await supabase
          .from('sites')
          .select('id', { count: 'exact', head: true })
          .eq('company_id', companyId);

        if (!countErr && (count || 0) === 0) {
          setShouldAutoLoad(true);
        }
      } catch {
        // fall through
      }
      setChecking(false);
    }

    check();
  }, [companyId]);

  useEffect(() => {
    if (!shouldAutoLoad || hasLoaded.current) return;
    hasLoaded.current = true;
    handleLoad();
  }, [shouldAutoLoad]);

  const handleLoad = async () => {
    if (!companyId) return;
    setLoading(true);
    setError('');

    try {
      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

      const sites = [
        { company_id: companyId, site_name: 'Westfield Shopping Centre', address: 'Ariel Way, London W12 7GF', client_contact_name: 'Sarah Mitchell', site_contact_phone: '+44 7700 900001', emergency_contact: '+44 7700 900002', risk_level: 'medium', check_call_interval: 60 },
        { company_id: companyId, site_name: 'Canary Wharf Tower', address: '1 Canada Square, London E14 5AB', client_contact_name: 'James Wilson', site_contact_phone: '+44 7700 900003', emergency_contact: '+44 7700 900004', risk_level: 'high', check_call_interval: 30 },
        { company_id: companyId, site_name: 'Riverside Business Park', address: 'Thames Valley Park, Reading RG6 1PQ', client_contact_name: 'Emma Collins', site_contact_phone: '+44 7700 900005', emergency_contact: '+44 7700 900006', risk_level: 'low', check_call_interval: 120 },
      ];
      const { data: siteRows, error: siteErr } = await supabase.from('sites').insert(sites).select('id');
      if (siteErr) throw siteErr;

      const guards = [
        { company_id: companyId, first_name: 'David', last_name: 'Okafor', email: 'david.okafor@demo.com', phone: '+44 7700 910001', sia_licence: '1234567890123', sia_expiry: '2027-06-15', status: 'active', skills: ['Door Supervisor', 'CCTV'], hourly_rate: 15.5 },
        { company_id: companyId, first_name: 'Priya', last_name: 'Sharma', email: 'priya.sharma@demo.com', phone: '+44 7700 910002', sia_licence: '9876543210987', sia_expiry: '2026-11-20', status: 'active', skills: ['First Aid', 'Fire Marshal'], hourly_rate: 14.0 },
        { company_id: companyId, first_name: 'Michael', last_name: 'Adebayo', email: 'michael.adebayo@demo.com', phone: '+44 7700 910003', sia_licence: '4567890123456', sia_expiry: '2027-03-08', status: 'active', skills: ['Door Supervisor', 'Patrol', 'Reception'], hourly_rate: 16.0 },
        { company_id: companyId, first_name: 'Lucy', last_name: 'Thompson', email: 'lucy.thompson@demo.com', phone: '+44 7700 910004', sia_licence: '7890123456789', sia_expiry: '2028-01-12', status: 'active', skills: ['CCTV', 'Keyholding'], hourly_rate: 15.0 },
        { company_id: companyId, first_name: 'Ahmed', last_name: 'Khan', email: 'ahmed.khan@demo.com', phone: '+44 7700 910005', sia_licence: '2345678901234', sia_expiry: '2026-09-30', status: 'active', skills: ['Door Supervisor', 'First Aid', 'Events'], hourly_rate: 15.75 },
      ];
      const { data: guardRows, error: guardErr } = await supabase.from('guards').insert(guards).select('id');
      if (guardErr) throw guardErr;

      const patrolCheckpoints = [
        { company_id: companyId, site_id: siteRows?.[0]?.id, name: 'Main Entrance', description: 'Front gate and visitor reception', order_index: 1 },
        { company_id: companyId, site_id: siteRows?.[0]?.id, name: 'Car Park Level 1', description: 'Underground parking area', order_index: 2 },
        { company_id: companyId, site_id: siteRows?.[0]?.id, name: 'Loading Bay', description: 'Goods delivery and dispatch', order_index: 3 },
        { company_id: companyId, site_id: siteRows?.[0]?.id, name: 'Food Court', description: 'Central dining area', order_index: 4 },
        { company_id: companyId, site_id: siteRows?.[1]?.id, name: 'Lobby', description: 'Main reception and security desk', order_index: 1 },
        { company_id: companyId, site_id: siteRows?.[1]?.id, name: 'Server Room', description: 'IT infrastructure and comms', order_index: 2 },
        { company_id: companyId, site_id: siteRows?.[1]?.id, name: 'Roof Access', description: 'Helipad and maintenance area', order_index: 3 },
      ];
      const { error: cpErr } = await supabase.from('patrol_checkpoints').insert(patrolCheckpoints);
      if (cpErr) throw cpErr;

      if (siteRows && siteRows.length > 0 && guardRows && guardRows.length > 0) {
        const shifts = [
          { company_id: companyId, site_id: siteRows[0].id, guard_id: guardRows[0].id, start_time: `${today}T08:00`, end_time: `${today}T20:00`, shift_type: 'day', status: 'scheduled' },
          { company_id: companyId, site_id: siteRows[0].id, guard_id: guardRows[1].id, start_time: `${today}T20:00`, end_time: `${tomorrow}T08:00`, shift_type: 'night', status: 'scheduled' },
          { company_id: companyId, site_id: siteRows[1].id, guard_id: guardRows[2].id, start_time: `${today}T06:00`, end_time: `${today}T18:00`, shift_type: 'day', status: 'scheduled' },
          { company_id: companyId, site_id: siteRows[1].id, guard_id: guardRows[3].id, start_time: `${today}T18:00`, end_time: `${tomorrow}T06:00`, shift_type: 'night', status: 'scheduled' },
          { company_id: companyId, site_id: siteRows[2].id, guard_id: guardRows[4].id, start_time: `${today}T09:00`, end_time: `${today}T17:00`, shift_type: 'day', status: 'scheduled' },
        ];
        const { error: shiftErr } = await supabase.from('shifts').insert(shifts);
        if (shiftErr) throw shiftErr;
      }

      const incs = [
        { company_id: companyId, site_id: siteRows?.[0]?.id, guard_id: guardRows?.[0]?.id, incident_type: 'security', description: 'Individual attempted to enter via loading bay without credentials. Security challenged and escorted off premises.', severity: 'medium', status: 'resolved' },
        { company_id: companyId, site_id: siteRows?.[1]?.id, guard_id: guardRows?.[2]?.id, incident_type: 'fire_safety', description: 'Smoke detector activated at 14:30. Fire brigade attended. False alarm caused by HVAC maintenance work.', severity: 'high', status: 'under_review' },
      ];
      const { error: incErr } = await supabase.from('incidents').insert(incs);
      if (incErr) throw incErr;

      const sops = [
        { company_id: companyId, title: 'Site Access Control SOP', category: 'sop', status: 'published' },
        { company_id: companyId, title: 'Emergency Evacuation Procedure', category: 'sop', status: 'published' },
        { company_id: companyId, title: 'Westfield Shopping Centre Risk Assessment', category: 'risk_assessment', status: 'published' },
        { company_id: companyId, title: 'Canary Wharf Tower Risk Assessment', category: 'risk_assessment', status: 'draft' },
      ];
      const { error: sopErr } = await supabase.from('sop_documents').insert(sops);
      if (sopErr) throw sopErr;

      const obs = [
        { company_id: companyId, site_id: siteRows?.[0]?.id, guard_id: guardRows?.[0]?.id, entry_type: 'check_in', entry: 'Shift handover complete. All areas secure. Keys accounted for.' },
        { company_id: companyId, site_id: siteRows?.[0]?.id, guard_id: guardRows?.[0]?.id, entry_type: 'patrol', entry: 'Patrol route A completed. No issues found. All doors secure.' },
        { company_id: companyId, site_id: siteRows?.[1]?.id, guard_id: guardRows?.[2]?.id, entry_type: 'incident', entry: 'Visitor reported suspicious package in lobby. Area cordoned. Police notified.' },
      ];
      const { error: obErr } = await supabase.from('occurrence_books').insert(obs);
      if (obErr) throw obErr;

      setDone(true);
      onComplete();
    } catch (e: any) {
      setError(e.message || 'Failed to load demo data');
    } finally {
      setLoading(false);
    }
  };

  if (done || (!checking && !shouldAutoLoad)) return null;

  if (loading) {
    return (
      <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 mb-5 flex items-center gap-3">
        <div className="w-5 h-5 flex items-center justify-center">
          <i className="ri-loader-4-line animate-spin text-blue-400"></i>
        </div>
        <span className="text-sm text-blue-400">Seeding demo data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 flex items-center justify-center">
            <i className="ri-error-warning-line text-red-400"></i>
          </div>
          <span className="text-sm text-red-400">{error}</span>
        </div>
        <button
          onClick={handleLoad}
          className="text-sm text-red-400 hover:text-red-300 underline cursor-pointer whitespace-nowrap"
        >
          Retry
        </button>
      </div>
    );
  }

  return null;
}