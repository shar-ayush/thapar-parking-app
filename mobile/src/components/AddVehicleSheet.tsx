import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { addVehicle, errorMessage, VehicleKind } from "../../services/api";
import { KINDS } from "../data/parking";
import { Button, Chip } from "./ui";
import { colors, radius } from "../theme";

export function AddVehicleSheet({
  visible,
  onClose,
  onSaved,
  defaultType,
}: {
  visible: boolean;
  onClose: () => void;
  onSaved: () => void;
  defaultType?: VehicleKind;
}) {
  const [plate, setPlate] = useState("");
  const [type, setType] = useState<VehicleKind>("CAR");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [color, setColor] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setType(defaultType ?? "CAR");
      setError(null);
    }
  }, [visible, defaultType]);

  async function save() {
    if (plate.replace(/[^a-z0-9]/gi, "").length < 4) {
      setError("Enter your vehicle number, e.g. PB 11 AB 1234");
      return;
    }
    try {
      setSaving(true);
      setError(null);
      await addVehicle({ plate_number: plate, vehicle_type: type, make: make.trim(), model: model.trim(), color: color.trim() });
      setPlate(""); setMake(""); setModel(""); setColor("");
      onClose();
      onSaved();
    } catch (e) {
      setError(errorMessage(e).replace(/^plate_number: /, ""));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={s.backdrop}>
        <Pressable style={{ flex: 1 }} onPress={onClose} />
        <View style={s.sheet}>
          <View style={s.grab} />
          <Text style={s.title}>Add Vehicle</Text>

          <View style={{ flexDirection: "row", marginBottom: 6 }}>
            {KINDS.map((k) => (
              <Chip key={k.key} label={k.label} icon={k.icon} active={type === k.key} onPress={() => setType(k.key)} />
            ))}
          </View>

          <TextInput style={s.input} placeholder="Vehicle number (e.g. PB 11 AB 1234)" placeholderTextColor={colors.faint} autoCapitalize="characters" value={plate} onChangeText={(v) => { setPlate(v.toUpperCase()); setError(null); }} autoCorrect={false} />
          <View style={{ flexDirection: "row", gap: 10 }}>
            <TextInput style={[s.input, { flex: 1 }]} placeholder="Make" placeholderTextColor={colors.faint} value={make} onChangeText={setMake} />
            <TextInput style={[s.input, { flex: 1 }]} placeholder="Model" placeholderTextColor={colors.faint} value={model} onChangeText={setModel} />
          </View>
          <TextInput style={s.input} placeholder="Color" placeholderTextColor={colors.faint} value={color} onChangeText={setColor} />

          {error && <Text style={s.error}>{error}</Text>}
          <Button title="Save vehicle" onPress={save} loading={saving} style={{ marginTop: 6 }} />
          <Button title="Cancel" variant="ghost" onPress={onClose} style={{ marginTop: 10 }} />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(10,10,11,0.5)", justifyContent: "flex-end" },
  sheet: { backgroundColor: colors.white, borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 22, paddingBottom: 34 },
  grab: { alignSelf: "center", width: 44, height: 5, borderRadius: 3, backgroundColor: colors.line, marginBottom: 16 },
  title: { fontSize: 24, fontWeight: "800", color: colors.ink, marginBottom: 16, letterSpacing: -0.4 },
  error: { color: colors.red, fontSize: 13, fontWeight: "600", marginTop: 10, marginLeft: 4 },
  input: { backgroundColor: colors.bg, borderRadius: radius.md, paddingHorizontal: 16, height: 54, marginTop: 10, fontSize: 16, color: colors.ink },
});
