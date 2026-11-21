// One route map for every localized page. The layout reads it to write `lang`, canonical and hreflang.
export const locales = ["en", "pt"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const htmlLang: Record<Locale, string> = {
	en: "en",
	pt: "pt-BR",
};

export const homePath: Record<Locale, string> = {
	en: "/",
	pt: "/pt/",
};
