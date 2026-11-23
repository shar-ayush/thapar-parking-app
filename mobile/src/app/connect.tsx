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
