// Spec 0002, AC-3: a page with no React island must never load the React runtime.
// Reads a build made with ISLAND_CHECK=1, follows every script each page loads (including
// nested static and dynamic imports), and checks that only the test island page reaches React.
import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";

const outDir = resolve(process.argv[2] ?? "dist-island-check");
const islandPage = join(outDir, "island-check", "index.html");
const realPages = ["index.html", join("pt", "index.html"), "404.html"].map(
	(page) => join(outDir, page),
);

// Strings that only appear inside the React runtime bundle.
const reactMarkers = [
	"react.transitional.element",
	"react.element",
	"__CLIENT_INTERNALS_DO_NOT_USE",
];

function fail(message) {
	console.error(`check-islands: ${message}`);
	process.exit(1);
}

function urlToFile(url, fromFile) {
	if (/^(https?:)?\/\//.test(url) || url.startsWith("data:")) return null;
	const clean = url.split(/[?#]/)[0];
	return clean.startsWith("/")
		? join(outDir, clean)
		: resolve(dirname(fromFile), clean);
}

function entryScripts(htmlFile) {
	const html = readFileSync(htmlFile, "utf8");
	const urls = [];
	const patterns = [
		/<script[^>]*\ssrc="([^"]+)"/g,
		/<link[^>]*rel="modulepreload"[^>]*href="([^"]+)"/g,
		/\s(?:component-url|renderer-url|before-hydration-url)="([^"]+)"/g,
	];
	for (const pattern of patterns) {
		for (const match of html.matchAll(pattern)) urls.push(match[1]);
	}
	// Inline module scripts can import chunks too.
	for (const match of html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)) {
		for (const spec of importSpecifiers(match[1])) urls.push(spec);
	}
	return {
		html,
		files: urls.map((url) => urlToFile(url, htmlFile)).filter(Boolean),
	};
}

function importSpecifiers(code) {
	const specs = [];
	const patterns = [
		/\bimport\s*\(\s*["']([^"']+)["']\s*\)/g,
		/\b(?:import|from)\s*["']([^"']+)["']/g,
	];
	for (const pattern of patterns) {
		for (const match of code.matchAll(pattern)) {
			if (match[1].startsWith(".") || match[1].startsWith("/"))
				specs.push(match[1]);
		}
	}
	return specs;
}

function closure(files) {
	const seen = new Set();
	const queue = [...files];
	while (queue.length > 0) {
		const file = queue.pop();
		if (seen.has(file)) continue;
		if (!existsSync(file) || !statSync(file).isFile())
			fail(`script not found in build: ${relative(outDir, file)}`);
		seen.add(file);
		if (!file.endsWith(".js")) continue;
		for (const spec of importSpecifiers(readFileSync(file, "utf8"))) {
			const next = urlToFile(spec, file);
			if (next) queue.push(next);
		}
	}
	return seen;
}

function reachesReact(files) {
	return [...files].some((file) => {
		const code = readFileSync(file, "utf8");
		return reactMarkers.some((marker) => code.includes(marker));
	});
}

if (!existsSync(islandPage))
	fail(
		`missing ${relative(process.cwd(), islandPage)}; build with ISLAND_CHECK=1 first`,
	);

const island = entryScripts(islandPage);
const islandFiles = closure(island.files);
if (!island.html.includes("<astro-island"))
	fail("the island page has no hydrated island");
if (!reachesReact(islandFiles))
	fail(
		"the island page does not load React, so the check cannot tell anything apart",
	);

for (const page of realPages) {
	if (!existsSync(page)) fail(`missing ${relative(outDir, page)}`);
	const { html, files } = entryScripts(page);
	const pageFiles = closure(files);
	const name = relative(outDir, page);
	if (html.includes("<astro-island"))
		fail(`${name} contains a hydrated island`);
	if (reachesReact(pageFiles)) fail(`${name} loads the React runtime`);
	console.log(
		`check-islands: ${name} loads ${pageFiles.size} script(s), no React`,
	);
}

console.log(
	`check-islands: island-check/index.html loads React through ${islandFiles.size} script(s)`,
);
console.log("check-islands: AC-3 holds");
