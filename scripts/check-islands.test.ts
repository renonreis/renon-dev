// Spec 0002, AC-3: the island checker must catch React on a real page and must not cry wolf.
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const script = join(import.meta.dirname, "check-islands.mjs");
const reactRuntime =
	'export const t = Symbol.for("react.transitional.element");';
const page = (body = "") =>
	`<!doctype html><html><head></head><body>${body}</body></html>`;
const islandPage = page(
	'<astro-island component-url="/_astro/Counter.js" renderer-url="/_astro/client.js"></astro-island>',
);

let outDir: string;

function writeBuild(files: Record<string, string>) {
	outDir = mkdtempSync(join(tmpdir(), "check-islands-"));
	for (const [path, content] of Object.entries(files)) {
		const file = join(outDir, path);
		mkdirSync(dirname(file), { recursive: true });
		writeFileSync(file, content);
	}
}

// A healthy build: React only behind the island page, through a nested import.
function healthyBuild(): Record<string, string> {
	return {
		"island-check/index.html": islandPage,
		"_astro/Counter.js": 'import "./react-chunk.js";',
		"_astro/react-chunk.js": reactRuntime,
		"_astro/client.js": "export {};",
		"index.html": page(),
		"pt/index.html": page(),
		"404.html": page(),
	};
}

function runCheck() {
	const result = spawnSync(process.execPath, [script, outDir], {
		encoding: "utf8",
	});
	return { code: result.status, output: result.stdout + result.stderr };
}

afterEach(() => {
	rmSync(outDir, { recursive: true, force: true });
});

describe("check-islands", () => {
	it("passes when only the island page reaches React, even through a nested import", () => {
		writeBuild(healthyBuild());

		const { code, output } = runCheck();

		expect(code).toBe(0);
		expect(output).toContain("AC-3 holds");
	});

	it("fails when a real page reaches React through a dynamic import chain", () => {
		writeBuild({
			...healthyBuild(),
			"pt/index.html": page(
				'<script type="module" src="/_astro/menu.js"></script>',
			),
			"_astro/menu.js": 'const load = () => import("./lazy.js");',
			"_astro/lazy.js": 'import "./react-chunk.js";',
		});

		const { code, output } = runCheck();

		expect(code).toBe(1);
		expect(output).toContain("pt/index.html loads the React runtime");
	});

	it("fails when a real page reaches React through an inline module script", () => {
		writeBuild({
			...healthyBuild(),
			"index.html": page(
				'<script type="module">import "/_astro/react-chunk.js";</script>',
			),
		});

		const { code, output } = runCheck();

		expect(code).toBe(1);
		expect(output).toContain("index.html loads the React runtime");
	});

	it("fails when a real page holds a hydrated island", () => {
		writeBuild({
			...healthyBuild(),
			"404.html": page("<astro-island></astro-island>"),
		});

		const { code, output } = runCheck();

		expect(code).toBe(1);
		expect(output).toContain("404.html contains a hydrated island");
	});

	it("fails when the island page does not load React, since the check would prove nothing", () => {
		writeBuild({ ...healthyBuild(), "_astro/react-chunk.js": "export {};" });

		const { code, output } = runCheck();

		expect(code).toBe(1);
		expect(output).toContain("the island page does not load React");
	});

	it("fails when the build was made without the island page", () => {
		const { "island-check/index.html": _, ...withoutIsland } = healthyBuild();
		writeBuild(withoutIsland);

		const { code, output } = runCheck();

		expect(code).toBe(1);
		expect(output).toContain("build with ISLAND_CHECK=1 first");
	});

	it("fails when a page references a script missing from the build", () => {
		writeBuild({
			...healthyBuild(),
			"index.html": page('<script src="/_astro/gone.js"></script>'),
		});

		const { code, output } = runCheck();

		expect(code).toBe(1);
		expect(output).toContain("script not found in build: _astro/gone.js");
	});

	it("fails when one of the real pages is missing", () => {
		const { "pt/index.html": _, ...withoutPt } = healthyBuild();
		writeBuild(withoutPt);

		const { code, output } = runCheck();

		expect(code).toBe(1);
		expect(output).toContain("missing pt/index.html");
	});

	it("ignores external and query string script URLs instead of reading them from disk", () => {
		writeBuild({
			...healthyBuild(),
			"index.html": page(
				'<script src="https://example.com/x.js"></script><script src="/_astro/client.js?v=1"></script>',
			),
		});

		const { code } = runCheck();

		expect(code).toBe(0);
	});
});
