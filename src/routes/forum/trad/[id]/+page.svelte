<script lang="ts">
	import { SITE_NAME, ME_ID } from '#lib/config.ts';
	import { userById } from '#lib/mock.ts';
	import { demo } from '#lib/state.svelte.ts';
	import Avatar from '#lib/components/Avatar.svelte';
	import Pager from '#lib/components/Pager.svelte';
	import UserLink from '#lib/components/UserLink.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const PER = 5;
	let pageNo = $state(1);
	let reply = $state('');

	const all = $derived([...data.thread.posts, ...(demo.d.forumReplies[data.thread.id] ?? [])]);
	const pages = $derived(Math.max(1, Math.ceil(all.length / PER)));
	const shown = $derived(all.slice((pageNo - 1) * PER, pageNo * PER).map((p, i) => ({ ...p, n: (pageNo - 1) * PER + i + 1 })));

	function send(e: SubmitEvent) {
		e.preventDefault();
		if (!reply.trim()) return;
		const list = demo.d.forumReplies[data.thread.id] ?? [];
		demo.d.forumReplies[data.thread.id] = [...list, { by: ME_ID, ago: 'nyss', text: reply.trim() }];
		reply = '';
		pageNo = Math.ceil((all.length + 1) / PER);
	}
</script>

<svelte:head><title>{data.thread.title} – Forum – {SITE_NAME}</title></svelte:head>

<p class="crumbs small"><a href="/forum">Forum</a> › <a href={`/forum/${data.cat.id}`}>{data.cat.name}</a></p>
<div class="page-head">
	<h1 class="thread-title">{data.thread.title}</h1>
	<p class="small"><span class="num">{all.length}</span> inlägg · <span class="num">{data.thread.views}</span> visningar</p>
</div>

<div class="pg"><Pager total={pages} bind:current={pageNo} label="Trådens sidor (överst)" /></div>

<ol class="plain posts">
	{#each shown as p (p.n)}
		{@const u = userById(p.by)}
		<li class="post">
			<div class="post-bar xs">
				<span>{p.ago}</span>
				<span class="num">#{p.n}</span>
			</div>
			<div class="post-grid">
				<div class="author">
					<Avatar id={p.by} size={56} />
					<UserLink id={p.by} />
					<span class="xs muted">{u?.area}</span>
					<span class="xs muted">Medlem sedan {u?.joined}</span>
				</div>
				<div class="post-text">{p.text}</div>
			</div>
		</li>
	{/each}
</ol>

<div class="pg"><Pager total={pages} bind:current={pageNo} label="Trådens sidor (nederst)" /></div>

<form class="reply" onsubmit={send}>
	<label for="reply" class="label">Svara i tråden</label>
	<textarea id="reply" bind:value={reply} maxlength="1000"></textarea>
	<div class="row">
		<button type="submit" class="btn btn-primary">Skicka svar</button>
		<span class="xs muted">Håll god ton. Ingen reklam, ingen rikspolitik.</span>
	</div>
</form>

<style>
	.crumbs {
		margin-bottom: var(--space-2);
	}

	.thread-title {
		font-family: var(--font-body);
		font-weight: 700;
		font-size: var(--text-2xl);
	}

	.pg {
		margin: var(--space-3) 0;
	}

	.posts {
		display: grid;
		gap: var(--space-3);
	}

	.post {
		background: var(--surface);
		border: 1px solid var(--head-border);
		border-radius: var(--radius);
		overflow: hidden;
	}

	.post-bar {
		display: flex;
		justify-content: space-between;
		padding: 4px var(--space-3);
		color: var(--head-text);
		background: linear-gradient(to bottom, var(--head-from), var(--head-to));
		border-bottom: 1px solid var(--head-border);
	}

	.post-grid {
		display: grid;
		grid-template-columns: 160px minmax(0, 1fr);
	}

	.author {
		display: grid;
		gap: 4px;
		align-content: start;
		justify-items: start;
		padding: var(--space-3);
		background: var(--surface-2);
		border-right: 1px solid var(--border);
	}

	.post-text {
		padding: var(--space-3);
		white-space: pre-line;
	}

	@media (max-width: 600px) {
		.post-grid {
			grid-template-columns: 1fr;
		}

		.author {
			grid-template-columns: auto 1fr;
			align-items: center;
			border-right: 0;
			border-bottom: 1px solid var(--border);
		}

		.author :global(.av) {
			grid-row: span 3;
		}
	}

	.reply {
		display: grid;
		gap: 6px;
		margin-top: var(--space-4);
		padding: var(--space-3);
		background: var(--surface);
		border: 1px solid var(--head-border);
		border-radius: var(--radius-lg);
	}
</style>
