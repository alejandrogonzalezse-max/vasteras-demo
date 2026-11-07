<script lang="ts">
	import { goto } from '$app/navigation';
	import { SITE_NAME, SLOGAN, TAGLINE } from '#lib/config.ts';
	import { rules } from '#lib/mock.ts';
	import { demo } from '#lib/state.svelte.ts';
	import Box from '#lib/components/Box.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import Scene from '#lib/components/Scene.svelte';
	import Avatar from '#lib/components/Avatar.svelte';

	let code = $state('');
	let email = $state('');
	let adult = $state(false);
	let error = $state('');

	const features = [
		{ icon: 'dice', title: 'Tärningen', text: 'Vet du inte vad du ska göra? Slå tärningen och få en idé som passar årstiden, vädret och helgen.' },
		{ icon: 'board', title: 'Anslagstavlan', text: 'Sätt upp en lapp: "Korvgrillning på Djäkneberget kl 18". Folk trycker "Jag kommer". Klart.' },
		{ icon: 'pin', title: 'Kartan', text: 'Se vad som händer i stan just nu, och vilka grannar som har öppen dörr – utan att avslöja var de bor.' },
		{ icon: 'book', title: 'Dagbok och gästböcker', text: 'Som förr: vänner, topp 8, gästböcker och MSN-status. Men bara för att ses på riktigt.' }
	];

	const week = [
		{ day: 'Måndag 19:00', title: 'Brädspel och te på biblioteket', place: 'Stadsbiblioteket', people: ['johanna-v', 'linnea-l', 'hampus-o'], count: 9 },
		{ day: 'Onsdag 18:00', title: 'Öppet garage – lär dig byta däck', place: 'Pettersberg (adressen får du av värden)', people: ['mopedmia', 'erik-pa-raby', 'tobbe-tillberga'], count: 5 },
		{ day: 'Fredag 21:30', title: 'Kvällsdopp och bastu', place: 'Framnäs, bryggan', people: ['sannas', 'elinb', 'sofia-bjurhovda'], count: 12 },
		{ day: 'Söndag 13:00', title: 'Söndagspromenad runt Anundshög', place: 'Anundshög, parkeringen', people: ['gubben940', 'rut-rocklunda', 'kicki61'], count: 7 }
	];

	function submit(e: SubmitEvent) {
		e.preventDefault();
		error = '';
		if (!code.trim()) error = 'Skriv in inbjudningskoden du fått (i demon funkar vad som helst).';
		else if (!email.includes('@')) error = 'Skriv in en e-postadress (den sparas inte någonstans).';
		else if (!adult) error = 'Du behöver bekräfta att du har fyllt 18.';
		if (error) return;
		demo.d.loggedIn = true;
		goto('/hem');
	}
</script>

<svelte:head>
	<title>{SITE_NAME} – {SLOGAN}</title>
</svelte:head>

<section class="hero">
	<div class="hero-text">
		<p class="kicker display">Västerås · ideellt · 18+</p>
		<h1>{SLOGAN}</h1>
		<p class="lead">
			{SITE_NAME} är en mötesplats där västeråsare lägger ut saker att göra tillsammans – nattbad, korvgrillning, öppet garage, brännboll.
			Målet är att vi ska träffas på riktigt i stället för att scrolla.
		</p>
		<p class="pledge display">{TAGLINE}</p>
		<div class="row cta">
			<button type="button" class="btn btn-primary btn-big" onclick={() => { demo.d.loggedIn = true; demo.d.tour = 0; goto('/hem'); }} data-testid="tour-landing">
				<Icon name="eye" size={14} /> Visa mig runt (2 min)
			</button>
			<button type="button" class="btn btn-big" onclick={() => { demo.d.loggedIn = true; goto('/hem'); }}>Titta runt själv</button>
		</div>
		<p class="small more"><a href="/om">Läs om Västeråsarna och varför det finns</a> · <a href="#inbjudan">Har du en inbjudan?</a></p>
	</div>
	<div class="hero-art" aria-hidden="true">
		<div class="polaroid p1"><Scene scene="brygga" alt={null} /><em>nattbad</em></div>
		<div class="polaroid p2"><Scene scene="bal" alt={null} /><em>grillkväll</em></div>
		<div class="polaroid p3"><Scene scene="kubb" alt={null} /><em>kubb på Lövudden</em></div>
	</div>
