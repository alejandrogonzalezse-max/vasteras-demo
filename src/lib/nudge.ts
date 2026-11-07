// MSN-knuff: skakar en ruta kort. Med reducerad rörelse blir det bara en markering.
export function nudge(el: Element | null | undefined) {
	if (!el) return;
	const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	const cls = reduce ? 'nudged-mark' : 'nudged';
	el.classList.remove('nudged', 'nudged-mark');
	void (el as HTMLElement).offsetWidth; // starta om animationen
	el.classList.add(cls);
	setTimeout(() => el.classList.remove(cls), reduce ? 2200 : 700);
}
