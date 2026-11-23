This file is a merged representation of a subset of the codebase, containing specifically included files, combined into a single document by Repomix.
The content has been processed where empty lines have been removed.

# File Summary

## Purpose
This file contains a packed representation of a subset of the repository's contents that is considered the most important context.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Only files matching these patterns are included: mobile
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Empty lines have been removed from all files
- Files are sorted by Git change count (files with more changes are at the bottom)

# Directory Structure
```
mobile/
  assets/
    expo.icon/
      Assets/
        expo-symbol 2.svg
        grid.png
      icon.json
    images/
      tabIcons/
        explore.png
        explore@2x.png
        explore@3x.png
        home.png
        home@2x.png
        home@3x.png
      android-icon-background.png
      android-icon-foreground.png
      android-icon-monochrome.png
      expo-badge-white.png
      expo-badge.png
      expo-logo.png
      favicon.png
      icon.png
      logo-glow.png
      react-logo.png
      react-logo@2x.png
      react-logo@3x.png
      splash-icon.png
      tutorial-web.png
  services/
    api.ts
  src/
    app/
      admin/
        _layout.tsx
        gate.tsx
        index.tsx
        inside.tsx
        profile.tsx
      guard/
        _layout.tsx
        index.tsx
        inside.tsx
        profile.tsx
      student/
        _layout.tsx
        index.tsx
        map.tsx
        profile.tsx
        select-space.tsx
        vehicles.tsx
      _layout.tsx
      connect.tsx
      index.tsx
      login.tsx
      signup.tsx
    components/
      AddVehicleSheet.tsx
      BookingCard.tsx
      FloatingTabBar.tsx
      GateConsole.tsx
      InsideList.tsx
      ProfileScreen.tsx
      ui.tsx
    context/
      AuthContext.tsx
    data/
      parking.ts
    hooks/
      useLive.ts
    lib/
      format.ts
    theme.ts
  AGENTS.md
  app.json
  CLAUDE.md
  eas.json
  expo-env.d.ts
  LICENSE
  package.json
  tsconfig.json
```

# Files

## File: mobile/assets/expo.icon/Assets/expo-symbol 2.svg
```xml
<svg width="652" height="606" viewBox="0 0 652 606" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M353.554 0H298.446C273.006 0 249.684 14.6347 237.962 37.9539L4.37994 502.646C-1.04325 513.435 -1.45067 526.178 3.2716 537.313L22.6123 582.918C34.6475 611.297 72.5404 614.156 88.4414 587.885L309.863 222.063C313.34 216.317 319.439 212.826 326 212.826C332.561 212.826 338.659 216.317 342.137 222.063L563.559 587.885C579.46 614.156 617.352 611.297 629.388 582.918L648.728 537.313C653.451 526.178 653.043 513.435 647.62 502.646L414.038 37.9539C402.316 14.6347 378.994 0 353.554 0Z" fill="white"/>
</svg>
```

## File: mobile/assets/expo.icon/icon.json
```json
{
  "fill" : {
    "automatic-gradient" : "extended-srgb:0.00000,0.47843,1.00000,1.00000"
  },
  "groups" : [
    {
      "layers" : [
        {
          "image-name" : "expo-symbol 2.svg",
          "name" : "expo-symbol 2",
          "position" : {
            "scale" : 1,
            "translation-in-points" : [
              1.1008400065293245e-05,
              -16.046875
            ]
          }
        },
        {
          "image-name" : "grid.png",
          "name" : "grid"
        }
      ],
      "shadow" : {
        "kind" : "neutral",
        "opacity" : 0.5
      },
      "translucency" : {
        "enabled" : true,
        "value" : 0.5
      }
    }
  ],
  "supported-platforms" : {
    "circles" : [
      "watchOS"
    ],
    "squares" : "shared"
  }
}
```

