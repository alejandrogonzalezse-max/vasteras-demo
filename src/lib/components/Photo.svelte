<script lang="ts">
	import Icon from './Icon.svelte';

	let {
		caption,
		color = '#5d7fa3',
		icon = 'camera',
		showCaption = true
	}: { caption: string; color?: string; icon?: string; showCaption?: boolean } = $props();
</script>

<figure class="photo">
	<div class="frame">
		<div class="img" style:--c={color} role="img" aria-label={`Foto (platshållare): ${caption}`}>
			<Icon name={icon} size={40} />
		</div>
	</div>
	{#if showCaption}<figcaption>{caption}</figcaption>{/if}
</figure>

<style>
	.photo {
		margin: 0;
		min-width: 0;
	}

	.frame {
		padding: 6px 6px 6px;
		background: var(--photo-frame);
		border: 1px solid var(--border);
		border-radius: 2px;
		box-shadow: var(--shadow-sm);
	}

	.img {
		aspect-ratio: 1;
		display: grid;
		place-items: center;
		color: rgb(255 255 255 / 0.55);
		background-color: var(--c);
		background-image:
			linear-gradient(160deg, rgb(255 255 255 / 0.18), rgb(0 0 0 / 0.22)),
			repeating-linear-gradient(0deg, rgb(255 255 255 / 0.04) 0 2px, transparent 2px 4px);
	}

	figcaption {
		margin-top: 6px;
		font-size: var(--text-xs);
		color: var(--text-muted);
		line-height: 1.35;
	}
</style>
