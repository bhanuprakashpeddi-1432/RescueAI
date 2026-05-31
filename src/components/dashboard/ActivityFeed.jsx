import React from 'react';
import { activityDotColor } from './UIHelpers.jsx';

export default function ActivityFeed({ liveActivities = [] }) {
  // Fallback if none provided
  const fallbackActivity = [
    { id: 'fb1', time: new Date().toLocaleTimeString(), event: '[SYSTEM] Activity feed awaiting logs', type: 'info' }
  ];
  const all = liveActivities.length > 0 ? liveActivities : fallbackActivity;
  
  return (
    <section className="glass rounded-2xl overflow-hidden tech-corners shadow-panel flex flex-col h-full">
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
      <div className="px-5 py-4 space-y-0 max-h-[320px] overflow-y-auto chat-scroll bg-surface-900/5 flex-1">
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
                    if (parts.length < 2) return chunk;
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
