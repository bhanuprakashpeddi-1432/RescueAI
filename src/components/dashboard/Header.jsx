import React, { useState, useEffect } from 'react';
import { Icon } from './UIHelpers.jsx';

export default function Header({ onMenuClick, alertCount }) {
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
