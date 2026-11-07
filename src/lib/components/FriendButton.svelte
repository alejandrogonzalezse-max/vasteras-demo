<script lang="ts">
	import { userById } from '#lib/mock.ts';
	import { demo } from '#lib/state.svelte.ts';
	import Icon from './Icon.svelte';

	/** compact = litet +-tecken bredvid ett namn (med text för skärmläsare). */
	let { id, compact = false }: { id: string; compact?: boolean } = $props();
	const status = $derived(demo.friendStatus(id));
	const name = $derived(userById(id)?.name ?? id);
</script>

{#if status === 'none'}
	{#if compact}
		<button type="button" class="fb-mini" onclick={() => demo.addFriend(id)} title={`Lägg till ${name} som vän`} data-testid="add-friend">
			<Icon name="plus" size={10} /><span class="sr-only">Lägg till {name} som vän</span>
		</button>
	{:else}
		<button type="button" class="btn btn-small btn-primary" onclick={() => demo.addFriend(id)} data-testid="add-friend">
			<Icon name="plus" size={10} /> Lägg till vän
		</button>
	{/if}
{:else if status === 'pending'}
	{#if compact}
		<span class="fb-state xs" data-testid="friend-pending"><span class="sr-only">{name}: </span>förfrågan skickad</span>
	{:else}
		<span class="tag warn" data-testid="friend-pending">Förfrågan skickad</span>
	{/if}
{:else if status === 'friends' && !compact}
	<span class="tag" data-testid="friend-ok"><Icon name="check" size={10} /> Vänner</span>
{/if}

<style>
	.fb-mini {
		display: inline-grid;
		place-items: center;
		width: 24px;
		height: 24px;
		margin-left: 2px;
		padding: 0;
		color: var(--accent-text);
		background: var(--accent);
		border: 0;
		border-radius: var(--radius-sm);
		cursor: pointer;
		vertical-align: middle;
	}

	.fb-mini:hover {
		background: var(--accent-hover);
	}

	.fb-state {
		margin-left: 4px;
		font-style: italic;
		color: var(--text-muted);
	}
</style>
