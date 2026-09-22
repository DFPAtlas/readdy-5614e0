'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { format, subDays, subWeeks, startOfWeek, endOfWeek, parseISO } from 'date-fns';
import GlassCard from '@/app/components/GlassCard';
import { useSites } from '@/lib/useSites';
import SummaryCards from './SummaryCards';
import ReportPreview from './ReportPreview';
import LoadingState from './LoadingState';

export interface ReportSection {
  id: string;
  label: string;
  icon: string;
  enabled: boolean;
}

export interface ReportBuilderProps {
  onPreview: () => void;
  onExportPDF: () => void;
  onExportCSV: () => void;
  onEmailReport: () => void;
}

export default function ReportBuilder({ onPreview, onExportPDF, onExportCSV, onEmailReport }: ReportBuilderProps) {
  const { companyId } = useAuth();
  const { sites } = useSites();
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedSite, setSelectedSite] = useState('');
  const [dateFrom, setDateFrom] = useState(format(subWeeks(new Date(), 1), 'yyyy-MM-dd'));
  const [dateTo, setDateTo] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [reportName, setReportName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [sections, setSections] = useState<ReportSection[]>([
    { id: 'site_summary', label: 'Site Summary', icon: 'ri-building-line', enabled: true },
    { id: 'guard_attendance', label: 'Guard Attendance', icon: 'ri-user-follow-line', enabled: true },
    { id: 'patrol_completion', label: 'Patrol Completion', icon: 'ri-route-line', enabled: true },
    { id: 'missed_patrols', label: 'Missed Patrols', icon: 'ri-close-circle-line', enabled: true },
    { id: 'incidents', label: 'Incidents', icon: 'ri-alarm-warning-line', enabled: true },
    { id: 'dob_summary', label: 'DOB Summary', icon: 'ri-book-line', enabled: true },
    { id: 'welfare_summary', label: 'Welfare & Check Calls', icon: 'ri-heart-pulse-line', enabled: true },
    { id: 'evidence_summary', label: 'Photos & Evidence', icon: 'ri-folder-shield-line', enabled: true },
    { id: 'support_tickets', label: 'Support Tickets', icon: 'ri-customer-service-2-line', enabled: true },
    { id: 'ai_recommendations', label: 'AI Recommendations', icon: 'ri-sparkling-line', enabled: true },
  ]);

  useEffect(() => {
    if (!companyId) return;
    supabase.from('clients').select('id, name').eq('company_id', companyId).order('name').then(({ data }) => {
      setClients(data || []);
    });
  }, [companyId]);

  useEffect(() => {
    const today = new Date();
    const start = startOfWeek(subWeeks(today, 1), { weekStartsOn: 1 });
    const end = endOfWeek(subWeeks(today, 1), { weekStartsOn: 1 });
    setDateFrom(format(start, 'yyyy-MM-dd'));
    setDateTo(format(end, 'yyyy-MM-dd'));
  }, []);

  useEffect(() => {
    const client = clients.find((c) => c.id === selectedClient);
    const site = sites.find((s) => s.id === selectedSite);
    const name = `Weekly Report — ${client?.name || 'All Clients'}${site ? ` — ${site.site_name}` : ''}`;
    setReportName(name);
  }, [selectedClient, selectedSite, clients, sites]);

  const toggleSection = (id: string) => {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)));
  };

  const fetchPreviewData = useCallback(async () => {
    if (!companyId) return;
    setPreviewLoading(true);
    const fromISO = new Date(dateFrom).toISOString();
    const toISO = new Date(dateTo + 'T23:59:59').toISOString();

    const siteQuery = selectedSite
      ? supabase.from('sites').select('site_name, address, risk_level, client_id').eq('id', selectedSite).maybeSingle()
      : { data: null, error: null };

    const clientQuery = selectedClient
      ? supabase.from('clients').select('name, contact_email, contact_person').eq('id', selectedClient).maybeSingle()
      : { data: null, error: null };

    let shiftsQuery = supabase.from('shifts').select('id, guard_id, start_time, end_time, status, site_id, shift_type').eq('company_id', companyId).gte('start_time', fromISO).lte('start_time', toISO);
    if (selectedSite) shiftsQuery = shiftsQuery.eq('site_id', selectedSite);

    const attendanceQuery = supabase.from('attendance_logs').select('id, guard_id, clock_in, clock_out, shift_id').eq('company_id', companyId).gte('clock_in', fromISO).lte('clock_in', toISO);

    let patrolQuery = supabase.from('patrol_logs').select('id, site_id, status, start_time, end_time, checkpoints_total, checkpoints_completed').eq('company_id', companyId).gte('start_time', fromISO).lte('start_time', toISO);
    if (selectedSite) patrolQuery = patrolQuery.eq('site_id', selectedSite);

    let incidentsQuery = supabase.from('incidents').select('id, title, status, severity, occurred_at, resolved_at, site_id').eq('company_id', companyId).gte('occurred_at', fromISO).lte('occurred_at', toISO);
    if (selectedSite) incidentsQuery = incidentsQuery.eq('site_id', selectedSite);

    let obQuery = supabase.from('occurrence_books').select('id, site_id, entry_type, entry, title, occurred_at, created_at, client_visible').eq('company_id', companyId).eq('client_visible', true).gte('created_at', fromISO).lte('created_at', toISO);
    if (selectedSite) obQuery = obQuery.eq('site_id', selectedSite);

    let welfareQuery = supabase.from('lone_worker_checkins').select('id, guard_id, checked_in_at, method, note, lat, lng').eq('company_id', companyId).gte('checked_in_at', fromISO).lte('checked_in_at', toISO);

    let evidenceQuery = supabase.from('evidence_files').select('id, file_name, file_type, created_at, site_id, uploaded_by, uploader_name').eq('company_id', companyId).gte('created_at', fromISO).lte('created_at', toISO);
    if (selectedSite) evidenceQuery = evidenceQuery.eq('site_id', selectedSite);

    let ticketsQuery = supabase.from('support_tickets').select('id, subject, status, priority, created_at, affected_site_id, closed_at').eq('company_id', companyId).gte('created_at', fromISO).lte('created_at', toISO);
    if (selectedSite) ticketsQuery = ticketsQuery.eq('affected_site_id', selectedSite);

    const [
      { data: siteData },
      { data: clientData },
      { data: shifts },
      { data: attendance },
      { data: patrolLogs },
      { data: incidents },
      { data: occurrenceBooks },
      { data: welfareCheckins },
      { data: evidenceFiles },
      { data: supportTickets },
    ] = await Promise.all([
      siteQuery,
      clientQuery,
      shiftsQuery,
      attendanceQuery,
      patrolQuery,
      incidentsQuery,
      obQuery,
      welfareQuery,
      evidenceQuery,
      ticketsQuery,
    ]);

    const siteShiftIds = new Set((shifts || []).map((s: any) => s.id));
    const scopedAttendance = selectedSite ? (attendance || []).filter((a: any) => siteShiftIds.has(a.shift_id)) : (attendance || []);
    const scopedIncidents = (incidents || []).map((i: any) => ({ ...i, name: i.title }));

    const completedPatrols = patrolLogs?.filter((p: any) => p.status === 'completed').length || 0;
    const totalPatrols = patrolLogs?.length || 1;
    const patrolCompletionRate = totalPatrols > 0 ? Math.round((completedPatrols / totalPatrols) * 100) : 0;
    const missedPatrols = patrolLogs?.filter((p: any) => p.status === 'missed').length || 0;
    const lateStarts = 0;
    const attendanceRate = scopedAttendance.length > 0
      ? Math.round((scopedAttendance.filter((a: any) => a.clock_in && a.clock_out).length / scopedAttendance.length) * 100)
      : 0;
    const openIncidents = scopedIncidents.filter((i: any) => i.status === 'open').length;
    const closedIncidents = scopedIncidents.filter((i: any) => i.status === 'resolved' || i.status === 'closed').length;
    const missedWelfare = 0;
    const openTickets = supportTickets?.filter((t: any) => t.status === 'open').length || 0;

    const enabledSectionIds = sections.filter((s) => s.enabled).map((s) => s.id);

    setPreviewData({
      site: siteData,
      client: clientData,
      reportName,
      dateFrom,
      dateTo,
      generatedAt: new Date().toISOString(),
      shifts: enabledSectionIds.includes('guard_attendance') ? shifts || [] : [],
      attendance: enabledSectionIds.includes('guard_attendance') ? scopedAttendance : [],
      patrolLogs: enabledSectionIds.includes('patrol_completion') || enabledSectionIds.includes('missed_patrols') ? patrolLogs || [] : [],
      incidents: enabledSectionIds.includes('incidents') ? scopedIncidents : [],
      occurrenceBooks: enabledSectionIds.includes('dob_summary') ? occurrenceBooks || [] : [],
      welfareCheckins: enabledSectionIds.includes('welfare_summary') ? welfareCheckins || [] : [],
      evidenceFiles: enabledSectionIds.includes('evidence_summary') ? evidenceFiles || [] : [],
      supportTickets: enabledSectionIds.includes('support_tickets') ? supportTickets || [] : [],
      metrics: {
        totalShifts: shifts?.length || 0,
        totalPatrols: totalPatrols,
        patrolCompletionRate,
        incidentsOpened: scopedIncidents.length,
        incidentsClosed: closedIncidents,
        lateStarts,
        openIssues: openIncidents + openTickets,
        guardAttendanceRate: attendanceRate,
        missedPatrols,
        welfareCheckCalls: welfareCheckins?.length || 0,
        missedWelfareChecks: missedWelfare,
        evidenceFiles: evidenceFiles?.length || 0,
        openTickets,
      },
      enabledSections: enabledSectionIds,
    });
    setPreviewLoading(false);
    setShowPreview(true);
    onPreview();
  }, [companyId, selectedClient, selectedSite, dateFrom, dateTo, reportName, sections, onPreview]);

  const handleExportPDF = () => {
    setToast('PDF export coming soon — uses existing generate-weekly-site-report edge function');
    setTimeout(() => setToast(null), 3000);
    onExportPDF();
  };

  const handleExportCSV = () => {
    if (!previewData) {
      setToast('Please preview the report first');
      setTimeout(() => setToast(null), 3000);
      return;
    }
    const rows: string[] = [];
    rows.push('GuardianHub Weekly Client Report');
    rows.push(`Report: ${previewData.reportName}`);
    rows.push(`Period: ${previewData.dateFrom} to ${previewData.dateTo}`);
    rows.push('');
    rows.push('Metric,Value');
    rows.push(`Total Shifts,${previewData.metrics.totalShifts}`);
    rows.push(`Total Patrols,${previewData.metrics.totalPatrols}`);
    rows.push(`Patrol Completion Rate,${previewData.metrics.patrolCompletionRate}%`);
    rows.push(`Incidents Opened,${previewData.metrics.incidentsOpened}`);
    rows.push(`Incidents Closed,${previewData.metrics.incidentsClosed}`);
    rows.push(`Late Starts,${previewData.metrics.lateStarts}`);
    rows.push(`Open Issues,${previewData.metrics.openIssues}`);
    rows.push(`Guard Attendance Rate,${previewData.metrics.guardAttendanceRate}%`);
    rows.push(`Missed Patrols,${previewData.metrics.missedPatrols}`);
    rows.push(`Welfare Check Calls,${previewData.metrics.welfareCheckCalls}`);
    rows.push(`Evidence Files,${previewData.metrics.evidenceFiles}`);
    rows.push(`Open Tickets,${previewData.metrics.openTickets}`);
    rows.push('');
    if (previewData.incidents?.length) {
      rows.push('Incidents,ID,Status,Severity,Created');
      previewData.incidents.forEach((i: any) => {
        rows.push(`${i.name || 'Untitled'},${i.id},${i.status},${i.severity},${i.occurred_at}`);
      });
    }
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${previewData.reportName.replace(/\s+/g, '_')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setToast('CSV exported successfully');
    setTimeout(() => setToast(null), 3000);
    onExportCSV();
  };

  const handleEmail = () => {
    if (!previewData) {
      setToast('Please preview the report first');
      setTimeout(() => setToast(null), 3000);
      return;
    }
    const recipient = previewData.client?.contact_email || '';
    if (!recipient) {
      setToast('No client contact email found');
      setTimeout(() => setToast(null), 3000);
      return;
    }
    const subject = encodeURIComponent(previewData.reportName);
    const body = encodeURIComponent(`Please find attached the weekly report for ${previewData.dateFrom} to ${previewData.dateTo}.\n\nGenerated by GuardianHub.`);
    window.open(`mailto:${recipient}?subject=${subject}&body=${body}`);
    setToast('Email client opened');
    setTimeout(() => setToast(null), 3000);
    onEmailReport();
  };

  const activeSections = sections.filter((s) => s.enabled).length;
  const filteredSites = selectedClient
    ? sites.filter((s) => s.client_id === selectedClient)
    : sites;

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 border border-gray-700 text-white text-sm px-4 py-3 rounded-lg shadow-xl flex items-center gap-2">
          <div className="w-4 h-4 flex items-center justify-center text-emerald-400">
            <i className="ri-check-line"></i>
          </div>
          {toast}
          <button onClick={() => setToast(null)} className="ml-2 text-gray-400 hover:text-white cursor-pointer">
            <i className="ri-close-line"></i>
          </button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Weekly Client Report</h1>
          <p className="text-sm text-gray-400 mt-1">Build and export professional client reports</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchPreviewData}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors cursor-pointer whitespace-nowrap"
          >
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-eye-line"></i></div>
            Preview Report
          </button>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap"
          >
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-file-excel-line"></i></div>
            CSV
          </button>
          <button
            onClick={handleExportPDF}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap"
          >
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-file-pdf-line"></i></div>
            PDF
          </button>
          <button
            onClick={handleEmail}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap"
          >
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-mail-send-line"></i></div>
            Email
          </button>
        </div>
      </div>

      {/* Report Config */}
      <div className="grid lg:grid-cols-3 gap-4">
        <GlassCard className="lg:col-span-2 p-5">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Report Name</label>
              <input
                type="text"
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
                className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Client</label>
                <div className="relative">
                  <div className="w-4 h-4 flex items-center justify-center absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    <i className="ri-briefcase-line text-xs"></i>
                  </div>
                  <select
                    value={selectedClient}
                    onChange={(e) => { setSelectedClient(e.target.value); setSelectedSite(''); }}
                    className="w-full bg-gray-800/60 border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="">All Clients</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Site</label>
                <div className="relative">
                  <div className="w-4 h-4 flex items-center justify-center absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    <i className="ri-building-line text-xs"></i>
                  </div>
                  <select
                    value={selectedSite}
                    onChange={(e) => setSelectedSite(e.target.value)}
                    className="w-full bg-gray-800/60 border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="">All Sites</option>
                    {filteredSites.map((s) => (
                      <option key={s.id} value={s.id}>{s.site_name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Date From</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Date To</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white">Report Sections</h3>
            <span className="text-xs text-gray-500">{activeSections} / {sections.length} selected</span>
          </div>
          <div className="space-y-1.5 max-h-72 overflow-y-auto">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => toggleSection(section.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all cursor-pointer text-left ${
                  section.enabled
                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    : 'bg-gray-800/30 text-gray-500 border border-transparent hover:bg-gray-800/50'
                }`}
              >
                <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                  <i className={section.icon}></i>
                </div>
                <span className="flex-1">{section.label}</span>
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className={section.enabled ? 'ri-checkbox-circle-fill text-blue-400' : 'ri-checkbox-blank-circle-line text-gray-600'}></i>
                </div>
              </button>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Preview */}
      {showPreview && (
        <div className="space-y-4">
          {previewLoading ? (
            <LoadingState />
          ) : previewData ? (
            <>
              <SummaryCards metrics={previewData.metrics} />
              <ReportPreview data={previewData} />
            </>
          ) : (
            <div className="text-center py-12 border border-dashed border-gray-800 rounded-xl">
              <p className="text-sm text-gray-500">No preview data available</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}