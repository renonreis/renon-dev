// Injects the test only island page. Used only by `pnpm check:islands`, never by the real build.
/** @returns {import('astro').AstroIntegration} */
export default function islandCheck() {
	return {
		name: "island-check",
		hooks: {
			"astro:config:setup": ({ injectRoute }) => {
				injectRoute({
					pattern: "/island-check/",
					entrypoint: "./src/test/island-check/island-check.astro",
				});
			},
		},
	};
}
