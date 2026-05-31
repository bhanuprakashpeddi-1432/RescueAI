import React from 'react';
import DisasterTrendsChart from './charts/DisasterTrendsChart.jsx';
import ShelterUtilizationChart from './charts/ShelterUtilizationChart.jsx';
import ResourceEfficiencyChart from './charts/ResourceEfficiencyChart.jsx';
import ResponseMetricsChart from './charts/ResponseMetricsChart.jsx';

export default function AnalyticsView() {
  return (
    <div className="animate-fade-in space-y-6">
      {/* Analytics Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border border-white/5 bg-surface-800/30 p-4 rounded-2xl backdrop-blur-md shadow-panel tech-corners">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10 text-brand-400 ring-1 ring-brand-500/20 tech-corners">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3v18h18" />
              <path d="m19 9-5 5-4-4-3 3" />
            </svg>
          </div>
          <div>
            <h1 className="text-[16px] font-extrabold text-white font-display uppercase tracking-widest">Advanced Analytics</h1>
            <p className="text-[11px] text-slate-400 font-mono tracking-tight uppercase">Strategic intelligence & response efficiency</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-[11px] font-bold text-slate-300 hover:bg-white/10 transition-colors font-display tracking-wider">
            LAST 24 HOURS
          </button>
          <button className="rounded-xl border border-brand-500/30 bg-brand-500/10 px-4 py-2 text-[11px] font-bold text-brand-400 hover:bg-brand-500/20 transition-colors font-display tracking-wider">
            LAST 30 DAYS
          </button>
        </div>
      </div>

      {/* Grid of charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DisasterTrendsChart />
        <ShelterUtilizationChart />
        <ResourceEfficiencyChart />
        <ResponseMetricsChart />
      </div>
    </div>
  );
}
