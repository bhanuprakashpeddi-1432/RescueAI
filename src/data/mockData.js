/**
 * RescueAI — Frontend Mock Data
 * Mirrors server/data/mockData.js for UI components.
 * Timestamps are relative strings for display; raw ISO dates are also included.
 */

/* ═══════════════════════════════════════════════════════════════
   DASHBOARD METRICS
══════════════════════════════════════════════════════════════════ */

export const baseMetrics = [
  {
    id: "incidents-active",
    title: "Active Incidents",
    value: 9,
    unit: "",
    detail: "3 critical · 4 high",
    trend: "+2 vs last hour",
    trendUp: true,
    color: "critical",
    icon: "warning",
  },
  {
    id: "people-affected",
    title: "People Affected",
    value: 184720,
    unit: "",
    detail: "53,200 displaced",
    trend: "↑ 1,400 in 30 min",
    trendUp: true,
    color: "amber",
    icon: "users",
  },
  {
    id: "shelters-open",
    title: "Shelters Open",
    value: 5,
    unit: "",
    detail: "8,370 beds available",
    trend: "1 shelter full",
    trendUp: false,
    color: "cyan",
    icon: "home",
  },
  {
    id: "hospitals",
    title: "Hospitals",
    value: 6,
    unit: "",
    detail: "297 beds free",
    trend: "2 at critical load",
    trendUp: false,
    color: "green",
    icon: "cross",
  },
  {
    id: "units-deployed",
    title: "Units Deployed",
    value: 168,
    unit: "",
    detail: "24 SAR · 9 water rescue",
    trend: "+38 since 06:00",
    trendUp: true,
    color: "purple",
    icon: "truck",
  },
  {
    id: "ai-alerts",
    title: "AI Alerts",
    value: 22,
    unit: "",
    detail: "7 require action",
    trend: "Live stream active",
    trendUp: false,
    color: "brand",
    icon: "spark",
  },
];

/* ═══════════════════════════════════════════════════════════════
   ACTIVE INCIDENTS (UI table data)
══════════════════════════════════════════════════════════════════ */

export const activeIncidents = [
  {
    id: "INC-2407",
    type: "Cyclone VARUN",
    category: "cyclone",
    location: "Arabian Sea → Ratnagiri Coast",
    severity: "critical",
    teams: 28,
    affected: "145,000",
    eta: "12h",
    progress: 15,
  },
  {
    id: "INC-2401",
    type: "Flash Flood",
    category: "flood",
    location: "North Valley — River Ward Sector 3",
    severity: "critical",
    teams: 12,
    affected: "4,800",
    eta: "18h",
    progress: 38,
  },
  {
    id: "INC-2405",
    type: "Structure Collapse",
    category: "collapse",
    location: "Riverside Commerce Park, Koregaon",
    severity: "critical",
    teams: 9,
    affected: "55",
    eta: "01m",
    progress: 72,
  },
  {
    id: "INC-2408",
    type: "Industrial HAZMAT Fire",
    category: "fire",
    location: "Industrial Zone 2-B, Kharadi",
    severity: "critical",
    teams: 9,
    affected: "320",
    eta: "8h",
    progress: 55,
  },
  {
    id: "INC-2412",
    type: "High-Rise Fire",
    category: "fire",
    location: "Skyline Tower, Baner Road",
    severity: "critical",
    teams: 7,
    affected: "120",
    eta: "04h",
    progress: 40,
  },
  {
    id: "INC-2402",
    type: "Wildfire",
    category: "fire",
    location: "Coastal Ridge Corridor, Sector C-7",
    severity: "high",
    teams: 8,
    affected: "2,100",
    eta: "36h",
    progress: 28,
  },
  {
    id: "INC-2411",
    type: "Riverbank Breach",
    category: "flood",
    location: "Indrayani River, Sector 11",
    severity: "high",
    teams: 6,
    affected: "2,300",
    eta: "24h",
    progress: 22,
  },
  {
    id: "INC-2404",
    type: "Gas Leak",
    category: "gas",
    location: "Katraj Industrial Corridor",
    severity: "high",
    teams: 4,
    affected: "320",
    eta: "03h",
    progress: 65,
  },
  {
    id: "INC-2403",
    type: "Seismic Aftershock",
    category: "earthquake",
    location: "Metro East Block 7, Hadapsar",
    severity: "medium",
    teams: 5,
    affected: "740",
    eta: "12h",
    progress: 85,
  },
];

/* ═══════════════════════════════════════════════════════════════
   SHELTERS (UI panel data)
══════════════════════════════════════════════════════════════════ */

