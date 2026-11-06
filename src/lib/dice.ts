// Tärningens viktning: årstid, väder, temperatur och högtid.
// Allt i demon är påhittat, men logiken är den som en riktig sajt skulle använda
// (med riktig väderdata in i stället för SeasonPreset).

import type { Idea, SeasonPreset } from './mock.ts';

export interface Weighted {
	idea: Idea;
	weight: number;
	reasons: string[];
}

export function weigh(idea: Idea, ctx: SeasonPreset): Weighted {
	let w = 1;
	const reasons: string[] = [];

	// Årstid
	if (idea.seasons) {
		if (idea.seasons.includes(ctx.season)) {
			w *= idea.seasons.length === 4 ? 1 : 3;
			if (idea.seasons.length < 4) reasons.push(`passar ${ctx.season}en`);
		} else {
			w *= 0.05;
		}
	}

	// Högtid – högtidsidéer visas nästan bara när det är högtid
	if (idea.holidays) {
		if (ctx.holiday && idea.holidays.includes(ctx.holiday)) {
			w *= 10;
			reasons.push(ctx.holidayText ?? ctx.holiday);
		} else {
			w *= idea.seasons ? 0.5 : 0.01;
		}
	}

	// Väder
	if (ctx.weather === 'regn') {
		if (idea.indoor) {
			w *= 2.5;
			reasons.push(`inomhus när det är ${ctx.weatherText}`);
		} else if (idea.rainOk) {
			reasons.push('funkar i regn');
		} else {
			w *= 0.3;
		}
	} else if (ctx.weather === 'snö') {
		if (idea.needsSnow) {
			w *= 4;
			reasons.push('det snöar');
		} else if (idea.indoor) w *= 1.4;
	} else if (ctx.weather === 'sol') {
		if (idea.indoor) w *= 0.6;
		else {
			w *= 1.8;
			reasons.push(ctx.weatherText);
		}
	}

	if (idea.needsSnow && ctx.weather !== 'snö') w *= 0.02;

	// Temperatur
	if (idea.minTemp !== undefined && ctx.temp < idea.minTemp) w *= 0.03;
	if (idea.maxTemp !== undefined && ctx.temp > idea.maxTemp) w *= 0.03;
	if (idea.maxTemp !== undefined && ctx.temp <= idea.maxTemp) reasons.push(`${ctx.temp}° räcker`);

	return { idea, weight: w, reasons };
}

export function weighAll(ideas: Idea[], ctx: SeasonPreset): Weighted[] {
	return ideas.map((i) => weigh(i, ctx)).sort((a, b) => b.weight - a.weight);
}

/** Viktad slumpdragning. Undviker att samma idé kommer två gånger i rad. */
export function roll(ideas: Idea[], ctx: SeasonPreset, previousId?: string, rnd = Math.random): Weighted {
	const list = weighAll(ideas, ctx).filter((w) => w.idea.id !== previousId);
	const total = list.reduce((s, w) => s + w.weight, 0);
	let r = rnd() * total;
	for (const w of list) {
		r -= w.weight;
		if (r <= 0) return w;
	}
	return list[0];
}

/** Sannolikhet i procent för de mest troliga idéerna – visas i "Så funkar tärningen". */
export function topChances(ideas: Idea[], ctx: SeasonPreset, n = 5) {
	const all = weighAll(ideas, ctx);
	const total = all.reduce((s, w) => s + w.weight, 0);
	return all.slice(0, n).map((w) => ({ ...w, pct: Math.round((w.weight / total) * 1000) / 10 }));
}
