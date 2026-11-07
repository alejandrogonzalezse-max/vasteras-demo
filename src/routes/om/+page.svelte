<script lang="ts">
	import { SITE_NAME, SLOGAN } from '#lib/config.ts';
	import Icon from '#lib/components/Icon.svelte';
	import Scene from '#lib/components/Scene.svelte';
	import Wordmark from '#lib/components/Wordmark.svelte';

	const manifest = [
		{
			title: 'Varför',
			text: 'Västerås är fullt av folk som vill göra saker – bada, grilla, skruva, spela, promenera. Vi vet bara inte om varandra. Västeråsarna är en anslagstavla för stan: du sätter upp en lapp, andra dyker upp.'
		},
		{
			title: 'Mindre mobil, mer folk',
			text: 'Sajten är byggd för att du ska lägga ifrån dig mobilen. Inga flöden att fastna i, inga notiser som lockar tillbaka. Dagboken säger till när du är ikapp. Sedan är det dags att gå ut.'
		},
		{
			title: 'Ingen reklam, ingen algoritm',
			text: 'Allt syns i tidsordning eller efter formler som står utskrivna. Vi säljer inga annonser och samlar inga data om dig. Det som är "hett" är det som flest faktiskt går på.'
		},
		{
			title: 'Trygghet först',
			text: 'Man kommer in med en inbjudan från någon som redan är med. Första gången ses man på en allmän plats. Öppen dörr visar aldrig var någon bor – bara stadsdelen. Alla är över 18.'
		},
		{
			title: 'Ideellt',
			text: 'Ingen äger Västeråsarna för att tjäna pengar. Det drivs av frivilliga, kostar så lite som möjligt och moderatorerna motiverar alltid sina beslut. Allt går att överklaga.'
		},
		{
			title: 'Västerås först',
			text: 'Ingen rikspolitik, inga riksnyheter. Det handlar om Djäkneberget, Framnäs, Bäckby och Hälla – om grannar, inte om rubriker.'
		}
	];

	const principles = [
		{ icon: 'board', title: 'Lappar, inte flöden', text: 'Sätt upp, dyk upp.' },
		{ icon: 'flag', title: 'Ingen reklam', text: 'Inte nu, inte sen.' },
		{ icon: 'eye', title: 'Öppna beslut', text: 'Modloggen är publik.' },
		{ icon: 'lock', title: 'Hem är hemligt', text: 'Bara stadsdelen syns.' },
		{ icon: 'shield', title: '18+ och inbjudan', text: 'Schyssta människor bjuder in schyssta människor.' },
		{ icon: 'heart', title: 'Ideellt', text: 'Drivs av frivilliga.' }
	];

	const growth = [
		{ n: 1, title: 'Demon', text: 'Den här sajten. Allt är påhittat, men allt går att klicka på. Visa den för någon.', scene: 'bradspel' },
		{ n: 2, title: 'De första 30', text: 'Trettio inbjudna västeråsare, en grillkväll och en anslagstavla som börjar fyllas.', scene: 'bal' },
		{ n: 3, title: 'Träffar i varje stadsdel', text: 'Från Bäckby till Hälla: lappar, öppna garage och söndagspromenader – utan att någon behöver äga det.', scene: 'kubb' }
	];
</script>

<svelte:head><title>Om {SITE_NAME} – {SLOGAN}</title></svelte:head>

<div class="page-head om-head">
	<div class="om-mark"><Wordmark scale={4} /></div>
	<h1>Om Västeråsarna</h1>
	<p>{SLOGAN} Här är varför sajten finns och hur den ska fungera.</p>
</div>

<section class="manifest" aria-labelledby="manifest-rubrik">
	<h2 class="sec display" id="manifest-rubrik">Manifestet</h2>
	<ol class="plain mf">
		{#each manifest as m, i (m.title)}
			<li>
				<span class="mf-n num" aria-hidden="true">{i + 1}</span>
				<div>
					<h3>{m.title}</h3>
					<p>{m.text}</p>
				</div>
			</li>
		{/each}
	</ol>
</section>

<section aria-labelledby="principer-rubrik">
	<h2 class="sec display" id="principer-rubrik">Principerna</h2>
	<ul class="plain pr">
		{#each principles as p (p.title)}
			<li>
				<span class="pr-icon" aria-hidden="true"><Icon name={p.icon} size={32} /></span>
				<h3>{p.title}</h3>
				<p class="small">{p.text}</p>
			</li>
		{/each}
	</ul>
</section>

<section aria-labelledby="vaxa-rubrik">
	<h2 class="sec display" id="vaxa-rubrik">Så kan det växa</h2>
	<ol class="plain grow">
		{#each growth as g (g.n)}
			<li>
				<div class="g-pic"><Scene scene={g.scene} alt={null} /></div>
				<p class="g-step display">Steg {g.n}</p>
				<h3>{g.title}</h3>
				<p class="small">{g.text}</p>
			</li>
		{/each}
	</ol>
</section>

<p class="om-links">
	<a class="btn btn-primary" href="/">Till startsidan</a>
	<a class="btn" href="/affisch"><Icon name="board" size={12} /> Skriv ut affischen</a>
	<a href="/ordningsregler">Ordningsreglerna</a>
</p>

<style>
	.om-head {
		max-width: 70ch;
	}

	.om-mark {
		width: min(100%, 288px);
		margin-bottom: var(--space-3);
	}

	section {
		margin-bottom: var(--space-6);
	}

	.sec {
		font-size: 1.875rem;
		margin-bottom: var(--space-3);
	}

	.mf {
		display: grid;
		gap: var(--space-3);
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 320px), 1fr));
	}

	.mf li {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: var(--space-3);
		padding: var(--space-3);
		background: var(--surface);
		border: 1px solid var(--head-border);
		border-radius: var(--radius-lg);
	}

	.mf-n {
		display: grid;
		place-items: center;
		width: 36px;
		height: 36px;
		color: var(--accent-text);
		background: var(--accent);
		border-radius: var(--radius);
	}

	.mf h3 {
		margin-bottom: 4px;
	}

	.mf p {
		margin: 0;
	}

	.pr {
		display: grid;
		gap: var(--space-3);
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 160px), 1fr));
	}

	.pr li {
		padding: var(--space-3);
		text-align: center;
		background: var(--surface);
		border: 1px solid var(--head-border);
		border-radius: var(--radius-lg);
	}

	.pr-icon {
		display: inline-grid;
		place-items: center;
		width: 64px;
		height: 64px;
		margin-bottom: var(--space-2);
		color: var(--head-text);
		background: linear-gradient(to bottom, var(--head-from), var(--head-to));
		border: 1px solid var(--head-border);
		border-radius: var(--radius-lg);
	}

	.pr h3 {
		font-size: var(--text-md);
		margin-bottom: 2px;
	}

	.pr p {
		margin: 0;
		color: var(--text-muted);
	}

	.grow {
		display: grid;
		gap: var(--space-4);
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr));
		counter-reset: step;
	}

	.grow li {
		position: relative;
		padding: var(--space-3);
		background: var(--surface);
		border: 1px solid var(--head-border);
		border-radius: var(--radius-lg);
	}

	.g-pic {
		width: 96px;
		padding: 4px;
		margin-bottom: var(--space-2);
		background: var(--photo-frame);
		border: 1px solid var(--border);
		box-shadow: var(--shadow-sm);
	}

	.g-step {
		margin: 0;
		color: var(--head-text);
	}

	.grow p:last-child {
		margin: 0;
	}

	.om-links {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-3);
	}
</style>
