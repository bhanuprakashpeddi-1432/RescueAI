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
      { label: "Risk", value: "92% inundation probability" },
      { label: "Affected", value: "4,800 residents" },
      { label: "Action", value: "Evacuation underway" },
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
      { label: "Risk", value: "76% inundation probability" },
      { label: "Affected", value: "2,100 residents" },
      { label: "Action", value: "Routes restricted" },
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
      { label: "Beds free", value: "482 / 900" },
      { label: "Supplies", value: "72 hours secured" },
      { label: "Contact", value: "Unit S-04" },
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
      { label: "Beds free", value: "694 / 800" },
      { label: "Supplies", value: "96 hours secured" },
      { label: "Contact", value: "Unit S-12" },
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
      { label: "Available beds", value: "18 / 240" },
      { label: "ICU load", value: "92%" },
      { label: "Routing", value: "Divert non-critical" },
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
      { label: "Available beds", value: "42 / 310" },
      { label: "ICU load", value: "74%" },
      { label: "Routing", value: "Receiving patients" },
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
      { label: "People", value: "5 awaiting extraction" },
      { label: "Last ping", value: "2 min ago" },
      { label: "Response", value: "Boat unit dispatched" },
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
      { label: "People", value: "2 injured civilians" },
      { label: "Last ping", value: "48 sec ago" },
      { label: "Response", value: "Medic en route" },
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
        <span className={`map-popup-type map-popup-type--${location.type}`}>{location.label}</span>
        <span className="map-popup-status">{location.severity}</span>
      </div>
      <h3>{location.name}</h3>
      <dl>
        {location.details.map((detail) => (
          <div key={detail.label}>
            <dt>{detail.label}</dt>
            <dd>{detail.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function RescueMap() {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-800/90 bg-slate-900/60 shadow-panel">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 px-5 py-4">
        <div>
          <h2 className="font-semibold text-white">Incident Intelligence Map</h2>
          <p className="mt-1 text-xs text-slate-400">Live geospatial response tracking</p>
        </div>
        <span className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-300">
          <span className="live-dot h-2 w-2 rounded-full bg-emerald-400" />
          Live telemetry
        </span>
      </div>

      <div className="relative h-[420px] bg-[#08111d] sm:h-[470px]">
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
                    color: "#fb7185",
                    fillColor: "#e11d48",
                    fillOpacity: 0.14,
                    weight: 1.5,
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

        <div className="pointer-events-none absolute bottom-4 left-4 right-4 z-[400] flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="pointer-events-auto rounded-xl border border-slate-700/80 bg-slate-950/90 p-3 backdrop-blur-md">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Active Layers
            </p>
            <div className="flex flex-wrap gap-3">
              {legend.map((item) => (
                <span key={item.type} className="flex items-center gap-1.5 text-[11px] text-slate-300">
                  <span className={`legend-point legend-point--${item.type}`} />
                  {item.label}
                </span>
              ))}
            </div>
          </div>
          <div className="pointer-events-auto hidden rounded-xl border border-slate-700/80 bg-slate-950/90 px-3 py-2 backdrop-blur-md sm:block">
            <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Map Sync</p>
            <p className="mt-1 text-xs font-medium text-slate-200">Updated 12 sec ago</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default RescueMap;
