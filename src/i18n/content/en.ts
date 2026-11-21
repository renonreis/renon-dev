import type { Content } from "./types";

// English copy, from the approved Paper copy sheet (file `renon-dev`, Foundations, "Copy sheet"; spec 0001).
// Plain text only: no HTML, no Markdown (spec 0003, AC-5).
export const en = {
	meta: {
		title: "Renon Reis · Senior Software Engineer & Tech Lead",
		description:
			"I'm Renon Reis, a Senior Software Engineer and Tech Lead in Curitiba, Brazil. I build design systems, banking journeys and e-commerce platforms with TypeScript, React and Next.js.",
		ogImageAlt: "renon.dev: Renon Reis, Senior Software Engineer & Tech Lead",
	},
	nav: {
		work: "Work",
		services: "Services",
		about: "About",
		contact: "Contact",
		hireMe: "Hire me",
		menuOpen: "Menu",
		menuClose: "Close menu",
	},
	languageSwitch: {
		groupLabel: "Language",
		names: { en: "English", pt: "Português" },
	},
	hero: {
		role: "Senior Software Engineer",
		roleAccent: "& Tech Lead",
		location: "Curitiba, Brazil · remote",
	},
	work: {
		eyebrow: "Portfolio",
		title: "Selected work",
		labels: { role: "My role", stack: "Stack", outcome: "Outcome" },
		items: [
			{
				id: "sicredi-banking",
				title: "Internet Banking",
				body: "I led the squad that built the transaction history, details and scheduling micro frontend for retail Internet Banking, replacing scattered legacy menus.",
				role: "Tech Lead",
				outcome: "Rolled out to the full retail user base in October 2026.",
				artLabel: "Illustration: banking app",
			},
			{
				id: "sicredi-core-web",
				title: "Core Web design system",
				body: "I built 25+ of about 70 components in the Core Web library, to AAA contrast targets, 44px touch targets and screen reader tested.",
				role: "Tech Lead",
				artLabel: "Design system components",
			},
			{
				id: "printi",
				title: "E-commerce platform",
				body: "I worked in the core e-commerce team on platform and checkout improvements as the catalog grew.",
				role: "Senior Software Engineer",
				outcome:
					"Helped grow active users 40%, sessions 50% and average order value about 20%.",
				artLabel: "Illustration: print products",
			},
		],
	},
	now: {
		title: "Building now",
		tag: "Open source",
		newTab: "opens in a new tab",
		items: [
			{
				id: "triquetra",
				title: "Triquetra",
				body: "My accessible React design system: design tokens and components, documented at triquetra.renon.dev.",
			},
			{
				id: "zero-dawn",
				title: "Project Zero Dawn",
				body: "My agentic engineering workflow: decisions written in the repo, run by AI agents.",
			},
		],
	},
	services: {
		eyebrow: "Services",
		title: "How I can help",
		cta: "Let's talk",
		items: [
			{
				title: "Full product builds",
				body: "Next.js and Node.js products, designed and shipped end to end.",
			},
			{
				title: "Tech leadership",
				body: "I lead frontend squads, set standards and bring AI assisted workflows.",
			},
			{
				title: "Frontend rescue",
				body: "Performance, accessibility and code health for an existing product.",
			},
		],
	},
	about: {
		eyebrow: "About",
		title: "Curitiba, Brazil.",
		bio: [
			"I'm Renon, a software engineer with 10 years in web development. I work mostly in TypeScript, React and Next.js, and I've built design systems, banking journeys and e-commerce platforms for Sicredi and Printi.",
			"I care about component architecture, accessibility and frontend quality. As a Tech Lead, I lead squads and mentor developers.",
		],
	},
	highlights: {
		open: {
			eyebrow: "Now",
			title: "Open to conversations",
			body: "I'm Tech Lead at Raio, and I'm open to new opportunities and freelance work.",
			cta: "Hire me",
		},
	},
	clients: {
		title: "Clients",
		metrics: [
			{ figure: "10 years", label: "in web development" },
			{ figure: "25+", label: "design system components" },
			{ figure: "~20%", label: "higher average order value" },
			{ figure: "Full", label: "Sicredi retail user base reached" },
		],
	},
	footer: {
		pill: "Let's build something",
		newTab: "opens in a new tab",
		copyright: (year: number) => `© ${year} Renon Reis`,
	},
	notFound: {
		title: "Page not found",
		body: "This page does not exist.",
		backHome: "Go to the home page",
	},
} as const satisfies Content;
