<script lang="ts">
	import { addToCalendar, commentCount, shareLapp } from '#lib/lapp.ts';
	import LappComments from './LappComments.svelte';
	import { ME_ID } from '#lib/config.ts';
	import { groups, userById, type Activity } from '#lib/mock.ts';
	import { demo, whenLabel } from '#lib/state.svelte.ts';
	import Icon from './Icon.svelte';
	import UserLink from './UserLink.svelte';

	let {
		a,
		compact = false,
		headingLevel = 3
	}: { a: Activity; compact?: boolean; headingLevel?: 3 | 4 } = $props();

	const going = $derived(demo.isAttending(a));
	const people = $derived(demo.attendeesOf(a));
	const mins = $derived(demo.minutesUntil(a));
	const group = $derived(a.groupId ? groups.find((g) => g.id === a.groupId) : undefined);
	const isNew = $derived(a.by === ME_ID && a.id.startsWith('n'));

	const count = $derived(commentCount(a));
	let open = $state(false);
</script>

<article class="note" class:compact class:mine={isNew} aria-labelledby={`t-${a.id}`}>
	<div class="when num">{whenLabel(mins, demo.now)}</div>
	<svelte:element this={`h${headingLevel}`} class="title" id={`t-${a.id}`}><a href={`/lapp/${a.id}`} class="t-link">{a.title}</a></svelte:element>
	<p class="meta">
		<span><Icon name="pin" size={12} /> {a.place}</span>
		{#if a.recurring}<span class="tag">återkommer</span>{/if}
		{#if a.visibility === 'vänner'}<span class="tag">bara vänner</span>{/if}
		{#if group}<span class="tag">gruppen {group.name}</span>{/if}
		{#if isNew}<span class="tag warn">ny lapp</span>{/if}
	</p>
	{#if !compact}
		{#if a.text}<p class="text">{a.text}</p>{/if}
		{#if a.bring}<p class="bring"><strong>Ta med:</strong> {a.bring}</p>{/if}
		<p class="by small muted">Uppsatt av <UserLink id={a.by} addFriend /></p>
	{/if}
	<div class="act">
		<button
			type="button"
			class="btn"
			class:btn-primary={!going}
			class:btn-done={going}
			aria-pressed={going}
			onclick={() => demo.toggleAttend(a)}
		>
			{#if going}<Icon name="check" size={12} /> Du kommer ✓{:else}Jag kommer{/if}
		</button>
		<span class="count small">
			<strong class="num">{people.length}</strong> kommer{#if people.length}:{/if}
			{#each people.slice(0, compact ? 3 : 8) as id, i (id)}
				{i > 0 ? ', ' : ' '}{#if id === ME_ID}<strong>du</strong>{:else}<a href={`/profil/${id}`}>{userById(id)?.name}</a>{/if}
			{/each}{#if people.length > (compact ? 3 : 8)}&nbsp;m.fl.{/if}
		</span>
	</div>
	{#if !compact}
		<div class="tools">
			<button type="button" class="linkbtn small" aria-expanded={open} aria-controls={`c-${a.id}`} onclick={() => (open = !open)}>
				<Icon name="forum" size={12} /> Kommentarer ({count})
			</button>
			<button type="button" class="linkbtn small" onclick={() => addToCalendar(a)}><Icon name="calendar" size={12} /> Lägg i kalendern</button>
			<button type="button" class="linkbtn small" onclick={() => shareLapp(a)}><Icon name="share" size={12} /> Dela</button>
		</div>
		{#if open}
			<LappComments {a} />
		{/if}
	{/if}
</article>

<style>
	.note {
		position: relative;
		padding: var(--space-3);
		background: var(--surface-2);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		min-width: 0;
	}

	.note.mine {
		border-color: var(--accent);
		box-shadow: 0 0 0 1px var(--accent);
	}

	.when {
		font-size: var(--text-xs);
		color: var(--head-text);
		margin-bottom: 4px;
	}

	.t-link {
		color: var(--link);
		text-decoration: none;
	}

	.t-link:hover,
	.t-link:focus-visible {
		color: var(--link);
		text-decoration: underline;
	}

	.title {
		margin: 0 0 4px;
		font-size: var(--text-lg);
	}

	.compact .title {
		font-size: var(--text-md);
	}

	.meta {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 6px;
		margin: 0 0 var(--space-2);
		font-size: var(--text-sm);
		color: var(--text-muted);
	}

	.text,
	.bring {
		margin: 0 0 var(--space-2);
		font-size: var(--text-sm);
	}

	.by {
		margin: 0 0 var(--space-2);
	}

	.act {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-2) var(--space-3);
	}

	.count {
		color: var(--text-muted);
	}

	.tools {
		display: flex;
		flex-wrap: wrap;
		gap: 4px var(--space-3);
		margin-top: var(--space-2);
		padding-top: var(--space-2);
		border-top: 1px dashed var(--border);
	}

	.tools .linkbtn {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		min-height: 32px;
	}





</style>