## File: mobile/services/api.ts
```typescript
import * as SecureStore from "expo-secure-store";
// The server URL is chosen at runtime on the "Connect to server" screen (e.g. an ngrok link)
// and stored on the device, so the APK never needs rebuilding when the link changes.
const URL_KEY = "api_url";
let API_URL = "";
export function getApiUrl() {
  return API_URL;
}
/** Clean up whatever the user pasted: add scheme, drop trailing slash and /api. */
export function normalizeServerUrl(input: string) {
  let u = input.trim().replace(/\s+/g, "");
  if (!u) return "";
  if (!/^https?:\/\//i.test(u)) {
    const local = /^(localhost|\d{1,3}(\.\d{1,3}){3})(:\d+)?(\/|$)/i.test(u);
    u = (local ? "http://" : "https://") + u;
  }
  return u.replace(/\/+$/, "").replace(/\/api$/i, "");
}
export async function loadApiUrl() {
  const saved = await SecureStore.getItemAsync(URL_KEY);
  API_URL = saved ?? "";
  return saved;
}
export async function saveApiUrl(url: string) {
  API_URL = normalizeServerUrl(url);
  await SecureStore.setItemAsync(URL_KEY, API_URL);
  return API_URL;
}
export async function clearApiUrl() {
  API_URL = "";
  await SecureStore.deleteItemAsync(URL_KEY);
}
/** Pings /api/dashboard/health/ and checks the reply really is our API. */
export async function testServer(raw: string): Promise<{ ok: boolean; message: string }> {
  const url = normalizeServerUrl(raw);
  if (!url) return { ok: false, message: "Paste your ngrok link first." };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch(`${url}/api/dashboard/health/`, {
      headers: { "ngrok-skip-browser-warning": "true", Accept: "application/json" },
      signal: controller.signal,
    });
    const text = await res.text();
    let data: any = null;
    try { data = JSON.parse(text); } catch {}
    if (data?.success) return { ok: true, message: data.message ?? "Connected" };
    if (res.status === 404 && /ngrok/i.test(text))
      return { ok: false, message: "ngrok tunnel is offline. Start ngrok and paste the new link." };
    if (res.status === 400 && /DisallowedHost|ALLOWED_HOSTS/i.test(text))
      return { ok: false, message: "Server reached, but Django blocked this host. Add the ngrok domain to ALLOWED_HOSTS." };
    if (res.status === 400)
      return { ok: false, message: "Server reached, but it rejected the request (400). Check ALLOWED_HOSTS in Django settings." };
    return { ok: false, message: `That link answered, but it isn't the Thapar Parking API (HTTP ${res.status}).` };
  } catch (e: any) {
    return {
      ok: false,
      message:
        e?.name === "AbortError"
          ? "Timed out. Is the backend running and ngrok started?"
          : "Can't reach that link. Check the URL and your internet connection.",
    };
  } finally {
    clearTimeout(timer);
  }
}
function readableError(data: any): string {
  if (!data) return "Something went wrong.";
  if (typeof data === "string") return data;
  const src = data.errors ?? data;
  if (typeof src === "string") return src;
  if (src.message || src.detail) return String(src.message ?? src.detail);
  const parts: string[] = [];
  for (const [field, msgs] of Object.entries(src)) {
    const text = Array.isArray(msgs) ? msgs.join(" ") : String(msgs);
    parts.push(field === "non_field_errors" ? text : `${field}: ${text}`);
  }
  return parts.join("\n") || "Something went wrong.";
}
// ---- Session tokens -------------------------------------------------------
const ACCESS = "access_token";
const REFRESH = "refresh_token";
async function saveTokens(access: string, refresh?: string) {
  await SecureStore.setItemAsync(ACCESS, access);
  if (refresh) await SecureStore.setItemAsync(REFRESH, refresh);
}
export async function clearTokens() {
  await SecureStore.deleteItemAsync(ACCESS);
  await SecureStore.deleteItemAsync(REFRESH);
}
// AuthContext registers here so an expired session sends the user back to login.
let sessionExpiredHandler: (() => void) | null = null;
export function onSessionExpired(fn: (() => void) | null) {
  sessionExpiredHandler = fn;
}
export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}
// Only one refresh at a time, even if several requests hit 401 together.
let refreshing: Promise<string | null> | null = null;
async function refreshAccessToken(): Promise<string | null> {
  if (refreshing) return refreshing;
  refreshing = (async () => {
    const refresh = await SecureStore.getItemAsync(REFRESH);
    if (!refresh || !API_URL) return null;
    try {
      const res = await fetch(`${API_URL}/api/auth/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
        body: JSON.stringify({ refresh }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      await saveTokens(data.access);
      return data.access as string;
    } catch {
      return null;
    }
  })();
  try {
    return await refreshing;
  } finally {
    refreshing = null;
  }
}
async function send(endpoint: string, options: RequestInit, token: string | null) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    "ngrok-skip-browser-warning": "true",
    ...((options.headers as Record<string, string>) || {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    return await fetch(`${API_URL}${endpoint}`, { ...options, headers, signal: controller.signal });
  } catch (e: any) {
    throw new ApiError(
      e?.name === "AbortError"
        ? "The server is taking too long to reply. Try again."
        : "Can't reach the server. Check your internet and the server link.",
      0
    );
  } finally {
    clearTimeout(timer);
  }
}
export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  if (!API_URL) {
    throw new ApiError("No server selected. Open Connect to server and paste your link.", 0);
  }
  let token = await SecureStore.getItemAsync(ACCESS);
  let response = await send(endpoint, options, token);
  // Access token expired: refresh once and retry.
  if (response.status === 401 && token && !endpoint.startsWith("/api/auth/login")) {
    token = await refreshAccessToken();
    if (!token) {
      await clearTokens();
      sessionExpiredHandler?.();
      throw new ApiError("Your session expired. Please sign in again.", 401);
    }
    response = await send(endpoint, options, token);
  }
  const text = await response.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    throw new ApiError(
      /ngrok/i.test(text)
        ? "ngrok tunnel is offline or the link changed. Update it on the Connect screen."
        : `Unexpected reply from server (HTTP ${response.status}).`,
      response.status
    );
  }
  if (!response.ok) {
    throw new ApiError(readableError(data), response.status);
  }
  return data;
}
export function errorMessage(e: unknown) {
  return e instanceof Error ? e.message : "Something went wrong.";
}
export async function login(
  email: string,
  password: string
) {
  const data = await apiRequest("/api/auth/login/", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
    }),
  });
  await saveTokens(data.access, data.refresh);
  return data;
}
export async function register(
  email: string,
  password: string,
  name: string,
  phone: string,
  role: string
) {
  const data = await apiRequest("/api/auth/register/", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
      name,
      phone,
      role,
    }),
  });
  await saveTokens(data.access, data.refresh);
  return data;
}
export async function getMe() {
  return apiRequest("/api/auth/me/");
}
export async function logout() {
  const refreshToken = await SecureStore.getItemAsync(REFRESH);
  try {
    if (refreshToken) {
      await apiRequest("/api/auth/logout/", {
        method: "POST",
        body: JSON.stringify({ refresh: refreshToken }),
      });
    }
  } finally {
    await clearTokens();
  }
}
export async function updateMe(patch: { name?: string; phone?: string }) {
  return apiRequest("/api/auth/me/", { method: "PATCH", body: JSON.stringify(patch) });
}
export async function changePassword(current_password: string, new_password: string) {
  return apiRequest("/api/auth/password/", {
    method: "POST",
    body: JSON.stringify({ current_password, new_password }),
  });
}
export async function healthCheck() {
  return apiRequest("/api/dashboard/health/");
}
export async function getVehicles(): Promise<Vehicle[]> {
  return apiRequest("/api/vehicles/");
}
export async function addVehicle(vehicle: {
  plate_number: string;
  vehicle_type: string;
  make: string;
  model: string;
  color: string;
}) {
  return apiRequest("/api/vehicles/", {
    method: "POST",
    body: JSON.stringify(vehicle),
  });
}
export async function updateVehicle(
  id: number,
  vehicle: {
    plate_number?: string;
    vehicle_type?: string;
    make?: string;
    model?: string;
    color?: string;
  }
) {
  return apiRequest(`/api/vehicles/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(vehicle),
  });
}
export async function deleteVehicle(id: number) {
  return apiRequest(`/api/vehicles/${id}/`, {
    method: "DELETE",
  });
}
// ---- Types shared by screens ----------------------------------------------
export type VehicleKind = "CAR" | "BIKE" | "SCOOTER";
export type Vehicle = {
  id: number;
  plate_number: string;
  vehicle_type: VehicleKind;
  make: string;
  model: string;
  color: string;
};
export type Lot = {
  id: string;
  name: string;
  zone: "A" | "B" | "C" | "D";
  area: string;
  lat: number;
  lng: number;
  floors: string[];
  capacity: Record<VehicleKind, number>;
  free: Record<VehicleKind, number>;
};
export type Slot = {
  id: number;
  number: number;
  label: string;
  floor: string;
  occupied: boolean;
  blocked: boolean;
  mine: boolean;
};
export type BookingStatus = "RESERVED" | "ACTIVE" | "COMPLETED" | "CANCELLED" | "EXPIRED";
export type Booking = {
  id: number;
  status: BookingStatus;
  plate_number: string;
  vehicle_type: VehicleKind;
  is_walk_in: boolean;
  lot: Pick<Lot, "id" | "name" | "zone" | "area" | "lat" | "lng">;
  floor: string;
  slot_label: string;
  slot_number: number;
  user: { name: string; email: string; phone: string; role: string } | null;
  created_at: string;
  expires_at: string | null;
  checked_in_at: string | null;
  checked_out_at: string | null;
};
// ---- Parking & bookings -----------------------------------------------------
export async function getLots(): Promise<Lot[]> {
  return apiRequest("/api/parking/lots/");
}
export async function getLot(id: string): Promise<Lot> {
  return apiRequest(`/api/parking/lots/${encodeURIComponent(id)}/`);
}
export async function getSlots(lotId: string, floor: string, type: VehicleKind): Promise<{ slots: Slot[] }> {
  const q = `floor=${encodeURIComponent(floor)}&type=${type}`;
  return apiRequest(`/api/parking/lots/${encodeURIComponent(lotId)}/slots/?${q}`);
}
export async function createBooking(slot_id: number, vehicle_id: number): Promise<Booking> {
  return apiRequest("/api/bookings/", { method: "POST", body: JSON.stringify({ slot_id, vehicle_id }) });
}
export async function getCurrentBookings(): Promise<Booking[]> {
  return apiRequest("/api/bookings/current/");
}
export async function getBookings(): Promise<Booking[]> {
  return apiRequest("/api/bookings/");
}
export async function cancelBooking(id: number): Promise<Booking> {
  return apiRequest(`/api/bookings/${id}/cancel/`, { method: "POST" });
}
// ---- Gate (guards) ----------------------------------------------------------
export type PlateLookup = {
  plate_number: string;
  vehicle: {
    plate_number: string;
    vehicle_type: VehicleKind;
    description: string;
    owner: { name: string; email: string; phone: string; role: string };
  } | null;
  booking: Booking | null;
};
export type GateEvent = {
  id: number;
  kind: "ENTRY" | "EXIT";
  plate_number: string;
  lot: string;
  slot_label: string;
  floor: string;
  created_at: string;
};
export async function lookupPlate(plate: string): Promise<PlateLookup> {
  return apiRequest(`/api/gate/lookup/?plate=${encodeURIComponent(plate)}`);
}
export async function checkIn(plate: string, lot?: string, vehicle_type?: VehicleKind): Promise<{ message: string; booking: Booking }> {
  return apiRequest("/api/gate/check-in/", { method: "POST", body: JSON.stringify({ plate, lot, vehicle_type }) });
}
export async function checkOut(plate: string): Promise<{ message: string; booking: Booking }> {
  return apiRequest("/api/gate/check-out/", { method: "POST", body: JSON.stringify({ plate }) });
}
export async function getGateEvents(): Promise<GateEvent[]> {
  return apiRequest("/api/gate/events/");
}
export async function getInside(): Promise<Booking[]> {
  return apiRequest("/api/gate/inside/");
}
// ---- Admin ------------------------------------------------------------------
export type LotStats = {
  id: string;
  name: string;
  zone: string;
  capacity: number;
  free: number;
  parked: number;
  reserved: number;
  by_type: Record<VehicleKind, { capacity: number; free: number }>;
};
export type Stats = {
  capacity: number;
  free: number;
  parked: number;
  reserved: number;
  entries_today: number;
  exits_today: number;
  bookings_today: number;
  walk_ins_today: number;
  users: Record<string, number>;
  vehicles: number;
  lots: LotStats[];
  entries_by_hour: { hour: string; entries: number }[];
};
export async function getStats(): Promise<Stats> {
  return apiRequest("/api/dashboard/stats/");
}
```

## File: mobile/src/app/admin/_layout.tsx
```typescript
import { Tabs } from "expo-router/js-tabs";
import { makeTabBar } from "../../components/FloatingTabBar";
const TabBar = makeTabBar({
  index: { label: "Overview", icon: "stats-chart" },
  gate: { label: "Gate", icon: "scan" },
  inside: { label: "Inside", icon: "car" },
  profile: { label: "Profile", icon: "person" },
});
export default function AdminLayout() {
  return (
    <Tabs tabBar={(p) => <TabBar {...p} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="gate" />
      <Tabs.Screen name="inside" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
```

## File: mobile/src/app/admin/gate.tsx
```typescript
import { GateConsole } from "../../components/GateConsole";
export default function AdminGate() {
  return <GateConsole />;
}
```

## File: mobile/src/app/admin/index.tsx
```typescript
import { Linking, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { Stats, getApiUrl, getStats } from "../../../services/api";
import { useAuth } from "../../context/AuthContext";
import { Banner } from "../../components/ui";
import { KINDS } from "../../data/parking";
import { useLive } from "../../hooks/useLive";
import { prettyRole } from "../../lib/format";
import { colors, radius, shadow } from "../../theme";
function Tile({ label, value, accent }: { label: string; value: number | string; accent?: boolean }) {
  return (
    <View style={[s.tile, shadow, accent && { backgroundColor: colors.blue }]}>
      <Text style={[s.tileValue, accent && { color: colors.white }]}>{value}</Text>
      <Text style={[s.tileLabel, accent && { color: "#C9D6F5" }]}>{label}</Text>
    </View>
  );
}
function Bar({ used, total, color = colors.blue }: { used: number; total: number; color?: string }) {
  return (
    <View style={s.track}>
      <View style={[s.fill, { width: `${total ? Math.min(100, (used / total) * 100) : 0}%`, backgroundColor: color }]} />
    </View>
  );
}
export default function AdminOverview() {
  const { user } = useAuth();
  const { data, error, refreshing, refresh, reload } = useLive<Stats>(getStats, 30000);
  const occupied = data ? data.capacity - data.free : 0;
  const pct = data && data.capacity ? Math.round((occupied / data.capacity) * 100) : 0;
  const maxHour = Math.max(1, ...(data?.entries_by_hour.map((h) => h.entries) ?? [1]));
  return (
    <SafeAreaView style={s.root} edges={["top"]}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.blue} />}
      >
        <Text style={s.small}>Admin · {user?.name}</Text>
        <Text style={s.title}>Campus overview</Text>
        {error && (
          <View style={{ marginTop: 14 }}>
            <Banner text={error} action="Retry" onAction={reload} />
          </View>
        )}
        {/* Occupancy hero */}
        <View style={s.hero}>
          <Text style={s.heroLabel}>Occupancy right now</Text>
          <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
            <Text style={s.heroNumber}>{data ? `${pct}%` : "–"}</Text>
            <Text style={s.heroOf}>  {occupied} / {data?.capacity ?? 0} slots</Text>
          </View>
          <View style={s.heroTrack}>
            <View style={[s.heroFill, { width: `${pct}%`, backgroundColor: pct > 85 ? colors.red : colors.blue }]} />
          </View>
        </View>
        <View style={s.tiles}>
          <Tile label="Parked" value={data?.parked ?? "–"} accent />
          <Tile label="Reserved" value={data?.reserved ?? "–"} />
          <Tile label="Free" value={data?.free ?? "–"} />
        </View>
        <View style={s.tiles}>
          <Tile label="Entries today" value={data?.entries_today ?? "–"} />
          <Tile label="Exits today" value={data?.exits_today ?? "–"} />
          <Tile label="Walk-ins" value={data?.walk_ins_today ?? "–"} />
        </View>
        {/* Entries per hour */}
        <Text style={s.section}>Entries, last 12 hours</Text>
        <View style={[s.card, shadow]}>
          <View style={s.chart}>
            {(data?.entries_by_hour ?? []).map((h) => (
              <View key={h.hour} style={s.chartCol}>
                <Text style={s.chartVal}>{h.entries || ""}</Text>
                <View style={[s.chartBar, { height: Math.max(3, (h.entries / maxHour) * 90), backgroundColor: h.entries ? colors.blue : colors.line }]} />
                <Text style={s.chartLabel}>{h.hour.slice(0, 2)}</Text>
              </View>
            ))}
          </View>
        </View>
        {/* Per lot */}
        <Text style={s.section}>Lots</Text>
        <View style={{ gap: 12 }}>
          {data?.lots.map((l) => {
            const used = l.capacity - l.free;
            const full = l.capacity > 0 && used / l.capacity > 0.85;
            return (
              <View key={l.id} style={[s.card, shadow]}>
                <View style={s.lotHead}>
                  <View style={s.zone}><Text style={s.zoneText}>{l.zone}</Text></View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.lotName}>{l.name}</Text>
                    <Text style={s.lotMeta}>{l.parked} parked · {l.reserved} reserved · {l.free} free</Text>
                  </View>
                  <Text style={[s.lotPct, full && { color: colors.red }]}>
                    {l.capacity ? Math.round((used / l.capacity) * 100) : 0}%
                  </Text>
                </View>
                <Bar used={used} total={l.capacity} color={full ? colors.red : colors.blue} />
                <View style={s.typeRow}>
                  {KINDS.map((k) => {
                    const t = l.by_type[k.key];
                    return (
                      <View key={k.key} style={s.typeCell}>
                        <Ionicons name={k.icon} size={14} color={colors.muted} />
                        <Text style={s.typeText}>
                          {t.capacity - t.free}/{t.capacity}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            );
          })}
        </View>
        {/* People */}
        <Text style={s.section}>Accounts</Text>
        <View style={[s.card, shadow, s.people]}>
          {data &&
            Object.entries(data.users).map(([role, n]) => (
              <View key={role} style={s.person}>
                <Text style={s.personN}>{n}</Text>
                <Text style={s.personRole}>{prettyRole(role)}</Text>
              </View>
            ))}
          {data && (
            <View style={s.person}>
              <Text style={s.personN}>{data.vehicles}</Text>
              <Text style={s.personRole}>Vehicles</Text>
            </View>
          )}
        </View>
        <Pressable onPress={() => Linking.openURL(`${getApiUrl()}/admin/`)} style={[s.link, shadow]}>
          <View style={s.linkIcon}>
            <Ionicons name="construct-outline" size={20} color={colors.white} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.linkTitle}>Manage in Django admin</Text>
            <Text style={s.linkText}>Add guards, edit lots, block slots, see every booking.</Text>
          </View>
          <Ionicons name="open-outline" size={18} color={colors.muted} />
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingBottom: 140 },
  small: { fontSize: 14, color: colors.muted },
  title: { fontSize: 28, fontWeight: "800", color: colors.ink, letterSpacing: -0.5 },
  hero: { marginTop: 18, backgroundColor: colors.ink, borderRadius: radius.xl, padding: 22 },
  heroLabel: { color: colors.faint, fontSize: 14 },
  heroNumber: { color: colors.white, fontSize: 52, fontWeight: "800", letterSpacing: -2 },
  heroOf: { color: "#6B7280", fontSize: 15, fontWeight: "700", marginBottom: 12 },
  heroTrack: { height: 8, borderRadius: 4, backgroundColor: "#26272B", marginTop: 8, overflow: "hidden" },
  heroFill: { height: 8, borderRadius: 4 },
  tiles: { flexDirection: "row", gap: 10, marginTop: 12 },
  tile: { flex: 1, backgroundColor: colors.white, borderRadius: radius.lg, padding: 14 },
  tileValue: { fontSize: 24, fontWeight: "800", color: colors.ink, letterSpacing: -0.5 },
  tileLabel: { fontSize: 12, color: colors.muted, fontWeight: "600", marginTop: 2 },
  section: { fontSize: 13, fontWeight: "800", color: colors.muted, letterSpacing: 0.6, textTransform: "uppercase", marginTop: 26, marginBottom: 10 },
  card: { backgroundColor: colors.white, borderRadius: radius.xl, padding: 16 },
  chart: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", height: 130 },
  chartCol: { flex: 1, alignItems: "center", justifyContent: "flex-end" },
  chartVal: { fontSize: 10, fontWeight: "800", color: colors.ink, marginBottom: 3 },
  chartBar: { width: 12, borderRadius: 4 },
  chartLabel: { fontSize: 10, color: colors.muted, marginTop: 6 },
  lotHead: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  zone: { width: 40, height: 40, borderRadius: radius.sm, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center" },
  zoneText: { fontSize: 18, fontWeight: "800", color: colors.ink },
  lotName: { fontSize: 16, fontWeight: "800", color: colors.ink },
  lotMeta: { fontSize: 12, color: colors.muted, marginTop: 2 },
  lotPct: { fontSize: 18, fontWeight: "800", color: colors.blue },
  track: { height: 6, borderRadius: 3, backgroundColor: colors.bg, overflow: "hidden" },
  fill: { height: 6, borderRadius: 3 },
  typeRow: { flexDirection: "row", marginTop: 12 },
  typeCell: { flex: 1, flexDirection: "row", alignItems: "center", gap: 6 },
  typeText: { fontSize: 13, fontWeight: "700", color: colors.ink },
  people: { flexDirection: "row", flexWrap: "wrap", rowGap: 14 },
  person: { width: "33.3%" },
  personN: { fontSize: 22, fontWeight: "800", color: colors.ink },
  personRole: { fontSize: 12, color: colors.muted, fontWeight: "600" },
  link: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: colors.white, borderRadius: radius.xl, padding: 16, marginTop: 20 },
  linkIcon: { width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.ink, alignItems: "center", justifyContent: "center" },
  linkTitle: { fontSize: 16, fontWeight: "800", color: colors.ink },
  linkText: { fontSize: 13, color: colors.muted, marginTop: 2 },
});
```

## File: mobile/src/app/admin/inside.tsx
```typescript
import { InsideList } from "../../components/InsideList";
export default function AdminInside() {
  return <InsideList />;
}
```

## File: mobile/src/app/admin/profile.tsx
```typescript
import { ProfileScreen } from "../../components/ProfileScreen";
export default function AdminProfile() {
  return <ProfileScreen showHistory={false} />;
}
```

## File: mobile/src/app/guard/_layout.tsx
```typescript
import { Tabs } from "expo-router/js-tabs";
import { makeTabBar } from "../../components/FloatingTabBar";
const TabBar = makeTabBar({
  index: { label: "Gate", icon: "scan" },
  inside: { label: "Inside", icon: "car" },
  profile: { label: "Profile", icon: "person" },
});
export default function GuardLayout() {
  return (
    <Tabs tabBar={(p) => <TabBar {...p} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="inside" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
```

## File: mobile/src/app/guard/index.tsx
```typescript
import { GateConsole } from "../../components/GateConsole";
export default function GuardGate() {
  return <GateConsole />;
}
```

## File: mobile/src/app/guard/inside.tsx
```typescript
import { InsideList } from "../../components/InsideList";
export default function GuardInside() {
  return <InsideList />;
}
```

## File: mobile/src/app/guard/profile.tsx
```typescript
import { ProfileScreen } from "../../components/ProfileScreen";
export default function GuardProfile() {
  return <ProfileScreen showHistory={false} />;
}
```

## File: mobile/src/app/student/_layout.tsx
```typescript
import { Tabs } from "expo-router/js-tabs";
import { makeTabBar } from "../../components/FloatingTabBar";
const TabBar = makeTabBar({
  index: { label: "Home", icon: "home" },
  map: { label: "Map", icon: "map" },
  vehicles: { label: "Vehicles", icon: "car-sport" },
  profile: { label: "Profile", icon: "person" },
});
// Shared by every role that parks: students, faculty, visitors and vendors.
export default function DriverLayout() {
  return (
    <Tabs tabBar={(p) => <TabBar {...p} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="map" />
      <Tabs.Screen name="vehicles" />
      <Tabs.Screen name="profile" />
      <Tabs.Screen name="select-space" options={{ href: null }} />
    </Tabs>
  );
}
```

## File: mobile/src/app/student/index.tsx
```typescript
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { Booking, Lot, Vehicle, getCurrentBookings, getLots, getVehicles } from "../../../services/api";
import { Banner, Chip, SectionHeader } from "../../components/ui";
import { BookingCard } from "../../components/BookingCard";
import { AddVehicleSheet } from "../../components/AddVehicleSheet";
import {
  KINDS,
  ZONES,
  ZoneFilter,
  VehicleKind,
  availabilityTone,
  distanceM,
  filterLots,
  fmtDistance,
} from "../../data/parking";
import { useLive, useMyLocation } from "../../hooks/useLive";
import { colors, radius, shadow } from "../../theme";
type HomeData = { lots: Lot[]; bookings: Booking[]; vehicles: Vehicle[] };
function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}
export default function StudentHome() {
  const { user } = useAuth();
  const [addOpen, setAddOpen] = useState(false);
  const [kind, setKind] = useState<VehicleKind | null>(null);
  const [zone, setZone] = useState<ZoneFilter>("All");
  const [query, setQuery] = useState("");
  const me = useMyLocation(false);
  const fetchAll = useCallback(async (): Promise<HomeData> => {
    const [lots, bookings, vehicles] = await Promise.all([getLots(), getCurrentBookings(), getVehicles()]);
    return { lots, bookings, vehicles };
  }, []);
  const { data, error, loading, refreshing, refresh, reload } = useLive(fetchAll, 20000);
  const lotsAll = data?.lots ?? [];
  const vehicles = data?.vehicles ?? [];
  const bookings = data?.bookings ?? [];
  // Default the vehicle type to the user's first registered vehicle.
  useEffect(() => {
    if (kind == null && vehicles.length) setKind(vehicles[0].vehicle_type);
  }, [vehicles, kind]);
  const activeKind: VehicleKind = kind ?? "CAR";
  const lots = useMemo(() => {
    const list = filterLots(lotsAll, zone, query);
    if (!me) return list;
    return [...list].sort((a, b) => distanceM(me, a) - distanceM(me, b));
  }, [lotsAll, zone, query, me]);
  const totalFree = lotsAll.reduce((n, l) => n + l.free[activeKind], 0);
  const totalCap = lotsAll.reduce((n, l) => n + l.capacity[activeKind], 0);
  const firstName = (user?.name || "there").split(" ")[0];
  const hasVehicleOfKind = vehicles.some((v) => v.vehicle_type === activeKind);
  function openLot(lot: Lot) {
    router.push({ pathname: "/student/select-space", params: { lotId: lot.id, kind: activeKind } } as never);
  }
  return (
    <SafeAreaView style={s.root} edges={["top"]}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.blue} />}
      >
        {/* Header */}
        <View style={s.header}>
          <Pressable onPress={() => router.push("/student/profile" as never)} style={s.avatar}>
            <Text style={s.avatarText}>{firstName[0]?.toUpperCase()}</Text>
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={s.sub}>{greeting()}</Text>
            <Text style={s.hello} numberOfLines={1}>{firstName}</Text>
          </View>
        </View>
        {error && !data && <Banner text={error} action="Retry" onAction={reload} />}
        {error && data && (
          <View style={{ marginBottom: 14 }}>
            <Banner text="Showing last known availability — can't reach the server." action="Retry" onAction={reload} />
          </View>
        )}
        {/* Current booking(s) */}
        {bookings.map((b) => (
          <View key={b.id} style={{ marginBottom: 18 }}>
            <BookingCard booking={b} onChanged={reload} />
          </View>
        ))}
        {/* No vehicle yet */}
        {data && vehicles.length === 0 && (
          <Pressable onPress={() => setAddOpen(true)} style={[s.addVehicle, { marginBottom: 18 }]}>
            <Ionicons name="add-circle" size={26} color={colors.blue} />
            <View style={{ flex: 1 }}>
              <Text style={s.addVehicleTitle}>Add your vehicle</Text>
              <Text style={s.addVehicleText}>You need a registered vehicle to reserve a slot.</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.blue} />
          </Pressable>
        )}
        {/* Search */}
        <View style={[s.search, shadow]}>
          <Ionicons name="search" size={20} color={colors.muted} />
          <TextInput
            style={s.searchInput}
            placeholder="Search parking lots"
            placeholderTextColor={colors.faint}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery("")} hitSlop={10}>
              <Ionicons name="close-circle" size={20} color={colors.faint} />
            </Pressable>
          )}
        </View>
        {/* Vehicle type */}
        <View style={s.kindRow}>
          {KINDS.map((k) => {
            const active = activeKind === k.key;
            return (
              <Pressable key={k.key} onPress={() => setKind(k.key)} style={[s.kind, active ? s.kindActive : s.kindIdle]}>
                <Ionicons name={k.icon} size={26} color={active ? colors.white : colors.ink} />
                <Text style={[s.kindLabel, active && { color: colors.white }]}>{k.label}</Text>
              </Pressable>
            );
          })}
        </View>
        {/* Live availability */}
        <View style={s.hero}>
          <View style={s.livePill}>
            <View style={[s.liveDot, error && { backgroundColor: colors.red }]} />
            <Text style={s.liveText}>{error ? "OFFLINE" : "LIVE"}</Text>
          </View>
          <Text style={s.heroLabel}>
            Free {KINDS.find((k) => k.key === activeKind)!.label.toLowerCase()} spaces on campus
          </Text>
          <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
            <Text style={s.heroNumber}>{loading && !data ? "–" : totalFree}</Text>
            <Text style={s.heroOf}> / {totalCap}</Text>
          </View>
          <View style={s.track}>
            <View style={[s.fill, { width: `${totalCap ? (totalFree / totalCap) * 100 : 0}%` }]} />
          </View>
        </View>
        {/* Find parking on the map */}
        <Pressable onPress={() => router.push("/student/map" as never)} style={[s.find, shadow]}>
          <View style={s.findIcon}>
            <Ionicons name="navigate" size={24} color={colors.white} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.findTitle}>Find Parking</Text>
            <Text style={s.findText}>See every lot on the campus map and get directions.</Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color={colors.muted} />
        </Pressable>
        {/* Lots */}
        <SectionHeader title={me ? "Nearest to you" : "Parking lots"} />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginHorizontal: -20 }}
          contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 4 }}
        >
          {ZONES.map((z) => (
            <Chip key={z} label={z === "All" ? "All" : `Zone ${z}`} active={zone === z} onPress={() => setZone(z)} />
          ))}
        </ScrollView>
        {data && !hasVehicleOfKind && vehicles.length > 0 && (
          <View style={{ marginTop: 14 }}>
            <Banner
              tone="blue"
              text={`You have no ${activeKind.toLowerCase()} registered — add one to book these slots.`}
              action="Add"
              onAction={() => setAddOpen(true)}
            />
          </View>
        )}
        <View style={{ marginTop: 16, gap: 14 }}>
          {loading && !data &&
            [0, 1, 2].map((i) => <View key={i} style={[s.lot, s.skeleton]} />)}
          {data && lots.length === 0 && (
            <View style={[s.empty, shadow]}>
              <Ionicons name="search-outline" size={28} color={colors.faint} />
              <Text style={s.emptyText}>No parking lots match your search.</Text>
            </View>
          )}
          {lots.map((lot) => {
            const free = lot.free[activeKind];
            const cap = lot.capacity[activeKind];
            const tone = availabilityTone(free, cap);
            const bad = tone !== "ok";
            const disabled = tone === "full" || tone === "none";
            const ratio = cap ? free / cap : 0;
            return (
              <Pressable
                key={lot.id}
                onPress={() => !disabled && openLot(lot)}
                style={({ pressed }) => [s.lot, shadow, disabled && { opacity: 0.7 }, pressed && !disabled && { opacity: 0.85 }]}
              >
                <View style={s.lotBadge}>
                  <Text style={s.lotZone}>{lot.zone}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.lotName} numberOfLines={1}>{lot.name}</Text>
                  <View style={s.metaRow}>
                    <Ionicons name="location-outline" size={14} color={colors.muted} />
                    <Text style={s.meta} numberOfLines={1}>
                      {lot.area}
                      {me ? ` · ${fmtDistance(distanceM(me, lot))}` : ""}
                    </Text>
                  </View>
                  <View style={s.lotBottom}>
                    <View style={[s.status, bad ? s.statusRed : s.statusBlue]}>
                      <Text style={[s.statusText, { color: bad ? colors.red : colors.blue }]}>
                        {tone === "none" ? `No ${activeKind.toLowerCase()} slots` : tone === "full" ? "Full" : tone === "low" ? `Only ${free} left` : `${free} free`}
                      </Text>
                    </View>
                    <View style={s.miniTrack}>
                      <View style={[s.miniFill, { width: `${ratio * 100}%`, backgroundColor: bad ? colors.red : colors.blue }]} />
                    </View>
                  </View>
                </View>
                <View style={[s.go, disabled && { backgroundColor: colors.line }]}>
                  <Ionicons
                    name="arrow-forward"
                    size={20}
                    color={disabled ? colors.faint : colors.white}
                    style={{ transform: [{ rotate: "-45deg" }] }}
                  />
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
      <AddVehicleSheet visible={addOpen} onClose={() => setAddOpen(false)} onSaved={reload} defaultType={activeKind} />
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingBottom: 140 },
  header: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 20 },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: colors.ink, alignItems: "center", justifyContent: "center" },
  avatarText: { color: colors.white, fontSize: 20, fontWeight: "800" },
  hello: { fontSize: 22, fontWeight: "800", color: colors.ink, letterSpacing: -0.4 },
  sub: { fontSize: 14, color: colors.muted },
  search: { flexDirection: "row", alignItems: "center", gap: 10, height: 54, borderRadius: radius.lg, paddingHorizontal: 16, backgroundColor: colors.white },
  searchInput: { flex: 1, fontSize: 16, color: colors.ink },
  kindRow: { flexDirection: "row", gap: 12, marginTop: 18 },
  kind: { flex: 1, height: 96, borderRadius: radius.xl, alignItems: "center", justifyContent: "center", gap: 8 },
  kindActive: { backgroundColor: colors.ink },
  kindIdle: { backgroundColor: colors.white, ...(shadow as object) },
  kindLabel: { fontSize: 15, fontWeight: "700", color: colors.ink },
  hero: { marginTop: 18, backgroundColor: colors.ink, borderRadius: radius.xl, padding: 22 },
  livePill: { flexDirection: "row", alignItems: "center", alignSelf: "flex-start", backgroundColor: "rgba(31,111,235,0.2)", paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.pill, gap: 6, marginBottom: 14 },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.blue },
  liveText: { color: "#7FB0FF", fontSize: 11, fontWeight: "800", letterSpacing: 1 },
  heroLabel: { color: "#A3A8B3", fontSize: 14 },
  heroNumber: { color: colors.white, fontSize: 56, fontWeight: "800", letterSpacing: -2 },
  heroOf: { color: "#6B7280", fontSize: 22, fontWeight: "700", marginBottom: 10 },
  track: { height: 8, borderRadius: 4, backgroundColor: "#26272B", marginTop: 8, overflow: "hidden" },
  fill: { height: 8, borderRadius: 4, backgroundColor: colors.blue },
  lot: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: colors.white, borderRadius: radius.xl, padding: 14 },
  skeleton: { height: 92, opacity: 0.6 },
  lotBadge: { width: 64, height: 64, borderRadius: radius.lg, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center" },
  lotZone: { fontSize: 28, fontWeight: "800", color: colors.ink },
  lotName: { fontSize: 17, fontWeight: "800", color: colors.ink, letterSpacing: -0.2 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 3 },
  meta: { fontSize: 13, color: colors.muted, flexShrink: 1 },
  lotBottom: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 10 },
  status: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill },
  statusBlue: { backgroundColor: colors.blueSoft },
  statusRed: { backgroundColor: colors.redSoft },
  statusText: { fontSize: 12, fontWeight: "800" },
  miniTrack: { flex: 1, height: 5, borderRadius: 3, backgroundColor: colors.bg, overflow: "hidden" },
  miniFill: { height: 5, borderRadius: 3 },
  go: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.ink, alignItems: "center", justifyContent: "center" },
  empty: { backgroundColor: colors.white, borderRadius: radius.xl, padding: 30, alignItems: "center", gap: 10 },
  emptyText: { color: colors.muted, fontSize: 15 },
  find: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: colors.white, borderRadius: radius.xl, padding: 16, marginTop: 18 },
  findIcon: { width: 52, height: 52, borderRadius: radius.lg, backgroundColor: colors.blue, alignItems: "center", justifyContent: "center" },
  findTitle: { fontSize: 17, fontWeight: "800", color: colors.ink },
  findText: { fontSize: 13, color: colors.muted, marginTop: 3, lineHeight: 18 },
  addVehicle: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: colors.blueSoft, padding: 16, borderRadius: radius.lg },
  addVehicleTitle: { color: colors.blue, fontWeight: "800", fontSize: 15 },
  addVehicleText: { color: colors.blue, fontSize: 13, marginTop: 2, opacity: 0.85 },
});
```

## File: mobile/src/app/student/map.tsx
```typescript
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import { getLots, getVehicles, Lot } from "../../../services/api";
import { Button, Chip } from "../../components/ui";
import {
  CAMPUS_CENTER,
  ZONES,
  ZoneFilter,
  VehicleKind,
  availabilityTone,
  distanceM,
  filterLots,
  fmtDistance,
} from "../../data/parking";
import { useLive, useMyLocation } from "../../hooks/useLive";
import { openDirections } from "../../lib/format";
import { colors, radius, shadow } from "../../theme";
const KINDS: { key: VehicleKind; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: "CAR", icon: "car-sport" },
  { key: "BIKE", icon: "bicycle" },
  { key: "SCOOTER", icon: "speedometer" },
];
// Leaflet + OpenStreetMap data (CARTO light tiles). No API key needed, works inside an APK.
const HTML = `<!doctype html><html><head>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"/>
<style>
html,body,#map{height:100%;margin:0;background:#F4F5F8}
.leaflet-control-attribution{font-size:9px;margin-bottom:96px!important}
.pin{width:74px;height:34px;box-sizing:border-box;display:flex;align-items:center;justify-content:center;gap:6px;background:#fff;border-radius:999px;box-shadow:0 4px 14px rgba(0,0,0,.2);font:800 13px -apple-system,Roboto,sans-serif;color:#0A0A0B;border:2px solid #fff}
.pin b{width:22px;height:22px;border-radius:50%;background:#0A0A0B;color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px}
.pin.low{color:#E5383B}.pin.low b{background:#E5383B}
.pin.sel{background:#0A0A0B;color:#fff;border-color:#1F6FEB}.pin.sel b{background:#1F6FEB}
.me{width:16px;height:16px;border-radius:50%;background:#1F6FEB;border:3px solid #fff;box-shadow:0 0 0 9px rgba(31,111,235,.22)}
</style></head><body><div id="map"></div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js"></script>
<script>
var map=L.map('map',{zoomControl:false}).setView([${CAMPUS_CENTER.lat},${CAMPUS_CENTER.lng}],16);
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',{maxZoom:19,subdomains:'abcd',attribution:'&copy; OpenStreetMap &copy; CARTO'}).addTo(map);
var markers={},lots=[],selId=null,me=null,meLL=null,route=null;
function send(o){window.ReactNativeWebView.postMessage(JSON.stringify(o))}
function drawRoute(){
  if(route){map.removeLayer(route);route=null}
  var l=lots.filter(function(x){return x.id===selId})[0];
  if(meLL&&l){route=L.polyline([meLL,[l.lat,l.lng]],{color:'#1F6FEB',weight:4,dashArray:'8 10'}).addTo(map)}
}
function render(){
  Object.keys(markers).forEach(function(k){map.removeLayer(markers[k])});markers={};
  lots.forEach(function(l){
    var low=l.free===0||l.free/l.cap<0.15,sel=l.id===selId;
    var html='<div class="pin '+(sel?'sel':low?'low':'')+'"><b>'+l.zone+'</b>'+(l.free===0?'Full':l.free)+'</div>';
    var m=L.marker([l.lat,l.lng],{icon:L.divIcon({className:'',html:html,iconSize:[74,34],iconAnchor:[37,17]}),zIndexOffset:sel?1000:0}).addTo(map);
    m.on('click',function(e){L.DomEvent.stopPropagation(e);send({type:'select',id:l.id})});
    markers[l.id]=m;
  });
  drawRoute();
}
function setLots(a){lots=a;if(selId&&!a.some(function(x){return x.id===selId}))selId=null;render()}
function selectLot(id){selId=id;render();var l=lots.filter(function(x){return x.id===id})[0];if(l)map.panTo([l.lat,l.lng],{animate:true})}
function setMe(lat,lng){meLL=[lat,lng];if(me)map.removeLayer(me);me=L.marker(meLL,{icon:L.divIcon({className:'',html:'<div class="me"></div>',iconSize:[16,16],iconAnchor:[8,8]}),interactive:false}).addTo(map);drawRoute()}
function recenter(){if(meLL)map.setView(meLL,17,{animate:true});else map.setView([${CAMPUS_CENTER.lat},${CAMPUS_CENTER.lng}],16)}
function fitAll(){if(!lots.length)return;var b=L.latLngBounds(lots.map(function(x){return[x.lat,x.lng]}));if(meLL)b.extend(meLL);map.fitBounds(b,{padding:[60,60],maxZoom:17})}
map.on('click',function(){send({type:'clear'})});
send({type:'ready'});
</script></body></html>`;
export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const web = useRef<WebView>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [zone, setZone] = useState<ZoneFilter>("All");
  const [kind, setKind] = useState<VehicleKind>("CAR");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const me = useMyLocation(true);
  const { data: lotsData, error } = useLive<Lot[]>(getLots, 20000);
  const LOTS = useMemo(() => lotsData ?? [], [lotsData]);
  // Default the vehicle type to the user's first registered vehicle.
  useFocusEffect(
    useCallback(() => {
      getVehicles()
        .then((v) => {
          const t = v?.[0]?.vehicle_type as VehicleKind | undefined;
          if (t && ["CAR", "BIKE", "SCOOTER"].includes(t)) setKind(t);
        })
        .catch(() => {});
    }, [])
  );
  const visible = useMemo(() => filterLots(LOTS, zone, query), [LOTS, zone, query]);
  const run = (js: string) => web.current?.injectJavaScript(`${js};true;`);
  useEffect(() => {
    if (!ready) return;
    run(
      `setLots(${JSON.stringify(
        visible.map((l) => ({ id: l.id, zone: l.zone, lat: l.lat, lng: l.lng, free: l.free[kind], cap: l.capacity[kind] }))
      )})`
    );
  }, [ready, visible, kind]);
  useEffect(() => {
    if (!ready) return;
    if (me) run(`setMe(${me.lat},${me.lng})`);
  }, [ready, me]);
  useEffect(() => {
    if (!ready) return;
    if (selected) run(`selectLot(${JSON.stringify(selected)})`);
    else run(`selectLot(null)`);
  }, [ready, selected]);
  function onMessage(e: WebViewMessageEvent) {
    try {
      const m = JSON.parse(e.nativeEvent.data);
      if (m.type === "ready") setReady(true);
      else if (m.type === "select") setSelected(m.id);
      else if (m.type === "clear") setSelected(null);
    } catch {}
  }
  const lot = LOTS.find((l) => l.id === selected && visible.some((v) => v.id === l.id));
  const free = lot?.free[kind] ?? 0;
  const cap = lot?.capacity[kind] ?? 0;
  const tone = availabilityTone(free, cap);
  const unavailable = tone === "full" || tone === "none";
  const dist = lot && me ? `${fmtDistance(distanceM(me, lot))} away` : lot?.area;
  function navigate() {
    if (lot) openDirections(lot.lat, lot.lng, kind);
  }
  return (
    <View style={s.root}>
      <StatusBar style="dark" />
      <WebView
        ref={web}
        source={{ html: HTML, baseUrl: "https://localhost/" }}
        originWhitelist={["*"]}
        javaScriptEnabled
        domStorageEnabled
        onMessage={onMessage}
        onError={() => setFailed(true)}
        onHttpError={() => setFailed(true)}
        style={s.web}
        androidLayerType="hardware"
        overScrollMode="never"
      />
      {!ready && !failed && (
        <View style={s.loading}>
          <ActivityIndicator size="large" color={colors.blue} />
          <Text style={s.loadingText}>Loading campus map…</Text>
        </View>
      )}
      {failed && !ready && (
        <View style={s.loading}>
          <Ionicons name="cloud-offline-outline" size={36} color={colors.red} />
          <Text style={s.loadingText}>Map needs an internet connection.</Text>
        </View>
      )}
      {/* Top overlay */}
      <SafeAreaView edges={["top"]} style={s.top} pointerEvents="box-none">
        <View style={[s.search, shadow]}>
          <Ionicons name="search" size={20} color={colors.muted} />
          <TextInput
            style={s.searchInput}
            placeholder="Search parking"
            placeholderTextColor={colors.faint}
            value={query}
            onChangeText={setQuery}
          />
          <View style={s.kinds}>
            {KINDS.map((k) => (
              <Pressable key={k.key} onPress={() => setKind(k.key)} style={[s.kindBtn, kind === k.key && { backgroundColor: colors.ink }]}>
                <Ionicons name={k.icon} size={16} color={kind === k.key ? colors.white : colors.ink} />
              </Pressable>
            ))}
          </View>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10, marginHorizontal: -16 }} contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 4 }}>
          {ZONES.map((z) => (
            <Chip key={z} label={z === "All" ? "All" : `Zone ${z}`} active={zone === z} onPress={() => setZone(z)} />
          ))}
        </ScrollView>
        {error && (
          <View style={[s.offline, shadow]}>
            <Ionicons name="cloud-offline-outline" size={16} color={colors.red} />
            <Text style={s.offlineText} numberOfLines={2}>{lotsData ? "Can't refresh availability" : error}</Text>
          </View>
        )}
      </SafeAreaView>
      {/* Map controls */}
      <View style={[s.fabs, { bottom: (lot ? 300 : 150) + Math.max(insets.bottom - 12, 0) }]}>
        <Pressable style={[s.fab, shadow]} onPress={() => run("fitAll()")}>
          <Ionicons name="scan-outline" size={20} color={colors.ink} />
        </Pressable>
        <Pressable style={[s.fab, shadow, { backgroundColor: colors.ink }]} onPress={() => run("recenter()")}>
          <Ionicons name="locate" size={20} color={colors.white} />
        </Pressable>
      </View>
      {/* Bottom card */}
      <View style={[s.cardWrap, { bottom: 92 + Math.max(insets.bottom - 12, 0) }]} pointerEvents="box-none">
        {lot ? (
          <View style={[s.card, shadow]}>
            <View style={s.cardTop}>
              <View style={s.zoneBadge}><Text style={s.zoneText}>{lot.zone}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={s.cardName} numberOfLines={1}>{lot.name}</Text>
                <Text style={s.cardMeta} numberOfLines={1}>Zone {lot.zone} · {dist}</Text>
              </View>
              <View style={[s.pill, tone !== "ok" ? { backgroundColor: colors.redSoft } : { backgroundColor: colors.blueSoft }]}>
                <Text style={[s.pillText, { color: tone !== "ok" ? colors.red : colors.blue }]}>
                  {tone === "none" ? "No slots" : tone === "full" ? "Full" : `${free} free`}
                </Text>
              </View>
            </View>
            <View style={s.btnRow}>
              <Button title="Navigate" variant="black" icon="navigate" onPress={navigate} style={{ flex: 1, height: 50 }} />
              <Button
                title="Choose slot"
                icon="checkmark"
                disabled={unavailable}
                onPress={() => router.push({ pathname: "/student/select-space", params: { lotId: lot.id, kind } } as never)}
                style={{ flex: 1.2, height: 50 }}
              />
            </View>
          </View>
        ) : (
          <View style={[s.hint, shadow]}>
            <Ionicons name="location" size={18} color={colors.blue} />
            <Text style={s.hintText}>Tap a pin to see availability and navigate</Text>
          </View>
        )}
      </View>
    </View>
  );
}
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  web: { flex: 1, backgroundColor: colors.bg },
  loading: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center", gap: 12 },
  loadingText: { color: colors.muted, fontSize: 15, fontWeight: "600" },
  top: { position: "absolute", top: 0, left: 0, right: 0, paddingHorizontal: 16, paddingTop: 8 },
  search: { flexDirection: "row", alignItems: "center", gap: 10, height: 54, borderRadius: radius.lg, paddingLeft: 16, paddingRight: 8, backgroundColor: colors.white },
  searchInput: { flex: 1, fontSize: 16, color: colors.ink },
  kinds: { flexDirection: "row", gap: 4 },
  kindBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center" },
  fabs: { position: "absolute", right: 16, gap: 10 },
  fab: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.white, alignItems: "center", justifyContent: "center" },
  cardWrap: { position: "absolute", left: 16, right: 16 },
  card: { backgroundColor: colors.white, borderRadius: radius.xl, padding: 16 },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 14 },
  zoneBadge: { width: 52, height: 52, borderRadius: radius.md, backgroundColor: colors.ink, alignItems: "center", justifyContent: "center" },
  zoneText: { color: colors.white, fontSize: 24, fontWeight: "800" },
  cardName: { fontSize: 17, fontWeight: "800", color: colors.ink, letterSpacing: -0.2 },
  cardMeta: { fontSize: 13, color: colors.muted, marginTop: 2 },
  pill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill },
  pillText: { fontSize: 13, fontWeight: "800" },
  btnRow: { flexDirection: "row", gap: 10 },
  offline: { flexDirection: "row", alignItems: "center", gap: 8, alignSelf: "flex-start", backgroundColor: colors.white, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 8, marginTop: 8 },
  offlineText: { color: colors.red, fontSize: 13, fontWeight: "700", flexShrink: 1 },
  hint: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: colors.white, borderRadius: radius.pill, height: 52 },
  hintText: { fontSize: 14, fontWeight: "700", color: colors.ink },
});
```

## File: mobile/src/app/student/profile.tsx
```typescript
import { ProfileScreen } from "../../components/ProfileScreen";
export default function Profile() {
  return <ProfileScreen />;
}
```

## File: mobile/src/app/student/select-space.tsx
```typescript
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import {
  Lot,
  Slot,
  Vehicle,
  createBooking,
  errorMessage,
  getLot,
  getSlots,
  getVehicles,
} from "../../../services/api";
import { AddVehicleSheet } from "../../components/AddVehicleSheet";
import { Banner, Button, Chip, RoundButton } from "../../components/ui";
import { VehicleKind, floorLabel, kindIcon, kindLabel } from "../../data/parking";
import { useLive } from "../../hooks/useLive";
import { timeOf } from "../../lib/format";
import { colors, radius, shadow } from "../../theme";
function chunk<T>(arr: T[], n: number) {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}
function SlotTile({ slot, selected, onPress, kind }: { slot: Slot; selected: boolean; onPress: () => void; kind: VehicleKind }) {
  const taken = slot.occupied && !slot.mine;
  return (
    <Pressable
      disabled={slot.occupied}
      onPress={onPress}
      style={[s.slot, taken && s.slotTaken, slot.blocked && s.slotBlocked, (selected || slot.mine) && s.slotSelected]}
    >
      {slot.mine ? (
        <View style={s.selPill}>
          <Ionicons name="star" size={12} color={colors.white} />
          <Text style={s.selText}>{slot.label}</Text>
        </View>
      ) : slot.blocked ? (
        <Ionicons name="close" size={24} color={colors.faint} />
      ) : taken ? (
        <Ionicons name={kindIcon(kind)} size={30} color={colors.ink} />
      ) : selected ? (
        <View style={s.selPill}>
          <Ionicons name="checkmark" size={14} color={colors.white} />
          <Text style={s.selText}>{slot.label}</Text>
        </View>
      ) : (
        <Text style={s.slotNum}>{slot.label}</Text>
      )}
    </Pressable>
  );
}
export default function SelectSpace() {
  const params = useLocalSearchParams<{ lotId?: string; kind?: VehicleKind }>();
  const lotId = params.lotId ?? "";
  const kind: VehicleKind = params.kind ?? "CAR";
  const insets = useSafeAreaInsets();
  const [lot, setLot] = useState<Lot | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [floor, setFloor] = useState<string | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [vehicleId, setVehicleId] = useState<number | null>(null);
  const [booking, setBooking] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const loadMeta = useCallback(async () => {
    try {
      const [l, v] = await Promise.all([getLot(lotId), getVehicles()]);
      setLot(l);
      setVehicles(v);
      setFloor((f) => f ?? l.floors[0] ?? null);
      setLoadError(null);
    } catch (e) {
      setLoadError(errorMessage(e));
    }
  }, [lotId]);
  useEffect(() => {
    loadMeta();
  }, [loadMeta]);
  const fetchSlots = useCallback(
    async () => (floor ? (await getSlots(lotId, floor, kind)).slots : []),
    [lotId, floor, kind]
  );
  const { data: slots, refreshing, refresh, reload, setData: setSlots } = useLive<Slot[]>(fetchSlots, 15000);
  useEffect(() => {
    setSlots(null); // show a spinner rather than the previous floor's slots
    reload();
  }, [floor, reload, setSlots]);
  // If the slot we picked got taken in the meantime, drop the selection.
  useEffect(() => {
    if (selected != null && slots?.some((x) => x.id === selected && x.occupied)) setSelected(null);
  }, [slots, selected]);
  const myVehicles = useMemo(() => (vehicles ?? []).filter((v) => v.vehicle_type === kind), [vehicles, kind]);
  useEffect(() => {
    if (vehicleId == null && myVehicles.length) setVehicleId(myVehicles[0].id);
  }, [myVehicles, vehicleId]);
  const freeCount = (slots ?? []).filter((x) => !x.occupied).length;
  const selectedSlot = slots?.find((x) => x.id === selected);
  const groups = chunk(slots ?? [], 6);
  const canBook = selected != null && vehicleId != null;
  async function confirm() {
    if (!canBook || !lot) return;
    try {
      setBooking(true);
      const b = await createBooking(selected!, vehicleId!);
      Alert.alert(
        "Slot reserved",
        `${lot.name} · ${floorLabel(b.floor)} · ${b.slot_label}\n\nHeld for you until ${timeOf(b.expires_at)}. Show your number plate at the gate.`,
        [{ text: "Done", onPress: () => router.replace("/student" as never) }]
      );
    } catch (e) {
      Alert.alert("Couldn't reserve", errorMessage(e));
      setSelected(null);
      reload();
    } finally {
      setBooking(false);
    }
  }
  return (
    <SafeAreaView style={s.root} edges={["top"]}>
      <StatusBar style="dark" />
      <View style={s.header}>
        <RoundButton icon="arrow-back" onPress={() => (router.canGoBack() ? router.back() : router.replace("/student" as never))} />
        <View style={{ alignItems: "center", flex: 1 }}>
          <Text style={s.title}>Select Space</Text>
          <Text style={s.lotName} numberOfLines={1}>{lot?.name ?? " "}</Text>
        </View>
        <View style={{ width: 46 }} />
      </View>
      {loadError && (
        <View style={{ paddingHorizontal: 20 }}>
          <Banner text={loadError} action="Retry" onAction={loadMeta} />
        </View>
      )}
      {lot && (
        <View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 4 }}>
            {lot.floors.map((f) => (
              <Chip key={f} label={floorLabel(f)} active={floor === f} onPress={() => { setFloor(f); setSelected(null); }} />
            ))}
          </ScrollView>
        </View>
      )}
      {/* Legend */}
      <View style={s.legend}>
        <Legend color={colors.white} border label={`${freeCount} free`} />
        <Legend color={colors.ink} label="Taken" />
        <Legend color={colors.blue} label="Yours" />
        <View style={s.kindTag}>
          <Ionicons name={kindIcon(kind)} size={13} color={colors.blue} />
          <Text style={s.kindText}>{kindLabel(kind)}</Text>
        </View>
      </View>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 190 + insets.bottom }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.blue} />}
      >
        {/* Which vehicle */}
        {vehicles && (
          <View style={s.vehicleBox}>
            {myVehicles.length === 0 ? (
              <Banner
                tone="blue"
                icon={kindIcon(kind)}
                text={`Add your ${kindLabel(kind).toLowerCase()} to book a ${kindLabel(kind).toLowerCase()} slot.`}
                action="Add"
                onAction={() => setAddOpen(true)}
              />
            ) : myVehicles.length > 1 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 4 }}>
                {myVehicles.map((v) => (
                  <Chip key={v.id} icon={kindIcon(v.vehicle_type)} label={v.plate_number} active={vehicleId === v.id} onPress={() => setVehicleId(v.id)} />
                ))}
              </ScrollView>
            ) : null}
          </View>
        )}
        <View style={[s.lot, shadow]}>
          {!slots || !floor ? (
            <ActivityIndicator color={colors.blue} style={{ marginVertical: 40 }} />
          ) : slots.length === 0 ? (
            <Text style={s.none}>No {kindLabel(kind).toLowerCase()} slots on this floor.</Text>
          ) : (
            groups.map((g, gi) => (
              <View key={gi}>
                {gi > 0 && (
                  <View style={s.lane}>
                    <Text style={s.laneText}>{gi % 2 ? "ENTRY" : "EXIT"}</Text>
                    <View style={s.laneLine} />
                    <Ionicons name={gi % 2 ? "arrow-forward" : "arrow-back"} size={18} color={colors.blue} />
                    <View style={s.laneLine} />
                    <Text style={s.laneText}>{gi % 2 ? "EXIT" : "ENTRY"}</Text>
                  </View>
                )}
                <View style={s.row}>
                  {g.map((slot) => (
                    <SlotTile
                      key={slot.id}
                      slot={slot}
                      kind={kind}
                      selected={selected === slot.id}
                      onPress={() => setSelected(selected === slot.id ? null : slot.id)}
                    />
                  ))}
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
      <View style={[s.bar, shadow, { bottom: Math.max(insets.bottom, 16) }]}>
        <View style={{ flex: 1 }}>
          <Text style={s.barLabel}>
            {selectedSlot ? `${floorLabel(selectedSlot.floor)} · ${selectedSlot.label}` : "Pick a free slot"}
          </Text>
          <Text style={s.barPrice}>{selectedSlot ? "Free · held for you" : "Free parking"}</Text>
        </View>
        <Button title="Reserve" onPress={confirm} loading={booking} disabled={!canBook} style={{ width: 130, height: 50 }} />
      </View>
      <AddVehicleSheet visible={addOpen} onClose={() => setAddOpen(false)} onSaved={loadMeta} defaultType={kind} />
    </SafeAreaView>
  );
}
function Legend({ color, label, border }: { color: string; label: string; border?: boolean }) {
  return (
    <View style={s.legendItem}>
      <View style={[s.legendDot, { backgroundColor: color }, border && { borderWidth: 1.5, borderColor: colors.line }]} />
      <Text style={s.legendText}>{label}</Text>
    </View>
  );
}
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 12 },
  title: { fontSize: 20, fontWeight: "800", color: colors.ink },
  lotName: { fontSize: 13, color: colors.muted, marginTop: 2 },
  legend: { flexDirection: "row", alignItems: "center", gap: 16, paddingHorizontal: 20, marginTop: 12, marginBottom: 12 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 12, height: 12, borderRadius: 6 },
  legendText: { fontSize: 13, color: colors.muted, fontWeight: "600" },
  kindTag: { marginLeft: "auto", flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: colors.blueSoft, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill },
  kindText: { fontSize: 12, fontWeight: "800", color: colors.blue },
  vehicleBox: { paddingHorizontal: 20, marginBottom: 12 },
  lot: { marginHorizontal: 20, backgroundColor: colors.white, borderRadius: radius.xl, padding: 14 },
  none: { textAlign: "center", color: colors.muted, marginVertical: 30, fontSize: 15 },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  slot: {
    width: "31%",
    height: 84,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: colors.line,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
  },
  slotTaken: { backgroundColor: colors.bg, borderStyle: "solid", borderColor: colors.bg },
  slotBlocked: { backgroundColor: colors.bg, borderStyle: "solid", borderColor: colors.line },
  slotSelected: { backgroundColor: colors.blueSoft, borderStyle: "solid", borderColor: colors.blue },
  slotNum: { fontSize: 15, fontWeight: "800", color: colors.ink },
  selPill: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: colors.blue, paddingHorizontal: 10, paddingVertical: 7, borderRadius: radius.pill },
  selText: { color: colors.white, fontWeight: "800", fontSize: 13 },
  lane: { flexDirection: "row", alignItems: "center", gap: 8, marginVertical: 18 },
  laneText: { fontSize: 11, fontWeight: "800", letterSpacing: 1.5, color: colors.muted },
  laneLine: { flex: 1, borderTopWidth: 1.5, borderStyle: "dashed", borderColor: colors.line },
  bar: {
    position: "absolute",
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    paddingVertical: 12,
    paddingLeft: 20,
    paddingRight: 12,
  },
  barLabel: { fontSize: 13, color: colors.muted, fontWeight: "600" },
  barPrice: { fontSize: 17, fontWeight: "800", color: colors.ink, marginTop: 2 },
});
```

## File: mobile/src/app/student/vehicles.tsx
```typescript
import { useCallback, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { deleteVehicle, errorMessage, getVehicles, Vehicle } from "../../../services/api";
import { kindIcon, kindLabel } from "../../data/parking";
import { AddVehicleSheet } from "../../components/AddVehicleSheet";
import { Button, RoundButton } from "../../components/ui";
import { colors, radius, shadow } from "../../theme";
export default function Vehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const load = useCallback(async () => {
    try {
      setVehicles(await getVehicles());
    } catch (e) {
      console.log("VEHICLE LOAD ERROR:", e);
    } finally {
      setLoading(false);
    }
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));
  function handleDelete(id: number) {
    Alert.alert("Remove vehicle", "Are you sure you want to remove this vehicle?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          try { await deleteVehicle(id); await load(); }
          catch (e) { Alert.alert("Couldn't remove vehicle", errorMessage(e)); }
        },
      },
    ]);
  }
  return (
    <SafeAreaView style={s.root} edges={["top"]}>
      <View style={s.header}>
        <View>
          <Text style={s.title}>My Vehicles</Text>
          <Text style={s.sub}>{loading ? " " : `${vehicles.length} registered`}</Text>
        </View>
        <RoundButton icon="add" dark onPress={() => setOpen(true)} />
      </View>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {!loading && vehicles.length === 0 && (
          <View style={[s.empty, shadow]}>
            <View style={s.emptyIcon}><Ionicons name="car-sport" size={34} color={colors.blue} /></View>
            <Text style={s.emptyTitle}>No vehicles yet</Text>
            <Text style={s.emptyText}>Add your vehicle to start using campus parking.</Text>
            <Button title="Add vehicle" icon="add" onPress={() => setOpen(true)} style={{ marginTop: 18, alignSelf: "stretch" }} />
          </View>
        )}
        {vehicles.map((v) => (
          <View key={v.id} style={[s.card, shadow]}>
            <View style={s.cardIcon}>
              <Ionicons name={kindIcon(v.vehicle_type)} size={24} color={colors.white} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.plate}>{v.plate_number}</Text>
              <Text style={s.details}>
                {[v.color, v.make, v.model].filter(Boolean).join(" ") || "No details"}
              </Text>
            </View>
            <View style={s.typeTag}><Text style={s.typeTagText}>{kindLabel(v.vehicle_type)}</Text></View>
            <Pressable onPress={() => handleDelete(v.id)} hitSlop={10} style={s.del}>
              <Ionicons name="trash-outline" size={20} color={colors.red} />
            </Pressable>
          </View>
        ))}
      </ScrollView>
      <AddVehicleSheet visible={open} onClose={() => setOpen(false)} onSaved={load} />
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  title: { fontSize: 28, fontWeight: "800", color: colors.ink, letterSpacing: -0.5 },
  sub: { fontSize: 14, color: colors.muted, marginTop: 2 },
  content: { padding: 20, paddingBottom: 140, gap: 12 },
  empty: { backgroundColor: colors.white, borderRadius: radius.xl, padding: 28, alignItems: "center" },
  emptyIcon: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.blueSoft, alignItems: "center", justifyContent: "center", marginBottom: 14 },
  emptyTitle: { fontSize: 19, fontWeight: "800", color: colors.ink },
  emptyText: { color: colors.muted, textAlign: "center", marginTop: 6 },
  card: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: colors.white, borderRadius: radius.xl, padding: 16 },
  cardIcon: { width: 52, height: 52, borderRadius: radius.lg, backgroundColor: colors.ink, alignItems: "center", justifyContent: "center" },
  plate: { fontSize: 18, fontWeight: "800", color: colors.ink, letterSpacing: 0.5 },
  details: { fontSize: 13, color: colors.muted, marginTop: 3 },
  typeTag: { backgroundColor: colors.blueSoft, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill },
  typeTagText: { color: colors.blue, fontSize: 11, fontWeight: "800" },
  del: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.redSoft, alignItems: "center", justifyContent: "center" },
});
```

## File: mobile/src/app/_layout.tsx
```typescript
import { Stack } from "expo-router";
import { AuthProvider } from "../context/AuthContext";
export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </AuthProvider>
  );
}
```

## File: mobile/src/app/connect.tsx
```typescript
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { getApiUrl, normalizeServerUrl, saveApiUrl, testServer } from "../../services/api";
import { Button, RoundButton } from "../components/ui";
import { colors, radius } from "../theme";
type Status = { kind: "idle" } | { kind: "checking" } | { kind: "ok"; msg: string } | { kind: "error"; msg: string };
const STEPS = [
  { icon: "server-outline" as const, text: "Start Django:", code: "python manage.py runserver 0.0.0.0:8000" },
  { icon: "git-network-outline" as const, text: "Start the tunnel:", code: "ngrok http 8000" },
  { icon: "copy-outline" as const, text: "Copy the https link ngrok shows and paste it above.", code: null },
];
export default function ConnectScreen() {
  const { change } = useLocalSearchParams<{ change?: string }>();
  const { setHasServer } = useAuth();
  const [url, setUrl] = useState(change ? getApiUrl() : "");
  const [focus, setFocus] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const checking = status.kind === "checking";
  async function connect() {
    setStatus({ kind: "checking" });
    const result = await testServer(url);
    if (!result.ok) {
      setStatus({ kind: "error", msg: result.message });
      return;
    }
    setStatus({ kind: "ok", msg: result.message });
    await saveApiUrl(url);
    setHasServer(true);
    setTimeout(() => router.replace(change ? "/login" : "/"), 500);
  }
  const preview = normalizeServerUrl(url);
  return (
    <View style={s.root}>
      <StatusBar style="light" />
      <SafeAreaView edges={["top"]} style={s.hero}>
        <View style={s.topRow}>
          {change ? <RoundButton icon="arrow-back" onPress={() => router.back()} /> : <View style={{ width: 46 }} />}
          <View style={s.pill}>
            <View style={[s.pillDot, status.kind === "ok" && { backgroundColor: colors.blue }, status.kind === "error" && { backgroundColor: colors.red }]} />
            <Text style={s.pillText}>
              {status.kind === "ok" ? "Connected" : status.kind === "error" ? "Not connected" : "Offline"}
            </Text>
          </View>
        </View>
        <View style={s.logo}>
          <Ionicons name="link" size={30} color={colors.white} />
        </View>
        <Text style={s.title}>Connect to{"\n"}your server</Text>
        <Text style={s.sub}>Paste your ngrok link to go live.</Text>
      </SafeAreaView>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView style={s.sheet} contentContainerStyle={s.sheetContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Text style={s.label}>Server link</Text>
          <View
            style={[
              s.field,
              focus && s.fieldFocus,
              status.kind === "error" && s.fieldError,
            ]}
          >
            <Ionicons name="globe-outline" size={20} color={status.kind === "error" ? colors.red : colors.muted} />
            <TextInput
              style={s.input}
              placeholder="https://abcd-12-34.ngrok-free.app"
              placeholderTextColor={colors.faint}
              value={url}
              onChangeText={(v) => { setUrl(v); if (status.kind !== "idle") setStatus({ kind: "idle" }); }}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              onFocus={() => setFocus(true)}
              onBlur={() => setFocus(false)}
              onSubmitEditing={connect}
              returnKeyType="go"
            />
            {url.length > 0 && (
              <Pressable onPress={() => { setUrl(""); setStatus({ kind: "idle" }); }} hitSlop={10}>
                <Ionicons name="close-circle" size={20} color={colors.faint} />
              </Pressable>
            )}
          </View>
          {!!url && preview !== url.trim() && (
            <Text style={s.hint}>Will connect to {preview}</Text>
          )}
          {status.kind === "error" && (
            <View style={[s.banner, { backgroundColor: colors.redSoft }]}>
              <Ionicons name="alert-circle" size={20} color={colors.red} />
              <Text style={[s.bannerText, { color: colors.red }]}>{status.msg}</Text>
            </View>
          )}
          {status.kind === "ok" && (
            <View style={[s.banner, { backgroundColor: colors.blueSoft }]}>
              <Ionicons name="checkmark-circle" size={20} color={colors.blue} />
              <Text style={[s.bannerText, { color: colors.blue }]}>{status.msg}</Text>
            </View>
          )}
          <Button
            title={checking ? "Checking…" : "Connect"}
            icon="flash"
            onPress={connect}
            loading={checking}
            style={{ marginTop: 16 }}
          />
          <Text style={[s.label, { marginTop: 30 }]}>How to get the link</Text>
          <View style={s.steps}>
            {STEPS.map((st, i) => (
              <View key={i} style={[s.step, i > 0 && s.stepBorder]}>
                <View style={s.stepNum}><Text style={s.stepNumText}>{i + 1}</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={s.stepText}>{st.text}</Text>
                  {st.code && <Text style={s.code}>{st.code}</Text>}
                </View>
              </View>
            ))}
          </View>
          <Text style={s.note}>
            Free ngrok links change every time ngrok restarts — just paste the new one here.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.ink },
  hero: { paddingHorizontal: 24, paddingBottom: 28 },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8, marginBottom: 20 },
  pill: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#1A1A1D", paddingHorizontal: 14, height: 34, borderRadius: radius.pill },
  pillDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#6B7280" },
  pillText: { color: colors.white, fontSize: 12, fontWeight: "800" },
  logo: { width: 60, height: 60, borderRadius: 20, backgroundColor: colors.blue, alignItems: "center", justifyContent: "center", marginBottom: 22 },
  title: { color: colors.white, fontSize: 36, fontWeight: "800", letterSpacing: -1, lineHeight: 40 },
  sub: { color: "#A3A8B3", fontSize: 15, marginTop: 8 },
  sheet: { flex: 1, backgroundColor: colors.white, borderTopLeftRadius: 36, borderTopRightRadius: 36 },
  sheetContent: { padding: 24, paddingTop: 28, paddingBottom: 50 },
  label: { fontSize: 13, fontWeight: "800", color: colors.muted, letterSpacing: 0.6, textTransform: "uppercase", marginBottom: 12 },
  field: { flexDirection: "row", alignItems: "center", gap: 12, height: 58, paddingHorizontal: 16, borderRadius: radius.lg, backgroundColor: colors.bg, borderWidth: 1.5, borderColor: "transparent" },
  fieldFocus: { borderColor: colors.blue, backgroundColor: colors.white },
  fieldError: { borderColor: colors.red, backgroundColor: colors.redSoft },
  input: { flex: 1, fontSize: 15, color: colors.ink },
  hint: { fontSize: 12, color: colors.muted, marginTop: 8, marginLeft: 4 },
  banner: { flexDirection: "row", alignItems: "flex-start", gap: 10, padding: 14, borderRadius: radius.md, marginTop: 14 },
  bannerText: { flex: 1, fontSize: 14, fontWeight: "600", lineHeight: 19 },
  steps: { backgroundColor: colors.bg, borderRadius: radius.lg, paddingHorizontal: 16 },
  step: { flexDirection: "row", gap: 12, paddingVertical: 14 },
  stepBorder: { borderTopWidth: 1, borderTopColor: colors.line },
  stepNum: { width: 26, height: 26, borderRadius: 13, backgroundColor: colors.ink, alignItems: "center", justifyContent: "center" },
  stepNumText: { color: colors.white, fontSize: 12, fontWeight: "800" },
  stepText: { fontSize: 14, color: colors.ink, fontWeight: "600", lineHeight: 20 },
  code: { marginTop: 6, fontFamily: Platform.select({ ios: "Menlo", default: "monospace" }), fontSize: 12, color: colors.blue, backgroundColor: colors.blueSoft, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, overflow: "hidden", alignSelf: "flex-start" },
  note: { fontSize: 13, color: colors.muted, marginTop: 14, lineHeight: 18 },
});
```

## File: mobile/src/app/index.tsx
```typescript
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { useEffect } from "react";
import { homeFor, useAuth } from "../context/AuthContext";
export default function Index() {
  const { user, loading, hasServer } = useAuth();
  useEffect(() => {
    if (loading) {
      return;
    }
    if (!hasServer) {
      router.replace("/connect" as never);
      return;
    }
    if (!user) {
      router.replace("/login");
      return;
    }
    router.replace(homeFor(user.role) as never);
  }, [user, loading, hasServer]);
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#1F6FEB" />
      <Text style={styles.text}>
        Loading Thapar Parking...
      </Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0A0A0B",
  },
  text: {
    marginTop: 14,
    fontSize: 16,
    color: "#A3A8B3",
  },
});
```

## File: mobile/src/app/login.tsx
```typescript
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { getApiUrl } from "../../services/api";
import { Button } from "../components/ui";
import { colors, radius } from "../theme";
export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focus, setFocus] = useState<"email" | "password" | null>(null);
  const { login } = useAuth();
  async function handleLogin() {
    if (!email.trim() || !password) {
      Alert.alert("Missing information", "Enter your email and password.");
      return;
    }
    try {
      setLoading(true);
      await login(email.trim(), password);
      router.replace("/");
    } catch (error) {
      Alert.alert(
        "Login failed",
        error instanceof Error ? error.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }
  return (
    <View style={s.root}>
      <StatusBar style="light" />
      <SafeAreaView edges={["top"]} style={s.hero}>
        <View style={s.logo}>
          <Ionicons name="car-sport" size={30} color={colors.white} />
        </View>
        <Text style={s.brand}>Thapar{"\n"}Parking</Text>
        <Text style={s.tagline}>Find a spot. Park smart. Get in faster.</Text>
        <View style={s.dots}>
          <View style={[s.dot, { backgroundColor: colors.blue }]} />
          <View style={[s.dot, { backgroundColor: colors.red }]} />
          <View style={[s.dot, { backgroundColor: colors.white }]} />
        </View>
      </SafeAreaView>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={s.sheetWrap}
      >
        <ScrollView
          style={s.sheet}
          contentContainerStyle={s.sheetContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={s.title}>Welcome back</Text>
          <Text style={s.sub}>Sign in with your campus account</Text>
          <View style={[s.field, focus === "email" && s.fieldFocus]}>
            <Ionicons name="mail-outline" size={20} color={colors.muted} />
            <TextInput
              style={s.input}
              placeholder="Email"
              placeholderTextColor={colors.faint}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              onFocus={() => setFocus("email")}
              onBlur={() => setFocus(null)}
            />
          </View>
          <View style={[s.field, focus === "password" && s.fieldFocus]}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.muted} />
            <TextInput
              style={s.input}
              placeholder="Password"
              placeholderTextColor={colors.faint}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!show}
              autoCapitalize="none"
              onFocus={() => setFocus("password")}
              onBlur={() => setFocus(null)}
            />
            <Pressable onPress={() => setShow(!show)} hitSlop={10}>
              <Ionicons
                name={show ? "eye-off-outline" : "eye-outline"}
                size={20}
                color={colors.muted}
              />
            </Pressable>
          </View>
          <Button title="Sign in" onPress={handleLogin} loading={loading} style={{ marginTop: 8 }} />
          <View style={s.switchRow}>
            <Text style={s.switchText}>New to Thapar Parking?</Text>
            <Pressable onPress={() => router.push("/signup" as never)} hitSlop={10}>
              <Text style={s.switchLink}>Create account</Text>
            </Pressable>
          </View>
          <Pressable onPress={() => router.push("/connect?change=1" as never)} style={s.server}>
            <View style={s.serverDot} />
            <Text style={s.serverText} numberOfLines={1}>
              {getApiUrl().replace(/^https?:\/\//, "")}
            </Text>
            <Text style={s.switchLink}>Change</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.ink },
  hero: { paddingHorizontal: 28, paddingTop: 24, paddingBottom: 36 },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: colors.blue,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
  },
  brand: { color: colors.white, fontSize: 44, fontWeight: "800", letterSpacing: -1.5, lineHeight: 48 },
  tagline: { color: "#A3A8B3", fontSize: 16, marginTop: 12 },
  dots: { flexDirection: "row", gap: 6, marginTop: 22 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  sheetWrap: { flex: 1 },
  sheet: { flex: 1, backgroundColor: colors.white, borderTopLeftRadius: 36, borderTopRightRadius: 36 },
  sheetContent: { padding: 28, paddingTop: 32 },
  title: { fontSize: 26, fontWeight: "800", color: colors.ink, letterSpacing: -0.5 },
  sub: { fontSize: 15, color: colors.muted, marginTop: 6, marginBottom: 26 },
  field: {
    flexDirection: "row",
    alignItems: "center",
    height: 58,
    paddingHorizontal: 16,
    gap: 12,
    borderRadius: radius.lg,
    backgroundColor: colors.bg,
    borderWidth: 1.5,
    borderColor: "transparent",
    marginBottom: 14,
  },
  fieldFocus: { borderColor: colors.blue, backgroundColor: colors.white },
  input: { flex: 1, fontSize: 16, color: colors.ink },
  server: { flexDirection: "row", alignItems: "center", gap: 8, alignSelf: "center", marginTop: 26, paddingHorizontal: 14, height: 38, borderRadius: radius.pill, backgroundColor: colors.bg, maxWidth: "100%" },
  serverDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.blue },
  serverText: { color: colors.muted, fontSize: 13, fontWeight: "600", flexShrink: 1 },
  switchRow: { flexDirection: "row", justifyContent: "center", gap: 6, marginTop: 24 },
  switchText: { color: colors.muted, fontSize: 15 },
  switchLink: { color: colors.blue, fontSize: 15, fontWeight: "800" },
});
```

## File: mobile/src/app/signup.tsx
```typescript
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  KeyboardTypeOptions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { Button, RoundButton } from "../components/ui";
import { colors, radius } from "../theme";
type IconName = keyof typeof Ionicons.glyphMap;
// Staff roles (Guard / Admin) are intentionally not self-service.
const ROLES: { key: string; label: string; icon: IconName; hint: string }[] = [
  { key: "STUDENT", label: "Student", icon: "school", hint: "Campus student" },
  { key: "FACULTY", label: "Faculty", icon: "briefcase", hint: "Teaching / staff" },
  { key: "VISITOR", label: "Visitor", icon: "walk", hint: "Guest access" },
  { key: "VENDOR", label: "Vendor", icon: "storefront", hint: "Delivery / shop" },
];
type FieldProps = {
  id: string;
  icon: IconName;
  placeholder: string;
  value: string;
  onChangeText: (v: string) => void;
  focused: boolean;
  onFocusId: (id: string | null) => void;
  keyboardType?: KeyboardTypeOptions;
  secure?: boolean;
  capitalize?: "none" | "words";
  error?: boolean;
  right?: React.ReactNode;
};
// Must live at module level: defining a component inside the screen makes React
// remount it on every keystroke, which dismisses the keyboard.
function Field(props: FieldProps) {
  return (
    <View style={[s.field, props.focused && s.fieldFocus, props.error && s.fieldError]}>
      <Ionicons name={props.icon} size={20} color={props.error ? colors.red : colors.muted} />
      <TextInput
        style={s.input}
        placeholder={props.placeholder}
        placeholderTextColor={colors.faint}
        value={props.value}
        onChangeText={props.onChangeText}
        keyboardType={props.keyboardType}
        secureTextEntry={props.secure}
        autoCapitalize={props.capitalize ?? "none"}
        autoCorrect={false}
        onFocus={() => props.onFocusId(props.id)}
        onBlur={() => props.onFocusId(null)}
      />
      {props.right}
    </View>
  );
}
export default function SignupScreen() {
  const { register } = useAuth();
  const [role, setRole] = useState("STUDENT");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [focus, setFocus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const mismatch = confirm.length > 0 && confirm !== password;
  const strength =
    password.length === 0 ? 0
    : password.length < 6 ? 1
    : /[A-Z]/.test(password) && /\d/.test(password) && password.length >= 8 ? 3
    : 2;
  async function handleSignup() {
    if (!name.trim() || !email.trim() || !password) {
      Alert.alert("Missing information", "Name, email and password are required.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Weak password", "Use at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      Alert.alert("Passwords don't match", "Re-enter your password.");
      return;
    }
    try {
      setLoading(true);
      await register(email.trim(), password, name.trim(), phone.trim(), role);
      router.replace("/");
    } catch (e) {
      Alert.alert("Couldn't create account", e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }
  return (
    <View style={s.root}>
      <StatusBar style="light" />
      <SafeAreaView edges={["top"]} style={s.hero}>
        <View style={s.topRow}>
          <RoundButton icon="arrow-back" onPress={() => router.back()} />
          <View style={s.stepPill}>
            <Ionicons name="car-sport" size={14} color={colors.white} />
            <Text style={s.stepText}>Thapar Parking</Text>
          </View>
        </View>
        <Text style={s.heroTitle}>Create your{"\n"}account</Text>
        <Text style={s.heroSub}>Takes less than a minute.</Text>
      </SafeAreaView>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView
          style={s.sheet}
          contentContainerStyle={s.sheetContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={s.label}>I am a</Text>
          <View style={s.roleGrid}>
            {ROLES.map((r) => {
              const active = role === r.key;
              return (
                <Pressable key={r.key} onPress={() => setRole(r.key)} style={[s.role, active ? s.roleActive : s.roleIdle]}>
                  <Ionicons name={r.icon} size={22} color={active ? colors.white : colors.ink} />
                  <View style={{ flex: 1 }}>
                    <Text style={[s.roleName, active && { color: colors.white }]}>{r.label}</Text>
                    <Text style={[s.roleHint, active && { color: "#A3A8B3" }]} numberOfLines={1}>{r.hint}</Text>
                  </View>
                  {active && <Ionicons name="checkmark-circle" size={20} color={colors.blue} />}
                </Pressable>
              );
            })}
          </View>
          <Text style={[s.label, { marginTop: 22 }]}>Your details</Text>
          <Field id="name" focused={focus === "name"} onFocusId={setFocus} icon="person-outline" placeholder="Full name" value={name} onChangeText={setName} capitalize="words" />
          <Field id="email" focused={focus === "email"} onFocusId={setFocus} icon="mail-outline" placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
          <Field id="phone" focused={focus === "phone"} onFocusId={setFocus} icon="call-outline" placeholder="Phone (optional)" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          <Text style={[s.label, { marginTop: 10 }]}>Password</Text>
          <Field
            id="password" focused={focus === "password"} onFocusId={setFocus}
            icon="lock-closed-outline"
            placeholder="Password (min 6 characters)"
            value={password}
            onChangeText={setPassword}
            secure={!show}
            right={
              <Pressable onPress={() => setShow(!show)} hitSlop={10}>
                <Ionicons name={show ? "eye-off-outline" : "eye-outline"} size={20} color={colors.muted} />
              </Pressable>
            }
          />
          {password.length > 0 && (
            <View style={s.meter}>
              {[1, 2, 3].map((i) => (
                <View
                  key={i}
                  style={[
                    s.meterBar,
                    i <= strength && { backgroundColor: strength === 1 ? colors.red : colors.blue },
                  ]}
                />
              ))}
              <Text style={[s.meterText, strength === 1 && { color: colors.red }]}>
                {strength === 1 ? "Too short" : strength === 2 ? "OK" : "Strong"}
              </Text>
            </View>
          )}
          <Field
            id="confirm" focused={focus === "confirm"} onFocusId={setFocus}
            icon="shield-checkmark-outline"
            placeholder="Confirm password"
            value={confirm}
            onChangeText={setConfirm}
            secure={!show}
            error={mismatch}
          />
          {mismatch && <Text style={s.errorText}>Passwords don't match</Text>}
          <Button title="Create account" onPress={handleSignup} loading={loading} style={{ marginTop: 14 }} />
          <View style={s.switchRow}>
            <Text style={s.switchText}>Already have an account?</Text>
            <Pressable onPress={() => router.back()} hitSlop={10}>
              <Text style={s.switchLink}>Sign in</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.ink },
  hero: { paddingHorizontal: 24, paddingBottom: 28 },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8, marginBottom: 22 },
  stepPill: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: colors.blue, paddingHorizontal: 12, height: 32, borderRadius: radius.pill },
  stepText: { color: colors.white, fontSize: 12, fontWeight: "800" },
  heroTitle: { color: colors.white, fontSize: 36, fontWeight: "800", letterSpacing: -1, lineHeight: 40 },
  heroSub: { color: "#A3A8B3", fontSize: 15, marginTop: 8 },
  sheet: { flex: 1, backgroundColor: colors.white, borderTopLeftRadius: 36, borderTopRightRadius: 36 },
  sheetContent: { padding: 24, paddingTop: 28, paddingBottom: 50 },
  label: { fontSize: 13, fontWeight: "800", color: colors.muted, letterSpacing: 0.6, textTransform: "uppercase", marginBottom: 12 },
  roleGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  role: { width: "48.5%", flexDirection: "row", alignItems: "center", gap: 10, padding: 14, borderRadius: radius.lg, borderWidth: 1.5 },
  roleIdle: { backgroundColor: colors.bg, borderColor: "transparent" },
  roleActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  roleName: { fontSize: 15, fontWeight: "800", color: colors.ink },
  roleHint: { fontSize: 11, color: colors.muted, marginTop: 1 },
  field: { flexDirection: "row", alignItems: "center", gap: 12, height: 58, paddingHorizontal: 16, borderRadius: radius.lg, backgroundColor: colors.bg, borderWidth: 1.5, borderColor: "transparent", marginBottom: 12 },
  fieldFocus: { borderColor: colors.blue, backgroundColor: colors.white },
  fieldError: { borderColor: colors.red, backgroundColor: colors.redSoft },
  input: { flex: 1, fontSize: 16, color: colors.ink },
  meter: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: -2, marginBottom: 12, paddingHorizontal: 4 },
  meterBar: { flex: 1, height: 4, borderRadius: 2, backgroundColor: colors.line },
  meterText: { fontSize: 12, fontWeight: "700", color: colors.blue, marginLeft: 6, width: 56 },
  errorText: { color: colors.red, fontSize: 13, fontWeight: "600", marginTop: -4, marginBottom: 4, marginLeft: 4 },
  switchRow: { flexDirection: "row", justifyContent: "center", gap: 6, marginTop: 22 },
  switchText: { color: colors.muted, fontSize: 15 },
  switchLink: { color: colors.blue, fontSize: 15, fontWeight: "800" },
});
```

## File: mobile/src/components/AddVehicleSheet.tsx
```typescript
import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { addVehicle, errorMessage, VehicleKind } from "../../services/api";
import { KINDS } from "../data/parking";
import { Button, Chip } from "./ui";
import { colors, radius } from "../theme";
export function AddVehicleSheet({
  visible,
  onClose,
  onSaved,
  defaultType,
}: {
  visible: boolean;
  onClose: () => void;
  onSaved: () => void;
  defaultType?: VehicleKind;
}) {
  const [plate, setPlate] = useState("");
  const [type, setType] = useState<VehicleKind>("CAR");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [color, setColor] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (visible) {
      setType(defaultType ?? "CAR");
      setError(null);
    }
  }, [visible, defaultType]);
  async function save() {
    if (plate.replace(/[^a-z0-9]/gi, "").length < 4) {
      setError("Enter your vehicle number, e.g. PB 11 AB 1234");
      return;
    }
    try {
      setSaving(true);
      setError(null);
      await addVehicle({ plate_number: plate, vehicle_type: type, make: make.trim(), model: model.trim(), color: color.trim() });
      setPlate(""); setMake(""); setModel(""); setColor("");
      onClose();
      onSaved();
    } catch (e) {
      setError(errorMessage(e).replace(/^plate_number: /, ""));
    } finally {
      setSaving(false);
    }
  }
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={s.backdrop}>
        <Pressable style={{ flex: 1 }} onPress={onClose} />
        <View style={s.sheet}>
          <View style={s.grab} />
          <Text style={s.title}>Add Vehicle</Text>
          <View style={{ flexDirection: "row", marginBottom: 6 }}>
            {KINDS.map((k) => (
              <Chip key={k.key} label={k.label} icon={k.icon} active={type === k.key} onPress={() => setType(k.key)} />
            ))}
          </View>
          <TextInput style={s.input} placeholder="Vehicle number (e.g. PB 11 AB 1234)" placeholderTextColor={colors.faint} autoCapitalize="characters" value={plate} onChangeText={(v) => { setPlate(v.toUpperCase()); setError(null); }} autoCorrect={false} />
          <View style={{ flexDirection: "row", gap: 10 }}>
            <TextInput style={[s.input, { flex: 1 }]} placeholder="Make" placeholderTextColor={colors.faint} value={make} onChangeText={setMake} />
            <TextInput style={[s.input, { flex: 1 }]} placeholder="Model" placeholderTextColor={colors.faint} value={model} onChangeText={setModel} />
          </View>
          <TextInput style={s.input} placeholder="Color" placeholderTextColor={colors.faint} value={color} onChangeText={setColor} />
          {error && <Text style={s.error}>{error}</Text>}
          <Button title="Save vehicle" onPress={save} loading={saving} style={{ marginTop: 6 }} />
          <Button title="Cancel" variant="ghost" onPress={onClose} style={{ marginTop: 10 }} />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
const s = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(10,10,11,0.5)", justifyContent: "flex-end" },
  sheet: { backgroundColor: colors.white, borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 22, paddingBottom: 34 },
  grab: { alignSelf: "center", width: 44, height: 5, borderRadius: 3, backgroundColor: colors.line, marginBottom: 16 },
  title: { fontSize: 24, fontWeight: "800", color: colors.ink, marginBottom: 16, letterSpacing: -0.4 },
  error: { color: colors.red, fontSize: 13, fontWeight: "600", marginTop: 10, marginLeft: 4 },
  input: { backgroundColor: colors.bg, borderRadius: radius.md, paddingHorizontal: 16, height: 54, marginTop: 10, fontSize: 16, color: colors.ink },
});
```

## File: mobile/src/components/BookingCard.tsx
```typescript
import { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Booking, cancelBooking, errorMessage } from "../../services/api";
import { kindIcon, floorLabel } from "../data/parking";
import { countdown, durationSince, openDirections, timeOf } from "../lib/format";
import { colors, radius } from "../theme";
import { Button } from "./ui";
/** The "you have a spot" card shown at the top of Home. */
export function BookingCard({ booking, onChanged }: { booking: Booking; onChanged: () => void }) {
  const [now, setNow] = useState(Date.now());
  const [cancelling, setCancelling] = useState(false);
  const reserved = booking.status === "RESERVED";
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), reserved ? 1000 : 30000);
    return () => clearInterval(t);
  }, [reserved]);
  const expired = reserved && booking.expires_at != null && new Date(booking.expires_at).getTime() <= now;
  useEffect(() => {
    if (expired) onChanged();
  }, [expired, onChanged]);
  function cancel() {
    Alert.alert("Cancel reservation?", `Slot ${booking.slot_label} will be released for others.`, [
      { text: "Keep it", style: "cancel" },
      {
        text: "Cancel booking",
        style: "destructive",
        onPress: async () => {
          try {
            setCancelling(true);
            await cancelBooking(booking.id);
            onChanged();
          } catch (e) {
            Alert.alert("Couldn't cancel", errorMessage(e));
          } finally {
            setCancelling(false);
          }
        },
      },
    ]);
  }
  return (
    <View style={[s.card, reserved ? s.reserved : s.parked]}>
      <View style={s.topRow}>
        <View style={s.tag}>
          <View style={[s.dot, { backgroundColor: reserved ? colors.white : colors.blue }]} />
          <Text style={s.tagText}>{reserved ? "RESERVED" : "PARKED"}</Text>
        </View>
        <Text style={s.timer}>
          {reserved ? `Held for ${countdown(booking.expires_at, now)}` : `${durationSince(booking.checked_in_at, now)}`}
        </Text>
      </View>
      <View style={s.mid}>
        <View style={s.slotBox}>
          <Text style={s.slotSmall}>SLOT</Text>
          <Text style={s.slotBig}>{booking.slot_label}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.lot} numberOfLines={1}>{booking.lot.name}</Text>
          <Text style={s.meta}>Zone {booking.lot.zone} · {floorLabel(booking.floor)}</Text>
          <View style={s.plateRow}>
            <Ionicons name={kindIcon(booking.vehicle_type)} size={14} color="#C9D6F5" />
            <Text style={s.plate}>{booking.plate_number}</Text>
          </View>
        </View>
      </View>
      <Text style={s.note}>
        {reserved
          ? "Show your number plate at the gate. The slot is released if you don't arrive in time."
          : `Checked in at ${timeOf(booking.checked_in_at)}. A guard checks you out at the exit.`}
      </Text>
      <View style={s.btnRow}>
        <Button
          title={reserved ? "Directions" : "Find my car"}
          icon="navigate"
          variant="ghost"
          onPress={() => openDirections(booking.lot.lat, booking.lot.lng, booking.vehicle_type)}
          style={{ flex: 1, height: 48 }}
        />
        {reserved && (
          <Button title="Cancel" variant="red" onPress={cancel} loading={cancelling} style={{ flex: 1, height: 48 }} />
        )}
      </View>
    </View>
  );
}
const s = StyleSheet.create({
  card: { borderRadius: radius.xl, padding: 18 },
  reserved: { backgroundColor: colors.blue },
  parked: { backgroundColor: colors.ink },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  tag: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(255,255,255,0.16)", paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.pill },
  dot: { width: 7, height: 7, borderRadius: 4 },
  tagText: { color: colors.white, fontSize: 11, fontWeight: "800", letterSpacing: 1 },
  timer: { color: colors.white, fontSize: 14, fontWeight: "800", fontVariant: ["tabular-nums"] },
  mid: { flexDirection: "row", alignItems: "center", gap: 14, marginTop: 16 },
  slotBox: { width: 74, height: 74, borderRadius: radius.lg, backgroundColor: colors.white, alignItems: "center", justifyContent: "center" },
  slotSmall: { fontSize: 10, fontWeight: "800", color: colors.muted, letterSpacing: 1 },
  slotBig: { fontSize: 24, fontWeight: "800", color: colors.ink, letterSpacing: -0.5 },
  lot: { color: colors.white, fontSize: 18, fontWeight: "800", letterSpacing: -0.3 },
  meta: { color: "#C9D6F5", fontSize: 13, marginTop: 3 },
  plateRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6 },
  plate: { color: colors.white, fontSize: 13, fontWeight: "800", letterSpacing: 0.6 },
  note: { color: "#C9D6F5", fontSize: 12, lineHeight: 17, marginTop: 14 },
  btnRow: { flexDirection: "row", gap: 10, marginTop: 14 },
});
```

## File: mobile/src/components/FloatingTabBar.tsx
```typescript
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { BottomTabBarProps } from "expo-router/js-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, radius, shadow } from "../theme";
export type TabSpec = Record<string, { label: string; icon: keyof typeof Ionicons.glyphMap }>;
/** Pill-shaped floating tab bar. Hidden on routes that aren't listed in `tabs`. */
export function makeTabBar(tabs: TabSpec) {
  return function FloatingTabBar({ state, navigation }: BottomTabBarProps) {
    const insets = useSafeAreaInsets();
    if (!tabs[state.routes[state.index].name]) return null;
    return (
      <View style={[s.wrap, { bottom: Math.max(insets.bottom, 12) }]} pointerEvents="box-none">
        <View style={[s.bar, shadow]}>
          {state.routes
            .filter((r) => tabs[r.name])
            .map((route) => {
              const focused = state.routes[state.index].name === route.name;
              const t = tabs[route.name];
              return (
                <Pressable
                  key={route.key}
                  accessibilityRole="tab"
                  accessibilityLabel={t.label}
                  accessibilityState={{ selected: focused }}
                  onPress={() => navigation.navigate(route.name)}
                  style={[s.item, focused && s.itemActive]}
                >
                  <Ionicons
                    name={focused ? t.icon : (`${t.icon}-outline` as keyof typeof Ionicons.glyphMap)}
                    size={20}
                    color={focused ? colors.white : colors.ink}
                  />
                  {focused && <Text style={s.label}>{t.label}</Text>}
                </Pressable>
              );
            })}
        </View>
      </View>
    );
  };
}
const s = StyleSheet.create({
  wrap: { position: "absolute", left: 0, right: 0, alignItems: "center" },
  bar: { flexDirection: "row", backgroundColor: colors.white, borderRadius: radius.pill, padding: 6, gap: 4 },
  item: {
    height: 52,
    minWidth: 56,
    paddingHorizontal: 18,
    borderRadius: radius.pill,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  itemActive: { backgroundColor: colors.blue },
  label: { color: colors.white, fontWeight: "700", fontSize: 15 },
});
```

## File: mobile/src/components/GateConsole.tsx
```typescript
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import {
  GateEvent,
  Lot,
  PlateLookup,
  VehicleKind,
  checkIn,
  checkOut,
  errorMessage,
  getGateEvents,
  getLots,
  lookupPlate,
} from "../../services/api";
import { useAuth } from "../context/AuthContext";
import { KINDS, floorLabel, kindLabel } from "../data/parking";
import { useLive } from "../hooks/useLive";
import { countdown, durationSince, prettyRole, timeOf } from "../lib/format";
import { colors, radius, shadow } from "../theme";
import { Banner, Button, Chip, StatusPill } from "./ui";
type Flash = { tone: "blue" | "red"; text: string } | null;
/** Guard's main screen: type a plate, see what it's allowed to do, check it in or out. */
export function GateConsole({ initialPlate }: { initialPlate?: string }) {
  const { user } = useAuth();
  const [plate, setPlate] = useState(initialPlate ?? "");
  const [result, setResult] = useState<PlateLookup | null>(null);
  const [looking, setLooking] = useState(false);
  const [acting, setActing] = useState(false);
  const [flash, setFlash] = useState<Flash>(null);
  const [walkLot, setWalkLot] = useState<string | null>(null);
  const [walkType, setWalkType] = useState<VehicleKind>("CAR");
  const fetchSide = useCallback(async () => {
    const [events, lots] = await Promise.all([getGateEvents(), getLots()]);
    return { events, lots };
  }, []);
  const { data, refreshing, refresh, reload } = useLive<{ events: GateEvent[]; lots: Lot[] }>(fetchSide, 15000);
  const cleanPlate = plate.replace(/[^a-z0-9]/gi, "").toUpperCase();
  async function lookup(p = cleanPlate) {
    if (p.length < 3) return setFlash({ tone: "red", text: "Enter the vehicle number." });
    Keyboard.dismiss();
    setFlash(null);
    setLooking(true);
    try {
      const r = await lookupPlate(p);
      setResult(r);
      if (r.vehicle) setWalkType(r.vehicle.vehicle_type);
      setWalkLot(null);
    } catch (e) {
      setFlash({ tone: "red", text: errorMessage(e) });
    } finally {
      setLooking(false);
    }
  }
  async function act(fn: () => Promise<{ message: string }>) {
    setActing(true);
    try {
      const r = await fn();
      setFlash({ tone: "blue", text: r.message });
      setResult(null);
      setPlate("");
      reload();
    } catch (e) {
      setFlash({ tone: "red", text: errorMessage(e) });
      lookup();
    } finally {
      setActing(false);
    }
  }
  const booking = result?.booking;
  const lots = data?.lots ?? [];
  const events = data?.events ?? [];
  return (
    <SafeAreaView style={s.root} edges={["top"]}>
      <StatusBar style="light" />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.white} />}
      >
        {/* Dark header with the plate input */}
        <View style={s.hero}>
          <View style={s.heroTop}>
            <View>
              <Text style={s.heroSmall}>Gate console</Text>
              <Text style={s.heroTitle}>Hi, {(user?.name || prettyRole(user?.role)).split(" ")[0]}</Text>
            </View>
            <View style={s.onDuty}>
              <View style={s.onDutyDot} />
              <Text style={s.onDutyText}>ON DUTY</Text>
            </View>
          </View>
          <View style={s.plateBox}>
            <Ionicons name="car-sport" size={22} color={colors.muted} />
            <TextInput
              style={s.plateInput}
              placeholder="PB 11 AB 1234"
              placeholderTextColor={colors.faint}
              value={plate}
              onChangeText={(v) => {
                setPlate(v.toUpperCase());
                setResult(null);
              }}
              autoCapitalize="characters"
              autoCorrect={false}
              returnKeyType="search"
              onSubmitEditing={() => lookup()}
            />
            {plate.length > 0 && (
              <Pressable onPress={() => { setPlate(""); setResult(null); }} hitSlop={10}>
                <Ionicons name="close-circle" size={22} color={colors.faint} />
              </Pressable>
            )}
          </View>
          <Button title="Look up vehicle" icon="search" onPress={() => lookup()} loading={looking} style={{ marginTop: 12 }} />
        </View>
        <View style={s.body}>
          {flash && (
            <View style={{ marginBottom: 14 }}>
              <Banner tone={flash.tone} icon={flash.tone === "blue" ? "checkmark-circle" : undefined} text={flash.text} />
            </View>
          )}
          {result && (
            <View style={[s.card, shadow]}>
              <View style={s.resultHead}>
                <Text style={s.resultPlate}>{result.plate_number}</Text>
                {booking ? (
                  <StatusPill label={booking.status === "ACTIVE" ? "Inside" : "Reserved"} tone={booking.status === "ACTIVE" ? "ink" : "blue"} />
                ) : (
                  <StatusPill label="No booking" tone="muted" />
                )}
              </View>
              {/* Who owns it */}
              {(booking?.user || result.vehicle) && (
                <View style={s.owner}>
                  <Ionicons name="person-circle-outline" size={20} color={colors.muted} />
                  <Text style={s.ownerText} numberOfLines={2}>
                    {(booking?.user ?? result.vehicle!.owner).name} · {prettyRole((booking?.user ?? result.vehicle!.owner).role)}
                    {(booking?.user ?? result.vehicle!.owner).phone ? ` · ${(booking?.user ?? result.vehicle!.owner).phone}` : ""}
                  </Text>
                </View>
              )}
              {result.vehicle?.description ? (
                <Text style={s.desc}>{result.vehicle.description} · {kindLabel(result.vehicle.vehicle_type)}</Text>
              ) : null}
              {!result.vehicle && !booking && <Text style={s.desc}>Not registered in the app (visitor or unknown vehicle).</Text>}
              {booking && (
                <View style={s.slotRow}>
                  <View style={s.slotBox}>
                    <Text style={s.slotSmall}>SLOT</Text>
                    <Text style={s.slotBig}>{booking.slot_label}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.lotName}>{booking.lot.name}</Text>
                    <Text style={s.lotMeta}>Zone {booking.lot.zone} · {floorLabel(booking.floor)}</Text>
                    <Text style={s.lotMeta}>
                      {booking.status === "ACTIVE"
                        ? `Inside since ${timeOf(booking.checked_in_at)} (${durationSince(booking.checked_in_at)})`
                        : `Reservation held ${countdown(booking.expires_at, Date.now())} more`}
                    </Text>
                  </View>
                </View>
              )}
              {booking?.status === "RESERVED" && (
                <Button title="Check in" icon="enter-outline" loading={acting} onPress={() => act(() => checkIn(result.plate_number))} style={{ marginTop: 16 }} />
              )}
              {booking?.status === "ACTIVE" && (
                <Button title="Check out" icon="exit-outline" variant="black" loading={acting} onPress={() => act(() => checkOut(result.plate_number))} style={{ marginTop: 16 }} />
              )}
              {/* Walk-in */}
              {!booking && (
                <>
                  <Text style={s.label}>Admit as walk-in</Text>
                  {!result.vehicle && (
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
                      {KINDS.map((k) => (
                        <Chip key={k.key} icon={k.icon} label={k.label} active={walkType === k.key} onPress={() => setWalkType(k.key)} />
                      ))}
                    </View>
                  )}
                  <View style={{ gap: 8 }}>
                    {lots.map((l) => {
                      const free = l.free[walkType];
                      const active = walkLot === l.id;
                      return (
                        <Pressable
                          key={l.id}
                          disabled={free === 0}
                          onPress={() => setWalkLot(l.id)}
                          style={[s.lotPick, active && s.lotPickActive, free === 0 && { opacity: 0.45 }]}
                        >
                          <Text style={[s.lotPickZone, active && { color: colors.white }]}>{l.zone}</Text>
                          <Text style={[s.lotPickName, active && { color: colors.white }]} numberOfLines={1}>{l.name}</Text>
                          <Text style={[s.lotPickFree, active && { color: "#7FB0FF" }, free === 0 && { color: colors.red }]}>
                            {free === 0 ? "Full" : `${free} free`}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                  <Button
                    title="Check in walk-in"
                    icon="enter-outline"
                    disabled={!walkLot}
                    loading={acting}
                    onPress={() => act(() => checkIn(result.plate_number, walkLot!, walkType))}
                    style={{ marginTop: 14 }}
                  />
                </>
              )}
            </View>
          )}
          {/* Activity */}
          <Text style={[s.label, { marginTop: result ? 26 : 6 }]}>Recent activity</Text>
          <View style={[s.card, shadow, { paddingVertical: 4 }]}>
            {!data ? (
              <ActivityIndicator color={colors.blue} style={{ marginVertical: 24 }} />
            ) : events.length === 0 ? (
              <Text style={s.empty}>No vehicles in or out yet.</Text>
            ) : (
              events.slice(0, 15).map((e, i) => (
                <Pressable
                  key={e.id}
                  onPress={() => { setPlate(e.plate_number); lookup(e.plate_number); }}
                  style={[s.event, i > 0 && s.eventBorder]}
                >
                  <View style={[s.eventIcon, { backgroundColor: e.kind === "ENTRY" ? colors.blueSoft : colors.bg }]}>
                    <Ionicons name={e.kind === "ENTRY" ? "arrow-down" : "arrow-up"} size={16} color={e.kind === "ENTRY" ? colors.blue : colors.ink} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.eventPlate}>{e.plate_number}</Text>
                    <Text style={s.eventMeta} numberOfLines={1}>{e.kind === "ENTRY" ? "In" : "Out"} · {e.lot} · {e.slot_label}</Text>
                  </View>
                  <Text style={s.eventTime}>{timeOf(e.created_at)}</Text>
                </Pressable>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.ink },
  hero: { backgroundColor: colors.ink, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 24 },
  heroTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 18 },
  heroSmall: { color: colors.faint, fontSize: 14 },
  heroTitle: { color: colors.white, fontSize: 26, fontWeight: "800", letterSpacing: -0.5 },
  onDuty: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: colors.ink2, paddingHorizontal: 12, height: 32, borderRadius: radius.pill },
  onDutyDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.blue },
  onDutyText: { color: colors.white, fontSize: 11, fontWeight: "800", letterSpacing: 1 },
  plateBox: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: colors.white, height: 64, borderRadius: radius.lg, paddingHorizontal: 16 },
  plateInput: { flex: 1, fontSize: 24, fontWeight: "800", color: colors.ink, letterSpacing: 1.5 },
  body: { backgroundColor: colors.bg, borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 20, minHeight: 600 },
  card: { backgroundColor: colors.white, borderRadius: radius.xl, padding: 16 },
  label: { fontSize: 13, fontWeight: "800", color: colors.muted, letterSpacing: 0.6, textTransform: "uppercase", marginTop: 18, marginBottom: 10 },
  resultHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  resultPlate: { fontSize: 24, fontWeight: "800", color: colors.ink, letterSpacing: 1 },
  owner: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 10 },
  ownerText: { flex: 1, fontSize: 14, fontWeight: "700", color: colors.ink },
  desc: { fontSize: 13, color: colors.muted, marginTop: 6 },
  slotRow: { flexDirection: "row", alignItems: "center", gap: 14, marginTop: 14, backgroundColor: colors.bg, borderRadius: radius.lg, padding: 12 },
  slotBox: { width: 66, height: 66, borderRadius: radius.md, backgroundColor: colors.ink, alignItems: "center", justifyContent: "center" },
  slotSmall: { fontSize: 9, fontWeight: "800", color: colors.faint, letterSpacing: 1 },
  slotBig: { fontSize: 20, fontWeight: "800", color: colors.white },
  lotName: { fontSize: 16, fontWeight: "800", color: colors.ink },
  lotMeta: { fontSize: 13, color: colors.muted, marginTop: 2 },
  lotPick: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: colors.bg, borderRadius: radius.md, paddingHorizontal: 14, height: 50 },
  lotPickActive: { backgroundColor: colors.ink },
  lotPickZone: { width: 22, fontSize: 17, fontWeight: "800", color: colors.ink },
  lotPickName: { flex: 1, fontSize: 15, fontWeight: "700", color: colors.ink },
  lotPickFree: { fontSize: 13, fontWeight: "800", color: colors.blue },
  event: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12 },
  eventBorder: { borderTopWidth: 1, borderTopColor: colors.line },
  eventIcon: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  eventPlate: { fontSize: 15, fontWeight: "800", color: colors.ink, letterSpacing: 0.5 },
  eventMeta: { fontSize: 12, color: colors.muted, marginTop: 2 },
  eventTime: { fontSize: 12, fontWeight: "700", color: colors.muted },
  empty: { color: colors.muted, textAlign: "center", paddingVertical: 22 },
});
```

## File: mobile/src/components/InsideList.tsx
```typescript
import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { Booking, checkOut, errorMessage, getInside } from "../../services/api";
import { ZONES, ZoneFilter, floorLabel, kindIcon } from "../data/parking";
import { useLive } from "../hooks/useLive";
import { durationSince, timeOf } from "../lib/format";
import { colors, radius, shadow } from "../theme";
import { Banner, Chip, EmptyState } from "./ui";
/** Every vehicle currently parked on campus, with one-tap check-out. */
export function InsideList() {
  const { data, error, refreshing, refresh, reload } = useLive<Booking[]>(getInside, 15000);
  const [zone, setZone] = useState<ZoneFilter>("All");
  const [busy, setBusy] = useState<number | null>(null);
  const list = useMemo(() => (data ?? []).filter((b) => zone === "All" || b.lot.zone === zone), [data, zone]);
  const confirmOut = useCallback(
    (b: Booking) => {
      Alert.alert(`Check out ${b.plate_number}?`, `${b.lot.name} · ${b.slot_label}`, [
        { text: "Cancel", style: "cancel" },
        {
          text: "Check out",
          onPress: async () => {
            try {
              setBusy(b.id);
              await checkOut(b.plate_number);
              reload();
            } catch (e) {
              Alert.alert("Couldn't check out", errorMessage(e));
            } finally {
              setBusy(null);
            }
          },
        },
      ]);
    },
    [reload]
  );
  return (
    <SafeAreaView style={s.root} edges={["top"]}>
      <StatusBar style="dark" />
      <View style={s.header}>
        <Text style={s.title}>Inside now</Text>
        <Text style={s.sub}>{data ? `${data.length} vehicles parked` : " "}</Text>
      </View>
      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 4 }}>
          {ZONES.map((z) => (
            <Chip key={z} label={z === "All" ? "All" : `Zone ${z}`} active={zone === z} onPress={() => setZone(z)} />
          ))}
        </ScrollView>
      </View>
      <ScrollView
        contentContainerStyle={s.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.blue} />}
      >
        {error && <Banner text={error} action="Retry" onAction={reload} />}
        {!data && !error && <ActivityIndicator color={colors.blue} style={{ marginTop: 40 }} />}
        {data && list.length === 0 && <EmptyState icon="car-outline" title="Nobody parked here" text="Vehicles appear here after they're checked in at the gate." />}
        {list.map((b) => (
          <View key={b.id} style={[s.card, shadow]}>
            <View style={s.icon}>
              <Ionicons name={kindIcon(b.vehicle_type)} size={20} color={colors.white} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.plate}>{b.plate_number}</Text>
              <Text style={s.meta} numberOfLines={1}>
                {b.lot.name} · {floorLabel(b.floor)} · {b.slot_label}
              </Text>
              <Text style={s.meta}>
                In at {timeOf(b.checked_in_at)} · {durationSince(b.checked_in_at)}
                {b.is_walk_in ? " · walk-in" : ""}
                {b.user ? ` · ${b.user.name}` : ""}
              </Text>
            </View>
            <Pressable onPress={() => confirmOut(b)} disabled={busy === b.id} style={s.out} hitSlop={6}>
              {busy === b.id ? <ActivityIndicator color={colors.white} size="small" /> : <Ionicons name="exit-outline" size={20} color={colors.white} />}
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12 },
  title: { fontSize: 28, fontWeight: "800", color: colors.ink, letterSpacing: -0.5 },
  sub: { fontSize: 14, color: colors.muted, marginTop: 2 },
  content: { padding: 20, paddingBottom: 140, gap: 12 },
  card: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: colors.white, borderRadius: radius.xl, padding: 14 },
  icon: { width: 46, height: 46, borderRadius: radius.md, backgroundColor: colors.ink, alignItems: "center", justifyContent: "center" },
  plate: { fontSize: 16, fontWeight: "800", color: colors.ink, letterSpacing: 0.5 },
  meta: { fontSize: 12, color: colors.muted, marginTop: 2 },
  out: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.blue, alignItems: "center", justifyContent: "center" },
});
```

## File: mobile/src/components/ProfileScreen.tsx
```typescript
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { Booking, changePassword, errorMessage, getApiUrl, getBookings, updateMe } from "../../services/api";
import { Button, StatusPill } from "./ui";
import { floorLabel, kindIcon } from "../data/parking";
import { useLive } from "../hooks/useLive";
import { dateTimeOf, prettyRole } from "../lib/format";
import { colors, radius, shadow } from "../theme";
type IconName = keyof typeof Ionicons.glyphMap;
const STATUS: Record<Booking["status"], { label: string; tone: "blue" | "red" | "ink" | "muted" }> = {
  RESERVED: { label: "Reserved", tone: "blue" },
  ACTIVE: { label: "Parked", tone: "ink" },
  COMPLETED: { label: "Completed", tone: "muted" },
  CANCELLED: { label: "Cancelled", tone: "red" },
  EXPIRED: { label: "Expired", tone: "red" },
};
export function ProfileScreen({ showHistory = true }: { showHistory?: boolean }) {
  const { user, setUser, logout } = useAuth();
  const [editOpen, setEditOpen] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);
  const fetchHistory = useCallback(() => (showHistory ? getBookings() : Promise.resolve([] as Booking[])), [showHistory]);
  const { data: history } = useLive<Booking[]>(fetchHistory, 0);
  function handleLogout() {
    Alert.alert("Log out?", "You'll need your password to sign back in.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log out",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/login");
        },
      },
    ]);
  }
  const rows: { icon: IconName; label: string; value?: string }[] = [
    { icon: "mail-outline", label: "Email", value: user?.email },
    { icon: "call-outline", label: "Phone", value: user?.phone || "Not added" },
    { icon: "id-card-outline", label: "Account type", value: prettyRole(user?.role) },
  ];
  return (
    <SafeAreaView style={s.root} edges={["top"]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
        <View style={s.top}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>{(user?.name || "?")[0]?.toUpperCase()}</Text>
          </View>
          <Text style={s.name}>{user?.name}</Text>
          <View style={s.badge}><Text style={s.badgeText}>{user?.role}</Text></View>
        </View>
        <View style={[s.card, shadow]}>
          {rows.map((r, i) => (
            <View key={r.label} style={[s.row, i > 0 && s.rowBorder]}>
              <View style={s.rowIcon}><Ionicons name={r.icon} size={18} color={colors.ink} /></View>
              <View style={{ flex: 1 }}>
                <Text style={s.rowLabel}>{r.label}</Text>
                <Text style={s.rowValue}>{r.value}</Text>
              </View>
            </View>
          ))}
        </View>
        <View style={[s.card, shadow, { marginTop: 14 }]}>
          <ActionRow icon="create-outline" label="Edit name & phone" onPress={() => setEditOpen(true)} />
          <ActionRow icon="key-outline" label="Change password" onPress={() => setPwOpen(true)} border />
          <ActionRow
            icon="server-outline"
            label="Server link"
            hint={getApiUrl().replace(/^https?:\/\//, "")}
            onPress={() => router.push({ pathname: "/connect", params: { change: "1" } } as never)}
            border
          />
        </View>
        {showHistory && (
          <>
            <Text style={s.section}>Recent parking</Text>
            <View style={[s.card, shadow]}>
              {!history?.length ? (
                <Text style={s.emptyText}>{history ? "No bookings yet." : "Loading…"}</Text>
              ) : (
                history.slice(0, 10).map((b, i) => (
                  <View key={b.id} style={[s.row, i > 0 && s.rowBorder]}>
                    <View style={s.rowIcon}><Ionicons name={kindIcon(b.vehicle_type)} size={18} color={colors.ink} /></View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.histTitle} numberOfLines={1}>{b.lot.name} · {b.slot_label}</Text>
                      <Text style={s.rowLabel}>{dateTimeOf(b.created_at)} · {floorLabel(b.floor)} · {b.plate_number}</Text>
                    </View>
                    <StatusPill label={STATUS[b.status].label} tone={STATUS[b.status].tone} />
                  </View>
                ))
              )}
            </View>
          </>
        )}
        <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
          <Button title="Log out" variant="red" icon="log-out-outline" onPress={handleLogout} />
        </View>
      </ScrollView>
      <EditSheet
        visible={editOpen}
        onClose={() => setEditOpen(false)}
        initial={{ name: user?.name ?? "", phone: user?.phone ?? "" }}
        onSave={async (v) => {
          const data = await updateMe(v);
          setUser(data.user);
        }}
      />
      <PasswordSheet visible={pwOpen} onClose={() => setPwOpen(false)} />
    </SafeAreaView>
  );
}
function ActionRow({ icon, label, hint, onPress, border }: { icon: IconName; label: string; hint?: string; onPress: () => void; border?: boolean }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [s.row, border && s.rowBorder, pressed && { opacity: 0.6 }]}>
      <View style={s.rowIcon}><Ionicons name={icon} size={18} color={colors.ink} /></View>
      <View style={{ flex: 1 }}>
        <Text style={s.actionLabel}>{label}</Text>
        {hint ? <Text style={s.rowLabel} numberOfLines={1}>{hint}</Text> : null}
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.faint} />
    </Pressable>
  );
}
function Sheet({ visible, onClose, title, children }: { visible: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={s.backdrop}>
        <Pressable style={{ flex: 1 }} onPress={onClose} />
        <View style={s.sheet}>
          <View style={s.grab} />
          <Text style={s.sheetTitle}>{title}</Text>
          {children}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
function EditSheet({
  visible,
  onClose,
  initial,
  onSave,
}: {
  visible: boolean;
  onClose: () => void;
  initial: { name: string; phone: string };
  onSave: (v: { name: string; phone: string }) => Promise<void>;
}) {
  const [name, setName] = useState(initial.name);
  const [phone, setPhone] = useState(initial.phone);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (visible) {
      setName(initial.name);
      setPhone(initial.phone);
      setError(null);
    }
  }, [visible, initial.name, initial.phone]);
  return (
    <Sheet visible={visible} onClose={onClose} title="Edit profile">
      <TextInput style={s.input} placeholder="Full name" placeholderTextColor={colors.faint} value={name} onChangeText={setName} autoCapitalize="words" onFocus={() => setError(null)} />
      <TextInput style={s.input} placeholder="Phone" placeholderTextColor={colors.faint} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      {error && <Text style={s.error}>{error}</Text>}
      <Button
        title="Save"
        loading={saving}
        style={{ marginTop: 14 }}
        onPress={async () => {
          if (!name.trim()) return setError("Name can't be empty.");
          try {
            setSaving(true);
            await onSave({ name: name.trim(), phone: phone.trim() });
            onClose();
          } catch (e) {
            setError(errorMessage(e));
          } finally {
            setSaving(false);
          }
        }}
      />
    </Sheet>
  );
}
function PasswordSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  function close() {
    setCurrent("");
    setNext("");
    setError(null);
    onClose();
  }
  return (
    <Sheet visible={visible} onClose={close} title="Change password">
      <TextInput style={s.input} placeholder="Current password" placeholderTextColor={colors.faint} secureTextEntry value={current} onChangeText={setCurrent} autoCapitalize="none" />
      <TextInput style={s.input} placeholder="New password (min 6 characters)" placeholderTextColor={colors.faint} secureTextEntry value={next} onChangeText={setNext} autoCapitalize="none" />
      {error && <Text style={s.error}>{error}</Text>}
      <Button
        title="Update password"
        loading={saving}
        style={{ marginTop: 14 }}
        onPress={async () => {
          if (next.length < 6) return setError("New password must be at least 6 characters.");
          try {
            setSaving(true);
            await changePassword(current, next);
            close();
            Alert.alert("Password updated");
          } catch (e) {
            setError(errorMessage(e).replace(/^current_password: /, ""));
          } finally {
            setSaving(false);
          }
        }}
      />
    </Sheet>
  );
}
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  top: { alignItems: "center", paddingTop: 28, paddingBottom: 24 },
  avatar: { width: 92, height: 92, borderRadius: 46, backgroundColor: colors.ink, alignItems: "center", justifyContent: "center", borderWidth: 4, borderColor: colors.blue },
  avatarText: { color: colors.white, fontSize: 36, fontWeight: "800" },
  name: { fontSize: 24, fontWeight: "800", color: colors.ink, marginTop: 14, letterSpacing: -0.4 },
  badge: { backgroundColor: colors.blueSoft, paddingHorizontal: 12, paddingVertical: 5, borderRadius: radius.pill, marginTop: 8 },
  badgeText: { color: colors.blue, fontWeight: "800", fontSize: 12, letterSpacing: 0.5 },
  card: { marginHorizontal: 20, backgroundColor: colors.white, borderRadius: radius.xl, paddingHorizontal: 16 },
  row: { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 14 },
  rowBorder: { borderTopWidth: 1, borderTopColor: colors.line },
  rowIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center" },
  rowLabel: { fontSize: 12, color: colors.muted, fontWeight: "600", marginTop: 2 },
  rowValue: { fontSize: 16, color: colors.ink, fontWeight: "700", marginTop: 2 },
  actionLabel: { fontSize: 15, color: colors.ink, fontWeight: "700" },
  histTitle: { fontSize: 15, color: colors.ink, fontWeight: "700" },
  section: { fontSize: 13, fontWeight: "800", color: colors.muted, letterSpacing: 0.6, textTransform: "uppercase", marginTop: 26, marginBottom: 10, marginHorizontal: 24 },
  emptyText: { color: colors.muted, paddingVertical: 18, textAlign: "center" },
  backdrop: { flex: 1, backgroundColor: "rgba(10,10,11,0.5)", justifyContent: "flex-end" },
  sheet: { backgroundColor: colors.white, borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 22, paddingBottom: 34 },
  grab: { alignSelf: "center", width: 44, height: 5, borderRadius: 3, backgroundColor: colors.line, marginBottom: 16 },
  sheetTitle: { fontSize: 24, fontWeight: "800", color: colors.ink, marginBottom: 6, letterSpacing: -0.4 },
  input: { backgroundColor: colors.bg, borderRadius: radius.md, paddingHorizontal: 16, height: 54, marginTop: 10, fontSize: 16, color: colors.ink },
  error: { color: colors.red, fontSize: 13, fontWeight: "600", marginTop: 10, marginLeft: 4 },
});
```

## File: mobile/src/components/ui.tsx
```typescript
import { ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  StyleProp,
  View,
  ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, shadow } from "../theme";
