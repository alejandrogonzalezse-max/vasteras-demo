<script lang="ts">
	import qrcode from 'qrcode-generator';
	import { SITE_NAME, SLOGAN } from '#lib/config.ts';
	import { site } from '#lib/origin.svelte.ts';
	import Icon from '#lib/components/Icon.svelte';
	import Scene from '#lib/components/Scene.svelte';
	import Wordmark from '#lib/components/Wordmark.svelte';

	// QR-koden räknas fram lokalt (MIT-licensierat bibliotek) – ingen extern tjänst.
	const qr = $derived.by(() => {
		const q = qrcode(0, 'M');
		q.addData(site.origin);
		q.make();
		return q;
	});
	const size = $derived(qr.getModuleCount());
	const qrPath = $derived.by(() => {
		let d = '';
		for (let r = 0; r < size; r++)
			for (let c = 0; c < size; c++) if (qr.isDark(r, c)) d += `M${c} ${r}h1v1h-1z`;
		return d;
	});
	const host = $derived(site.origin.replace(/^https?:\/\//, ''));
</script>

<svelte:head><title>Affisch – {SITE_NAME}</title></svelte:head>

<div class="screen-only intro">
	<h1>Affischen</h1>
	<p>Skriv ut och sätt upp i trapphuset, på jobbet eller på biblioteket. Den blir exakt en A4.</p>
	<button type="button" class="btn btn-primary" onclick={() => window.print()} data-testid="print"><Icon name="board" size={12} /> Skriv ut</button>
</div>

<article class="poster" aria-label="Affisch: Västeråsarna – Västerås. Lite mer som förr." data-testid="poster">
	<header class="p-head">
		<div class="p-mark"><Wordmark scale={6} label="Västeråsarna" /></div>
		<p class="p-slogan">{SLOGAN}</p>
	</header>

	<div class="p-mid">
		<div class="p-note">
			<span class="p-pin" aria-hidden="true"></span>
			<p class="p-day">Lördag 17:00</p>
			<h2>Korvgrillning på Djäkneberget</h2>
			<p class="p-where">Grillplatsen vid stora stenen · Ta med egen korv</p>
			<p class="p-come"><strong>8 kommer</strong> – du också?</p>
		</div>
		<div class="p-pics" aria-hidden="true">
			<div class="p-pol a"><Scene scene="bal" alt={null} /><em>grillkväll</em></div>
			<div class="p-pol b"><Scene scene="brygga" alt={null} /><em>nattbad</em></div>
		</div>
	</div>

	<ol class="p-steps">
		<li><span>1</span> Sätt upp en lapp</li>
		<li><span>2</span> Folk trycker "Jag kommer"</li>
		<li><span>3</span> Ni ses på riktigt</li>
	</ol>

	<p class="p-promise">Gratis. Ideellt. För alla över 18 i Västerås.</p>

	<footer class="p-foot">
		<div class="p-qr">
			<svg viewBox={`-2 -2 ${size + 4} ${size + 4}`} shape-rendering="crispEdges" role="img" aria-label={`QR-kod till ${host}`}>
				<rect x="-2" y="-2" width={size + 4} height={size + 4} fill="#fff" />
				<path d={qrPath} fill="#111" />
			</svg>
		</div>
		<div class="p-foot-text">
			<p class="p-scan">Skanna och titta runt</p>
			<p class="p-url">{host}</p>
			<p class="p-small">Ingen reklam. Ingen algoritm. 18+. Ideellt.</p>
			<p class="p-small">Demo – allt innehåll är påhittat.</p>
		</div>
	</footer>
</article>

<style>
	.intro {
		margin-bottom: var(--space-4);
	}

	.intro p {
		color: var(--text-muted);
	}

	/* Affischen mäts i cqw så att den skalar på skärmen och blir exakt A4 i utskrift. */
	.poster {
		container-type: inline-size;
		position: relative;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		width: min(100%, 210mm);
		aspect-ratio: 210 / 297;
		margin-inline: auto;
		padding: 6cqw 7cqw;
		overflow: hidden;
		color: #1a2033;
		background-color: #fdf6e3;
		background-image: radial-gradient(#ead9b0 0.35cqw, transparent 0.4cqw);
		background-size: 3cqw 3cqw;
		border: 1px solid #c9b78a;
		box-shadow: var(--shadow);
		--wm-fg: #1b56c4;
		--wm-shadow: #c9b78a;
		print-color-adjust: exact;
		-webkit-print-color-adjust: exact;
	}

	.p-head {
		text-align: center;
		margin-bottom: 4cqw;
	}

	.p-mark {
		width: 78cqw;
		margin-inline: auto;
	}

	.p-mark :global(svg) {
		width: 100%;
		height: auto;
	}

	.p-slogan {
		margin: 2cqw 0 0;
		font-family: var(--font-display);
		font-size: 7.4cqw;
		line-height: 1;
		color: #10305f;
	}

	.p-mid {
		display: grid;
		grid-template-columns: 1.3fr 1fr;
		gap: 4cqw;
		align-items: center;
		margin-bottom: 5cqw;
	}

	.p-note {
		position: relative;
		padding: 4.5cqw 4cqw 3.5cqw;
		background: #fff8d8;
		box-shadow: 0 0.6cqw 1.6cqw rgb(0 0 0 / 0.25);
		transform: rotate(-2deg);
	}

	.p-pin {
		position: absolute;
		top: -1.6cqw;
		left: 50%;
		width: 3.4cqw;
		height: 3.4cqw;
		background: radial-gradient(circle at 35% 35%, #ff8a80, #c8463a 60%, #8a2e25);
		border-radius: 50%;
		transform: translateX(-50%);
	}

	.p-day {
		margin: 0 0 1cqw;
		font-family: var(--font-display);
		font-size: 4.6cqw;
		line-height: 1;
		color: #10305f;
	}

	.p-note h2 {
		margin: 0 0 1.4cqw;
		font-size: 5.2cqw;
		line-height: 1.15;
	}

	.p-where,
	.p-come {
		margin: 0 0 1cqw;
		font-size: 2.9cqw;
		line-height: 1.35;
	}

	.p-pics {
		position: relative;
		height: 46cqw;
	}

	.p-pol {
		position: absolute;
		width: 27cqw;
		padding: 1.4cqw 1.4cqw 1cqw;
		background: #fff;
		box-shadow: 0 0.6cqw 1.6cqw rgb(0 0 0 / 0.3);
	}

	.p-pol em {
		display: block;
		padding-top: 0.6cqw;
		font-size: 2.4cqw;
		text-align: center;
		color: #333;
	}

	.p-pol.a {
		left: 0;
		top: 0;
		transform: rotate(-6deg);
	}

	.p-pol.b {
		right: 0;
		top: 12cqw;
		transform: rotate(7deg);
	}

	.p-steps {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 2.4cqw;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.p-steps li {
		display: grid;
		justify-items: center;
		gap: 1cqw;
		padding: 2.4cqw 1.6cqw;
		font-size: 3cqw;
		font-weight: 700;
		line-height: 1.25;
		text-align: center;
		background: #e3ecf9;
		border: 0.3cqw solid #9fb4d3;
		border-radius: 1.2cqw;
	}

	.p-steps span {
		display: grid;
		place-items: center;
		width: 7cqw;
		height: 7cqw;
		font-family: var(--font-pixel);
		font-size: 3.6cqw;
		color: #fff;
		background: #1b56c4;
		border-radius: 1cqw;
	}

	.p-promise {
		margin: 0;
		padding: 3cqw 2cqw;
		font-family: var(--font-display);
		font-size: 6cqw;
		line-height: 1.05;
		text-align: center;
		color: #10305f;
		background: #fff2a8;
		border: 0.4cqw solid #e2cb52;
		transform: rotate(-1deg);
	}

	.p-foot {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 4cqw;
		align-items: center;
		padding-top: 4cqw;
		border-top: 0.4cqw dashed #c9b78a;
	}

	.p-qr {
		width: 26cqw;
		padding: 1cqw;
		background: #fff;
		border: 0.3cqw solid #1a2033;
	}

	.p-qr svg {
		display: block;
		width: 100%;
		height: auto;
	}

	.p-scan {
		margin: 0;
		font-family: var(--font-display);
		font-size: 6.4cqw;
		line-height: 1;
	}

	.p-url {
		margin: 1cqw 0 2cqw;
		font-size: 3.4cqw;
		font-weight: 700;
		color: #0a4cad;
		overflow-wrap: anywhere;
	}

	.p-small {
		margin: 0 0 0.6cqw;
		font-size: 2.6cqw;
		color: #46536a;
	}

	@media print {
		@page {
			size: A4;
			margin: 0;
		}

		.screen-only {
			display: none !important;
		}

		.poster {
			width: 210mm;
			height: 297mm;
			aspect-ratio: auto;
			margin: 0;
			border: 0;
			box-shadow: none;
			break-inside: avoid;
		}
	}
</style>
