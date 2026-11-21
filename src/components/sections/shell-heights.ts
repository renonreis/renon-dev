// Temporary shell min heights from the Paper phone and desktop artboards (spec 0004).
// Features 7 to 10 delete a row when their section lands real content; delete the file when empty.

export type ShellId =
	| "work"
	| "now"
	| "services"
	| "about"
	| "highlights"
	| "clients"
	| "contact";

export interface ShellHeight {
	readonly phone: number;
	readonly desktop: number;
}

export const shellHeights = {
	work: { phone: 2182, desktop: 2477 },
	now: { phone: 1050, desktop: 880 },
	services: { phone: 1026, desktop: 868 },
	about: { phone: 736, desktop: 970 },
	highlights: { phone: 1130, desktop: 960 },
	clients: { phone: 508, desktop: 426 },
	contact: { phone: 504, desktop: 640 },
} as const satisfies Record<ShellId, ShellHeight>;
