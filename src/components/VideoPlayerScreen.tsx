import { useFocusRing } from "@/hooks/useFocusRing";
import { useResponsive } from "@/hooks/useResponsive";
import type { Channel } from "@/types/channel";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, BackHandler, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function VideoPlayerScreen({ channel, onClose, onNext, onPrev }: { channel: Channel; onClose: () => void; onNext: () => void; onPrev: () => void }) {
  const { isMobile } = useResponsive();
  const insets = useSafeAreaInsets();
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState<string | null>(null);
  const [playing, setPlaying] = useState(true);
  const videoRef = useRef<VideoView>(null);
  const backFocus = useFocusRing();
  const prevFocus = useFocusRing();
  const playFocus = useFocusRing();
  const nextFocus = useFocusRing();
  const fullscreenFocus = useFocusRing();
  const retryFocus = useFocusRing();
  const errorPrevFocus = useFocusRing();
  const errorNextFocus = useFocusRing();
  const returnFocus = useFocusRing();
  const source = {
    uri: channel.streamUrl,
    contentType: "auto" as const,
    metadata: { title: channel.name, artist: channel.groupTitle ?? "GoTV Live" },
    headers: {
      ...(channel.httpReferrer ? { Referer: channel.httpReferrer } : {}),
      ...(channel.userAgent ? { "User-Agent": channel.userAgent } : {}),
    },
    useCaching: false,
  };
  const player = useVideoPlayer(Platform.OS === "web" ? null : source, (videoPlayer) => videoPlayer.play());

  const retry = async () => {
    setError(null);
    setStatus("loading");
    try {
      await player.replaceAsync({
        uri: channel.streamUrl,
        contentType: "auto",
        metadata: { title: channel.name, artist: channel.groupTitle ?? "GoTV Live" },
        headers: {
          ...(channel.httpReferrer ? { Referer: channel.httpReferrer } : {}),
          ...(channel.userAgent ? { "User-Agent": channel.userAgent } : {}),
        },
        useCaching: false,
      });
      player.play();
    } catch (retryError) {
      setStatus("error");
      setError(retryError instanceof Error ? retryError.message : "Unable to retry stream");
    }
  };

  useEffect(() => {
    const subscription = player.addListener("statusChange", ({ status: nextStatus, error: playerError }) => {
      setStatus(nextStatus);
      if (playerError) setError(playerError.message);
    });
    const playingSubscription = player.addListener("playingChange", ({ isPlaying }) => setPlaying(isPlaying));
    const backSubscription = BackHandler.addEventListener("hardwareBackPress", () => { onClose(); return true; });
    return () => { subscription.remove(); playingSubscription.remove(); backSubscription.remove(); };
  }, [onClose, player]);

  return (
    <View style={styles.screen}>
      {Platform.OS === "web" ? <View style={styles.webNotice}><Text style={styles.errorTitle}>Open this channel on Android TV</Text><Text style={styles.stateText}>Chrome does not natively play most HLS .m3u8 streams. The Android TV build uses ExoPlayer and will try this stream there.</Text></View> : <VideoView ref={videoRef} player={player} style={styles.video} nativeControls={false} contentFit="contain" surfaceType="textureView" />}
      <View style={[styles.topBar, { top: Math.max(insets.top, 12) + 16, left: Math.max(insets.left, isMobile ? 16 : 32), right: Math.max(insets.right, isMobile ? 16 : 32) }]}><Pressable focusable onFocus={backFocus.onFocus} onBlur={backFocus.onBlur} onPress={onClose} style={[styles.back, backFocus.focused && styles.backFocused]}><Text style={styles.backText}>‹  Back</Text></Pressable><Text style={styles.channel} numberOfLines={1}>{channel.name}</Text></View>
      {Platform.OS !== "web" && status !== "error" && !error ? <View style={[styles.controls, isMobile && styles.controlsMobile, { left: Math.max(insets.left, isMobile ? 16 : 32), right: Math.max(insets.right, isMobile ? 16 : 32), bottom: Math.max(insets.bottom, isMobile ? 16 : 28) }]}>
        <Pressable focusable onFocus={prevFocus.onFocus} onBlur={prevFocus.onBlur} onPress={onPrev} style={[styles.controlButton, prevFocus.focused && styles.controlButtonFocused]} accessibilityLabel="Previous channel"><Text style={styles.controlText}>|◀</Text></Pressable>
        <Pressable focusable onFocus={playFocus.onFocus} onBlur={playFocus.onBlur} onPress={() => { playing ? player.pause() : player.play(); }} style={[styles.controlButton, playFocus.focused && styles.controlButtonFocused]} accessibilityLabel={playing ? "Pause" : "Play"}><Text style={styles.controlText}>{playing ? "Ⅱ" : "▶"}</Text></Pressable>
        <Pressable focusable onFocus={nextFocus.onFocus} onBlur={nextFocus.onBlur} onPress={onNext} style={[styles.controlButton, nextFocus.focused && styles.controlButtonFocused]} accessibilityLabel="Next channel"><Text style={styles.controlText}>▶|</Text></Pressable>
        <View style={styles.controlInfo}><Text style={styles.controlTitle} numberOfLines={1}>{channel.name}</Text><Text style={styles.controlMeta}>LIVE  •  {channel.groupTitle || "Channel"}</Text></View>
        <Pressable focusable onFocus={fullscreenFocus.onFocus} onBlur={fullscreenFocus.onBlur} onPress={() => videoRef.current?.enterFullscreen()} style={[styles.fullscreenButton, fullscreenFocus.focused && styles.fullscreenButtonFocused]}><Text style={styles.fullscreenText}>{isMobile ? "⛶" : "⛶  Fullscreen"}</Text></Pressable>
      </View> : null}
      {Platform.OS !== "web" && status === "loading" ? <View style={[styles.state, isMobile && styles.stateMobile]}><ActivityIndicator size="large" color="#e7b36b" /><Text style={styles.stateText}>Connecting to live stream...</Text></View> : null}
      {Platform.OS !== "web" && (status === "error" || error) ? <View style={[styles.state, isMobile && styles.stateMobile]}><Text style={styles.errorTitle}>This stream is unavailable</Text><Text style={styles.stateText}>It may be offline, expired, or restricted in your region.</Text><View style={[styles.errorActions, isMobile && styles.errorActionsMobile]}><Pressable focusable onFocus={retryFocus.onFocus} onBlur={retryFocus.onBlur} onPress={retry} style={[styles.retryButton, retryFocus.focused && styles.retryButtonFocused]}><Text style={styles.retryText}>↻  Retry</Text></Pressable><Pressable focusable onFocus={errorPrevFocus.onFocus} onBlur={errorPrevFocus.onBlur} onPress={onPrev} style={[styles.nextButton, errorPrevFocus.focused && styles.nextButtonFocused]}><Text style={styles.nextText}>|◀  Previous</Text></Pressable><Pressable focusable onFocus={errorNextFocus.onFocus} onBlur={errorNextFocus.onBlur} onPress={onNext} style={[styles.nextButton, errorNextFocus.focused && styles.nextButtonFocused]}><Text style={styles.nextText}>Next  ▶|</Text></Pressable></View><Pressable focusable onFocus={returnFocus.onFocus} onBlur={returnFocus.onBlur} onPress={onClose} style={[styles.returnButton, returnFocus.focused && styles.returnButtonFocused]}><Text style={styles.returnText}>Return to channels</Text></Pressable></View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#050708", justifyContent: "center" },
  video: { ...StyleSheet.absoluteFill },
  topBar: { position: "absolute", flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  back: { backgroundColor: "rgba(12, 17, 20, 0.9)", borderColor: "#4b565f", borderWidth: 2, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10 },
  backFocused: { borderColor: "#e7b36b" },
  backText: { color: "#f8f4ec", fontSize: 15, fontWeight: "800" },
  channel: { color: "#e4e8e9", fontSize: 15, fontWeight: "700", backgroundColor: "rgba(12, 17, 20, 0.72)", paddingHorizontal: 13, paddingVertical: 9, borderRadius: 8, flexShrink: 1 },
  controls: { position: "absolute", minHeight: 74, borderRadius: 14, backgroundColor: "rgba(12, 17, 20, 0.94)", borderColor: "#303b43", borderWidth: 1, flexDirection: "row", alignItems: "center", paddingHorizontal: 14, gap: 10 },
  controlsMobile: { minHeight: 62, paddingHorizontal: 10, gap: 6 },
  controlButton: { width: 48, height: 48, borderRadius: 8, backgroundColor: "#202a31", alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "transparent" },
  controlButtonFocused: { borderColor: "#e7b36b" },
  controlText: { color: "#f7f2e9", fontSize: 21, fontWeight: "900" },
  controlInfo: { flex: 1, marginLeft: 6 },
  controlTitle: { color: "#f4efe7", fontSize: 15, fontWeight: "800" },
  controlMeta: { color: "#849098", fontSize: 11, marginTop: 5, letterSpacing: 1 },
  fullscreenButton: { borderColor: "#56636c", borderWidth: 2, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 11 },
  fullscreenButtonFocused: { borderColor: "#e7b36b" },
  fullscreenText: { color: "#e8ecec", fontSize: 13, fontWeight: "800" },
  state: { alignItems: "center", alignSelf: "center", padding: 30, borderRadius: 14, backgroundColor: "rgba(16, 21, 25, 0.94)", maxWidth: 390 },
  stateMobile: { padding: 20, maxWidth: "90%" },
  webNotice: { alignItems: "center", alignSelf: "center", padding: 30, borderRadius: 14, backgroundColor: "rgba(16, 21, 25, 0.94)", maxWidth: 430 },
  stateText: { color: "#aeb6ba", fontSize: 15, textAlign: "center", marginTop: 14, lineHeight: 22 },
  errorTitle: { color: "#fff8ef", fontSize: 20, fontWeight: "900" },
  errorActions: { flexDirection: "row", gap: 10, marginTop: 20 },
  errorActionsMobile: { flexWrap: "wrap", justifyContent: "center" },
  retryButton: { borderRadius: 8, backgroundColor: "#e7b36b", paddingHorizontal: 18, paddingVertical: 11, borderWidth: 2, borderColor: "transparent" },
  retryButtonFocused: { borderColor: "#fff8ef" },
  retryText: { color: "#1a1713", fontWeight: "900" },
  nextButton: { borderRadius: 8, borderColor: "#56636c", borderWidth: 2, paddingHorizontal: 18, paddingVertical: 11 },
  nextButtonFocused: { borderColor: "#e7b36b" },
  nextText: { color: "#f4efe7", fontWeight: "900" },
  returnButton: { marginTop: 20, borderRadius: 8, backgroundColor: "#e7b36b", paddingHorizontal: 18, paddingVertical: 11, borderWidth: 2, borderColor: "transparent" },
  returnButtonFocused: { borderColor: "#fff8ef" },
  returnText: { color: "#1a1713", fontWeight: "900" },
});
