// Demons tillstånd. Sparas i localStorage (alltid inom try/catch) och faller
// tillbaka till minnet om lagringen inte går att använda (t.ex. privat läge).

import { ME_ID, STORAGE_KEY, THEME_KEY } from './config.ts';
import {
	activities,
	seasonPresets,
	type Activity,
	type ForumPost,
	type QueueItem,
	type Visibility
} from './mock.ts';

export type ProfileTheme = 'klassisk' | 'solnedgang' | 'granskog';

export interface GuestEntry {
	by: string;
	ago: string;
	text: string;
}

export interface LogEntry {
	when: string;
	text: string;
	mod: string;
}

export interface Draft {
	title: string;
	place: string;
	bring: string;
}

export interface DemoData {
	loggedIn: boolean;
	seasonId: string;
	msn: string;
	friendRequest: null | 'accepted' | 'declined';
	attending: Record<string, boolean>;
	myNotes: Activity[];
	schysst: Record<string, boolean>;
	decisions: Record<string, 'approve' | 'remove'>;
	userQueue: QueueItem[];
	extraLog: LogEntry[];
	groups: Record<string, 'member' | 'pending'>;
	guestbook: Record<string, GuestEntry[]>;
	profileTheme: ProfileTheme;
	draft: Draft | null;
	nattbadComments: GuestEntry[];
	forumReplies: Record<string, ForumPost[]>;
	lastIdea: string | null;
}

function defaults(): DemoData {
	return {
		loggedIn: false,
		seasonId: seasonPresets[0].id,
		msn: 'Har kaffe på. Någon som vill gå runt Djäkneberget?',
		friendRequest: null,
		attending: {},
		myNotes: [],
		schysst: {},
		decisions: {},
		userQueue: [],
		extraLog: [],
		groups: { sondagspromenaderna: 'member', bradspel: 'member' },
		guestbook: {},
		profileTheme: 'klassisk',
		draft: null,
		nattbadComments: [],
		forumReplies: {},
		lastIdea: null
	};
}

/**
 * Demons klocka: alltid lördag 16:40 den här veckan, så att lapparna hamnar på
 * rimliga tider oavsett när någon tittar. (Den riktiga sajten använder riktig tid.)
 */
export function demoNow(real = Date.now()) {
	const d = new Date(real);
	const day = d.getDay();
	const offset = day === 0 ? -1 : 6 - day;
	return new Date(d.getFullYear(), d.getMonth(), d.getDate() + offset, 16, 40).getTime();
}

class Demo {
	d = $state<DemoData>(defaults());
	/** true när localStorage har lästs in i webbläsaren. */
	ready = $state(false);
	/** true om lagring inte gick – då sparas allt bara i minnet. */
	memoryOnly = $state(false);
	now = $state(demoNow());

	load() {
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			if (raw) this.d = { ...defaults(), ...JSON.parse(raw) };
		} catch {
			this.memoryOnly = true;
		}
		this.now = demoNow();
		this.ready = true;
	}

	save() {
		const snap = $state.snapshot(this.d);
		if (!this.ready) return;
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(snap));
		} catch {
			this.memoryOnly = true;
		}
	}

	reset() {
		this.d = defaults();
		try {
			localStorage.removeItem(STORAGE_KEY);
			localStorage.removeItem(THEME_KEY);
		} catch {
			/* minnet räcker */
		}
	}

	get season() {
		return seasonPresets.find((s) => s.id === this.d.seasonId) ?? seasonPresets[0];
	}

	// ----- Lappar och "Jag kommer"
	get allActivities(): Activity[] {
		return [...this.d.myNotes, ...activities];
	}

	isAttending(a: Activity) {
		return this.d.attending[a.id] ?? a.attendees.includes(ME_ID);
	}

	attendeesOf(a: Activity) {
		const others = a.attendees.filter((id) => id !== ME_ID);
		return this.isAttending(a) ? [ME_ID, ...others] : others;
	}

	toggleAttend(a: Activity) {
		this.d.attending[a.id] = !this.isAttending(a);
	}

	addNote(n: {
		title: string;
		place: string;
		when: number;
		bring: string;
		visibility: Visibility;
		groupId?: string;
		recurring: boolean;
		text: string;
	}) {
		const id = 'n' + Math.random().toString(36).slice(2, 8);
		const note: Activity = {
			id,
			title: n.title,
			place: n.place,
			lat: 59.6099 + (Math.random() - 0.5) * 0.01,
			lng: 16.5448 + (Math.random() - 0.5) * 0.02,
			startIn: n.when,
			bring: n.bring,
			by: ME_ID,
			visibility: n.visibility,
			groupId: n.groupId,
			recurring: n.recurring,
			attendees: [ME_ID],
			comments: 0,
			text: n.text
		};
		// Lappar sparas med absolut tid så att "om 2 timmar" stämmer efter omladdning.
		(note as Activity & { createdAt: number }).createdAt = this.now;
		this.d.myNotes.unshift(note);
		return note;
	}

	/** Minuter kvar till start, med hänsyn till när lappen skapades. */
	minutesUntil(a: Activity) {
		const created = (a as Activity & { createdAt?: number }).createdAt;
		if (created) return a.startIn - Math.round((this.now - created) / 60000);
		return a.startIn;
	}

	addToQueue(item: QueueItem) {
		this.d.userQueue.unshift(item);
	}
}

export const demo = new Demo();

// ---------------------------------------------------------------- Tid

const WEEKDAYS = ['söndag', 'måndag', 'tisdag', 'onsdag', 'torsdag', 'fredag', 'lördag'];

function pad(n: number) {
	return String(n).padStart(2, '0');
}

/** "om 50 min · 14:30", "i dag 19:30", "i morgon 10:00", "lördag 14:00". */
export function whenLabel(minutes: number, now: number): string {
	const t = new Date(now + minutes * 60000);
	t.setMinutes(Math.round(t.getMinutes() / 15) * 15, 0, 0);
	const n = new Date(now);
	const hm = `${pad(t.getHours())}:${pad(t.getMinutes())}`;
	const dayDiff = Math.round(
		(new Date(t.getFullYear(), t.getMonth(), t.getDate()).getTime() -
			new Date(n.getFullYear(), n.getMonth(), n.getDate()).getTime()) /
			86400000
	);
	if (minutes < 0) return `pågår sedan ${hm}`;
	if (minutes < 180) return `om ${minutes < 60 ? minutes + ' min' : String(Math.round(minutes / 6) / 10).replace('.', ',') + ' tim'} · ${hm}`;
	if (dayDiff === 0) return `i dag ${hm}`;
	if (dayDiff === 1) return `i morgon ${hm}`;
	return `${WEEKDAYS[t.getDay()]} ${hm}`;
}

export function nowLabel(now: number) {
	const d = new Date(now);
	return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
