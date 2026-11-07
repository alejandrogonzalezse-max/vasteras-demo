<script lang="ts">
	import { agoLabel, type Ago } from '#lib/time.ts';
	import { ME_ID, SITE_NAME } from '#lib/config.ts';
	import { defaultGuestbook, guestbooks, myFriends, placeById, userById } from '#lib/mock.ts';
	import { demo, type ProfileTheme } from '#lib/state.svelte.ts';
	import Avatar from '#lib/components/Avatar.svelte';
	import Box from '#lib/components/Box.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import Scene from '#lib/components/Scene.svelte';
	import UserLink from '#lib/components/UserLink.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const u = $derived(data.user);
	const isMe = $derived(u.id === ME_ID);

	const themes: { id: ProfileTheme; label: string }[] = [
		{ id: 'klassisk', label: 'Klassisk blå' },
		{ id: 'solnedgang', label: 'Solnedgång vid Mälaren' },
		{ id: 'granskog', label: 'Granskog' }
	];
	// Andras profiler får ett eget, fast tema så man ser att det varierar.
	const theme = $derived<ProfileTheme>(
		isMe ? demo.d.profileTheme : themes[[...u.id].reduce((s, c) => s + c.charCodeAt(0), 0) % 3].id
	);

	const status = $derived(isMe ? demo.d.msn : u.status);
	const entries = $derived([...(demo.d.guestbook[u.id] ?? []), ...(guestbooks[u.id] ?? defaultGuestbook(u.id))]);
	const isFriend = $derived(myFriends.includes(u.id) || (u.id === 'tobbe-tillberga' && demo.d.friendRequest === 'accepted'));
	let requested = $state<Record<string, boolean>>({});

	// Lunarstorm-klassikern: senaste besökarna. Påhittade, utom att du själv syns hos andra.
	const TIMES = [34, 117, 260, 790, 1430];
	const visitors = $derived(
		[
			...(!isMe && !demo.d.sneak ? [{ id: ME_ID, when: 0 as Ago }] : []),
			...u.topFriends
				.filter((id) => id !== ME_ID)
				.slice(2, 7)
				.map((id, i) => ({ id, when: TIMES[i] as Ago }))
		].slice(0, 5)
	);

	// Två gästboksinlägg är "nya" tills man har tittat på sin egen profil.
	let newCount = $state(0);
	$effect(() => {
		if (demo.ready && isMe && !demo.d.seenGuestbook) {
			newCount = 2;
			demo.d.seenGuestbook = true;
		}
	});
	let text = $state('');

	function write(e: SubmitEvent) {
		e.preventDefault();
		if (!text.trim()) return;
		const list = demo.d.guestbook[u.id] ?? [];
		demo.d.guestbook[u.id] = [{ by: ME_ID, ago: 'nyss', text: text.trim() }, ...list];
		text = '';
	}
</script>

<svelte:head><title>{u.name} – {SITE_NAME}</title></svelte:head>

