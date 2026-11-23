import { ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  StyleProp,
  View,
  ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, shadow } from "../theme";

type IconName = keyof typeof Ionicons.glyphMap;

export function Chip({
  label,
  active,
  onPress,
  icon,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
  icon?: IconName;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[s.chip, active ? s.chipActive : s.chipIdle]}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={15}
          color={active ? colors.white : colors.ink}
          style={{ marginRight: 6 }}
        />
      )}
      <Text style={[s.chipText, active && { color: colors.white }]}>{label}</Text>
    </Pressable>
  );
}

export function Button({
  title,
  onPress,
  loading,
  variant = "blue",
  icon,
  style,
  disabled,
}: {
  title: string;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "blue" | "black" | "red" | "ghost";
  icon?: IconName;
  style?: StyleProp<ViewStyle>;
}) {
  const bg =
    variant === "blue" ? colors.blue
    : variant === "black" ? colors.ink
    : variant === "red" ? colors.red
    : colors.white;
  const fg = variant === "ghost" ? colors.ink : colors.white;
  return (
    <Pressable
      onPress={onPress}
      disabled={loading || disabled}
      style={({ pressed }) => [
        s.btn,
        { backgroundColor: bg, opacity: disabled ? 0.4 : pressed || loading ? 0.85 : 1 },
        variant === "ghost" && { borderWidth: 1, borderColor: colors.line },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {icon && <Ionicons name={icon} size={18} color={fg} style={{ marginRight: 8 }} />}
          <Text style={[s.btnText, { color: fg }]}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
}

export function RoundButton({
  icon,
  onPress,
  dark,
}: {
  icon: IconName;
  onPress?: () => void;
  dark?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={6}
      style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }, s.round, dark ? { backgroundColor: colors.ink } : { backgroundColor: colors.white }, !dark && shadow]}
    >
      <Ionicons name={icon} size={20} color={dark ? colors.white : colors.ink} />
    </Pressable>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[s.card, shadow, style]}>{children}</View>;
}

export function SectionHeader({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <View style={s.sectionHeader}>
      <Text style={s.sectionTitle}>{title}</Text>
      {action && (
        <Pressable onPress={onAction}>
          <Text style={s.sectionAction}>{action}</Text>
        </Pressable>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    height: 44,
    borderRadius: radius.pill,
    marginRight: 10,
  },
  chipActive: { backgroundColor: colors.ink },
  chipIdle: { backgroundColor: colors.white, ...(shadow as object) },
  chipText: { fontSize: 15, fontWeight: "600", color: colors.ink },
  btn: {
    height: 56,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: { fontSize: 16, fontWeight: "700" },
  round: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },
  card: { backgroundColor: colors.white, borderRadius: radius.xl, padding: 16 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 26,
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 20, fontWeight: "800", color: colors.ink, letterSpacing: -0.3 },
  sectionAction: { fontSize: 14, fontWeight: "700", color: colors.blue },
  banner: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14, borderRadius: radius.md },
  bannerText: { flex: 1, fontSize: 14, fontWeight: "600", lineHeight: 19 },
  bannerAction: { fontSize: 14, fontWeight: "800" },
  empty: { backgroundColor: colors.white, borderRadius: radius.xl, padding: 26, alignItems: "center" },
  emptyIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.blueSoft, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: "800", color: colors.ink, textAlign: "center" },
  emptyText: { color: colors.muted, textAlign: "center", marginTop: 6, lineHeight: 20 },
  pill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill, alignSelf: "flex-start" },
  pillText: { fontSize: 12, fontWeight: "800" },
});

export function Banner({
  tone = "red",
  icon,
  text,
  action,
  onAction,
}: {
  tone?: "red" | "blue";
  icon?: IconName;
  text: string;
  action?: string;
  onAction?: () => void;
}) {
  const fg = tone === "red" ? colors.red : colors.blue;
  return (
    <View style={[s.banner, { backgroundColor: tone === "red" ? colors.redSoft : colors.blueSoft }]}>
      <Ionicons name={icon ?? (tone === "red" ? "alert-circle" : "information-circle")} size={20} color={fg} />
      <Text style={[s.bannerText, { color: fg }]}>{text}</Text>
      {action && (
        <Pressable onPress={onAction} hitSlop={10}>
          <Text style={[s.bannerAction, { color: fg }]}>{action}</Text>
        </Pressable>
      )}
    </View>
  );
}

export function EmptyState({
  icon,
  title,
  text,
  children,
}: {
  icon: IconName;
  title: string;
  text?: string;
  children?: ReactNode;
}) {
  return (
    <View style={[s.empty, shadow]}>
      <View style={s.emptyIcon}>
        <Ionicons name={icon} size={30} color={colors.blue} />
      </View>
      <Text style={s.emptyTitle}>{title}</Text>
      {text && <Text style={s.emptyText}>{text}</Text>}
      {children}
    </View>
  );
}

export function StatusPill({ label, tone }: { label: string; tone: "blue" | "red" | "ink" | "muted" }) {
  const map = {
    blue: [colors.blueSoft, colors.blue],
    red: [colors.redSoft, colors.red],
    ink: [colors.ink, colors.white],
    muted: [colors.bg, colors.muted],
  } as const;
  const [bg, fg] = map[tone];
  return (
    <View style={[s.pill, { backgroundColor: bg }]}>
      <Text style={[s.pillText, { color: fg }]}>{label}</Text>
    </View>
  );
}

