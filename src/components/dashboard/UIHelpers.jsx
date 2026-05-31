import React from 'react';

export const navItems = [
  { id: "dashboard",  label: "Dashboard",  icon: "grid",   badge: null },
  { id: "incidents",  label: "Incidents",  icon: "pulse",  badge: 9 },
  { id: "resources",  label: "Resources",  icon: "layers", badge: null },
  { id: "map",        label: "Field Map",  icon: "map",    badge: null },
  { id: "shelters",   label: "Shelters",   icon: "home",   badge: 1 },
  { id: "hospitals",  label: "Hospitals",  icon: "cross",  badge: null },
  { id: "comms",      label: "Comms",      icon: "radio",  badge: 7 },
  { id: "analytics",  label: "Analytics",  icon: "chart",  badge: null },
];

export function severityClass(level) {
  return {
    critical: "badge--critical",
    high:     "badge--high",
    medium:   "badge--medium",
    low:      "badge--low",
    info:     "badge--info",
  }[level] ?? "badge--info";
}

export function activityDotColor(type) {
  return { critical: "#ef4444", high: "#f97316", medium: "#eab308", info: "#06b6d4" }[type] ?? "#06b6d4";
}

export const severityBorder = {
  critical: "border-l-red-500/50 hover:bg-red-500/[0.02]",
  high:     "border-l-orange-500/50 hover:bg-orange-500/[0.02]",
  medium:   "border-l-yellow-500/50 hover:bg-yellow-500/[0.02]",
  low:      "border-l-green-500/50 hover:bg-green-500/[0.02]",
  info:     "border-l-cyan-500/50 hover:bg-cyan-500/[0.02]",
};

export const iconPaths = {
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

export function Icon({ name, className = "h-5 w-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      {iconPaths[name]}
    </svg>
  );
}

export function SeverityBadge({ level }) {
  return (
    <span className={`badge ${severityClass(level)} font-display tracking-widest text-[9px] font-bold`}>
      <span className="badge-dot" />
      {level}
    </span>
  );
}
