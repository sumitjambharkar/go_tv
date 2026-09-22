import { useFocusRing } from "@/hooks/useFocusRing";
import { useResponsive } from "@/hooks/useResponsive";
import { FEATURED_CONTENT, type FeaturedContent } from "@/services/contentService";
import { Image } from "expo-image";
import { useEffect, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";

export function HeroBanner({ onWatch }: { onWatch: () => void }) {
  const { isMobile, isTablet, isTV } = useResponsive();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [opacity] = useState(() => new Animated.Value(1));
  const feature: FeaturedContent = FEATURED_CONTENT[index];
  const watchFocus = useFocusRing();
  const infoFocus = useFocusRing();

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      Animated.sequence([Animated.timing(opacity, { toValue: 0.35, duration: 180, useNativeDriver: true }), Animated.timing(opacity, { toValue: 1, duration: 320, useNativeDriver: true })]).start();
      setIndex((current) => (current + 1) % FEATURED_CONTENT.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [opacity, paused]);

  const interact = () => setPaused(true);
  return (
    <Animated.View style={[styles.hero, { height: isMobile ? 300 : isTablet ? 380 : 448 }, { opacity }]}>
      <Image source={feature.artwork} style={StyleSheet.absoluteFill} contentFit="cover" transition={500} cachePolicy="disk" />
      <View style={styles.tint} />
      {!isMobile ? <View style={[styles.sideShade, { width: isTablet ? "80%" : "68%" }]} /> : <View style={styles.bottomShade} />}
      <View style={[styles.copy, { paddingLeft: isMobile ? 18 : isTablet ? 36 : 64, paddingRight: isMobile ? 18 : 0, paddingBottom: isMobile ? 26 : 56, width: isMobile ? "100%" : isTablet ? "82%" : 600 }]}>
        <Text style={[styles.eyebrow, isMobile && styles.eyebrowMobile]}>{feature.eyebrow}</Text>
        <Text style={[styles.title, { fontSize: isMobile ? 26 : isTablet ? 38 : 54 }]} numberOfLines={isMobile ? 2 : undefined}>{feature.title}</Text>
        <View style={styles.meta}><Text style={[styles.metaStrong, isMobile && styles.metaTextMobile]}>{feature.language}</Text><Text style={styles.dot}>•</Text><Text style={[styles.metaText, isMobile && styles.metaTextMobile]}>{feature.genre}</Text><Text style={styles.dot}>•</Text><Text style={[styles.metaText, isMobile && styles.metaTextMobile]}>{feature.year}</Text><Text style={styles.quality}>HD</Text></View>
        {!isMobile ? <Text style={[styles.description, { width: isTablet ? "100%" : 470 }]} numberOfLines={3}>{feature.description}</Text> : null}
        <View style={[styles.actions, isMobile && styles.actionsMobile]}>
          <Pressable focusable hasTVPreferredFocus={isTV} onFocus={() => { interact(); watchFocus.onFocus(); }} onBlur={watchFocus.onBlur} onPress={onWatch} style={[styles.watch, isMobile && styles.buttonMobile, watchFocus.focused && styles.watchFocused]}><Text style={styles.watchText}>▶  Watch now</Text></Pressable>
          {!isMobile ? <Pressable focusable onFocus={() => { interact(); infoFocus.onFocus(); }} onBlur={infoFocus.onBlur} onPress={() => setPaused(true)} style={[styles.info, infoFocus.focused && styles.infoFocused]}><Text style={styles.infoText}>ⓘ  More info</Text></Pressable> : null}
        </View>
        <View style={styles.dots}>{FEATURED_CONTENT.map((item, itemIndex) => <View key={item.title} style={[styles.heroDot, itemIndex === index && styles.heroDotActive]} />)}</View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  hero: { overflow: "hidden", justifyContent: "flex-end" },
  tint: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(8, 12, 16, 0.42)" },
  sideShade: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(8, 12, 16, 0.88)" },
  bottomShade: { position: "absolute", left: 0, right: 0, bottom: 0, height: "70%", backgroundColor: "rgba(8, 12, 16, 0.78)" },
  copy: {},
  eyebrow: { color: "#e7b36b", fontSize: 12, fontWeight: "800", letterSpacing: 2.6, marginBottom: 12 },
  eyebrowMobile: { fontSize: 11, letterSpacing: 2, marginBottom: 8 },
  title: { color: "#fbf7f0", fontWeight: "900", letterSpacing: 0.5 },
  meta: { flexDirection: "row", alignItems: "center", marginTop: 18, gap: 10, flexWrap: "wrap" },
  metaStrong: { color: "#f3c480", fontSize: 15, fontWeight: "800" },
  metaText: { color: "#c2c7cb", fontSize: 15 },
  metaTextMobile: { fontSize: 12 },
  dot: { color: "#66717b" },
  quality: { color: "#101417", backgroundColor: "#e7b36b", fontSize: 11, fontWeight: "900", paddingHorizontal: 6, paddingVertical: 3, borderRadius: 4, marginLeft: 4 },
  description: { color: "#c3c8cc", fontSize: 15, lineHeight: 23, marginTop: 16 },
  actions: { flexDirection: "row", gap: 12, marginTop: 24 },
  actionsMobile: { marginTop: 16 },
  watch: { backgroundColor: "#e7b36b", borderRadius: 8, paddingHorizontal: 22, paddingVertical: 13, borderWidth: 2, borderColor: "transparent" },
  watchFocused: { borderColor: "#fbf7f0" },
  buttonMobile: { flex: 1, alignItems: "center", paddingVertical: 14 },
  watchText: { color: "#171513", fontSize: 15, fontWeight: "900" },
  info: { borderColor: "#77818a", borderWidth: 2, borderRadius: 8, paddingHorizontal: 22, paddingVertical: 13, backgroundColor: "rgba(18, 23, 27, 0.72)" },
  infoFocused: { borderColor: "#e7b36b" },
  infoText: { color: "#f3f1eb", fontSize: 15, fontWeight: "800" },
  dots: { flexDirection: "row", gap: 6, marginTop: 28 },
  heroDot: { width: 22, height: 3, backgroundColor: "#6a7379", borderRadius: 2 },
  heroDotActive: { backgroundColor: "#e7b36b", width: 38 },
});
