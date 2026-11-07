// Demons tillstånd. Sparas i localStorage (alltid inom try/catch) och faller
// tillbaka till minnet om lagringen inte går att använda (t.ex. privat läge).

import { ME_ID, STORAGE_KEY, THEME_KEY } from './config.ts';
import { buildActivities } from './schedule.ts';
import { clock, dateText, holidayOf, seasonOf, sunset, whenLabel, type Ago } from './time.ts';
import { fallbackWeather, loadWeather, weather } from './weather.svelte.ts';
import type { Look } from './avatars.ts';
import { buildPast } from './schedule.ts';
import { clearImages, type StoredImage } from './images.ts';
import {
	myFriends,
	userById,
	type DiaryPost,
	type ForumThread,
	type Group,
	groups as mockGroups,
	forumThreads,
	seasonPresets,
	type SeasonPreset,
	type Activity,
	type ForumPost,
	type QueueItem,
	type Visibility
} from './mock.ts';

export type ProfileTheme = 'klassisk' | 'solnedgang' | 'granskog';

export { whenLabel };
export const nowLabel = clock;

export interface GuestEntry {
	by: string;
	ago: Ago;
	text: string;
	at?: number;
	images?: StoredImage[];
}

export type FriendStatus = 'me' | 'friends' | 'pending' | 'none';

export interface LogEntry {
	when: Ago;
	text: string;
	mod: string;
}

export interface Draft {
	title: string;
	place: string;
	bring: string;
	/** Lapp för en viss grupp. */
	groupId?: string;
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
	groups: Record<string, 'member' | 'pending' | 'mod'>;
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
	/** Grundarens namn från ?hej=<namn>, och vem välkomstfönstret redan visats för. */
	founderName: string | null;
	welcomedFor: string | null;
	/** Egen pixelfigur från "Pixla din figur". */
	myLook: Look | null;
	/** Antal besök per profil, för besöksräknaren. */
	visits: Record<string, number>;
	/** Global ljudspärr i sidfoten. Inget ljud spelas ändå förrän man trycker play. */
	sound: boolean;
	/** "X loggade in"-notiser. */
	loginToasts: boolean;
	/** Kanske-svar på lappar. */
	maybe: Record<string, boolean>;
	/** Vänförfrågningar och nya vänner i demon. */
	friends: Record<string, 'pending' | 'friends'>;
	/** Grupper du skapat. */
	myGroups: Group[];
	/** Ansökningar till slutna grupper där du är moderator. */
	groupApps: Record<string, { by: string; text: string; status?: 'ok' | 'nej' }[]>;
	/** Trådar i gruppernas egna forum. */
	groupThreads: Record<string, ForumThread[]>;
	/** Trådar du startat i forumet. */
	myThreads: ForumThread[];
	/** Gästboken efteråt per aktivitet: hälsningar och egna bilder. */
	afterPosts: Record<string, GuestEntry[]>;
	/** Egen profilbild (uppladdad, beskuren till kvadrat). */
	profileImage: StoredImage | null;
	/** Vänner du bjudit in till en grupp. */
	groupInvites: Record<string, string[]>;
}

export interface Toast {
	id: number;
	text: string;
	href?: string;
	linkText?: string;
	/** "login" = MSN-liknande "X har loggat in" med avatar och avstängningsknapp. */
	kind?: 'login' | 'nudge';
	who?: string;
}

function defaults(): DemoData {
	return {
		loggedIn: false,
		seasonId: 'idag',
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
		tour: null,
		founderName: null,
		welcomedFor: null,
		myLook: null,
		visits: {},
		sound: true,
		loginToasts: true,
		maybe: {},
		friends: {},
		myGroups: [],
		groupApps: {},
		groupThreads: {},
		myThreads: [],
		afterPosts: {},
		profileImage: null,
		groupInvites: {}
	};
}

// Samma starttid vid förrendering och första renderingen i webbläsaren, så att
// hydreringen stämmer. Sedan byts den mot riktig tid (se load()).
const BUILD_NOW = typeof __BUILD_TIME__ === 'number' ? __BUILD_TIME__ : Date.UTC(2026, 10, 7, 16, 0);

