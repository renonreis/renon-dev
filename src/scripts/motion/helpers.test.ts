import { describe, expect, it } from "vitest";
import { en } from "../../i18n/content/en";
import { pt } from "../../i18n/content/pt";
import { anchorTarget, focusTarget, isAboveFold, parsePixels } from "./helpers";

// Spec 0004 pure helpers (AC-4, AC-6, AC-8). Plain objects stand in for the DOM.

const section = { id: "services" } as unknown as Element;
const doc = {
	getElementById: (id: string) =>
		({ services: section, "não-ascii": section })[id] ?? null,
} as Pick<Document, "getElementById">;

describe("anchorTarget (AC-4)", () => {
	it("returns the element a hash link points at", () => {
		expect(anchorTarget("#services", doc)).toBe(section);
	});

	it("decodes percent encoded ids", () => {
		expect(anchorTarget("#n%C3%A3o-ascii", doc)).toBe(section);
	});

	it.each([
		["a bare #", "#"],
		["an unknown id", "#nowhere"],
		["another page", "/pt/#services"],
		["an empty href", ""],
		["a malformed escape", "#%E0%A4%A"],
	])("returns undefined for %s", (_case, href) => {
		expect(anchorTarget(href, doc)).toBeUndefined();
	});
});

describe("focusTarget (AC-4)", () => {
	it("prefers the section heading marked data-section-focus", () => {
		const heading = { tagName: "H2" };
		const target = {
			querySelector: (selector: string) =>
				selector === "[data-section-focus]" ? heading : null,
		} as unknown as Element;
		expect(focusTarget(target)).toBe(heading);
	});

	it("falls back to the target itself", () => {
		const target = { querySelector: () => null } as unknown as Element;
		expect(focusTarget(target)).toBe(target);
	});
});

describe("parsePixels (AC-4, AC-8)", () => {
	it.each([
		["88px", 88],
		["72px", 72],
		[" 12.5px ", 12.5],
		["0px", 0],
		["-4px", -4],
	])("reads %s as %d", (value, expected) => {
		expect(parsePixels(value)).toBe(expected);
	});

	it.each(["auto", "", "5rem", "px", "10"])(
		"returns undefined for %j",
		(value) => {
			expect(parsePixels(value)).toBeUndefined();
		},
	);
});

describe("isAboveFold (AC-6)", () => {
	it("is true for an element in the viewport or already scrolled past", () => {
		expect(isAboveFold({ top: 0 }, 800)).toBe(true);
		expect(isAboveFold({ top: 799 }, 800)).toBe(true);
		expect(isAboveFold({ top: -2000 }, 800)).toBe(true);
	});

	it("is false at or below the viewport bottom", () => {
		expect(isAboveFold({ top: 800 }, 800)).toBe(false);
		expect(isAboveFold({ top: 3000 }, 800)).toBe(false);
	});
});

describe("a11y.skipToContent (AC-8)", () => {
	it("exists in both locales", () => {
		expect(en.a11y.skipToContent).toBe("Skip to content");
		expect(pt.a11y.skipToContent).toBe("Pular para o conteúdo");
	});
});
