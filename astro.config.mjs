// @ts-check
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import islandCheck from "./scripts/island-check-integration.mjs";

// ISLAND_CHECK=1 builds a separate test only site with one hydrated React island (spec 0002, AC-3).
const islandCheckBuild = process.env.ISLAND_CHECK === "1";

// https://astro.build/config
export default defineConfig({
	site: "https://renon.dev",
	output: "static",
	trailingSlash: "always",
	build: { format: "directory" },
	outDir: islandCheckBuild ? "./dist-island-check" : "./dist",
	i18n: {
		locales: ["en", "pt"],
		defaultLocale: "en",
		routing: { prefixDefaultLocale: false },
	},
	integrations: [
		react(),
		sitemap({
			i18n: { defaultLocale: "en", locales: { en: "en", pt: "pt-BR" } },
			filter: (page) => !/\/404\/?$/.test(page),
		}),
		...(islandCheckBuild ? [islandCheck()] : []),
	],
	vite: { plugins: [tailwindcss()] },
});
