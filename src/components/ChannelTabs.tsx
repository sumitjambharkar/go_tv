import { PLAYLISTS, type PlaylistCode } from "@/config/playlists";
import { useFocusRing } from "@/hooks/useFocusRing";
import { useResponsive } from "@/hooks/useResponsive";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

export type ChannelTab = PlaylistCode | "all" | "favorites";

const TAB_ORDER: { key: ChannelTab; label: string }[] = [
  { key: "all", label: "All Channels" },
  { key: "mar", label: PLAYLISTS.mar.label },
  { key: "eng", label: PLAYLISTS.eng.label },
  { key: "hin", label: PLAYLISTS.hin.label },
  { key: "favorites", label: "Favorites" },
];

function TabChip({ label, active, isMobile, onPress }: { label: string; active: boolean; isMobile: boolean; onPress: () => void }) {
  const { focused, onFocus, onBlur } = useFocusRing();
  return (
    <Pressable focusable onFocus={onFocus} onBlur={onBlur} onPress={onPress} style={[styles.option, isMobile && styles.optionMobile, focused && styles.optionFocused, active && styles.active]}>
      <Text style={[styles.text, active && styles.activeText]}>{label}</Text>
    </Pressable>
  );
}

export function ChannelTabs({ selected, favoritesCount, onSelect }: { selected: ChannelTab; favoritesCount: number; onSelect: (value: ChannelTab) => void }) {
  const { isMobile } = useResponsive();
  const gutter = isMobile ? 16 : 52;
  const chips = TAB_ORDER.map(({ key, label }) => {
    const active = selected === key;
    const text = key === "favorites" && favoritesCount ? `${label} (${favoritesCount})` : label;
    return <TabChip key={key} label={text} active={active} isMobile={isMobile} onPress={() => onSelect(key)} />;
  });

  return (
    <View style={[styles.wrap, { paddingHorizontal: isMobile ? 0 : gutter }]}>
      <Text style={[styles.label, { paddingHorizontal: gutter }]}>BROWSE CHANNELS</Text>
      {isMobile ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.options, { paddingHorizontal: gutter }]}>{chips}</ScrollView>
      ) : (
        <View style={styles.options}>{chips}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 28 },
  label: { color: "#697580", fontSize: 11, letterSpacing: 2, fontWeight: "800", marginBottom: 12 },
  options: { flexDirection: "row", gap: 10 },
  option: { borderWidth: 2, borderColor: "#303943", borderRadius: 24, paddingHorizontal: 18, paddingVertical: 9, backgroundColor: "#141a20" },
  optionMobile: { paddingHorizontal: 14, paddingVertical: 8 },
  optionFocused: { borderColor: "#e7b36b" },
  active: { backgroundColor: "#e7b36b", borderColor: "#e7b36b" },
  text: { color: "#aeb6bd", fontSize: 14, fontWeight: "700" },
  activeText: { color: "#1a1713" },
});
