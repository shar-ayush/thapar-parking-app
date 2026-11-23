import type { Lot, VehicleKind } from "../../services/api";
import type { Ionicons } from "@expo/vector-icons";

export type { Lot, VehicleKind };

export const ZONES = ["All", "A", "B", "C", "D"] as const;
export type ZoneFilter = (typeof ZONES)[number];

export const KINDS: { key: VehicleKind; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: "CAR", label: "Car", icon: "car-sport" },
  { key: "BIKE", label: "Bike", icon: "bicycle" },
  { key: "SCOOTER", label: "Scooter", icon: "speedometer" },
];

export function kindIcon(kind?: string): keyof typeof Ionicons.glyphMap {
  return KINDS.find((k) => k.key === kind)?.icon ?? "car-sport";
}

export function kindLabel(kind?: string) {
  return KINDS.find((k) => k.key === kind)?.label ?? "Vehicle";
}

// Campus centre used as the default map view.
export const CAMPUS_CENTER = { lat: 30.3565, lng: 76.366 };

export function distanceM(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export const fmtDistance = (m: number) => (m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1)} km`);

export function availabilityTone(free: number, cap: number) {
  if (cap === 0) return "none" as const;
  if (free === 0) return "full" as const;
  if (free / cap < 0.15) return "low" as const;
  return "ok" as const;
}

export function filterLots(lots: Lot[], zone: ZoneFilter, query: string) {
  const q = query.trim().toLowerCase();
  return lots.filter(
    (l) =>
      (zone === "All" || l.zone === zone) &&
      (!q || l.name.toLowerCase().includes(q) || l.area.toLowerCase().includes(q))
  );
}

export const floorLabel = (f: string) => (/floor$/i.test(f) ? f : `${f} Floor`);
