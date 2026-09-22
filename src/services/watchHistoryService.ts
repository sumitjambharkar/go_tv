import type { Channel } from "@/types/channel";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "gotv:watchHistory:v1";
const MAX_HISTORY = 30;

function channelKey(channel: Channel) {
  return channel.id || channel.streamUrl;
}

export async function getWatchHistory(): Promise<Channel[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY).catch(() => null);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Channel[];
  } catch {
    return [];
  }
}

export async function addToWatchHistory(channel: Channel): Promise<Channel[]> {
  const history = await getWatchHistory();
  const updated = [channel, ...history.filter((item) => channelKey(item) !== channelKey(channel))].slice(0, MAX_HISTORY);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated)).catch(() => undefined);
  return updated;
}
