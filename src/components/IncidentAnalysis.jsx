import { useState } from "react";

const sampleIncident =
  "Flood water is rising rapidly in River Ward. Five residents are stranded on rooftops, " +
  "the main access road is submerged, and power lines are reported down near the evacuation point.";

const severityClasses = {
  low: "bg-emerald-500/10 text-emerald-300 ring-emerald-400/20",
  moderate: "bg-amber-500/10 text-amber-300 ring-amber-400/20",
  high: "bg-orange-500/10 text-orange-300 ring-orange-400/20",
  critical: "bg-rose-500/10 text-rose-300 ring-rose-400/20",
};

const urgencyClasses = {
  routine: "text-cyan-300",
  priority: "text-amber-300",
  immediate: "text-orange-300",
  "life-threatening": "text-rose-300",
};

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000";

function SparkIcon({ className = "h-5 w-5" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2 9.8 9.8 2 12l7.8 2.2L12 22l2.2-7.8L22 12l-7.8-2.2L12 2Z" />
    </svg>
  );
}

function AnalysisLoading() {
  return (
    <div className="analysis-enter flex min-h-[318px] flex-col items-center justify-center rounded-xl border border-cyan-400/10 bg-cyan-500/[0.03] px-6 text-center">
      <div className="relative flex h-16 w-16 items-center justify-center">
        <span className="analysis-orbit absolute inset-0 rounded-full border border-cyan-400/30" />
        <span className="absolute inset-2 rounded-full bg-cyan-500/10" />
        <SparkIcon className="analysis-spark h-7 w-7 text-cyan-300" />
      </div>
      <p className="mt-5 text-sm font-medium text-slate-100">Analyzing incident signals</p>
      <p className="mt-2 max-w-xs text-xs leading-5 text-slate-400">
        AI is evaluating disaster type, operational urgency, and response priorities.
      </p>
      <div className="mt-5 flex gap-1.5">
        <span className="analysis-dot h-1.5 w-1.5 rounded-full bg-cyan-300" />
        <span className="analysis-dot h-1.5 w-1.5 rounded-full bg-cyan-300" />
        <span className="analysis-dot h-1.5 w-1.5 rounded-full bg-cyan-300" />
      </div>
    </div>
  );
}

function ResultPanel({ result }) {
  return (
    <div className="analysis-enter min-h-[318px] rounded-xl border border-slate-800 bg-slate-950/35 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-400">
            AI Assessment
          </p>
          <h3 className="mt-2 text-lg font-semibold capitalize text-white">{result.disasterType}</h3>
        </div>
        <span
          className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ring-1 ring-inset ${
            severityClasses[result.severity] ?? severityClasses.moderate
          }`}
        >
          {result.severity} severity
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-slate-900/75 p-3">
          <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Disaster Type</p>
          <p className="mt-2 text-sm font-medium capitalize text-slate-100">{result.disasterType}</p>
        </div>
        <div className="rounded-lg bg-slate-900/75 p-3">
          <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Urgency</p>
          <p className={`mt-2 text-sm font-semibold capitalize ${urgencyClasses[result.urgency] ?? "text-slate-100"}`}>
            {result.urgency}
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-cyan-400/10 bg-cyan-500/[0.04] p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-400">
          Recommended Action
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-200">{result.recommendedAction}</p>
      </div>

      {result.affectedResources?.length > 0 && (
        <div className="mt-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Affected Resources
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {result.affectedResources.map((resource) => (
              <span key={resource} className="rounded-full bg-slate-800 px-2.5 py-1 text-xs text-slate-300">
                {resource}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function IncidentAnalysis() {
  const [incidentText, setIncidentText] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!incidentText.trim()) {
      setError("Enter an emergency incident report before requesting analysis.");
      return;
    }

    setError("");
    setResult(null);
    setLoading(true);

    try {
      const response = await fetch(`${apiBaseUrl}/analyze-incident`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ incidentText: incidentText.trim() }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Incident analysis could not be completed.");
      }

      setResult(data);
    } catch (requestError) {
      setError(
        requestError.message === "Failed to fetch"
          ? "The RescueAI analysis service is unavailable. Confirm the API server is running."
          : requestError.message,
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-800/90 bg-slate-900/60 shadow-panel">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-cyan-500/10 p-2.5 text-cyan-300 ring-1 ring-cyan-400/20">
            <SparkIcon />
          </div>
          <div>
            <h2 className="font-semibold text-white">AI Incident Analysis</h2>
            <p className="mt-1 text-xs text-slate-400">Convert emergency reports into response priorities</p>
          </div>
        </div>
        <span className="rounded-full bg-slate-800/70 px-3 py-1.5 text-xs font-medium text-slate-300">
          OpenAI-powered triage
        </span>
      </div>

      <div className="grid gap-5 p-5 lg:grid-cols-[minmax(280px,0.92fr)_minmax(340px,1.08fr)]">
        <form onSubmit={handleSubmit}>
          <label htmlFor="incident-description" className="text-sm font-medium text-slate-200">
            Emergency Incident Text
          </label>
          <p className="mt-1.5 text-xs text-slate-400">
            Include location, hazards, impacted people, and access conditions where known.
          </p>
          <textarea
            id="incident-description"
            value={incidentText}
            onChange={(event) => setIncidentText(event.target.value)}
            maxLength={5000}
            placeholder="Example: Flood water is rising near occupied homes..."
            className="mt-4 h-44 w-full resize-none rounded-xl border border-slate-700/80 bg-slate-950/45 p-4 text-sm leading-6 text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-500/10"
          />
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <button
              type="button"
              className="text-cyan-300 transition hover:text-cyan-200"
              onClick={() => {
                setIncidentText(sampleIncident);
                setError("");
              }}
            >
              Use sample incident
            </button>
            <span>{incidentText.length}/5000</span>
          </div>
          {error && (
            <p className="mt-4 rounded-lg border border-rose-400/20 bg-rose-500/10 px-3 py-2.5 text-xs leading-5 text-rose-200">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-wait disabled:opacity-70"
          >
            <SparkIcon className="h-4 w-4" />
            {loading ? "Analyzing Incident..." : "Analyze Incident"}
          </button>
        </form>

        <div>
          {loading ? (
            <AnalysisLoading />
          ) : result ? (
            <ResultPanel result={result} />
          ) : (
            <div className="flex min-h-[318px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-950/20 p-6 text-center">
              <SparkIcon className="h-8 w-8 text-slate-600" />
              <p className="mt-4 text-sm font-medium text-slate-300">Awaiting incident analysis</p>
              <p className="mt-2 max-w-sm text-xs leading-5 text-slate-500">
                Submit an emergency report to generate disaster classification, urgency, and recommended
                response action.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default IncidentAnalysis;
