import { FEATURED_CONTENT, type FeaturedContent } from "@/services/contentService";
import { Image } from "expo-image";
import { useEffect, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";

export function HeroBanner({ onWatch }: { onWatch: () => void }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const opacity = useRef(new Animated.Value(1)).current;
  const feature: FeaturedContent = FEATURED_CONTENT[index];

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
    <Animated.View style={[styles.hero, { opacity }]}>
      <Image source={feature.artwork} style={StyleSheet.absoluteFill} contentFit="cover" transition={500} cachePolicy="disk" />
      <View style={styles.tint} />
      <View style={styles.sideShade} />
      <View style={styles.copy}>
        <Text style={styles.eyebrow}>{feature.eyebrow}</Text>
        <Text style={styles.title}>{feature.title}</Text>
        <View style={styles.meta}><Text style={styles.metaStrong}>{feature.language}</Text><Text style={styles.dot}>•</Text><Text style={styles.metaText}>{feature.genre}</Text><Text style={styles.dot}>•</Text><Text style={styles.metaText}>{feature.year}</Text><Text style={styles.quality}>HD</Text></View>
        <Text style={styles.description}>{feature.description}</Text>
        <View style={styles.actions}>
          <Pressable focusable onFocus={interact} onPress={onWatch} style={styles.watch}><Text style={styles.watchText}>▶  Watch now</Text></Pressable>
          <Pressable focusable onFocus={interact} onPress={() => setPaused(true)} style={styles.info}><Text style={styles.infoText}>ⓘ  More info</Text></Pressable>
        </View>
        <View style={styles.dots}>{FEATURED_CONTENT.map((item, itemIndex) => <View key={item.title} style={[styles.heroDot, itemIndex === index && styles.heroDotActive]} />)}</View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  hero: { height: 448, overflow: "hidden", justifyContent: "flex-end" },
  tint: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(8, 12, 16, 0.42)" },
  sideShade: { ...StyleSheet.absoluteFill, width: "68%", backgroundColor: "rgba(8, 12, 16, 0.88)" },
  copy: { paddingLeft: 64, paddingBottom: 56, width: 600 },
  eyebrow: { color: "#e7b36b", fontSize: 12, fontWeight: "800", letterSpacing: 2.6, marginBottom: 12 },
  title: { color: "#fbf7f0", fontSize: 54, fontWeight: "900", letterSpacing: 0.5 },
  meta: { flexDirection: "row", alignItems: "center", marginTop: 18, gap: 10 },
  metaStrong: { color: "#f3c480", fontSize: 15, fontWeight: "800" },
  metaText: { color: "#c2c7cb", fontSize: 15 },
  dot: { color: "#66717b" },
  quality: { color: "#101417", backgroundColor: "#e7b36b", fontSize: 11, fontWeight: "900", paddingHorizontal: 6, paddingVertical: 3, borderRadius: 4, marginLeft: 4 },
  description: { color: "#c3c8cc", fontSize: 15, lineHeight: 23, marginTop: 16, width: 470 },
  actions: { flexDirection: "row", gap: 12, marginTop: 24 },
  watch: { backgroundColor: "#e7b36b", borderRadius: 8, paddingHorizontal: 22, paddingVertical: 13 },
  watchText: { color: "#171513", fontSize: 15, fontWeight: "900" },
  info: { borderColor: "#77818a", borderWidth: 1, borderRadius: 8, paddingHorizontal: 22, paddingVertical: 13, backgroundColor: "rgba(18, 23, 27, 0.72)" },
  infoText: { color: "#f3f1eb", fontSize: 15, fontWeight: "800" },
  dots: { flexDirection: "row", gap: 6, marginTop: 28 },
  heroDot: { width: 22, height: 3, backgroundColor: "#6a7379", borderRadius: 2 },
  heroDotActive: { backgroundColor: "#e7b36b", width: 38 },
});
