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
