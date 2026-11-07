// Delat för lappar: påhittade kommentarer, kalenderfil och delning.
import { ME_ID } from './config.ts';
import type { Activity } from './mock.ts';
import { demo, type GuestEntry } from './state.svelte.ts';

const LINES = [
	'Kommer! Tar med kaffe till fler än mig.',
	'Kan bli tio minuter sen – vänta inte på mig.',
	'Första gången jag hänger på. Hur känner jag igen er?',
	'Vilket bra initiativ. Mer sånt här!',
	'Jag tar med en extra filt om någon fryser.',
	'Får man ta med en kompis som är ny i stan?'
];

/** Påhittade kommentarer från dem som kommer, plus det man själv skrivit. */
export function commentsOf(a: Activity): GuestEntry[] {
	const seeded = a.comments
		? a.attendees
				.filter((id) => id !== a.by && id !== ME_ID)
				.slice(0, 3)
				.map((by, i, list) => ({ by, ago: (list.length - i) * 17, text: LINES[(a.id.length + i * 2) % LINES.length] }))
		: [];
	return [...seeded, ...(demo.d.lappComments[a.id] ?? [])];
}

export const commentCount = (a: Activity) => a.comments + (demo.d.lappComments[a.id]?.length ?? 0);

export function addComment(a: Activity, text: string) {
	const list = demo.d.lappComments[a.id] ?? [];
	demo.d.lappComments[a.id] = [...list, { by: ME_ID, ago: 'nyss', at: Date.now(), text }];
}

const icsDate = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
const icsText = (t: string) => t.replace(/\\/g, '\\\\').replace(/([,;])/g, '\\$1').replace(/\n/g, '\\n');

/** Skapar en .ics-fil för lappen och laddar ner den. */
export function addToCalendar(a: Activity) {
	const start = new Date(Math.round((demo.now + demo.minutesUntil(a) * 60000) / 900000) * 900000);
	const end = new Date(start.getTime() + 2 * 3600000);
	const body = [
		'BEGIN:VCALENDAR',
		'VERSION:2.0',
		'PRODID:-//vasteras-demo//SV',
		'BEGIN:VEVENT',
		`UID:${a.id}@vasteras-demo`,
		`DTSTAMP:${icsDate(new Date())}`,
		`DTSTART:${icsDate(start)}`,
		`DTEND:${icsDate(end)}`,
		`SUMMARY:${icsText(a.title)}`,
		`LOCATION:${icsText(a.place)}`,
		`DESCRIPTION:${icsText((a.bring ? 'Ta med: ' + a.bring + '. ' : '') + 'Demo – påhittad lapp.')}`,
		`URL:${location.origin}/lapp/${a.id}`,
		'END:VEVENT',
		'END:VCALENDAR'
	].join('\r\n');
	const url = URL.createObjectURL(new Blob([body], { type: 'text/calendar' }));
	const link = Object.assign(document.createElement('a'), { href: url, download: `${a.id}.ics` });
	document.body.append(link);
	link.click();
	link.remove();
	setTimeout(() => URL.revokeObjectURL(url), 1000);
	demo.toast(`"${a.title}" är nedladdad som kalenderfil.`);
}

/** Delar länken till lappens egen sida (eller kopierar den). */
export async function shareLapp(a: Activity) {
	const url = `${location.origin}/lapp/${a.id}`;
	if (navigator.share) {
		try {
			await navigator.share({ title: a.title, text: `${a.title} – ${a.place}`, url });
			return;
		} catch {
			/* avbrutet – kopiera i stället */
		}
	}
	try {
		await navigator.clipboard.writeText(url);
		demo.toast('Länken till lappen är kopierad.');
	} catch {
		demo.toast(`Kopiera länken: ${url}`);
	}
}
