import { useResponsive } from "@/hooks/useResponsive";
import type { Channel } from "@/types/channel";
import { Image } from "expo-image";
import { useEffect, useState } from "react";
import { Animated, Platform, Pressable, StyleSheet, Text, View } from "react-native";

export function ChannelCard({ channel, accent, onPress, preferredFocus = false }: { channel: Channel; accent: string; onPress: () => void; preferredFocus?: boolean }) {
  const { isMobile, isTablet } = useResponsive();
  const [focused, setFocused] = useState(false);
  const [scale] = useState(() => new Animated.Value(1));
  const cardWidth = isMobile ? 128 : isTablet ? 164 : 196;
  const cardHeight = isMobile ? 118 : isTablet ? 134 : 152;
  const logoHeight = isMobile ? 66 : isTablet ? 76 : 86;

  useEffect(() => {
    Animated.spring(scale, { toValue: focused ? 1.06 : 1, useNativeDriver: Platform.OS !== "web", speed: 18, bounciness: 5 }).start();
  }, [focused, scale]);

  return (
    <Animated.View style={[styles.wrap, { width: cardWidth, marginRight: isMobile ? 12 : 18 }, { transform: [{ scale }] }]}>
      <Pressable
        focusable
        hasTVPreferredFocus={preferredFocus}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onPress={onPress}
        style={[styles.card, { minHeight: cardHeight }, focused && { borderColor: accent, boxShadow: `0px 8px 18px ${accent}80` }]}
        accessibilityRole="button"
        accessibilityLabel={`Play ${channel.name}`}
      >
        <View style={[styles.logoPanel, { height: logoHeight }]}>
          {channel.logo ? <Image source={channel.logo} style={styles.logo} contentFit="contain" cachePolicy="disk" /> : <Text style={[styles.logoFallback, { color: accent }]}>{channel.name.slice(0, 2).toUpperCase()}</Text>}
          {focused && <View style={[styles.liveDot, { backgroundColor: accent }]} />}
        </View>
        <Text numberOfLines={1} style={[styles.name, isMobile && styles.nameMobile]}>{channel.name}</Text>
        <Text numberOfLines={1} style={[styles.meta, isMobile && styles.metaMobile]}>{channel.groupTitle || "Live channel"}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingVertical: 8 },
  card: { borderRadius: 14, borderWidth: 2, borderColor: "#28303a", backgroundColor: "#171c22", padding: 12, boxShadow: "0px 8px 18px rgba(0, 0, 0, 0.35)", elevation: 8, overflow: "hidden" },
  logoPanel: { borderRadius: 9, backgroundColor: "#f2f2ed", alignItems: "center", justifyContent: "center", position: "relative" },
  logo: { width: "78%", height: "78%" },
  logoFallback: { fontSize: 28, fontWeight: "800", letterSpacing: 1 },
  liveDot: { position: "absolute", right: 7, top: 7, width: 7, height: 7, borderRadius: 4 },
  name: { color: "#f6f3ed", fontSize: 15, fontWeight: "700", marginTop: 10 },
  nameMobile: { fontSize: 13, marginTop: 7 },
  meta: { color: "#8f99a4", fontSize: 12, marginTop: 4 },
  metaMobile: { fontSize: 11, marginTop: 2 },
});
