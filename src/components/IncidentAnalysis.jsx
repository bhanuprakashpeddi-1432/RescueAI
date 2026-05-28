import { useState } from "react";
import { apiBaseUrl } from "../config/api.js";

const sampleIncident =
  "Flood water is rising rapidly in River Ward. Five residents are stranded on rooftops, " +
  "the main access road is submerged, and power lines are reported down near the evacuation point.";

const severityClasses = {
  low:      "bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/20 border border-emerald-500/20 text-glow-green",
  moderate: "bg-amber-500/10  text-amber-300  ring-1 ring-amber-500/20 border border-amber-500/20 text-glow-amber",
  high:     "bg-orange-500/10 text-orange-300 ring-1 ring-orange-500/20 border border-orange-500/20 text-glow-orange",
  critical: "bg-red-500/10    text-red-300    ring-1 ring-red-500/20 border border-red-500/20 text-glow-red",
};

const urgencyClasses = {
  routine:         "text-brand-400 text-glow-brand",
  priority:        "text-amber-300 text-glow-amber",
  immediate:       "text-orange-300 text-glow-orange",
  "life-threatening": "text-red-300 text-glow-red",
};

const urgencyIcons = {
  routine:         "🟢",
  priority:        "🟡",
  immediate:       "🟠",
  "life-threatening": "🔴",
};

function SparkIcon({ className = "h-5 w-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2 9.8 9.8 2 12l7.8 2.2L12 22l2.2-7.8L22 12l-7.8-2.2L12 2Z" />
    </svg>
  );
}

function AnalysisLoading() {
  return (
    <div className="analysis-enter flex min-h-[320px] flex-col items-center justify-center rounded-xl border border-brand-300/20 bg-brand-50/5 px-6 text-center tech-corners tech-corners--high bg-grid-tech">
      <div className="relative flex h-16 w-16 items-center justify-center mb-5">
        <span className="analysis-orbit absolute inset-0 rounded-full border-2 border-transparent" />
        <span className="absolute inset-2 rounded-full bg-brand-50 border border-brand-300/20" />
        <SparkIcon className="analysis-spark h-7 w-7 text-brand-400 text-glow-brand" />
      </div>
      <p className="text-[13px] font-extrabold text-white font-display tracking-widest uppercase">EVALUATING INCIDENT SIGNALS</p>
      <p className="mt-2.5 max-w-xs text-[11.5px] leading-5 text-slate-400 font-medium">
        AI is calculating hazard models, responder safety metrics, and tactical urgency profiles
      </p>
      <div className="mt-5 flex gap-2">
        <span className="analysis-dot h-2 w-2 rounded-full bg-brand-400 shadow-[0_0_8px_#06b6d4]" />
        <span className="analysis-dot h-2 w-2 rounded-full bg-brand-400 shadow-[0_0_8px_#06b6d4]" />
        <span className="analysis-dot h-2 w-2 rounded-full bg-brand-400 shadow-[0_0_8px_#06b6d4]" />
      </div>
    </div>
  );
}

