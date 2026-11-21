import type Lenis from "lenis";
import { anchorTarget, focusTarget, parsePixels } from "./helpers";

// In page links (spec 0004, AC-4): scroll the target to the scroll padding, push the hash, then focus
// its heading. The strategy is picked on each click, so this is wired once and survives reduced
// motion switches. No `popstate` handler: Back and Forward use native scroll restoration.

const linkSelector = 'a[href^="#"]:not([data-skip-link])';

const isPlainClick = (event: MouseEvent): boolean =>
	event.button === 0 &&
	!event.metaKey &&
	!event.ctrlKey &&
	!event.shiftKey &&
	!event.altKey &&
	!event.defaultPrevented;

export const wireAnchors = (
	doc: Document,
	getLenis: () => Lenis | undefined,
): (() => void) => {
	const win = doc.defaultView ?? window;

	const onClick = (event: MouseEvent) => {
		if (!isPlainClick(event)) return;
		const link =
			event.target instanceof Element
				? event.target.closest<HTMLAnchorElement>(linkSelector)
				: null;
		const href = link?.getAttribute("href");
		const target = href ? anchorTarget(href, doc) : undefined;
		if (!href || !target) return;

		event.preventDefault();
		if (win.location.hash !== href) win.history.pushState(null, "", href);
		const focus = () => focusTarget(target).focus({ preventScroll: true });

		const lenis = getLenis();
		if (!lenis) {
			target.scrollIntoView({ block: "start", behavior: "instant" });
			focus();
			return;
		}
		// Lenis would also subtract the scroll padding for an element target, so pass a number.
		const padding =
			parsePixels(win.getComputedStyle(doc.documentElement).scrollPaddingTop) ??
			0;
		const top = target.getBoundingClientRect().top + win.scrollY - padding;
		lenis.scrollTo(top, { onComplete: focus });
	};

	doc.addEventListener("click", onClick);
	return () => doc.removeEventListener("click", onClick);
};
