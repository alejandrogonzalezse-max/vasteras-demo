// Tid i Europe/Stockholm, oavsett vilken tidszon besökarens webbläsare har.
// Allt påhittat innehåll räknas relativt till "nu", så att sajten alltid ser aktuell ut.

export const TZ = 'Europe/Stockholm';

export interface Parts {
	y: number;
	m: number; // 1–12
	d: number;
	h: number;
	min: number;
	wd: number; // 0 = söndag
}

const fmt = new Intl.DateTimeFormat('en-GB', {
	timeZone: TZ,
	year: 'numeric',
	month: 'numeric',
	day: 'numeric',
	hour: 'numeric',
	minute: 'numeric',
	hourCycle: 'h23'
});

export function parts(ms: number): Parts {
	const p: Record<string, number> = {};
	for (const x of fmt.formatToParts(new Date(ms))) if (x.type !== 'literal') p[x.type] = Number(x.value);
	const wd = new Date(Date.UTC(p.year, p.month - 1, p.day)).getUTCDay();
	return { y: p.year, m: p.month, d: p.day, h: p.hour % 24, min: p.minute, wd };
}

/** Väggtid i Stockholm → millisekunder (hanterar sommartid). */
export function zoned(y: number, m: number, d: number, h = 0, min = 0): number {
	const target = Date.UTC(y, m - 1, d, h, min);
	let guess = target;
	for (let i = 0; i < 2; i++) {
		const p = parts(guess);
		const asUtc = Date.UTC(p.y, p.m - 1, p.d, p.h, p.min);
		guess += target - asUtc;
	}
	return guess;
}

/** Kalenderdag i Stockholm som heltal, för att jämföra dagar. */
export function dayIndex(ms: number) {
	const p = parts(ms);
	return Math.floor(Date.UTC(p.y, p.m - 1, p.d) / 86400000);
}

function hm(t: string): [number, number] {
	const [h, m] = t.split(':').map(Number);
	return [h, m];
}

/** Klockslag t (HH:MM) så många dagar från idag. */
export function onDay(now: number, offset: number, t: string) {
	const p = parts(now);
	const base = new Date(Date.UTC(p.y, p.m - 1, p.d + offset));
	const [h, m] = hm(t);
	return zoned(base.getUTCFullYear(), base.getUTCMonth() + 1, base.getUTCDate(), h, m);
}

/** Nästa gång klockan är t, minst `ahead` minuter fram. */
export function nextTime(now: number, t: string, ahead = 15) {
	for (let i = 0; i < 3; i++) {
		const ms = onDay(now, i, t);
		if (ms >= now + ahead * 60000) return ms;
	}
	return onDay(now, 3, t);
}

/** Nästa veckodag wd (0 = söndag) klockan t, minst `ahead` minuter fram. */
export function nextWeekday(now: number, wd: number, t: string, ahead = 60) {
	const today = parts(now).wd;
	for (let i = 0; i < 15; i++) {
		if ((today + i) % 7 !== wd) continue;
		const ms = onDay(now, i, t);
		if (ms >= now + ahead * 60000) return ms;
	}
	return onDay(now, 7, t);
}

const pad = (n: number) => String(n).padStart(2, '0');
export const WEEKDAYS = ['söndag', 'måndag', 'tisdag', 'onsdag', 'torsdag', 'fredag', 'lördag'];
const AGO_DAYS = ['i söndags', 'i måndags', 'i tisdags', 'i onsdags', 'i torsdags', 'i fredags', 'i lördags'];
export const MONTHS = ['januari', 'februari', 'mars', 'april', 'maj', 'juni', 'juli', 'augusti', 'september', 'oktober', 'november', 'december'];
const MON = ['jan', 'feb', 'mars', 'apr', 'maj', 'juni', 'juli', 'aug', 'sep', 'okt', 'nov', 'dec'];

export function clock(ms: number) {
	const p = parts(ms);
	return `${pad(p.h)}:${pad(p.min)}`;
}

/** "Lördag 7 november" */
export function dateText(ms: number) {
	const p = parts(ms);
	const w = WEEKDAYS[p.wd];
	return `${w[0].toUpperCase()}${w.slice(1)} ${p.d} ${MONTHS[p.m - 1]}`;
}

