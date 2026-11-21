// Spec 0004 acceptance criteria (layout and motion foundation), checked against the static build.
// Runs on the desktop project; the keyboard test also runs on WebKit (playwright.config.ts).
import { expect, type Page, test } from "@playwright/test";
import { en } from "../src/i18n/content/en";
import { pt } from "../src/i18n/content/pt";

const sectionIds = [
	"hero",
	"work",
	"now",
	"services",
	"about",
	"highlights",
	"clients",
] as const;

/** Desktop scroll padding: the 72 bar plus 16 (AC-8). */
const desktopPadding = 88;

const html = (page: Page) => page.locator("html");

/** Feature 6 adds the nav; until then the tests add an in page link, fixed so it is always clickable. */
const addLink = (page: Page, hash: string) =>
	page.evaluate((href) => {
		const link = document.createElement("a");
		link.href = href;
		link.textContent = href;
		link.dataset.testLink = "";
		Object.assign(link.style, {
			position: "fixed",
			bottom: "8px",
			right: "8px",
			zIndex: "50",
		});
		document.body.append(link);
	}, hash);

const opacityOf = (page: Page, selector: string) =>
	page
		.locator(selector)
		.evaluate((element) => getComputedStyle(element).opacity);

const waitForMotion = async (page: Page) => {
	await expect(html(page)).toHaveAttribute("data-motion", "");
	await expect(html(page)).toHaveClass(/\blenis\b/);
};

/** Clicks the test link to `hash` and checks focus, URL and where the target top rests (AC-4). */
const expectAnchorJump = async (
	page: Page,
	hash: string,
	focused: string,
	topOf: string,
) => {
	await page.locator(`[data-test-link][href="${hash}"]`).click();
	await expect(page.locator(focused)).toBeFocused({ timeout: 5_000 });
	await expect(page).toHaveURL(new RegExp(`${hash}$`));
	const top = await page
		.locator(topOf)
		.evaluate((element) => element.getBoundingClientRect().top);
	expect(Math.abs(top - desktopPadding)).toBeLessThanOrEqual(2);
};

test.describe("layout (AC-1, AC-2)", () => {
	for (const [path, content] of [
		["/", en],
		["/pt/", pt],
	] as const) {
		test(`covers AC-2: ${path} renders the shells in Paper order with headings from the content`, async ({
			page,
		}) => {
			await page.goto(path);

			const ids = await page
				.locator("main#main > section")
				.evaluateAll((sections) => sections.map((section) => section.id));
			expect(ids).toEqual(sectionIds);
			await expect(page.locator("main#main + footer#contact")).toHaveCount(1);
			await expect(page.locator("main#main")).toHaveAttribute("tabindex", "-1");
			await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);

			for (const [id, title] of [
				["work", content.work.title],
				["now", content.now.title],
				["services", content.services.title],
				["about", content.about.title],
				["clients", content.clients.title],
			] as const) {
				const heading = page.locator(`#${id} h2`);
				await expect(heading).toHaveText(title);
				await expect(heading).toHaveAttribute("tabindex", "-1");
				await expect(page.locator(`#${id}`)).toHaveAttribute(
					"aria-labelledby",
					`${id}-title`,
				);
			}
			for (const [id, eyebrow] of [
				["work", content.work.eyebrow],
				["services", content.services.eyebrow],
				["about", content.about.eyebrow],
			] as const)
				await expect(page.locator(`#${id} p`).first()).toHaveText(eyebrow);
			await expect(page.locator("#highlights")).toHaveAttribute(
				"tabindex",
				"-1",
			);
			await expect(page.locator("footer#contact")).toHaveAttribute(
				"tabindex",
				"-1",
			);
		});

		for (const width of [320, 640]) {
			test(`covers AC-1: ${path} has no horizontal scroll at ${width} wide${width === 640 ? " (200% zoom of 1280)" : ""}`, async ({
				page,
			}) => {
				await page.setViewportSize({ width, height: 800 });
				await page.goto(path);

				const overflow = await page.evaluate(
					() =>
						document.documentElement.scrollWidth -
						document.documentElement.clientWidth,
				);
				expect(overflow).toBeLessThanOrEqual(0);
			});
		}
	}

	test("covers AC-1: container is 1312 wide with 64 gutters from 1024, 16 below", async ({
		page,
	}) => {
		await page.setViewportSize({ width: 1440, height: 900 });
		await page.goto("/");
		const container = page.locator("#work > .container-page");
		expect((await container.boundingBox())?.width).toBe(1312);
		await expect(container).toHaveCSS("padding-left", "64px");
		await expect(container).toHaveCSS("padding-right", "64px");

		await page.setViewportSize({ width: 390, height: 800 });
		await expect(container).toHaveCSS("padding-left", "16px");
	});

	test("covers AC-2: sections are 160 apart from 1024 wide and 96 below", async ({
		page,
	}) => {
		const gap = () =>
			page.evaluate(() => {
				const work = document.getElementById("work")?.getBoundingClientRect();
				const now = document.getElementById("now")?.getBoundingClientRect();
				return (now?.top ?? 0) - (work?.bottom ?? 0);
			});
		await page.setViewportSize({ width: 1280, height: 800 });
		await page.goto("/");
		expect(await gap()).toBe(160);
		await page.setViewportSize({ width: 390, height: 800 });
		expect(await gap()).toBe(96);
	});
});

