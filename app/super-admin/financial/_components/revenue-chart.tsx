'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export function RevenueChart({ data }: { data: { month: string; gross: number }[] }) {
  if (!data.length) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500 text-sm">
        No revenue data yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fill: '#6b7280', fontSize: 12 }}
          axisLine={{ stroke: '#374151' }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: '#6b7280', fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `£${(v / 100).toFixed(0)}`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#111827',
            border: '1px solid #374151',
            borderRadius: 8,
            color: '#fff',
            fontSize: 12,
          }}
          formatter={(value: any) => [`£${(Number(value) / 100).toFixed(2)}`, 'Revenue']}
        />
        <Area
          type="monotone"
          dataKey="gross"
          stroke="#10b981"
          strokeWidth={2}
          fill="url(#revGrad)"
          dot={{ r: 3, fill: '#10b981', stroke: '#111827', strokeWidth: 2 }}
          activeDot={{ r: 5 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}