/** Framtid: "om 50 min · 14:30", "i kväll 21:30", "i dag 14:00", "i morgon 07:00", "på söndag 13:00". */
export function whenLabel(minutes: number, now: number): string {
	const t = Math.round((now + minutes * 60000) / 900000) * 900000;
	const time = clock(t);
	if (minutes < 0) return `pågår sedan ${time}`;
	if (minutes < 180)
		return `om ${minutes < 60 ? minutes + ' min' : String(Math.round(minutes / 6) / 10).replace('.', ',') + ' tim'} · ${time}`;
	const dd = dayIndex(t) - dayIndex(now);
	if (dd === 0) return parts(t).h >= 17 ? `i kväll ${time}` : `i dag ${time}`;
	if (dd === 1) return `i morgon ${time}`;
	if (dd < 7) return `på ${WEEKDAYS[parts(t).wd]} ${time}`;
	const p = parts(t);
	return `${p.d} ${MON[p.m - 1]} ${time}`;
}

/** Påhittade tider anges som "minuter sedan" (tal) eller fri text. */
export type Ago = number | string;

/** Dåtid: "nyss", "23 min sedan", "i dag 10:42", "i går 22:14", "i tisdags", "28 okt". */
export function agoLabel(ago: Ago, now: number): string {
	if (typeof ago === 'string') return ago;
	if (ago < 1) return 'nyss';
	if (ago < 60) return `${Math.round(ago)} min sedan`;
	const t = now - ago * 60000;
	const dd = dayIndex(now) - dayIndex(t);
	if (dd === 0) return `i dag ${clock(t)}`;
	if (dd === 1) return `i går ${clock(t)}`;
	if (dd < 7) return AGO_DAYS[parts(t).wd];
	const p = parts(t);
	return `${p.d} ${MON[p.m - 1]}`;
}

/** Har solen gått ner (eller inte gått upp än)? Grovt: efter solnedgång eller före 07. */
export function isDark(now: number, sunsetHm: string) {
	const p = parts(now);
	const [h, m] = sunsetHm.split(':').map(Number);
	if (!Number.isFinite(h)) return false;
	const mins = p.h * 60 + p.min;
	return mins >= h * 60 + m || p.h < 7;
}

// ---------------------------------------------------------------- Årstid och högtid

export type Season = 'vinter' | 'vår' | 'sommar' | 'höst';

export function seasonOf(ms: number): Season {
	const m = parts(ms).m;
	if (m === 12 || m <= 2) return 'vinter';
	if (m <= 5) return 'vår';
	if (m <= 8) return 'sommar';
	return 'höst';
}

/** Påskdagen (gregoriansk algoritm). */
export function easter(y: number) {
	const a = y % 19;
	const b = Math.floor(y / 100);
	const c = y % 100;
	const d = Math.floor(b / 4);
	const e = b % 4;
	const f = Math.floor((b + 8) / 25);
	const g = Math.floor((b - f + 1) / 3);
	const h = (19 * a + b - d - g + 15) % 30;
	const i = Math.floor(c / 4);
	const k = c % 4;
	const l = (32 + 2 * e + 2 * i - h - k) % 7;
	const m = Math.floor((a + 11 * h + 22 * l) / 451);
	const month = Math.floor((h + l - 7 * m + 114) / 31);
	const day = ((h + l - 7 * m + 114) % 31) + 1;
	return { m: month, d: day };
}

export type HolidayId = 'allhelgona' | 'advent' | 'lucia' | 'jul' | 'nyår' | 'påsk' | 'valborg' | 'midsommar' | 'kräftskiva';

const dnum = (y: number, m: number, d: number) => Math.floor(Date.UTC(y, m - 1, d) / 86400000);

