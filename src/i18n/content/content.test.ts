import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { en } from "./en";
import { getContent } from "./index";
import { pt } from "./pt";
import { shared } from "./shared";
import { contentStrings } from "./strings";
import type { Content } from "./types";

const locales = { en, pt } as const satisfies Record<string, Content>;

const sharedFacts = [
	shared.email,
	shared.links.linkedin.href,
	shared.links.github.href,
	...Object.values(shared.now).map(({ href }) => href),
];

describe("content source (spec 0003)", () => {
	it("getContent returns each locale's module", () => {
		expect(getContent("en")).toBe(en);
		expect(getContent("pt")).toBe(pt);
	});

	for (const [name, content] of Object.entries(locales)) {
		it(`covers AC-3: ${name} never repeats the email or a shared URL`, () => {
			const strings = contentStrings(content);
			for (const fact of sharedFacts)
				expect(strings.filter((text) => text.includes(fact))).toEqual([]);
		});

		it(`covers AC-5: ${name} strings are plain text, no HTML or Markdown`, () => {
			const marked = contentStrings(content).filter((text) =>
				/<|\]\(|\*\*/.test(text),
			);
			expect(marked).toEqual([]);
		});

		it(`covers AC-10: ${name} builds the copyright line from the build year`, () => {
			expect(content.footer.copyright(shared.buildYear)).toContain(
				String(shared.buildYear),
			);
		});

		it(`covers AC-2: ${name} has no empty strings`, () => {
			expect(contentStrings(content).filter((text) => !text.trim())).toEqual(
				[],
			);
		});
	}

	it("covers AC-9: both locales have the Off the clock card, or neither does", () => {
		expect("offTheClock" in en.highlights).toBe("offTheClock" in pt.highlights);
	});

	it("covers AC-9: the same work and Building now items, in the same order", () => {
		expect(pt.work.items.map(({ id }) => id)).toEqual(
			en.work.items.map(({ id }) => id),
		);
		expect(pt.now.items.map(({ id }) => id)).toEqual(
			en.now.items.map(({ id }) => id),
		);
		expect(pt.work.items.map((item) => "outcome" in item)).toEqual(
			en.work.items.map((item) => "outcome" in item),
		);
	});

	it("covers AC-10: the build year is the current year at build time", () => {
		expect(shared.buildYear).toBe(new Date().getFullYear());
	});
});

// AC-1 (static half): no copy literals in components. Strips frontmatter, scripts, styles, comments,
// expressions and tags from every .astro file; what remains may only be decorative glyphs.
const componentFiles = (dir: string): readonly string[] =>
	readdirSync(dir).flatMap((entry) => {
		const path = join(dir, entry);
		if (statSync(path).isDirectory())
			return entry === "test" ? [] : componentFiles(path);
		return /\.(astro|tsx)$/.test(entry) ? [path] : [];
	});

/** Removes `{ … }` expressions from the innermost out, so nested ones go too. */
const stripExpressions = (text: string): string => {
	const next = text.replace(/\{[^{}]*\}/g, "");
	return next === text ? text : stripExpressions(next);
};

const visibleLiterals = (source: string): string =>
	stripExpressions(
		source
			.replace(/^---[\s\S]*?\n---/, "")
			.replace(/<script[\s\S]*?<\/script>/g, "")
			.replace(/<style[\s\S]*?<\/style>/g, "")
			.replace(/<!--[\s\S]*?-->/g, ""),
	)
		.replace(/<[^>]*>/g, "")
		.replace(/[\s↗·]/g, "");

describe("components (spec 0003, AC-1)", () => {
	const files = componentFiles(join(import.meta.dirname, "../.."));

	it("finds the components to scan", () => {
		expect(files.length).toBeGreaterThan(0);
	});

	for (const file of files.filter((path) => path.endsWith(".astro"))) {
		it(`covers AC-1: ${file.split("/src/")[1]} has no copy literals`, () => {
			expect(visibleLiterals(readFileSync(file, "utf8"))).toBe("");
		});

		it(`covers AC-5: ${file.split("/src/")[1]} never uses set:html`, () => {
			expect(readFileSync(file, "utf8")).not.toContain("set:html");
		});
	}
});