type IconName = keyof typeof Ionicons.glyphMap;
export function Chip({
  label,
  active,
  onPress,
  icon,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
  icon?: IconName;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[s.chip, active ? s.chipActive : s.chipIdle]}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={15}
          color={active ? colors.white : colors.ink}
          style={{ marginRight: 6 }}
        />
      )}
      <Text style={[s.chipText, active && { color: colors.white }]}>{label}</Text>
    </Pressable>
  );
}
export function Button({
  title,
  onPress,
  loading,
  variant = "blue",
  icon,
  style,
  disabled,
}: {
  title: string;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "blue" | "black" | "red" | "ghost";
  icon?: IconName;
  style?: StyleProp<ViewStyle>;
}) {
  const bg =
    variant === "blue" ? colors.blue
    : variant === "black" ? colors.ink
    : variant === "red" ? colors.red
    : colors.white;
  const fg = variant === "ghost" ? colors.ink : colors.white;
  return (
    <Pressable
      onPress={onPress}
      disabled={loading || disabled}
      style={({ pressed }) => [
        s.btn,
        { backgroundColor: bg, opacity: disabled ? 0.4 : pressed || loading ? 0.85 : 1 },
        variant === "ghost" && { borderWidth: 1, borderColor: colors.line },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {icon && <Ionicons name={icon} size={18} color={fg} style={{ marginRight: 8 }} />}
          <Text style={[s.btnText, { color: fg }]}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
}
export function RoundButton({
  icon,
  onPress,
  dark,
}: {
  icon: IconName;
  onPress?: () => void;
  dark?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={6}
      style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }, s.round, dark ? { backgroundColor: colors.ink } : { backgroundColor: colors.white }, !dark && shadow]}
    >
      <Ionicons name={icon} size={20} color={dark ? colors.white : colors.ink} />
    </Pressable>
  );
}
export function Card({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[s.card, shadow, style]}>{children}</View>;
}
export function SectionHeader({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <View style={s.sectionHeader}>
      <Text style={s.sectionTitle}>{title}</Text>
      {action && (
        <Pressable onPress={onAction}>
          <Text style={s.sectionAction}>{action}</Text>
        </Pressable>
      )}
    </View>
  );
}
const s = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    height: 44,
    borderRadius: radius.pill,
    marginRight: 10,
  },
  chipActive: { backgroundColor: colors.ink },
  chipIdle: { backgroundColor: colors.white, ...(shadow as object) },
  chipText: { fontSize: 15, fontWeight: "600", color: colors.ink },
  btn: {
    height: 56,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: { fontSize: 16, fontWeight: "700" },
  round: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },
  card: { backgroundColor: colors.white, borderRadius: radius.xl, padding: 16 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 26,
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 20, fontWeight: "800", color: colors.ink, letterSpacing: -0.3 },
  sectionAction: { fontSize: 14, fontWeight: "700", color: colors.blue },
  banner: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14, borderRadius: radius.md },
  bannerText: { flex: 1, fontSize: 14, fontWeight: "600", lineHeight: 19 },
  bannerAction: { fontSize: 14, fontWeight: "800" },
  empty: { backgroundColor: colors.white, borderRadius: radius.xl, padding: 26, alignItems: "center" },
  emptyIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.blueSoft, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: "800", color: colors.ink, textAlign: "center" },
  emptyText: { color: colors.muted, textAlign: "center", marginTop: 6, lineHeight: 20 },
  pill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill, alignSelf: "flex-start" },
  pillText: { fontSize: 12, fontWeight: "800" },
});
export function Banner({
  tone = "red",
  icon,
  text,
  action,
  onAction,
}: {
  tone?: "red" | "blue";
  icon?: IconName;
  text: string;
  action?: string;
  onAction?: () => void;
}) {
  const fg = tone === "red" ? colors.red : colors.blue;
  return (
    <View style={[s.banner, { backgroundColor: tone === "red" ? colors.redSoft : colors.blueSoft }]}>
      <Ionicons name={icon ?? (tone === "red" ? "alert-circle" : "information-circle")} size={20} color={fg} />
      <Text style={[s.bannerText, { color: fg }]}>{text}</Text>
      {action && (
        <Pressable onPress={onAction} hitSlop={10}>
          <Text style={[s.bannerAction, { color: fg }]}>{action}</Text>
        </Pressable>
      )}
    </View>
  );
}
export function EmptyState({
  icon,
  title,
  text,
  children,
}: {
  icon: IconName;
  title: string;
  text?: string;
  children?: ReactNode;
}) {
  return (
    <View style={[s.empty, shadow]}>
      <View style={s.emptyIcon}>
        <Ionicons name={icon} size={30} color={colors.blue} />
      </View>
      <Text style={s.emptyTitle}>{title}</Text>
      {text && <Text style={s.emptyText}>{text}</Text>}
      {children}
    </View>
  );
}
export function StatusPill({ label, tone }: { label: string; tone: "blue" | "red" | "ink" | "muted" }) {
  const map = {
    blue: [colors.blueSoft, colors.blue],
    red: [colors.redSoft, colors.red],
    ink: [colors.ink, colors.white],
    muted: [colors.bg, colors.muted],
  } as const;
  const [bg, fg] = map[tone];
  return (
    <View style={[s.pill, { backgroundColor: bg }]}>
      <Text style={[s.pillText, { color: fg }]}>{label}</Text>
    </View>
  );
}
```

## File: mobile/src/context/AuthContext.tsx
```typescript
import { createContext, useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";
import {
  ApiError,
  clearTokens,
  getMe,
  loadApiUrl,
  login as apiLogin,
  logout as apiLogout,
  onSessionExpired,
  register as apiRegister,
} from "../../services/api";
export type Role = "STUDENT" | "FACULTY" | "VISITOR" | "VENDOR" | "GUARD" | "ADMIN";
export type User = {
  id: number;
  email: string;
  name: string;
  phone: string;
  role: Role;
  created_at: string;
};
type AuthContextType = {
  user: User | null;
  loading: boolean;
  hasServer: boolean;
  setHasServer: (v: boolean) => void;
  setUser: (u: User) => void;
  login: (email: string, password: string) => Promise<User>;
  register: (email: string, password: string, name: string, phone: string, role: string) => Promise<User>;
  logout: () => Promise<void>;
};
const AuthContext = createContext<AuthContextType | null>(null);
/** Where each role lands after signing in. Everyone who parks shares the driver app. */
export function homeFor(role?: string) {
  if (role === "GUARD") return "/guard";
  if (role === "ADMIN") return "/admin";
  return "/student";
}
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasServer, setHasServer] = useState(false);
  useEffect(() => {
    // Refresh token expired or revoked -> back to the login screen.
    onSessionExpired(() => {
      setUserState(null);
      router.replace("/login");
    });
    restoreSession();
    return () => onSessionExpired(null);
  }, []);
  async function restoreSession() {
    try {
      const saved = await loadApiUrl(); // server link must be known before any API call
      setHasServer(!!saved);
      if (!saved) return;
      const token = await SecureStore.getItemAsync("access_token");
      if (!token) return;
      const data = await getMe();
      setUserState(data.user);
    } catch (error) {
      // Only drop the session when the server actually rejected it; if the
      // server is just unreachable the user stays signed in for next time.
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        await clearTokens();
      }
      setUserState(null);
    } finally {
      setLoading(false);
    }
  }
  async function login(email: string, password: string) {
    const data = await apiLogin(email, password);
    setUserState(data.user);
    return data.user as User;
  }
  async function register(email: string, password: string, name: string, phone: string, role: string) {
    const data = await apiRegister(email, password, name, phone, role);
    setUserState(data.user);
    return data.user as User;
  }
  async function logout() {
    try {
      await apiLogout();
    } catch {
      // The local session is cleared regardless.
    } finally {
      setUserState(null);
      await clearTokens();
    }
  }
  return (
    <AuthContext.Provider
      value={{ user, loading, hasServer, setHasServer, setUser: setUserState, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
```

## File: mobile/src/data/parking.ts
```typescript
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
```

## File: mobile/src/hooks/useLive.ts
```typescript
import { useCallback, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";
import * as Location from "expo-location";
import { errorMessage } from "../../services/api";
/**
 * Loads data when the screen is focused and re-polls every `intervalMs`
 * while it stays focused, so availability numbers stay current.
 */
export function useLive<T>(fetcher: () => Promise<T>, intervalMs = 20000) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fetchRef = useRef(fetcher);
  fetchRef.current = fetcher;
  const load = useCallback(async () => {
    try {
      const d = await fetchRef.current();
      setData(d);
      setError(null);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);
  useFocusEffect(
    useCallback(() => {
      load();
      if (!intervalMs) return;
      const t = setInterval(load, intervalMs);
      return () => clearInterval(t);
    }, [load, intervalMs])
  );
  const refresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);
  return { data, error, loading, refreshing, refresh, reload: load, setData };
}
/** The user's position if they've allowed location; asks only when `ask` is true. */
export function useMyLocation(ask: boolean) {
  const [me, setMe] = useState<{ lat: number; lng: number } | null>(null);
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        try {
          const perm = ask
            ? await Location.requestForegroundPermissionsAsync()
            : await Location.getForegroundPermissionsAsync();
          if (perm.status !== "granted") return;
          const last = await Location.getLastKnownPositionAsync();
          if (last && !cancelled) setMe({ lat: last.coords.latitude, lng: last.coords.longitude });
          const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          if (!cancelled) setMe({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        } catch {}
      })();
      return () => {
        cancelled = true;
      };
    }, [ask])
  );
  return me;
}
```

## File: mobile/src/lib/format.ts
```typescript
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
```

## File: mobile/src/theme.ts
```typescript
import { Platform } from "react-native";
// Palette: black + white / blue + black / red
export const colors = {
  ink: "#0A0A0B",
  ink2: "#1A1A1D",
  white: "#FFFFFF",
  bg: "#F4F5F8",
  line: "#E7E8EC",
  muted: "#6B7280",
  faint: "#A3A8B3",
  blue: "#1F6FEB",
  blueDark: "#1553B8",
  blueSoft: "#E8F0FE",
  red: "#E5383B",
  redSoft: "#FDECEC",
};
export const radius = { sm: 10, md: 14, lg: 20, xl: 28, pill: 999 };
export const shadow = Platform.select({
  ios: {
    shadowColor: "#0A0A0B",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
  },
  default: { elevation: 4 },
})!;
export const type = {
  h1: { fontSize: 28, fontWeight: "800" as const, color: colors.ink, letterSpacing: -0.5 },
  h2: { fontSize: 20, fontWeight: "800" as const, color: colors.ink, letterSpacing: -0.3 },
  body: { fontSize: 15, color: colors.ink },
  small: { fontSize: 13, color: colors.muted },
};
```

## File: mobile/AGENTS.md
```markdown
# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.
```

## File: mobile/app.json
```json
{
  "expo": {
    "name": "Thapar Parking",
    "slug": "thapar-parking",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "mobile",
    "userInterfaceStyle": "light",
    "ios": {
      "icon": "./assets/expo.icon",
      "bundleIdentifier": "com.thapar.parking"
    },
    "android": {
      "adaptiveIcon": {
        "backgroundColor": "#0A0A0B",
        "foregroundImage": "./assets/images/android-icon-foreground.png",
        "backgroundImage": "./assets/images/android-icon-background.png",
        "monochromeImage": "./assets/images/android-icon-monochrome.png"
      },
      "predictiveBackGestureEnabled": false,
      "package": "com.thapar.parking",
      "usesCleartextTraffic": true
    },
    "web": {
      "output": "static",
      "favicon": "./assets/images/favicon.png"
    },
    "plugins": [
      "expo-router",
      [
        "expo-splash-screen",
        {
          "backgroundColor": "#0A0A0B",
          "image": "./assets/images/splash-icon.png",
          "imageWidth": 76
        }
      ],
      "expo-secure-store",
      [
        "expo-location",
        {
          "locationWhenInUsePermission": "Thapar Parking uses your location to show nearby parking and route you to it."
        }
      ]
    ],
    "experiments": {
      "typedRoutes": true,
      "reactCompiler": true
    }
  }
}
```

## File: mobile/CLAUDE.md
```markdown
@AGENTS.md
```

## File: mobile/eas.json
```json
{
  "cli": { "version": ">= 16.0.0" },
  "build": {
    "preview": {
      "distribution": "internal",
      "android": { "buildType": "apk" }
    },
    "production": {
      "android": { "buildType": "app-bundle" }
    }
  }
}
```

## File: mobile/expo-env.d.ts
```typescript
/// <reference types="expo/types" />
// NOTE: This file should not be edited and should be in your git ignore
```

## File: mobile/LICENSE
```
The MIT License (MIT)

Copyright (c) 2015-present 650 Industries, Inc. (aka Expo)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## File: mobile/package.json
```json
{
  "name": "thapar-parking",
  "main": "expo-router/entry",
  "version": "1.0.0",
  "dependencies": {
    "@expo/ui": "~57.0.19",
    "@expo/vector-icons": "^15.0.2",
    "expo": "~57.0.24",
    "expo-constants": "~57.0.19",
    "expo-device": "~57.0.2",
    "expo-font": "~57.0.4",
    "expo-glass-effect": "~57.0.3",
    "expo-image": "~57.0.5",
    "expo-linking": "~57.0.10",
    "expo-location": "~57.0.19",
    "expo-router": "~57.0.22",
    "expo-secure-store": "~57.0.4",
    "expo-splash-screen": "~57.0.9",
    "expo-status-bar": "~57.0.1",
    "expo-symbols": "~57.0.3",
    "expo-system-ui": "~57.0.4",
    "expo-web-browser": "~57.0.3",
    "react": "19.2.3",
    "react-dom": "19.2.3",
    "react-native": "0.86.3",
    "react-native-gesture-handler": "~2.32.0",
    "react-native-reanimated": "4.5.1",
    "react-native-safe-area-context": "~5.7.0",
    "react-native-screens": "~4.26.0",
    "react-native-web": "~0.21.0",
    "react-native-webview": "13.16.1",
    "react-native-worklets": "0.10.1"
  },
  "devDependencies": {
    "@types/react": "~19.2.2",
    "typescript": "~6.0.3"
  },
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "lint": "expo lint",
    "typecheck": "tsc --noEmit"
  },
  "private": true
}
```

## File: mobile/tsconfig.json
```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "paths": {
      "@/*": [
        "./src/*"
      ],
      "@/assets/*": [
        "./assets/*"
      ]
    }
  },
  "include": [
    "**/*.ts",
    "**/*.tsx",
    ".expo/types/**/*.ts",
    "expo-env.d.ts"
  ]
}
```
