'use client';

import { useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

interface SignupChartProps {
  companies: { created_at: string }[];
}

export default function SignupChart({ companies }: SignupChartProps) {
  const data = useMemo(() => {
    const days = 14;
    const result = [];
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
      const count = companies.filter((c) => {
        const cd = new Date(c.created_at);
        return cd.toDateString() === d.toDateString();
      }).length;
      result.push({ label, count });
    }
    return result;
  }, [companies]);

  return (
    <div className="w-full h-48">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="signupFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
          <XAxis dataKey="label" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip
            contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', fontSize: '12px', color: '#fff' }}
            itemStyle={{ color: '#6366f1' }}
          />
          <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} fill="url(#signupFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}