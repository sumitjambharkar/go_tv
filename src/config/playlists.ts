export const PLAYLISTS = {
  hin: {
    label: "Hindi",
    code: "hin",
    url: "https://iptv-org.github.io/iptv/languages/hin.m3u",
    supplementalUrl: null,
    supplementalNamePattern: null,
    accent: "#ffb347",
  },
  mar: {
    label: "Marathi",
    code: "mar",
    url: "https://iptv-org.github.io/iptv/languages/mar.m3u",
    supplementalUrl: "https://iptv-org.github.io/iptv/countries/in.m3u",
    supplementalNamePattern: "zee",
    accent: "#ff7664",
  },
  eng: {
    label: "English",
    code: "eng",
    url: "https://iptv-org.github.io/iptv/languages/eng.m3u",
    supplementalUrl: null,
    supplementalNamePattern: null,
    accent: "#62d4c5",
  },
} as const;

export type PlaylistCode = keyof typeof PLAYLISTS;
export const PLAYLIST_ORDER: PlaylistCode[] = ["hin", "mar", "eng"];
