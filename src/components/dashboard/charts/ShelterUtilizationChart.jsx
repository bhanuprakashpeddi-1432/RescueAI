import React from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'SHT-01', capacity: 1500, load: 1420 },
  { name: 'SHT-02', capacity: 800,  load: 750 },
  { name: 'SHT-03', capacity: 1200, load: 600 },
  { name: 'SHT-04', capacity: 500,  load: 490 },
  { name: 'SHT-05', capacity: 2000, load: 1800 },
];

export default function ShelterUtilizationChart() {
  return (
    <div className="glass rounded-2xl p-5 shadow-panel tech-corners">
      <div className="mb-4">
        <h2 className="text-[12px] font-extrabold text-white font-display tracking-wider uppercase">Shelter Utilization Matrix</h2>
        <p className="text-[11px] text-slate-500">Current load vs maximum facility capacity</p>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
            <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
            <Tooltip 
              cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
              itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
            />
            <Legend wrapperStyle={{ fontSize: '10px', color: '#94a3b8' }} />
            <Bar dataKey="capacity" fill="#334155" radius={[4, 4, 0, 0]} barSize={20} name="Total Capacity" />
            <Line type="monotone" dataKey="load" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4, fill: '#f43f5e', strokeWidth: 2, stroke: '#0f172a' }} name="Current Load" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
