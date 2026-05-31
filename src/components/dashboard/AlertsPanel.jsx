import React from 'react';
import { Icon, SeverityBadge } from './UIHelpers.jsx';

export default function AlertsPanel({ alerts, connectionStatus, latestAlertId }) {
  const statusConfig = {
    streaming:  { pill: "status-pill--live",    dot: "bg-emerald-400 animate-pulse", label: "Live Telemetry" },
    connecting: { pill: "status-pill--warning", dot: "bg-amber-400 animate-pulse",  label: "Syncing Port" },
    offline:    { pill: "status-pill--offline", dot: "bg-slate-500",                label: "Telemetry Offline" },
  };
  const s = statusConfig[connectionStatus] ?? statusConfig.offline;

  return (
    <section className="glass rounded-2xl overflow-hidden tech-corners shadow-panel">
      <div className="flex items-center justify-between border-b border-white/5 px-5 py-4 bg-surface-900/10">
        <div>
          <h2 className="text-[12px] font-extrabold text-white font-display tracking-wider uppercase">LIVE THREAT FEED (AI)</h2>
          <p className="mt-0.5 text-[11px] text-slate-500">Structured intelligence streams and hazards</p>
        </div>
        <div className={`status-pill ${s.pill}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
          {s.label}
        </div>
      </div>

      <div className="divide-y divide-white/[0.04] max-h-[520px] overflow-y-auto chat-scroll bg-surface-900/5">
        {alerts.map((alert) => (
          <div key={alert.id ?? alert.title}
            className={`px-5 py-4 transition-colors relative group hover:bg-white/[0.01] ${alert.id === latestAlertId ? "new-alert" : ""}`}>
            <div className="flex items-start justify-between gap-3 mb-2">
              <SeverityBadge level={alert.severity} />
              <time className="shrink-0 text-[10px] font-mono font-semibold text-slate-600 uppercase">{alert.time ?? "Just now"}</time>
            </div>
            <p className="text-[13px] font-bold leading-5 text-slate-100 group-hover:text-brand-400 transition-colors">{alert.title}</p>
            <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
              <Icon name="pin" className="h-4 w-4 shrink-0 text-slate-500" />{alert.location}
            </p>
            <p className="mt-2.5 flex items-center gap-1.5 text-[11px] font-bold text-brand-400 font-display tracking-wide uppercase">
              <Icon name="arrow" className="h-4 w-4 shrink-0 text-brand-400" />{alert.action}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
