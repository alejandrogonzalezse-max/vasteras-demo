// Räknar ut när de påhittade aktiviteterna äger rum, relativt till riktig tid.
// Fasta aktiviteter hamnar på rimliga klockslag (i kväll 19:00, på söndag 13:00).
// Två "spontana" platser fylls med något som passar tiden på dygnet, så att det
// alltid finns något att hänga på inom en timme – även klockan två på natten.

import { activitySpecs, type Activity, type WhenSpec } from './mock.ts';
import { nextTime, nextWeekday, parts, seasonOf } from './time.ts';

type Variant = Partial<Activity> & { when?: WhenSpec; sommar?: Partial<Activity> };
type Band = 'natt' | 'morgon' | 'dag' | 'kvall' | 'sent';

const DJAKNEBERGET = { placeId: 'djakneberget', lat: 59.6142, lng: 16.5349 };
const SVARTAN = { placeId: undefined, lat: 59.6125, lng: 16.5418 };

const SUNRISE_FIKA: Variant = {
	title: 'Soluppgångsfika på Djäkneberget',
	place: 'Djäkneberget, utsikten',
	...DJAKNEBERGET,
	bring: 'Termos och något att sitta på',
	text: 'Vi ser stan vakna. Kaffe finns till fler än oss.',
	when: { at: '07:30', ahead: 60 }
};

/** [spontan plats 1 (inom en timme), spontan plats 2] per del av dygnet. */
const SLOTS: Record<Band, [Variant, Variant]> = {
	natt: [
		{
			title: 'Nattpromenad längs Svartån',
			place: 'Svartån, vid Turbinbron',
			...SVARTAN,
			bring: 'Reflexväst och termos',
			text: 'Kan inte sova? Inte vi heller. Lugnt tempo, en halvtimme, sedan hem och sova.'
		},
		SUNRISE_FIKA
	],
	morgon: [
		{
			title: 'Morgondopp och bastu vid Framnäs',
			place: 'Framnäs, bryggan',
			placeId: 'framnas',
			lat: 59.5972,
			lng: 16.5738,
			bring: 'Handduk och badmössa',
			text: 'Kort dopp, lång bastu. Vi badar alltid minst två samtidigt.',
			sommar: { title: 'Morgondopp vid Framnäs' }
		},
		{
			title: 'Loppisrunda i Hälla',
			place: 'Hälla, parkeringen vid återbruket',
			placeId: 'halla',
			lat: 59.6178,
			lng: 16.6115,
			bring: 'Kasse och växel',
			text: 'Vi letar vykort, vinyl och gamla spel. Fika efteråt.'
		}
	],
	dag: [
		{
			title: 'Lunchpromenad längs Mälarstranden',
			place: 'Mälarstranden, mot Lövudden',
			placeId: undefined,
			lat: 59.592,
			lng: 16.512,
			bring: 'Bekväma skor',
			text: 'En timme, raskt tempo, tillbaka i tid för eftermiddagen.'
		},
		{
			title: 'Fika i Vasaparken',
			place: 'Vasaparken, vid fontänen',
			placeId: 'vasaparken',
			lat: 59.6108,
			lng: 16.5471,
			bring: 'Något att dela',
			text: 'Ta med en bulle, vi ordnar kaffe. Brädspel om det är torrt.'
		}
	],
	kvall: [
		{
			title: 'Kvällspromenad med pannlampa',
			place: 'Djäkneberget, vid stora stenen',
			...DJAKNEBERGET,
			bring: 'Pannlampa eller ficklampa, termos',
			text: 'Lugnt tempo, cirka en timme. Vi går runt berget och tittar på stan från toppen.',
			sommar: { title: 'Kvällspromenad runt Djäkneberget', bring: 'Termos' }
		},
		{
			title: 'Långsam löprunda längs Svartån',
			place: 'Svartån, vid Turbinbron',
			...SVARTAN,
			bring: 'Reflexväst',
			text: 'Pratvänligt tempo, 5 km. Bullar efteråt för den som vill.'
		}
	],
	sent: [
		{
			title: 'Stjärnskådning på Björnö',
			place: 'Björnö, ängen vid parkeringen',
			placeId: 'bjorno',
			lat: 59.5561,
			lng: 16.6301,
			bring: 'Filt och varma kläder',
			text: 'Långt från gatlyktorna. Någon har en stjärnkarta i mobilen.',
			sommar: { title: 'Midnattsdopp vid Lövudden', place: 'Lövudden, bryggorna', placeId: 'lovudden', lat: 59.5885, lng: 16.4985, bring: 'Handduk', text: 'Ljust nästan hela natten. Vi badar alltid minst två samtidigt.' }
		},
		SUNRISE_FIKA
	]
};

function bandOf(h: number): Band {
	if (h < 5) return 'natt';
	if (h < 10) return 'morgon';
	if (h < 16) return 'dag';
	if (h < 22) return 'kvall';
	return 'sent';
}

const SLOT_IDS: Record<string, 0 | 1> = { 'a-pannlampa': 0, 'a-loprunda': 1 };

let cacheKey = '';
let cache: Activity[] = [];

/**
 * Aktiviteterna med starttid i minuter från `now`.
 * `anchor` = när sidan öppnades: spontana tider räknas därifrån så att de närmar sig.
 */
export function buildActivities(now: number, anchor = now): Activity[] {
	const key = `${Math.floor(now / 60000)}:${Math.floor(anchor / 60000)}`;
	if (key === cacheKey) return cache;
	const season = seasonOf(anchor);
	const band = bandOf(parts(anchor).h);

	cache = activitySpecs.map((spec) => {
		const { when: specWhen, seasonal, ...base } = spec;
		let a: Variant = { ...base, ...(seasonal?.[season] ?? {}) };
		let when: WhenSpec = specWhen;
		const slot = SLOT_IDS[spec.id];
		if (slot !== undefined) {
			const { sommar, when: vWhen, ...v } = SLOTS[band][slot];
			a = { ...a, ...v, ...(season === 'sommar' ? sommar : {}) };
			if (vWhen) when = vWhen;
			else if (slot === 1 && band === 'kvall' && parts(anchor).h >= 19) {
				when = { at: '07:30', ahead: 60 };
				a.title = 'Morgonrunda längs Svartån';
				a.text = 'Pratvänligt tempo, 5 km innan jobbet. Frukost efteråt för den som vill.';
			}
		}
		const start =
			'soon' in when
				? anchor + when.soon * 60000
				: 'weekday' in when
					? nextWeekday(anchor, when.weekday, when.at)
					: nextTime(anchor, when.at, when.ahead ?? 15);
		return { ...(a as Activity), startIn: Math.round((start - now) / 60000) };
	});
	cacheKey = key;
	return cache;
}