</section>

<section class="week" aria-labelledby="vecka-rubrik">
	<h2 class="section-title" id="vecka-rubrik">En vanlig vecka i Västerås</h2>
	<p class="week-lead">Så här kan det se ut på anslagstavlan. Någon sätter upp en lapp – andra dyker upp.</p>
	<ul class="plain board">
		{#each week as w, i (w.title)}
			<li class="note" style:--tilt={`${[-2, 1.5, -1, 2][i]}deg`}>
				<span class="pin" aria-hidden="true"></span>
				<p class="day display">{w.day}</p>
				<h3>{w.title}</h3>
				<p class="small where"><Icon name="pin" size={12} /> {w.place}</p>
				<div class="who">
					<span class="faces" aria-hidden="true">
						{#each w.people as id (id)}<Avatar {id} size={26} />{/each}
					</span>
					<span class="xs"><strong class="num">{w.count}</strong> kommer</span>
				</div>
			</li>
		{/each}
	</ul>
</section>

<h2 class="section-title">Fyra saker du kan göra</h2>
<ul class="cards plain features">
	{#each features as f (f.title)}
		<li class="feature">
			<span class="f-icon"><Icon name={f.icon} size={24} /></span>
			<h3>{f.title}</h3>
			<p>{f.text}</p>
		</li>
	{/each}
</ul>

<div class="two">
	<Box title="Ordningsreglerna i korthet" icon="shield">
		<ol class="rules">
			{#each rules as r (r.n)}
				<li><strong>{r.title}.</strong> {r.text}</li>
			{/each}
		</ol>
		<p class="small"><a href="/ordningsregler">Läs hela ordningsreglerna</a></p>
	</Box>

	<Box title="Har du en inbjudan?" icon="door" id="inbjudan">
		<form onsubmit={submit} novalidate>
			<p class="small muted">Man kommer in genom att någon som redan är med bjuder in en. Det håller stämningen schysst.</p>
			<div class="field">
				<label for="code">Inbjudningskod</label>
				<input id="code" type="text" autocomplete="off" placeholder="t.ex. MÄLAR-4821" bind:value={code} aria-describedby="code-hint" />
				<span class="hint" id="code-hint">I demon fungerar vilken kod som helst.</span>
			</div>
			<div class="field">
				<label for="email">E-post</label>
				<input id="email" type="email" autocomplete="email" bind:value={email} />
			</div>
			<label class="check field">
				<input type="checkbox" bind:checked={adult} />
				<span>Jag har fyllt 18 år och har läst ordningsreglerna.</span>
			</label>
			{#if error}<p class="notice err" role="alert">{error}</p>{/if}
			<button type="submit" class="btn btn-primary">Gå med</button>
			<p class="xs muted demo-note">Demo: inget skickas och inget sparas utanför din webbläsare.</p>
		</form>
	</Box>
</div>

<style>
	.hero {
		display: grid;
		gap: var(--space-5);
		align-items: center;
		padding: var(--space-4) 0 var(--space-6);
	}

	@media (min-width: 860px) {
		.hero {
			grid-template-columns: 1.3fr 1fr;
		}
	}

	.kicker {
		margin: 0 0 var(--space-2);
		font-size: var(--text-md);
		color: var(--head-text);
	}

	h1 {
		font-size: clamp(2.5rem, 9vw, 4rem);
		margin-bottom: var(--space-3);
	}

	.lead {
		font-size: var(--text-lg);
		max-width: 56ch;
	}

	.pledge {
		font-size: var(--text-md);
		color: var(--head-text);
	}

	.hero-art {
		position: relative;
		height: 260px;
		max-width: 380px;
		width: 100%;
		margin-inline: auto;
	}

	.polaroid {
		position: absolute;
		width: 150px;
		padding: 8px 8px 6px;
		background: var(--photo-frame);
		border: 1px solid var(--border);
		box-shadow: var(--shadow);
		transition: transform var(--speed) var(--ease);
	}

	.polaroid em {
		display: block;
		padding-top: 4px;
		font-size: var(--text-xs);
		color: #333;
		text-align: center;
	}

	.p1 {
		left: 0;
		top: 20px;
		transform: rotate(-6deg);
	}

	.p2 {
		left: 32%;
		top: 0;
		transform: rotate(3deg);
		z-index: 1;
	}

	.p3 {
		right: 0;
		top: 60px;
		transform: rotate(8deg);
	}

	.hero-art:hover .p1 {
		transform: rotate(-9deg) translateY(-4px);
	}

	.hero-art:hover .p3 {
		transform: rotate(11deg) translateY(-4px);
	}

	.cta {
		margin-bottom: var(--space-2);
	}

	.more {
		margin: 0;
	}

	.week {
		margin-bottom: var(--space-6);
	}

	.week-lead {
		max-width: 60ch;
		color: var(--text-muted);
	}

	.board {
		display: grid;
		gap: var(--space-4) var(--space-3);
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 230px), 1fr));
		padding: var(--space-5) var(--space-4) var(--space-4);
		background-color: #b08a5c;
		background-image:
			radial-gradient(rgb(0 0 0 / 0.12) 1px, transparent 1.5px),
			radial-gradient(rgb(255 255 255 / 0.12) 1px, transparent 1.5px);
		background-size: 7px 7px, 11px 11px;
		background-position: 0 0, 3px 4px;
		border: 6px solid #6b4a2f;
		border-radius: var(--radius-lg);
		box-shadow: inset 0 2px 8px rgb(0 0 0 / 0.35);
	}

	.note {
		position: relative;
		padding: var(--space-3);
		color: #1f2430;
		background: #fff8d8;
		box-shadow: 0 3px 8px rgb(0 0 0 / 0.3);
		transform: rotate(var(--tilt));
		transition: transform var(--speed) var(--ease);
	}

	.note:nth-child(2) {
		background: #e3f1ff;
	}

	.note:nth-child(3) {
		background: #ffe4dc;
	}

	.note:nth-child(4) {
		background: #e6f6df;
	}

	.note:hover {
		transform: rotate(0deg) translateY(-3px);
	}

	.pin {
		position: absolute;
		top: -8px;
		left: 50%;
		width: 16px;
		height: 16px;
		background: radial-gradient(circle at 35% 35%, #ff8a80, #c8463a 60%, #8a2e25);
		border-radius: 50%;
		box-shadow: 0 2px 3px rgb(0 0 0 / 0.4);
		transform: translateX(-50%);
	}

	.day {
		margin: 0 0 2px;
		color: #10305f;
	}

	.note h3 {
		margin: 0 0 4px;
		font-size: var(--text-md);
	}

	.where {
		margin: 0 0 var(--space-2);
		color: #3a4253;
	}

	.who {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.faces {
		display: inline-flex;
	}

	.faces :global(.av + .av) {
		margin-left: -6px;
	}

	.section-title {
		font-family: var(--font-display);
		font-weight: 400;
		font-size: 1.875rem;
		margin-bottom: var(--space-3);
	}

	.features {
		margin-bottom: var(--space-6);
	}

	.feature {
		padding: var(--space-3);
		background: var(--surface);
		border: 1px solid var(--head-border);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-sm);
	}

	.f-icon {
		display: inline-grid;
		place-items: center;
		width: 40px;
		height: 40px;
		margin-bottom: var(--space-2);
		color: var(--head-text);
		background: linear-gradient(to bottom, var(--head-from), var(--head-to));
		border: 1px solid var(--head-border);
		border-radius: var(--radius);
	}

	.feature p {
		margin: 0;
		font-size: var(--text-sm);
	}

	.two {
		display: grid;
		gap: var(--space-4);
		align-items: start;
	}

	@media (min-width: 860px) {
		.two {
			grid-template-columns: 1fr 1fr;
		}
	}

	.rules {
		margin: 0 0 var(--space-3);
		padding-left: 1.4em;
		font-size: var(--text-sm);
	}

	.rules li + li {
		margin-top: 6px;
	}

	.demo-note {
		margin: var(--space-2) 0 0;
	}
</style>
