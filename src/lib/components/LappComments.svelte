<script lang="ts">
	import type { Activity } from '#lib/mock.ts';
	import { addComment, commentsOf } from '#lib/lapp.ts';
	import { demo } from '#lib/state.svelte.ts';
	import { agoLabel, since } from '#lib/time.ts';
	import Avatar from './Avatar.svelte';
	import UserLink from './UserLink.svelte';

	let { a, addFriend = false }: { a: Activity; addFriend?: boolean } = $props();
	const thread = $derived(commentsOf(a));
	let draft = $state('');

	function send(e: SubmitEvent) {
		e.preventDefault();
		if (!draft.trim()) return;
		addComment(a, draft.trim());
		draft = '';
	}
</script>

<div class="comments" id={`c-${a.id}`}>
	{#if thread.length}
		<ul class="plain">
			{#each thread as c, i (i)}
				<li>
					<Avatar id={c.by} size={28} />
					<p><UserLink id={c.by} {addFriend} /> <span class="xs muted">{agoLabel(since(c, demo.now), demo.now)}</span><br />{c.text}</p>
				</li>
			{/each}
		</ul>
		{#if a.comments > 3}<p class="xs muted">Visar de senaste kommentarerna.</p>{/if}
	{:else}
		<p class="small muted">Inga kommentarer än. Skriv den första!</p>
	{/if}
	<form class="c-form" onsubmit={send}>
		<label class="sr-only" for={`ci-${a.id}`}>Skriv en kommentar</label>
		<input id={`ci-${a.id}`} type="text" maxlength="200" placeholder="Skriv en kommentar…" bind:value={draft} />
		<button type="submit" class="btn btn-small">Skicka</button>
	</form>
</div>

<style>
	.comments {
		margin-top: var(--space-2);
	}

	.comments ul {
		display: grid;
		gap: var(--space-2);
		margin-bottom: var(--space-2);
	}

	.comments li {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: var(--space-2);
		font-size: var(--text-sm);
	}

	.comments li p {
		margin: 0;
	}

	.c-form {
		display: flex;
		gap: var(--space-2);
	}
</style>
