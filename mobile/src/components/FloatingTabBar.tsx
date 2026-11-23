import { Pressable, StyleSheet, Text, View } from "react-native";
import type { BottomTabBarProps } from "expo-router/js-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors, radius, shadow } from "../theme";

export type TabSpec = Record<string, { label: string; icon: keyof typeof Ionicons.glyphMap }>;

/** Pill-shaped floating tab bar. Hidden on routes that aren't listed in `tabs`. */
export function makeTabBar(tabs: TabSpec) {
  return function FloatingTabBar({ state, navigation }: BottomTabBarProps) {
    const insets = useSafeAreaInsets();
    if (!tabs[state.routes[state.index].name]) return null;
    return (
      <View style={[s.wrap, { bottom: Math.max(insets.bottom, 12) }]} pointerEvents="box-none">
        <View style={[s.bar, shadow]}>
          {state.routes
            .filter((r) => tabs[r.name])
            .map((route) => {
              const focused = state.routes[state.index].name === route.name;
              const t = tabs[route.name];
              return (
                <Pressable
                  key={route.key}
                  accessibilityRole="tab"
                  accessibilityLabel={t.label}
                  accessibilityState={{ selected: focused }}
                  onPress={() => navigation.navigate(route.name)}
                  style={[s.item, focused && s.itemActive]}
                >
                  <Ionicons
                    name={focused ? t.icon : (`${t.icon}-outline` as keyof typeof Ionicons.glyphMap)}
                    size={20}
                    color={focused ? colors.white : colors.ink}
                  />
                  {focused && <Text style={s.label}>{t.label}</Text>}
                </Pressable>
              );
            })}
        </View>
      </View>
    );
  };
}

const s = StyleSheet.create({
  wrap: { position: "absolute", left: 0, right: 0, alignItems: "center" },
  bar: { flexDirection: "row", backgroundColor: colors.white, borderRadius: radius.pill, padding: 6, gap: 4 },
  item: {
    height: 52,
    minWidth: 56,
    paddingHorizontal: 18,
    borderRadius: radius.pill,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  itemActive: { backgroundColor: colors.blue },
  label: { color: colors.white, fontWeight: "700", fontSize: 15 },
});
