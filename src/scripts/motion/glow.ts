import { gsap } from "gsap";
import { motionConfig } from "./config";

// Cursor glow (spec 0004, AC-5). Placed on the pointer at the first move (no sweep from the corner),
// eased toward it after that, faded out when the pointer leaves the window or the window blurs.
// Animates only transform and opacity.

export const followPointer = (el: HTMLElement): (() => void) => {
	const { followDuration, followEase, fadeDuration } = motionConfig.glow;
	const doc = el.ownerDocument;
	const win = doc.defaultView ?? window;
	const follow = { duration: followDuration, ease: followEase };
	gsap.set(el, { xPercent: -50, yPercent: -50 });
	const xTo = gsap.quickTo(el, "x", follow);
	const yTo = gsap.quickTo(el, "y", follow);
	const fade = (opacity: number) =>
		gsap.to(el, { opacity, duration: fadeDuration, overwrite: "auto" });
	let shown = false;

	const onMove = (event: PointerEvent) => {
		if (event.pointerType !== "mouse") return;
		if (shown) {
			xTo(event.clientX);
			yTo(event.clientY);
			return;
		}
		gsap.set(el, { x: event.clientX, y: event.clientY });
		xTo(event.clientX, event.clientX);
		yTo(event.clientY, event.clientY);
		shown = true;
		fade(1);
	};
	const hide = () => {
		if (!shown) return;
		shown = false;
		fade(0);
	};
	const onOut = (event: PointerEvent) => {
		if (!event.relatedTarget) hide();
	};

	doc.addEventListener("pointermove", onMove, { passive: true });
	doc.addEventListener("pointerout", onOut);
	win.addEventListener("blur", hide);
	return () => {
		doc.removeEventListener("pointermove", onMove);
		doc.removeEventListener("pointerout", onOut);
		win.removeEventListener("blur", hide);
		gsap.killTweensOf(el);
		gsap.set(el, { clearProps: "transform,opacity" });
	};
};
