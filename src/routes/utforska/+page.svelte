<script lang="ts">
	import { SITE_NAME } from '#lib/config.ts';
	import { eldsjal, forumThreads, openPhotos } from '#lib/mock.ts';
	import { demo, whenLabel } from '#lib/state.svelte.ts';
	import Avatar from '#lib/components/Avatar.svelte';
	import Box from '#lib/components/Box.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import Photo from '#lib/components/Photo.svelte';
	import UserLink from '#lib/components/UserLink.svelte';

	// Hett idag: det som händer inom 24 timmar, sorterat på unika "kommer".
	const hotToday = $derived(
		demo.allActivities
			.filter((a) => {
				const m = demo.minutesUntil(a);
				return m >= -60 && m <= 24 * 60;
			})
			.map((a) => ({ a, n: demo.attendeesOf(a).length }))
			.sort((x, y) => y.n - x.n)
			.slice(0, 5)
	);

	// Veckans mest snackade: unika "kommer" + kommentarer i tidsfönstret (7 dagar).
	const talked = $derived(
		[
			...demo.allActivities.map((a) => ({
				title: a.title,
				href: `/anslagstavlan#lapp-${a.id}`,
				kind: 'Lapp',
				kommer: demo.attendeesOf(a).length,
				kommentarer: a.comments
			})),
			...forumThreads.map((t) => ({
				title: t.title,
				href: `/forum/trad/${t.id}`,
				kind: 'Forum',
				kommer: 0,
				kommentarer: t.posts.length - 1 + (demo.d.forumReplies[t.id]?.length ?? 0)
			}))
		]
			.map((x) => ({ ...x, score: x.kommer + x.kommentarer }))
			.sort((a, b) => b.score - a.score)
			.slice(0, 6)
	);

	let liked = $state<Record<string, boolean>>({});
</script>

<svelte:head><title>Utforska & Hett – {SITE_NAME}</title></svelte:head>

<div class="page-head">
	<h1>Utforska & Hett</h1>
	<p>Ingen algoritm som gissar vad du vill se. Här är listorna räknade på ett sätt som alla kan läsa – formeln står under varje lista.</p>
</div>

<div class="two">
	<Box title="Hett idag" icon="fire" id="hett">
		<ol class="rank plain">
			{#each hotToday as { a, n }, i (a.id)}
				<li>
					<span class="pos num">{i + 1}</span>
					<div>
						<a href={`/anslagstavlan#lapp-${a.id}`}><strong>{a.title}</strong></a>
						<p class="xs muted">{whenLabel(demo.minutesUntil(a), demo.now)} · {a.place}</p>
					</div>
					<span class="score num" aria-label={`${n} kommer`}>{n}</span>
				</li>
			{/each}
		</ol>
		<p class="formula xs">Formel: antal unika "Jag kommer" på lappar som startar inom 24 timmar.</p>
	</Box>

	<Box title="Veckans mest snackade" icon="forum" id="snackade">
		<ol class="rank plain">
			{#each talked as t, i (t.href)}
				<li>
					<span class="pos num">{i + 1}</span>
					<div>
						<a href={t.href}><strong>{t.title}</strong></a>
						<p class="xs muted">{t.kind} · {t.kommer} kommer + {t.kommentarer} kommentarer</p>
					</div>
					<span class="score num">{t.score}</span>
				</li>
			{/each}
		</ol>
		<p class="formula xs">Formel: <strong>poäng = unika "kommer" + kommentarer</strong>, räknat de senaste 7 dagarna. Samma person räknas bara en gång per lapp.</p>
	</Box>
</div>

<Box title="Veckans eldsjäl" icon="star" id="eldsjal" class="eld">
	<div class="eld-row">
		<Avatar id={eldsjal.user} size={88} />
		<div>
			<p class="eld-name"><UserLink id={eldsjal.user} /></p>
			<p>{eldsjal.text}</p>
			<ul class="plain stats">
				<li><span class="num">{eldsjal.stats.aktiviteter}</span> lappar</li>
				<li><span class="num">{eldsjal.stats.kommer}</span> har kommit</li>
				<li><span class="num">{eldsjal.stats.nya}</span> nya ansikten</li>
			</ul>
			<p class="xs muted">Eldsjälen väljs av medlemmarnas nomineringar, inte av siffror.</p>
		</div>
	</div>
</Box>

<Box title="Öppna fotoinlägg" icon="camera" id="foton">
	<ul class="plain grid">
		{#each openPhotos as ph (ph.id)}
			<li>
				<Photo caption={ph.caption} color={ph.color} icon={ph.icon} />
				<div class="ph-foot xs">
					<UserLink id={ph.by} />
					<button type="button" class="btn btn-small" class:btn-done={liked[ph.id]} aria-pressed={!!liked[ph.id]} onclick={() => (liked[ph.id] = !liked[ph.id])}>
						<Icon name="heart" size={10} /> {liked[ph.id] ? 'Schysst ✓' : 'Schysst'}
					</button>
				</div>
			</li>
		{/each}
	</ul>
</Box>

<style>
	.two {
		display: grid;
		gap: var(--space-4);
		margin-bottom: var(--space-4);
	}

	@media (min-width: 860px) {
		.two {
			grid-template-columns: 1fr 1fr;
		}
	}

	.rank {
		display: grid;
		gap: var(--space-2);
		margin-bottom: var(--space-3);
	}

	.rank li {
		display: grid;
		grid-template-columns: 32px minmax(0, 1fr) auto;
		gap: var(--space-2);
		align-items: center;
		padding-bottom: var(--space-2);
		border-bottom: 1px dashed var(--border);
	}

	.rank p {
		margin: 0;
	}

	.pos {
		display: grid;
		place-items: center;
		width: 28px;
		height: 28px;
		color: var(--head-text);
		background: linear-gradient(to bottom, var(--head-from), var(--head-to));
		border: 1px solid var(--head-border);
		border-radius: var(--radius-sm);
	}

	.score {
		font-size: var(--text-lg);
		color: var(--head-text);
	}

	.formula {
		margin: 0;
		padding: var(--space-2);
		background: var(--surface-sunk);
		border: 1px dashed var(--border-strong);
		border-radius: var(--radius-sm);
		font-family: ui-monospace, 'Courier New', monospace;
	}

	:global(.eld) {
		margin-bottom: var(--space-4);
	}

	.eld-row {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-3);
		align-items: flex-start;
	}

	.eld-row > div {
		flex: 1 1 260px;
	}

	.eld-name {
		font-size: var(--text-xl);
		font-weight: 700;
		margin-bottom: 4px;
	}

	.stats {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		margin-bottom: var(--space-2);
	}

	.stats li {
		padding: 4px 10px;
		font-size: var(--text-sm);
		background: var(--accent-soft);
		border: 1px solid var(--head-border);
		border-radius: var(--radius-sm);
	}

	.grid {
		display: grid;
		gap: var(--space-3);
		grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
	}

	.ph-foot {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 6px;
		margin-top: 2px;
	}
</style>
