import { useCallback, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";
import * as Location from "expo-location";

import { errorMessage } from "../../services/api";

/**
 * Loads data when the screen is focused and re-polls every `intervalMs`
 * while it stays focused, so availability numbers stay current.
 */
export function useLive<T>(fetcher: () => Promise<T>, intervalMs = 20000) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fetchRef = useRef(fetcher);
  fetchRef.current = fetcher;

  const load = useCallback(async () => {
    try {
      const d = await fetchRef.current();
      setData(d);
      setError(null);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
      if (!intervalMs) return;
      const t = setInterval(load, intervalMs);
      return () => clearInterval(t);
    }, [load, intervalMs])
  );

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  return { data, error, loading, refreshing, refresh, reload: load, setData };
}

/** The user's position if they've allowed location; asks only when `ask` is true. */
export function useMyLocation(ask: boolean) {
  const [me, setMe] = useState<{ lat: number; lng: number } | null>(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        try {
          const perm = ask
            ? await Location.requestForegroundPermissionsAsync()
            : await Location.getForegroundPermissionsAsync();
          if (perm.status !== "granted") return;
          const last = await Location.getLastKnownPositionAsync();
          if (last && !cancelled) setMe({ lat: last.coords.latitude, lng: last.coords.longitude });
          const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          if (!cancelled) setMe({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        } catch {}
      })();
      return () => {
        cancelled = true;
      };
    }, [ask])
  );

  return me;
}
