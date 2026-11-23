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
  KeyboardTypeOptions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { useAuth } from "../context/AuthContext";
import { Button, RoundButton } from "../components/ui";
import { colors, radius } from "../theme";

type IconName = keyof typeof Ionicons.glyphMap;

// Staff roles (Guard / Admin) are intentionally not self-service.
const ROLES: { key: string; label: string; icon: IconName; hint: string }[] = [
  { key: "STUDENT", label: "Student", icon: "school", hint: "Campus student" },
  { key: "FACULTY", label: "Faculty", icon: "briefcase", hint: "Teaching / staff" },
  { key: "VISITOR", label: "Visitor", icon: "walk", hint: "Guest access" },
  { key: "VENDOR", label: "Vendor", icon: "storefront", hint: "Delivery / shop" },
];

type FieldProps = {
  id: string;
  icon: IconName;
  placeholder: string;
  value: string;
  onChangeText: (v: string) => void;
  focused: boolean;
  onFocusId: (id: string | null) => void;
  keyboardType?: KeyboardTypeOptions;
  secure?: boolean;
  capitalize?: "none" | "words";
  error?: boolean;
  right?: React.ReactNode;
};

// Must live at module level: defining a component inside the screen makes React
// remount it on every keystroke, which dismisses the keyboard.
function Field(props: FieldProps) {
  return (
    <View style={[s.field, props.focused && s.fieldFocus, props.error && s.fieldError]}>
      <Ionicons name={props.icon} size={20} color={props.error ? colors.red : colors.muted} />
      <TextInput
        style={s.input}
        placeholder={props.placeholder}
        placeholderTextColor={colors.faint}
        value={props.value}
        onChangeText={props.onChangeText}
        keyboardType={props.keyboardType}
        secureTextEntry={props.secure}
        autoCapitalize={props.capitalize ?? "none"}
        autoCorrect={false}
        onFocus={() => props.onFocusId(props.id)}
        onBlur={() => props.onFocusId(null)}
      />
      {props.right}
    </View>
  );
}

