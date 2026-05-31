import React, { useState, useEffect } from 'react';
import { Icon } from './UIHelpers.jsx';
import { dispatchUnits as mockDispatchUnits } from '../../data/mockData.js';

export default function DispatchPanel() {
  const [units, setUnits] = useState(mockDispatchUnits);
  const statusLabel = { deployed: "Deployed", "en-route": "En Route", staged: "Staged", airborne: "Airborne", dispatched: "Dispatched", "on-scene": "On Scene", transporting: "Transporting" };
  const statusColor = { deployed: "text-red-400 text-glow-red", "en-route": "text-orange-400 text-glow-orange", staged: "text-brand-400 text-glow-brand", airborne: "text-purple-400", dispatched: "text-red-400 text-glow-red", "on-scene": "text-orange-400 text-glow-orange", transporting: "text-brand-400 text-glow-brand" };

  useEffect(() => {
    fetch('/api/resources/ambulances')
      .then(res => res.json())
      .then(d => {
        if (d.data && d.data.length > 0) {
          const types = [...new Set(d.data.map(u => u.type))];
          const aggregated = types.map((type, i) => {
            const ofType = d.data.filter(u => u.type === type);
            const active = ofType.filter(u => u.status !== 'available').length;
            return {
              name: `${type} Units`,
              status: active > 0 ? ofType.find(u => u.status !== 'available')?.status || 'staged' : 'staged',
              active,
              count: ofType.length,
              color: ['#ef4444', '#f97316', '#3b82f6', '#a855f7'][i % 4]
            };
          });
          setUnits(aggregated);
        }
      }).catch(console.error);
  }, []);

  return (
    <section className="glass rounded-2xl overflow-hidden tech-corners shadow-panel">
      <div className="flex items-center justify-between border-b border-white/5 px-5 py-4 bg-surface-900/10">
        <div>
          <h2 className="text-[12px] font-extrabold text-white font-display tracking-wider uppercase">RESPONDER DEPLOYMENT STATUS</h2>
          <p className="mt-0.5 text-[11px] text-slate-500">Live units status across tactical grid divisions</p>
        </div>
        <button type="button" className="text-[12px] font-bold text-brand-400 hover:text-brand-300 transition-colors flex items-center gap-1 font-display tracking-wider">
          DISPATCH CORE <Icon name="arrow" className="h-4 w-4 shrink-0" />
        </button>
      </div>
      <div className="p-5 space-y-3 bg-surface-900/5">
        {units.slice(0, 4).map((unit) => (
          <div key={unit.name} className="glass-hover flex items-center gap-4.5 rounded-xl bg-white/[0.015] border border-white/5 px-4 py-3">
            <div className="h-2 w-2 rounded-full shrink-0 animate-pulse" style={{ background: unit.color, boxShadow: `0 0 10px ${unit.color}` }} />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-slate-200 tracking-tight">{unit.name}</p>
              <p className={`text-[10px] font-extrabold uppercase font-mono tracking-widest ${statusColor[unit.status] || "text-slate-400"}`}>{statusLabel[unit.status] || unit.status}</p>
            </div>
            <div className="text-right">
              <p className="text-[18px] font-extrabold text-white font-mono leading-none">{unit.active}</p>
              <p className="text-[9px] font-bold text-slate-600 font-mono tracking-wider mt-0.5">OF {unit.count}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
