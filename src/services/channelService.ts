import { fetchPlaylist } from "@/services/playlistService";
import type { Channel, LanguageKey } from "@/types/channel";

function channelKey(channel: Channel) {
  return (channel.id || `${channel.name}|${channel.streamUrl}`).toLowerCase().replace(/\s+/g, " ");
}

export function dedupeChannels(channels: Channel[]) {
  const seen = new Set<string>();
  return channels.filter((channel) => {
    const key = channelKey(channel);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function loadChannels(codes: LanguageKey[]) {
  const results = await Promise.allSettled(codes.map((code) => fetchPlaylist(code)));
  return results.reduce<Record<LanguageKey, Channel[]>>((accumulator, result, index) => {
    const code = codes[index];
    accumulator[code] = result.status === "fulfilled" ? dedupeChannels(result.value) : [];
    return accumulator;
  }, {} as Record<LanguageKey, Channel[]>);
}
