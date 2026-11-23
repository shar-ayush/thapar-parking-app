import { Linking, Platform } from "react-native";

export function timeOf(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export function dateTimeOf(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const today = new Date();
  const sameDay = d.toDateString() === today.toDateString();
  const y = new Date(today);
  y.setDate(today.getDate() - 1);
  const day = sameDay ? "Today" : d.toDateString() === y.toDateString() ? "Yesterday" : d.toLocaleDateString([], { day: "numeric", month: "short" });
  return `${day}, ${timeOf(iso)}`;
}

export function durationSince(iso?: string | null, now = Date.now()) {
  if (!iso) return "";
  const mins = Math.max(0, Math.floor((now - new Date(iso).getTime()) / 60000));
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  return `${h} h ${mins % 60} min`;
}

export function countdown(iso: string | null | undefined, now: number) {
  if (!iso) return "";
  const s = Math.max(0, Math.floor((new Date(iso).getTime() - now) / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/** Opens turn-by-turn directions in Google Maps (or Apple Maps on iOS if Google isn't installed). */
export async function openDirections(lat: number, lng: number, kind?: string) {
  const mode = kind === "CAR" ? "driving" : "two_wheeler";
  const google = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=${mode}`;
  try {
    await Linking.openURL(google);
  } catch {
    if (Platform.OS === "ios") await Linking.openURL(`http://maps.apple.com/?daddr=${lat},${lng}`);
  }
}

export const prettyRole = (r?: string) => (r ? r[0] + r.slice(1).toLowerCase() : "");