<div class={`profile theme-${theme}`} data-testid="profile">
	<div class="page-head p-head">
		<h1 class="p-title">{u.name}{#if u.badge}<span class="badge" data-testid="badge">{u.badge}</span>{/if}</h1>
		<p>{isMe ? 'Din profil – så här ser den ut för andra.' : u.age ? `${u.area} · ${u.age} år` : `${u.area}${u.mod ? ' · moderator' : ''}`}</p>
	</div>
	{#if isMe}
		<fieldset class="theme-pick">
			<legend>Profiltema</legend>
			{#each themes as t (t.id)}
				<label class="tp"><input type="radio" name="ptheme" value={t.id} bind:group={demo.d.profileTheme} /> <span class={`swatch s-${t.id}`}></span> {t.label}</label>
			{/each}
		</fieldset>
	{/if}

	<div class="p-grid">
		<div class="stack">
			<Box title="Profil" icon="user">
				<div class="pic"><Avatar id={u.id} size={150} /></div>
				<p class="status msn"><span class="dot" class:away={u.presence === 'away'} class:off={u.presence === 'off'}></span> {status}</p>
				<dl class="facts small">
					<dt>Stadsdel</dt><dd>{u.area}</dd>
					{#if u.age}<dt>Ålder</dt><dd>{u.age} år</dd>{/if}
					{#if u.mod}<dt>Roll</dt><dd>Moderator</dd>{/if}
					<dt>Medlem sedan</dt><dd>{u.joined}</dd>
				</dl>
				<p class="song small"><Icon name="note" size={12} /> <strong>Låt just nu:</strong> {u.song}</p>
				{#if !isMe}
					<div class="row">
						{#if isFriend}
							<span class="tag"><Icon name="check" size={10} /> Ni är vänner</span>
						{:else if requested[u.id]}
							<span class="tag warn">Vänförfrågan skickad</span>
						{:else}
							<button type="button" class="btn btn-small btn-primary" onclick={() => (requested[u.id] = true)}>Lägg till som vän</button>
						{/if}
						<a class="btn btn-small" href="#gastbok">Skriv i gästboken</a>
					</div>
				{/if}
			</Box>
			<Box title="Senaste besökarna" icon="eye">
				<ul class="plain visitors">
					{#each visitors as v (v.id)}
						<li>
							<Avatar id={v.id} size={36} />
							<span class="small">{#if v.id === ME_ID}<strong>Du</strong>{:else}<UserLink id={v.id} />{/if}<br /><span class="xs muted">{agoLabel(v.when, demo.now)}</span></span>
						</li>
					{/each}
				</ul>
				<label class="check xs sneak">
					<input type="checkbox" bind:checked={demo.d.sneak} />
					<span>Smygläge: visa inte mina besök på andras profiler</span>
				</label>
			</Box>
			<Box title="Topp 8 platser" icon="tree">
				<ol class="plain top8 places">
					{#each u.topPlaces as pid, i (pid)}
						{@const pl = placeById(pid)}
						<li><a href="/kartan"><span class="pl-tile"><Scene scene={pl?.scene ?? 'solnedgang'} alt={null} /><span class="num rank">{i + 1}</span></span><span class="xs">{pl?.name}</span></a></li>
					{/each}
				</ol>
			</Box>
		</div>

		<div class="stack">
			<Box title={`Om ${isMe ? 'mig' : u.name}`} icon="book">
				<p class="about">{u.about}</p>
			</Box>
			<Box title={`${u.name}s Topp 8 polare`} icon="group">
				<ol class="plain top8 friends">
					{#each u.topFriends as fid (fid)}
						<li>
							<a href={`/profil/${fid}`}>
								<Avatar id={fid} size={64} />
								<span class="xs">{userById(fid)?.name}</span>
							</a>
						</li>
					{/each}
				</ol>
			</Box>
			<Box title="Gästbok" icon="book" id="gastbok">
				{#snippet extra()}<span class="num">{entries.length}</span> inlägg{/snippet}
				<form class="gb-form" onsubmit={write}>
					<label for="gb-text" class="label">Skriv något till {isMe ? 'dig själv (eller låt bli)' : u.name}</label>
					<textarea id="gb-text" maxlength="300" bind:value={text}></textarea>
					<button type="submit" class="btn btn-small btn-primary">Skriv i gästboken</button>
				</form>
				<ul class="plain item-list">
					{#each entries as e, i (i)}
						<li class="gb">
							<Avatar id={e.by} size={36} />
							<div>
								<p class="small gb-head">
									<UserLink id={e.by} /> <span class="muted">· {agoLabel(e.ago, demo.now)}</span>
									{#if isMe && i - (demo.d.guestbook[u.id]?.length ?? 0) >= 0 && i - (demo.d.guestbook[u.id]?.length ?? 0) < newCount}<span class="tag warn">Ny!</span>{/if}
								</p>
								<p class="gb-text">{e.text}</p>
							</div>
						</li>
					{/each}
				</ul>
			</Box>
		</div>
	</div>
</div>

<style>
	/* Profilteman – bara inom profilen, AA-kontrast i båda sajtteman. */
	.theme-solnedgang {
		--head-from: #fde5d6;
		--head-to: #f6c4a5;
		--head-text: #6b2410;
		--head-border: #df9874;
		--accent: #b13d0e;
		--accent-hover: #93320b;
		--accent-soft: #fde8dc;
		--link: #9a3412;
		--link-visited: #7c2d12;
		--surface-2: #fff6f0;
	}

	.theme-granskog {
		--head-from: #dcefe0;
		--head-to: #bcdac4;
		--head-text: #163d23;
		--head-border: #8bbd98;
		--accent: #1b6633;
		--accent-hover: #15532a;
		--accent-soft: #e1f2e5;
		--link: #17602f;
		--link-visited: #134d26;
		--surface-2: #f2faf4;
	}

	:global([data-theme='dark']) .theme-solnedgang {
		--head-from: #40201a;
		--head-to: #2f1712;
		--head-text: #ffd5c2;
		--head-border: #6e3527;
		--accent: #ff9f73;
		--accent-hover: #ffb894;
		--accent-soft: #3a1c14;
		--link: #ffb08a;
		--link-visited: #ffc9ad;
		--surface-2: #1e1513;
	}

	:global([data-theme='dark']) .theme-granskog {
		--head-from: #183826;
		--head-to: #10291b;
		--head-text: #c9f0d4;
		--head-border: #2d5c3d;
		--accent: #6fd08f;
		--accent-hover: #93ddab;
		--accent-soft: #12301f;
		--link: #8fe0a8;
		--link-visited: #b4ecc5;
		--surface-2: #111f17;
	}

	.p-title {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-2) var(--space-3);
	}

	.badge {
		display: inline-flex;
		align-items: center;
		padding: 2px 10px 3px;
		font-family: var(--font-body);
		font-size: var(--text-sm);
		font-weight: 700;
		letter-spacing: 0.02em;
		color: #3b2a00;
		background: linear-gradient(#ffe58a, #f2c14e);
		border: 1px solid #b88a1e;
		border-radius: var(--radius-sm);
		box-shadow: inset 0 -2px 0 rgb(0 0 0 / 0.12);
	}

	.profile {
		color: var(--text);
	}

	.theme-pick {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2) var(--space-3);
		background: var(--surface);
		margin-bottom: var(--space-3);
	}

	.tp {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-size: var(--text-sm);
		cursor: pointer;
	}

	.swatch {
		width: 16px;
		height: 16px;
		border: 1px solid var(--border-strong);
		border-radius: 3px;
	}

	.s-klassisk {
		background: linear-gradient(#e3ecf9, #1b56c4);
	}

	.s-solnedgang {
		background: linear-gradient(#fde5d6, #b13d0e);
	}

	.s-granskog {
		background: linear-gradient(#dcefe0, #1b6633);
	}

	.p-grid {
		display: grid;
		gap: var(--space-4);
		align-items: start;
	}

	@media (min-width: 860px) {
		.p-grid {
			grid-template-columns: 320px minmax(0, 1fr);
		}
	}

	.pic {
		margin-bottom: var(--space-2);
	}

	.status {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.facts {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 2px var(--space-3);
		margin: 0 0 var(--space-2);
	}

	.facts dt {
		font-weight: 700;
	}

	.facts dd {
		margin: 0;
	}

	.song {
		padding: 6px 8px;
		background: var(--surface-2);
		border: 1px dashed var(--head-border);
		border-radius: var(--radius-sm);
	}

	.about {
		margin: 0;
		white-space: pre-line;
	}

	.top8 {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: var(--space-2);
	}

	.top8 a {
		display: grid;
		justify-items: center;
		gap: 4px;
		text-align: center;
		overflow-wrap: break-word;
		hyphens: auto;
	}

	.pl-tile {
		position: relative;
		display: block;
		width: 100%;
		max-width: 72px;
		padding: 3px;
		background: var(--photo-frame);
		border: 1px solid var(--border);
		border-radius: 2px;
		box-shadow: var(--shadow-sm);
	}

	.rank {
		position: absolute;
		top: -6px;
		left: -6px;
		display: grid;
		place-items: center;
		min-width: 18px;
		height: 18px;
		font-size: 10px;
		color: var(--accent-text);
		background: var(--accent);
		border-radius: 50%;
	}

	.visitors {
		display: grid;
		gap: var(--space-2);
		margin-bottom: var(--space-3);
	}

	.visitors li {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		line-height: 1.3;
	}

	.sneak {
		margin: 0;
	}

	.gb-form {
		display: grid;
		gap: 6px;
		margin-bottom: var(--space-3);
	}

	.gb-form button {
		justify-self: start;
	}

	.gb {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr);
		gap: var(--space-2);
	}

	.gb-head,
	.gb-text {
		margin: 0;
	}
</style>
