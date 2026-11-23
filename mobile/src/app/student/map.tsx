import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { WebView, WebViewMessageEvent } from "react-native-webview";

import { getLots, getVehicles, Lot } from "../../../services/api";
import { Button, Chip } from "../../components/ui";
import {
  CAMPUS_CENTER,
  ZONES,
  ZoneFilter,
  VehicleKind,
  availabilityTone,
  distanceM,
  filterLots,
  fmtDistance,
} from "../../data/parking";
import { useLive, useMyLocation } from "../../hooks/useLive";
import { openDirections } from "../../lib/format";
import { colors, radius, shadow } from "../../theme";

const KINDS: { key: VehicleKind; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: "CAR", icon: "car-sport" },
  { key: "BIKE", icon: "bicycle" },
  { key: "SCOOTER", icon: "speedometer" },
];

// Leaflet + OpenStreetMap data (CARTO light tiles). No API key needed, works inside an APK.
const HTML = `<!doctype html><html><head>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"/>
<style>
html,body,#map{height:100%;margin:0;background:#F4F5F8}
.leaflet-control-attribution{font-size:9px;margin-bottom:96px!important}
.pin{width:74px;height:34px;box-sizing:border-box;display:flex;align-items:center;justify-content:center;gap:6px;background:#fff;border-radius:999px;box-shadow:0 4px 14px rgba(0,0,0,.2);font:800 13px -apple-system,Roboto,sans-serif;color:#0A0A0B;border:2px solid #fff}
.pin b{width:22px;height:22px;border-radius:50%;background:#0A0A0B;color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px}
.pin.low{color:#E5383B}.pin.low b{background:#E5383B}
.pin.sel{background:#0A0A0B;color:#fff;border-color:#1F6FEB}.pin.sel b{background:#1F6FEB}
.me{width:16px;height:16px;border-radius:50%;background:#1F6FEB;border:3px solid #fff;box-shadow:0 0 0 9px rgba(31,111,235,.22)}
</style></head><body><div id="map"></div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js"></script>
<script>
var map=L.map('map',{zoomControl:false}).setView([${CAMPUS_CENTER.lat},${CAMPUS_CENTER.lng}],16);
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',{maxZoom:19,subdomains:'abcd',attribution:'&copy; OpenStreetMap &copy; CARTO'}).addTo(map);
var markers={},lots=[],selId=null,me=null,meLL=null,route=null;
function send(o){window.ReactNativeWebView.postMessage(JSON.stringify(o))}
function drawRoute(){
  if(route){map.removeLayer(route);route=null}
  var l=lots.filter(function(x){return x.id===selId})[0];
  if(meLL&&l){route=L.polyline([meLL,[l.lat,l.lng]],{color:'#1F6FEB',weight:4,dashArray:'8 10'}).addTo(map)}
}
function render(){
  Object.keys(markers).forEach(function(k){map.removeLayer(markers[k])});markers={};
  lots.forEach(function(l){
    var low=l.free===0||l.free/l.cap<0.15,sel=l.id===selId;
    var html='<div class="pin '+(sel?'sel':low?'low':'')+'"><b>'+l.zone+'</b>'+(l.free===0?'Full':l.free)+'</div>';
    var m=L.marker([l.lat,l.lng],{icon:L.divIcon({className:'',html:html,iconSize:[74,34],iconAnchor:[37,17]}),zIndexOffset:sel?1000:0}).addTo(map);
    m.on('click',function(e){L.DomEvent.stopPropagation(e);send({type:'select',id:l.id})});
    markers[l.id]=m;
  });
  drawRoute();
}
function setLots(a){lots=a;if(selId&&!a.some(function(x){return x.id===selId}))selId=null;render()}
function selectLot(id){selId=id;render();var l=lots.filter(function(x){return x.id===id})[0];if(l)map.panTo([l.lat,l.lng],{animate:true})}
function setMe(lat,lng){meLL=[lat,lng];if(me)map.removeLayer(me);me=L.marker(meLL,{icon:L.divIcon({className:'',html:'<div class="me"></div>',iconSize:[16,16],iconAnchor:[8,8]}),interactive:false}).addTo(map);drawRoute()}
function recenter(){if(meLL)map.setView(meLL,17,{animate:true});else map.setView([${CAMPUS_CENTER.lat},${CAMPUS_CENTER.lng}],16)}
function fitAll(){if(!lots.length)return;var b=L.latLngBounds(lots.map(function(x){return[x.lat,x.lng]}));if(meLL)b.extend(meLL);map.fitBounds(b,{padding:[60,60],maxZoom:17})}
map.on('click',function(){send({type:'clear'})});
send({type:'ready'});
</script></body></html>`;

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const web = useRef<WebView>(null);

  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [zone, setZone] = useState<ZoneFilter>("All");
  const [kind, setKind] = useState<VehicleKind>("CAR");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const me = useMyLocation(true);
  const { data: lotsData, error } = useLive<Lot[]>(getLots, 20000);
  const LOTS = useMemo(() => lotsData ?? [], [lotsData]);

  // Default the vehicle type to the user's first registered vehicle.
  useFocusEffect(
    useCallback(() => {
      getVehicles()
        .then((v) => {
          const t = v?.[0]?.vehicle_type as VehicleKind | undefined;
          if (t && ["CAR", "BIKE", "SCOOTER"].includes(t)) setKind(t);
        })
        .catch(() => {});
    }, [])
  );

  const visible = useMemo(() => filterLots(LOTS, zone, query), [LOTS, zone, query]);

  const run = (js: string) => web.current?.injectJavaScript(`${js};true;`);

  useEffect(() => {
    if (!ready) return;
    run(
      `setLots(${JSON.stringify(
        visible.map((l) => ({ id: l.id, zone: l.zone, lat: l.lat, lng: l.lng, free: l.free[kind], cap: l.capacity[kind] }))
      )})`
    );
  }, [ready, visible, kind]);

  useEffect(() => {
    if (!ready) return;
    if (me) run(`setMe(${me.lat},${me.lng})`);
  }, [ready, me]);

  useEffect(() => {
    if (!ready) return;
    if (selected) run(`selectLot(${JSON.stringify(selected)})`);
    else run(`selectLot(null)`);
  }, [ready, selected]);

  function onMessage(e: WebViewMessageEvent) {
    try {
      const m = JSON.parse(e.nativeEvent.data);
      if (m.type === "ready") setReady(true);
      else if (m.type === "select") setSelected(m.id);
      else if (m.type === "clear") setSelected(null);
    } catch {}
  }

  const lot = LOTS.find((l) => l.id === selected && visible.some((v) => v.id === l.id));
  const free = lot?.free[kind] ?? 0;
  const cap = lot?.capacity[kind] ?? 0;
  const tone = availabilityTone(free, cap);
  const unavailable = tone === "full" || tone === "none";
  const dist = lot && me ? `${fmtDistance(distanceM(me, lot))} away` : lot?.area;

  function navigate() {
    if (lot) openDirections(lot.lat, lot.lng, kind);
  }

  return (
    <View style={s.root}>
      <StatusBar style="dark" />
      <WebView
        ref={web}
        source={{ html: HTML, baseUrl: "https://localhost/" }}
        originWhitelist={["*"]}
        javaScriptEnabled
        domStorageEnabled
        onMessage={onMessage}
        onError={() => setFailed(true)}
        onHttpError={() => setFailed(true)}
        style={s.web}
        androidLayerType="hardware"
        overScrollMode="never"
      />

      {!ready && !failed && (
        <View style={s.loading}>
          <ActivityIndicator size="large" color={colors.blue} />
          <Text style={s.loadingText}>Loading campus map…</Text>
        </View>
      )}
      {failed && !ready && (
        <View style={s.loading}>
          <Ionicons name="cloud-offline-outline" size={36} color={colors.red} />
          <Text style={s.loadingText}>Map needs an internet connection.</Text>
        </View>
      )}

      {/* Top overlay */}
      <SafeAreaView edges={["top"]} style={s.top} pointerEvents="box-none">
        <View style={[s.search, shadow]}>
          <Ionicons name="search" size={20} color={colors.muted} />
          <TextInput
            style={s.searchInput}
            placeholder="Search parking"
            placeholderTextColor={colors.faint}
            value={query}
            onChangeText={setQuery}
          />
          <View style={s.kinds}>
            {KINDS.map((k) => (
              <Pressable key={k.key} onPress={() => setKind(k.key)} style={[s.kindBtn, kind === k.key && { backgroundColor: colors.ink }]}>
                <Ionicons name={k.icon} size={16} color={kind === k.key ? colors.white : colors.ink} />
              </Pressable>
            ))}
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10, marginHorizontal: -16 }} contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 4 }}>
          {ZONES.map((z) => (
            <Chip key={z} label={z === "All" ? "All" : `Zone ${z}`} active={zone === z} onPress={() => setZone(z)} />
          ))}
        </ScrollView>
        {error && (
          <View style={[s.offline, shadow]}>
            <Ionicons name="cloud-offline-outline" size={16} color={colors.red} />
            <Text style={s.offlineText} numberOfLines={2}>{lotsData ? "Can't refresh availability" : error}</Text>
          </View>
        )}
      </SafeAreaView>

      {/* Map controls */}
      <View style={[s.fabs, { bottom: (lot ? 300 : 150) + Math.max(insets.bottom - 12, 0) }]}>
        <Pressable style={[s.fab, shadow]} onPress={() => run("fitAll()")}>
          <Ionicons name="scan-outline" size={20} color={colors.ink} />
        </Pressable>
        <Pressable style={[s.fab, shadow, { backgroundColor: colors.ink }]} onPress={() => run("recenter()")}>
          <Ionicons name="locate" size={20} color={colors.white} />
        </Pressable>
      </View>

      {/* Bottom card */}
      <View style={[s.cardWrap, { bottom: 92 + Math.max(insets.bottom - 12, 0) }]} pointerEvents="box-none">
        {lot ? (
          <View style={[s.card, shadow]}>
            <View style={s.cardTop}>
              <View style={s.zoneBadge}><Text style={s.zoneText}>{lot.zone}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={s.cardName} numberOfLines={1}>{lot.name}</Text>
                <Text style={s.cardMeta} numberOfLines={1}>Zone {lot.zone} · {dist}</Text>
              </View>
              <View style={[s.pill, tone !== "ok" ? { backgroundColor: colors.redSoft } : { backgroundColor: colors.blueSoft }]}>
                <Text style={[s.pillText, { color: tone !== "ok" ? colors.red : colors.blue }]}>
                  {tone === "none" ? "No slots" : tone === "full" ? "Full" : `${free} free`}
                </Text>
              </View>
            </View>
            <View style={s.btnRow}>
              <Button title="Navigate" variant="black" icon="navigate" onPress={navigate} style={{ flex: 1, height: 50 }} />
              <Button
                title="Choose slot"
                icon="checkmark"
                disabled={unavailable}
                onPress={() => router.push({ pathname: "/student/select-space", params: { lotId: lot.id, kind } } as never)}
                style={{ flex: 1.2, height: 50 }}
              />
            </View>
          </View>
        ) : (
          <View style={[s.hint, shadow]}>
            <Ionicons name="location" size={18} color={colors.blue} />
            <Text style={s.hintText}>Tap a pin to see availability and navigate</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  web: { flex: 1, backgroundColor: colors.bg },
  loading: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center", gap: 12 },
  loadingText: { color: colors.muted, fontSize: 15, fontWeight: "600" },

  top: { position: "absolute", top: 0, left: 0, right: 0, paddingHorizontal: 16, paddingTop: 8 },
  search: { flexDirection: "row", alignItems: "center", gap: 10, height: 54, borderRadius: radius.lg, paddingLeft: 16, paddingRight: 8, backgroundColor: colors.white },
  searchInput: { flex: 1, fontSize: 16, color: colors.ink },
  kinds: { flexDirection: "row", gap: 4 },
  kindBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center" },

  fabs: { position: "absolute", right: 16, gap: 10 },
  fab: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.white, alignItems: "center", justifyContent: "center" },

  cardWrap: { position: "absolute", left: 16, right: 16 },
  card: { backgroundColor: colors.white, borderRadius: radius.xl, padding: 16 },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 14 },
  zoneBadge: { width: 52, height: 52, borderRadius: radius.md, backgroundColor: colors.ink, alignItems: "center", justifyContent: "center" },
  zoneText: { color: colors.white, fontSize: 24, fontWeight: "800" },
  cardName: { fontSize: 17, fontWeight: "800", color: colors.ink, letterSpacing: -0.2 },
  cardMeta: { fontSize: 13, color: colors.muted, marginTop: 2 },
  pill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill },
  pillText: { fontSize: 13, fontWeight: "800" },
  btnRow: { flexDirection: "row", gap: 10 },

  offline: { flexDirection: "row", alignItems: "center", gap: 8, alignSelf: "flex-start", backgroundColor: colors.white, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 8, marginTop: 8 },
  offlineText: { color: colors.red, fontSize: 13, fontWeight: "700", flexShrink: 1 },
  hint: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: colors.white, borderRadius: radius.pill, height: 52 },
  hintText: { fontSize: 14, fontWeight: "700", color: colors.ink },
});
