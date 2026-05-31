import React, { useState, useEffect, useRef } from 'react';
import { Icon } from './UIHelpers.jsx';

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

export default function MetricCard({ metric }) {
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
