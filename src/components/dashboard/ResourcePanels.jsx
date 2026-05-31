import React, { useState, useEffect } from 'react';
import { Icon } from './UIHelpers.jsx';
import { shelters as mockShelters, hospitals as mockHospitals } from '../../data/mockData.js';

const shelterLoadColor = (load) => load >= 90 ? "bg-red-500" : load >= 70 ? "bg-orange-500" : "bg-brand-500";
const hospitalLoadColor = (load) => load >= 90 ? "bg-red-500" : load >= 70 ? "bg-orange-500" : load >= 50 ? "bg-yellow-500" : "bg-emerald-500";

export function ShelterPanel() {
  const [shelters, setShelters] = useState(mockShelters);

  useEffect(() => {
    fetch('/api/resources/shelters')
      .then(res => res.json())
      .then(d => {
        if (d.data && d.data.length > 0) {
          setShelters(d.data.map(s => ({
            name: s.name,
            available: s.availableBeds,
            capacity: s.totalCapacity,
            status: s.status === 'open' ? 'Open' : s.status === 'full' ? 'Full' : 'Limited',
            load: s.totalCapacity ? Math.round((s.currentOccupancy / s.totalCapacity) * 100) : 0
          })));
        }
      }).catch(console.error);
  }, []);

  return (
    <section className="glass rounded-2xl overflow-hidden tech-corners shadow-panel">
      <div className="flex items-center gap-3 border-b border-white/5 px-5 py-4 bg-surface-900/10">
        <div className="rounded-xl bg-brand-100 p-2.5 text-brand-400 ring-1 ring-brand-300 tech-corners animate-pulse-slow">
          <Icon name="home" className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-[12px] font-extrabold text-white font-display tracking-wider uppercase">SHELTER CAPACITY CONTROL</h2>
          <p className="text-[11px] text-slate-500">Real-time civilian housing occupancy & allocation</p>
        </div>
      </div>
      <div className="p-5 space-y-5">
        {shelters.slice(0, 3).map((s) => (
          <div key={s.name} className="relative group">
            <div className="flex items-start justify-between gap-2 mb-2.5">
              <div className="min-w-0">
                <p className="text-[13px] font-bold text-slate-200 truncate tracking-tight">{s.name}</p>
                <p className="mt-0.5 text-[11px] text-slate-500 font-medium">{s.available} beds free of {s.capacity}</p>
              </div>
              <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[9px] font-extrabold uppercase font-mono border ${
                s.status === "Open" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25 text-glow-green"
                : s.status === "Limited" ? "bg-amber-500/10 text-amber-400 border-amber-500/25 text-glow-amber"
                : "bg-red-500/10 text-red-400 border-red-500/25 text-glow-red"
              }`}>
                {s.status}
              </span>
            </div>
            <div className="progress-bar bg-white/5 border border-white/[0.02]">
              <div className={`progress-fill ${shelterLoadColor(s.load)}`} style={{ width: `${s.load}%` }} />
            </div>
            <div className="flex justify-between items-center mt-1.5">
              <span className="text-[9px] text-slate-600 font-mono tracking-wider">UNIT LOAD</span>
              <span className="text-[11px] font-bold text-slate-400 font-mono">{s.load}% occupied</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function HospitalPanel() {
  const [hospitals, setHospitals] = useState(mockHospitals);

  useEffect(() => {
    fetch('/api/resources/hospitals')
      .then(res => res.json())
      .then(d => {
        if (d.data && d.data.length > 0) {
          setHospitals(d.data.map(h => ({
            name: h.name,
            freeBeds: h.freeBeds,
            load: h.operationalLoad
          })));
        }
      }).catch(console.error);
  }, []);

  return (
    <section className="glass rounded-2xl overflow-hidden tech-corners shadow-panel">
      <div className="flex items-center gap-3 border-b border-white/5 px-5 py-4 bg-surface-900/10">
        <div className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-400 ring-1 ring-emerald-500/20 tech-corners tech-corners--safe animate-pulse-slow">
          <Icon name="cross" className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-[12px] font-extrabold text-white font-display tracking-wider uppercase">TRAUMA CENTER LOGISTICS</h2>
          <p className="text-[11px] text-slate-500">Critical care bed utilization and division statistics</p>
        </div>
      </div>
      <div className="p-5 space-y-4">
        {hospitals.slice(0, 3).map((h) => (
          <div key={h.name} className="glass-hover rounded-xl bg-white/[0.015] border border-white/5 p-3.5 hover:border-emerald-500/20">
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <div className="min-w-0">
                <p className="text-[13px] font-bold text-slate-200 truncate tracking-tight">{h.name}</p>
                <p className="mt-0.5 text-[11px] text-slate-500 font-medium">{h.freeBeds} trauma beds available</p>
              </div>
              <span className={`font-mono text-[14px] font-extrabold text-glow-brand ${h.load >= 90 ? "text-red-400" : h.load >= 70 ? "text-orange-400" : "text-emerald-400"}`}>
                {h.load}%
              </span>
            </div>
            <div className="progress-bar bg-white/5 border border-white/[0.02]">
              <div className={`progress-fill ${hospitalLoadColor(h.load)}`} style={{ width: `${h.load}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
