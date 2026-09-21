export type Channel = {
  id: string | null;
  name: string;
  streamUrl: string;
  logo: string | null;
  groupTitle: string | null;
  language: string;
  country: string | null;
  epgId: string | null;
  httpReferrer: string | null;
  userAgent: string | null;
};

export type LanguageKey = "hin" | "mar" | "eng";
