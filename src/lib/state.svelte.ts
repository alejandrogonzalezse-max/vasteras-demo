// Demons tillstånd. Sparas i localStorage (alltid inom try/catch) och faller
// tillbaka till minnet om lagringen inte går att använda (t.ex. privat läge).

import { ME_ID, STORAGE_KEY, THEME_KEY } from './config.ts';
import {
	activities,
	myFriends,
	userById,
	type DiaryPost,
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
	/** Har man tittat på sina nya gästboksinlägg? */
	seenGuestbook: boolean;
	/** Antal nya "Jag kommer" på mina lappar som jag inte sett än. */
	unseenAttend: number;
	myPosts: DiaryPost[];
	lappComments: Record<string, GuestEntry[]>;
	/** Visa inte mina besök på andras profiler. */
	sneak: boolean;
	/** Pågående rundtur (steg) eller null. */
	tour: number | null;
}

export interface Toast {
	id: number;
	text: string;
	href?: string;
	linkText?: string;
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
		lastIdea: null,
		seenGuestbook: false,
		unseenAttend: 0,
		myPosts: [],
		lappComments: {},
		sneak: false,
		tour: null
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
	toasts = $state<Toast[]>([]);
	#toastId = 0;
	#timers: ReturnType<typeof setTimeout>[] = [];

	/** Kort notis nere i hörnet. Läses upp av skärmläsare (aria-live). */
	toast(text: string, href?: string, linkText?: string) {
		const id = ++this.#toastId;
		this.toasts.push({ id, text, href, linkText });
		this.#later(() => this.dismiss(id), 6500);
	}

	dismiss(id: number) {
		this.toasts = this.toasts.filter((t) => t.id !== id);
	}

	#later(fn: () => void, ms: number) {
		this.#timers.push(setTimeout(fn, ms));
	}

	/** Kompisar som reagerar en stund efter att man gjort något – så känns demon levande. */
	#reactToNote(noteId: string) {
		const fans = ['matteok', 'linnea-l', 'elinb', 'erik-pa-raby'];
		const [first, second] = [...fans].sort(() => Math.random() - 0.5);
		const step = (who: string, ms: number) =>
			this.#later(() => {
				const n = this.d.myNotes.find((x) => x.id === noteId);
				if (!n || n.attendees.includes(who)) return;
				n.attendees.push(who);
				this.d.unseenAttend += 1;
				this.toast(`${userById(who)?.name} trycker "Jag kommer" på din lapp!`, `/anslagstavlan#lapp-${noteId}`, 'Visa lappen');
			}, ms);
		step(first, 3500);
		step(second, 9000);
	}

	addPost(text: string, scene?: string, caption?: string) {
		const post: DiaryPost = {
			id: 'p' + Math.random().toString(36).slice(2, 8),
			by: ME_ID,
			ago: 'nyss',
			text,
			photo: scene ? { caption: caption ?? '', scene } : undefined,
			schysst: 0
		};
		this.d.myPosts.unshift(post);
		const fan = myFriends[Math.floor(Math.random() * 4)];
		this.#later(() => {
			const p = this.d.myPosts.find((x) => x.id === post.id);
			if (!p) return;
			p.schysst += 1;
			this.toast(`${userById(fan)?.name} tycker att ditt dagboksinlägg är schysst.`, '/hem#dagboken', 'Till dagboken');
		}, 4000);
		return post;
	}

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
		this.#timers.forEach(clearTimeout);
		this.#timers = [];
		this.toasts = [];
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
		const going = !this.isAttending(a);
		this.d.attending[a.id] = going;
		if (going && a.by !== ME_ID) {
			const others = this.attendeesOf(a).length - 1;
			this.toast(
				`Du kommer på "${a.title}" ${whenLabel(this.minutesUntil(a), this.now).replace(/^om .* · /, 'kl ')}.${others ? ` ${others} till kommer.` : ''}`
			);
		}
	}

	/** Antal saker i "Nytt"-raden, Lunarstorm-stil. */
	get news() {
		const items: { key: string; text: string; href: string; icon: string }[] = [];
		if (this.d.friendRequest === null) items.push({ key: 'van', text: '1 vänförfrågan', href: '/hem#vanforfragan', icon: 'plus' });
		if (!this.d.seenGuestbook) items.push({ key: 'gb', text: '2 nya i gästboken', href: `/profil/${ME_ID}#gastbok`, icon: 'book' });
		if (this.d.unseenAttend) items.push({ key: 'kom', text: `${this.d.unseenAttend} kommer på din lapp`, href: '/anslagstavlan#lappar', icon: 'check' });
		return items;
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
		at?: { lat: number; lng: number; placeId: string };
	}) {
		const id = 'n' + Math.random().toString(36).slice(2, 8);
		const note: Activity = {
			id,
			title: n.title,
			place: n.place,
			lat: n.at?.lat ?? 59.6099 + (Math.random() - 0.5) * 0.01,
			lng: n.at?.lng ?? 16.5448 + (Math.random() - 0.5) * 0.02,
			placeId: n.at?.placeId,
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
		this.#reactToNote(note.id);
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
