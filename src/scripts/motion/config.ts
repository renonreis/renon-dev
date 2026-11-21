// Motion constants (spec 0004). Tune the feel on the Pages preview by changing values here only.

export const motionConfig = {
	/** Lenis smoothing for wheel and trackpad; touch stays native. */
	lerp: 0.1,
	/** A reveal starts when the element's top passes 90% of the viewport height. */
	revealRootMargin: "0px 0px -10% 0px",
	glow: {
		followDuration: 0.6,
		followEase: "power3.out",
		fadeDuration: 0.3,
	},
	media: {
		motion: "(prefers-reduced-motion: no-preference)",
		glow: "(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)",
	},
} as const;