test.describe("motion allowed, fine pointer (AC-3, AC-5, AC-6)", () => {
	test("covers AC-3: Lenis runs and a wheel scroll moves the page", async ({
		page,
	}) => {
		await page.goto("/");
		await waitForMotion(page);

		await page.mouse.move(600, 400);
		await page.mouse.wheel(0, 800);
		await expect
			.poll(() => page.evaluate(() => window.scrollY))
			.toBeGreaterThan(100);
	});

	test("covers AC-5: the glow is decorative, appears on the pointer and fades on leave", async ({
		page,
	}) => {
		await page.goto("/");
		await waitForMotion(page);
		const glow = page.locator("[data-cursor-glow]");
		await expect(glow).toHaveAttribute("aria-hidden", "true");
		await expect(glow).toHaveCSS("pointer-events", "none");
		expect(await opacityOf(page, "[data-cursor-glow]")).toBe("0");

		await page.mouse.move(400, 300);
		const box = await glow.boundingBox();
		expect(Math.abs((box?.x ?? 0) + (box?.width ?? 0) / 2 - 400)).toBeLessThan(
			2,
		);
		expect(Math.abs((box?.y ?? 0) + (box?.height ?? 0) / 2 - 300)).toBeLessThan(
			2,
		);
		await expect.poll(() => opacityOf(page, "[data-cursor-glow]")).toBe("1");

		await page.evaluate(() =>
			document.dispatchEvent(
				new PointerEvent("pointerout", {
					pointerType: "mouse",
					relatedTarget: null,
				}),
			),
		);
		await expect.poll(() => opacityOf(page, "[data-cursor-glow]")).toBe("0");
	});

	test("covers AC-6: a heading below the fold is hidden at load and revealed on entry", async ({
		page,
	}) => {
		await page.goto("/");
		await waitForMotion(page);
		const heading = "#clients-title";
		expect(await opacityOf(page, heading)).toBe("0");
		await expect(page.locator(".container-page h1")).toHaveCSS("opacity", "1");

		await page
			.locator(heading)
			.evaluate((element) =>
				window.scrollTo(
					0,
					element.getBoundingClientRect().top + window.scrollY - 200,
				),
			);
		await expect(page.locator(heading)).toHaveCSS("opacity", "1", {
			timeout: 500,
		});
	});

	test("covers AC-6: focus moving into a hidden element reveals it at once", async ({
		page,
	}) => {
		await page.goto("/");
		await waitForMotion(page);

		const result = await page.locator("#about-title").evaluate((element) => {
			element.focus({ preventScroll: true });
			return {
				revealed: element.getAttribute("data-revealed"),
				opacity: getComputedStyle(element).opacity,
			};
		});
		expect(result).toEqual({ revealed: "instant", opacity: "1" });
	});

	test("covers AC-6: printing shows every element", async ({ page }) => {
		await page.goto("/");
		await waitForMotion(page);
		await page.emulateMedia({ media: "print" });

		const hidden = await page
			.locator("[data-reveal]")
			.evaluateAll(
				(elements) =>
					elements.filter(
						(element) => getComputedStyle(element).opacity !== "1",
					).length,
			);
		expect(hidden).toBe(0);
	});
});

