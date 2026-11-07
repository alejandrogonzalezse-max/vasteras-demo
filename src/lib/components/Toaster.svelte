<script lang="ts">
	import { demo } from '#lib/state.svelte.ts';
	import Icon from './Icon.svelte';
</script>

<div class="toaster" role="status" aria-live="polite" aria-atomic="false">
	{#each demo.toasts as t (t.id)}
		<div class="toast">
			<span class="t-icon" aria-hidden="true"><Icon name="star" size={14} /></span>
			<p>
				{t.text}
				{#if t.href}<a href={t.href} onclick={() => demo.dismiss(t.id)}>{t.linkText ?? 'Visa'}</a>{/if}
			</p>
			<button type="button" class="close" aria-label="Stäng notisen" onclick={() => demo.dismiss(t.id)}>×</button>
		</div>
	{/each}
</div>

<style>
	.toaster {
		position: fixed;
		right: 16px;
		bottom: 16px;
		z-index: 1000;
		display: grid;
		gap: 8px;
		width: min(380px, calc(100vw - 32px));
		pointer-events: none;
	}

	/* Lägg notiserna ovanför rundturens ruta när den visas. */
	:global(body:has([data-testid='tour'])) .toaster {
		bottom: 260px;
	}

	.toast {
		display: grid;
		grid-template-columns: auto 1fr auto;
		align-items: start;
		gap: 10px;
		padding: 10px 8px 10px 12px;
		font-size: var(--text-sm);
		color: var(--text);
		background: var(--surface);
		border: 1px solid var(--head-border);
		border-left: 4px solid var(--accent);
		border-radius: var(--radius);
		box-shadow: var(--shadow);
		pointer-events: auto;
		animation: pop var(--speed) var(--ease);
	}

	.toast p {
		margin: 0;
	}

	.toast a {
		margin-left: 4px;
		font-weight: 700;
		white-space: nowrap;
	}

	.t-icon {
		display: grid;
		place-items: center;
		width: 24px;
		height: 24px;
		color: var(--accent-text);
		background: var(--accent);
		border-radius: var(--radius-sm);
	}

	.close {
		width: 32px;
		height: 32px;
		margin: -4px 0;
		font-size: 20px;
		line-height: 1;
		color: var(--text-muted);
		background: none;
		border: 0;
		border-radius: var(--radius-sm);
		cursor: pointer;
	}

	.close:hover {
		color: var(--text);
		background: var(--surface-2);
	}

	@keyframes pop {
		from {
			opacity: 0;
			transform: translateY(8px) scale(0.98);
		}
	}
</style>
