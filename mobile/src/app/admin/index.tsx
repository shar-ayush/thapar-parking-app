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
