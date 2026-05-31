import React, { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import { socketConfig } from "../config/api.js";
import { baseMetrics } from "../data/mockData.js"; // Keep baseMetrics since it's just metric definitions

// Layout & Dashboard Components
import Sidebar from "../components/dashboard/Sidebar.jsx";
import Header from "../components/dashboard/Header.jsx";
import MetricCard from "../components/dashboard/MetricCard.jsx";
import IncidentTable from "../components/dashboard/IncidentTable.jsx";
import { ShelterPanel, HospitalPanel } from "../components/dashboard/ResourcePanels.jsx";
import AlertsPanel from "../components/dashboard/AlertsPanel.jsx";
import ActivityFeed from "../components/dashboard/ActivityFeed.jsx";
import DispatchPanel from "../components/dashboard/DispatchPanel.jsx";
import AnalyticsView from "../components/dashboard/AnalyticsView.jsx";

// Shared Components
import EmergencyChat from "../components/EmergencyChat.jsx";
import IncidentAnalysis from "../components/IncidentAnalysis.jsx";
import RescueMap from "../components/RescueMap.jsx";

export default function CommandCenterDashboard() {
  const [navOpen, setNavOpen]           = useState(false);
  const [activeNav, setActiveNav]       = useState("dashboard");
  const [alerts, setAlerts]             = useState([]);
  const [alertStatus, setAlertStatus]   = useState("connecting");
  const [latestAlertId, setLatestAlertId] = useState("");
  const [liveActivities, setLiveActivities] = useState([]);
  const [summaryData, setSummaryData]   = useState(null);

  useEffect(() => {
    // Fetch initial alerts
    fetch('/api/alerts')
      .then(res => res.json())
      .then(d => {
        if (d.data && d.data.length > 0) {
          setAlerts(d.data.slice(0, 8));
          setLiveActivities(d.data.map(a => ({
            id: `init-${a.id}`,
            time: new Date(a.createdAt || Date.now()).toLocaleTimeString("en-US", { hour12: false }),
            event: `[AI] ${a.title} — ${a.action}`,
            type: a.severity?.toLowerCase() ?? "info",
          })).slice(0, 5));
        }
      })
      .catch(console.error);

    // Fetch initial summary
    fetch('/api/summary')
      .then(res => res.json())
      .then(d => setSummaryData(d))
      .catch(console.error);

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
    if (m.id === "ai-alerts") {
      const actionRequired = alerts.filter(a => a.severity === "critical" || a.severity === "high").length;
      return {
        ...m,
        value: alerts.length,
        detail: `${actionRequired} require active dispatch`,
        trend: alertStatus === "streaming" ? "Live active telemetry" : "Telemetry disconnected",
      };
    }
    
    if (!summaryData) return m;

    if (m.id === "active-incidents") {
      return { ...m, value: summaryData.incidents.active, detail: `${summaryData.incidents.critical} critical severity` };
    }
    if (m.id === "displaced-persons") {
      return { ...m, value: summaryData.casualties.displaced, detail: `${summaryData.shelters.open} shelters active` };
    }
    if (m.id === "hospital-load") {
      return { ...m, value: `${summaryData.hospitals.critical}`, detail: "Facilities >90% capacity" };
    }
    return m;
  }), [alerts, alertStatus, summaryData]);

  const criticalAlertCount = alerts.filter(a => a.severity === "critical").length;

  return (
    <div className="app-bg flex min-h-screen">
      {/* Grid overlay */}
      <div className="pointer-events-none fixed inset-0 grid-overlay opacity-50" aria-hidden />

      <Sidebar open={navOpen} onClose={() => setNavOpen(false)} activeNav={activeNav} setActiveNav={setActiveNav} />

      <div className="flex min-w-0 flex-1 flex-col relative z-10">
        <Header onMenuClick={() => setNavOpen(true)} alertCount={criticalAlertCount} />

        <main className="flex-1 overflow-auto p-5 lg:p-6 space-y-6">
          {activeNav === "analytics" ? (
            <AnalyticsView />
          ) : (
            <>
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
            </>
          )}
        </main>
      </div>
    </div>
  );
}
