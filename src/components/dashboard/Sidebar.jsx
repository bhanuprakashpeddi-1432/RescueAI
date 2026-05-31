import React from 'react';
import { Icon, navItems } from './UIHelpers.jsx';

export default function Sidebar({ open, onClose, activeNav, setActiveNav }) {
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
