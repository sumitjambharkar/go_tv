import { PLAYLISTS, type PlaylistCode } from "@/config/playlists";
import { parseM3U } from "@/services/m3uParser";
import type { Channel } from "@/types/channel";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CACHE_PREFIX = "gotv:playlist:v2:";
const CACHE_TTL = 1000 * 60 * 60 * 6;

type CachedPlaylist = { savedAt: number; channels: Channel[] };

async function readCache(code: PlaylistCode) {
  const raw = await AsyncStorage.getItem(`${CACHE_PREFIX}${code}`);
  if (!raw) return null;
  const cached = JSON.parse(raw) as CachedPlaylist;
  return Date.now() - cached.savedAt < CACHE_TTL ? cached.channels : null;
}

export async function fetchPlaylist(code: PlaylistCode): Promise<Channel[]> {
  const cached = await readCache(code).catch(() => null);
  if (cached?.length) return cached;

  const playlist = PLAYLISTS[code];
  const response = await fetch(playlist.url);
  if (!response.ok) throw new Error(`Playlist request failed: ${response.status}`);
  let channels = parseM3U(await response.text());
  const supplementalUrl = playlist.supplementalUrl;
  if (supplementalUrl) {
    const supplementalResponse = await fetch(supplementalUrl);
    if (supplementalResponse.ok) {
      const supplementalChannels = parseM3U(await supplementalResponse.text());
      const pattern = playlist.supplementalNamePattern;
      if (pattern) channels = channels.concat(supplementalChannels.filter((channel) => channel.name.toLowerCase().includes(pattern)));
    }
  }
  await AsyncStorage.setItem(`${CACHE_PREFIX}${code}`, JSON.stringify({ savedAt: Date.now(), channels })).catch(() => undefined);
  return channels;
}