test.describe("in page anchors (AC-3, AC-4, AC-7)", () => {
	test("covers AC-4: smooth jump lands at the scroll padding, pushes the hash and focuses the heading; Back restores", async ({
		page,
	}) => {
		await page.goto("/");
		await waitForMotion(page);
		await addLink(page, "#services");
		await page.evaluate(() => window.scrollTo(0, 300));
		await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(300);

		await expectAnchorJump(page, "#services", "#services-title", "#services");

		await page.goBack();
		await expect(page).toHaveURL(/\/$/);
		await expect
			.poll(() => page.evaluate(() => Math.abs(window.scrollY - 300)))
			.toBeLessThanOrEqual(2);
	});

	test("covers AC-4: a section without a heading focuses the section itself", async ({
		page,
	}) => {
		await page.goto("/");
		await waitForMotion(page);
		await addLink(page, "#highlights");

		await expectAnchorJump(page, "#highlights", "#highlights", "#highlights");
	});

	test("covers AC-4: a link to a missing id is left to the browser", async ({
		page,
	}) => {
		await page.goto("/");
		await addLink(page, "#nowhere");
		await page.locator('[data-test-link][href="#nowhere"]').click();
		await expect(page).toHaveURL(/#nowhere$/);
	});

	test.describe("with reduced motion", () => {
		test.use({ reducedMotion: "reduce" });

		test("covers AC-4: instant jump gives the same focus and hash", async ({
			page,
		}) => {
			await page.goto("/");
			await addLink(page, "#services");

			await expectAnchorJump(page, "#services", "#services-title", "#services");
		});
	});

	test("covers AC-4, AC-7: after switching reduced motion on with the page open, the jump still works", async ({
		page,
	}) => {
		await page.goto("/");
		await waitForMotion(page);
		await page.emulateMedia({ reducedMotion: "reduce" });
		await expect(html(page)).not.toHaveAttribute("data-motion");
		await addLink(page, "#services");

		await expectAnchorJump(page, "#services", "#services-title", "#services");
	});
});

test.describe("reduced motion (AC-7)", () => {
	test.use({ reducedMotion: "reduce" });

	test("covers AC-7: static page, then motion and back without a reload", async ({
		page,
	}) => {
		await page.goto("/");
		await expect(html(page)).not.toHaveClass(/\blenis\b/);
		await expect(html(page)).not.toHaveAttribute("data-motion");
		await expect(page.locator("[data-cursor-glow]")).toBeHidden();
		const hidden = await page
			.locator("[data-reveal]")
			.evaluateAll(
				(elements) =>
					elements.filter(
						(element) => getComputedStyle(element).opacity !== "1",
					).length,
			);
		expect(hidden).toBe(0);

		await page.emulateMedia({ reducedMotion: "no-preference" });
		await expect(html(page)).toHaveAttribute("data-motion", "", {
			timeout: 1_000,
		});
		await expect(html(page)).toHaveClass(/\blenis\b/);

		await page.emulateMedia({ reducedMotion: "reduce" });
		await expect(html(page)).not.toHaveAttribute("data-motion", "", {
			timeout: 1_000,
		});
		await expect(html(page)).not.toHaveClass(/\blenis\b/);
		expect(await opacityOf(page, "#clients-title")).toBe("1");
	});
});

test("covers AC-7: toggling reduced motion and scrolling logs no console errors", async ({
	page,
}) => {
	const errors: string[] = [];
	page.on("console", (message) => {
		if (message.type() === "error") errors.push(message.text());
	});
	page.on("pageerror", (error) => errors.push(error.message));
	await page.goto("/");
	await waitForMotion(page);
	await page.mouse.move(600, 400);

	for (let round = 0; round < 3; round++) {
		await page.emulateMedia({ reducedMotion: "reduce" });
		await expect(html(page)).not.toHaveAttribute("data-motion");
		await page.mouse.wheel(0, 300);
		await page.emulateMedia({ reducedMotion: "no-preference" });
		await expect(html(page)).toHaveAttribute("data-motion", "");
		await page.mouse.wheel(0, 300);
	}
	await page.waitForTimeout(300);
	expect(errors).toEqual([]);
});

test.describe("without JavaScript (AC-6)", () => {
	test.use({ javaScriptEnabled: false });

	test("covers AC-6: every reveal and shell heading is visible", async ({
		page,
	}) => {
		await page.goto("/");
		const hidden = await page
			.locator("[data-reveal]")
			.evaluateAll(
				(elements) =>
					elements.filter(
						(element) => getComputedStyle(element).opacity !== "1",
					).length,
			);
		expect(hidden).toBe(0);
		for (const id of ["work", "now", "services", "about", "clients"])
			await expect(page.locator(`#${id}-title`)).toBeVisible();
	});
});

test.describe("touch, coarse pointer (AC-3, AC-5)", () => {
	test.use({
		hasTouch: true,
		isMobile: true,
		viewport: { width: 390, height: 844 },
	});

	test("covers AC-5: no glow on a coarse pointer, and native scroll still works", async ({
		page,
	}) => {
		await page.goto("/");
		await expect(html(page)).toHaveAttribute("data-motion", "");
		await expect(page.locator("[data-cursor-glow]")).toBeHidden();
		await page.evaluate(() => window.scrollTo(0, 500));
		await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(500);
	});
});

test("covers AC-8: skip link first, jumps to main; every control shows the focus outline", {
	tag: "@keyboard",
}, async ({ page, browserName }) => {
	// Safari moves Tab between links only with Option+Tab (or its keyboard navigation setting on).
	const tab = browserName === "webkit" ? "Alt+Tab" : "Tab";
	await page.goto("/");
	const skip = page.locator("[data-skip-link]");
	await expect(skip).toHaveText(en.a11y.skipToContent);
	expect((await skip.boundingBox())?.width ?? 0).toBeLessThanOrEqual(1);

	await page.keyboard.press(tab);
	await expect(skip).toBeFocused();
	const box = await skip.boundingBox();
	expect(box?.height).toBe(48);
	expect(box?.x).toBe(64); // the desktop gutter at 1280 wide

	await page.keyboard.press("Enter");
	await expect(page).toHaveURL(/#main$/);
	await expect(page.locator("main#main")).toBeFocused();

	// Walk every control from the top of the page and check each one's outline.
	await page.goto("/");
	const controls = await page.locator("a[href], button").count();
	expect(controls).toBeGreaterThanOrEqual(4);
	for (let step = 0; step < controls; step++) {
		await page.keyboard.press(tab);
		const outline = await page.evaluate(() => {
			const active = document.activeElement;
			const style = active ? getComputedStyle(active) : undefined;
			return `${active?.tagName} ${style?.outlineStyle} ${style?.outlineWidth} ${style?.outlineOffset}`;
		});
		expect(outline).toMatch(/^(A|BUTTON) solid 2px 2px$/);
	}
});

test("covers AC-8: the skip link reads in Portuguese on /pt/", async ({
	page,
}) => {
	await page.goto("/pt/");
	await expect(page.locator("[data-skip-link]")).toHaveText(
		pt.a11y.skipToContent,
	);
});

test("covers AC-8: html carries the scroll padding, 72 below 1024 wide and 88 from 1024", async ({
	page,
}) => {
	await page.setViewportSize({ width: 390, height: 800 });
	await page.goto("/");
	await expect(html(page)).toHaveCSS("scroll-padding-top", "72px");
	await page.setViewportSize({ width: 1280, height: 800 });
	await expect(html(page)).toHaveCSS("scroll-padding-top", "88px");
});

test("covers AC-9: a scripted scroll causes no layout shift", async ({
	page,
}) => {
	await page.goto("/");
	await waitForMotion(page);
	await page.evaluate(
		() =>
			new Promise<void>((resolve) => {
				const step = (y: number) => {
					window.scrollTo(0, y);
					if (y >= document.documentElement.scrollHeight)
						return setTimeout(resolve, 400);
					requestAnimationFrame(() => step(y + 400));
				};
				step(0);
			}),
	);
	const shift = await page.evaluate(
		() =>
			new Promise<number>((resolve) => {
				new PerformanceObserver(() => undefined).observe({
					type: "layout-shift",
					buffered: true,
				});
				const entries = performance.getEntriesByType(
					"layout-shift",
				) as unknown as {
					value: number;
				}[];
				resolve(entries.reduce((sum, entry) => sum + entry.value, 0));
			}),
	);
	expect(shift).toBe(0);
});
