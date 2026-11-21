import { defineConfig, devices } from "@playwright/test";

const port = 4329;

// Runs against the real static build through `astro preview`, the same files Cloudflare Pages receives.
export default defineConfig({
	testDir: "e2e",
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 1 : 0,
	reporter: process.env.CI ? "line" : "list",
	use: {
		baseURL: `http://127.0.0.1:${port}`,
	},
	projects: [
		{
			name: "desktop",
			use: {
				...devices["Desktop Chrome"],
				viewport: { width: 1280, height: 800 },
			},
		},
		{
			name: "mobile",
			use: {
				...devices["Desktop Chrome"],
				viewport: { width: 375, height: 812 },
			},
			// Spec 0004 motion checks set their own viewports and pointers; they run once, on desktop.
			testIgnore: /motion\.spec\.ts/,
		},
		{
			// Spec 0004, AC-8: the skip link and focus baseline must hold in WebKit too.
			name: "webkit",
			use: {
				...devices["Desktop Safari"],
				viewport: { width: 1280, height: 800 },
			},
			testMatch: /motion\.spec\.ts/,
			grep: /@keyboard/,
		},
	],
	webServer: {
		command: `pnpm build && pnpm preview --host 127.0.0.1 --port ${port}`,
		url: `http://127.0.0.1:${port}/`,
		reuseExistingServer: !process.env.CI,
		timeout: 120_000,
	},
});
