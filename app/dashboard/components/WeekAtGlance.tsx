'use client';

import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { WeekShift } from '@/lib/useDashboard';

interface WeekAtGlanceProps {
  shifts: WeekShift[];
}

function formatDayLabel(dateStr: string): string {
  const d = new Date(dateStr);
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dayIndex = (d.getDay() + 6) % 7;
  return days[dayIndex];
}

export default function WeekAtGlance({ shifts }: WeekAtGlanceProps) {
  const data = shifts.map((s) => ({
    day: formatDayLabel(s.date),
    fullDate: s.date,
    filled: s.filled,
    open: s.open,
  }));

  const totalFilled = shifts.reduce((sum, s) => sum + s.filled, 0);
  const totalOpen = shifts.reduce((sum, s) => sum + s.open, 0);

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white">This Week</h2>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-blue-500"></div>
            <span className="text-gray-500">Filled ({totalFilled})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-amber-400"></div>
            <span className="text-gray-500">Open ({totalOpen})</span>
          </div>
        </div>
      </div>

      <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 shadow-sm rounded-xl p-6">
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b7280', fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b7280', fontSize: 12 }}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  fontSize: '12px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.3)',
                  color: '#fff',
                }}
                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
              />
              <Bar dataKey="filled" stackId="a" fill="#3b82f6" radius={[0, 0, 4, 4]} />
              <Bar dataKey="open" stackId="a" fill="#fbbf24" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center mt-4 gap-2">
          {data.map((d) => (
            <Link
              key={d.fullDate}
              href={`/rotas?date=${d.fullDate}`}
              className="px-3 py-1 text-xs text-blue-400 hover:bg-blue-500/10 rounded-lg cursor-pointer"
            >
              {d.day}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}