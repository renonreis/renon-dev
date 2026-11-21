import type { Locale } from "../routes";
import { en } from "./en";
import { pt } from "./pt";
import type { Content } from "./types";

export { mailtoHref, shared } from "./shared";
export type { Content, NowId, WorkId } from "./types";

const contentByLocale: Readonly<Record<Locale, Content>> = { en, pt };

/** The page copy for one locale. Every component reads its words from here (spec 0003). */
export const getContent = (locale: Locale): Content => contentByLocale[locale];
