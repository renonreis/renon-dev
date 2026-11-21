// Spec 0002 acceptance criteria, checked in a real browser against the static build.
// Copy is asserted in content.spec.ts (spec 0003); these tests never assert copy.
import { expect, type Page, type Request, test } from "@playwright/test";

const site = "https://renon.dev";
const pages = [
	{
		path: "/",
		lang: "en",
		canonical: `${site}/`,
		switchTo: { path: "/pt/", hreflang: "pt-BR" },
	},
	{
		path: "/pt/",
		lang: "pt-BR",
		canonical: `${site}/pt/`,
		switchTo: { path: "/", hreflang: "en" },
	},
] as const;

function recordRequests(page: Page) {
	const requests: Request[] = [];
	page.on("request", (request) => requests.push(request));
	return requests;
}

for (const { path, lang, canonical, switchTo } of pages) {
	test.describe(`page ${path}`, () => {
		test(`covers AC-1: sets lang, canonical and reciprocal hreflang alternates`, async ({
			page,
		}) => {
			const response = await page.goto(path);

			expect(response?.status()).toBe(200);
			await expect(page.locator("html")).toHaveAttribute("lang", lang);
			await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
				"href",
				canonical,
			);
			const alternates = await page
				.locator('link[rel="alternate"][hreflang]')
				.evaluateAll((links) =>
					links.map((link) => [
						link.getAttribute("hreflang"),
						link.getAttribute("href"),
					]),
				);
			expect(alternates).toEqual([
				["en", `${site}/`],
				["pt-BR", `${site}/pt/`],
				["x-default", `${site}/`],
			]);
			await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
		});

		test("covers AC-1: has a title, a description and exactly one h1", async ({
			page,
		}) => {
			await page.goto(path);

			await expect(page).toHaveTitle(/\S/);
			await expect(page.locator('meta[name="description"]')).toHaveAttribute(
				"content",
				/\S/,
			);
			await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
		});

		test("covers AC-3: loads no React, only the same origin motion module (spec 0004)", async ({
			page,
			baseURL,
		}) => {
			const requests = recordRequests(page);

			await page.goto(path);
			await page.evaluate(() => document.fonts.ready);

			const scripts = requests.filter(
				(request) => request.resourceType() === "script",
			);
			expect(scripts.length).toBeLessThanOrEqual(1);
			for (const script of scripts)
				expect(new URL(script.url()).origin).toBe(
					new URL(baseURL ?? "").origin,
				);
			await expect(page.locator("astro-island")).toHaveCount(0);
		});

		test("covers AC-6: fetches only same origin WOFF2 fonts, no third party requests", async ({
			page,
			baseURL,
		}) => {
			const requests = recordRequests(page);

			await page.goto(path);
			await page.evaluate(() => document.fonts.ready);

			const origin = new URL(baseURL ?? "").origin;
			expect(
				requests
					.filter((request) => new URL(request.url()).origin !== origin)
					.map((r) => r.url()),
			).toEqual([]);
			const fonts = requests
				.filter((request) => request.resourceType() === "font")
				.map((r) => r.url());
			expect(fonts.length).toBeGreaterThan(0);
			for (const font of fonts) expect(font).toMatch(/\.woff2(\?|$)/);
		});

		test("covers AC-6: renders headings in Barlow Condensed 600 and body in Geist, Portuguese glyphs included", async ({
			page,
		}) => {
			await page.goto(path);
			await page.evaluate(() => document.fonts.ready);

			await expect(page.getByRole("heading", { level: 1 })).toHaveCSS(
				"font-family",
				/^"?Barlow Condensed"?/,
			);
			await expect(page.getByRole("heading", { level: 1 })).toHaveCSS(
				"font-weight",
				"600",
			);
			await expect(page.locator("body")).toHaveCSS("font-family", /^"?Geist"?/);
			const glyphs = await page.evaluate(() => ({
				display: document.fonts.check(
					'600 32px "Barlow Condensed"',
					"ação coração você",
				),
				body: document.fonts.check('400 16px "Geist"', "ação coração você"),
			}));
			expect(glyphs).toEqual({ display: true, body: true });
		});

		test(`switches language with a link to ${switchTo.path}`, async ({
			page,
		}) => {
			await page.goto(path);

			const link = page.locator(
				`[data-language-switch] a[hreflang="${switchTo.hreflang}"]`,
			);
			await expect(link).toHaveAttribute("href", switchTo.path);
			await link.focus();
			await expect(link).toBeFocused();
			await page.keyboard.press("Enter");

			await expect(page).toHaveURL(switchTo.path);
			await expect(page.locator("html")).toHaveAttribute(
				"lang",
				switchTo.hreflang,
			);
		});
	});
}

test.describe("missing pages", () => {
	test("covers AC-1: an unknown path answers 404 with the noindex 404 page and no canonical", async ({
		page,
	}) => {
		const response = await page.goto("/this-page-does-not-exist/");

		expect(response?.status()).toBe(404);
		await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
			"content",
			"noindex",
		);
		await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
		await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
	});
});

test.describe("sitemap", () => {
	test("covers AC-1: lists both language pages with alternates and leaves out the 404 page", async ({
		request,
	}) => {
		const index = await (await request.get("/sitemap-index.xml")).text();
		const sitemapUrl = index.match(/<loc>([^<]+)<\/loc>/)?.[1];
		expect(sitemapUrl).toBeDefined();

		const sitemap = await (
			await request.get(new URL(sitemapUrl ?? "").pathname)
		).text();

		const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
			(match) => match[1],
		);
		expect(locs.sort()).toEqual([`${site}/`, `${site}/pt/`]);
		expect(sitemap).toContain(`hreflang="pt-BR" href="${site}/pt/"`);
		expect(sitemap).toContain(`hreflang="en" href="${site}/"`);
		expect(sitemap).not.toContain("404");
	});
});
