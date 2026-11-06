<script lang="ts">
	let {
		total,
		current = $bindable(1),
		label = 'Sidor',
		onchange
	}: { total: number; current?: number; label?: string; onchange?: (n: number) => void } = $props();

	function go(n: number) {
		current = Math.min(total, Math.max(1, n));
		onchange?.(current);
	}
</script>

{#if total > 1}
	<nav class="pager" aria-label={label}>
		<span class="pager-label">Sida {current} av {total}</span>
		{#if current > 1}
			<button type="button" class="pg" onclick={() => go(current - 1)}>« Föreg.</button>
		{/if}
		{#each Array.from({ length: total }, (_, i) => i + 1) as n (n)}
			<button
				type="button"
				class="pg num"
				class:on={n === current}
				aria-current={n === current ? 'page' : undefined}
				aria-label={`Sida ${n}`}
				onclick={() => go(n)}>{n}</button
			>
		{/each}
		{#if current < total}
			<button type="button" class="pg" onclick={() => go(current + 1)}>Nästa »</button>
		{/if}
	</nav>
{/if}

<style>
	.pager {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 4px;
		font-size: var(--text-xs);
	}

	.pager-label {
		padding: 4px 8px;
		color: var(--head-text);
		background: linear-gradient(to bottom, var(--head-from), var(--head-to));
		border: 1px solid var(--head-border);
		border-radius: var(--radius-sm);
	}

	.pg {
		min-width: 32px;
		min-height: 32px;
		padding: 2px 8px;
		font: inherit;
		color: var(--link);
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		cursor: pointer;
		text-decoration: underline;
	}

	.pg.num {
		font-family: var(--font-pixel);
		text-decoration: none;
	}

	.pg:hover {
		border-color: var(--border-strong);
	}

	.pg.on {
		color: var(--accent-text);
		background: var(--accent);
		border-color: var(--accent);
		cursor: default;
	}
</style>
