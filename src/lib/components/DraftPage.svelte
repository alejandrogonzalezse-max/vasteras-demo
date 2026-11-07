<script lang="ts">
	import type { Snippet } from 'svelte';
	import { SITE_NAME } from '#lib/config.ts';

	let { title, children }: { title: string; children: Snippet } = $props();
</script>

<svelte:head><title>{title} – {SITE_NAME}</title></svelte:head>

<article class="draft">
	<p class="stamp display">UTKAST</p>
	<h1>{title}</h1>
	<p class="notice draft small">Det här är ett utkast till texten för den riktiga sajten. Den är inte juridiskt granskad.</p>
	{@render children()}
</article>

<style>
	.draft {
		max-width: 68ch;
		padding: var(--space-4);
		background: var(--surface);
		border: 1px solid var(--head-border);
		border-radius: var(--radius-lg);
		position: relative;
	}

	.stamp {
		display: inline-block;
		margin: 0 0 var(--space-2);
		padding: 2px 10px;
		color: var(--danger);
		border: 2px solid var(--danger);
		border-radius: var(--radius-sm);
		transform: rotate(-3deg);
	}

	.draft :global(h2) {
		margin-top: var(--space-4);
		font-size: var(--text-lg);
	}
</style>
