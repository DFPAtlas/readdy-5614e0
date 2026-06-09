'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { format, subDays, startOfWeek, endOfWeek } from 'date-fns';

export interface WeeklyReportSchedule {
  id: string;
  company_id: string;
  client_id: string | null;
  site_id: string | null;
  schedule_name: string;
  frequency: string;
  day_of_week: number;
  time_of_day: string;
  include_site_summary: boolean;
  include_guard_attendance: boolean;
  include_patrol_completion: boolean;
  include_missed_patrols: boolean;
  include_incidents: boolean;
  include_dob_summary: boolean;
  include_welfare_summary: boolean;
  include_evidence_summary: boolean;
  include_support_tickets: boolean;
  include_ai_recommendations: boolean;
  auto_email: boolean;
  email_recipients: string[] | null;
  is_active: boolean;
  created_at: string;
}

export interface ReportEmailLog {
  id: string;
  company_id: string;
  client_id: string | null;
  site_id: string | null;
  report_type: string;
  period_start: string;
  period_end: string;
  sent_at: string;
  sent_by: string | null;
  recipient_email: string | null;
  status: string;
  file_url: string | null;
  created_at: string;
}

export interface ReportTemplate {
  id: string;
  company_id: string;
  template_name: string;
  description: string | null;
  include_site_summary: boolean;
  include_guard_attendance: boolean;
  include_patrol_completion: boolean;
  include_missed_patrols: boolean;
  include_incidents: boolean;
  include_dob_summary: boolean;
  include_welfare_summary: boolean;
  include_evidence_summary: boolean;
  include_support_tickets: boolean;
  include_ai_recommendations: boolean;
  brand_color: string;
  is_default: boolean;
}

export interface ReportMetrics {
  totalShifts: number;
  totalPatrols: number;
  patrolCompletionRate: number;
  incidentsOpened: number;
  incidentsClosed: number;
  lateStarts: number;
  openIssues: number;
  guardAttendanceRate: number;
  missedPatrols: number;
  welfareCheckCalls: number;
  missedWelfareChecks: number;
  evidenceFiles: number;
  openTickets: number;
}

export interface ReportData {
  site: { site_name: string; address: string | null } | null;
  client: { name: string | null; contact_email: string | null } | null;
  shifts: any[];
  attendance: any[];
  patrolLogs: any[];
  patrolScans: any[];
  incidents: any[];
  occurrenceBooks: any[];
  welfareCheckins: any[];
  evidenceFiles: any[];
  supportTickets: any[];
  metrics: ReportMetrics;
}

