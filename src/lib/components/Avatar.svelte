<script lang="ts">
	import { userById } from '#lib/mock.ts';
	import Icon from './Icon.svelte';

	let { id, size = 40 }: { id: string; size?: number } = $props();
	const u = $derived(userById(id));
</script>

<span class="av" style:--c={u?.color ?? '#567'} style:--s={`${size}px`} aria-hidden="true">
	<Icon name="user" size={Math.round(size * 0.7)} />
</span>

<style>
	.av {
		display: inline-grid;
		place-items: end center;
		width: var(--s);
		height: var(--s);
		flex: none;
		color: rgb(255 255 255 / 0.85);
		background: var(--c);
		background-image: linear-gradient(160deg, rgb(255 255 255 / 0.2), rgb(0 0 0 / 0.15));
		border: 2px solid var(--photo-frame);
		outline: 1px solid var(--border);
		border-radius: 2px;
		overflow: hidden;
	}
</style>