export default function SignupScreen() {
  const { register } = useAuth();

  const [role, setRole] = useState("STUDENT");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [focus, setFocus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const mismatch = confirm.length > 0 && confirm !== password;
  const strength =
    password.length === 0 ? 0
    : password.length < 6 ? 1
    : /[A-Z]/.test(password) && /\d/.test(password) && password.length >= 8 ? 3
    : 2;

  async function handleSignup() {
    if (!name.trim() || !email.trim() || !password) {
      Alert.alert("Missing information", "Name, email and password are required.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Weak password", "Use at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      Alert.alert("Passwords don't match", "Re-enter your password.");
      return;
    }
    try {
      setLoading(true);
      await register(email.trim(), password, name.trim(), phone.trim(), role);
      router.replace("/");
    } catch (e) {
      Alert.alert("Couldn't create account", e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={s.root}>
      <StatusBar style="light" />
      <SafeAreaView edges={["top"]} style={s.hero}>
        <View style={s.topRow}>
          <RoundButton icon="arrow-back" onPress={() => router.back()} />
          <View style={s.stepPill}>
            <Ionicons name="car-sport" size={14} color={colors.white} />
            <Text style={s.stepText}>Thapar Parking</Text>
          </View>
        </View>
        <Text style={s.heroTitle}>Create your{"\n"}account</Text>
        <Text style={s.heroSub}>Takes less than a minute.</Text>
      </SafeAreaView>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView
          style={s.sheet}
          contentContainerStyle={s.sheetContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={s.label}>I am a</Text>
          <View style={s.roleGrid}>
            {ROLES.map((r) => {
              const active = role === r.key;
              return (
                <Pressable key={r.key} onPress={() => setRole(r.key)} style={[s.role, active ? s.roleActive : s.roleIdle]}>
                  <Ionicons name={r.icon} size={22} color={active ? colors.white : colors.ink} />
                  <View style={{ flex: 1 }}>
                    <Text style={[s.roleName, active && { color: colors.white }]}>{r.label}</Text>
                    <Text style={[s.roleHint, active && { color: "#A3A8B3" }]} numberOfLines={1}>{r.hint}</Text>
                  </View>
                  {active && <Ionicons name="checkmark-circle" size={20} color={colors.blue} />}
                </Pressable>
              );
            })}
          </View>

          <Text style={[s.label, { marginTop: 22 }]}>Your details</Text>
          <Field id="name" focused={focus === "name"} onFocusId={setFocus} icon="person-outline" placeholder="Full name" value={name} onChangeText={setName} capitalize="words" />
          <Field id="email" focused={focus === "email"} onFocusId={setFocus} icon="mail-outline" placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
          <Field id="phone" focused={focus === "phone"} onFocusId={setFocus} icon="call-outline" placeholder="Phone (optional)" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

          <Text style={[s.label, { marginTop: 10 }]}>Password</Text>
          <Field
            id="password" focused={focus === "password"} onFocusId={setFocus}
            icon="lock-closed-outline"
            placeholder="Password (min 6 characters)"
            value={password}
            onChangeText={setPassword}
            secure={!show}
            right={
              <Pressable onPress={() => setShow(!show)} hitSlop={10}>
                <Ionicons name={show ? "eye-off-outline" : "eye-outline"} size={20} color={colors.muted} />
              </Pressable>
            }
          />
          {password.length > 0 && (
            <View style={s.meter}>
              {[1, 2, 3].map((i) => (
                <View
                  key={i}
                  style={[
                    s.meterBar,
                    i <= strength && { backgroundColor: strength === 1 ? colors.red : colors.blue },
                  ]}
                />
              ))}
              <Text style={[s.meterText, strength === 1 && { color: colors.red }]}>
                {strength === 1 ? "Too short" : strength === 2 ? "OK" : "Strong"}
              </Text>
            </View>
          )}
          <Field
            id="confirm" focused={focus === "confirm"} onFocusId={setFocus}
            icon="shield-checkmark-outline"
            placeholder="Confirm password"
            value={confirm}
            onChangeText={setConfirm}
            secure={!show}
            error={mismatch}
          />
          {mismatch && <Text style={s.errorText}>Passwords don't match</Text>}

          <Button title="Create account" onPress={handleSignup} loading={loading} style={{ marginTop: 14 }} />

          <View style={s.switchRow}>
            <Text style={s.switchText}>Already have an account?</Text>
            <Pressable onPress={() => router.back()} hitSlop={10}>
              <Text style={s.switchLink}>Sign in</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.ink },
  hero: { paddingHorizontal: 24, paddingBottom: 28 },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8, marginBottom: 22 },
  stepPill: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: colors.blue, paddingHorizontal: 12, height: 32, borderRadius: radius.pill },
  stepText: { color: colors.white, fontSize: 12, fontWeight: "800" },
  heroTitle: { color: colors.white, fontSize: 36, fontWeight: "800", letterSpacing: -1, lineHeight: 40 },
  heroSub: { color: "#A3A8B3", fontSize: 15, marginTop: 8 },

  sheet: { flex: 1, backgroundColor: colors.white, borderTopLeftRadius: 36, borderTopRightRadius: 36 },
  sheetContent: { padding: 24, paddingTop: 28, paddingBottom: 50 },
  label: { fontSize: 13, fontWeight: "800", color: colors.muted, letterSpacing: 0.6, textTransform: "uppercase", marginBottom: 12 },

  roleGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  role: { width: "48.5%", flexDirection: "row", alignItems: "center", gap: 10, padding: 14, borderRadius: radius.lg, borderWidth: 1.5 },
  roleIdle: { backgroundColor: colors.bg, borderColor: "transparent" },
  roleActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  roleName: { fontSize: 15, fontWeight: "800", color: colors.ink },
  roleHint: { fontSize: 11, color: colors.muted, marginTop: 1 },

  field: { flexDirection: "row", alignItems: "center", gap: 12, height: 58, paddingHorizontal: 16, borderRadius: radius.lg, backgroundColor: colors.bg, borderWidth: 1.5, borderColor: "transparent", marginBottom: 12 },
  fieldFocus: { borderColor: colors.blue, backgroundColor: colors.white },
  fieldError: { borderColor: colors.red, backgroundColor: colors.redSoft },
  input: { flex: 1, fontSize: 16, color: colors.ink },

  meter: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: -2, marginBottom: 12, paddingHorizontal: 4 },
  meterBar: { flex: 1, height: 4, borderRadius: 2, backgroundColor: colors.line },
  meterText: { fontSize: 12, fontWeight: "700", color: colors.blue, marginLeft: 6, width: 56 },
  errorText: { color: colors.red, fontSize: 13, fontWeight: "600", marginTop: -4, marginBottom: 4, marginLeft: 4 },

  switchRow: { flexDirection: "row", justifyContent: "center", gap: 6, marginTop: 22 },
  switchText: { color: colors.muted, fontSize: 15 },
  switchLink: { color: colors.blue, fontSize: 15, fontWeight: "800" },
});
