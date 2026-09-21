import { ChannelCard } from "@/components/ChannelCard";
import type { Channel } from "@/types/channel";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export function ContentRow({ title, subtitle, channels, accent, onSelect }: { title: string; subtitle?: string; channels: Channel[]; accent: string; onSelect: (channel: Channel) => void }) {
  if (!channels.length) return null;
  return (
    <View style={styles.section}>
      <View style={styles.headingRow}>
        <View style={[styles.rule, { backgroundColor: accent }]} />
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row} directionalLockEnabled>
        {channels.filter((channel): channel is Channel => Boolean(channel?.name && channel?.streamUrl)).slice(0, 18).map((channel) => <ChannelCard key={`${channel.id ?? channel.name}-${channel.streamUrl}`} channel={channel} accent={accent} onPress={() => onSelect(channel)} />)}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 30 },
  headingRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 52, marginBottom: 8 },
  rule: { width: 4, height: 22, borderRadius: 2, marginRight: 12 },
  title: { color: "#f5f2eb", fontSize: 22, fontWeight: "800", letterSpacing: 0.2 },
  subtitle: { color: "#7e8994", fontSize: 13, marginLeft: 14, marginTop: 3 },
  row: { paddingHorizontal: 52, paddingVertical: 12 },
});
