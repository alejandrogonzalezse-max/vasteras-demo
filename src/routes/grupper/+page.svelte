<script lang="ts">
	import { SITE_NAME } from '#lib/config.ts';
	import { groups, users } from '#lib/mock.ts';
	import { demo, whenLabel } from '#lib/state.svelte.ts';
	import Avatar from '#lib/components/Avatar.svelte';
	import Box from '#lib/components/Box.svelte';
	import Icon from '#lib/components/Icon.svelte';

	/** Några påhittade medlemmar per grupp, för medlemsraden. */
	function membersOf(id: string) {
		const start = [...id].reduce((n, c) => n + c.charCodeAt(0), 0) % users.length;
		return [...users.slice(start), ...users.slice(0, start)].filter((u) => !u.mod).slice(0, 5);
	}

	function nextMeet(id: string) {
		return demo.allActivities
			.filter((a) => a.groupId === id && demo.minutesUntil(a) >= 0)
			.sort((x, y) => demo.minutesUntil(x) - demo.minutesUntil(y))[0];
	}

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
				<div class="members">
					<span class="av-stack" aria-hidden="true">
						{#each membersOf(g.id) as m (m.id)}<Avatar id={m.id} size={30} />{/each}
					</span>
					<span class="xs muted">{membersOf(g.id).slice(0, 2).map((m) => m.name).join(', ')} m.fl.</span>
				</div>
				{#if nextMeet(g.id)}
					{@const n = nextMeet(g.id)!}
					<p class="small next"><Icon name="calendar" size={12} /> Nästa träff: <a href={`/anslagstavlan#lapp-${n.id}`}>{n.title}</a> <span class="muted">({whenLabel(demo.minutesUntil(n), demo.now)})</span></p>
				{/if}
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

	.members {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		margin-bottom: var(--space-2);
	}

	.av-stack {
		display: inline-flex;
	}

	.av-stack :global(.av + .av) {
		margin-left: -8px;
	}

	.next {
		margin-bottom: var(--space-3);
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
