<script lang="ts">
	import { onMount } from 'svelte';
	import { THEME_KEY } from '#lib/config.ts';
	import Icon from './Icon.svelte';

	let theme = $state<'light' | 'dark'>('light');

	onMount(() => {
		theme = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
		const mq = window.matchMedia('(prefers-color-scheme: dark)');
		const follow = () => {
			let pref = 'system';
			try {
				pref = localStorage.getItem(THEME_KEY) ?? 'system';
			} catch {
				/* ingen lagring */
			}
			if (pref === 'system') apply(mq.matches ? 'dark' : 'light', false);
		};
		mq.addEventListener('change', follow);
		return () => mq.removeEventListener('change', follow);
	});

	function apply(t: 'light' | 'dark', remember = true) {
		theme = t;
		document.documentElement.dataset.theme = t;
		if (remember) {
			try {
				localStorage.setItem(THEME_KEY, t);
			} catch {
				/* ingen lagring – temat gäller tills sidan laddas om */
			}
		}
	}

	export function sync() {
		theme = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
	}
</script>

<button
	type="button"
	class="btn btn-small theme"
	data-testid="theme-toggle"
	onclick={() => apply(theme === 'dark' ? 'light' : 'dark')}
	aria-label={theme === 'dark' ? 'Kvällsblå – byt till ljust tema' : 'Mälarnatt – byt till mörkt tema'}
>
	<Icon name={theme === 'dark' ? 'sun' : 'moon'} size={14} />
	<span>{theme === 'dark' ? 'Kvällsblå' : 'Mälarnatt'}</span>
</button>
