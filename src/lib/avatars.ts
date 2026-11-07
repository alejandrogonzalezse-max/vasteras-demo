// Egenritade pixelavatarer (16×16). Varje användare får ett fast utseende:
// hudton, frisyr, hårfärg och tillbehör. Ingen likhet med verkliga personer.

type R = [number, number, number, number, string];

export type Hair = 'kort' | 'lang' | 'knut' | 'lockigt' | 'flint' | 'keps' | 'mossa' | 'lugg';

export interface Look {
	skin: number;
	hair: Hair;
	hairColor: string;
	shirt: string;
	hat?: string;
	glasses?: boolean;
	beard?: boolean;
}

const SKIN = ['#f4d2b5', '#e8b68f', '#c98d63', '#a26a45', '#6e4630'];
const HAIR = {
	svart: '#26201c',
	brun: '#5a3a24',
	ljus: '#d8b25a',
	rod: '#a8482a',
	gra: '#a9a9a9',
	vit: '#e2e2e2'
};

/** Handplockade utseenden för huvudpersonerna i demon. */
const LOOKS: Record<string, Look> = {
	gubben940: { skin: 1, hair: 'keps', hairColor: HAIR.gra, shirt: '#2f5a3c', hat: '#1b56c4', beard: true },
	matteok: { skin: 2, hair: 'lockigt', hairColor: HAIR.svart, shirt: '#c8463a' },
	sannas: { skin: 0, hair: 'knut', hairColor: HAIR.ljus, shirt: '#3f6fa8' },
	'erik-pa-raby': { skin: 1, hair: 'kort', hairColor: HAIR.brun, shirt: '#e8a83a', beard: true },
	'linnea-l': { skin: 0, hair: 'lang', hairColor: HAIR.rod, shirt: '#2f7a6a', glasses: true },
	'backby-pelle': { skin: 1, hair: 'flint', hairColor: HAIR.gra, shirt: '#8a5a34', beard: true },
	'johanna-v': { skin: 3, hair: 'lockigt', hairColor: HAIR.svart, shirt: '#7a3aa5' },
	fotofredrik: { skin: 0, hair: 'kort', hairColor: HAIR.ljus, shirt: '#3d4452', glasses: true },
	mopedmia: { skin: 1, hair: 'mossa', hairColor: HAIR.brun, shirt: '#3f6fa8', hat: '#c8463a' },
	'tobbe-tillberga': { skin: 0, hair: 'lugg', hairColor: HAIR.ljus, shirt: '#5c8a3f' },
	kicki61: { skin: 0, hair: 'knut', hairColor: HAIR.vit, shirt: '#b5507a', glasses: true },
	'hampus-o': { skin: 2, hair: 'lugg', hairColor: HAIR.brun, shirt: '#22252b', glasses: true },
	elinb: { skin: 4, hair: 'lang', hairColor: HAIR.svart, shirt: '#e8735a' },
	'rut-rocklunda': { skin: 0, hair: 'lockigt', hairColor: HAIR.vit, shirt: '#5e3d78' },
	'nisse-irsta': { skin: 1, hair: 'mossa', hairColor: HAIR.rod, shirt: '#2d528a', hat: '#2f5a3c', beard: true },
	'sofia-bjurhovda': { skin: 2, hair: 'lang', hairColor: HAIR.brun, shirt: '#c98a42' },
	'anna-mod': { skin: 1, hair: 'kort', hairColor: HAIR.rod, shirt: '#1d7a3a', glasses: true }
};

function hash(s: string) {
	let h = 2166136261;
	for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
	return h >>> 0;
}

/** Fast utseende för okända id:n, så att även nya användare får en avatar. */
export function lookFor(id: string): Look {
	if (LOOKS[id]) return LOOKS[id];
	const h = hash(id);
	const hairs: Hair[] = ['kort', 'lang', 'knut', 'lockigt', 'lugg', 'mossa'];
	const colors = Object.values(HAIR);
	return {
		skin: h % SKIN.length,
		hair: hairs[(h >> 3) % hairs.length],
		hairColor: colors[(h >> 7) % 4],
		shirt: ['#3f6fa8', '#c8463a', '#2f7a6a', '#e8a83a', '#7a3aa5'][(h >> 11) % 5],
		hat: '#c8463a',
		glasses: (h >> 13) % 4 === 0
	};
}