export function useClientWeeklyReports() {
  const { companyId } = useAuth();
  const [schedules, setSchedules] = useState<WeeklyReportSchedule[]>([]);
  const [emailLogs, setEmailLogs] = useState<ReportEmailLog[]>([]);
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSchedules = useCallback(async () => {
    if (!companyId) return;
    const { data, error: err } = await supabase
      .from('weekly_report_schedule')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });
    if (!err) setSchedules(data || []);
  }, [companyId]);

  const loadEmailLogs = useCallback(async () => {
    if (!companyId) return;
    const { data, error: err } = await supabase
      .from('report_email_log')
      .select('*')
      .eq('company_id', companyId)
      .order('sent_at', { ascending: false })
      .limit(50);
    if (!err) setEmailLogs(data || []);
  }, [companyId]);

  const loadTemplates = useCallback(async () => {
    if (!companyId) return;
    const { data, error: err } = await supabase
      .from('client_report_templates')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });
    if (!err) setTemplates(data || []);
  }, [companyId]);

  useEffect(() => {
    if (!companyId) return;
    loadSchedules();
    loadEmailLogs();
    loadTemplates();
  }, [companyId, loadSchedules, loadEmailLogs, loadTemplates]);

  const fetchReportData = useCallback(async (clientId: string | null, siteId: string | null, dateFrom: string, dateTo: string) => {
    if (!companyId) return;
    setLoading(true);
    setError(null);

    try {
      const fromISO = new Date(dateFrom).toISOString();
      const toISO = new Date(dateTo + 'T23:59:59').toISOString();

      const siteQuery = siteId
        ? supabase.from('sites').select('site_name, address').eq('id', siteId).single()
        : { data: null, error: null };

      const clientQuery = clientId
        ? supabase.from('clients').select('name, contact_email').eq('id', clientId).single()
        : { data: null, error: null };

      let shiftsQuery = supabase.from('shifts').select('*').eq('company_id', companyId).gte('start_time', fromISO).lte('start_time', toISO);
      if (siteId) shiftsQuery = shiftsQuery.eq('site_id', siteId);

      let attendanceQuery = supabase.from('attendance_logs').select('*').eq('company_id', companyId).gte('clock_in', fromISO).lte('clock_in', toISO);
      if (siteId) attendanceQuery = attendanceQuery.eq('site_id', siteId);

      let patrolLogsQuery = supabase.from('patrol_logs').select('*').eq('company_id', companyId).gte('start_time', fromISO).lte('start_time', toISO);
      if (siteId) patrolLogsQuery = patrolLogsQuery.eq('site_id', siteId);

      let patrolScansQuery = supabase.from('patrol_scans').select('*').eq('company_id', companyId).gte('scanned_at', fromISO).lte('scanned_at', toISO);
      if (siteId) patrolScansQuery = patrolScansQuery.eq('site_id', siteId);

      let incidentsQuery = supabase.from('incidents').select('*').eq('company_id', companyId).gte('occurred_at', fromISO).lte('occurred_at', toISO);
      if (siteId) incidentsQuery = incidentsQuery.eq('site_id', siteId);

      let obQuery = supabase.from('occurrence_books').select('*').eq('company_id', companyId).gte('created_at', fromISO).lte('created_at', toISO);
      if (siteId) obQuery = obQuery.eq('site_id', siteId);

      let welfareQuery = supabase.from('lone_worker_checkins').select('*').eq('company_id', companyId).gte('checked_in_at', fromISO).lte('checked_in_at', toISO);

      let evidenceQuery = supabase.from('evidence_files').select('*').eq('company_id', companyId).gte('created_at', fromISO).lte('created_at', toISO);
      if (siteId) evidenceQuery = evidenceQuery.eq('site_id', siteId);

      let ticketsQuery = supabase.from('support_tickets').select('*').eq('company_id', companyId).gte('created_at', fromISO).lte('created_at', toISO);
      if (siteId) ticketsQuery = ticketsQuery.eq('affected_site_id', siteId);

      const [
        { data: siteData },
        { data: clientData },
        { data: shiftsData },
        { data: attendanceData },
        { data: patrolLogsData },
        { data: patrolScansData },
        { data: incidentsData },
        { data: obData },
        { data: welfareData },
        { data: evidenceData },
        { data: ticketsData },
      ] = await Promise.all([
        siteQuery,
        clientQuery,
        shiftsQuery,
        attendanceQuery,
        patrolLogsQuery,
        patrolScansQuery,
        incidentsQuery,
        obQuery,
        welfareQuery,
        evidenceQuery,
        ticketsQuery,
      ]);

      const shifts = (shiftsData || []) as any[];
      const attendance = (attendanceData || []) as any[];
      const patrolLogs = (patrolLogsData || []) as any[];
      const patrolScans = (patrolScansData || []) as any[];
      const incidents = (incidentsData || []) as any[];
      const occurrenceBooks = (obData || []) as any[];
      const welfareCheckins = (welfareData || []) as any[];
      const evidenceFiles = (evidenceData || []) as any[];
      const supportTickets = (ticketsData || []) as any[];

      const completedPatrols = patrolScans.filter((s) => s.status === 'completed').length;
      const totalPatrols = patrolLogs.length || patrolScans.length || 1;
      const patrolCompletionRate = Math.round((completedPatrols / totalPatrols) * 100);
      const missedPatrols = patrolLogs.filter((p) => p.status === 'missed').length;
      const lateStarts = 0;
      const openIncidents = incidents.filter((i) => i.status === 'open').length;
      const closedIncidents = incidents.filter((i) => i.status === 'resolved' || i.status === 'closed').length;
      const missedWelfare = 0;
      const openTickets = supportTickets.filter((t) => t.status === 'open').length;

      const attendanceRate = attendance.length > 0
        ? Math.round((attendance.filter((a) => a.clock_in && a.clock_out).length / attendance.length) * 100)
        : 0;

      const metrics: ReportMetrics = {
        totalShifts: shifts.length,
        totalPatrols: totalPatrols,
        patrolCompletionRate: patrolCompletionRate,
        incidentsOpened: incidents.length,
        incidentsClosed: closedIncidents,
        lateStarts: lateStarts,
        openIssues: openIncidents + openTickets,
        guardAttendanceRate: attendanceRate,
        missedPatrols: missedPatrols,
        welfareCheckCalls: welfareCheckins.length,
        missedWelfareChecks: missedWelfare,
        evidenceFiles: evidenceFiles.length,
        openTickets: openTickets,
      };

      setReportData({
        site: siteData as any,
        client: clientData as any,
        shifts,
        attendance,
        patrolLogs,
        patrolScans,
        incidents,
        occurrenceBooks,
        welfareCheckins,
        evidenceFiles,
        supportTickets,
        metrics,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to fetch report data');
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  const createSchedule = async (payload: Partial<WeeklyReportSchedule>) => {
    if (!companyId) return { data: null, error: new Error('No company') };
    const { data, error } = await supabase.from('weekly_report_schedule').insert({ ...payload, company_id: companyId }).select().single();
    if (!error) loadSchedules();
    return { data, error };
  };

  const updateSchedule = async (id: string, payload: Partial<WeeklyReportSchedule>) => {
    const { data, error } = await supabase.from('weekly_report_schedule').update(payload).eq('id', id).select().single();
    if (!error) loadSchedules();
    return { data, error };
  };

  const deleteSchedule = async (id: string) => {
    const { error } = await supabase.from('weekly_report_schedule').delete().eq('id', id);
    if (!error) loadSchedules();
    return { error };
  };

  const logEmail = async (payload: Partial<ReportEmailLog>) => {
    if (!companyId) return { data: null, error: new Error('No company') };
    const { data, error } = await supabase.from('report_email_log').insert({ ...payload, company_id: companyId }).select().single();
    if (!error) loadEmailLogs();
    return { data, error };
  };

  return {
    schedules,
    emailLogs,
    templates,
    reportData,
    loading,
    error,
    fetchReportData,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    logEmail,
    loadSchedules,
    loadEmailLogs,
    loadTemplates,
  };
}