// Riktigt väder för Västerås från SMHI (snow1g v1). SMHI svarar med
// Access-Control-Allow-Origin: *, så webbläsaren hämtar direkt – ingen server behövs.
// Svaret cachas i 30 minuter. Går SMHI inte att nå används ett påhittat väder
// som märks "exempel", och tärningen fungerar ändå.

import { parts } from './time.ts';

export type WeatherKind = 'sol' | 'moln' | 'regn' | 'snö';

export interface Wx {
	source: 'smhi' | 'exempel';
	temp: number;
	kind: WeatherKind;
	text: string;
	symbol?: number;
}

export const SMHI_URL =
	'https://opendata-download-metfcst.smhi.se/api/category/snow1g/version/1/geotype/point/lon/16.545/lat/59.61/data.json';
const CACHE_KEY = 'vasteras-demo-smhi';
const CACHE_MS = 30 * 60 * 1000;

// SMHI:s vädersymboler (1–27)
const SYMBOLS: Record<number, [WeatherKind, string]> = {
	1: ['sol', 'klart'],
	2: ['sol', 'nästan klart'],
	3: ['moln', 'växlande molnighet'],
	4: ['moln', 'halvklart'],
	5: ['moln', 'molnigt'],
	6: ['moln', 'mulet'],
	7: ['moln', 'dimma'],
	8: ['regn', 'lätta regnskurar'],
	9: ['regn', 'regnskurar'],
	10: ['regn', 'kraftiga regnskurar'],
	11: ['regn', 'åskskurar'],
	12: ['regn', 'lätta byar av snöblandat regn'],
	13: ['regn', 'byar av snöblandat regn'],
	14: ['regn', 'kraftiga byar av snöblandat regn'],
	15: ['snö', 'lätta snöbyar'],
	16: ['snö', 'snöbyar'],
	17: ['snö', 'kraftiga snöbyar'],
	18: ['regn', 'lätt regn'],
	19: ['regn', 'regn'],
	20: ['regn', 'kraftigt regn'],
	21: ['regn', 'åska'],
	22: ['regn', 'lätt snöblandat regn'],
	23: ['regn', 'snöblandat regn'],
	24: ['regn', 'kraftigt snöblandat regn'],
	25: ['snö', 'lätt snöfall'],
	26: ['snö', 'snöfall'],
	27: ['snö', 'kraftigt snöfall']
};

// Typiskt väder per månad, används när SMHI inte svarar
const TYPICAL: [number, WeatherKind, string][] = [
	[-4, 'snö', 'lätt snöfall'],
	[-3, 'moln', 'mulet och kallt'],
	[1, 'sol', 'klart men kyligt'],
	[7, 'sol', 'sol och vårvind'],
	[12, 'sol', 'soligt'],
	[18, 'sol', 'sol och lätt bris'],
	[21, 'sol', 'varmt och soligt'],
	[19, 'moln', 'halvklart'],
	[13, 'moln', 'växlande molnighet'],
	[7, 'regn', 'regnskurar'],
	[4, 'regn', 'duggregn'],
	[-1, 'snö', 'lätt snöfall']
];

export function fallbackWeather(now: number): Wx {
	const [temp, kind, text] = TYPICAL[parts(now).m - 1];
	return { source: 'exempel', temp, kind, text };
}

interface Point {
	t: number;
	temp: number;
	symbol: number;
}

/** Plockar ut det som behövs ur SMHI-svaret. */
export function slim(json: unknown): Point[] {
	const ts = (json as { timeSeries?: { time: string; data: Record<string, number> }[] })?.timeSeries ?? [];
	return ts
		.map((e) => ({ t: Date.parse(e.time), temp: e.data?.air_temperature, symbol: e.data?.symbol_code }))
		.filter((p) => Number.isFinite(p.t) && Number.isFinite(p.temp) && Number.isFinite(p.symbol));
}

/** Väljer prognosen närmast "nu". Mer än 3 timmar bort räknas som inaktuellt. */
export function pick(points: Point[], now: number): Wx | null {
	let best: Point | null = null;
	for (const p of points) if (!best || Math.abs(p.t - now) < Math.abs(best.t - now)) best = p;
	if (!best || Math.abs(best.t - now) > 3 * 3600000) return null;
	const [kind, text] = SYMBOLS[Math.round(best.symbol)] ?? ['moln', 'molnigt'];
	return { source: 'smhi', temp: Math.round(best.temp), kind, text, symbol: best.symbol };
}

export const weather = $state<{ current: Wx | null; status: 'idle' | 'loading' | 'done'; points: Point[] }>({
	current: null,
	status: 'idle',
	points: []
});

/** SMHI:s prognos för en viss tidpunkt (närmaste värde inom 90 min), eller null. */
export function forecastAt(ms: number): Wx | null {
	const p = pick(weather.points, ms);
	if (!p) return null;
	const best = weather.points.reduce((b, x) => (Math.abs(x.t - ms) < Math.abs(b.t - ms) ? x : b));
	return Math.abs(best.t - ms) <= 90 * 60000 ? p : null;
}

function readCache(): { at: number; points: Point[] } | null {
	try {
		const raw = localStorage.getItem(CACHE_KEY);
		if (!raw) return null;
		const c = JSON.parse(raw);
		return Date.now() - c.at < CACHE_MS ? c : null;
	} catch {
		return null;
	}
}

function writeCache(points: Point[]) {
	try {
		localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), points }));
	} catch {
		/* ingen lagring – vi hämtar igen nästa gång */
	}
}

export async function loadWeather(now: number) {
	if (weather.status === 'loading') return;
	weather.status = 'loading';
	let points = readCache()?.points ?? null;
	if (!points) {
		try {
			const ctrl = new AbortController();
			const timer = setTimeout(() => ctrl.abort(), 6000);
			const res = await fetch(SMHI_URL, { signal: ctrl.signal });
			clearTimeout(timer);
			if (!res.ok) throw new Error(String(res.status));
			points = slim(await res.json());
			if (points.length) writeCache(points);
		} catch {
			points = null;
		}
	}
	weather.points = points ?? [];
	weather.current = (points && pick(points, now)) || fallbackWeather(now);
	weather.status = 'done';
}

export function clearWeatherCache() {
	try {
		localStorage.removeItem(CACHE_KEY);
	} catch {
		/* ok */
	}
}
