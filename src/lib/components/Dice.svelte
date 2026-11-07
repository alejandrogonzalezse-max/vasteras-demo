<script lang="ts">
	import { goto } from '$app/navigation';
	import { roll, topChances, type Weighted } from '#lib/dice.ts';
	import { ideas, seasonPresets, type Activity } from '#lib/mock.ts';
	import { demo, whenLabel } from '#lib/state.svelte.ts';
	import Box from './Box.svelte';
	import Icon from './Icon.svelte';

	let result = $state<Weighted | null>(null);
	let face = $state(5);
	let rolling = $state(false);
	let bored = $state<Activity | null | undefined>(undefined);
	let tipOpen = $state(false);
	let tipText = $state('');
	let tipSent = $state(false);
	let live = $state('');

	const ctx = $derived(demo.season);
	const chances = $derived(topChances(ideas, ctx, 6));
	const weatherIcon = $derived(
		{ regn: 'rain', snö: 'snow', sol: 'sun', moln: 'cloud' }[ctx.weather]
	);

	const PIPS: Record<number, number[]> = {
		1: [4],
		2: [0, 8],
		3: [0, 4, 8],
		4: [0, 2, 6, 8],
		5: [0, 2, 4, 6, 8],
		6: [0, 2, 3, 5, 6, 8]
	};

	function doRoll() {
		if (rolling) return;
		bored = undefined;
		const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		rolling = !reduce;
		live = 'Tärningen rullar…';
		let ticks = 0;
		const finish = () => {
			const r = roll(ideas, ctx, result?.idea.id);
			result = r;
			face = 1 + Math.floor(Math.random() * 6);
			rolling = false;
			demo.d.lastIdea = r.idea.id;
			live = `Tärningen visar: ${r.idea.text}`;
		};
		if (reduce) return finish();
		const t = setInterval(() => {
			face = 1 + Math.floor(Math.random() * 6);
			if (++ticks > 7) {
				clearInterval(t);
				finish();
			}
		}, 70);
	}

	function takeInitiative() {
		if (!result) return;
		demo.d.draft = { title: result.idea.text, place: result.idea.place ?? '', bring: result.idea.bring ?? '' };
		goto('/anslagstavlan#ny-lapp');
	}

	function imBored() {
		const soon = demo.allActivities
			.map((a) => ({ a, m: demo.minutesUntil(a) }))
			.filter(({ m }) => m >= 0 && m <= 180)
			.sort((x, y) => x.m - y.m);
		bored = soon[0]?.a ?? null;
	}

	function sendTip(e: SubmitEvent) {
		e.preventDefault();
		const text = tipText.trim();
		if (!text) return;
		demo.addToQueue({
			id: 'tip-' + Math.random().toString(36).slice(2, 7),
			type: 'tärningsidé',
			title: `Tärningsidé: "${text}"`,
			detail: `Tips från dig. Föreslagen säsong: ${ctx.season}.`,
			from: 'Tips från Gubben940 (du)',
			approve: { label: 'Lägg i tärningen', message: `Hej! Din idé "${text}" finns nu i tärningen. Tack!` },
			remove: {
				label: 'Avslå',
				message: `Hej! Vi har inte lagt till idén "${text}". Regel 6: Tärningen ska bara innehålla lagliga och säkra idéer. Tycker du att vi gjort fel? Svara inom 14 dagar så tittar en annan moderator på det.`,
				logReason: 'tärningsidé avslogs'
			}
		});
		tipText = '';
		tipSent = true;
	}
</script>

