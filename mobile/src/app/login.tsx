import { useState } from "react";
import {
  Alert,
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
import { router } from "expo-router";

import { useAuth } from "../context/AuthContext";
import { getApiUrl } from "../../services/api";
import { Button } from "../components/ui";
import { colors, radius } from "../theme";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focus, setFocus] = useState<"email" | "password" | null>(null);

  const { login } = useAuth();

  async function handleLogin() {
    if (!email.trim() || !password) {
      Alert.alert("Missing information", "Enter your email and password.");
      return;
    }
    try {
      setLoading(true);
      await login(email.trim(), password);
      router.replace("/");
    } catch (error) {
      Alert.alert(
        "Login failed",
        error instanceof Error ? error.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={s.root}>
      <StatusBar style="light" />
      <SafeAreaView edges={["top"]} style={s.hero}>
        <View style={s.logo}>
          <Ionicons name="car-sport" size={30} color={colors.white} />
        </View>
        <Text style={s.brand}>Thapar{"\n"}Parking</Text>
        <Text style={s.tagline}>Find a spot. Park smart. Get in faster.</Text>
        <View style={s.dots}>
          <View style={[s.dot, { backgroundColor: colors.blue }]} />
          <View style={[s.dot, { backgroundColor: colors.red }]} />
          <View style={[s.dot, { backgroundColor: colors.white }]} />
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={s.sheetWrap}
      >
        <ScrollView
          style={s.sheet}
          contentContainerStyle={s.sheetContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={s.title}>Welcome back</Text>
          <Text style={s.sub}>Sign in with your campus account</Text>

          <View style={[s.field, focus === "email" && s.fieldFocus]}>
            <Ionicons name="mail-outline" size={20} color={colors.muted} />
            <TextInput
              style={s.input}
              placeholder="Email"
              placeholderTextColor={colors.faint}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              onFocus={() => setFocus("email")}
              onBlur={() => setFocus(null)}
            />
          </View>

          <View style={[s.field, focus === "password" && s.fieldFocus]}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.muted} />
            <TextInput
              style={s.input}
              placeholder="Password"
              placeholderTextColor={colors.faint}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!show}
              autoCapitalize="none"
              onFocus={() => setFocus("password")}
              onBlur={() => setFocus(null)}
            />
            <Pressable onPress={() => setShow(!show)} hitSlop={10}>
              <Ionicons
                name={show ? "eye-off-outline" : "eye-outline"}
                size={20}
                color={colors.muted}
              />
            </Pressable>
          </View>

          <Button title="Sign in" onPress={handleLogin} loading={loading} style={{ marginTop: 8 }} />

          <View style={s.switchRow}>
            <Text style={s.switchText}>New to Thapar Parking?</Text>
            <Pressable onPress={() => router.push("/signup" as never)} hitSlop={10}>
              <Text style={s.switchLink}>Create account</Text>
            </Pressable>
          </View>

          <Pressable onPress={() => router.push("/connect?change=1" as never)} style={s.server}>
            <View style={s.serverDot} />
            <Text style={s.serverText} numberOfLines={1}>
              {getApiUrl().replace(/^https?:\/\//, "")}
            </Text>
            <Text style={s.switchLink}>Change</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.ink },
  hero: { paddingHorizontal: 28, paddingTop: 24, paddingBottom: 36 },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: colors.blue,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
  },
  brand: { color: colors.white, fontSize: 44, fontWeight: "800", letterSpacing: -1.5, lineHeight: 48 },
  tagline: { color: "#A3A8B3", fontSize: 16, marginTop: 12 },
  dots: { flexDirection: "row", gap: 6, marginTop: 22 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  sheetWrap: { flex: 1 },
  sheet: { flex: 1, backgroundColor: colors.white, borderTopLeftRadius: 36, borderTopRightRadius: 36 },
  sheetContent: { padding: 28, paddingTop: 32 },
  title: { fontSize: 26, fontWeight: "800", color: colors.ink, letterSpacing: -0.5 },
  sub: { fontSize: 15, color: colors.muted, marginTop: 6, marginBottom: 26 },
  field: {
    flexDirection: "row",
    alignItems: "center",
    height: 58,
    paddingHorizontal: 16,
    gap: 12,
    borderRadius: radius.lg,
    backgroundColor: colors.bg,
    borderWidth: 1.5,
    borderColor: "transparent",
    marginBottom: 14,
  },
  fieldFocus: { borderColor: colors.blue, backgroundColor: colors.white },
  input: { flex: 1, fontSize: 16, color: colors.ink },
  server: { flexDirection: "row", alignItems: "center", gap: 8, alignSelf: "center", marginTop: 26, paddingHorizontal: 14, height: 38, borderRadius: radius.pill, backgroundColor: colors.bg, maxWidth: "100%" },
  serverDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.blue },
  serverText: { color: colors.muted, fontSize: 13, fontWeight: "600", flexShrink: 1 },
  switchRow: { flexDirection: "row", justifyContent: "center", gap: 6, marginTop: 24 },
  switchText: { color: colors.muted, fontSize: 15 },
  switchLink: { color: colors.blue, fontSize: 15, fontWeight: "800" },
});
