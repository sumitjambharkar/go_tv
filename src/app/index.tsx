import { ChannelTabs, type ChannelTab } from "@/components/ChannelTabs";
import { ContentRow } from "@/components/ContentRow";
import { HeroBanner } from "@/components/HeroBanner";
import { VideoPlayerScreen } from "@/components/VideoPlayerScreen";
import { PLAYLIST_ORDER, PLAYLISTS, type PlaylistCode } from "@/config/playlists";
import { useFocusRing } from "@/hooks/useFocusRing";
import { useResponsive } from "@/hooks/useResponsive";
import { dedupeChannels, loadChannels } from "@/services/channelService";
import { addToWatchHistory, getWatchHistory } from "@/services/watchHistoryService";
import type { Channel } from "@/types/channel";
import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TVHomeScreen() {
  const [activeTab, setActiveTab] = useState<ChannelTab>("all");
  const [catalogue, setCatalogue] = useState<Record<PlaylistCode, Channel[]>>({ hin: [], mar: [], eng: [] });
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [loading, setLoading] = useState(true);
  const [onlineCount, setOnlineCount] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<Channel[]>([]);
  const scrollRef = useRef<ScrollView>(null);
  const searchRef = useRef<TextInput>(null);
  const { isMobile } = useResponsive();
  const insets = useSafeAreaInsets();
  const brandFocus = useFocusRing();
  const searchIconFocus = useFocusRing();
  const profileIconFocus = useFocusRing();

  useEffect(() => {
    loadChannels(PLAYLIST_ORDER).then((channels) => {
      setCatalogue(channels);
      setOnlineCount(Object.values(channels).reduce((total, items) => total + items.length, 0));
    }).finally(() => setLoading(false));
    getWatchHistory().then(setFavorites);
  }, []);

  const featured = useMemo(() => dedupeChannels([...catalogue.hin, ...catalogue.mar, ...catalogue.eng]).slice(0, 12), [catalogue]);
  const visibleRows = activeTab === "all" ? PLAYLIST_ORDER : activeTab === "favorites" ? [] : [activeTab];
  const playableChannels = useMemo(() => dedupeChannels(PLAYLIST_ORDER.flatMap((code) => catalogue[code])), [catalogue]);
  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];
    return playableChannels.filter((channel) => [channel.name, channel.groupTitle, channel.language, channel.country].filter(Boolean).some((value) => value!.toLowerCase().includes(query)));
  }, [playableChannels, searchQuery]);

  const selectChannel = (channel: Channel) => {
    setSelectedChannel(channel);
    addToWatchHistory(channel).then(setFavorites);
  };

  const stepChannel = (direction: 1 | -1) => {
    if (!selectedChannel || !playableChannels.length) return;
    const currentIndex = playableChannels.findIndex((channel) => channel.streamUrl === selectedChannel.streamUrl);
    const nextIndex = (currentIndex + direction + playableChannels.length) % playableChannels.length;
    selectChannel(playableChannels[nextIndex]);
  };

  if (selectedChannel) return <VideoPlayerScreen channel={selectedChannel} onClose={() => setSelectedChannel(null)} onNext={() => stepChannel(1)} onPrev={() => stepChannel(-1)} />;

  const gutter = isMobile ? 16 : 52;
  const toggleSearch = () => {
    setSearchOpen((open) => {
      if (open) setSearchQuery("");
      return !open;
    });
  };
  const brand = <Pressable focusable onFocus={brandFocus.onFocus} onBlur={brandFocus.onBlur} onPress={() => scrollRef.current?.scrollTo({ y: 0, animated: true })} style={[styles.brand, brandFocus.focused && styles.brandFocused]}><View style={styles.brandMark}><Text style={styles.brandMarkText}>G</Text></View><Text style={styles.brandText}>GO<Text style={styles.brandAccent}>TV</Text></Text></Pressable>;
  const actionIcons = (
    <View style={styles.navActions}>
      {!isMobile && searchOpen ? <TextInput ref={searchRef} autoFocus value={searchQuery} onChangeText={setSearchQuery} onSubmitEditing={() => searchRef.current?.blur()} placeholder="Search channels" placeholderTextColor="#74808a" style={styles.searchInput} returnKeyType="search" /> : null}
      <Pressable focusable onFocus={searchIconFocus.onFocus} onBlur={searchIconFocus.onBlur} onPress={toggleSearch} style={[styles.iconButton, searchIconFocus.focused && styles.iconButtonFocused, searchOpen && styles.iconButtonActive]} accessibilityLabel={searchOpen ? "Close search" : "Search channels"}><Text style={styles.icon}>{searchOpen ? "×" : "⌕"}</Text></Pressable>
      {!isMobile ? <Pressable focusable onFocus={profileIconFocus.onFocus} onBlur={profileIconFocus.onBlur} style={[styles.iconButton, profileIconFocus.focused && styles.iconButtonFocused]} accessibilityLabel="Profile and settings"><Text style={styles.icon}>◉</Text></Pressable> : null}
    </View>
  );

  return (
    <View style={styles.screen}>
      <View style={[styles.navbar, { paddingTop: (isMobile ? insets.top : 0) + (isMobile ? 10 : 20), paddingBottom: isMobile ? 10 : 20, paddingHorizontal: gutter }]}>
        {isMobile && searchOpen ? (
          <TextInput ref={searchRef} autoFocus value={searchQuery} onChangeText={setSearchQuery} onSubmitEditing={() => searchRef.current?.blur()} placeholder="Search channels" placeholderTextColor="#74808a" style={[styles.searchInput, styles.searchInputMobile]} returnKeyType="search" />
        ) : (
          brand
        )}
        {actionIcons}
      </View>
      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingBottom: 48 + insets.bottom }]}>
        <HeroBanner onWatch={() => featured[0] && selectChannel(featured[0])} />
        <View style={[styles.statusLine, { paddingHorizontal: gutter }]}><View style={styles.liveBadge}><View style={styles.pulse} /><Text style={styles.liveBadgeText}>LIVE CHANNELS</Text></View><Text style={styles.statusText} numberOfLines={1}>{loading ? "Syncing public playlists" : `${onlineCount.toLocaleString()} channels ready to watch`}</Text></View>
        <ChannelTabs selected={activeTab} favoritesCount={favorites.length} onSelect={setActiveTab} />
        {searchOpen && searchQuery.trim() ? <ContentRow title={`Search results (${searchResults.length})`} subtitle={searchResults.length ? "Choose a channel to watch" : "No matching channels"} channels={searchResults} accent="#e7b36b" onSelect={selectChannel} /> : null}
        {!searchOpen && activeTab === "favorites" && favorites.length ? <ContentRow title={`Favorites (${favorites.length})`} subtitle="Channels you've watched" channels={favorites} accent="#e7b36b" onSelect={selectChannel} /> : null}
        {!searchOpen && activeTab === "favorites" && !favorites.length ? <View style={[styles.empty, { marginHorizontal: gutter }]}><Text style={styles.emptyTitle}>No favorites yet</Text><Text style={styles.emptyText}>Channels you watch will automatically show up here for quick access.</Text></View> : null}
        {loading ? <View style={[styles.loading, { paddingHorizontal: gutter }]}><ActivityIndicator color="#e7b36b" size="small" /><Text style={styles.loadingText}>Bringing your channels into focus...</Text></View> : null}
        {!searchOpen && activeTab !== "favorites" && !loading && featured.length ? <ContentRow title="Trending now" subtitle="A quick pick from your live catalogue" channels={featured} accent="#e7b36b" onSelect={selectChannel} /> : null}
        {!searchOpen && activeTab !== "favorites" && visibleRows.map((code) => <ContentRow key={code} title={PLAYLISTS[code].label} subtitle={code === "hin" ? "India's heartbeat" : code === "mar" ? "Stories from Maharashtra" : "Global favourites"} channels={catalogue[code]} accent={PLAYLISTS[code].accent} onSelect={selectChannel} />)}
        {!loading && !onlineCount ? <View style={[styles.empty, { marginHorizontal: gutter }]}><Text style={styles.emptyTitle}>Channels are taking a moment</Text><Text style={styles.emptyText}>Check your connection and reopen the app to refresh the public playlists.</Text></View> : null}
        <Text style={[styles.footnote, { marginHorizontal: gutter }]}>Public streams from iptv-org • Availability varies by channel and region</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#0a0e11" },
  navbar: { backgroundColor: "#0a0e11", borderBottomColor: "#202830", borderBottomWidth: 1, zIndex: 2, flexDirection: "row", alignItems: "center", gap: 10 },
  brand: { flexDirection: "row", alignItems: "center", borderWidth: 2, borderColor: "transparent", borderRadius: 8, paddingHorizontal: 4 },
  brandFocused: { borderColor: "#e7b36b" },
  brandMark: { width: 34, height: 34, borderRadius: 10, backgroundColor: "#e7b36b", alignItems: "center", justifyContent: "center", transform: [{ rotate: "-8deg" }] },
  brandMarkText: { color: "#171513", fontSize: 22, fontWeight: "900", transform: [{ rotate: "8deg" }] },
  brandText: { color: "#f7f3ec", fontSize: 20, fontWeight: "900", marginLeft: 10, letterSpacing: 1 },
  brandAccent: { color: "#e7b36b" },
  navActions: { flexDirection: "row", alignItems: "center", gap: 8, marginLeft: "auto" },
  searchInput: { width: 230, height: 40, borderRadius: 8, borderColor: "#e7b36b", borderWidth: 1, backgroundColor: "#141b21", color: "#f4efe7", paddingHorizontal: 14, fontSize: 14 },
  searchInputMobile: { flex: 1, width: undefined },
  iconButton: { width: 38, height: 38, alignItems: "center", justifyContent: "center", borderRadius: 8, backgroundColor: "#141b21", borderWidth: 2, borderColor: "transparent" },
  iconButtonFocused: { borderColor: "#e7b36b" },
  iconButtonActive: { backgroundColor: "#2a2922", borderColor: "#e7b36b" },
  icon: { color: "#d6dce0", fontSize: 23 },
  content: { paddingBottom: 48 },
  statusLine: { marginTop: 24, flexDirection: "row", alignItems: "center", gap: 12 },
  liveBadge: { flexDirection: "row", alignItems: "center", gap: 7 },
  pulse: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#e87860" },
  liveBadgeText: { color: "#e87860", fontSize: 11, fontWeight: "900", letterSpacing: 1.6 },
  statusText: { color: "#68747e", fontSize: 13, flexShrink: 1 },
  loading: { flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 34 },
  loadingText: { color: "#98a3aa", fontSize: 14 },
  empty: { marginHorizontal: 52, marginTop: 38, padding: 28, borderRadius: 14, backgroundColor: "#141b21" },
  emptyTitle: { color: "#f5f2eb", fontSize: 20, fontWeight: "800" },
  emptyText: { color: "#89939b", fontSize: 14, marginTop: 9 },
  footnote: { color: "#4f5b64", fontSize: 12, marginHorizontal: 52, marginTop: 42 },
});
