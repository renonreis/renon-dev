// The shape every locale's copy must satisfy (spec 0003). A missing or misspelled key fails `pnpm check`.
// Facts that do not translate (names, stacks, URLs, the year) live in `shared.ts`, never here.

export type WorkId = "sicredi-banking" | "sicredi-core-web" | "printi";
export type NowId = "triquetra" | "zero-dawn";

export interface WorkItem {
	readonly id: WorkId;
	readonly title: string;
	readonly body: string;
	readonly role: string;
	readonly outcome?: string;
	/** Describes the decorative art slot; never rendered as alt text. */
	readonly artLabel: string;
}

export interface NowItem {
	readonly id: NowId;
	readonly title: string;
	readonly body: string;
}

export interface Service {
	readonly title: string;
	readonly body: string;
}

export interface Metric {
	readonly figure: string;
	readonly label: string;
}

export interface Content {
	readonly meta: {
		readonly title: string;
		readonly description: string;
		readonly ogImageAlt: string;
	};
	readonly nav: {
		readonly work: string;
		readonly services: string;
		readonly about: string;
		readonly contact: string;
		readonly hireMe: string;
		readonly menuOpen: string;
		readonly menuClose: string;
	};
	readonly languageSwitch: {
		readonly groupLabel: string;
		/** Accessible names of the two links; the visible labels come from `shared.localeLabels`. */
		readonly names: { readonly en: string; readonly pt: string };
	};
	readonly hero: {
		readonly role: string;
		readonly roleAccent: string;
		readonly location: string;
	};
	readonly work: {
		readonly eyebrow: string;
		readonly title: string;
		readonly labels: {
			readonly role: string;
			readonly stack: string;
			readonly outcome: string;
		};
		readonly items: readonly WorkItem[];
	};
	readonly now: {
		readonly title: string;
		readonly tag: string;
		readonly newTab: string;
		readonly items: readonly NowItem[];
	};
	readonly services: {
		readonly eyebrow: string;
		readonly title: string;
		readonly cta: string;
		readonly items: readonly [Service, Service, Service];
	};
	readonly about: {
		readonly eyebrow: string;
		readonly title: string;
		readonly bio: readonly string[];
	};
	readonly highlights: {
		readonly open: {
			readonly eyebrow: string;
			readonly title: string;
			readonly body: string;
			readonly cta: string;
		};
		/** Absent until the engineer supplies the story; the card is then not rendered (AC-9). */
		readonly offTheClock?: {
			readonly eyebrow: string;
			readonly title: string;
			readonly body: string;
		};
	};
	readonly clients: {
		readonly title: string;
		readonly metrics: readonly Metric[];
	};
	readonly footer: {
		readonly pill: string;
		readonly newTab: string;
		/** The one function field: word order can differ by language. */
		readonly copyright: (year: number) => string;
	};
	readonly notFound: {
		readonly title: string;
		readonly body: string;
		readonly backHome: string;
	};
}
