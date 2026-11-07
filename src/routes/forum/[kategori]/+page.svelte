<script lang="ts">
	import { agoLabel } from '#lib/time.ts';
	import { SITE_NAME } from '#lib/config.ts';
	import { demo } from '#lib/state.svelte.ts';
	import Pager from '#lib/components/Pager.svelte';
	import UserLink from '#lib/components/UserLink.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let pageNo = $state(1);
</script>

<svelte:head><title>{data.cat.name} – Forum – {SITE_NAME}</title></svelte:head>

<p class="crumbs small"><a href="/forum">Forum</a> › {data.cat.name}</p>
<div class="page-head">
	<h1>{data.cat.name}</h1>
	<p>{data.cat.text}</p>
</div>

<div class="ttable">
	<div class="thead">
		<span>Ämne / Startad av</span><span class="c">Svar</span><span class="c">Visningar</span><span>Senaste inlägg</span>
	</div>
	{#each data.threads as t (t.id)}
		<div class="trow">
			<span><a href={`/forum/trad/${t.id}`}><strong>{t.title}</strong></a><br /><span class="xs">av <UserLink id={t.by} /></span></span>
			<span class="c num"><span class="lbl">Svar:&nbsp;</span>{t.posts.length - 1 + (demo.d.forumReplies[t.id]?.length ?? 0)}</span>
			<span class="c num"><span class="lbl">Visningar:&nbsp;</span>{t.views}</span>
			<span class="xs muted">{agoLabel(t.posts[t.posts.length - 1].ago, demo.now)}</span>
		</div>
	{/each}
</div>
<div class="pg"><Pager total={1} bind:current={pageNo} /><span class="xs muted">Sida 1 av 1 · {data.threads.length} trådar</span></div>

<style>
	.crumbs {
		margin-bottom: var(--space-2);
	}

	.ttable {
		border: 1px solid var(--head-border);
		border-radius: var(--radius-lg);
		overflow: hidden;
		background: var(--surface);
	}

	.thead,
	.trow {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 70px 90px 140px;
		gap: var(--space-2);
		align-items: center;
		padding: var(--space-2) var(--space-3);
	}

	.thead {
		font-family: var(--font-display);
		font-size: var(--text-lg);
		color: var(--head-text);
		background: linear-gradient(to bottom, var(--head-from), var(--head-to));
		border-bottom: 1px solid var(--head-border);
	}

	.trow + .trow {
		border-top: 1px solid var(--border);
	}

	.trow:nth-child(odd) {
		background: var(--surface-2);
	}

	.c {
		text-align: center;
	}

	.lbl {
		display: none;
	}

	.pg {
		margin-top: var(--space-3);
	}

	@media (max-width: 680px) {
		.thead {
			display: none;
		}

		.trow {
			grid-template-columns: auto auto 1fr;
		}

		.trow > :first-child {
			grid-column: 1 / -1;
		}

		.c {
			text-align: left;
			font-size: var(--text-xs);
		}

		.lbl {
			display: inline;
			font-family: var(--font-body);
		}
	}
</style>
