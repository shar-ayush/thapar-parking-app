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
