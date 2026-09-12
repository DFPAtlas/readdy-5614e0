'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

export const SUPPORT_CATEGORIES: { value: string; label: string }[] = [
  { value: 'account_access', label: 'Account access' },
  { value: 'security_concern', label: 'Security concern' },
  { value: 'operations', label: 'Operations' },
  { value: 'guard_app', label: 'Guard mobile app' },
  { value: 'incident_sos', label: 'Incident / SOS' },
  { value: 'billing', label: 'Billing' },
  { value: 'integration', label: 'Integration' },
  { value: 'data_privacy', label: 'Data / privacy' },
  { value: 'feature_question', label: 'Feature question' },
  { value: 'service_outage', label: 'Service outage' },
  { value: 'other', label: 'Other' },
];

export const SUPPORT_PRIORITIES: Record<string, { label: string; color: string }> = {
  p1: { label: 'P1 Critical', color: 'bg-red-600/15 text-red-400' },
  p2: { label: 'P2 High', color: 'bg-amber-600/15 text-amber-400' },
  p3: { label: 'P3 Normal', color: 'bg-blue-600/15 text-blue-400' },
  p4: { label: 'P4 Low', color: 'bg-gray-600/15 text-gray-400' },
};

export const SUPPORT_STATUSES: Record<string, { label: string; color: string }> = {
  new: { label: 'New', color: 'bg-blue-600/15 text-blue-400' },
  triaged: { label: 'Triaged', color: 'bg-indigo-600/15 text-indigo-400' },
  in_progress: { label: 'In progress', color: 'bg-amber-600/15 text-amber-400' },
  awaiting_customer: { label: 'Awaiting customer', color: 'bg-purple-600/15 text-purple-400' },
  awaiting_internal: { label: 'Awaiting internal', color: 'bg-purple-600/15 text-purple-400' },
  resolved: { label: 'Resolved', color: 'bg-emerald-600/15 text-emerald-400' },
  closed: { label: 'Closed', color: 'bg-gray-600/15 text-gray-400' },
  reopened: { label: 'Reopened', color: 'bg-red-600/15 text-red-400' },
};

export function categoryLabel(v: string) { return SUPPORT_CATEGORIES.find((c) => c.value === v)?.label || v; }

export function useSupportTickets(scope: 'tenant' | 'platform' = 'tenant') {
  const { companyId } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    let q = supabase.from('support_tickets').select('*, company:company_id(name)').order('created_at', { ascending: false });
    if (scope === 'tenant' && companyId) q = q.eq('company_id', companyId);
    const { data } = await q;
    setTickets(data || []);
    setLoading(false);
  }, [companyId, scope]);

  useEffect(() => { load(); }, [load]);

  const createTicket = useCallback(async (payload: { subject: string; category: string; priority: string; description: string; consent_given: boolean }) => {
    if (!companyId) throw new Error('Not authenticated');
    const { data, error } = await supabase.from('support_tickets').insert({
      company_id: companyId,
      created_by: (await supabase.auth.getUser()).data.user?.id || null,
      subject: payload.subject,
      category: payload.category,
      priority: payload.priority,
      description: payload.description,
      consent_given: payload.consent_given,
      status: 'new',
    }).select().maybeSingle();
    if (error) throw error;
    await load();
    return data;
  }, [companyId, load]);

  return { tickets, loading, refresh: load, createTicket };
}

export function useSupportTicketDetail(ticketId: string | null, scope: 'tenant' | 'platform' = 'tenant') {
  const { profile, companyId } = useAuth();
  const [ticket, setTicket] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [internalNotes, setInternalNotes] = useState<any[]>([]);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!ticketId) { setLoading(false); return; }
    setLoading(true);
    let q = supabase.from('support_tickets').select('*, company:company_id(name)').eq('id', ticketId);
    if (scope === 'tenant' && companyId) q = q.eq('company_id', companyId);
    const { data: t } = await q.maybeSingle();
    setTicket(t || null);

    if (t) {
      const [msgRes, attRes, evtRes] = await Promise.all([
        supabase.from('support_ticket_messages').select('*, sender:sender_id(first_name,last_name,email,role)').eq('ticket_id', ticketId).order('created_at', { ascending: true }),
        supabase.from('support_ticket_attachments').select('*').eq('ticket_id', ticketId).order('created_at', { ascending: true }),
        supabase.from('support_ticket_events').select('*').eq('ticket_id', ticketId).order('created_at', { ascending: true }),
      ]);
      const allMsgs = msgRes.data || [];
      setMessages(allMsgs.filter((m: any) => !m.is_internal));
      setInternalNotes(allMsgs.filter((m: any) => m.is_internal));
      setAttachments(attRes.data || []);
      setEvents(evtRes.data || []);
    }
    setLoading(false);
  }, [ticketId, companyId, scope]);

  useEffect(() => { load(); }, [load]);

  const addMessage = useCallback(async (message: string, isInternal: boolean = false) => {
    if (!ticketId || !profile?.id) throw new Error('Not authenticated');
    const { error } = await supabase.from('support_ticket_messages').insert({ ticket_id: ticketId, sender_id: profile.id, message, is_internal: isInternal });
    if (error) throw error;
    await supabase.from('support_ticket_events').insert({ ticket_id: ticketId, actor_id: profile.id, action: isInternal ? 'internal_note' : 'message' });
    await load();
  }, [ticketId, profile?.id, load]);

  const updateStatus = useCallback(async (newStatus: string) => {
    if (!ticketId || !profile?.id) return;
    const prev = ticket?.status;
    await supabase.from('support_tickets').update({ status: newStatus, resolved_at: ['resolved', 'closed'].includes(newStatus) ? new Date().toISOString() : ticket?.resolved_at }).eq('id', ticketId);
    await supabase.from('support_ticket_events').insert({ ticket_id: ticketId, actor_id: profile.id, action: 'status_change', previous_status: prev, new_status: newStatus });
    await load();
  }, [ticketId, profile?.id, ticket, load]);

  const assign = useCallback(async (assignTo: string | null) => {
    if (!ticketId) return;
    await supabase.from('support_tickets').update({ assigned_to: assignTo }).eq('id', ticketId);
    await load();
  }, [ticketId, load]);

  const uploadAttachment = useCallback(async (file: File) => {
    if (!ticketId || !profile?.id) throw new Error('Not authenticated');
    const ext = file.name.split('.').pop() || '';
    const path = `tickets/${ticketId}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const { error: upErr } = await supabase.storage.from('support-attachments').upload(path, file, { cacheControl: '3600' });
    if (upErr) throw upErr;
    await supabase.from('support_ticket_attachments').insert({ ticket_id: ticketId, file_name: file.name, file_path: path, file_size: file.size, mime_type: file.type, uploaded_by: profile.id });
    await load();
  }, [ticketId, profile?.id, load]);

  const rate = useCallback(async (rating: number, comment?: string) => {
    if (!ticketId) return;
    await supabase.from('support_tickets').update({ satisfaction_rating: rating }).eq('id', ticketId);
    await supabase.from('ticket_satisfaction_ratings').insert({ ticket_id: ticketId, company_id: companyId, rating, comment: comment || null, rated_by: profile?.id || null, rated_at: new Date().toISOString() });
    await load();
  }, [ticketId, companyId, profile?.id, load]);

  return { ticket, messages, internalNotes, attachments, events, loading, refresh: load, addMessage, updateStatus, assign, uploadAttachment, rate };
}