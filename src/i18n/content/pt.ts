import type { Content } from "./types";

// Portuguese copy, drafted from `en.ts` with the terms of the Portuguese CV. Job titles and trade terms
// stay in English as the CV keeps them ("Tech Lead", "design system", "micro frontend", stack names).
// Plain text only: no HTML, no Markdown (spec 0003, AC-5).
export const pt = {
	meta: {
		title: "Renon Reis · Engenheiro de Software Sênior e Tech Lead",
		description:
			"Sou Renon Reis, Engenheiro de Software Sênior e Tech Lead em Curitiba, Brasil. Construo design systems, jornadas bancárias e plataformas de e-commerce com TypeScript, React e Next.js.",
		ogImageAlt:
			"renon.dev: Renon Reis, Engenheiro de Software Sênior e Tech Lead",
	},
	nav: {
		work: "Trabalhos",
		services: "Serviços",
		about: "Sobre",
		contact: "Contato",
		hireMe: "Me contrate",
		menuOpen: "Menu",
		menuClose: "Fechar menu",
	},
	languageSwitch: {
		groupLabel: "Idioma",
		names: { en: "English", pt: "Português" },
	},
	hero: {
		role: "Engenheiro de Software Sênior",
		roleAccent: "e Tech Lead",
		location: "Curitiba, Brasil · remoto",
	},
	work: {
		eyebrow: "Portfólio",
		title: "Trabalhos selecionados",
		labels: { role: "Meu papel", stack: "Stack", outcome: "Resultado" },
		items: [
			{
				id: "sicredi-banking",
				title: "Internet Banking",
				body: "Liderei o squad que construiu o micro frontend de histórico de transações, detalhamento e agendamentos do Internet Banking PF, substituindo menus legados espalhados.",
				role: "Tech Lead",
				outcome: "Liberado para toda a base de usuários PF em outubro de 2026.",
				artLabel: "Ilustração: app de banco",
			},
			{
				id: "sicredi-core-web",
				title: "Design system Core Web",
				body: "Desenvolvi 25+ dos cerca de 70 componentes da biblioteca Core Web, com metas de contraste AAA, áreas de toque de 44px e testes com leitor de tela.",
				role: "Tech Lead",
				artLabel: "Componentes de design system",
			},
			{
				id: "printi",
				title: "Plataforma de e-commerce",
				body: "Atuei no time core de e-commerce em melhorias de plataforma e checkout enquanto o catálogo crescia.",
				role: "Engenheiro de Software Sênior",
				outcome:
					"Ajudei a crescer 40% os usuários ativos, 50% as sessões e cerca de 20% o ticket médio.",
				artLabel: "Ilustração: produtos gráficos",
			},
		],
	},
	now: {
		title: "Construindo agora",
		tag: "Código aberto",
		newTab: "abre em uma nova aba",
		items: [
			{
				id: "triquetra",
				title: "Triquetra",
				body: "Meu design system acessível em React: design tokens e componentes, documentado em triquetra.renon.dev.",
			},
			{
				id: "zero-dawn",
				title: "Project Zero Dawn",
				body: "Meu fluxo de engenharia agêntica: decisões escritas no repositório, executadas por agentes de IA.",
			},
		],
	},
	services: {
		eyebrow: "Serviços",
		title: "Como posso ajudar",
		cta: "Vamos conversar",
		items: [
			{
				title: "Produtos completos",
				body: "Produtos em Next.js e Node.js, projetados e entregues de ponta a ponta.",
			},
			{
				title: "Liderança técnica",
				body: "Lidero squads de frontend, defino padrões e trago fluxos assistidos por IA.",
			},
			{
				title: "Resgate de frontend",
				body: "Performance, acessibilidade e saúde de código para um produto existente.",
			},
		],
	},
	about: {
		eyebrow: "Sobre",
		title: "Curitiba, Brasil.",
		bio: [
			"Sou o Renon, engenheiro de software com 10 anos de experiência em desenvolvimento web. Trabalho principalmente com TypeScript, React e Next.js, e construí design systems, jornadas bancárias e plataformas de e-commerce para Sicredi e Printi.",
			"Me importo com arquitetura de componentes, acessibilidade e qualidade de frontend. Como Tech Lead, lidero squads e mentoro desenvolvedores.",
		],
	},
	highlights: {
		open: {
			eyebrow: "Agora",
			title: "Aberto a conversas",
			body: "Sou Tech Lead na Raio e estou aberto a novas oportunidades e trabalhos freelance.",
			cta: "Me contrate",
		},
	},
	clients: {
		title: "Clientes",
		metrics: [
			{ figure: "10 anos", label: "em desenvolvimento web" },
			{ figure: "25+", label: "componentes de design system" },
			{ figure: "~20%", label: "de aumento no ticket médio" },
			{ figure: "Toda", label: "a base de varejo do Sicredi" },
		],
	},
	footer: {
		pill: "Vamos construir algo",
		newTab: "abre em uma nova aba",
		copyright: (year: number) => `© ${year} Renon Reis`,
	},
	notFound: {
		title: "Página não encontrada",
		body: "Esta página não existe.",
		backHome: "Ir para a página inicial",
	},
} as const satisfies Content;
