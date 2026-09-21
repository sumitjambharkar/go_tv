import { ContentRow } from "@/components/ContentRow";
import { HeroBanner } from "@/components/HeroBanner";
import { LanguageSelector } from "@/components/LanguageSelector";
import { VideoPlayerScreen } from "@/components/VideoPlayerScreen";
import { PLAYLIST_ORDER, PLAYLISTS, type PlaylistCode } from "@/config/playlists";
import { loadChannels } from "@/services/channelService";
import type { Channel } from "@/types/channel";
import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

const NAV_ITEMS = ["Home", "TV Shows", "Movies", "Live TV", "Languages"];

export default function TVHomeScreen() {
  const [activeNav, setActiveNav] = useState("Home");
  const [language, setLanguage] = useState<PlaylistCode | "all">("all");
  const [catalogue, setCatalogue] = useState<Record<PlaylistCode, Channel[]>>({ hin: [], mar: [], eng: [] });
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [loading, setLoading] = useState(true);
  const [onlineCount, setOnlineCount] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const scrollRef = useRef<ScrollView>(null);
  const searchRef = useRef<TextInput>(null);

  useEffect(() => {
    loadChannels(PLAYLIST_ORDER).then((channels) => {
      setCatalogue(channels);
      setOnlineCount(Object.values(channels).reduce((total, items) => total + items.length, 0));
    }).finally(() => setLoading(false));
  }, []);

  const featured = useMemo(() => [...catalogue.hin, ...catalogue.mar, ...catalogue.eng].slice(0, 12), [catalogue]);
  const visibleRows = language === "all" ? PLAYLIST_ORDER : [language];
  const playableChannels = useMemo(() => PLAYLIST_ORDER.flatMap((code) => catalogue[code]), [catalogue]);
  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];
    return playableChannels.filter((channel) => [channel.name, channel.groupTitle, channel.language, channel.country].filter(Boolean).some((value) => value!.toLowerCase().includes(query)));
  }, [playableChannels, searchQuery]);

  const nextChannel = () => {
    if (!selectedChannel || !playableChannels.length) return;
    const currentIndex = playableChannels.findIndex((channel) => channel.streamUrl === selectedChannel.streamUrl);
    setSelectedChannel(playableChannels[(currentIndex + 1) % playableChannels.length]);
  };

  if (selectedChannel) return <VideoPlayerScreen channel={selectedChannel} onClose={() => setSelectedChannel(null)} onNext={nextChannel} />;

  return (
    <View style={styles.screen}>
      <View style={styles.navbar}>
        <Pressable focusable onPress={() => { setActiveNav("Home"); scrollRef.current?.scrollTo({ y: 0, animated: true }); }} style={styles.brand}><View style={styles.brandMark}><Text style={styles.brandMarkText}>G</Text></View><Text style={styles.brandText}>GO<Text style={styles.brandAccent}>TV</Text></Text></Pressable>
        <View style={styles.navItems}>{NAV_ITEMS.map((item) => <Pressable key={item} focusable onPress={() => setActiveNav(item)} style={[styles.navItem, activeNav === item && styles.navActive]}><Text style={[styles.navText, activeNav === item && styles.navActiveText]}>{item}</Text></Pressable>)}</View>
        <View style={styles.navActions}>
          {searchOpen ? <TextInput ref={searchRef} autoFocus value={searchQuery} onChangeText={setSearchQuery} onSubmitEditing={() => searchRef.current?.blur()} placeholder="Search channels" placeholderTextColor="#74808a" style={styles.searchInput} returnKeyType="search" /> : null}
          <Pressable focusable onPress={() => { setSearchOpen((open) => !open); if (searchOpen) setSearchQuery(""); }} style={[styles.iconButton, searchOpen && styles.iconButtonActive]} accessibilityLabel={searchOpen ? "Close search" : "Search channels"}><Text style={styles.icon}>{searchOpen ? "×" : "⌕"}</Text></Pressable>
          <Pressable focusable style={styles.iconButton} accessibilityLabel="Profile and settings"><Text style={styles.icon}>◉</Text></Pressable>
        </View>
      </View>
      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <HeroBanner onWatch={() => featured[0] && setSelectedChannel(featured[0])} />
        <View style={styles.statusLine}><View style={styles.liveBadge}><View style={styles.pulse} /><Text style={styles.liveBadgeText}>LIVE CHANNELS</Text></View><Text style={styles.statusText}>{loading ? "Syncing public playlists" : `${onlineCount.toLocaleString()} channels ready to watch`}</Text></View>
        <LanguageSelector selected={language} onSelect={setLanguage} />
        {searchOpen && searchQuery.trim() ? <ContentRow title={`Search results (${searchResults.length})`} subtitle={searchResults.length ? "Choose a channel to watch" : "No matching channels"} channels={searchResults} accent="#e7b36b" onSelect={setSelectedChannel} /> : null}
        {loading ? <View style={styles.loading}><ActivityIndicator color="#e7b36b" size="small" /><Text style={styles.loadingText}>Bringing your channels into focus...</Text></View> : null}
        {!searchOpen && !loading && featured.length ? <ContentRow title="Trending now" subtitle="A quick pick from your live catalogue" channels={featured} accent="#e7b36b" onSelect={setSelectedChannel} /> : null}
        {!searchOpen && visibleRows.map((code) => <ContentRow key={code} title={PLAYLISTS[code].label} subtitle={code === "hin" ? "India's heartbeat" : code === "mar" ? "Stories from Maharashtra" : "Global favourites"} channels={catalogue[code]} accent={PLAYLISTS[code].accent} onSelect={setSelectedChannel} />)}
        {!loading && !onlineCount ? <View style={styles.empty}><Text style={styles.emptyTitle}>Channels are taking a moment</Text><Text style={styles.emptyText}>Check your connection and reopen the app to refresh the public playlists.</Text></View> : null}
        <Text style={styles.footnote}>Public streams from iptv-org • Availability varies by channel and region</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#0a0e11" },
  navbar: { height: 82, backgroundColor: "#0a0e11", borderBottomColor: "#202830", borderBottomWidth: 1, flexDirection: "row", alignItems: "center", paddingHorizontal: 52, zIndex: 2 },
  brand: { flexDirection: "row", alignItems: "center", width: 150 },
  brandMark: { width: 34, height: 34, borderRadius: 10, backgroundColor: "#e7b36b", alignItems: "center", justifyContent: "center", transform: [{ rotate: "-8deg" }] },
  brandMarkText: { color: "#171513", fontSize: 22, fontWeight: "900", transform: [{ rotate: "8deg" }] },
  brandText: { color: "#f7f3ec", fontSize: 20, fontWeight: "900", marginLeft: 10, letterSpacing: 1 },
  brandAccent: { color: "#e7b36b" },
  navItems: { flexDirection: "row", alignItems: "center", gap: 4, flex: 1 },
  navItem: { paddingHorizontal: 15, paddingVertical: 12, borderRadius: 7 },
  navActive: { backgroundColor: "#1b232a" },
  navText: { color: "#89939c", fontSize: 14, fontWeight: "700" },
  navActiveText: { color: "#f4eee5" },
  navActions: { flexDirection: "row", gap: 8 },
  searchInput: { width: 230, height: 40, borderRadius: 8, borderColor: "#e7b36b", borderWidth: 1, backgroundColor: "#141b21", color: "#f4efe7", paddingHorizontal: 14, fontSize: 14 },
  iconButton: { width: 38, height: 38, alignItems: "center", justifyContent: "center", borderRadius: 8, backgroundColor: "#141b21" },
  iconButtonActive: { backgroundColor: "#2a2922", borderColor: "#e7b36b", borderWidth: 1 },
  icon: { color: "#d6dce0", fontSize: 23 },
  content: { paddingBottom: 48 },
  statusLine: { paddingHorizontal: 52, marginTop: 24, flexDirection: "row", alignItems: "center", gap: 12 },
  liveBadge: { flexDirection: "row", alignItems: "center", gap: 7 },
  pulse: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#e87860" },
  liveBadgeText: { color: "#e87860", fontSize: 11, fontWeight: "900", letterSpacing: 1.6 },
  statusText: { color: "#68747e", fontSize: 13 },
  loading: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 52, paddingTop: 34 },
  loadingText: { color: "#98a3aa", fontSize: 14 },
  empty: { marginHorizontal: 52, marginTop: 38, padding: 28, borderRadius: 14, backgroundColor: "#141b21" },
  emptyTitle: { color: "#f5f2eb", fontSize: 20, fontWeight: "800" },
  emptyText: { color: "#89939b", fontSize: 14, marginTop: 9 },
  footnote: { color: "#4f5b64", fontSize: 12, marginHorizontal: 52, marginTop: 42 },
});
