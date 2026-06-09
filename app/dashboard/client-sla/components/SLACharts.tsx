'use client';

import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  Cell,
} from 'recharts';
import type { PatrolSLAData, IncidentSLAData, AttendanceSLAData, OBCoverageData } from '@/lib/useClientSLA';

interface SLAChartsProps {
  patrolData: PatrolSLAData[];
  incidentData: IncidentSLAData[];
  attendanceData: AttendanceSLAData[];
  obData: OBCoverageData[];
}

export default function SLACharts({ patrolData, incidentData, attendanceData, obData }: SLAChartsProps) {
  const patrolChart = useMemo(() => {
    return patrolData.slice(0, 10).map((p) => ({
      name: p.siteName.length > 16 ? p.siteName.slice(0, 16) + '...' : p.siteName,
      completed: p.completedPatrols,
      missed: p.missedPatrols,
      rate: p.completionRate,
    }));
  }, [patrolData]);

  const incidentChart = useMemo(() => {
    const bySeverity: Record<string, number> = { low: 0, medium: 0, high: 0, critical: 0 };
    incidentData.forEach((i) => {
      const s = i.severity || 'medium';
      bySeverity[s] = (bySeverity[s] || 0) + 1;
    });
    return Object.entries(bySeverity).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));
  }, [incidentData]);

  const lateChart = useMemo(() => {
    const byMinutes: Record<string, number> = { 'On time': 0, '5-15 min': 0, '15-30 min': 0, '30+ min': 0, Missing: 0 };
    attendanceData.forEach((a) => {
      if (a.isMissing) byMinutes['Missing']++;
      else if (a.punctualityMinutes <= 5) byMinutes['On time']++;
      else if (a.punctualityMinutes <= 15) byMinutes['5-15 min']++;
      else if (a.punctualityMinutes <= 30) byMinutes['15-30 min']++;
      else byMinutes['30+ min']++;
    });
    return Object.entries(byMinutes).map(([name, value]) => ({ name, value }));
  }, [attendanceData]);

  const obChart = useMemo(() => {
    return obData.slice(-14).map((o) => ({
      name: o.date.slice(5),
      entries: o.totalEntries,
      sites: o.siteCount,
    }));
  }, [obData]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Patrol Completion by Site</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={patrolChart} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2845" />
              <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={{ stroke: '#1e2845' }} tickLine={false} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={{ stroke: '#1e2845' }} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e2845', borderRadius: '8px', fontSize: '12px' }}
                labelStyle={{ color: '#e5e7eb' }}
                itemStyle={{ color: '#e5e7eb' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', color: '#9ca3af' }} />
              <Bar dataKey="completed" name="Completed" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="missed" name="Missed" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Incident Volume by Severity</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={incidentChart} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2845" />
              <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={{ stroke: '#1e2845' }} tickLine={false} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={{ stroke: '#1e2845' }} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e2845', borderRadius: '8px', fontSize: '12px' }}
                labelStyle={{ color: '#e5e7eb' }}
                itemStyle={{ color: '#e5e7eb' }}
              />
              <Bar dataKey="value" name="Incidents" radius={[4, 4, 0, 0]}>
                {incidentChart.map((entry, index) => {
                  const colors: Record<string, string> = { Low: '#10b981', Medium: '#f59e0b', High: '#f97316', Critical: '#ef4444' };
                  return <Cell key={`cell-${index}`} fill={colors[entry.name] || '#6b7280'} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Late Clock-ins</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={lateChart} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2845" />
              <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={{ stroke: '#1e2845' }} tickLine={false} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={{ stroke: '#1e2845' }} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e2845', borderRadius: '8px', fontSize: '12px' }}
                labelStyle={{ color: '#e5e7eb' }}
                itemStyle={{ color: '#e5e7eb' }}
              />
              <Bar dataKey="value" name="Guards" radius={[4, 4, 0, 0]}>
                {lateChart.map((entry, index) => {
                  const colors: Record<string, string> = { 'On time': '#10b981', '5-15 min': '#f59e0b', '15-30 min': '#f97316', '30+ min': '#ef4444', Missing: '#6b7280' };
                  return <Cell key={`cell-${index}`} fill={colors[entry.name] || '#6b7280'} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Daily Occurrence Book Coverage</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={obChart}>
              <defs>
                <linearGradient id="colorEntries" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2845" />
              <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={{ stroke: '#1e2845' }} tickLine={false} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={{ stroke: '#1e2845' }} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e2845', borderRadius: '8px', fontSize: '12px' }}
                labelStyle={{ color: '#e5e7eb' }}
                itemStyle={{ color: '#e5e7eb' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', color: '#9ca3af' }} />
              <Area type="monotone" dataKey="entries" name="OB Entries" stroke="#6366f1" fill="url(#colorEntries)" strokeWidth={2} />
              <Area type="monotone" dataKey="sites" name="Sites Covered" stroke="#10b981" fill="none" strokeWidth={2} strokeDasharray="4 4" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}