function darker(hex: string, f = 0.75) {
	const n = parseInt(hex.slice(1), 16);
	const r = Math.round(((n >> 16) & 255) * f);
	const g = Math.round(((n >> 8) & 255) * f);
	const b = Math.round((n & 255) * f);
	return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

function lighter(hex: string, f = 0.18) {
	const n = parseInt(hex.slice(1), 16);
	const mix = (v: number) => Math.round(v + (255 - v) * f);
	const r = mix((n >> 16) & 255);
	const g = mix((n >> 8) & 255);
	const b = mix(n & 255);
	return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

export function avatarRects(id: string, bg: string): R[] {
	const L = lookFor(id);
	const skin = SKIN[L.skin];
	const shade = darker(skin, 0.85);
	const hc = L.hairColor;
	const r: R[] = [
		[0, 0, 16, 16, bg],
		[0, 0, 16, 6, lighter(bg)],
		// axlar och tröja
		[3, 13, 10, 1, L.shirt],
		[2, 14, 12, 2, L.shirt],
		[6, 13, 4, 1, darker(L.shirt, 0.8)],
		// hals och huvud
		[7, 11, 2, 2, shade],
		[5, 4, 6, 7, skin],
		[4, 6, 1, 3, skin],
		[11, 6, 1, 3, skin],
		[6, 10, 4, 1, shade],
		// ögon och mun
		[6, 7, 1, 1, '#22252b'],
		[9, 7, 1, 1, '#22252b'],
		[7, 9, 2, 1, darker(skin, 0.65)]
	];

	// Långt hår ritas bakom ansiktet först
	if (L.hair === 'lang') r.splice(1, 0, [4, 4, 8, 10, hc], [3, 6, 1, 7, hc], [12, 6, 1, 7, hc]);

	switch (L.hair) {
		case 'kort':
			r.push([5, 3, 6, 1, hc], [4, 4, 8, 1, hc], [4, 5, 1, 2, hc], [11, 5, 1, 2, hc]);
			break;
		case 'lang':
			r.push([5, 3, 6, 1, hc], [4, 4, 8, 2, hc], [4, 6, 1, 1, hc], [11, 6, 1, 1, hc]);
			break;
		case 'knut':
			r.push([7, 1, 2, 2, hc], [5, 3, 6, 1, hc], [4, 4, 8, 1, hc], [4, 5, 1, 2, hc], [11, 5, 1, 2, hc]);
			break;
		case 'lockigt':
			r.push([5, 2, 6, 1, hc], [4, 3, 8, 2, hc], [3, 4, 1, 4, hc], [12, 4, 1, 4, hc], [4, 5, 1, 1, hc], [11, 5, 1, 1, hc]);
			break;
		case 'lugg':
			r.push([5, 3, 6, 1, hc], [4, 4, 8, 1, hc], [5, 5, 4, 1, hc], [4, 5, 1, 2, hc], [11, 5, 1, 2, hc]);
			break;
		case 'flint':
			r.push([4, 5, 1, 2, hc], [11, 5, 1, 2, hc], [6, 4, 2, 1, lighter(skin, 0.35)]);
			break;
		case 'keps':
			r.push([5, 2, 6, 1, L.hat!], [4, 3, 8, 2, L.hat!], [3, 5, 10, 1, darker(L.hat!, 0.7)], [7, 3, 2, 1, '#ffffff'], [4, 6, 1, 1, hc], [11, 6, 1, 1, hc]);
			break;
		case 'mossa':
			r.push([7, 0, 2, 1, '#f3e3c3'], [5, 1, 6, 1, L.hat!], [4, 2, 8, 2, L.hat!], [4, 4, 8, 1, darker(L.hat!, 0.7)], [4, 5, 1, 1, hc], [11, 5, 1, 1, hc]);
			break;
	}

	if (L.beard) r.push([5, 9, 6, 2, hc], [6, 11, 4, 1, hc], [7, 9, 2, 1, darker(skin, 0.65)]);
	if (L.glasses)
		for (const x of [5, 8])
			r.push([x, 6, 3, 1, '#3d4452'], [x, 7, 1, 1, '#3d4452'], [x + 2, 7, 1, 1, '#3d4452'], [x, 8, 3, 1, '#3d4452']);

	return r;
}
