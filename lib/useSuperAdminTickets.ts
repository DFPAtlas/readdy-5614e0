'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export type TicketStatus = 'new' | 'open' | 'in_progress' | 'waiting_on_client' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TicketCategory = 'account_access' | 'billing' | 'subscription' | 'site_access' | 'guard_login' | 'rota_issue' | 'report_issue' | 'data_issue' | 'other';

export interface SupportTicket {
  id: string;
  company_id: string;
  created_by: string;
  subject: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  affected_site_id: string | null;
  affected_user_id: string | null;
  description: string;
  consent_given: boolean;
  assigned_to: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
  creator?: { first_name: string | null; last_name: string | null; email: string | null };
  assigned?: { first_name: string | null; last_name: string | null };
  affected_site?: { site_name: string | null };
  affected_user?: { first_name: string | null; last_name: string | null; email: string | null };
  company?: { name: string };
  message_count?: number;
}

export interface TicketMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  message: string;
  is_internal: boolean;
  created_at: string;
  sender?: { first_name: string | null; last_name: string | null; email: string | null; role: string | null };
}

export interface TicketAttachment {
  id: string;
  ticket_id: string;
  message_id: string | null;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  uploaded_by: string;
  created_at: string;
}

export interface AICheck {
  id: string;
  ticket_id: string;
  company_id: string;
  likely_cause: string;
  suggested_fix: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  recommended_action: string;
  raw_data: any;
  created_at: string;
}

export interface RepairAction {
  id: string;
  ticket_id: string;
  company_id: string;
  action_type: string;
  action_summary: string;
  before_data: any;
  after_data: any;
  performed_by: string | null;
  approved_by: string | null;
  ai_check_id: string | null;
  created_at: string;
}

const CATEGORIES: Record<TicketCategory, string> = {
  account_access: 'Account Access',
  billing: 'Billing',
  subscription: 'Subscription',
  site_access: 'Site Access',
  guard_login: 'Guard Login',
  rota_issue: 'Rota Issue',
  report_issue: 'Report Issue',
  data_issue: 'Data Issue',
  other: 'Other',
};

const PRIORITIES: Record<TicketPriority, { label: string; color: string }> = {
  low: { label: 'Low', color: 'bg-gray-600' },
  medium: { label: 'Medium', color: 'bg-blue-600' },
  high: { label: 'High', color: 'bg-amber-600' },
  urgent: { label: 'Urgent', color: 'bg-red-600' },
};

const STATUSES: Record<TicketStatus, { label: string; color: string }> = {
  new: { label: 'New', color: 'bg-emerald-600' },
  open: { label: 'Open', color: 'bg-blue-600' },
  in_progress: { label: 'In Progress', color: 'bg-amber-600' },
  waiting_on_client: { label: 'Waiting on Client', color: 'bg-purple-600' },
  resolved: { label: 'Resolved', color: 'bg-gray-600' },
  closed: { label: 'Closed', color: 'bg-gray-700' },
};

export function useSuperAdminTickets(filterStatus?: TicketStatus | null, searchQuery?: string) {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('support_tickets')
        .select(`
          *,
          creator:created_by(first_name, last_name, email),
          assigned:assigned_to(first_name, last_name),
          company:company_id(name)
        `)
        .order('created_at', { ascending: false });
      if (filterStatus) {
        query = query.eq('status', filterStatus);
      }
      const { data, error: err } = await query;
      if (err) throw err;
      let result = data || [];
      if (searchQuery?.trim()) {
        const q = searchQuery.toLowerCase();
        result = result.filter(
          (t) =>
            t.subject.toLowerCase().includes(q) ||
            t.description.toLowerCase().includes(q) ||
            t.company?.name?.toLowerCase().includes(q) ||
            (t.creator?.email || '').toLowerCase().includes(q)
        );
      }
      setTickets(result);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, searchQuery]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const updateTicket = async (id: string, updates: Partial<SupportTicket>) => {
    const { error: err } = await supabase.from('support_tickets').update(updates).eq('id', id);
    if (err) throw err;
    await fetchTickets();
  };

  const deleteTicket = async (id: string) => {
    const { error: err } = await supabase.from('support_tickets').delete().eq('id', id);
    if (err) throw err;
    await fetchTickets();
  };

  return { tickets, loading, error, refresh: fetchTickets, updateTicket, deleteTicket };
}

