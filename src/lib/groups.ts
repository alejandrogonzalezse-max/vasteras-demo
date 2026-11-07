// Delat för grupper: medlemmar och gruppernas egna forum.
import { ME_ID } from './config.ts';
import { users, type ForumThread, type Group } from './mock.ts';
import { demo } from './state.svelte.ts';

/** Medlemmar att visa: påhittade för demons grupper, du (och de du bjudit in) för dina egna. */
export function membersOf(g: Group): string[] {
	if (g.mine) return [ME_ID, ...(demo.d.groupApps[g.id] ?? []).filter((a) => a.status === 'ok').map((a) => a.by)];
	const start = [...g.id].reduce((n, c) => n + c.charCodeAt(0), 0) % users.length;
	const base = [...users.slice(start), ...users.slice(0, start)].filter((u) => !u.mod).map((u) => u.id).slice(0, 8);
	const s = demo.d.groups[g.id];
	return s === 'member' || s === 'mod' ? [ME_ID, ...base.filter((id) => id !== ME_ID)] : base.filter((id) => id !== ME_ID);
}

/** Två påhittade trådar per grupp i demon, plus de du startat. */
export function threadsOf(g: Group): ForumThread[] {
	const mine = demo.d.groupThreads[g.id] ?? [];
	if (g.mine) return mine;
	const m = membersOf(g).filter((id) => id !== ME_ID);
	const seeded: ForumThread[] = [
		{
			id: `${g.id}-hej`,
			cat: `grupp:${g.id}`,
			title: 'Presentera dig här!',
			by: m[0],
			views: 120,
			posts: [
				{ by: m[0], ago: 9000, text: 'Ny i gruppen? Skriv några rader om dig själv så vi vet vem vi ska vinka till.' },
				{ by: m[1], ago: 7200, text: 'Hej! Jag kom med i våras och har inte missat en enda träff.' },
				{ by: m[2], ago: 300, text: 'Ny här. Ser fram emot nästa gång!' }
			]
		},
		{
			id: `${g.id}-nasta`,
			cat: `grupp:${g.id}`,
			title: 'Idéer till nästa träff',
			by: m[3] ?? m[0],
			views: 64,
			posts: [
				{ by: m[3] ?? m[0], ago: 2600, text: 'Vad vill vi göra nästa gång? Släng in idéer, så sätter någon upp en lapp.' },
				{ by: m[4] ?? m[1], ago: 1500, text: 'Samma som förra gången, fast med mer fika.' }
			]
		}
	];
	return [...mine, ...seeded];
}

/** Hitta en gruppråd (för trådsidan). */
export function findGroupThread(id: string): { thread: ForumThread; group: Group } | null {
	for (const g of demo.allGroups) {
		const t = threadsOf(g).find((x) => x.id === id);
		if (t) return { thread: t, group: g };
	}
	return null;
}
