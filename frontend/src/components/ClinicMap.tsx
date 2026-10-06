import { useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Clinic } from "../lib/api";

const pin = (active: boolean) =>
  L.divIcon({
    className: "",
    iconSize: [36, 44],
    iconAnchor: [18, 44],
    popupAnchor: [0, -40],
    html: `<svg width="36" height="44" viewBox="0 0 36 44" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 0C8 0 0 8 0 18c0 13 18 26 18 26s18-13 18-26C36 8 28 0 18 0z" fill="${active ? "#18232b" : "#22769b"}"/>
      <circle cx="18" cy="17" r="7" fill="#fff"/></svg>`,
  });

function FitTo({ clinics, selected }: { clinics: Clinic[]; selected: Clinic | null }) {
  const map = useMap();
  useEffect(() => {
    if (selected) {
      map.flyTo([selected.lat, selected.lng], 14, { duration: 0.8 });
    } else if (clinics.length) {
      map.fitBounds(L.latLngBounds(clinics.map((c) => [c.lat, c.lng])), { padding: [40, 40], maxZoom: 13 });
    }
  }, [map, clinics, selected]);
  return null;
}

export default function ClinicMap({
  clinics,
  selected,
  onSelect,
}: {
  clinics: Clinic[];
  selected: Clinic | null;
  onSelect: (c: Clinic) => void;
}) {
  return (
    <MapContainer center={[40.2, -3.7]} zoom={6} scrollWheelZoom={false} className="size-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {clinics.map((c) => (
        <Marker key={c.id} position={[c.lat, c.lng]} icon={pin(selected?.id === c.id)} eventHandlers={{ click: () => onSelect(c) }}>
          <Popup>
            <strong>{c.name}</strong>
            <br />
            {c.address}, {c.city}
          </Popup>
        </Marker>
      ))}
      <FitTo clinics={clinics} selected={selected} />
    </MapContainer>
  );
}
