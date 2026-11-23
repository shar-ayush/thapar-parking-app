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