class Demo {
	d = $state<DemoData>(defaults());
	/** true när localStorage har lästs in i webbläsaren. */
	ready = $state(false);
	/** true om lagring inte gick – då sparas allt bara i minnet. */
	memoryOnly = $state(false);
	now = $state(BUILD_NOW);
	/** När sidan öppnades – spontana förslag räknas därifrån. */
	anchor = $state(BUILD_NOW);
	#ticker: ReturnType<typeof setInterval> | undefined;
	toasts = $state<Toast[]>([]);
	#toastId = 0;
	#timers: ReturnType<typeof setTimeout>[] = [];

	/** Kort notis nere i hörnet. Läses upp av skärmläsare (aria-live). */
	toast(text: string, href?: string, linkText?: string, extra: Partial<Toast> = {}) {
		const id = ++this.#toastId;
		this.toasts.push({ id, text, href, linkText, ...extra });
		this.#later(() => this.dismiss(id), 6500);
	}

	/** MSN-knuff: kompisen knuffar tillbaka efter några sekunder. */
	knuff(who: string, back: () => void) {
		const name = userById(who)?.name ?? who;
		this.toast(`Du knuffade ${name}!`, undefined, undefined, { kind: 'nudge', who });
		this.#later(() => {
			this.toast(`${name} knuffade dig tillbaka!`, `/profil/${who}`, 'Till profilen', { kind: 'nudge', who });
			back();
		}, 4000);
	}

	/** "X har just loggat in", som i MSN. */
	loginToast(who: string) {
		if (!this.d.loginToasts) return;
		const name = userById(who)?.name ?? who;
		this.toast(`${name} har just loggat in.`, `/profil/${who}`, 'Säg hej', { kind: 'login', who });
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
				this.toast(`${userById(who)?.name} trycker "Jag kommer" på din lapp!`, `/lapp/${noteId}`, 'Visa lappen');
			}, ms);
		step(first, 3500);
		step(second, 9000);
	}

	addPost(
		text: string,
		scene?: string,
		caption?: string,
		opts: { visibility?: 'vänner' | 'privat'; images?: StoredImage[]; place?: string } = {}
	) {
		const post: DiaryPost = {
			id: 'p' + Math.random().toString(36).slice(2, 8),
			by: ME_ID,
			ago: 'nyss',
			at: Date.now(),
			text,
			photo: scene ? { caption: caption ?? '', scene } : undefined,
			schysst: 0,
			visibility: opts.visibility ?? 'vänner',
			images: opts.images?.length ? opts.images : undefined,
			place: opts.place || undefined
		};
		this.d.myPosts.unshift(post);
		if (post.visibility === 'privat') return post;
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
		this.now = Date.now();
		this.anchor = this.now;
		this.ready = true;
		clearInterval(this.#ticker);
		this.#ticker = setInterval(() => (this.now = Date.now()), 30000);
		loadWeather(this.now);
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
		clearImages();
		try {
			localStorage.removeItem(STORAGE_KEY);
			localStorage.removeItem(THEME_KEY);
		} catch {
			/* minnet räcker */
		}
	}

	/** Dagens läge i Västerås: riktigt datum, högtid, solnedgång och väder. */
	get today(): SeasonPreset {
		const wx = weather.current ?? fallbackWeather(this.now);
		const h = holidayOf(this.now);
		return {
			id: 'idag',
			label: 'Idag',
			dateText: dateText(this.now),
			season: seasonOf(this.now),
			temp: wx.temp,
			weather: wx.kind,
			weatherText: wx.text,
			holiday: h?.id ?? null,
			holidayText: h?.text,
			sunset: sunset(this.now) ?? '–',
			source: wx.source
		};
	}

	/** Det tärningen räknar med: idag, eller en annan årstid man vill testa. */
	get season(): SeasonPreset {
		if (this.d.seasonId === 'idag') return this.today;
		const p = seasonPresets.find((s) => s.id === this.d.seasonId);
		return p ? { ...p, source: 'exempel' } : this.today;
	}

	// ----- Lappar och "Jag kommer"
	get allActivities(): Activity[] {
		return [...this.d.myNotes, ...buildActivities(this.now, this.anchor)];
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

	// ----- Vänner
	friendStatus(id: string): FriendStatus {
		if (id === ME_ID) return 'me';
		const o = this.d.friends[id];
		if (o) return o;
		if (myFriends.includes(id) || (id === 'tobbe-tillberga' && this.d.friendRequest === 'accepted')) return 'friends';
		return 'none';
	}

	isFriend(id: string) {
		return this.friendStatus(id) === 'friends';
	}

	/** Skickar en vänförfrågan. I demon accepterar den påhittade personen efter några sekunder. */
	addFriend(id: string) {
		if (this.friendStatus(id) !== 'none') return;
		const name = userById(id)?.name ?? id;
		this.d.friends[id] = 'pending';
		this.toast(`Vänförfrågan skickad till ${name}.`);
		this.#later(() => {
			if (this.d.friends[id] !== 'pending') return;
			this.d.friends[id] = 'friends';
			this.toast(`${name} accepterade din vänförfrågan!`, `/profil/${id}`, 'Till profilen', { who: id });
		}, 3500);
	}

	// ----- Lappar: Kanske, och sådant som redan har varit
	isMaybe(a: Activity) {
		return !!this.d.maybe[a.id] && !this.isAttending(a);
	}

	toggleMaybe(a: Activity) {
		const on = !this.isMaybe(a);
		this.d.maybe[a.id] = on;
		if (on) this.d.attending[a.id] = false;
	}

	get pastActivities(): Activity[] {
		return buildPast(this.now);
	}

	findActivity(id: string): Activity | undefined {
		return this.allActivities.find((a) => a.id === id) ?? this.pastActivities.find((a) => a.id === id);
	}

	// ----- Grupper
	get allGroups(): Group[] {
		return [...this.d.myGroups, ...mockGroups];
	}

	findGroup(id: string) {
		return this.allGroups.find((g) => g.id === id);
	}

	createGroup(g: { name: string; text: string; open: boolean; scene?: string; cover?: StoredImage; meet?: { title: string; place: string; when: number } }) {
		const id = 'g-' + Math.random().toString(36).slice(2, 7);
		this.d.myGroups.unshift({
			id,
			name: g.name,
			text: g.text,
			open: g.open,
			members: 1,
			icon: 'group',
			scene: g.cover ? undefined : (g.scene ?? 'kubb'),
			cover: g.cover,
			mine: true,
			note: g.open ? undefined : 'Sluten grupp: du som moderator läser ansökningarna.'
		});
		this.d.groups[id] = 'mod';
		if (g.meet?.title)
			this.addNote({ title: g.meet.title, place: g.meet.place || 'Meddelas i gruppen', when: g.meet.when, bring: '', visibility: 'grupp', groupId: id, recurring: false, text: '' });
		// En sluten grupp får sin första ansökan efter en stund, så att man ser hur det fungerar.
		if (!g.open)
			this.#later(() => {
				if (!this.findGroup(id)) return;
				this.d.groupApps[id] = [{ by: 'sofia-bjurhovda', text: 'Hej! Låter som precis min grej. Får jag vara med?' }];
				this.toast(`Ny ansökan till ${g.name}.`, `/grupp/${id}#ansokningar`, 'Visa');
			}, 5000);
		return id;
	}

	// ----- Forum
	get allThreads(): ForumThread[] {
		return [...this.d.myThreads, ...forumThreads];
	}

	findThread(id: string) {
		return this.allThreads.find((t) => t.id === id) ?? Object.values(this.d.groupThreads).flat().find((t) => t.id === id);
	}

	createThread(cat: string, title: string, text: string, images?: StoredImage[], groupId?: string) {
		const id = 't-' + Math.random().toString(36).slice(2, 7);
		const t: ForumThread = {
			id,
			cat: groupId ? `grupp:${groupId}` : cat,
			title,
			by: ME_ID,
			views: 1,
			posts: [{ by: ME_ID, ago: 'nyss', at: Date.now(), text, images: images?.length ? images : undefined }]
		};
		if (groupId) this.d.groupThreads[groupId] = [t, ...(this.d.groupThreads[groupId] ?? [])];
		else this.d.myThreads.unshift(t);
		return id;
	}

	addToQueue(item: QueueItem) {
		this.d.userQueue.unshift(item);
	}
}

export const demo = new Demo();

