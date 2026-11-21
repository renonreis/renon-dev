import { gsap } from "gsap";
import Lenis from "lenis";
import { wireAnchors } from "./anchors";
import { motionConfig } from "./config";
import { followPointer } from "./glow";
import { revealOnEntry } from "./reveal";

// The motion entry (spec 0004). The static page is the baseline: smooth scroll, reveals and the glow
// only exist inside `gsap.matchMedia` conditions, and each condition's cleanup removes everything
// it added, so switching reduced motion on returns the page to static without a reload.

export const startMotion = (doc: Document, win: Window): (() => void) => {
	const html = doc.documentElement;
	let lenis: Lenis | undefined;
	const unwireAnchors = wireAnchors(doc, () => lenis);
	const mm = gsap.matchMedia();

	mm.add(motionConfig.media.motion, () => {
		const stopReveals = revealOnEntry(doc, {
			rootMargin: motionConfig.revealRootMargin,
		});
		html.setAttribute("data-motion", "");
		const instance = new Lenis({
			wrapper: win,
			lerp: motionConfig.lerp,
			autoRaf: false,
			syncTouch: false,
		});
		lenis = instance;
		// The ticker gives seconds, Lenis wants milliseconds.
		const tick = (time: number) => instance.raf(time * 1000);
		gsap.ticker.add(tick);
		gsap.ticker.lagSmoothing(0);

		return () => {
			gsap.ticker.remove(tick);
			lenis = undefined;
			instance.destroy();
			stopReveals();
			html.removeAttribute("data-motion");
		};
	});

	const glow = doc.querySelector<HTMLElement>("[data-cursor-glow]");
	if (glow) mm.add(motionConfig.media.glow, () => followPointer(glow));

	return () => {
		mm.revert();
		unwireAnchors();
	};
};

/** Starts motion, falling back to the static page if anything throws (AC-6: content stays visible). */
export const startMotionSafely = (doc: Document, win: Window): void => {
	try {
		startMotion(doc, win);
	} catch (error) {
		doc.documentElement.removeAttribute("data-motion");
		console.error(error);
	}
};
