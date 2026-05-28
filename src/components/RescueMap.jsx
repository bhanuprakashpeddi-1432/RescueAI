import { Fragment } from "react";
import { Circle, MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const mapCenter = [18.528, 73.854];

const mapLocations = [
  {
    id: "flood-1",
    type: "flood",
    label: "Flood Zone",
    name: "Mula-Mutha Overflow Sector",
    position: [18.543, 73.87],
    severity: "Critical",
    details: [
      { label: "Risk Factor", value: "92% Inundation Rate" },
      { label: "Est. Impact", value: "4,800 Residents" },
      { label: "Action Status", value: "Evacuation Phase B" },
    ],
    radius: 1250,
  },
  {
    id: "flood-2",
    type: "flood",
    label: "Flood Zone",
    name: "Riverside Transit Corridor",
    position: [18.509, 73.843],
    severity: "High",
    details: [
      { label: "Risk Factor", value: "76% Inundation Rate" },
      { label: "Est. Impact", value: "2,100 Residents" },
      { label: "Action Status", value: "Routes Restricted" },
    ],
    radius: 840,
  },
  {
    id: "shelter-1",
    type: "shelter",
    label: "Shelter",
    name: "Riverfront Relief Center",
    position: [18.528, 73.827],
    severity: "Open",
    details: [
      { label: "Bed Capacity", value: "482 / 900 Free" },
      { label: "Rations Load", value: "72 Hours Secured" },
      { label: "Comm Tag", value: "Relay S-04" },
    ],
  },
  {
    id: "shelter-2",
    type: "shelter",
    label: "Shelter",
    name: "Westfield Transit Hall",
    position: [18.562, 73.831],
    severity: "Open",
    details: [
      { label: "Bed Capacity", value: "694 / 800 Free" },
      { label: "Rations Load", value: "96 Hours Secured" },
      { label: "Comm Tag", value: "Relay S-12" },
    ],
  },
  {
    id: "hospital-1",
    type: "hospital",
    label: "Hospital",
    name: "St. Helena Medical",
    position: [18.519, 73.893],
    severity: "Near Capacity",
    details: [
      { label: "Available Beds", value: "18 / 240 Free" },
      { label: "ICU Loading", value: "92% Capacity" },
      { label: "Route Command", value: "Divert Non-Critical" },
    ],
  },
  {
    id: "hospital-2",
    type: "hospital",
    label: "Hospital",
    name: "Regional Trauma Center",
    position: [18.554, 73.904],
    severity: "Operational",
    details: [
      { label: "Available Beds", value: "42 / 310 Free" },
      { label: "ICU Loading", value: "74% Capacity" },
      { label: "Route Command", value: "Receiving Patients" },
    ],
  },
  {
    id: "sos-1",
    type: "sos",
    label: "SOS Request",
    name: "Rescue Request #SR-1042",
    position: [18.536, 73.858],
    severity: "Urgent",
    details: [
      { label: "Targets", value: "5 Stranded Civilians" },
      { label: "Signal age", value: "120 sec ago" },
      { label: "Task Force", value: "Boat Squad 09 Active" },
    ],
  },
  {
    id: "sos-2",
    type: "sos",
    label: "SOS Request",
    name: "Medical Request #SR-1049",
    position: [18.497, 73.876],
    severity: "Critical",
    details: [
      { label: "Targets", value: "2 Injured Casualties" },
      { label: "Signal age", value: "48 sec ago" },
      { label: "Task Force", value: "Medic Unit 14 En-route" },
    ],
  },
];

const markerStyles = {
  flood: { className: "map-pin--flood", text: "FZ" },
  shelter: { className: "map-pin--shelter", text: "SH" },
  hospital: { className: "map-pin--hospital", text: "H" },
  sos: { className: "map-pin--sos", text: "SOS" },
};

const legend = [
  { type: "flood", label: "Flood zones" },
  { type: "shelter", label: "Shelters" },
  { type: "hospital", label: "Hospitals" },
  { type: "sos", label: "SOS requests" },
];

function createMapIcon(type) {
  const marker = markerStyles[type];

  return L.divIcon({
    className: "rescue-map-marker",
    html: `<span class="map-pin ${marker.className}">${marker.text}</span>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
}

const icons = {
  flood: createMapIcon("flood"),
  shelter: createMapIcon("shelter"),
  hospital: createMapIcon("hospital"),
  sos: createMapIcon("sos"),
};

function LocationPopup({ location }) {
  return (
    <div className="map-popup-content">
      <div className="map-popup-heading">
        <span className={`map-popup-type map-popup-type--${location.type} font-display tracking-wider text-[9px] font-bold`}>{location.label}</span>
        <span className="map-popup-status font-mono text-[9px] font-bold uppercase">{location.severity}</span>
      </div>
      <h3 className="font-display tracking-tight text-[13px] font-bold">{location.name}</h3>
      <dl>
        {location.details.map((detail) => (
          <div key={detail.label} className="border-t border-white/5 py-1.5">
            <dt className="text-slate-500 font-mono text-[9px] uppercase tracking-wider">{detail.label}</dt>
            <dd className="font-semibold text-slate-300 font-mono text-[11px] text-right">{detail.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function RescueMap() {
  return (
    <section className="glass overflow-hidden rounded-2xl tech-corners shadow-panel scan-effect">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 px-5 py-4 bg-surface-900/10">
        <div>
          <h2 className="text-[12px] font-extrabold text-white font-display tracking-wider uppercase">GEOSPATIAL INTELLIGENCE MAP</h2>
          <p className="mt-0.5 text-[11px] text-slate-500">Live geospatial telemetry and command division coordinate overlays</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="status-pill status-pill--live">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live tracking
          </span>
          <span className="hidden sm:block text-[10px] font-mono text-slate-500 uppercase">SYS TAG: SECTOR-04_GRID</span>
        </div>
      </div>

      <div className="relative h-[420px] sm:h-[480px]" style={{ background: "#05101c" }}>
        <MapContainer
          center={mapCenter}
          zoom={12}
          scrollWheelZoom
          className="rescue-map h-full w-full"
          attributionControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            subdomains="abcd"
          />
          {mapLocations.map((location) => (
            <Fragment key={location.id}>
              {location.type === "flood" && (
                <Circle
                  center={location.position}
                  radius={location.radius}
                  pathOptions={{
                    color: "#f43f5e",
                    fillColor: "#e11d48",
                    fillOpacity: 0.14,
                    weight: 1.5,
                    dashArray: "6 4",
                  }}
                />
              )}
              <Marker position={location.position} icon={icons[location.type]}>
                <Popup>
                  <LocationPopup location={location} />
                </Popup>
              </Marker>
            </Fragment>
          ))}
        </MapContainer>

        {/* Overlays */}
        <div className="pointer-events-none absolute bottom-4 left-4 right-4 z-[400] flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="pointer-events-auto rounded-xl border border-white/5 bg-surface-900/90 p-3.5 backdrop-blur-xl shadow-panel tech-corners">
            <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500 font-display">TELEM LAYERS</p>
            <div className="flex flex-wrap gap-3.5">
              {legend.map((item) => (
                <span key={item.type} className="flex items-center gap-2 text-[11px] text-slate-300 font-medium font-mono">
                  <span className={`legend-point legend-point--${item.type}`} />
                  {item.label}
                </span>
              ))}
            </div>
          </div>
          <div className="pointer-events-auto hidden rounded-xl border border-white/5 bg-surface-900/90 px-4 py-3 backdrop-blur-xl sm:block shadow-panel tech-corners tech-corners--safe">
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500 font-display">RADAR STATUS</p>
            <p className="mt-1 text-[11px] font-bold text-slate-300 font-mono tracking-tight uppercase">GPS SYNC ACTIVE · 12S</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default RescueMap;
