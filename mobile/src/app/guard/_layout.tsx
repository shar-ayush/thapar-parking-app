import { Tabs } from "expo-router/js-tabs";

import { makeTabBar } from "../../components/FloatingTabBar";

const TabBar = makeTabBar({
  index: { label: "Gate", icon: "scan" },
  inside: { label: "Inside", icon: "car" },
  profile: { label: "Profile", icon: "person" },
});

export default function GuardLayout() {
  return (
    <Tabs tabBar={(p) => <TabBar {...p} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="inside" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
