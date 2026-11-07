<script lang="ts">
	import '@fontsource/atkinson-hyperlegible/latin-400.css';
	import '@fontsource/atkinson-hyperlegible/latin-700.css';
	import '@fontsource/atkinson-hyperlegible/latin-400-italic.css';
	import '@fontsource/silkscreen/latin-400.css';
	import '@fontsource/vt323/latin-400.css';
	import '#lib/styles/tokens.css';
	import '#lib/styles/base.css';
	import fontBody from '@fontsource/atkinson-hyperlegible/files/atkinson-hyperlegible-latin-400-normal.woff2?url';
	import fontBold from '@fontsource/atkinson-hyperlegible/files/atkinson-hyperlegible-latin-700-normal.woff2?url';
	import fontPixel from '@fontsource/silkscreen/files/silkscreen-latin-400-normal.woff2?url';
	import fontDisplay from '@fontsource/vt323/files/vt323-latin-400-normal.woff2?url';

	import { onMount } from 'svelte';
	import { goto, afterNavigate, onNavigate, replaceState } from '$app/navigation';
	import { page } from '$app/state';
	import { DEMO_NOTICE, DESCRIPTION, ME_ID, SITE_NAME, SITE_URL, SLOGAN, TAGLINE, THEME_KEY } from '#lib/config.ts';
	import { userById } from '#lib/mock.ts';
	import { demo } from '#lib/state.svelte.ts';
	import Icon from '#lib/components/Icon.svelte';
	import Gate from '#lib/components/Gate.svelte';
	import ThemeToggle from '#lib/components/ThemeToggle.svelte';
	import Toaster from '#lib/components/Toaster.svelte';
	import Wordmark from '#lib/components/Wordmark.svelte';
	import Welcome from '#lib/components/Welcome.svelte';
	import { founder, sanitizeName } from '#lib/founder.svelte.ts';
	import Tour from '#lib/components/Tour.svelte';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
	let toggle: ThemeToggle | undefined = $state();
	let flash = $state('');

	const nav = [
		{ href: '/hem', label: 'Hem', short: 'Hem', icon: 'house' },
		{ href: '/anslagstavlan', label: 'Anslagstavlan', short: 'Tavlan', icon: 'board' },
		{ href: '/kartan', label: 'Kartan', short: 'Kartan', icon: 'pin' },
		{ href: '/utforska', label: 'Utforska & Hett', short: 'Hett', icon: 'fire' },
		{ href: '/grupper', label: 'Grupper', short: 'Grupper', icon: 'group' },
		{ href: '/forum', label: 'Forum', short: 'Forum', icon: 'forum' },
		{ href: `/profil/${ME_ID}`, label: 'Min profil', short: 'Profil', icon: 'user' },
		{ href: '/moderering', label: 'Moderering', short: 'Mod', icon: 'shield' }
	];

	const PUBLIC = ['/', '/om', '/affisch', '/ordningsregler', '/integritet', '/kontakt', '/anmal'];
	const path = $derived(page.url.pathname);
	const isPublic = $derived(PUBLIC.includes(path) || page.status === 404);
	/**
	 * null = inte inläst än (förrendering). Då renderas båda lägena och CSS väljer
	 * via html[data-auth], som ett litet skript i app.html sätter före första målningen.
	 */
	const loggedIn = $derived(demo.ready ? demo.d.loggedIn : null);
	const showIn = $derived(loggedIn !== false);
	const showOut = $derived(loggedIn !== true);
	const me = userById(ME_ID)!;

	function isActive(href: string) {
		if (href.startsWith('/profil/')) return path === href;
		return path === href || path.startsWith(href + '/');
	}

	let menuOpen = $state(false);
	let welcomeOpen = $state(false);
	let welcomeName = $state('');

	// "X har just loggat in" då och då – högst en gång per två minuter.
	// Stängs av i sidfoten eller direkt i notisen. Visas inte under automatiska tester.
	function scheduleLogins() {
		if (navigator.webdriver) return;
		const who = ['linnea-l', 'matteok', 'sannas', 'johanna-v', 'elinb', 'kicki61', 'grundaren', 'mopedmia'];
		let i = Math.floor(Math.random() * who.length);
		const tick = (ms: number) =>
			setTimeout(() => {
				if (demo.d.loggedIn && !document.hidden && demo.d.tour === null && !welcomeOpen) demo.loginToast(who[i++ % who.length]);
				tick(120000 + Math.random() * 60000);
			}, ms);
		tick(25000);
	}

	onMount(() => {
		scheduleLogins();
		demo.load();
		handleEntryParams();
		// ?hej=<namn>: Grundaren får namnet, och välkomstfönstret visas en gång per namn.
		const name = sanitizeName(new URLSearchParams(location.search).get('hej'));
		if (name) {
			demo.d.founderName = name;
			if (demo.d.welcomedFor !== name && demo.d.tour === null) {
				welcomeName = name;
				welcomeOpen = true;
				demo.d.welcomedFor = name;
			}
		}
	});

	$effect(() => {
		founder.name = demo.d.founderName ?? 'Grundaren';
	});

	function welcomeTour() {
		welcomeOpen = false;
		demo.d.loggedIn = true;
		demo.d.tour = 0;
		goto('/hem');
	}

	function welcomeSelf() {
		welcomeOpen = false;
		demo.d.loggedIn = true;
		goto('/hem');
	}

	$effect(() => {
		// Spara vid varje ändring (no-op tills inläst).
		demo.save();
	});

	$effect(() => {
		if (demo.ready) document.documentElement.dataset.auth = demo.d.loggedIn ? 'in' : 'out';
	});

	// Mjuk övergång mellan sidor där webbläsaren stöder View Transitions.
	onNavigate((navigation) => {
		if (!document.startViewTransition || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		if (navigation.from?.url.pathname === navigation.to?.url.pathname) return;
		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});

	function startTour() {
		demo.d.tour = 0;
	}

	/** ?in=1 loggar in i demon, ?rundtur=1 startar rundturen. Parametrarna tas sedan bort ur adressen. */
	function handleEntryParams() {
		if (!demo.ready) return;
		const url = new URL(location.href);
		const inParam = url.searchParams.get('in') === '1';
		const tourParam = url.searchParams.get('rundtur') === '1';
		if (!inParam && !tourParam) return;
		if (inParam) demo.d.loggedIn = true;
		if (tourParam) demo.d.tour = 0;
		url.searchParams.delete('in');
		url.searchParams.delete('rundtur');
		replaceState(url.pathname + url.search + url.hash, page.state);
	}

	afterNavigate(() => {
		handleEntryParams();
		menuOpen = false;
		// Scrolla bara flikraden i sidled (mellanbredd), aldrig själva sidan.
		const tabs = document.querySelector<HTMLElement>('.tabs');
		const active = tabs?.querySelector<HTMLElement>('a[aria-current="page"]');
		if (tabs && active && tabs.scrollWidth > tabs.clientWidth) {
			tabs.scrollLeft = active.offsetLeft - (tabs.clientWidth - active.offsetWidth) / 2;
		}
	});

	async function logout() {
		demo.d.loggedIn = false;
		await goto('/');
	}

	async function reset() {
		demo.reset();
		document.documentElement.dataset.theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
		try {
			localStorage.removeItem(THEME_KEY);
		} catch {
			/* ok */
		}
		toggle?.sync();
		await goto('/');
		flash = 'Demon är återställd. Allt du gjort är borttaget.';
		setTimeout(() => (flash = ''), 6000);
	}
</script>

<svelte:head>
	<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
	<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
	<link rel="manifest" href="/manifest.webmanifest" />
	<meta name="theme-color" content="#1b56c4" />
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content={SITE_NAME} />
	<meta property="og:title" content={`${SITE_NAME} – ${SLOGAN}`} />
	<meta property="og:description" content={DESCRIPTION} />
	<meta property="og:image" content={`${SITE_URL}/og.png`} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:image:alt" content="Pixelillustrationer av en brygga i månsken, ett bål och ett kubbspel, med texten Västerås. Lite mer som förr." />
	<meta property="og:locale" content="sv_SE" />
	<meta name="twitter:card" content="summary_large_image" />
	<link rel="preload" as="font" type="font/woff2" crossorigin="anonymous" href={fontBody} />
	<link rel="preload" as="font" type="font/woff2" crossorigin="anonymous" href={fontBold} />
	<link rel="preload" as="font" type="font/woff2" crossorigin="anonymous" href={fontPixel} />
	<link rel="preload" as="font" type="font/woff2" crossorigin="anonymous" href={fontDisplay} />
</svelte:head>

<svelte:window
	onclick={(e) => {
		if (!(e.target as Element | null)?.closest?.('#mobilmeny, .menu-btn')) menuOpen = false;
	}}
	onkeydown={(e) => e.key === 'Escape' && (menuOpen = false)}
/>

<a class="skip" href="#innehall">Hoppa till innehållet</a>

<div class="demo-bar" role="note">{DEMO_NOTICE}</div>

<header class="site-head">
	<div class="wrap head-row">
		<a class="logo" href={loggedIn === false ? '/' : '/hem'}>
			<span class="logo-mark" aria-hidden="true"><Icon name="dice" size={22} /></span>
			<span class="logo-text">
				<span class="logo-name"><Wordmark scale={3} /></span>
				<span class="logo-slogan">{SLOGAN}</span>
			</span>
		</a>
		<div class="userbar">
			{#if showIn}
				<span class="who small auth-in">
					<span class="dot"></span>
					<span>Inloggad som <a href={`/profil/${ME_ID}`}><strong>{me.name}</strong></a></span>
				</span>
				<button type="button" class="btn btn-small auth-in" onclick={logout}>Visa som utloggad</button>
			{/if}
			<ThemeToggle bind:this={toggle} />
		</div>
		<button
			type="button"
			class="menu-btn"
			aria-label="Meny"
			aria-expanded={menuOpen}
			aria-controls="mobilmeny"
			data-testid="menu-btn"
			onclick={() => (menuOpen = !menuOpen)}
		>
			<Icon name="menu" size={18} />
		</button>
		{#if menuOpen}
			<div
				id="mobilmeny"
				class="mobile-menu"
				role="group"
				aria-label="Meny"
			>
				{#if loggedIn !== false}
					<p class="small mm-who"><span class="dot"></span> Inloggad som <a href={`/profil/${ME_ID}`}><strong>{me.name}</strong></a></p>
					<button type="button" class="btn btn-small mm-full" onclick={() => { menuOpen = false; logout(); }}>Visa som utloggad</button>
					<button type="button" class="btn btn-small mm-full" onclick={() => { menuOpen = false; startTour(); }}><Icon name="eye" size={12} /> Visa mig runt</button>
					<a class="btn btn-small mm-full" href="/vanner"><Icon name="group" size={12} /> Hitta vänner</a>
				{:else}
					<p class="small mm-who"><span class="dot off"></span> Du tittar som utloggad</p>
					<button type="button" class="btn btn-small btn-primary mm-full" onclick={() => { menuOpen = false; demo.d.loggedIn = true; goto('/hem'); }}>Gå in i demon</button>
				{/if}
				<ThemeToggle testid="theme-toggle-menu" full />
			</div>
		{/if}
	</div>
	{#if showIn}
		<nav class="tabs-wrap auth-in" aria-label="Huvudmeny">
			<ul class="wrap tabs plain">
				{#each nav as item (item.href)}
					<li>
						<a href={item.href} aria-current={isActive(item.href) ? 'page' : undefined}>
							<Icon name={item.icon} size={14} />
							<span class="long">{item.label}</span><span class="short" aria-hidden="true">{item.short}</span>
						</a>
					</li>
				{/each}
			</ul>
		</nav>
		<div class="news auth-in" aria-label="Nytt sedan sist">
			<div class="wrap news-row">
				<p class="news-list">
					<span class="news-label display">Nytt:</span>
					{#each demo.news as n (n.key)}
						<a class="news-item" href={n.href}><Icon name={n.icon} size={12} /> {n.text}</a>
					{:else}
						<span class="muted">Inget nytt – perfekt läge att gå ut.</span>
					{/each}
				</p>
				<button type="button" class="linkbtn small tour-btn" onclick={startTour} data-testid="tour-start">
					<Icon name="eye" size={12} /> <span class="tb-long">Visa mig runt</span><span class="tb-short" aria-hidden="true">Rundtur</span>
				</button>
			</div>
		</div>
	{/if}
</header>

{#if flash}
	<div class="wrap"><p class="notice ok flash" role="status">{flash}</p></div>
{/if}

<main id="innehall" class="wrap" tabindex="-1">
	{#if isPublic}
		{@render children()}
	{:else}
		{#if showIn}<div class="auth-in">{@render children()}</div>{/if}
		{#if showOut}<div class="auth-out"><Gate /></div>{/if}
	{/if}
</main>

<Toaster />
<Tour />
<Welcome name={welcomeName} bind:open={welcomeOpen} ontour={welcomeTour} onself={welcomeSelf} />

<footer class="site-foot">
	<div class="wrap foot-grid">
		<div>
			<div class="foot-name"><Wordmark scale={2} /></div>
			<p class="small">{SLOGAN}<br /><strong>{TAGLINE}</strong></p>
		</div>
		<nav aria-label="Sidfot">
			<ul class="plain foot-links">
				<li><a href="/om">Om Västeråsarna</a></li>
				<li><a href="/affisch">Affischen</a></li>
				<li><a href="/ordningsregler">Ordningsregler</a></li>
				<li><a href="/integritet">Integritet</a></li>
				<li><a href="/kontakt">Kontakt</a></li>
				<li><a href="/anmal">Anmäl innehåll</a></li>
			</ul>
		</nav>
		<div class="foot-reset">
			<div class="foot-btns">
				<button type="button" class="btn btn-small" onclick={reset} data-testid="reset">
					<Icon name="reset" size={12} /> Återställ demon
				</button>
				<button type="button" class="btn btn-small" aria-pressed={demo.d.sound} onclick={() => (demo.d.sound = !demo.d.sound)} data-testid="sound-toggle">
					<Icon name={demo.d.sound ? 'sound' : 'mute'} size={12} /> Ljud: {demo.d.sound ? 'på' : 'av'}
				</button>
				<button type="button" class="btn btn-small" aria-pressed={demo.d.loginToasts} onclick={() => (demo.d.loginToasts = !demo.d.loginToasts)}>
					Inloggningsnotiser: {demo.d.loginToasts ? 'på' : 'av'}
				</button>
			</div>
			<p class="xs muted">
				{#if demo.memoryOnly}
					Din webbläsare tillåter inte lagring, så det du gör försvinner när du laddar om.
				{:else}
					Det du gör sparas bara i din egen webbläsare.
				{/if}
			</p>
		</div>
	</div>
</footer>

<style>
	:global(html[data-auth='out'] .auth-in),
	:global(html[data-auth='in'] .auth-out) {
		display: none !important;
	}

	.wrap {
		width: 100%;
		max-width: var(--max-width);
		margin-inline: auto;
		padding-inline: var(--gutter);
	}

	.skip {
		position: absolute;
		left: 8px;
		top: -100px;
		z-index: 100;
		padding: 8px 12px;
		background: var(--surface);
		border: 2px solid var(--focus);
	}

	.skip:focus {
		top: 8px;
	}

	.demo-bar {
		padding: 4px var(--gutter);
		font-size: var(--text-xs);
		font-weight: 700;
		text-align: center;
		color: var(--demo-text);
		background: var(--demo-bg);
		border-bottom: 1px solid var(--demo-border);
	}

	.site-head {
		background: var(--surface);
		border-bottom: 1px solid var(--head-border);
		box-shadow: var(--shadow-sm);
		margin-bottom: var(--space-4);
	}

	.head-row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-2) var(--space-3);
		padding-block: var(--space-3) var(--space-2);
	}

	.logo {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		color: var(--text);
		text-decoration: none;
	}

	.logo:visited {
		color: var(--text);
	}

	.logo-mark {
		display: grid;
		place-items: center;
		width: 40px;
		height: 40px;
		color: var(--accent-text);
		background: var(--accent);
		border-radius: var(--radius);
		box-shadow: inset 0 -3px 0 rgb(0 0 0 / 0.2);
	}

	.logo-text {
		display: grid;
		line-height: 1.15;
	}

	.logo-name {
		display: block;
		width: 232px;
		margin-bottom: 3px;
	}

	.menu-btn {
		display: none;
	}

	.mobile-menu {
		display: none;
	}

	.logo-slogan {
		font-size: var(--text-xs);
		font-style: italic;
		color: var(--text-muted);
	}

	.userbar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-2);
	}

	.who {
		display: inline-flex;
		align-items: center;
		gap: 6px;
	}

	.tabs-wrap {
		border-top: 1px solid var(--border);
		background: linear-gradient(to bottom, var(--head-from), var(--head-to));
	}

	.tabs {
		position: relative;
		display: flex;
		gap: 2px;
		overflow-x: auto;
		scrollbar-width: none;
		padding-top: 6px;
	}

	.tabs::-webkit-scrollbar {
		display: none;
	}

	.tabs a {
		display: flex;
		align-items: center;
		gap: 6px;
		min-height: 44px;
		padding: 6px 12px;
		font-size: var(--text-sm);
		font-weight: 700;
		color: var(--head-text);
		text-decoration: none;
		white-space: nowrap;
		border: 1px solid transparent;
		border-bottom: 0;
		border-radius: var(--radius) var(--radius) 0 0;
	}

	.tabs a:hover {
		background: color-mix(in srgb, var(--surface) 60%, transparent);
	}

	.tabs a[aria-current='page'] {
		color: var(--text);
		background: var(--surface);
		border-color: var(--head-border);
		margin-bottom: -1px;
		box-shadow: inset 0 2px 0 var(--accent);
	}

	.short {
		display: none;
	}

	@media (max-width: 959px) {
		.tabs a {
			position: relative;
			flex-direction: column;
			gap: 2px;
			padding: 6px 10px;
			font-size: var(--text-xs);
		}

		.long {
			position: absolute;
			width: 1px;
			height: 1px;
			overflow: hidden;
			clip: rect(0, 0, 0, 0);
			white-space: nowrap;
		}

		.short {
			display: inline;
		}
	}

	/* Smala skärmar: två rader med fyra flikar, ingen sidledsscroll. */
	@media (max-width: 599px) {
		.tabs {
			display: grid;
			grid-template-columns: repeat(4, minmax(0, 1fr));
			gap: 4px;
			overflow: visible;
			padding-block: 6px;
		}

		.tabs a {
			justify-content: center;
			min-height: 52px;
			padding: 6px 2px;
			border: 1px solid transparent;
			border-radius: var(--radius);
			text-align: center;
		}

		.tabs a[aria-current='page'] {
			margin-bottom: 0;
			border-color: var(--head-border);
			box-shadow:
				inset 0 3px 0 var(--accent),
				var(--shadow-sm);
		}
	}

	@media (max-width: 720px) {
		.logo-name {
			width: 196px;
		}
	}

	/* Mobil: kompakt header på en rad – logga till vänster, menyknapp till höger. */
	@media (max-width: 599px) {
		.head-row {
			position: relative;
			flex-wrap: nowrap;
			padding-block: var(--space-2);
		}

		.logo-mark {
			width: 32px;
			height: 32px;
		}

		.logo-name {
			width: 176px;
			margin-bottom: 0;
		}

		.logo-slogan,
		.userbar {
			display: none;
		}

		.menu-btn {
			display: grid;
			place-items: center;
			width: 44px;
			height: 44px;
			color: var(--head-text);
			background: var(--btn-bg);
			border: 1px solid var(--btn-border);
			border-radius: var(--radius);
			cursor: pointer;
		}

		.menu-btn[aria-expanded='true'] {
			color: var(--accent-text);
			background: var(--accent);
			border-color: var(--accent);
		}

		.mobile-menu {
			position: absolute;
			top: calc(100% - 4px);
			right: var(--gutter);
			z-index: 50;
			display: grid;
			gap: var(--space-2);
			width: min(280px, calc(100vw - 32px));
			padding: var(--space-3);
			background: var(--surface);
			border: 1px solid var(--head-border);
			border-radius: var(--radius-lg);
			box-shadow: var(--shadow);
		}

		.mm-who {
			display: flex;
			align-items: center;
			gap: 6px;
			margin: 0;
		}

		.mm-full {
			width: 100%;
			justify-content: flex-start;
		}
	}

	.news {
		border-top: 1px solid var(--border);
		background: var(--surface);
	}

	.news-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-2);
		min-height: 40px;
	}

	.news-list {
		display: flex;
		align-items: center;
		gap: 4px var(--space-2);
		margin: 0;
		min-width: 0;
		overflow-x: auto;
		scrollbar-width: none;
		white-space: nowrap;
		font-size: var(--text-sm);
	}

	.news-list::-webkit-scrollbar {
		display: none;
	}

	.news-label {
		color: var(--head-text);
	}

	.news-item {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		padding: 2px 8px;
		font-weight: 700;
		background: var(--warn-soft);
		border: 1px solid var(--demo-border);
		border-radius: var(--radius-pill);
	}

	.news-item:visited {
		color: var(--link);
	}

	.tb-short {
		display: none;
	}

	@media (max-width: 599px) {
		.tb-long {
			position: absolute;
			width: 1px;
			height: 1px;
			overflow: hidden;
			clip: rect(0, 0, 0, 0);
			white-space: nowrap;
		}

		.tb-short {
			display: inline;
		}

		.news-label {
			display: none;
		}
	}

	.tour-btn {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		min-height: 32px;
		white-space: nowrap;
	}

	main {
		min-height: 60vh;
		padding-bottom: var(--space-6);
	}

	main:focus {
		outline: none;
	}

	.flash {
		margin-bottom: var(--space-3);
	}

	.site-foot {
		padding-block: var(--space-5);
		background: var(--surface);
		border-top: 1px solid var(--head-border);
	}

	.foot-grid {
		display: grid;
		gap: var(--space-4);
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		align-items: start;
	}

	.foot-name {
		margin: 0 0 4px;
		font-family: var(--font-pixel);
	}

	.foot-links {
		display: grid;
		gap: 4px;
	}

	.foot-btns {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}

	.foot-reset p {
		margin: var(--space-2) 0 0;
	}
</style>
