import type { NowId, WorkId } from "./types";

// Values that never change between languages (spec 0003, AC-3). Locale files hold words, not these facts.
interface Link {
	readonly label: string;
	readonly href: string;
}

const work: Readonly<
	Record<WorkId, { readonly client: string; readonly stack: readonly string[] }>
> = {
	"sicredi-banking": {
		client: "Sicredi",
		stack: ["React 19", "TypeScript", "Zustand", "Tailwind"],
	},
	"sicredi-core-web": {
		client: "Sicredi",
		stack: ["React", "TypeScript", "Tailwind", "Storybook"],
	},
	printi: { client: "Printi", stack: ["React", "Next.js", "Node.js"] },
};

const now: Readonly<Record<NowId, { readonly href: string }>> = {
	triquetra: { href: "https://triquetra.renon.dev" },
	"zero-dawn": { href: "https://github.com/renonreis/project-zero-dawn" },
};

const links: { readonly linkedin: Link; readonly github: Link } = {
	linkedin: {
		label: "LinkedIn",
		href: "https://www.linkedin.com/in/renonreis",
	},
	github: { label: "GitHub", href: "https://github.com/renonreis" },
};

export const shared = {
	wordmark: "renon.dev",
	localeLabels: { en: "EN", pt: "PT" },
	notFoundCode: "404",
	email: "hello@renon.dev",
	links,
	work,
	now,
	clients: ["Sicredi", "Printi", "Contabilizei", "Meiuca", "Raio"],
	heroTags: ["TypeScript", "React", "Next.js", "Node.js"],
	/** The year the site was built, evaluated once at build time (AC-10). */
	buildYear: new Date().getFullYear(),
} as const;

/** `mailto:` link for the published address; components never write the address themselves. */
export const mailtoHref = `mailto:${shared.email}`;
