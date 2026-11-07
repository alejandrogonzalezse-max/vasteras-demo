<script lang="ts">
	import { onMount } from 'svelte';
	import { applyTheme, followSystem, syncTheme, theme } from '#lib/theme.svelte.ts';
	import Icon from './Icon.svelte';

	let { testid = 'theme-toggle', full = false }: { testid?: string; full?: boolean } = $props();

	onMount(() => {
		syncTheme();
		return followSystem();
	});

	export function sync() {
		syncTheme();
	}
</script>

<button
	type="button"
	class="btn btn-small theme"
	class:full
	data-testid={testid}
	onclick={() => applyTheme(theme.value === 'dark' ? 'light' : 'dark')}
	aria-label={theme.value === 'dark' ? 'Kvällsblå – byt till ljust tema' : 'Mälarnatt – byt till mörkt tema'}
>
	<Icon name={theme.value === 'dark' ? 'sun' : 'moon'} size={14} />
	<span>{theme.value === 'dark' ? 'Kvällsblå' : 'Mälarnatt'}</span>
</button>

<style>
	.full {
		width: 100%;
		justify-content: flex-start;
	}
</style>
