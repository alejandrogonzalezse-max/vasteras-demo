<script lang="ts">
	import { agoLabel } from '#lib/time.ts';
	import { demo } from '#lib/state.svelte.ts';
	import { SITE_NAME } from '#lib/config.ts';
	import { forumCategories, forumThreads } from '#lib/mock.ts';
	import Icon from '#lib/components/Icon.svelte';

	const rows = forumCategories.map((c) => {
		const threads = forumThreads.filter((t) => t.cat === c.id);
		return { c, threads: threads.length, posts: threads.reduce((s, t) => s + t.posts.length, 0), latest: threads[0] };
	});
</script>

<svelte:head><title>Forum – {SITE_NAME}</title></svelte:head>

<div class="page-head">
	<h1>Forum</h1>
	<p>Snack om stan, utan reklam och utan rikspolitik. Trådar sorteras efter senaste svar – aldrig efter vad som "engagerar".</p>
</div>

<div class="ftable" role="table" aria-label="Forumkategorier">
	<div class="fhead" role="row">
		<span role="columnheader">Kategori</span>
		<span role="columnheader" class="c">Trådar</span>
		<span role="columnheader" class="c">Inlägg</span>
		<span role="columnheader">Senaste tråd</span>
	</div>
	{#each rows as r (r.c.id)}
		<div class="frow" role="row">
			<span role="cell" class="cat">
				<span class="ficon"><Icon name="forum" size={16} /></span>
				<span>
					<a href={`/forum/${r.c.id}`}><strong>{r.c.name}</strong></a>
					<span class="xs muted desc">{r.c.text}</span>
				</span>
			</span>
			<span role="cell" class="c num"><span class="lbl">Trådar:&nbsp;</span>{r.threads}</span>
			<span role="cell" class="c num"><span class="lbl">Inlägg:&nbsp;</span>{r.posts}</span>
			<span role="cell" class="small last">
				{#if r.latest}<a href={`/forum/trad/${r.latest.id}`}>{r.latest.title}</a><br /><span class="xs muted">{agoLabel(r.latest.posts[r.latest.posts.length - 1].ago, demo.now)}</span>{/if}
			</span>
		</div>
	{/each}
</div>

<style>
	.ftable {
		border: 1px solid var(--head-border);
		border-radius: var(--radius-lg);
		overflow: hidden;
		background: var(--surface);
	}

	.fhead,
	.frow {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 80px 80px minmax(0, 0.8fr);
		gap: var(--space-2);
		align-items: center;
		padding: var(--space-2) var(--space-3);
	}

	.fhead {
		font-family: var(--font-display);
		font-size: var(--text-lg);
		color: var(--head-text);
		background: linear-gradient(to bottom, var(--head-from), var(--head-to));
		border-bottom: 1px solid var(--head-border);
	}

	.frow + .frow {
		border-top: 1px solid var(--border);
	}

	.frow:nth-child(odd) {
		background: var(--surface-2);
	}

	.c {
		text-align: center;
	}

	.cat {
		display: flex;
		gap: var(--space-2);
		align-items: flex-start;
	}

	.desc {
		display: block;
	}

	.ficon {
		display: grid;
		place-items: center;
		width: 32px;
		height: 32px;
		flex: none;
		color: var(--head-text);
		background: var(--accent-soft);
		border: 1px solid var(--head-border);
		border-radius: var(--radius-sm);
	}

	.lbl {
		display: none;
	}

	@media (max-width: 680px) {
		.fhead {
			display: none;
		}

		.frow {
			grid-template-columns: 1fr 1fr;
		}

		.cat,
		.last {
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
