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
