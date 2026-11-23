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
