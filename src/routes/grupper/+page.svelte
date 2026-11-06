<script lang="ts">
	import { SITE_NAME } from '#lib/config.ts';
	import { groups } from '#lib/mock.ts';
	import { demo } from '#lib/state.svelte.ts';
	import Box from '#lib/components/Box.svelte';
	import Icon from '#lib/components/Icon.svelte';

	function act(id: string, open: boolean) {
		const cur = demo.d.groups[id];
		if (cur) delete demo.d.groups[id];
		else demo.d.groups[id] = open ? 'member' : 'pending';
	}
</script>

<svelte:head><title>Grupper – {SITE_NAME}</title></svelte:head>

<div class="page-head">
	<h1>Grupper</h1>
	<p>Öppna grupper kan alla gå med i direkt. Slutna grupper har egna moderatorer som läser din ansökan – och måste motivera om de säger nej.</p>
</div>

<ul class="plain cards groups">
	{#each groups as g (g.id)}
		{@const status = demo.d.groups[g.id]}
		<li>
			<Box title={g.name} icon={g.icon} level={2}>
				{#snippet extra()}
					<span class="kind">
						<Icon name={g.open ? 'globe' : 'lock'} size={12} />
						{g.open ? 'Öppen' : 'Sluten'}
					</span>
				{/snippet}
				<p class="small muted"><span class="num">{g.members + (status === 'member' ? 1 : 0)}</span> medlemmar</p>
				<p>{g.text}</p>
				{#if g.note}<p class="xs note"><Icon name="flag" size={10} /> {g.note}</p>{/if}
				<div class="g-act">
					{#if status === 'member'}
						<span class="tag"><Icon name="check" size={10} /> Du är med</span>
						<button type="button" class="linkbtn small" onclick={() => act(g.id, g.open)}>Lämna gruppen</button>
					{:else if status === 'pending'}
						<p class="small pending" role="status"><span class="dot away"></span> <em>Ansökan skickad – inväntar gruppens moderatorer</em></p>
						<button type="button" class="linkbtn small" onclick={() => act(g.id, g.open)}>Dra tillbaka</button>
					{:else}
						<button type="button" class="btn btn-small" class:btn-primary={g.open} onclick={() => act(g.id, g.open)}>
							{g.open ? 'Gå med' : 'Ansök'}
						</button>
					{/if}
				</div>
			</Box>
		</li>
	{/each}
</ul>

<style>
	.groups {
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr));
	}

	.groups li {
		display: grid;
	}

	.groups li > :global(.box) {
		display: flex;
		flex-direction: column;
	}

	.groups li > :global(.box > .box-body) {
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	.kind {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		font-weight: 700;
	}

	.note {
		padding: 4px 8px;
		background: var(--warn-soft);
		border: 1px solid var(--demo-border);
		border-radius: var(--radius-sm);
	}

	.g-act {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-2);
		margin-top: auto;
	}

	.pending {
		display: flex;
		align-items: center;
		gap: 6px;
		margin: 0;
	}
</style>
