'use client';

import { format, parseISO } from 'date-fns';

interface ReportPreviewProps {
  data: {
    reportName: string;
    dateFrom: string;
    dateTo: string;
    generatedAt: string;
    site: { site_name: string; address: string | null; risk_level: string | null } | null;
    client: { name: string | null; contact_email: string | null } | null;
    enabledSections: string[];
    shifts: any[];
    attendance: any[];
    patrolLogs: any[];
    incidents: any[];
    occurrenceBooks: any[];
    welfareCheckins: any[];
    evidenceFiles: any[];
    supportTickets: any[];
    metrics: any;
  };
}

function Section({ title, icon, enabled, children }: { title: string; icon: string; enabled: boolean; children: React.ReactNode }) {
  if (!enabled) return null;
  return (
    <div className="bg-[#111827]/60 border border-gray-800 rounded-xl p-5 mb-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-4 h-4 flex items-center justify-center text-blue-400">
          <i className={icon}></i>
        </div>
        <h3 className="text-sm font-semibold text-white">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-6 border border-dashed border-gray-800 rounded-lg">
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  );
}

export default function ReportPreview({ data }: ReportPreviewProps) {
  const { enabledSections } = data;

  const isEnabled = (id: string) => enabledSections.includes(id);

  return (
    <div className="space-y-4">
      {/* Report Header */}
      <div className="bg-white rounded-xl p-8 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
              <div className="w-5 h-5 flex items-center justify-center text-white">
                <i className="ri-shield-check-line text-lg"></i>
              </div>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">GuardianHub</p>
              <p className="text-xs text-gray-500">Weekly Client Report</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Generated</p>
            <p className="text-sm text-gray-900">{format(new Date(data.generatedAt), 'd MMM yyyy, HH:mm')}</p>
          </div>
        </div>
        <div className="border-t border-gray-200 pt-4">
          <h2 className="text-xl font-bold text-gray-900 mb-1">{data.reportName}</h2>
          <p className="text-sm text-gray-500">{data.client?.name || 'All Clients'} {data.site?.site_name ? `— ${data.site.site_name}` : ''}</p>
          <p className="text-sm text-gray-500 mt-1">Period: {data.dateFrom} to {data.dateTo}</p>
          {data.site?.address && <p className="text-sm text-gray-500">{data.site.address}</p>}
        </div>
      </div>

      {/* Site Summary */}
      <Section title="Site Summary" icon="ri-building-line" enabled={isEnabled('site_summary')}>
        {data.site ? (
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-1">Site Name</p>
              <p className="text-sm font-medium text-gray-900">{data.site.site_name}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-1">Risk Level</p>
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                data.site.risk_level === 'High' ? 'bg-red-100 text-red-800' :
                data.site.risk_level === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-emerald-100 text-emerald-800'
              }`}>
                {data.site.risk_level || 'Low'}
              </span>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-1">Client</p>
              <p className="text-sm font-medium text-gray-900">{data.client?.name || '—'}</p>
            </div>
          </div>
        ) : (
          <EmptyState message="No site selected — choose a site or client to see summary" />
        )}
      </Section>

      {/* Guard Attendance */}
      <Section title="Guard Attendance" icon="ri-user-follow-line" enabled={isEnabled('guard_attendance')}>
        {data.attendance.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-3 py-2">Guard ID</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-3 py-2">Clock In</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-3 py-2">Clock Out</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.attendance.slice(0, 10).map((a: any) => (
                  <tr key={a.id}>
                    <td className="px-3 py-2 text-sm text-gray-900">{a.guard_id?.slice(0, 8)}...</td>
                    <td className="px-3 py-2 text-sm text-gray-500">
                      {a.clock_in ? format(parseISO(a.clock_in), 'd MMM HH:mm') : '—'}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-500">
                      {a.clock_out ? format(parseISO(a.clock_out), 'd MMM HH:mm') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.attendance.length > 10 && (
              <p className="text-xs text-gray-500 mt-2">+ {data.attendance.length - 10} more entries</p>
            )}
          </div>
        ) : (
          <EmptyState message="No attendance records for this period" />
        )}
      </Section>

      {/* Patrol Completion */}
      <Section title="Patrol Completion" icon="ri-route-line" enabled={isEnabled('patrol_completion')}>
        {data.patrolLogs.length > 0 ? (
          <div>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-emerald-50 rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-emerald-700">
                  {data.patrolLogs.filter((p: any) => p.status === 'completed').length}
                </p>
                <p className="text-xs text-emerald-600">Completed</p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-yellow-700">
                  {data.patrolLogs.filter((p: any) => p.status === 'pending').length}
                </p>
                <p className="text-xs text-yellow-600">Pending</p>
              </div>
              <div className="bg-red-50 rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-red-700">
                  {data.patrolLogs.filter((p: any) => p.status === 'missed').length}
                </p>
                <p className="text-xs text-red-600">Missed</p>
              </div>
            </div>
            <div className="space-y-2">
              {data.patrolLogs.slice(0, 5).map((p: any) => (
                <div key={p.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      p.status === 'completed' ? 'bg-emerald-500' :
                      p.status === 'missed' ? 'bg-red-500' : 'bg-yellow-500'
                    }`}></div>
                    <span className="text-sm text-gray-900">Patrol {p.id?.slice(0, 8)}</span>
                  </div>
                  <span className={`text-xs font-medium ${
                    p.status === 'completed' ? 'text-emerald-600' :
                    p.status === 'missed' ? 'text-red-600' : 'text-yellow-600'
                  }`}>
                    {p.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <EmptyState message="No patrol records for this period" />
        )}
      </Section>

      {/* Missed Patrols */}
      <Section title="Missed Patrols" icon="ri-close-circle-line" enabled={isEnabled('missed_patrols')}>
        {data.patrolLogs.filter((p: any) => p.status === 'missed').length > 0 ? (
          <div className="space-y-2">
            {data.patrolLogs.filter((p: any) => p.status === 'missed').map((p: any) => (
              <div key={p.id} className="flex items-center gap-3 bg-red-50 rounded-lg p-3 border border-red-100">
                <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                  <div className="w-4 h-4 flex items-center justify-center text-red-600">
                    <i className="ri-close-line"></i>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-red-800">Patrol missed</p>
                  <p className="text-xs text-red-600">
                    {p.start_time ? format(parseISO(p.start_time), 'd MMM yyyy, HH:mm') : '—'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState message="No missed patrols this period — great work!" />
        )}
      </Section>

      {/* Incidents */}
      <Section title="Incidents" icon="ri-alarm-warning-line" enabled={isEnabled('incidents')}>
        {data.incidents.length > 0 ? (
          <div className="space-y-3">
            {data.incidents.slice(0, 8).map((i: any) => (
              <div key={i.id} className="flex items-start gap-3 bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  i.severity === 'high' ? 'bg-red-100' :
                  i.severity === 'medium' ? 'bg-orange-100' : 'bg-yellow-100'
                }`}>
                  <div className={`w-4 h-4 flex items-center justify-center ${
                    i.severity === 'high' ? 'text-red-600' :
                    i.severity === 'medium' ? 'text-orange-600' : 'text-yellow-600'
                  }`}>
                    <i className="ri-error-warning-line"></i>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{i.name || 'Untitled Incident'}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      i.status === 'open' ? 'bg-red-100 text-red-800' :
                      i.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {i.status}
                    </span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      i.severity === 'high' ? 'bg-red-100 text-red-800' :
                      i.severity === 'medium' ? 'bg-orange-100 text-orange-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {i.severity}
                    </span>
                    <span className="text-xs text-gray-500">
                      {i.occurred_at ? format(parseISO(i.occurred_at), 'd MMM') : '—'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {data.incidents.length > 8 && (
              <p className="text-xs text-gray-500">+ {data.incidents.length - 8} more incidents</p>
            )}
          </div>
        ) : (
          <EmptyState message="No incidents reported this period" />
        )}
      </Section>

      {/* DOB Summary */}
      <Section title="Daily Occurrence Book Summary" icon="ri-book-line" enabled={isEnabled('dob_summary')}>
        {data.occurrenceBooks.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-3 py-2">Entry</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-3 py-2">Type</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-3 py-2">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.occurrenceBooks.slice(0, 8).map((entry: any) => (
                  <tr key={entry.id}>
                    <td className="px-3 py-2 text-sm text-gray-900">{entry.entry?.slice(0, 60) || '—'}...</td>
                    <td className="px-3 py-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                        {entry.entry_type || 'General'}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-500">
                      {entry.occurred_at ? format(parseISO(entry.occurred_at), 'd MMM') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.occurrenceBooks.length > 8 && (
              <p className="text-xs text-gray-500 mt-2">+ {data.occurrenceBooks.length - 8} more entries</p>
            )}
          </div>
        ) : (
          <EmptyState message="No occurrence book entries for this period" />
        )}
      </Section>

      {/* Welfare */}
      <Section title="Welfare & Check Calls" icon="ri-heart-pulse-line" enabled={isEnabled('welfare_summary')}>
        {data.welfareCheckins.length > 0 ? (
          <div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-emerald-50 rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-emerald-700">
                  {data.welfareCheckins.length}
                </p>
                <p className="text-xs text-emerald-600">Check-ins</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-blue-700">
                  {data.welfareCheckins.filter((w: any) => w.method === 'manual').length}
                </p>
                <p className="text-xs text-blue-600">Manual</p>
              </div>
            </div>
            <div className="space-y-2">
              {data.welfareCheckins.slice(0, 5).map((w: any) => (
                <div key={w.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span className="text-sm text-gray-900">Check-in {w.id?.slice(0, 8)}</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {w.checked_in_at ? format(parseISO(w.checked_in_at), 'd MMM HH:mm') : '—'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <EmptyState message="No welfare check records for this period" />
        )}
      </Section>

      {/* Evidence */}
      <Section title="Photos & Evidence" icon="ri-folder-shield-line" enabled={isEnabled('evidence_summary')}>
        {data.evidenceFiles.length > 0 ? (
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mb-4">
              {data.evidenceFiles.slice(0, 12).map((e: any) => (
                <div key={e.id} className="bg-gray-50 rounded-lg p-3 text-center border border-gray-200">
                  <div className="w-8 h-8 mx-auto flex items-center justify-center text-gray-400 mb-2">
                    <i className={e.file_type?.startsWith('image') ? 'ri-image-line' : 'ri-file-line'}></i>
                  </div>
                  <p className="text-xs text-gray-700 truncate">{e.file_name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {e.created_at ? format(parseISO(e.created_at), 'd MMM') : '—'}
                  </p>
                </div>
              ))}
            </div>
            {data.evidenceFiles.length > 12 && (
              <p className="text-xs text-gray-500">+ {data.evidenceFiles.length - 12} more files</p>
            )}
          </div>
        ) : (
          <EmptyState message="No evidence files uploaded this period" />
        )}
      </Section>

      {/* Support Tickets */}
      <Section title="Support Tickets" icon="ri-customer-service-2-line" enabled={isEnabled('support_tickets')}>
        {data.supportTickets.length > 0 ? (
          <div className="space-y-2">
            {data.supportTickets.slice(0, 6).map((t: any) => (
              <div key={t.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 flex items-center justify-center text-gray-400">
                    <i className="ri-ticket-line"></i>
                  </div>
                  <span className="text-sm text-gray-900">{t.subject || 'Untitled'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    t.status === 'open' ? 'bg-red-100 text-red-800' :
                    t.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {t.status}
                  </span>
                  <span className="text-xs text-gray-500">
                    {t.created_at ? format(parseISO(t.created_at), 'd MMM') : '—'}
                  </span>
                </div>
              </div>
            ))}
            {data.supportTickets.length > 6 && (
              <p className="text-xs text-gray-500">+ {data.supportTickets.length - 6} more tickets</p>
            )}
          </div>
        ) : (
          <EmptyState message="No support tickets for this period" />
        )}
      </Section>

      {/* AI Recommendations */}
      <Section title="AI Recommendations" icon="ri-sparkling-line" enabled={isEnabled('ai_recommendations')}>
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-4 h-4 flex items-center justify-center text-blue-600">
              <i className="ri-robot-2-line"></i>
            </div>
            <p className="text-sm font-medium text-blue-800">GuardianHub AI Insights</p>
          </div>
          <ul className="space-y-2">
            <li className="text-sm text-blue-700 flex items-start gap-2">
              <div className="w-4 h-4 flex items-center justify-center flex-shrink-0 mt-0.5"><i className="ri-lightbulb-line text-blue-500"></i></div>
              {data.metrics.patrolCompletionRate < 90
                ? `Patrol completion at ${data.metrics.patrolCompletionRate}% — consider reviewing patrol routes or guard scheduling.`
                : `Patrol completion at ${data.metrics.patrolCompletionRate}% — excellent performance. Sustaining this standard is recommended.`}
            </li>
            <li className="text-sm text-blue-700 flex items-start gap-2">
              <div className="w-4 h-4 flex items-center justify-center flex-shrink-0 mt-0.5"><i className="ri-lightbulb-line text-blue-500"></i></div>
              {data.metrics.lateStarts > 0
                ? `${data.metrics.lateStarts} late starts detected — review clock-in procedures and travel time allowances.`
                : `No late starts recorded — guard punctuality is on target.`}
            </li>
            <li className="text-sm text-blue-700 flex items-start gap-2">
              <div className="w-4 h-4 flex items-center justify-center flex-shrink-0 mt-0.5"><i className="ri-lightbulb-line text-blue-500"></i></div>
              {data.metrics.openIssues > 0
                ? `${data.metrics.openIssues} open issues remain — prioritise closure to maintain SLA compliance.`
                : `All issues closed — zero outstanding items this week.`}
            </li>
            {data.metrics.missedWelfareChecks > 0 && (
              <li className="text-sm text-blue-700 flex items-start gap-2">
                <div className="w-4 h-4 flex items-center justify-center flex-shrink-0 mt-0.5"><i className="ri-lightbulb-line text-blue-500"></i></div>
                {data.metrics.missedWelfareChecks} missed welfare check — review lone worker protocols and escalation procedures.
              </li>
            )}
          </ul>
        </div>
      </Section>

      {/* Footer */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
        <p className="text-xs text-gray-500">Report generated by GuardianHub on {format(new Date(), 'd MMM yyyy')}.</p>
        <p className="text-xs text-gray-400 mt-0.5">For questions about this report, contact your account manager.</p>
      </div>
    </div>
  );
}