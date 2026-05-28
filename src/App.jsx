import { useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import EmergencyChat from "./components/EmergencyChat.jsx";
import IncidentAnalysis from "./components/IncidentAnalysis.jsx";
import RescueMap from "./components/RescueMap.jsx";
import { socketConfig } from "./config/api.js";
import {
  baseMetrics,
  activeIncidents,
  shelters,
  hospitals,
  dispatchUnits,
  ambulanceSummary,
  initialAlerts,
  recentActivity,
} from "./data/mockData.js";

/* ═══════════════════════════════════════════════════════════════════════
   UI CONSTANTS
   ══════════════════════════════════════════════════════════════════════ */

const navItems = [
  { id: "dashboard",  label: "Dashboard",  icon: "grid",   badge: null },
  { id: "incidents",  label: "Incidents",  icon: "pulse",  badge: 9 },
  { id: "resources",  label: "Resources",  icon: "layers", badge: null },
  { id: "map",        label: "Field Map",  icon: "map",    badge: null },
  { id: "shelters",   label: "Shelters",   icon: "home",   badge: 1 },
  { id: "hospitals",  label: "Hospitals",  icon: "cross",  badge: null },
  { id: "comms",      label: "Comms",      icon: "radio",  badge: 7 },
  { id: "analytics",  label: "Analytics",  icon: "chart",  badge: null },
];

/* ═══════════════════════════════════════════════════════════════════════
   SEVERITY / STYLE HELPERS
   ══════════════════════════════════════════════════════════════════════ */

function severityClass(level) {
  return {
    critical: "badge--critical",
    high:     "badge--high",
    medium:   "badge--medium",
    low:      "badge--low",
    info:     "badge--info",
  }[level] ?? "badge--info";
}

function activityDotColor(type) {
  return { critical: "#ef4444", high: "#f97316", medium: "#eab308", info: "#06b6d4" }[type] ?? "#06b6d4";
}

const severityBorder = {
  critical: "border-l-red-500/50 hover:bg-red-500/[0.02]",
  high:     "border-l-orange-500/50 hover:bg-orange-500/[0.02]",
  medium:   "border-l-yellow-500/50 hover:bg-yellow-500/[0.02]",
  low:      "border-l-green-500/50 hover:bg-green-500/[0.02]",
  info:     "border-l-cyan-500/50 hover:bg-cyan-500/[0.02]",
};

/* ═══════════════════════════════════════════════════════════════════════
   ICONS
   ══════════════════════════════════════════════════════════════════════ */

const iconPaths = {
  grid:    <><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></>,
  pulse:   <path d="M3 12h4l3-7 4 14 3-7h4"/>,
  layers:  <path d="m12 3 9 5-9 5-9-5 9-5Zm-9 10 9 5 9-5M3 18l9 5 9-5"/>,
  home:    <path d="m3 11 9-8 9 8v9H6v-9Zm7 9v-6h4v6"/>,
  cross:   <path d="M9 3h6l1 5h5v13H3V8h5l1-5Zm3 7v8m-4-4h8"/>,
  chart:   <path d="M4 20V9m6 11V4m6 16V12m5 8H3"/>,
  warning: <path d="M12 3 2.5 20h19L12 3Zm0 6v5m0 3v.1"/>,
  spark:   <path d="M12 2 9.8 9.8 2 12l7.8 2.2L12 22l2.2-7.8L22 12l-7.8-2.2L12 2Z"/>,
  bell:    <path d="M18 10a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Zm-8 12h4"/>,
  search:  <path d="m21 21-4.4-4.4m1.4-5.1a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z"/>,
  menu:    <path d="M3 6h18M3 12h18M3 18h18"/>,
  close:   <path d="M5 5 19 19M19 5 5 19"/>,
  pin:     <path d="M12 22s7-6 7-12a7 7 0 1 0-14 0c0 6 7 12 7 12Zm0-9a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/>,
  arrow:   <path d="M5 12h14m-6-6 6 6-6 6"/>,
  map:     <path d="M9 3L3 6v15l6-3 6 3 6-3V3l-6 3-6-3ZM9 3v15M15 6v15"/>,
  radio:   <><circle cx="12" cy="12" r="2"/><path d="M16.2 7.8A6 6 0 0 1 18 12a6 6 0 0 1-1.8 4.2M7.8 7.8A6 6 0 0 0 6 12a6 6 0 0 0 1.8 4.2M19.7 5.3A10 10 0 0 1 22 12a10 10 0 0 1-2.3 6.7M4.3 5.3A10 10 0 0 0 2 12a10 10 0 0 0 2.3 6.7"/></>,
  truck:   <><rect x="1" y="3" width="15" height="13" rx="1"/><path d="m16 8 5 3v5h-5V8Zm-13 8h2m10 0h2"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></>,
  users:   <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm14 2a4 4 0 0 0-4-4 4 4 0 0 0 0 8 4 4 0 0 0 4-4Z"/>,
  shield:  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/>,
  chevron: <path d="m9 18 6-6-6-6"/>,
};

function Icon({ name, className = "h-5 w-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      {iconPaths[name]}
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   BADGE
   ══════════════════════════════════════════════════════════════════════ */

function SeverityBadge({ level }) {
  return (
    <span className={`badge ${severityClass(level)} font-display tracking-widest text-[9px] font-bold`}>
      <span className="badge-dot" />
      {level}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   SIDEBAR
   ══════════════════════════════════════════════════════════════════════ */

function Sidebar({ open, onClose, activeNav, setActiveNav }) {
  return (
    <>
      {open && (
        <button type="button" aria-label="Close navigation"
          className="fixed inset-0 z-30 bg-surface-900/80 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={onClose}
        />
      )}
      <aside className={`sidebar fixed inset-y-0 left-0 z-40 flex w-72 flex-col transform transition-transform duration-300 lg:static lg:w-[245px] lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/5 bg-surface-900/20">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 ring-1 ring-brand-300 tech-corners">
              <Icon name="spark" className="h-5 w-5 text-brand-400" />
            </div>
            <div>
              <p className="text-[15px] font-bold tracking-tight text-white font-display">
                Rescue<span className="text-brand-400">AI</span>
              </p>
              <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-cyan-500/80 font-display">
                COMMAND PORTAL
              </p>
            </div>
          </div>
          <button type="button" className="text-slate-500 hover:text-slate-300 lg:hidden" onClick={onClose}>
            <Icon name="close" className="h-5 w-5" />
          </button>
        </div>

        {/* System status bar */}
        <div className="mx-4 mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.03] p-3.5 backdrop-blur-sm tech-corners tech-corners--safe">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-widest text-emerald-400 font-display">SYSTEMS NOMINAL</span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(34,197,94,0.8)] animate-pulse" />
          </div>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/5">
            <div className="h-full w-[93%] rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 progress-fill" />
          </div>
          <p className="mt-1.5 text-[9px] text-emerald-500/50 font-mono tracking-tight uppercase">AI CONFIDENCE: 93.2% [ACTIVE]</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-1">
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500 font-display">
            OPERATIONS CONTROL
          </p>
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => { setActiveNav(item.id); onClose(); }}
              className={`sidebar-item w-full ${activeNav === item.id ? "active" : ""}`}
            >
              <Icon name={item.icon} className="h-4 w-4 shrink-0" />
              <span className="flex-1 text-left font-medium">{item.label}</span>
              {item.badge !== null && (
                <span className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold font-mono ${
                  activeNav === item.id ? "bg-brand-200 text-brand-500" : "bg-white/8 text-slate-400 border border-white/5"
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-white/5 px-4 py-4 bg-surface-900/30">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-100 text-xs font-extrabold text-brand-400 ring-1 ring-brand-300 font-display">
              OP
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-slate-200 truncate">Command Ops</p>
              <p className="text-[10px] text-slate-500 font-mono tracking-tight uppercase">Level 3 Access</p>
            </div>
            <div className="ml-auto h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(34,197,94,0.6)] animate-pulse" />
          </div>
        </div>
      </aside>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   HEADER
   ══════════════════════════════════════════════════════════════════════ */

function Header({ onMenuClick, alertCount }) {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <header className="flex items-center justify-between gap-4 border-b border-white/5 bg-surface-800/60 backdrop-blur-md px-5 py-4 lg:px-6 sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <button type="button" aria-label="Open navigation"
          className="rounded-lg border border-white/8 bg-white/4 p-2 text-slate-400 hover:text-slate-200 lg:hidden transition-all hover:bg-white/8"
          onClick={onMenuClick}>
          <Icon name="menu" className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-[14px] sm:text-[16px] font-extrabold tracking-widest text-white leading-none font-display uppercase bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            RESPONSE OPERATIONS CENTRAL
          </h1>
          <p className="mt-1 text-[10px] text-slate-500 font-mono tracking-tight uppercase">
            OPERATIONAL PERIOD · 26 MAY 2026 · <span className="text-brand-400 font-semibold">{time.toLocaleTimeString("en-US", { hour12: false })} UTC+5:30</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        {/* Threat level */}
        <div className="hidden md:flex items-center gap-2 rounded-xl border border-red-500/25 bg-red-500/[0.04] px-3.5 py-1.5 backdrop-blur-sm tech-corners tech-corners--critical">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse" />
          <span className="text-[10px] font-extrabold tracking-[0.16em] text-red-400 font-display uppercase">THREAT LEVEL: CRITICAL</span>
        </div>

        {/* Search */}
        <label className="hidden lg:flex h-9 w-56 items-center gap-2 rounded-xl border border-white/8 bg-white/3 px-3 text-slate-500 hover:border-brand-300/40 transition-colors focus-within:border-brand-300/60 focus-within:bg-white/5">
          <Icon name="search" className="h-4 w-4 shrink-0" />
          <input type="search" placeholder="Search operational registry..." className="w-full bg-transparent text-[12px] text-slate-200 outline-none placeholder:text-slate-600 font-medium" />
        </label>

        {/* Notifications */}
        <div className="relative">
          <button type="button" aria-label="Notifications"
            className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/8 bg-white/3 text-slate-400 hover:text-slate-200 transition-all hover:bg-white/5 hover:border-white/12">
            <Icon name="bell" className="h-5 w-5" />
          </button>
          {alertCount > 0 && (
            <span className="notif-badge font-mono">{alertCount}</span>
          )}
        </div>

        {/* Operator */}
        <div className="flex h-9 items-center gap-2 rounded-xl border border-white/8 bg-white/3 px-2.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-brand-100 text-[10px] font-bold text-brand-400 ring-1 ring-brand-300 font-display">
            OP
          </div>
          <span className="hidden text-[12px] font-semibold text-slate-300 sm:inline">Operator 04</span>
        </div>
      </div>
    </header>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   METRIC CARD
   ══════════════════════════════════════════════════════════════════════ */

const metricColorMap = {
  critical: { bar: "bg-red-500", glow: "bg-red-500",    icon: "bg-red-500/12 text-red-400 ring-red-500/20",    topBar: "from-red-600 to-red-400",     varClass: "metric-card--critical", techCorners: "tech-corners--critical", textGlow: "text-glow-red" },
  amber:    { bar: "bg-orange-500", glow: "bg-orange-500", icon: "bg-orange-500/12 text-orange-400 ring-orange-500/20", topBar: "from-orange-600 to-amber-400", varClass: "metric-card--amber", techCorners: "tech-corners--high", textGlow: "text-glow-orange" },
  cyan:     { bar: "bg-cyan-500",   glow: "bg-cyan-500",   icon: "bg-cyan-500/12 text-cyan-400 ring-cyan-500/20",   topBar: "from-cyan-600 to-sky-400",     varClass: "", techCorners: "tech-corners", textGlow: "text-glow-brand" },
  green:    { bar: "bg-emerald-500",glow: "bg-emerald-500",icon: "bg-emerald-500/12 text-emerald-400 ring-emerald-500/20", topBar: "from-emerald-600 to-green-400", varClass: "metric-card--green", techCorners: "tech-corners--safe", textGlow: "text-glow-green" },
  purple:   { bar: "bg-purple-500", glow: "bg-purple-500", icon: "bg-purple-500/12 text-purple-400 ring-purple-500/20", topBar: "from-purple-600 to-violet-400", varClass: "", techCorners: "tech-corners", textGlow: "text-glow-brand" },
  brand:    { bar: "bg-brand-500",  glow: "bg-brand-500",  icon: "bg-brand-100 text-brand-400 ring-brand-300",         topBar: "from-brand-600 to-cyan-300",   varClass: "", techCorners: "tech-corners", textGlow: "text-glow-brand" },
};

function AnimatedCount({ value }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    let start = 0;
    const duration = 1200;
    const step = Math.ceil(value / (duration / 16)) || 1;
    clearInterval(ref.current);
    ref.current = setInterval(() => {
      start += step;
      if (start >= value) { setDisplay(value); clearInterval(ref.current); }
      else setDisplay(start);
    }, 16);
    return () => clearInterval(ref.current);
  }, [value]);

  return <>{display.toLocaleString()}</>;
}

function MetricCard({ metric }) {
  const theme = metricColorMap[metric.color] ?? metricColorMap.brand;
  return (
    <article className={`metric-card ${theme.varClass} ${theme.techCorners} bg-grid-tech`}>
      <div className={`metric-top-bar bg-gradient-to-r ${theme.topBar}`} />
      <div className={`metric-glow ${theme.glow}`} />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 font-display">{metric.title}</p>
          <p className={`mt-3 text-[32px] font-extrabold leading-none tracking-tight text-white font-display ${theme.textGlow}`}>
            <AnimatedCount value={metric.value} />
            <span className="text-[16px] font-semibold text-slate-400 ml-0.5">{metric.unit}</span>
          </p>
        </div>
        <div className={`shrink-0 rounded-xl p-3 ring-1 ring-inset ${theme.icon} transition-transform duration-300 hover:rotate-6`}>
          <Icon name={metric.icon} className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-4 flex items-end justify-between gap-2 border-t border-white/[0.03] pt-3">
        <p className="text-[11px] font-medium text-slate-400">{metric.detail}</p>
        <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[9px] font-extrabold uppercase font-mono border ${
          metric.trendUp ? "bg-red-500/10 text-red-300 border-red-500/20" : "bg-slate-800/80 text-slate-400 border-slate-700/50"
        }`}>
          {metric.trend}
        </span>
      </div>
    </article>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   INCIDENT TABLE
   ══════════════════════════════════════════════════════════════════════ */

const severityProgress = { critical: "bg-red-500", high: "bg-orange-500", medium: "bg-yellow-500", low: "bg-green-500", info: "bg-cyan-500" };

function IncidentTable() {
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

      <div className="divide-y divide-white/[0.04] bg-surface-900/5">
        {activeIncidents.map((inc, i) => (
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

/* ═══════════════════════════════════════════════════════════════════════
   CAPACITY PANEL (shelter / hospital)
   ══════════════════════════════════════════════════════════════════════ */

const shelterLoadColor = (load) => load >= 90 ? "bg-red-500" : load >= 70 ? "bg-orange-500" : "bg-brand-500";
const hospitalLoadColor = (load) => load >= 90 ? "bg-red-500" : load >= 70 ? "bg-orange-500" : load >= 50 ? "bg-yellow-500" : "bg-emerald-500";

function ShelterPanel() {
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
        {shelters.map((s) => (
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

function HospitalPanel() {
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
        {hospitals.map((h) => (
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

/* ═══════════════════════════════════════════════════════════════════════
   ALERTS PANEL
   ══════════════════════════════════════════════════════════════════════ */

function AlertsPanel({ alerts, connectionStatus, latestAlertId }) {
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

/* ═══════════════════════════════════════════════════════════════════════
   ACTIVITY FEED
   ══════════════════════════════════════════════════════════════════════ */

function ActivityFeed({ liveActivities }) {
  const all = [...liveActivities, ...recentActivity].slice(0, 10);
  return (
    <section className="glass rounded-2xl overflow-hidden tech-corners shadow-panel">
      <div className="flex items-center justify-between border-b border-white/5 px-5 py-4 bg-surface-900/10">
        <div>
          <h2 className="text-[12px] font-extrabold text-white font-display tracking-wider uppercase">TACTICAL OPERATIONS LOG</h2>
          <p className="mt-0.5 text-[11px] text-slate-500">Real-time log of field activity reports</p>
        </div>
        <div className="status-pill status-pill--live">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Recording logs
        </div>
      </div>
      <div className="px-5 py-4 space-y-0 max-h-[320px] overflow-y-auto chat-scroll bg-surface-900/5">
        {all.map((act, i) => (
          <div key={act.id} className="feed-item hover:bg-white/[0.005] px-2 rounded-lg" style={{ animationDelay: `${i * 40}ms` }}>
            <div className="feed-timeline">
              <div className="feed-dot" style={{ color: activityDotColor(act.type) }} />
              {i < all.length - 1 && <div className="feed-line" />}
            </div>
            <div className="min-w-0 pb-1.5">
              <p className="text-[10px] font-mono font-bold text-slate-500 mb-0.5">{act.time}</p>
              <p className="text-[12px] leading-5 text-slate-300 font-mono tracking-tight font-medium">
                {act.event.replace(/(\[[A-Z\-a-z]+\])/g, '<span class="text-brand-400 font-semibold">$1</span>')
                  .split('<span class="text-brand-400 font-semibold">')
                  .map((chunk, j) => {
                    if (j === 0) return chunk;
                    const parts = chunk.split("</span>");
                    return (
                      <span key={j}>
                        <span className="text-brand-400 font-bold tracking-wider">{parts[0]}</span>
                        {parts[1]}
                      </span>
                    );
                  })
                }
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   DISPATCH PANEL
   ══════════════════════════════════════════════════════════════════════ */

function DispatchPanel() {
  const statusLabel = { deployed: "Deployed", "en-route": "En Route", staged: "Staged", airborne: "Airborne" };
  const statusColor = { deployed: "text-red-400 text-glow-red", "en-route": "text-orange-400 text-glow-orange", staged: "text-brand-400 text-glow-brand", airborne: "text-purple-400" };

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
        {dispatchUnits.map((unit) => (
          <div key={unit.name} className="glass-hover flex items-center gap-4.5 rounded-xl bg-white/[0.015] border border-white/5 px-4 py-3">
            <div className="h-2 w-2 rounded-full shrink-0 animate-pulse" style={{ background: unit.color, boxShadow: `0 0 10px ${unit.color}` }} />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-slate-200 tracking-tight">{unit.name}</p>
              <p className={`text-[10px] font-extrabold uppercase font-mono tracking-widest ${statusColor[unit.status]}`}>{statusLabel[unit.status]}</p>
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

/* ═══════════════════════════════════════════════════════════════════════
   MAIN APP
   ══════════════════════════════════════════════════════════════════════ */

export default function App() {
  const [navOpen, setNavOpen]           = useState(false);
  const [activeNav, setActiveNav]       = useState("dashboard");
  const [alerts, setAlerts]             = useState(initialAlerts);
  const [alertStatus, setAlertStatus]   = useState("connecting");
  const [latestAlertId, setLatestAlertId] = useState("");
  const [liveActivities, setLiveActivities] = useState([]);

  useEffect(() => {
    const socket = io(socketConfig.url, {
      path: socketConfig.path,
      transports: ["websocket", "polling"],
      reconnectionDelay: 1500,
      reconnectionDelayMax: 10000,
    });

    socket.on("connect",       () => setAlertStatus("streaming"));
    socket.on("connect_error", () => setAlertStatus("offline"));
    socket.on("disconnect",    () => setAlertStatus("offline"));

    socket.on("emergency-alert", (alert) => {
      setLatestAlertId(alert.id);
      setAlerts((prev) => [{ ...alert, time: "Just now" }, ...prev].slice(0, 8));
      setLiveActivities((prev) => [{
        id: `live-${Date.now()}`,
        time: new Date().toLocaleTimeString("en-US", { hour12: false }),
        event: `[AI] ${alert.title} — ${alert.action}`,
        type: alert.severity?.toLowerCase() ?? "info",
      }, ...prev].slice(0, 5));
    });

    return () => socket.disconnect();
  }, []);

  const metrics = useMemo(() => baseMetrics.map((m) => {
    if (m.id !== "ai-alerts") return m;
    const actionRequired = alerts.filter(a => a.severity === "critical" || a.severity === "high").length;
    return {
      ...m,
      value: alerts.length,
      detail: `${actionRequired} require active dispatch`,
      trend: alertStatus === "streaming" ? "Live active telemetry" : "Telemetry disconnected",
    };
  }), [alerts, alertStatus]);

  const criticalAlertCount = alerts.filter(a => a.severity === "critical").length;

  return (
    <div className="app-bg flex min-h-screen">
      {/* Grid overlay */}
      <div className="pointer-events-none fixed inset-0 grid-overlay opacity-50" aria-hidden />

      <Sidebar open={navOpen} onClose={() => setNavOpen(false)} activeNav={activeNav} setActiveNav={setActiveNav} />

      <div className="flex min-w-0 flex-1 flex-col relative z-10">
        <Header onMenuClick={() => setNavOpen(true)} alertCount={criticalAlertCount} />

        <main className="flex-1 overflow-auto p-5 lg:p-6 space-y-6">

          {/* ── Action bar ── */}
          <div className="flex flex-wrap items-center justify-between gap-4 border border-white/5 bg-surface-800/30 p-4 rounded-2xl backdrop-blur-md shadow-panel tech-corners">
            <div className="flex items-center gap-3">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
              </span>
              <div>
                <p className="text-[12px] text-slate-400 font-medium">
                  OPERATIONAL PERIOD LEVEL: <span className="text-slate-200 font-bold uppercase font-mono">26 May 2026</span> ·&nbsp;
                  <span className="text-red-400 font-extrabold tracking-wider font-display text-[11px] text-glow-red animate-pulse">HURRICANE SEASON ACTIVE</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button type="button" className="rounded-xl border border-white/10 bg-white/3 px-4 py-2.5 text-[12px] font-bold text-slate-300 hover:bg-white/8 hover:text-white transition-all hover:border-white/20 font-display tracking-wider">
                EXPORT INTEL REPORT
              </button>
              <button type="button" className="rounded-xl bg-gradient-to-r from-cyan-500 to-brand-500 px-5 py-2.5 text-[12px] font-extrabold text-slate-950 shadow-glow hover:brightness-110 transition-all active:scale-95 font-display tracking-wider">
                ⚡ DEPLOY RESPONSE WING
              </button>
            </div>
          </div>

          {/* ── Metrics grid ── */}
          <section className="grid grid-cols-2 gap-4 lg:grid-cols-3 2xl:grid-cols-6">
            {metrics.map((m) => <MetricCard key={m.id} metric={m} />)}
          </section>

          {/* ── Incident Analysis (AI) ── */}
          <div>
            <IncidentAnalysis />
          </div>

          {/* ── Incident table ── */}
          <div>
            <IncidentTable />
          </div>

          {/* ── Main grid: Map + right column ── */}
          <div className="grid gap-6 xl:grid-cols-[1fr_360px]">

            {/* Left: map + capacity */}
            <div className="space-y-6">
              <RescueMap />
              <div className="grid gap-6 md:grid-cols-2">
                <ShelterPanel />
                <HospitalPanel />
              </div>
              <ActivityFeed liveActivities={liveActivities} />
            </div>

            {/* Right: chat + alerts + dispatch */}
            <div className="space-y-6">
              <EmergencyChat />
              <AlertsPanel alerts={alerts} connectionStatus={alertStatus} latestAlertId={latestAlertId} />
              <DispatchPanel />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
