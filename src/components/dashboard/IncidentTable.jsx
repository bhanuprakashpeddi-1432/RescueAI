import React, { useState, useEffect } from 'react';
import { Icon, SeverityBadge, severityBorder } from './UIHelpers.jsx';
import { activeIncidents as mockIncidents } from '../../data/mockData.js';

const severityProgress = { critical: "bg-red-500", high: "bg-orange-500", medium: "bg-yellow-500", low: "bg-green-500", info: "bg-cyan-500" };

export default function IncidentTable() {
  const [incidents, setIncidents] = useState(mockIncidents);

  useEffect(() => {
    fetch('/api/incidents')
      .then(res => res.json())
      .then(d => {
        if (d.data && d.data.length > 0) {
          setIncidents(d.data.map(i => ({
            id: i.id,
            type: `${(i.category || "General").toUpperCase()} - ${i.title || i.type}`,
            location: i.location?.name || "Unknown",
            severity: i.severity,
            teams: i.assignedTeams?.length || 0,
            eta: "15m", // Mock ETA for now
            progress: i.status === 'resolved' ? 100 : i.status === 'active' ? 35 : 10
          })));
        }
      }).catch(console.error);
  }, []);

  return (
    <section className="glass rounded-2xl overflow-hidden tech-corners shadow-panel">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 px-5 py-4 bg-surface-900/10">
        <div>
          <h2 className="text-[12px] font-extrabold text-white font-display tracking-wider uppercase">ACTIVE INCIDENT REGISTER</h2>
          <p className="mt-0.5 text-[11px] text-slate-500">Real-time response operations by threat profile</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="status-pill status-pill--live">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live sync
          </div>
          <button type="button" className="text-[12px] font-bold text-brand-400 hover:text-brand-300 transition-colors flex items-center gap-1 font-display tracking-wider">
            VIEW ALL INCIDENTS <Icon name="arrow" className="h-4 w-4 shrink-0" />
          </button>
        </div>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-[1fr_auto] sm:grid-cols-[85px_1fr_110px_90px_95px_160px] gap-3 px-6 py-3 border-b border-white/5 bg-surface-900/30">
        {["ID CODE", "INCIDENT PROFILE & LOCATION", "SEVERITY", "DEPLOYS", "EST. ARRIVAL", "STABILIZATION PROGRESS"].map(h => (
          <p key={h} className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-slate-500 hidden sm:block font-display">{h}</p>
        ))}
        <p className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-slate-500 sm:hidden font-display">INCIDENT METRICS</p>
        <p className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-slate-500 sm:hidden font-display text-right">STATUS</p>
      </div>

      <div className="divide-y divide-white/[0.04] bg-surface-900/5 max-h-[400px] overflow-y-auto">
        {incidents.slice(0, 8).map((inc, i) => (
          <div key={inc.id} className={`data-row grid-cols-[1fr_auto] sm:grid-cols-[85px_1fr_110px_90px_95px_160px] gap-x-4 gap-y-2 animate-fade-up border-l-2 ${severityBorder[inc.severity] || "border-l-transparent"}`} style={{ animationDelay: `${i * 60}ms` }}>
            {/* ID */}
            <p className="font-mono text-[11px] font-semibold text-slate-400 hidden sm:block self-center">{inc.id}</p>
            {/* Type + location */}
            <div className="min-w-0 self-center">
              <p className="text-[13px] font-bold text-slate-100 truncate tracking-tight">{inc.type}</p>
              <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-500 truncate font-medium">
                <Icon name="pin" className="h-4 w-4 shrink-0 text-slate-500" />{inc.location}
              </p>
            </div>
            {/* Severity */}
            <div className="self-center hidden sm:block"><SeverityBadge level={inc.severity} /></div>
            {/* Teams */}
            <p className="text-[12px] font-extrabold text-slate-300 self-center hidden sm:block font-mono">{inc.teams} UNITS</p>
            {/* ETA */}
            <p className="text-[12px] font-bold font-display text-brand-400 self-center hidden sm:block text-glow-brand uppercase">ETA {inc.eta}</p>
            {/* Progress bar */}
            <div className="self-center hidden sm:block">
              <div className="flex items-center gap-3">
                <div className="progress-bar flex-1 bg-white/5 border border-white/[0.02]">
                  <div className={`progress-fill ${severityProgress[inc.severity] || "bg-brand-500"}`} style={{ width: `${inc.progress}%` }} />
                </div>
                <span className="text-[11px] font-bold text-slate-400 w-9 text-right font-mono">{inc.progress}%</span>
              </div>
            </div>
            {/* Mobile badge */}
            <div className="sm:hidden self-center"><SeverityBadge level={inc.severity} /></div>
          </div>
        ))}
      </div>
    </section>
  );
}
