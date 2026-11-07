// Delat temaläge, så att flera temaknappar (desktop och mobilmeny) håller ihop.
import { THEME_KEY } from './config.ts';

export const theme = $state<{ value: 'light' | 'dark' }>({ value: 'light' });

export function syncTheme() {
	theme.value = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

export function applyTheme(t: 'light' | 'dark', remember = true) {
	theme.value = t;
	document.documentElement.dataset.theme = t;
	if (remember) {
		try {
			localStorage.setItem(THEME_KEY, t);
		} catch {
			/* ingen lagring – temat gäller tills sidan laddas om */
		}
	}
}

/** Följ systemets inställning tills användaren valt själv. */
export function followSystem() {
	const mq = window.matchMedia('(prefers-color-scheme: dark)');
	const follow = () => {
		let pref = 'system';
		try {
			pref = localStorage.getItem(THEME_KEY) ?? 'system';
		} catch {
			/* ingen lagring */
		}
		if (pref === 'system') applyTheme(mq.matches ? 'dark' : 'light', false);
	};
	mq.addEventListener('change', follow);
	return () => mq.removeEventListener('change', follow);
}
