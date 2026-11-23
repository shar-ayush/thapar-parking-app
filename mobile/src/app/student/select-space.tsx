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
