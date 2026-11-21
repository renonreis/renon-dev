// Spec 0004, AC-9: the motion JavaScript the home page loads stays within 40 KB gzipped.
// Gzips every module script dist/index.html references (inline modules and every chunk they import,
// statically or dynamically) and fails above the budget.
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { gzipSync } from "node:zlib";

const budgetBytes = 40 * 1024;
const outDir = resolve(process.argv[2] ?? "dist");
const page = join(outDir, "index.html");

function fail(message) {
	console.error(`check-budget: ${message}`);
	process.exit(1);
}

const importSpecifiers = (code) =>
	[
		...code.matchAll(/\bimport\s*\(\s*["']([^"']+)["']\s*\)/g),
		...code.matchAll(/\b(?:import|from)\s*["']([^"']+)["']/g),
	]
		.map((match) => match[1])
		.filter((spec) => spec.startsWith(".") || spec.startsWith("/"));

const toFile = (spec, fromFile) =>
	spec.startsWith("/")
		? join(outDir, spec.split(/[?#]/)[0])
		: resolve(dirname(fromFile), spec.split(/[?#]/)[0]);

if (!existsSync(page))
	fail(`missing ${relative(process.cwd(), page)}; run the build first`);

const html = readFileSync(page, "utf8");
const moduleTags = [
	...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g),
].filter(([, attributes]) => /\btype=["']?module/.test(attributes));
const inline = moduleTags
	.filter(([, attributes]) => !/\bsrc=/.test(attributes))
	.map(([, , code]) => code);
const external = moduleTags
	.map(([, attributes]) => /\bsrc="([^"]+)"/.exec(attributes)?.[1])
	.filter(Boolean)
	.map((src) => toFile(src, page));

const seen = new Set();
const queue = [
	...external,
	...inline.flatMap((code) =>
		importSpecifiers(code).map((spec) => toFile(spec, page)),
	),
];
while (queue.length > 0) {
	const file = queue.pop();
	if (seen.has(file)) continue;
	if (!existsSync(file))
		fail(`script not found in build: ${relative(outDir, file)}`);
	seen.add(file);
	for (const spec of importSpecifiers(readFileSync(file, "utf8")))
		queue.push(toFile(spec, file));
}

const sizes = [
	...inline.map((code, index) => [
		`inline module ${index + 1}`,
		gzipSync(code).length,
	]),
	...[...seen].map((file) => [
		relative(outDir, file),
		gzipSync(readFileSync(file)).length,
	]),
];
const total = sizes.reduce((sum, [, size]) => sum + size, 0);
for (const [name, size] of sizes)
	console.log(`check-budget: ${name} ${(size / 1024).toFixed(1)} KB gzipped`);
if (sizes.length === 0)
	fail("index.html references no module script; the motion module is missing");
const summary = `${(total / 1024).toFixed(1)} KB of ${budgetBytes / 1024} KB gzipped`;
if (total > budgetBytes) fail(`motion JavaScript is ${summary}`);
console.log(`check-budget: AC-9 holds, ${summary}`);
