// Spec 0003 acceptance criteria, checked in a real browser against the static build.
import { expect, type Page, test } from "@playwright/test";
import { en } from "../src/i18n/content/en";
import { pt } from "../src/i18n/content/pt";
import { contentStrings, sharedStrings } from "../src/i18n/content/strings";

const allowedOn = {
	"/": new Set([...contentStrings(en), ...sharedStrings()]),
	"/pt/": new Set([...contentStrings(pt), ...sharedStrings()]),
	"/404.html": new Set([
		...contentStrings(en),
		...contentStrings(pt),
		...sharedStrings(),
	]),
} as const;

/** Every visible text node and accessible name outside aria-hidden, plus the title and meta description. */
const renderedStrings = (page: Page) =>
	page.evaluate(() => {
		const hidden = (element: Element | null) =>
			element?.closest('[aria-hidden="true"], script, style, head') !== null;
		const walker = document.createTreeWalker(
			document.body,
			NodeFilter.SHOW_TEXT,
		);
		const texts: string[] = [];
		for (let node = walker.nextNode(); node; node = walker.nextNode()) {
			const text = node.textContent?.replace(/\s+/g, " ").trim();
			if (text && !hidden(node.parentElement)) texts.push(text);
		}
		const names = [
			...document.body.querySelectorAll("[aria-label], [alt], [title]"),
		]
			.filter((element) => !hidden(element))
			.flatMap((element) =>
				["aria-label", "alt", "title"]
					.map((attribute) => element.getAttribute(attribute))
					.filter((value): value is string => !!value),
			);
		const description =
			document
				.querySelector('meta[name="description"]')
				?.getAttribute("content") ?? "";
		return [...texts, ...names, document.title, description];
	});

for (const [path, allowed] of Object.entries(allowedOn)) {
	test(`covers AC-1: every string on ${path} comes from the content source`, async ({
		page,
	}) => {
		await page.goto(path);

		const strays = (await renderedStrings(page)).filter(
			(text) => !allowed.has(text),
		);
		expect(strays).toEqual([]);
	});
}

test("covers AC-1: the 404 page shows both languages, each linking to its own home", async ({
	page,
}) => {
	await page.goto("/this-page-does-not-exist/");

	await expect(page).toHaveTitle(en.notFound.title);
	await expect(
		page.getByRole("link", { name: en.notFound.backHome }),
	).toHaveAttribute("href", "/");
	const portuguese = page.locator('[lang="pt-BR"]', {
		hasText: pt.notFound.title,
	});
	await expect(portuguese).toBeVisible();
	await expect(
		portuguese.getByRole("link", { name: pt.notFound.backHome }),
	).toHaveAttribute("href", "/pt/");
});

const pages = [
	{
		path: "/pt/",
		content: pt,
		lang: "pt-BR",
	},
] as const;

for (const { path, content, lang } of pages) {
	test.describe(`language switch on ${path}`, () => {
		test("covers AC-12: the title and description come from the locale's meta", async ({
			page,
		}) => {
			await page.goto(path);

			await expect(page).toHaveTitle(content.meta.title);
			await expect(page.locator('meta[name="description"]')).toHaveAttribute(
				"content",
				content.meta.description,
			);
		});

		test("covers AC-6: two named links, the current one marked, each at least 44 by 44", async ({
			page,
		}) => {
			await page.goto(path);

			const group = page.getByRole("navigation", {
				name: content.languageSwitch.groupLabel,
			});
			const links = group.getByRole("link");
			await expect(links).toHaveCount(2);
			await expect(group.locator('[aria-current="page"]')).toHaveAttribute(
				"lang",
				lang,
			);
			for (const link of await links.all()) {
				await expect(link).toHaveAttribute("hreflang", /\S/);
				const box = await link.boundingBox();
				expect(box?.width).toBeGreaterThanOrEqual(44);
				expect(box?.height).toBeGreaterThanOrEqual(44);
			}
		});
	});
}

test.describe("without JavaScript", () => {
	test.use({ javaScriptEnabled: false });

	test("covers AC-6: the PT link goes to the Portuguese home", async ({
		page,
	}) => {
		await page.goto("/#hero");
		await page.locator("[data-language-switch]").getByText("PT").click();

		await expect(page).toHaveURL(/\/pt\/$/);
		await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
	});
});

test("covers AC-7: switching keeps the hash, both ways", async ({ page }) => {
	await page.goto("/#work");
	await page.locator("[data-language-switch]").getByText("PT").click();
	await expect(page).toHaveURL(/\/pt\/#work$/);

	await page.goto("/pt/#about");
	await page.locator("[data-language-switch]").getByText("EN").click();
	await expect(page).toHaveURL(/\/#about$/);
	await expect(page.locator("html")).toHaveAttribute("lang", "en");
});

test("covers AC-7: switching without a hash lands on the plain home", async ({
	page,
}) => {
	await page.goto("/");
	await page.locator("[data-language-switch]").getByText("PT").click();

	await expect(page).toHaveURL(/\/pt\/$/);
});

test("covers AC-7: both pages expose the same section ids", async ({
	page,
}) => {
	const ids = async (path: string) => {
		await page.goto(path);
		return page
			.locator("section[id]")
			.evaluateAll((sections) => sections.map((section) => section.id));
	};

	const english = await ids("/");
	expect(english.length).toBeGreaterThan(0);
	expect(await ids("/pt/")).toEqual(english);
});

test.describe("with a Portuguese browser", () => {
	test.use({
		locale: "pt-BR",
		extraHTTPHeaders: { "Accept-Language": "pt-BR,pt;q=0.9" },
	});

	test("covers AC-8: / still serves English, with no redirect", async ({
		page,
	}) => {
		const response = await page.goto("/");

		expect(response?.url()).toMatch(/\/$/);
		expect(new URL(response?.url() ?? "").pathname).toBe("/");
		await expect(page.locator("html")).toHaveAttribute("lang", "en");
	});
});

test("covers AC-1: the hero renders the content and Hire me is a mailto link", async ({
	page,
}) => {
	await page.goto("/pt/");

	await expect(page.getByRole("heading", { level: 1 })).toHaveText("renon.dev");
	await expect(page.getByText(pt.hero.role)).toBeVisible();
	await expect(page.getByRole("link", { name: pt.nav.hireMe })).toHaveAttribute(
		"href",
		"mailto:hello@renon.dev",
	);
});
