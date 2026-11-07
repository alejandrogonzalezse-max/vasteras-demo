<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from './Icon.svelte';

	let {
		title,
		icon,
		id,
		level = 2,
		extra,
		children,
		class: klass = ''
	}: {
		title: string;
		icon?: string;
		id?: string;
		level?: 2 | 3;
		extra?: Snippet;
		children: Snippet;
		class?: string;
	} = $props();

	const uid = $props.id();
	const headId = $derived(id ? `${id}-rubrik` : `box-${uid}`);
</script>

<section class="box {klass}" {id} aria-labelledby={headId}>
	<div class="box-head">
		<svelte:element this={`h${level}`} id={headId} class="box-title">
			{#if icon}<Icon name={icon} size={14} />{/if}
			{title}
		</svelte:element>
		{#if extra}<div class="box-extra">{@render extra()}</div>{/if}
	</div>
	<div class="box-body">
		{@render children()}
	</div>
</section>

<style>
	.box {
		background: var(--surface);
		border: 1px solid var(--head-border);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-sm);
		overflow: clip;
		min-width: 0;
	}

	.box-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-2);
		padding: 6px var(--space-3);
		background: linear-gradient(to bottom, var(--head-from), var(--head-to));
		border-bottom: 1px solid var(--head-border);
		min-height: 36px;
	}

	.box-title {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		margin: 0;
		font-family: var(--font-display);
		font-weight: 400;
		font-size: 1.375rem;
		line-height: 1.1;
		letter-spacing: 0.01em;
		color: var(--head-text);
		text-transform: none;
	}

	.box-extra {
		font-size: var(--text-xs);
		color: var(--head-text);
	}

	.box-body {
		padding: var(--space-3);
	}
</style>