function ResultPanel({ result }) {
  return (
    <div className="analysis-enter min-h-[320px] rounded-xl border border-white/5 bg-surface-700/35 p-5 space-y-4 shadow-panel tech-corners">
      {/* Top: type + severity */}
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/[0.03] pb-3.5">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-brand-400 mb-1 font-display">
            ASSESSMENT LOG COMPLETE
          </p>
          <h3 className="text-[18px] font-extrabold capitalize text-white font-display tracking-tight text-glow-brand">{result.disasterType}</h3>
        </div>
        <span className={`rounded-full px-3 py-1 text-[10px] font-extrabold uppercase font-mono border ${
          severityClasses[result.severity] ?? severityClasses.moderate
        }`}>
          {result.severity} severity
        </span>
      </div>

      {/* Metrics row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-white/[0.015] border border-white/5 p-3.5 hover:border-white/10 transition-colors">
          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-500 mb-1.5 font-display">DISASTER MODEL</p>
          <p className="text-[13px] font-bold capitalize text-slate-200 font-mono tracking-tight">{result.disasterType}</p>
        </div>
        <div className="rounded-xl bg-white/[0.015] border border-white/5 p-3.5 hover:border-white/10 transition-colors">
          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-500 mb-1.5 font-display">URGENCY RATIO</p>
          <p className={`text-[13px] font-extrabold capitalize font-mono tracking-tight ${urgencyClasses[result.urgency] ?? "text-slate-100"}`}>
            {urgencyIcons[result.urgency] ?? ""} {result.urgency}
          </p>
        </div>
      </div>

      {/* Recommended action */}
      <div className="rounded-xl border border-brand-300/20 bg-brand-50/5 p-4 border-l-2 border-l-brand-400">
        <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-brand-400 mb-2 font-display">
          AI STRATEGIC COMMAND RECOMMENDED ACTION
        </p>
        <p className="text-[13.5px] leading-6 text-slate-200 font-medium">{result.recommendedAction}</p>
      </div>

      {/* Resources */}
      {result.affectedResources?.length > 0 && (
        <div className="border-t border-white/[0.03] pt-3.5">
          <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-slate-500 mb-2.5 font-display">
            AFFECTED RESOURCING MATRIX
          </p>
          <div className="flex flex-wrap gap-2">
            {result.affectedResources.map((r) => (
              <span key={r} className="rounded-full border border-white/8 bg-white/4 px-3 py-1.5 text-[10px] font-bold text-slate-300 font-mono border-white/10 hover:border-brand-500/20 hover:text-white transition-all">
                {r}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function IncidentAnalysis() {
  const [incidentText, setIncidentText] = useState("");
  const [result, setResult]   = useState(null);
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!incidentText.trim()) { setError("Enter an emergency incident report before requesting analysis."); return; }
    setError(""); setResult(null); setLoading(true);

    try {
      const res = await fetch(`${apiBaseUrl}/analyze-incident`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ incidentText: incidentText.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Analysis could not be completed.");
      setResult(data);
    } catch (e) {
      setError(e.message === "Failed to fetch"
        ? "Analysis service link disconnected. Confirm backend API gateway stack."
        : e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="glass overflow-hidden rounded-2xl tech-corners shadow-panel">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 px-5 py-4 bg-surface-900/10">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-brand-100 p-2.5 text-brand-400 ring-1 ring-brand-300 tech-corners">
            <SparkIcon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-[12px] font-extrabold text-white font-display tracking-wider uppercase">AI INCIDENT DIAGNOSTIC COMMAND</h2>
            <p className="text-[11px] text-slate-500">Deconstruct raw emergency incident reports into tactical priorities</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="status-pill status-pill--live">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            AI Ready
          </div>
          <span className="rounded-full border border-white/8 bg-white/4 px-3 py-1.5 text-[9px] font-extrabold text-slate-400 font-mono">
            OpenRouter · Llama 3.3
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="grid gap-5 p-5 lg:grid-cols-[minmax(260px,0.92fr)_minmax(320px,1.08fr)]">
        {/* Input form */}
        <form onSubmit={handleSubmit} className="flex flex-col">
          <label htmlFor="incident-desc" className="text-[13px] font-bold text-slate-200 font-display uppercase tracking-wide">
            Raw Incident Dispatch Log
          </label>
          <p className="mt-1 text-[11px] text-slate-500 font-medium">
            Include coordinates, active fires/floods, casualty counts, and regional hazards.
          </p>
          <textarea
            id="incident-desc"
            value={incidentText}
            onChange={(e) => setIncidentText(e.target.value)}
            maxLength={5000}
            placeholder="Input raw transmission log feed here (e.g. flood waters rising in Sector 5, rooftops occupied...)"
            className="mt-3 flex-1 min-h-[180px] w-full resize-none rounded-xl border border-white/8 bg-surface-700/50 p-4 text-[13px] leading-6 text-slate-100 outline-none placeholder:text-slate-600 focus:border-brand-300/60 focus:bg-surface-700/65 focus:shadow-glow transition-all backdrop-blur-sm font-medium"
          />
          <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-500 font-mono uppercase tracking-wider">
            <button type="button" onClick={() => { setIncidentText(sampleIncident); setError(""); }}
              className="text-brand-400 hover:text-brand-300 transition-colors font-bold">
              Load Sample Dispatch
            </button>
            <span className="font-semibold">{incidentText.length} / 5000</span>
          </div>

          {error && (
            <p className="mt-3 rounded-xl border border-red-400/15 bg-red-500/8 px-3.5 py-3 text-[11px] leading-5 text-red-300 font-mono">
              ⚠️ LOGGING FAULT: {error}
            </p>
          )}

          <button type="submit" disabled={loading}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-brand-500 px-4 py-3.5 text-[12px] font-extrabold text-slate-950 transition hover:brightness-110 active:scale-95 disabled:cursor-wait disabled:opacity-70 shadow-glow font-display tracking-widest uppercase">
            <SparkIcon className="h-4 w-4" />
            {loading ? "PROCESSING COGNITIVE STACK..." : "RUN INTEL ANALYSIS"}
          </button>
        </form>

        {/* Result pane */}
        <div>
          {loading ? (
            <AnalysisLoading />
          ) : result ? (
            <ResultPanel result={result} />
          ) : (
            <div className="flex min-h-[320px] flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.005] p-6 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-brand-400/50 ring-1 ring-brand-300/30 tech-corners">
                <SparkIcon className="h-7 w-7" />
              </div>
              <p className="text-[13px] font-extrabold text-slate-400 font-display tracking-wider uppercase">AWAITING TRANSLATION DATA</p>
              <p className="mt-2 max-w-xs text-[11.5px] leading-5 text-slate-600 font-medium">
                Submit an active disaster transmission report to generate immediate severity classification, casualty triage level, and tactical deployment guidelines.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
