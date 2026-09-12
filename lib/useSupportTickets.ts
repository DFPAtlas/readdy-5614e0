'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

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

export function useSupportTickets(scopeToCreator?: boolean) {
  const { profile, companyId } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('support_tickets')
        .select(`
          *,
          creator:created_by(first_name, last_name, email),
          assigned:assigned_to(first_name, last_name),
          affected_site:affected_site_id(site_name),
          affected_user:affected_user_id(first_name, last_name, email)
        `)
        .eq('company_id', companyId);

      if (scopeToCreator && profile?.id) {
        query = query.eq('created_by', profile.id);
      }

      query = query.order('created_at', { ascending: false });

      const { data, error: err } = await query;
      if (err) throw err;
      setTickets(data || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [companyId, scopeToCreator, profile?.id]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const createTicket = async (data: {
    subject: string;
    category: TicketCategory;
    priority: TicketPriority;
    description: string;
    affected_site_id?: string | null;
    affected_user_id?: string | null;
    consent_given: boolean;
  }) => {
    if (!companyId || !profile?.id) throw new Error('Not authenticated');
    const { data: result, error: err } = await supabase
      .from('support_tickets')
      .insert({
        company_id: companyId,
        created_by: profile.id,
        ...data,
      })
      .select()
      .maybeSingle();
    if (err) throw err;
    if (!result) throw new Error('Ticket created but not returned — check RLS permissions.');
    await fetchTickets();
    return result;
  };

  return { tickets, loading, error, refresh: fetchTickets, createTicket };
}

export function useTicketDetail(ticketId: string | null, scopeToCreator?: boolean) {
  const { profile, companyId } = useAuth();
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [attachments, setAttachments] = useState<TicketAttachment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTicket = useCallback(async () => {
    if (!ticketId || !companyId) return;
    setLoading(true);
    setError(null);
    try {
      let ticketQuery = supabase
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
        .eq('company_id', companyId);

      if (scopeToCreator && profile?.id) {
        ticketQuery = ticketQuery.eq('created_by', profile.id);
      }

      const { data: ticketData, error: tErr } = await ticketQuery.maybeSingle();
      if (tErr) throw tErr;

      if (!ticketData) {
        setTicket(null);
        setMessages([]);
        setAttachments([]);
        setLoading(false);
        return;
      }

      setTicket(ticketData);

      const { data: msgData, error: mErr } = await supabase
        .from('support_ticket_messages')
        .select(`
          *,
          sender:sender_id(first_name, last_name, email, role)
        `)
        .eq('ticket_id', ticketId)
        .eq('is_internal', false)
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
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [ticketId, companyId, scopeToCreator, profile?.id]);

  useEffect(() => {
    fetchTicket();
  }, [fetchTicket]);

  const addMessage = async (message: string) => {
    if (!ticketId || !profile?.id) throw new Error('Not authenticated');
    const { data, error: err } = await supabase
      .from('support_ticket_messages')
      .insert({
        ticket_id: ticketId,
        sender_id: profile.id,
        message,
        is_internal: false,
      })
      .select()
      .maybeSingle();
    if (err) throw err;
    if (!data) throw new Error('Message created but not returned — check RLS permissions.');
    await fetchTicket();
    return data;
  };

  const uploadAttachment = async (file: File) => {
    if (!ticketId || !profile?.id) throw new Error('Not authenticated');
    const ext = file.name.split('.').pop() || '';
    const path = `tickets/${ticketId}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const { error: upErr } = await supabase.storage.from('support-attachments').upload(path, file, { cacheControl: '3600' });
    if (upErr) throw upErr;
    const { data, error: attErr } = await supabase
      .from('support_ticket_attachments')
      .insert({
        ticket_id: ticketId,
        file_name: file.name,
        file_path: path,
        file_size: file.size,
        mime_type: file.type,
        uploaded_by: profile.id,
      })
      .select()
      .maybeSingle();
    if (attErr) throw attErr;
    if (!data) throw new Error('Attachment created but not returned — check RLS permissions.');
    await fetchTicket();
    return data;
  };

  return { ticket, messages, attachments, loading, error, refresh: fetchTicket, addMessage, uploadAttachment };
}

export function getCategoryLabel(c: TicketCategory) { return CATEGORIES[c]; }
export function getPriorityBadge(p: TicketPriority) { return PRIORITIES[p]; }
export function getStatusBadge(s: TicketStatus) { return STATUSES[s]; }

export { CATEGORIES, PRIORITIES, STATUSES };