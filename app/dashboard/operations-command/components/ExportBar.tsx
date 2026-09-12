'use client';

import { useState } from 'react';
import type { OpsSummary, WelfareAlert, PatrolStatus, SubscriptionInfo, AIInsight } from '@/lib/useOperationsCommand';

interface ExportBarProps {
  summary: OpsSummary;
  welfareAlerts: WelfareAlert[];
  patrolStatuses: PatrolStatus[];
  subscriptions: SubscriptionInfo[];
  aiInsights: AIInsight[];
}

export default function ExportBar({
  summary,
  welfareAlerts,
  patrolStatuses,
  subscriptions,
  aiInsights,
}: ExportBarProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [exporting, setExporting] = useState(false);

  const buildCSV = () => {
    const rows: string[] = [];

    rows.push('GUARDIANHUB OPERATIONS COMMAND CENTRE EXPORT');
    rows.push(`Generated: ${new Date().toISOString()}`);
    rows.push('');

    rows.push('SUMMARY');
    rows.push('Metric,Value');
    rows.push(`Active Guards,${summary.activeGuards}`);
    rows.push(`Sites Covered,${summary.sitesCovered}/${summary.totalSites}`);
    rows.push(`Open Incidents,${summary.openIncidents}`);
    rows.push(`Critical Incidents,${summary.criticalIncidents}`);
    rows.push(`Welfare Alerts,${summary.welfareAlerts}`);
    rows.push(`Missed Check Calls,${summary.missedCheckCalls}`);
    rows.push(`Patrol Compliance,${summary.patrolCompletion}%`);
    rows.push(`GPS Tracked,${summary.gpsTrackedGuards}`);
    rows.push(`GPS Offline,${summary.gpsOfflineGuards}`);
    rows.push(`Unread Notifications,${summary.unreadNotifications}`);
    rows.push(`Active Subscriptions,${summary.activeSubscriptions}`);
    rows.push(`Trialing Subscriptions,${summary.trialingSubscriptions}`);
    rows.push(`At Risk Subscriptions,${summary.atRiskSubscriptions}`);
    rows.push(`Monthly Revenue (GBP),${(summary.monthlyRevenuePence / 100).toFixed(2)}`);
    rows.push('');

    if (welfareAlerts.length > 0) {
      rows.push('WELFARE ALERTS');
      rows.push('Guard,Site,Company,Type,Severity,Description,Time');
      welfareAlerts.forEach((a) => {
        rows.push(`"${a.guardName}","${a.siteName}","${a.companyName}","${a.type}","${a.severity}","${a.description}","${a.timestamp}"`);
      });
      rows.push('');
    }

    if (patrolStatuses.length > 0) {
      rows.push('PATROL STATUS');
      rows.push('Site,Company,Completed,Total,Percentage,Status,Last Patrol');
      patrolStatuses.forEach((p) => {
        rows.push(`"${p.siteName}","${p.companyName}",${p.completed},${p.total},${p.percentage}%,"${p.status}","${p.lastPatrolAt || 'N/A'}"`);
      });
      rows.push('');
    }

    if (aiInsights.length > 0) {
      rows.push('AI INSIGHTS');
      rows.push('Category,Title,Description,Severity,Site,Company');
      aiInsights.forEach((i) => {
        rows.push(`"${i.category}","${i.title}","${i.description}","${i.severity}","${i.siteName || ''}","${i.companyName || ''}"`);
      });
      rows.push('');
    }

    if (subscriptions.length > 0) {
      rows.push('SUBSCRIPTIONS');
      rows.push('Company,Plan,Status,Trial Ends,Period End');
      subscriptions.forEach((s) => {
        rows.push(`"${s.companyName}","${s.planName}","${s.status}","${s.trialEndsAt || 'N/A'}","${s.periodEnd || 'N/A'}"`);
      });
    }

    return rows.join('\n');
  };

  const handleExportCSV = () => {
    setExporting(true);
    setShowMenu(false);
    try {
      const csv = buildCSV();
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `guardianhub-ops-command-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  const handleExportPDF = () => {
    setExporting(true);
    setShowMenu(false);
    const csv = buildCSV();
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      setExporting(false);
      return;
    }

    const lines = csv.split('\n');
    let htmlContent = `
      <html>
      <head><title>GuardianHub Operations Command Export</title>
      <style>
        body { font-family: 'Courier New', monospace; font-size: 12px; padding: 20px; color: #000; }
        h1 { font-size: 16px; margin-bottom: 4px; }
        .sub { font-size: 10px; color: #666; margin-bottom: 16px; }
        table { border-collapse: collapse; width: 100%; margin-bottom: 16px; }
        th, td { border: 1px solid #ccc; padding: 4px 8px; text-align: left; font-size: 10px; }
        th { background: #f0f0f0; font-weight: bold; }
        h2 { font-size: 14px; margin-top: 16px; margin-bottom: 4px; border-bottom: 2px solid #ccc; padding-bottom: 4px; }
      </style></head>
      <body>
      <h1>GuardianHub Operations Command Centre</h1>
      <p class="sub">Generated: ${new Date().toISOString()}</p>
    `;

    let sectionTitle = '';
    let isHeader = true;
    let tableHtml = '';

    lines.forEach((line) => {
      if (!line.trim()) {
        if (tableHtml) {
          htmlContent += tableHtml + '</table>';
          tableHtml = '';
        }
        isHeader = true;
        return;
      }

      if (isHeader && line === line.toUpperCase() && line.length < 50) {
        sectionTitle = line;
        htmlContent += `<h2>${sectionTitle}</h2>`;
        isHeader = false;
        return;
      }

      const cells = line.split(',').map((c) => c.replace(/^"|"$/g, ''));
      if (!tableHtml) {
        tableHtml = '<table><tr>' + cells.map((c) => `<th>${c}</th>`).join('') + '</tr>';
        isHeader = false;
      } else {
        tableHtml += '<tr>' + cells.map((c) => `<td>${c}</td>`).join('') + '</tr>';
      }
    });

    if (tableHtml) {
      htmlContent += tableHtml + '</table>';
    }

    htmlContent += '</body></html>';

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
      setExporting(false);
    }, 500);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        disabled={exporting}
        className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-gray-400 hover:text-white transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2"
      >
        <div className="w-4 h-4 flex items-center justify-center">
          <i className="ri-download-line"></i>
        </div>
        <span className="hidden sm:inline">{exporting ? 'Exporting...' : 'Export'}</span>
      </button>

      {showMenu && (
        <div className="absolute right-0 mt-2 w-44 bg-[#0f172a] rounded-lg shadow-lg border border-white/10 z-50 overflow-hidden">
          <button
            onClick={handleExportCSV}
            className="w-full px-4 py-2.5 text-sm text-left text-gray-300 hover:bg-white/5 hover:text-white transition-colors cursor-pointer flex items-center gap-2"
          >
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-file-excel-2-line text-emerald-400"></i>
            </div>
            Export CSV
          </button>
          <button
            onClick={handleExportPDF}
            className="w-full px-4 py-2.5 text-sm text-left text-gray-300 hover:bg-white/5 hover:text-white transition-colors cursor-pointer flex items-center gap-2"
          >
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-file-pdf-2-line text-red-400"></i>
            </div>
            Export PDF
          </button>
        </div>
      )}
    </div>
  );
}