import type { Channel } from "@/types/channel";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, BackHandler, Platform, Pressable, StyleSheet, Text, View } from "react-native";

export function VideoPlayerScreen({ channel, onClose, onNext }: { channel: Channel; onClose: () => void; onNext: () => void }) {
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState<string | null>(null);
  const [playing, setPlaying] = useState(true);
  const videoRef = useRef<VideoView>(null);
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
      <View style={styles.topBar}><Pressable focusable onPress={onClose} style={styles.back}><Text style={styles.backText}>‹  Back</Text></Pressable><Text style={styles.channel}>{channel.name}</Text></View>
      {Platform.OS !== "web" && status !== "error" && !error ? <View style={styles.controls}>
        <Pressable focusable onPress={() => { playing ? player.pause() : player.play(); }} style={styles.controlButton}><Text style={styles.controlText}>{playing ? "Ⅱ" : "▶"}</Text></Pressable>
        <Pressable focusable onPress={onNext} style={styles.controlButton}><Text style={styles.controlText}>▶|</Text></Pressable>
        <View style={styles.controlInfo}><Text style={styles.controlTitle}>{channel.name}</Text><Text style={styles.controlMeta}>LIVE  •  {channel.groupTitle || "Channel"}</Text></View>
        <Pressable focusable onPress={() => videoRef.current?.enterFullscreen()} style={styles.fullscreenButton}><Text style={styles.fullscreenText}>⛶  Fullscreen</Text></Pressable>
      </View> : null}
      {Platform.OS !== "web" && status === "loading" ? <View style={styles.state}><ActivityIndicator size="large" color="#e7b36b" /><Text style={styles.stateText}>Connecting to live stream...</Text></View> : null}
      {Platform.OS !== "web" && (status === "error" || error) ? <View style={styles.state}><Text style={styles.errorTitle}>This stream is unavailable</Text><Text style={styles.stateText}>It may be offline, expired, or restricted in your region.</Text><View style={styles.errorActions}><Pressable focusable onPress={retry} style={styles.retryButton}><Text style={styles.retryText}>↻  Retry</Text></Pressable><Pressable focusable onPress={onNext} style={styles.nextButton}><Text style={styles.nextText}>Next channel  ▶|</Text></Pressable></View><Pressable focusable onPress={onClose} style={styles.returnButton}><Text style={styles.returnText}>Return to channels</Text></Pressable></View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#050708", justifyContent: "center" },
  video: { ...StyleSheet.absoluteFill },
  topBar: { position: "absolute", top: 28, left: 32, right: 32, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  back: { backgroundColor: "rgba(12, 17, 20, 0.9)", borderColor: "#4b565f", borderWidth: 1, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10 },
  backText: { color: "#f8f4ec", fontSize: 15, fontWeight: "800" },
  channel: { color: "#e4e8e9", fontSize: 15, fontWeight: "700", backgroundColor: "rgba(12, 17, 20, 0.72)", paddingHorizontal: 13, paddingVertical: 9, borderRadius: 8 },
  controls: { position: "absolute", left: 32, right: 32, bottom: 28, minHeight: 74, borderRadius: 14, backgroundColor: "rgba(12, 17, 20, 0.94)", borderColor: "#303b43", borderWidth: 1, flexDirection: "row", alignItems: "center", paddingHorizontal: 14, gap: 10 },
  controlButton: { width: 48, height: 48, borderRadius: 8, backgroundColor: "#202a31", alignItems: "center", justifyContent: "center" },
  controlText: { color: "#f7f2e9", fontSize: 21, fontWeight: "900" },
  controlInfo: { flex: 1, marginLeft: 6 },
  controlTitle: { color: "#f4efe7", fontSize: 15, fontWeight: "800" },
  controlMeta: { color: "#849098", fontSize: 11, marginTop: 5, letterSpacing: 1 },
  fullscreenButton: { borderColor: "#56636c", borderWidth: 1, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 11 },
  fullscreenText: { color: "#e8ecec", fontSize: 13, fontWeight: "800" },
  state: { alignItems: "center", alignSelf: "center", padding: 30, borderRadius: 14, backgroundColor: "rgba(16, 21, 25, 0.94)", maxWidth: 390 },
  webNotice: { alignItems: "center", alignSelf: "center", padding: 30, borderRadius: 14, backgroundColor: "rgba(16, 21, 25, 0.94)", maxWidth: 430 },
  stateText: { color: "#aeb6ba", fontSize: 15, textAlign: "center", marginTop: 14, lineHeight: 22 },
  errorTitle: { color: "#fff8ef", fontSize: 20, fontWeight: "900" },
  errorActions: { flexDirection: "row", gap: 10, marginTop: 20 },
  retryButton: { borderRadius: 8, backgroundColor: "#e7b36b", paddingHorizontal: 18, paddingVertical: 11 },
  retryText: { color: "#1a1713", fontWeight: "900" },
  nextButton: { borderRadius: 8, borderColor: "#56636c", borderWidth: 1, paddingHorizontal: 18, paddingVertical: 11 },
  nextText: { color: "#f4efe7", fontWeight: "900" },
  returnButton: { marginTop: 20, borderRadius: 8, backgroundColor: "#e7b36b", paddingHorizontal: 18, paddingVertical: 11 },
  returnText: { color: "#1a1713", fontWeight: "900" },
});
