import type { Channel } from "@/types/channel";

const ATTRIBUTE_PATTERN = /([\w-]+)=("(?:\\.|[^"])*"|'[^']*'|[^\s]+)/g;

function unescape(value: string) {
  return value.replace(/^['"]|['"]$/g, "").replace(/\\"/g, '"').trim();
}

function attributesFrom(line: string) {
  const attributes: Record<string, string> = {};
  let match: RegExpExecArray | null;
  while ((match = ATTRIBUTE_PATTERN.exec(line)) !== null) {
    attributes[match[1].toLowerCase()] = unescape(match[2]);
  }
  ATTRIBUTE_PATTERN.lastIndex = 0;
  return attributes;
}

function normalizeLanguage(value: string | undefined) {
  const normalized = (value ?? "").toLowerCase().trim();
  if (["hin", "hindi", "hi"].includes(normalized)) return "hin";
  if (["mar", "marathi", "mr"].includes(normalized)) return "mar";
  if (["eng", "english", "en"].includes(normalized)) return "eng";
  return normalized;
}

export function parseM3U(playlist: string): Channel[] {
  const lines = playlist.split(/\r?\n/).map((line) => line.trim());
  const channels: Channel[] = [];
  let pending: Omit<Channel, "streamUrl"> | null = null;

  for (const line of lines) {
    if (line.startsWith("#EXTINF")) {
      const commaIndex = line.indexOf(",");
      const attributes = attributesFrom(line);
      const name = commaIndex >= 0 ? line.slice(commaIndex + 1).trim() : attributes["tvg-name"] ?? "Untitled channel";
      pending = {
        id: attributes["tvg-id"] ?? null,
        name: name || attributes["tvg-name"] || "Untitled channel",
        logo: attributes["tvg-logo"] ?? null,
        groupTitle: attributes["group-title"] ?? null,
        language: normalizeLanguage(attributes["language"] ?? attributes["tvg-language"]),
        country: attributes["tvg-country"] ?? attributes["country"] ?? null,
        epgId: attributes["tvg-id"] ?? null,
        httpReferrer: attributes["http-referrer"] ?? null,
        userAgent: attributes["http-user-agent"] ?? null,
      };
    } else if (pending && line.startsWith("#EXTVLCOPT:http-referrer=")) {
      pending.httpReferrer = line.slice("#EXTVLCOPT:http-referrer=".length).trim();
    } else if (pending && line.startsWith("#EXTVLCOPT:http-user-agent=")) {
      pending.userAgent = line.slice("#EXTVLCOPT:http-user-agent=".length).trim();
    } else if (pending && line && !line.startsWith("#")) {
      channels.push({ ...pending, streamUrl: line });
      pending = null;
    }
  }

  return channels.filter((channel) => channel.streamUrl.startsWith("http"));
}
