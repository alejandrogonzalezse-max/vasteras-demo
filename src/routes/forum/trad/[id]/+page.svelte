<script lang="ts">
	import { tick } from 'svelte';
	import { agoLabel, since } from '#lib/time.ts';
	import { SITE_NAME, ME_ID } from '#lib/config.ts';
	import { forumCategories, userById, type ForumPost } from '#lib/mock.ts';
	import { demo } from '#lib/state.svelte.ts';
	import { findGroupThread } from '#lib/groups.ts';
	import Avatar from '#lib/components/Avatar.svelte';
	import Pager from '#lib/components/Pager.svelte';
	import UserImage from '#lib/components/UserImage.svelte';
	import UserLink from '#lib/components/UserLink.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const found = $derived.by(() => {
		const t = demo.findThread(data.id);
		if (t && !t.cat.startsWith('grupp:')) return { thread: t, group: undefined };
		return findGroupThread(data.id);
	});
	const thread = $derived(found?.thread);
	const cat = $derived(thread ? forumCategories.find((c) => c.id === thread.cat) : undefined);
	const group = $derived(found?.group);

	const PER = 5;
	let pageNo = $state(1);
	let reply = $state('');
	let replyEl: HTMLTextAreaElement | undefined = $state();

	const all = $derived<ForumPost[]>(thread ? [...thread.posts, ...(demo.d.forumReplies[thread.id] ?? [])] : []);
	const pages = $derived(Math.max(1, Math.ceil(all.length / PER)));
	const shown = $derived(all.slice((pageNo - 1) * PER, pageNo * PER).map((p, i) => ({ ...p, n: (pageNo - 1) * PER + i + 1 })));

	function send(e: SubmitEvent) {
		e.preventDefault();
		if (!thread || !reply.trim()) return;
		const list = demo.d.forumReplies[thread.id] ?? [];
		demo.d.forumReplies[thread.id] = [...list, { by: ME_ID, ago: 'nyss', at: Date.now(), text: reply.trim() }];
		reply = '';
		pageNo = Math.ceil((all.length + 1) / PER);
	}

	/** Citera: lägger in inlägget som "> citat" i svarsrutan. */
	async function quote(p: ForumPost) {
		const name = userById(p.by)?.name ?? p.by;
		const quoted = p.text
			.split('\n')
			.filter((l) => !l.startsWith('>'))
			.join(' ')
			.slice(0, 280);
		reply = `> ${name} skrev: ${quoted}\n\n${reply}`;
		await tick();
		replyEl?.focus();
		replyEl?.setSelectionRange(reply.length, reply.length);
	}

	/** Delar upp text i citat (rader som börjar med >) och vanlig text. */
	function blocks(text: string) {
		const out: { quote: boolean; text: string }[] = [];
		for (const line of text.split('\n')) {
			const q = line.startsWith('>');
			const t = q ? line.replace(/^>\s?/, '') : line;
			const last = out[out.length - 1];
			if (last && last.quote === q) last.text += '\n' + t;
			else out.push({ quote: q, text: t });
		}
		return out.filter((b) => b.text.trim());
	}
</script>

<svelte:head><title>{thread?.title ?? 'Tråden'} – Forum – {SITE_NAME}</title></svelte:head>

{#if !thread}
	<p class="crumbs small"><a href="/forum">Forum</a></p>
	<div class="page-head">
		<h1>{demo.ready ? 'Tråden finns inte' : 'Tråden'}</h1>
		{#if demo.ready}<p>Den kan ha tagits bort, eller så finns den bara i någon annans webbläsare.</p>{/if}
	</div>
{:else}
	<p class="crumbs small">
		{#if group}<a href="/grupper">Grupper</a> › <a href={`/grupp/${group.id}`}>{group.name}</a> › Forum
		{:else}<a href="/forum">Forum</a> › <a href={`/forum/${cat?.id}`}>{cat?.name}</a>{/if}
	</p>
	<div class="page-head">
		<h1 class="thread-title">{thread.title}</h1>
		<p class="small"><span class="num">{all.length}</span> inlägg · <span class="num">{thread.views}</span> visningar</p>
	</div>

	<div class="pg"><Pager total={pages} bind:current={pageNo} label="Trådens sidor (överst)" /></div>

	<ol class="plain posts">
		{#each shown as p (p.n)}
			{@const u = userById(p.by)}
			<li class="post">
				<div class="post-bar xs">
					<span>{agoLabel(since(p, demo.now), demo.now)}</span>
					<span class="num">#{p.n}</span>
				</div>
				<div class="post-grid">
					<div class="author">
						<Avatar id={p.by} size={56} />
						<UserLink id={p.by} addFriend={p.by !== ME_ID} />
						<span class="xs muted">{u?.area}</span>
						<span class="xs muted">Medlem sedan {u?.joined}</span>
					</div>
					<div class="post-text">
						{#each blocks(p.text) as b, i (i)}
							{#if b.quote}<blockquote class="quote">{b.text}</blockquote>{:else}<p class="pt">{b.text}</p>{/if}
						{/each}
						{#if p.images?.length}
							<ul class="plain imgs">
								{#each p.images as img (img.id)}
									<li><figure><UserImage id={img.id} alt={img.alt} /><figcaption class="xs">{img.alt}</figcaption></figure></li>
								{/each}
							</ul>
						{/if}
						<button type="button" class="linkbtn xs quote-btn" onclick={() => quote(p)}>Citera</button>
					</div>
				</div>
			</li>
		{/each}
	</ol>

	<div class="pg"><Pager total={pages} bind:current={pageNo} label="Trådens sidor (nederst)" /></div>

	<form class="reply" onsubmit={send}>
		<label for="reply" class="label">Svara i tråden</label>
		<textarea id="reply" bind:value={reply} bind:this={replyEl} maxlength="1500"></textarea>
		<div class="row">
			<button type="submit" class="btn btn-primary">Skicka svar</button>
			<span class="xs muted">Håll god ton. Ingen reklam, ingen rikspolitik.</span>
		</div>
	</form>
{/if}

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

	.pt {
		margin: 0 0 var(--space-2);
	}

	.quote {
		margin: 0 0 var(--space-2);
		padding: var(--space-2) var(--space-3);
		font-size: var(--text-sm);
		color: var(--text-muted);
		background: var(--surface-2);
		border-left: 3px solid var(--head-border);
	}

	.quote-btn {
		margin-top: var(--space-2);
	}

	.imgs {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
		gap: var(--space-2);
		margin-top: var(--space-2);
		white-space: normal;
	}

	.imgs figure {
		margin: 0;
		padding: 4px;
		background: var(--photo-frame);
		border: 1px solid var(--border);
	}

	.imgs figcaption {
		margin-top: 4px;
		color: #46536a;
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
