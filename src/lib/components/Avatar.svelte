<script lang="ts">
	import { userById } from '#lib/mock.ts';
	import { avatarRects } from '#lib/avatars.ts';

	let { id, size = 40 }: { id: string; size?: number } = $props();
	const u = $derived(userById(id));
	const rects = $derived(avatarRects(id, u?.color ?? '#567890'));
</script>

<span class="av" style:--s={`${size}px`} aria-hidden="true">
	<svg viewBox="0 0 16 16" shape-rendering="crispEdges" width={size - 4} height={size - 4} focusable="false">
		{#each rects as [x, y, w, h, c], i (i)}<rect {x} {y} width={w} height={h} fill={c} />{/each}
	</svg>
</span>

<style>
	.av {
		display: inline-grid;
		place-items: center;
		width: var(--s);
		height: var(--s);
		flex: none;
		background: var(--photo-frame);
		border: 1px solid var(--border);
		border-radius: 2px;
		box-shadow: var(--shadow-sm);
		overflow: hidden;
	}

	.av svg {
		display: block;
	}
</style>