<Box title="Tärningen" icon="dice" id="tarningen">
	{#snippet extra()}
		<label class="season">
			<span>Demo-säsong</span>
			<select bind:value={demo.d.seasonId} onchange={() => (result = null)}>
				{#each seasonPresets as s (s.id)}<option value={s.id}>{s.label}</option>{/each}
			</select>
		</label>
	{/snippet}

	<p class="ctx small">
		<Icon name={weatherIcon} size={14} />
		<span>{ctx.dateText} · <span class="num">{ctx.temp}°</span> · {ctx.weatherText}{ctx.holidayText ? ` · ${ctx.holidayText}` : ''}</span>
		<span class="tag warn">påhittat väder</span>
	</p>

	<div class="dice-row">
		<button
			type="button"
			class="die"
			class:rolling
			onclick={doRoll}
			aria-label="Slå tärningen"
			data-testid="dice"
		>
			<span class="face" aria-hidden="true">
				{#each Array(9) as _, i (i)}<span class="pip" class:on={PIPS[face].includes(i)}></span>{/each}
			</span>
		</button>
		<div class="result" aria-live="polite">
			{#if result}
				<p class="label display">Tärningen säger:</p>
				<p class="idea" data-testid="idea">{result.idea.text}</p>
				{#if result.idea.place || result.idea.bring}
					<p class="small muted">
						{#if result.idea.place}<Icon name="pin" size={12} /> {result.idea.place}{/if}
						{#if result.idea.bring} · Ta med: {result.idea.bring}{/if}
					</p>
				{/if}
				{#if result.reasons.length}
					<p class="why xs">Därför nu: {result.reasons.join(' · ')}</p>
				{/if}
			{:else}
				<p class="label display">Vad ska vi hitta på?</p>
				<p class="idea muted">Klicka på tärningen.</p>
				<p class="small muted">Den väljer bland {ideas.length} idéer och tar hänsyn till årstid, väder och högtid.</p>
			{/if}
		</div>
	</div>
	<span class="sr-only" role="status">{live}</span>

	<div class="row actions">
		<button type="button" class="btn btn-primary" onclick={takeInitiative} disabled={!result}>
			<Icon name="plus" size={12} /> Ta initiativet
		</button>
		<button type="button" class="btn" onclick={imBored}><Icon name="clock" size={12} /> Jag har tråkigt nu</button>
		<button type="button" class="btn" onclick={doRoll}><Icon name="dice" size={12} /> Slå igen</button>
	</div>

	{#if bored !== undefined}
		<div class="bored" role="status">
			{#if bored}
				<p class="small"><strong>Det här händer redan snart:</strong></p>
				<p class="bored-title">{bored.title}</p>
				<p class="small muted">{whenLabel(demo.minutesUntil(bored), demo.now)} · {bored.place}</p>
				<a href={`/kartan?nal=${bored.id}`}>Visa nålen på kartan</a> ·
				<a href={`/anslagstavlan#lapp-${bored.id}`}>Till lappen</a>
			{:else}
				<p class="small">Inget startar inom tre timmar. Slå tärningen och ta initiativet själv!</p>
			{/if}
		</div>
	{/if}

	<div class="foot">
		{#if !tipOpen}
			<button type="button" class="linkbtn small" onclick={() => { tipOpen = true; tipSent = false; }} aria-expanded="false">Tipsa om en tärningsidé</button>
		{:else}
			<form class="tip" onsubmit={sendTip}>
				<label for="tip" class="label">Din idé till tärningen</label>
				<div class="tip-row">
					<input id="tip" type="text" maxlength="80" bind:value={tipText} placeholder="t.ex. Minigolf på Lövudden" />
					<button type="submit" class="btn">Skicka</button>
				</div>
				<p class="hint">Moderatorerna kollar att idén är laglig och säker innan den hamnar i tärningen.</p>
				{#if tipSent}<p class="notice ok" role="status">Tack! Tipset ligger nu i <a href="/moderering">moderatorkön</a>.</p>{/if}
			</form>
		{/if}
		<details class="how">
			<summary class="small">Så funkar tärningen</summary>
			<p class="small">Varje idé får en vikt: ×3 om den passar årstiden, ×10 vid rätt högtid, ×2,5 för inomhus när det regnar och nästan noll om det är för kallt eller saknas snö. Mest troligt just nu:</p>
			<ol class="small chances">
				{#each chances as c (c.idea.id)}<li>{c.idea.text} <span class="num muted">{String(c.pct).replace('.', ',')} %</span></li>{/each}
			</ol>
		</details>
	</div>
</Box>

<style>
	.season {
		display: flex;
		align-items: center;
		gap: 6px;
		font-family: var(--font-body);
	}

	.season select {
		width: auto;
		min-height: 30px;
		padding: 2px 6px;
		font-size: var(--text-xs);
	}

	@media (max-width: 520px) {
		.season span {
			position: absolute;
			width: 1px;
			height: 1px;
			overflow: hidden;
			clip: rect(0, 0, 0, 0);
			white-space: nowrap;
		}
	}

	.ctx {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 6px;
		margin-bottom: var(--space-3);
		color: var(--text-muted);
	}

	.dice-row {
		display: flex;
		align-items: center;
		gap: var(--space-4);
		margin-bottom: var(--space-3);
	}

	@media (max-width: 480px) {
		.dice-row {
			flex-direction: column;
			align-items: flex-start;
			gap: var(--space-3);
		}
	}

	.die {
		flex: none;
		width: 112px;
		height: 112px;
		padding: 12px;
		background: linear-gradient(145deg, #ffffff, #e4e9f2);
		border: 2px solid var(--border-strong);
		border-radius: 18px;
		box-shadow:
			inset -5px -6px 0 rgb(0 0 0 / 0.1),
			0 4px 0 var(--border-strong),
			var(--shadow);
		cursor: pointer;
		transition: transform var(--speed-fast) var(--ease), box-shadow var(--speed-fast) var(--ease);
	}

	.die:hover {
		transform: translateY(-2px) rotate(-2deg);
	}

	.die:active {
		transform: translateY(3px);
		box-shadow:
			inset -5px -6px 0 rgb(0 0 0 / 0.1),
			0 1px 0 var(--border-strong);
	}

	.die.rolling {
		animation: roll 560ms var(--ease);
	}

	@keyframes roll {
		0% { transform: rotate(0) translateY(0); }
		25% { transform: rotate(-25deg) translateY(-10px); }
		50% { transform: rotate(20deg) translateY(0); }
		75% { transform: rotate(-10deg) translateY(-4px); }
		100% { transform: rotate(0) translateY(0); }
	}

	.face {
		display: grid;
		grid-template: repeat(3, 1fr) / repeat(3, 1fr);
		width: 100%;
		height: 100%;
		place-items: center;
	}

	.pip {
		width: 16px;
		height: 16px;
		border-radius: 3px;
	}

	.pip.on {
		background: #172033;
		box-shadow: inset 2px 2px 0 rgb(255 255 255 / 0.25);
	}

	.result {
		min-width: 0;
	}

	.label {
		margin: 0 0 4px;
		font-size: var(--text-lg);
		color: var(--head-text);
	}

	.idea {
		margin: 0 0 4px;
		font-size: var(--text-xl);
		font-weight: 700;
		line-height: 1.25;
	}

	.why {
		margin: 4px 0 0;
		color: var(--text-muted);
		font-style: italic;
	}

	.actions {
		margin-bottom: var(--space-2);
	}

	.bored {
		margin-top: var(--space-2);
		padding: var(--space-3);
		background: var(--accent-soft);
		border: 1px dashed var(--head-border);
		border-radius: var(--radius);
	}

	.bored p {
		margin: 0 0 4px;
	}

	.bored-title {
		font-weight: 700;
		font-size: var(--text-lg);
	}

	.foot {
		display: grid;
		gap: var(--space-2);
		margin-top: var(--space-3);
		padding-top: var(--space-2);
		border-top: 1px dashed var(--border);
	}

	.foot > button {
		justify-self: start;
	}

	.tip-row {
		display: flex;
		gap: var(--space-2);
		margin: 4px 0;
	}

	.tip p {
		margin: 4px 0 0;
	}

	.how summary {
		cursor: pointer;
		color: var(--link);
		text-decoration: underline;
	}

	.how p {
		margin: var(--space-2) 0;
	}

	.chances {
		margin: 0;
		padding-left: 1.4em;
	}
</style>
