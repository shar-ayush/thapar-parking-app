
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { useEffect } from "react";

import { homeFor, useAuth } from "../context/AuthContext";

export default function Index() {
  const { user, loading, hasServer } = useAuth();

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!hasServer) {
      router.replace("/connect" as never);
      return;
    }

    if (!user) {
      router.replace("/login");
      return;
    }

    router.replace(homeFor(user.role) as never);
  }, [user, loading, hasServer]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#1F6FEB" />

      <Text style={styles.text}>
        Loading Thapar Parking...
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0A0A0B",
  },

  text: {
    marginTop: 14,
    fontSize: 16,
    color: "#A3A8B3",
  },
});
