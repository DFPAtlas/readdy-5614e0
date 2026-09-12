import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface SupportCase {
  id: string;
  case_ref: string;
  company_id: string | null;
  requester_id: string | null;
  category: string;
  priority: string;
  status: string;
  subject: string;
  description: string | null;
  assigned_team: string | null;
  assigned_to: string | null;
  sla_target_at: string | null;
  sla_breached: boolean;
  resolved_at: string | null;
  resolution: string | null;
  created_at: string;
  updated_at: string;
  company?: { name: string } | null;
  requester?: { first_name: string | null; last_name: string | null; email: string | null } | null;
  assignee?: { first_name: string | null; last_name: string | null } | null;
  message_count?: number;
}

export interface SupportMessage {
  id: string;
  case_id: string;
  sender_id: string | null;
  visibility: string;
  message: string;
  attachment_paths: string[] | null;
  created_at: string;
  sender?: { first_name: string | null; last_name: string | null; email: string | null } | null;
}

export interface SupportCaseEvent {
  id: string;
  case_id: string;
  actor_id: string | null;
  action: string;
  previous_status: string | null;
  new_status: string | null;
  metadata: any;
  created_at: string;
  actor?: { first_name: string | null; last_name: string | null } | null;
}

export function useSupportCases(userId: string | null) {
  const [cases, setCases] = useState<SupportCase[]>([]);
  const [messages, setMessages] = useState<Record<string, SupportMessage[]>>({});
  const [events, setEvents] = useState<Record<string, SupportCaseEvent[]>>({});
  const [loading, setLoading] = useState(false);

  const loadCases = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('support_cases')
      .select('*, company:companies(name)')
      .order('created_at', { ascending: false });

    if (data) {
      const userIds = [...new Set(data.map((c: any) => [c.requester_id, c.assigned_to]).flat().filter(Boolean))];
      const { data: profiles } = userIds.length > 0
        ? await supabase.from('users').select('id,first_name,last_name,email').in('id', userIds)
        : { data: [] };

      const profileMap: Record<string, any> = {};
      (profiles || []).forEach((p: any) => { profileMap[p.id] = p; });

      const enriched = data.map((c: any) => ({
        ...c,
        requester: c.requester_id ? profileMap[c.requester_id] || null : null,
        assignee: c.assigned_to ? profileMap[c.assigned_to] || null : null,
      }));

      const withCounts = await Promise.all(enriched.map(async (c: any) => {
        const { count } = await supabase
          .from('support_messages')
          .select('*', { count: 'exact', head: true })
          .eq('case_id', c.id);
        return { ...c, message_count: count || 0 };
      }));
      setCases(withCounts);
    }
    setLoading(false);
  }, []);

  const loadMessages = useCallback(async (caseId: string) => {
    const { data } = await supabase
      .from('support_messages')
      .select('*, sender:users!support_messages_sender_id_fkey(first_name,last_name,email)')
      .eq('case_id', caseId)
      .order('created_at', { ascending: true });
    if (data) {
      setMessages(prev => ({ ...prev, [caseId]: data }));
    }
  }, []);

  const loadEvents = useCallback(async (caseId: string) => {
    const { data } = await supabase
      .from('support_case_events')
      .select('*, actor:users!support_case_events_actor_id_fkey(first_name,last_name)')
      .eq('case_id', caseId)
      .order('created_at', { ascending: true });
    if (data) {
      setEvents(prev => ({ ...prev, [caseId]: data }));
    }
  }, []);

  const createCase = async (data: { company_id?: string; subject: string; description: string; category: string; priority: string }) => {
    const ref = 'SC-' + Date.now().toString(36).toUpperCase();
    const { data: newCase, error } = await supabase.from('support_cases').insert({
      case_ref: ref,
      company_id: data.company_id || null,
      requester_id: userId,
      subject: data.subject,
      description: data.description,
      category: data.category,
      priority: data.priority,
    }).select('*, company:companies(name)').maybeSingle();

    if (!error && newCase) {
      const { data: reqProfile } = userId
        ? await supabase.from('users').select('first_name,last_name,email').eq('id', userId).maybeSingle()
        : { data: null };
      setCases(prev => [{ ...newCase, message_count: 0, requester: reqProfile, assignee: null }, ...prev]);
      await supabase.from('support_case_events').insert({
        case_id: newCase.id,
        actor_id: userId,
        action: 'created',
        new_status: 'new',
      });
    }
    return { data: newCase, error };
  };

  const addMessage = async (caseId: string, message: string, visibility: string = 'customer') => {
    const { data, error } = await supabase.from('support_messages').insert({
      case_id: caseId,
      sender_id: userId,
      message,
      visibility,
    }).select('*').maybeSingle();

    if (!error && data) {
      const { data: senderProfile } = userId
        ? await supabase.from('users').select('first_name,last_name,email').eq('id', userId).maybeSingle()
        : { data: null };
      const enriched = { ...data, sender: senderProfile };
      setMessages(prev => ({
        ...prev,
        [caseId]: [...(prev[caseId] || []), enriched],
      }));
      setCases(prev => prev.map(c => c.id === caseId ? { ...c, message_count: (c.message_count || 0) + 1 } : c));
    }
    return { data, error };
  };

  const updateStatus = async (caseId: string, newStatus: string, resolution?: string) => {
    const updates: any = { status: newStatus };
    if (resolution) updates.resolution = resolution;
    if (newStatus === 'resolved' || newStatus === 'closed') updates.resolved_at = new Date().toISOString();

    const { error } = await supabase.from('support_cases').update(updates).eq('id', caseId);
    if (!error) {
      setCases(prev => prev.map(c => c.id === caseId ? { ...c, ...updates } : c));
      await supabase.from('support_case_events').insert({
        case_id: caseId,
        actor_id: userId,
        action: 'status_change',
        previous_status: cases.find(c => c.id === caseId)?.status,
        new_status: newStatus,
      });
    }
    return { error };
  };

  const assignCase = async (caseId: string, assignToId: string | null) => {
    const { error } = await supabase.from('support_cases').update({ assigned_to: assignToId }).eq('id', caseId);
    if (!error) {
      setCases(prev => prev.map(c => c.id === caseId ? { ...c, assigned_to: assignToId } : c));
      await supabase.from('support_case_events').insert({
        case_id: caseId,
        actor_id: userId,
        action: 'assigned',
        metadata: { assigned_to: assignToId },
      });
    }
    return { error };
  };

  useEffect(() => { loadCases(); }, [loadCases]);

  return {
    cases, messages, events, loading,
    loadMessages, loadEvents,
    createCase, addMessage, updateStatus, assignCase,
    refresh: loadCases,
  };
}