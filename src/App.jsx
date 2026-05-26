import { useState } from "react";

const navigation = [
  { name: "Dashboard", icon: "grid", active: true },
  { name: "Incidents", icon: "pulse" },
  { name: "Resources", icon: "layers" },
  { name: "Shelters", icon: "home" },
  { name: "Hospitals", icon: "medical" },
  { name: "Analytics", icon: "chart" },
];

const metrics = [
  {
    title: "Active Incidents",
    value: "24",
    detail: "6 critical severity",
    trend: "+3 in last hour",
    color: "rose",
    icon: "warning",
  },
  {
    title: "Shelters",
    value: "82",
    detail: "18,420 capacity",
    trend: "68% occupied",
    color: "cyan",
    icon: "home",
  },
  {
    title: "Hospitals",
    value: "37",
    detail: "12 on high intake",
    trend: "1,204 beds free",
    color: "emerald",
    icon: "medical",
  },
  {
    title: "AI Alerts",
    value: "11",
    detail: "4 require action",
    trend: "Updated just now",
    color: "amber",
    icon: "spark",
  },
];

const alerts = [
  {
    severity: "Critical",
    time: "02 min ago",
    title: "Flash flood probability increased to 91%",
    location: "North Valley District",
    action: "Evacuation route recommended",
  },
  {
    severity: "High",
    time: "08 min ago",
    title: "Hospital capacity approaching threshold",
    location: "St. Helena Medical Center",
    action: "Redirect ambulance intake",
  },
  {
    severity: "Medium",
    time: "17 min ago",
    title: "Shelter supply projection revised",
    location: "Riverfront Relief Center",
    action: "Food restock in 6 hours",
  },
  {
    severity: "Info",
    time: "26 min ago",
    title: "Drone survey imagery processed",
    location: "Coastal Zone 4",
    action: "No new structural damage",
  },
];

const incidents = [
  {
    type: "Flash Flood",
    location: "North Valley District",
    severity: "Critical",
    teams: 12,
    affected: "4.8k",
    eta: "03m",
  },
  {
    type: "Wildfire Spread",
    location: "Coastal Ridge Sector",
    severity: "High",
    teams: 8,
    affected: "2.1k",
    eta: "11m",
  },
  {
    type: "Seismic Aftershock",
    location: "Metro East Block 7",
    severity: "Medium",
    teams: 5,
    affected: "740",
    eta: "18m",
  },
];

const shelters = [
  { name: "Riverfront Relief Center", available: 482, capacity: 900, status: "Open" },
  { name: "Horizon Community Hub", available: 116, capacity: 640, status: "Limited" },
  { name: "Westfield Transit Hall", available: 694, capacity: 800, status: "Open" },
];

const hospitals = [
  { name: "St. Helena Medical", freeBeds: 18, capacity: 240, load: 92 },
  { name: "Regional Trauma Center", freeBeds: 42, capacity: 310, load: 74 },
  { name: "Mercy Field Hospital", freeBeds: 67, capacity: 150, load: 55 },
];

const dispatchUnits = [
  { name: "Search & Rescue", count: 16, status: "Deployed" },
  { name: "Medical Response", count: 9, status: "En Route" },
  { name: "Relief Convoys", count: 12, status: "Staged" },
];

const colorStyles = {
  rose: {
    icon: "bg-rose-500/15 text-rose-300 ring-rose-400/20",
    accent: "bg-rose-400",
  },
  cyan: {
    icon: "bg-cyan-500/15 text-cyan-300 ring-cyan-400/20",
    accent: "bg-cyan-400",
  },
  emerald: {
    icon: "bg-emerald-500/15 text-emerald-300 ring-emerald-400/20",
    accent: "bg-emerald-400",
  },
  amber: {
    icon: "bg-amber-500/15 text-amber-300 ring-amber-400/20",
    accent: "bg-amber-400",
  },
};

