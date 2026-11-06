<script lang="ts">
	import { goto } from '$app/navigation';
	import { SITE_NAME, SLOGAN, TAGLINE } from '#lib/config.ts';
	import { rules } from '#lib/mock.ts';
	import { demo } from '#lib/state.svelte.ts';
	import Box from '#lib/components/Box.svelte';
	import Icon from '#lib/components/Icon.svelte';

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
		<p class="kicker pixel">Västerås · ideellt · 18+</p>
		<h1>{SLOGAN}</h1>
		<p class="lead">
			{SITE_NAME} är en mötesplats där västeråsare lägger ut saker att göra tillsammans – nattbad, korvgrillning, öppet garage, brännboll.
			Målet är att vi ska träffas på riktigt i stället för att scrolla.
		</p>
		<p class="pledge pixel">{TAGLINE}</p>
		<div class="row">
			<a class="btn btn-primary btn-big" href="#inbjudan">Jag har en inbjudan</a>
			<button type="button" class="btn btn-big" onclick={() => { demo.d.loggedIn = true; goto('/hem'); }}>Titta runt i demon</button>
		</div>
	</div>
	<div class="hero-art" aria-hidden="true">
		<div class="polaroid p1"><span style:--c="#2f4b73"><Icon name="moon" size={44} /></span><em>nattbad</em></div>
		<div class="polaroid p2"><span style:--c="#a3745d"><Icon name="sausage" size={44} /></span><em>korv på berget</em></div>
		<div class="polaroid p3"><span style:--c="#5d8a6e"><Icon name="star" size={44} /></span><em>brännboll</em></div>
	</div>
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
		font-size: var(--text-xs);
		color: var(--head-text);
	}

	h1 {
		font-size: clamp(1.75rem, 5vw, 2.75rem);
		margin-bottom: var(--space-3);
	}

	.lead {
		font-size: var(--text-lg);
		max-width: 56ch;
	}

	.pledge {
		font-size: var(--text-sm);
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

	.polaroid span {
		display: grid;
		place-items: center;
		aspect-ratio: 1;
		color: rgb(255 255 255 / 0.6);
		background: var(--c);
		background-image: linear-gradient(160deg, rgb(255 255 255 / 0.18), rgb(0 0 0 / 0.22));
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

	.section-title {
		font-family: var(--font-pixel);
		font-weight: 400;
		font-size: var(--text-lg);
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
