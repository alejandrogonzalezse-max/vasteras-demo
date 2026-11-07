<script lang="ts">
	import { WORD_H, WORD_W, wordPath } from '#lib/wordmark.ts';

	/** scale = pixlar per ruta. Färger tas från CSS-variablerna --wm-fg och --wm-shadow. */
	let { scale = 3, label = 'Västeråsarna' }: { scale?: number; label?: string | null } = $props();
	const shadow = wordPath(1, 1);
	const main = wordPath();
</script>

<svg
	class="wordmark"
	viewBox={`0 0 ${WORD_W + 1} ${WORD_H + 1}`}
	width={(WORD_W + 1) * scale}
	height={(WORD_H + 1) * scale}
	shape-rendering="crispEdges"
	role={label ? 'img' : undefined}
	aria-label={label ?? undefined}
	aria-hidden={label ? undefined : 'true'}
	focusable="false"
>
	<path d={shadow} fill="var(--wm-shadow, #10305f)" />
	<path d={main} fill="var(--wm-fg, #1b56c4)" />
</svg>

<style>
	.wordmark {
		display: block;
		max-width: 100%;
		height: auto;
	}
</style>
