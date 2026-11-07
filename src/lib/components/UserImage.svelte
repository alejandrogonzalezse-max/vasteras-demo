<script lang="ts">
	import { imageUrl } from '#lib/images.ts';

	let { id, alt, square = false }: { id: string; alt: string; square?: boolean } = $props();
	let url = $state<string | null>(null);
	let missing = $state(false);

	$effect(() => {
		let alive = true;
		missing = false;
		imageUrl(id).then((u) => {
			if (!alive) return;
			url = u;
			missing = !u;
		});
		return () => (alive = false);
	});
</script>

{#if url}
	<img src={url} {alt} class="uimg" class:square loading="lazy" decoding="async" />
{:else}
	<span class="uimg ph" class:square role="img" aria-label={missing ? `Bilden finns inte längre: ${alt}` : alt}>
		{missing ? 'Bilden finns inte längre' : ''}
	</span>
{/if}

<style>
	.uimg {
		display: block;
		width: 100%;
		height: auto;
		background: var(--surface-sunk);
	}

	.square {
		aspect-ratio: 1;
		object-fit: cover;
	}

	.ph {
		display: grid;
		place-items: center;
		aspect-ratio: 4 / 3;
		font-size: var(--text-xs);
		color: var(--text-muted);
	}
</style>
