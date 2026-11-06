<script lang="ts">
	import { ICONS } from '#lib/icons.ts';

	let {
		name,
		size = 16,
		label = ''
	}: { name: string; size?: number; label?: string } = $props();
</script>

<svg
	class="icon"
	width={size}
	height={size}
	viewBox="0 0 12 12"
	shape-rendering="crispEdges"
	role={label ? 'img' : undefined}
	aria-label={label || undefined}
	aria-hidden={label ? undefined : 'true'}
	focusable="false"><path fill="currentColor" d={ICONS[name]} /></svg
>

<style>
	.icon {
		display: inline-block;
		flex: none;
		vertical-align: -2px;
	}
</style>
