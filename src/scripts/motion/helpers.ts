// Pure helpers for the motion module (spec 0004). No DOM writes, no timers.

/** The element an in page link points at, or `undefined` for `#`, unknown ids and links to other pages. */
export const anchorTarget = (
	href: string,
	doc: Pick<Document, "getElementById">,
): Element | undefined => {
	if (!href.startsWith("#") || href.length < 2) return undefined;
	try {
		return doc.getElementById(decodeURIComponent(href.slice(1))) ?? undefined;
	} catch {
		return undefined;
	}
};

/** Where focus goes after an anchor jump: the section's heading when it has one, else the target itself. */
export const focusTarget = (target: Element): HTMLElement =>
	(target.querySelector<HTMLElement>("[data-section-focus]") ??
		target) as HTMLElement;

/** Reads a computed CSS length such as `"88px"`; `undefined` for anything else. */
export const parsePixels = (value: string): number | undefined => {
	const match = /^(-?\d+(?:\.\d+)?)px$/.exec(value.trim());
	return match ? Number(match[1]) : undefined;
};

/** True when the element starts above the viewport bottom (in view or already scrolled past). */
export const isAboveFold = (
	rect: Pick<DOMRect, "top">,
	viewportHeight: number,
): boolean => rect.top < viewportHeight;
