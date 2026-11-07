<script lang="ts">
	import { SITE_NAME } from '#lib/config.ts';
	import { userById } from '#lib/mock.ts';
	import { membersOf as groupMembers } from '#lib/groups.ts';
	import Scene from '#lib/components/Scene.svelte';
	import UserImage from '#lib/components/UserImage.svelte';
	import { demo, whenLabel } from '#lib/state.svelte.ts';
	import Avatar from '#lib/components/Avatar.svelte';
	import Box from '#lib/components/Box.svelte';
	import Icon from '#lib/components/Icon.svelte';

	/** Några påhittade medlemmar per grupp, för medlemsraden. */
	function membersOf(id: string) {
		const g = demo.findGroup(id);
		return g ? groupMembers(g).slice(0, 5).map((m) => userById(m)!).filter(Boolean) : [];
	}

	const mine = $derived(demo.allGroups.filter((g) => demo.d.groups[g.id]));

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
	<p class="head-cta"><a class="btn btn-primary" href="/grupper/ny" data-testid="start-group"><Icon name="plus" size={12} /> Starta en grupp</a></p>
</div>

<section class="mine" aria-labelledby="mina-rubrik">
	<h2 class="sec display" id="mina-rubrik">Dina grupper</h2>
	{#if mine.length}
		<ul class="plain mine-list">
			{#each mine as g (g.id)}
				<li>
					<a href={`/grupp/${g.id}`} class="mine-card">
						<span class="thumb">{#if g.cover}<UserImage id={g.cover.id} alt="" square />{:else}<Scene scene={g.scene ?? 'kubb'} alt={null} />{/if}</span>
						<span><strong>{g.name}</strong><br /><span class="xs muted">{demo.d.groups[g.id] === 'mod' ? 'Du är moderator' : demo.d.groups[g.id] === 'pending' ? 'Ansökan skickad' : 'Du är med'}</span></span>
					</a>
				</li>
			{/each}
		</ul>
	{:else}
		<p class="empty">Du är inte med i någon grupp än. Gå med i en nedanför – eller <a href="/grupper/ny">starta en egen</a>.</p>
	{/if}
</section>

<h2 class="sec display">Alla grupper</h2>
<ul class="plain cards groups">
	{#each demo.allGroups as g (g.id)}
		{@const status = demo.d.groups[g.id]}
		<li>
			<Box title={g.name} icon={g.icon} level={3}>
				{#snippet extra()}
					<span class="kind">
						<Icon name={g.open ? 'globe' : 'lock'} size={12} />
						{g.open ? 'Öppen' : 'Sluten'}
					</span>
				{/snippet}
				{@const n = g.mine ? groupMembers(g).length : g.members + (status === 'member' ? 1 : 0)}
				<p class="small muted"><span class="num">{n}</span> {n === 1 ? 'medlem' : 'medlemmar'}</p>
				<p>{g.text}</p>
				<p class="small"><a href={`/grupp/${g.id}`}>Till gruppens sida ›</a></p>
				<div class="members">
					<span class="av-stack" aria-hidden="true">
						{#each membersOf(g.id) as m (m.id)}<Avatar id={m.id} size={30} />{/each}
					</span>
					<span class="xs muted">{membersOf(g.id).slice(0, 2).map((m) => m.name).join(', ')} m.fl.</span>
				</div>
				{#if nextMeet(g.id)}
					{@const n = nextMeet(g.id)!}
					<p class="small next"><Icon name="calendar" size={12} /> Nästa träff: <a href={`/lapp/${n.id}`}>{n.title}</a> <span class="muted">({whenLabel(demo.minutesUntil(n), demo.now)})</span></p>
				{/if}
				{#if g.note}<p class="xs note"><Icon name="flag" size={10} /> {g.note}</p>{/if}
				<div class="g-act">
					{#if status === 'mod'}
						<span class="tag warn">Du är moderator</span>
					{:else if status === 'member'}
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
	.sec {
		font-size: var(--text-xl);
		margin: var(--space-4) 0 var(--space-2);
	}

	.mine-list {
		display: grid;
		gap: var(--space-2);
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 240px), 1fr));
	}

	.mine-card {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-2);
		background: var(--surface);
		border: 1px solid var(--head-border);
		border-radius: var(--radius-lg);
		text-decoration: none;
	}

	.mine-card:hover strong {
		text-decoration: underline;
	}

	.thumb {
		flex: none;
		width: 56px;
		padding: 2px;
		background: var(--photo-frame);
		border: 1px solid var(--border);
	}

	.empty {
		padding: var(--space-3);
		background: var(--surface);
		border: 1px dashed var(--head-border);
		border-radius: var(--radius-lg);
	}

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
