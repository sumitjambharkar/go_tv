import { PLAYLIST_ORDER, PLAYLISTS, type PlaylistCode } from "@/config/playlists";
import { Pressable, StyleSheet, Text, View } from "react-native";

export function LanguageSelector({ selected, onSelect }: { selected: PlaylistCode | "all"; onSelect: (value: PlaylistCode | "all") => void }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>BROWSE BY LANGUAGE</Text>
      <View style={styles.options}>
        {(["all", ...PLAYLIST_ORDER] as const).map((code) => {
          const label = code === "all" ? "All channels" : PLAYLISTS[code].label;
          const active = selected === code;
          return <Pressable key={code} focusable onPress={() => onSelect(code)} style={[styles.option, active && styles.active]}><Text style={[styles.text, active && styles.activeText]}>{label}</Text></Pressable>;
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 52, marginTop: 28 },
  label: { color: "#697580", fontSize: 11, letterSpacing: 2, fontWeight: "800", marginBottom: 12 },
  options: { flexDirection: "row", gap: 10 },
  option: { borderWidth: 1, borderColor: "#303943", borderRadius: 24, paddingHorizontal: 18, paddingVertical: 9, backgroundColor: "#141a20" },
  active: { backgroundColor: "#e7b36b", borderColor: "#e7b36b" },
  text: { color: "#aeb6bd", fontSize: 14, fontWeight: "700" },
  activeText: { color: "#1a1713" },
});