export const shelters = [
  {
    id: "SHT-001",
    name: "Riverfront Relief Center",
    district: "North Valley",
    available: 482,
    capacity: 900,
    status: "Open",
    load: 46,
    medicalStaff: true,
    powerBackup: true,
    supply: "72h",
  },
  {
    id: "SHT-002",
    name: "Horizon Community Hub",
    district: "East Metro",
    available: 116,
    capacity: 640,
    status: "Limited",
    load: 82,
    medicalStaff: false,
    powerBackup: true,
    supply: "24h",
  },
  {
    id: "SHT-003",
    name: "Westfield Transit Hall",
    district: "West Metro",
    available: 694,
    capacity: 800,
    status: "Open",
    load: 13,
    medicalStaff: true,
    powerBackup: true,
    supply: "96h",
  },
  {
    id: "SHT-004",
    name: "North Arena Emergency Hub",
    district: "North West",
    available: 0,
    capacity: 1200,
    status: "Full",
    load: 100,
    medicalStaff: true,
    powerBackup: false,
    supply: "18h ⚠",
  },
  {
    id: "SHT-005",
    name: "Coastal Cyclone Relief Camp A",
    district: "Coastal Alert Zone",
    available: 1160,
    capacity: 5000,
    status: "Open",
    load: 77,
    medicalStaff: true,
    powerBackup: true,
    supply: "48h",
  },
  {
    id: "SHT-006",
    name: "School Relief Center — Hadapsar",
    district: "Metro East",
    available: 162,
    capacity: 350,
    status: "Open",
    load: 54,
    medicalStaff: false,
    powerBackup: false,
    supply: "36h",
  },
];

/* ═══════════════════════════════════════════════════════════════
   HOSPITALS (UI panel data)
══════════════════════════════════════════════════════════════════ */

export const hospitals = [
  {
    id: "HSP-001",
    name: "St. Helena Medical Center",
    type: "Gov. Trauma",
    freeBeds: 18,
    capacity: 240,
    icuFree: 2,
    load: 92,
    status: "Critical",
  },
  {
    id: "HSP-002",
    name: "Regional Trauma & Burn Center",
    type: "State Referral",
    freeBeds: 42,
    capacity: 310,
    icuFree: 8,
    load: 74,
    status: "High",
  },
  {
    id: "HSP-003",
    name: "Mercy Field Hospital",
    type: "Field — Deployed",
    freeBeds: 67,
    capacity: 150,
    icuFree: 5,
    load: 55,
    status: "Normal",
  },
  {
    id: "HSP-004",
    name: "Eastside Care Clinic",
    type: "Private Multi-spec.",
    freeBeds: 104,
    capacity: 180,
    icuFree: 14,
    load: 28,
    status: "Available",
  },
  {
    id: "HSP-005",
    name: "Coastal District Hospital",
    type: "Gov. General",
    freeBeds: 11,
    capacity: 120,
    icuFree: 1,
    load: 91,
    status: "Critical",
  },
  {
    id: "HSP-006",
    name: "Pimpri Civil Hospital",
    type: "Gov. District",
    freeBeds: 55,
    capacity: 200,
    icuFree: 9,
    load: 61,
    status: "Moderate",
  },
];

/* ═══════════════════════════════════════════════════════════════
   DISPATCH / RESPONSE UNITS
══════════════════════════════════════════════════════════════════ */

export const dispatchUnits = [
  { name: "Search & Rescue",   count: 24, active: 21, status: "deployed",  color: "#ef4444" },
  { name: "Water Rescue",      count: 9,  active: 7,  status: "deployed",  color: "#3b82f6" },
  { name: "Medical Teams",     count: 9,  active: 9,  status: "en-route",  color: "#f97316" },
  { name: "Fire Suppression",  count: 14, active: 11, status: "deployed",  color: "#eab308" },
  { name: "HAZMAT Response",   count: 4,  active: 3,  status: "on-scene",  color: "#a855f7" },
  { name: "Relief Convoys",    count: 16, active: 8,  status: "staged",    color: "#06b6d4" },
  { name: "Aerial Units",      count: 5,  active: 4,  status: "airborne",  color: "#8b5cf6" },
  { name: "Engineering Corps", count: 6,  active: 3,  status: "deployed",  color: "#10b981" },
];

/* ═══════════════════════════════════════════════════════════════
   AMBULANCE FLEET (summary for UI)
══════════════════════════════════════════════════════════════════ */

export const ambulanceSummary = [
  { callSign: "DELTA-1",   type: "ALS",          status: "dispatched",  assignedTo: "INC-2405", eta: "02m" },
  { callSign: "DELTA-2",   type: "ALS",          status: "on-scene",    assignedTo: "INC-2412", eta: "–" },
  { callSign: "ECHO-1",    type: "BLS",          status: "available",   assignedTo: null,        eta: "–" },
  { callSign: "ECHO-2",    type: "BLS",          status: "transporting",assignedTo: "INC-2408", eta: "07m" },
  { callSign: "FOXTROT-1", type: "Pediatric",    status: "available",   assignedTo: null,        eta: "–" },
  { callSign: "GOLF-1",    type: "Water Rescue", status: "on-scene",    assignedTo: "INC-2401", eta: "–" },
  { callSign: "HOTEL-1",   type: "HAZMAT",       status: "on-scene",    assignedTo: "INC-2408", eta: "–" },
  { callSign: "INDIA-1",   type: "Air Ambulance",status: "airborne",    assignedTo: "INC-2407", eta: "22m" },
  { callSign: "JULIET-1",  type: "ALS",          status: "returning",   assignedTo: null,        eta: "05m" },
];