export function useSuperAdminTicketDetail(ticketId: string | null) {
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [attachments, setAttachments] = useState<TicketAttachment[]>([]);
  const [aiChecks, setAiChecks] = useState<AICheck[]>([]);
  const [repairActions, setRepairActions] = useState<RepairAction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTicket = useCallback(async () => {
    if (!ticketId) return;
    setLoading(true);
    setError(null);
    try {
      const { data: ticketData, error: tErr } = await supabase
        .from('support_tickets')
        .select(`
          *,
          creator:created_by(first_name, last_name, email),
          assigned:assigned_to(first_name, last_name),
          affected_site:affected_site_id(site_name),
          affected_user:affected_user_id(first_name, last_name, email),
          company:company_id(name)
        `)
        .eq('id', ticketId)
        .maybeSingle();
      if (tErr) throw tErr;
      setTicket(ticketData);

      const { data: msgData, error: mErr } = await supabase
        .from('support_ticket_messages')
        .select(`
          *,
          sender:sender_id(first_name, last_name, email, role)
        `)
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });
      if (mErr) throw mErr;
      setMessages(msgData || []);

      const { data: attData, error: aErr } = await supabase
        .from('support_ticket_attachments')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });
      if (aErr) throw aErr;
      setAttachments(attData || []);

      const { data: aiData, error: aiErr } = await supabase
        .from('support_ticket_ai_checks')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: false });
      if (aiErr) throw aiErr;
      setAiChecks(aiData || []);

      const { data: repData, error: repErr } = await supabase
        .from('support_ticket_actions')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });
      if (repErr) throw repErr;
      setRepairActions(repData || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    fetchTicket();
  }, [fetchTicket]);

  const addMessage = async (message: string, isInternal: boolean = false) => {
    if (!ticketId) throw new Error('No ticket');
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData.user?.id;
    if (!userId) throw new Error('Not authenticated');
    const { data, error: err } = await supabase
      .from('support_ticket_messages')
      .insert({
        ticket_id: ticketId,
        sender_id: userId,
        message,
        is_internal: isInternal,
      })
      .select()
      .maybeSingle();
    if (err || !data) throw err || new Error('Failed to add message');
    await fetchTicket();
    return data;
  };

  const runAICheck = async (companyId: string, affectedUserId?: string | null) => {
    if (!ticketId || !companyId) throw new Error('Missing data');
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) throw new Error('Not authenticated');
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/ticket-ai-check`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ ticketId, companyId, affectedUserId }),
      }
    );
    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'AI check failed' }));
      throw new Error(err.error || 'AI check failed');
    }
    const result = await response.json();
    const { data, error: insErr } = await supabase
      .from('support_ticket_ai_checks')
      .insert({
        ticket_id: ticketId,
        company_id: companyId,
        likely_cause: result.likely_cause,
        suggested_fix: result.suggested_fix,
        risk_level: result.risk_level,
        recommended_action: result.recommended_action,
        raw_data: result.raw_data || {},
      })
      .select()
      .maybeSingle();
    if (insErr || !data) throw insErr || new Error('AI check failed');
    await fetchTicket();
    return data;
  };

  const approveRepair = async (actionType: string, actionSummary: string, beforeData: any, afterData: any, aiCheckId?: string | null) => {
    if (!ticketId || !ticket?.company_id) throw new Error('Missing data');
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData.user?.id;
    if (!userId) throw new Error('Not authenticated');

    const { data: action, error: actErr } = await supabase
      .from('support_ticket_actions')
      .insert({
        ticket_id: ticketId,
        company_id: ticket.company_id,
        action_type: actionType,
        action_summary: actionSummary,
        before_data: beforeData,
        after_data: afterData,
        performed_by: userId,
        approved_by: userId,
        ai_check_id: aiCheckId || null,
      })
      .select()
      .maybeSingle();
    if (actErr || !action) throw actErr || new Error('Failed to create repair action');

    const { data: log, error: logErr } = await supabase
      .from('admin_repair_logs')
      .insert({
        ticket_id: ticketId,
        company_id: ticket.company_id,
        action_type: actionType,
        action_summary: actionSummary,
        performed_by: userId,
        approved_by: userId,
        before_data: beforeData,
        after_data: afterData,
      })
      .select()
      .maybeSingle();
    if (logErr || !log) throw logErr || new Error('Failed to create repair log');

    await fetchTicket();
    return { action, log };
  };

  return { ticket, messages, attachments, aiChecks, repairActions, loading, error, refresh: fetchTicket, addMessage, runAICheck, approveRepair };
}

export function getCategoryLabel(c: TicketCategory) { return CATEGORIES[c]; }
export function getPriorityBadge(p: TicketPriority) { return PRIORITIES[p]; }
export function getStatusBadge(s: TicketStatus) { return STATUSES[s]; }

export { CATEGORIES, PRIORITIES, STATUSES };