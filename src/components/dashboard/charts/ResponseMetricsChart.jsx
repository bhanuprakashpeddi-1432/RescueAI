import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { time: '00:00', eta: 18, benchmark: 15 },
  { time: '04:00', eta: 16, benchmark: 15 },
  { time: '08:00', eta: 22, benchmark: 15 },
  { time: '12:00', eta: 28, benchmark: 15 },
  { time: '16:00', eta: 25, benchmark: 15 },
  { time: '20:00', eta: 19, benchmark: 15 },
  { time: '24:00', eta: 15, benchmark: 15 },
];

export default function ResponseMetricsChart() {
  return (
    <div className="glass rounded-2xl p-5 shadow-panel tech-corners">
      <div className="mb-4">
        <h2 className="text-[12px] font-extrabold text-white font-display tracking-wider uppercase">Avg Response Time (ETA mins)</h2>
        <p className="text-[11px] text-slate-500">Live operational dispatch latency vs benchmark</p>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
            <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
              itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
            />
            <Line type="stepAfter" dataKey="benchmark" stroke="#64748b" strokeWidth={2} strokeDasharray="4 4" dot={false} name="Benchmark (15m)" />
            <Line type="monotone" dataKey="eta" stroke="#eab308" strokeWidth={3} dot={{ r: 4, fill: '#eab308', strokeWidth: 2, stroke: '#0f172a' }} name="Actual ETA" activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
