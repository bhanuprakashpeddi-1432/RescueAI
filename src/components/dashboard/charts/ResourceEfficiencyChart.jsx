import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';

const data = [
  { metric: 'Medical', required: 100, allocated: 85 },
  { metric: 'SAR Teams', required: 80, allocated: 90 },
  { metric: 'Boats', required: 60, allocated: 40 },
  { metric: 'Air Support', required: 30, allocated: 10 },
  { metric: 'Supplies', required: 100, allocated: 70 },
  { metric: 'Comms', required: 50, allocated: 50 },
];

export default function ResourceEfficiencyChart() {
  return (
    <div className="glass rounded-2xl p-5 shadow-panel tech-corners">
      <div className="mb-2">
        <h2 className="text-[12px] font-extrabold text-white font-display tracking-wider uppercase">Resource Allocation Efficiency</h2>
        <p className="text-[11px] text-slate-500">Allocated assets vs operational requirements</p>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <PolarGrid stroke="#334155" />
            <PolarAngleAxis dataKey="metric" tick={{ fill: '#94a3b8', fontSize: 10 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
              itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
            />
            <Radar name="Required" dataKey="required" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.1} strokeDasharray="3 3" />
            <Radar name="Allocated" dataKey="allocated" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.5} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
