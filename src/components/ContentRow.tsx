import { ChannelCard } from "@/components/ChannelCard";
import { useResponsive } from "@/hooks/useResponsive";
import type { Channel } from "@/types/channel";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export function ContentRow({ title, subtitle, channels, accent, onSelect, preferredFocus = false }: { title: string; subtitle?: string; channels: Channel[]; accent: string; onSelect: (channel: Channel) => void; preferredFocus?: boolean }) {
  const { isMobile } = useResponsive();
  if (!channels.length) return null;
  const gutter = isMobile ? 16 : 52;
  return (
    <View style={styles.section}>
      <View style={[styles.headingRow, { paddingHorizontal: gutter }]}>
        <View style={[styles.rule, { backgroundColor: accent }]} />
        <Text style={[styles.title, isMobile && styles.titleMobile]}>{title}</Text>
        {subtitle && !isMobile ? <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text> : null}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.row, { paddingHorizontal: gutter }]} directionalLockEnabled>
        {channels.filter((channel): channel is Channel => Boolean(channel?.name && channel?.streamUrl)).slice(0, 18).map((channel, index) => <ChannelCard key={`${channel.id ?? channel.name}-${channel.streamUrl}`} channel={channel} accent={accent} onPress={() => onSelect(channel)} preferredFocus={preferredFocus && index === 0} />)}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 30 },
  headingRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  rule: { width: 4, height: 22, borderRadius: 2, marginRight: 12 },
  title: { color: "#f5f2eb", fontSize: 22, fontWeight: "800", letterSpacing: 0.2 },
  titleMobile: { fontSize: 17 },
  subtitle: { color: "#7e8994", fontSize: 13, marginLeft: 14, marginTop: 3, flexShrink: 1 },
  row: { paddingVertical: 12 },
});
