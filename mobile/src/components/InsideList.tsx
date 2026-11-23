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
