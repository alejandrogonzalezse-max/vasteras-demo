<script lang="ts">
	import { SCENES } from '#lib/illustrations.ts';

	/** alt = null ger en dekorativ bild (aria-hidden). */
	let { scene, alt }: { scene: string; alt?: string | null } = $props();
	const s = $derived(SCENES[scene] ?? SCENES.solnedgang);
	const label = $derived(alt === null ? undefined : (alt ?? s.alt));
</script>

<svg
	class="scene"
	viewBox="0 0 32 32"
	shape-rendering="crispEdges"
	role={label ? 'img' : undefined}
	aria-label={label}
	aria-hidden={label ? undefined : 'true'}
	focusable="false"
>
	{#each s.rects as [x, y, w, h, c], i (i)}<rect {x} {y} width={w} height={h} fill={c} />{/each}
</svg>

<style>
	.scene {
		display: block;
		width: 100%;
		height: auto;
		aspect-ratio: 1;
	}
</style>
