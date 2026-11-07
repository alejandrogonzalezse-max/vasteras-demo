<script lang="ts">
	import Scene from './Scene.svelte';

	let {
		caption,
		scene,
		alt,
		showCaption = true
	}: { caption: string; scene: string; alt?: string; showCaption?: boolean } = $props();
</script>

<figure class="photo">
	<div class="frame">
		<Scene {scene} {alt} />
	</div>
	{#if showCaption}<figcaption>{caption}</figcaption>{/if}
</figure>

<style>
	.photo {
		margin: 0;
		min-width: 0;
	}

	.frame {
		padding: 6px;
		background: var(--photo-frame);
		border: 1px solid var(--border);
		border-radius: 2px;
		box-shadow: var(--shadow-sm);
	}

	figcaption {
		margin-top: 6px;
		font-size: var(--text-xs);
		color: var(--text-muted);
		line-height: 1.35;
	}
</style>
