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