/* ═══════════════════════════════════════════════════════════════
   INITIAL LIVE ALERTS (shown before WebSocket first fires)
══════════════════════════════════════════════════════════════════ */

export const initialAlerts = [
  {
    id: "a1",
    severity: "critical",
    category: "cyclone",
    time: "02m ago",
    title: "Cyclone VARUN — Category 3 · landfall in 12 hours",
    location: "Arabian Sea → Ratnagiri Coastal Belt",
    action: "All coastal evacuation corridors activated",
  },
  {
    id: "a2",
    severity: "critical",
    category: "collapse",
    time: "06m ago",
    title: "Void space located — 3 survivors confirmed in debris",
    location: "Riverside Commerce Park, Level 3",
    action: "Acoustic detection deployed · heavy machinery halted",
  },
  {
    id: "a3",
    severity: "critical",
    category: "fire",
    time: "11m ago",
    title: "Toxic plume shifted — residential zone now in exposure path",
    location: "Industrial Zone 2-B, Kharadi (INC-2408)",
    action: "Shelter-in-place issued for Kharadi Zone 4",
  },
  {
    id: "a4",
    severity: "high",
    category: "flood",
    time: "18m ago",
    title: "River gauge breached 2.0 m danger mark",
    location: "North Valley — Gauge Station NV-04",
    action: "Mandatory evacuation escalated · boat units added",
  },
  {
    id: "a5",
    severity: "high",
    category: "medical",
    time: "23m ago",
    title: "St. Helena ICU at 100% — divert critical patients",
    location: "St. Helena Medical Center (HSP-001)",
    action: "Patient diversion protocol activated",
  },
  {
    id: "a6",
    severity: "high",
    category: "fire",
    time: "31m ago",
    title: "Wildfire perimeter advanced 1.8 km eastward",
    location: "Coastal Ridge Fire Zone — Eastern Flank",
    action: "Aerial tanker pass requested · Village A evacuated",
  },
  {
    id: "a7",
    severity: "medium",
    category: "shelter",
    time: "44m ago",
    title: "SHT-004 power backup failed — 1,200 residents affected",
    location: "North Arena Emergency Hub, Balewadi",
    action: "Generator GEN-07 deployed · ETA 15 min",
  },
  {
    id: "a8",
    severity: "info",
    category: "logistics",
    time: "58m ago",
    title: "Drone survey confirms NH-66 relief corridor passable",
    location: "NH-66 North — 12 km segment cleared",
    action: "Convoy CONVOY-04 cleared to advance",
  },
];

/* ═══════════════════════════════════════════════════════════════
   OPERATIONS LOG (recent activity feed)
══════════════════════════════════════════════════════════════════ */

export const recentActivity = [
  { id: "act-01", time: "13:50:22", event: "SAR Team Alpha confirmed 3 survivors extracted from INC-2405 debris field",    type: "critical" },
  { id: "act-02", time: "13:48:11", event: "INDIA-1 air ambulance airborne — cyclone coastal evacuation mission active",   type: "high" },
  { id: "act-03", time: "13:46:38", event: "HAZMAT cordon expanded to 400 m at INC-2408 — propane cylinder risk",           type: "critical" },
  { id: "act-04", time: "13:44:02", event: "Acoustic search unit deployed — Riverside Commerce Park sub-level 3",           type: "high" },
  { id: "act-05", time: "13:41:55", event: "CONVOY-04 confirmed route NH-66 · ETA Coastal Relief Camp 48 min",             type: "info" },
  { id: "act-06", time: "13:39:17", event: "Engineering corps dispatched to Mula River embankment point MP-7",              type: "high" },
  { id: "act-07", time: "13:36:40", event: "Evacuation zone North Valley extended — additional 1,400 residents notified",  type: "high" },
  { id: "act-08", time: "13:33:12", event: "Patient diversion protocol active — 6 critical patients rerouted to HSP-002",   type: "critical" },
  { id: "act-09", time: "13:30:05", event: "Field hospital SHT-003 (Mercy) confirmed 72h supply adequacy",                 type: "info" },
  { id: "act-10", time: "13:27:49", event: "GOLF-1 water rescue boat completed 2nd extraction — INC-2401 Sector 3",        type: "info" },
  { id: "act-11", time: "13:24:33", event: "Skyline Tower floors 9–11 evacuated via aerial ladder — 22 residents safe",    type: "high" },
  { id: "act-12", time: "13:20:08", event: "Aerial Unit A3 returning for fuel — A4 tasked to wildfire forward sector",     type: "medium" },
];
