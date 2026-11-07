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
	import { goto, afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { DEMO_NOTICE, ME_ID, SITE_NAME, SLOGAN, TAGLINE, THEME_KEY } from '#lib/config.ts';
	import { userById } from '#lib/mock.ts';
	import { demo } from '#lib/state.svelte.ts';
	import Icon from '#lib/components/Icon.svelte';
	import Gate from '#lib/components/Gate.svelte';
	import ThemeToggle from '#lib/components/ThemeToggle.svelte';
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

	const PUBLIC = ['/', '/ordningsregler', '/integritet', '/kontakt', '/anmal'];
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

	onMount(() => {
		demo.load();
	});

	$effect(() => {
		// Spara vid varje ändring (no-op tills inläst).
		demo.save();
	});

	$effect(() => {
		if (demo.ready) document.documentElement.dataset.auth = demo.d.loggedIn ? 'in' : 'out';
	});

	afterNavigate(() => {
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
	<link rel="preload" as="font" type="font/woff2" crossorigin="anonymous" href={fontBody} />
	<link rel="preload" as="font" type="font/woff2" crossorigin="anonymous" href={fontBold} />
	<link rel="preload" as="font" type="font/woff2" crossorigin="anonymous" href={fontPixel} />
	<link rel="preload" as="font" type="font/woff2" crossorigin="anonymous" href={fontDisplay} />
</svelte:head>

<a class="skip" href="#innehall">Hoppa till innehållet</a>

<div class="demo-bar" role="note">{DEMO_NOTICE}</div>

<header class="site-head">
	<div class="wrap head-row">
		<a class="logo" href={loggedIn === false ? '/' : '/hem'}>
			<span class="logo-mark" aria-hidden="true"><Icon name="dice" size={22} /></span>
			<span class="logo-text">
				<span class="logo-name">{SITE_NAME}</span>
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
			{#if showOut}
				<span class="who small muted auth-out"><span class="dot off"></span> Du är utloggad</span>
				<a class="btn btn-small btn-primary auth-out" href="/#inbjudan">Har du en inbjudan?</a>
			{/if}
			<ThemeToggle bind:this={toggle} />
		</div>
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

<footer class="site-foot">
	<div class="wrap foot-grid">
		<div>
			<p class="foot-name">{SITE_NAME}</p>
			<p class="small">{SLOGAN}<br /><strong>{TAGLINE}</strong></p>
		</div>
		<nav aria-label="Sidfot">
			<ul class="plain foot-links">
				<li><a href="/ordningsregler">Ordningsregler</a></li>
				<li><a href="/integritet">Integritet</a></li>
				<li><a href="/kontakt">Kontakt</a></li>
				<li><a href="/anmal">Anmäl innehåll</a></li>
			</ul>
		</nav>
		<div class="foot-reset">
			<button type="button" class="btn btn-small" onclick={reset} data-testid="reset">
				<Icon name="reset" size={12} /> Återställ demon
			</button>
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
		font-family: var(--font-pixel);
		font-size: var(--text-lg);
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
			font-size: var(--text-md);
		}

		.userbar {
			width: 100%;
		}

		.who {
			flex-basis: 100%;
			font-size: var(--text-xs);
		}
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

	.foot-reset p {
		margin: var(--space-2) 0 0;
	}
</style>
