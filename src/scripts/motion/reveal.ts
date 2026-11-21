import { isAboveFold } from "./helpers";

// Reveal on entry (spec 0004, AC-6). The hidden state lives only in CSS under `html[data-motion]`;
// this only adds `data-revealed`, one way. Elements already in or above the viewport are marked at
// once, so they never animate; focus moving into a hidden element reveals it with no transition.

const pending = "[data-reveal]:not([data-revealed])";

export const revealOnEntry = (
	root: Document,
	observerInit: IntersectionObserverInit,
): (() => void) => {
	const viewportHeight = root.documentElement.clientHeight;
	const waiting = [...root.querySelectorAll<HTMLElement>(pending)].filter(
		(element) => {
			if (!isAboveFold(element.getBoundingClientRect(), viewportHeight))
				return true;
			element.setAttribute("data-revealed", "");
			return false;
		},
	);

	const observer = new IntersectionObserver((entries) => {
		for (const entry of entries) {
			if (!entry.isIntersecting) continue;
			entry.target.setAttribute("data-revealed", "");
			observer.unobserve(entry.target);
		}
	}, observerInit);
	for (const element of waiting) observer.observe(element);

	const onFocusIn = (event: FocusEvent) => {
		const element =
			event.target instanceof Element ? event.target.closest(pending) : null;
		if (!element) return;
		element.setAttribute("data-revealed", "instant");
		observer.unobserve(element);
	};
	root.addEventListener("focusin", onFocusIn);

	return () => {
		observer.disconnect();
		root.removeEventListener("focusin", onFocusIn);
	};
};
