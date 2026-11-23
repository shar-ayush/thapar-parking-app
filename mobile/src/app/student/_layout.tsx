import { Tabs } from "expo-router/js-tabs";

import { makeTabBar } from "../../components/FloatingTabBar";

const TabBar = makeTabBar({
  index: { label: "Home", icon: "home" },
  map: { label: "Map", icon: "map" },
  vehicles: { label: "Vehicles", icon: "car-sport" },
  profile: { label: "Profile", icon: "person" },
});

// Shared by every role that parks: students, faculty, visitors and vendors.
export default function DriverLayout() {
  return (
    <Tabs tabBar={(p) => <TabBar {...p} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="map" />
      <Tabs.Screen name="vehicles" />
      <Tabs.Screen name="profile" />
      <Tabs.Screen name="select-space" options={{ href: null }} />
    </Tabs>
  );
}
