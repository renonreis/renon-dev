import { shared } from "./shared";
import type { Content } from "./types";

// Flattens content into its plain strings. Used by the tests that guard spec 0003 (AC-1, AC-3, AC-5).

const collect = (value: unknown, year: number): readonly string[] => {
	if (typeof value === "string") return [value];
	if (typeof value === "number") return [String(value)];
	if (typeof value === "function") return [String(value(year))];
	if (Array.isArray(value)) return value.flatMap((item) => collect(item, year));
	if (value !== null && typeof value === "object")
		return Object.values(value).flatMap((item) => collect(item, year));
	return [];
};

/** Every string a locale can render, with `copyright` evaluated for `year`. Item ids are keys, not copy, so they are left out. */
export const contentStrings = (
	content: Content,
	year: number = shared.buildYear,
): readonly string[] =>
	collect(
		{
			...content,
			work: {
				...content.work,
				items: content.work.items.map(({ id: _id, ...item }) => item),
			},
			now: {
				...content.now,
				items: content.now.items.map(({ id: _id, ...item }) => item),
			},
		},
		year,
	);

/** Every string `shared.ts` holds (labels, names, stacks, URLs, the email and the year). */
export const sharedStrings = (): readonly string[] =>
	collect(shared, shared.buildYear);