const severityStyles = {
  Critical: "bg-rose-500/15 text-rose-300 ring-rose-400/20",
  High: "bg-orange-500/15 text-orange-300 ring-orange-400/20",
  Medium: "bg-amber-500/15 text-amber-300 ring-amber-400/20",
  Info: "bg-cyan-500/15 text-cyan-300 ring-cyan-400/20",
};

function Icon({ name, className = "h-5 w-5" }) {
  const paths = {
    grid: <path d="M4 4h6v6H4zm10 0h6v6h-6zM4 14h6v6H4zm10 0h6v6h-6z" />,
    pulse: <path d="M3 12h4l3-7 4 14 3-7h4" />,
    layers: <path d="m12 3 9 5-9 5-9-5 9-5Zm-9 10 9 5 9-5M3 18l9 5 9-5" />,
    home: <path d="m3 11 9-8 9 8v9H6v-9Zm7 9v-6h4v6" />,
    medical: <path d="M9 3h6l1 5h5v13H3V8h5l1-5Zm3 7v8m-4-4h8" />,
    chart: <path d="M4 20V9m6 11V4m6 16V12m5 8H3" />,
    warning: <path d="M12 3 2.5 20h19L12 3Zm0 6v5m0 3v.1" />,
    spark: <path d="M12 2 9.8 9.8 2 12l7.8 2.2L12 22l2.2-7.8L22 12l-7.8-2.2L12 2Z" />,
    bell: <path d="M18 10a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Zm-8 12h4" />,
    search: <path d="m21 21-4.4-4.4m1.4-5.1a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z" />,
    menu: <path d="M3 6h18M3 12h18M3 18h18" />,
    close: <path d="M5 5 19 19M19 5 5 19" />,
    pin: <path d="M12 22s7-6 7-12a7 7 0 1 0-14 0c0 6 7 12 7 12Zm0-9a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />,
    arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
  };

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
      {paths[name]}
    </svg>
  );
}

