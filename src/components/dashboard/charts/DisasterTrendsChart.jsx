import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { day: '01 May', flood: 2, fire: 1, medical: 4 },
  { day: '05 May', flood: 3, fire: 2, medical: 5 },
  { day: '10 May', flood: 1, fire: 4, medical: 3 },
  { day: '15 May', flood: 5, fire: 1, medical: 6 },
  { day: '20 May', flood: 8, fire: 2, medical: 4 },
  { day: '25 May', flood: 12, fire: 3, medical: 8 },
  { day: '30 May', flood: 15, fire: 5, medical: 10 },
];

export default function DisasterTrendsChart() {
  return (
    <div className="glass rounded-2xl p-5 shadow-panel tech-corners">
      <div className="mb-4">
        <h2 className="text-[12px] font-extrabold text-white font-display tracking-wider uppercase">Disaster Frequency Trends (30D)</h2>
        <p className="text-[11px] text-slate-500">Categorical incident volume analysis</p>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorFlood" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorFire" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorMedical" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
            <XAxis dataKey="day" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
              itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
              labelStyle={{ color: '#94a3b8', fontSize: '10px', marginBottom: '4px' }}
            />
            <Area type="monotone" dataKey="medical" stroke="#22c55e" fillOpacity={1} fill="url(#colorMedical)" strokeWidth={2} />
            <Area type="monotone" dataKey="flood" stroke="#06b6d4" fillOpacity={1} fill="url(#colorFlood)" strokeWidth={2} />
            <Area type="monotone" dataKey="fire" stroke="#f97316" fillOpacity={1} fill="url(#colorFire)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