/** Högtid för ett datum i Stockholm, eller null. */
export function holidayOf(ms: number): { id: HolidayId; text: string } | null {
	const { y, m, d } = parts(ms);
	const today = dnum(y, m, d);
	const wdOf = (mm: number, dd: number) => new Date(Date.UTC(y, mm - 1, dd)).getUTCDay();

	if (m === 12 && d === 31) return { id: 'nyår', text: 'nyårsafton' };
	if (m === 1 && d === 1) return { id: 'nyår', text: 'nyårsdagen' };

	const e = easter(y);
	const eDay = dnum(y, e.m, e.d);
	if (today >= eDay - 3 && today <= eDay + 1)
		return { id: 'påsk', text: today === eDay - 1 ? 'påskafton' : today === eDay ? 'påskdagen' : 'påskhelgen' };

	if (m === 4 && d === 30) return { id: 'valborg', text: 'valborgsmässoafton' };

	// Midsommarafton: fredagen mellan 19 och 25 juni
	for (let dd = 19; dd <= 25; dd++) {
		if (wdOf(6, dd) !== 5) continue;
		const eve = dnum(y, 6, dd);
		if (today === eve) return { id: 'midsommar', text: 'midsommarafton' };
		if (today === eve + 1) return { id: 'midsommar', text: 'midsommardagen' };
		if (today === eve + 2) return { id: 'midsommar', text: 'midsommarhelgen' };
	}

	if (m === 8) return { id: 'kräftskiva', text: 'kräftskivetider' };

	// Alla helgons dag: lördagen mellan 31 okt och 6 nov, helgen runt den
	for (const [mm, dd] of [[10, 31], [11, 1], [11, 2], [11, 3], [11, 4], [11, 5], [11, 6]]) {
		if (wdOf(mm, dd) !== 6) continue;
		const sat = dnum(y, mm, dd);
		if (today >= sat - 1 && today <= sat + 1) return { id: 'allhelgona', text: 'allhelgonahelg' };
	}

	if (m === 12 && d >= 23 && d <= 26) return { id: 'jul', text: d === 24 ? 'julafton' : 'julhelgen' };
	if (m === 12 && (d === 12 || d === 13)) return { id: 'lucia', text: 'lucia' };

	// Advent: från första advent (söndagen 27 nov–3 dec) till julafton
	for (const [mm, dd] of [[11, 27], [11, 28], [11, 29], [11, 30], [12, 1], [12, 2], [12, 3]]) {
		if (wdOf(mm, dd) !== 0) continue;
		if (today >= dnum(y, mm, dd) && today < dnum(y, 12, 24)) return { id: 'advent', text: 'advent' };
	}
	return null;
}

// ---------------------------------------------------------------- Solnedgång

/** Solnedgång (klockslag i Stockholm) för en plats och ett datum. NOAA:s förenklade algoritm. */
export function sunset(ms: number, lat = 59.61, lon = 16.545): string | null {
	const { y, m, d } = parts(ms);
	const N = Math.floor((Date.UTC(y, m - 1, d) - Date.UTC(y, 0, 0)) / 86400000);
	const rad = Math.PI / 180;
	const lngHour = lon / 15;
	const t = N + (18 - lngHour) / 24;
	const M = 0.9856 * t - 3.289;
	let L = M + 1.916 * Math.sin(M * rad) + 0.02 * Math.sin(2 * M * rad) + 282.634;
	L = ((L % 360) + 360) % 360;
	let RA = Math.atan(0.91764 * Math.tan(L * rad)) / rad;
	RA = ((RA % 360) + 360) % 360;
	RA = (RA + (Math.floor(L / 90) * 90 - Math.floor(RA / 90) * 90)) / 15;
	const sinDec = 0.39782 * Math.sin(L * rad);
	const cosDec = Math.cos(Math.asin(sinDec));
	const cosH = (Math.cos(90.833 * rad) - sinDec * Math.sin(lat * rad)) / (cosDec * Math.cos(lat * rad));
	if (cosH < -1 || cosH > 1) return null; // midnattssol eller polarnatt
	const H = Math.acos(cosH) / rad / 15;
	const T = H + RA - 0.06571 * t - 6.622;
	let UT = T - lngHour;
	UT = ((UT % 24) + 24) % 24;
	const utcMs = Date.UTC(y, m - 1, d) + UT * 3600000;
	return clock(utcMs);
}