function Sidebar({ open, onClose }) {
  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-30 bg-slate-950/75 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 transform flex-col border-r border-slate-800/80 bg-[#0a1322] px-5 py-6 transition-transform duration-300 lg:static lg:w-64 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/15 ring-1 ring-cyan-400/30">
              <Icon name="spark" className="h-6 w-6 text-cyan-300" />
            </div>
            <div>
              <p className="text-lg font-semibold tracking-tight text-white">
                Rescue<span className="text-cyan-400">AI</span>
              </p>
              <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-slate-500">
                Command Center
              </p>
            </div>
          </div>
          <button type="button" className="text-slate-400 lg:hidden" onClick={onClose}>
            <Icon name="close" />
          </button>
        </div>

        <nav className="mt-10 space-y-1.5">
          {navigation.map((item) => (
            <button
              key={item.name}
              type="button"
              onClick={onClose}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                item.active
                  ? "bg-cyan-500/10 text-cyan-300 ring-1 ring-inset ring-cyan-400/20"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-100"
              }`}
            >
              <Icon name={item.icon} className="h-5 w-5" />
              {item.name}
            </button>
          ))}
        </nav>

        <div className="mt-auto rounded-2xl border border-slate-800 bg-slate-900/55 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-white">AI System Status</p>
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]" />
          </div>
          <p className="mt-2 text-xs leading-5 text-slate-400">
            Predictive models operational. Next data sync in 38 seconds.
          </p>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-800">
            <div className="h-full w-[92%] rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400" />
          </div>
          <p className="mt-2 text-xs text-slate-500">System confidence 92.4%</p>
        </div>
      </aside>
    </>
  );
}

function Header({ onMenuClick }) {
  return (
    <header className="flex flex-col gap-5 border-b border-slate-800/70 px-5 py-5 sm:px-7 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-4">
        <button
          type="button"
          aria-label="Open navigation"
          className="rounded-lg border border-slate-800 p-2 text-slate-300 lg:hidden"
          onClick={onMenuClick}
        >
          <Icon name="menu" />
        </button>
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
            Response Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Real-time disaster intelligence and resource coordination
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <label className="hidden h-11 w-64 items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/70 px-4 text-slate-500 md:flex">
          <Icon name="search" />
          <input
            type="search"
            placeholder="Search incidents..."
            className="w-full bg-transparent text-sm text-slate-200 outline-none placeholder:text-slate-500"
          />
        </label>
        <button
          type="button"
          className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/70 text-slate-300"
        >
          <Icon name="bell" />
          <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-rose-400" />
        </button>
        <div className="flex h-11 items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/70 px-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan-500/20 text-xs font-semibold text-cyan-300">
            OP
          </div>
          <span className="hidden text-sm font-medium text-slate-200 sm:inline">Operations</span>
        </div>
      </div>
    </header>
  );
}

function StatCard({ metric }) {
  const theme = colorStyles[metric.color];

  return (
    <article className="stat-card relative overflow-hidden rounded-2xl border border-slate-800/90 bg-slate-900/60 p-5 shadow-panel transition hover:-translate-y-0.5 hover:border-slate-700">
      <div className={`absolute left-0 top-0 h-full w-1 ${theme.accent}`} />
      <div className={`stat-glow absolute -right-10 -top-10 h-28 w-28 rounded-full opacity-20 blur-3xl ${theme.accent}`} />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400">{metric.title}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-white">{metric.value}</p>
        </div>
        <div className={`rounded-xl p-3 ring-1 ring-inset ${theme.icon}`}>
          <Icon name={metric.icon} className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-5 flex items-center justify-between gap-3 text-xs">
        <span className="text-slate-400">{metric.detail}</span>
        <span className="rounded-full bg-slate-800/80 px-2.5 py-1 text-slate-300">{metric.trend}</span>
      </div>
    </article>
  );
}

function SeverityBadge({ level }) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${severityStyles[level]}`}
    >
      {level}
    </span>
  );
}

function IncidentPanel() {
  return (
    <section className="rounded-2xl border border-slate-800/90 bg-slate-900/60 p-5 shadow-panel">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold text-white">Real-Time Incidents</h2>
          <p className="mt-1 text-xs text-slate-400">Active response operations by priority</p>
        </div>
        <span className="flex items-center gap-2 text-xs font-medium text-cyan-300">
          <span className="live-dot h-2 w-2 rounded-full bg-cyan-400" />
          Syncing live
        </span>
      </div>
      <div className="mt-5 grid gap-3 lg:grid-cols-3">
        {incidents.map((incident) => (
          <article
            key={incident.type}
            className="rounded-xl border border-slate-800 bg-slate-950/30 p-4 transition hover:border-slate-700"
          >
            <div className="flex items-center justify-between gap-3">
              <SeverityBadge level={incident.severity} />
              <span className="text-xs text-slate-500">ETA {incident.eta}</span>
            </div>
            <h3 className="mt-4 text-sm font-semibold text-slate-100">{incident.type}</h3>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
              <Icon name="pin" className="h-3.5 w-3.5 text-slate-500" />
              {incident.location}
            </p>
            <div className="mt-4 flex gap-5 border-t border-slate-800/80 pt-3 text-xs">
              <p className="text-slate-500">
                Units <span className="ml-1 font-semibold text-white">{incident.teams}</span>
              </p>
              <p className="text-slate-500">
                Affected <span className="ml-1 font-semibold text-white">{incident.affected}</span>
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function CapacityPanel({ title, subtitle, icon, children }) {
  return (
    <section className="rounded-2xl border border-slate-800/90 bg-slate-900/60 p-5 shadow-panel">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-cyan-500/10 p-2 text-cyan-300">
          <Icon name={icon} className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-white">{title}</h2>
          <p className="text-xs text-slate-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}

function ShelterPanel() {
  return (
    <CapacityPanel title="Shelter Availability" subtitle="Available accommodation spaces" icon="home">
      {shelters.map((shelter) => {
        const availablePercentage = Math.round((shelter.available / shelter.capacity) * 100);

        return (
          <div key={shelter.name}>
            <div className="mb-2 flex items-start justify-between gap-3 text-xs">
              <div>
                <p className="font-medium text-slate-200">{shelter.name}</p>
                <p className="mt-1 text-slate-500">{shelter.available} beds available</p>
              </div>
              <span
                className={`rounded-full px-2 py-1 font-medium ${
                  shelter.status === "Open" ? "bg-emerald-500/10 text-emerald-300" : "bg-amber-500/10 text-amber-300"
                }`}
              >
                {shelter.status}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400"
                style={{ width: `${availablePercentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </CapacityPanel>
  );
}

function HospitalPanel() {
  return (
    <CapacityPanel title="Hospital Capacity" subtitle="Emergency bed utilization" icon="medical">
      {hospitals.map((hospital) => (
        <div key={hospital.name} className="rounded-xl bg-slate-950/25 p-3">
          <div className="flex items-center justify-between gap-3 text-xs">
            <div>
              <p className="font-medium text-slate-200">{hospital.name}</p>
              <p className="mt-1 text-slate-500">{hospital.freeBeds} beds free</p>
            </div>
            <span className={hospital.load >= 90 ? "font-semibold text-rose-300" : "font-semibold text-slate-200"}>
              {hospital.load}%
            </span>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-800">
            <div
              className={`h-full rounded-full ${hospital.load >= 90 ? "bg-rose-400" : "bg-cyan-400"}`}
              style={{ width: `${hospital.load}%` }}
            />
          </div>
        </div>
      ))}
    </CapacityPanel>
  );
}

function MapPanel() {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-800/90 bg-slate-900/60 shadow-panel">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 px-5 py-4">
        <div>
          <h2 className="font-semibold text-white">Incident Intelligence Map</h2>
          <p className="mt-1 text-xs text-slate-400">Live geospatial risk monitoring</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-rose-400" /> Critical
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-400" /> At Risk
          </span>
          <button type="button" className="rounded-lg bg-slate-800 px-3 py-2 text-slate-200">
            Layers
          </button>
        </div>
      </div>

      <div className="relative h-[380px] overflow-hidden bg-[#0b1828] sm:h-[430px]">
        <div className="absolute inset-0 opacity-50 [background-image:linear-gradient(rgba(51,65,85,.32)_1px,transparent_1px),linear-gradient(90deg,rgba(51,65,85,.32)_1px,transparent_1px)] [background-size:52px_52px]" />
        <div className="absolute inset-x-[-20%] top-[45%] h-36 rotate-[-8deg] rounded-[100%] border border-cyan-900/40" />
        <div className="absolute left-[12%] top-[20%] h-52 w-72 rounded-[44%] border border-slate-700/50 bg-slate-800/25" />
        <div className="absolute right-[8%] top-[42%] h-32 w-64 rounded-[50%] border border-slate-700/50 bg-slate-800/25" />

        <MapMarker className="left-[31%] top-[31%]" color="rose" label="Flood Zone A" />
        <MapMarker className="left-[58%] top-[48%]" color="amber" label="Medical surge" />
        <MapMarker className="left-[72%] top-[26%]" color="rose" label="Fire perimeter" />
        <MapMarker className="left-[45%] top-[66%]" color="cyan" label="Relief hub" />

        <div className="absolute bottom-5 left-5 rounded-xl border border-slate-700/70 bg-slate-950/75 px-4 py-3 backdrop-blur-md">
          <p className="text-xs uppercase tracking-widest text-slate-500">Monitored Region</p>
          <p className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-100">
            <Icon name="pin" className="h-4 w-4 text-cyan-300" />
            Western Coastal Corridor
          </p>
        </div>
      </div>
    </section>
  );
}

function MapMarker({ className, color, label }) {
  const markerColor = {
    rose: "bg-rose-400 shadow-[0_0_0_8px_rgba(251,113,133,.12),0_0_22px_rgba(251,113,133,.8)]",
    amber: "bg-amber-400 shadow-[0_0_0_8px_rgba(251,191,36,.12),0_0_22px_rgba(251,191,36,.8)]",
    cyan: "bg-cyan-400 shadow-[0_0_0_8px_rgba(34,211,238,.12),0_0_22px_rgba(34,211,238,.8)]",
  };

  return (
    <div className={`group absolute ${className}`}>
      <span className={`block h-3.5 w-3.5 rounded-full ${markerColor[color]}`} />
      <span className="absolute left-5 top-[-10px] whitespace-nowrap rounded-lg border border-slate-700 bg-slate-950/90 px-2.5 py-1.5 text-xs text-slate-200 opacity-0 transition group-hover:opacity-100">
        {label}
      </span>
    </div>
  );
}

function AlertsPanel() {
  return (
    <section className="rounded-2xl border border-slate-800/90 bg-slate-900/60 shadow-panel">
      <div className="flex items-center justify-between border-b border-slate-800/80 px-5 py-4">
        <div>
          <h2 className="font-semibold text-white">Live AI Alerts</h2>
          <p className="mt-1 text-xs text-slate-400">Priority intelligence feed</p>
        </div>
        <span className="flex items-center gap-2 rounded-full bg-rose-500/10 px-3 py-1.5 text-xs font-medium text-rose-300">
          <span className="h-2 w-2 animate-pulse rounded-full bg-rose-400" />
          Live
        </span>
      </div>
      <div className="divide-y divide-slate-800/70 px-5">
        {alerts.map((alert) => (
          <article key={alert.title} className="py-4">
            <div className="flex items-center justify-between gap-3">
              <SeverityBadge level={alert.severity} />
              <time className="text-xs text-slate-500">{alert.time}</time>
            </div>
            <h3 className="mt-3 text-sm font-medium leading-5 text-slate-100">{alert.title}</h3>
            <p className="mt-1.5 text-xs text-slate-400">{alert.location}</p>
            <p className="mt-3 flex items-center gap-2 text-xs font-medium text-cyan-300">
              {alert.action}
              <Icon name="arrow" className="h-3.5 w-3.5" />
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

function DispatchPanel() {
  return (
    <section className="rounded-2xl border border-slate-800/90 bg-slate-900/60 p-5 shadow-panel">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-white">Response Units</h2>
        <button type="button" className="text-xs font-medium text-cyan-300">
          View all
        </button>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
        {dispatchUnits.map((unit) => (
          <div key={unit.name} className="flex items-center justify-between rounded-xl bg-slate-800/45 px-4 py-3">
            <div>
              <p className="text-sm text-slate-200">{unit.name}</p>
              <p className="mt-1 text-xs text-slate-500">{unit.status}</p>
            </div>
            <p className="text-lg font-semibold text-white">{unit.count}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function App() {
  const [navigationOpen, setNavigationOpen] = useState(false);

  return (
    <div className="flex min-h-screen text-slate-200">
      <Sidebar open={navigationOpen} onClose={() => setNavigationOpen(false)} />
      <main className="min-w-0 flex-1">
        <Header onMenuClick={() => setNavigationOpen(true)} />
        <div className="p-5 sm:p-7">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-slate-400">
                Operational overview for <span className="font-medium text-white">26 May 2026</span>
              </p>
            </div>
            <button
              type="button"
              className="rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
            >
              Deploy Response Team
            </button>
          </div>

          <section className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
            {metrics.map((metric) => (
              <StatCard key={metric.title} metric={metric} />
            ))}
          </section>

          <div className="mt-6">
            <IncidentPanel />
          </div>

          <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-5">
              <MapPanel />
              <div className="grid gap-5 md:grid-cols-2">
                <ShelterPanel />
                <HospitalPanel />
              </div>
            </div>
            <div className="space-y-5">
              <AlertsPanel />
              <DispatchPanel />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
