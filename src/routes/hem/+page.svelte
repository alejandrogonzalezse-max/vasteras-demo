<script lang="ts">
	import { isDark, minutesAgo, parts } from '#lib/time.ts';
	import { weather } from '#lib/weather.svelte.ts';
	import { ME_ID, SITE_NAME } from '#lib/config.ts';
	import { diary, friendRequest, myFriends, userById } from '#lib/mock.ts';
	import { demo, nowLabel } from '#lib/state.svelte.ts';
	import ActivityCard from '#lib/components/ActivityCard.svelte';
	import Avatar from '#lib/components/Avatar.svelte';
	import Box from '#lib/components/Box.svelte';
	import Dice from '#lib/components/Dice.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import Pager from '#lib/components/Pager.svelte';
	import Photo from '#lib/components/Photo.svelte';
	import UserLink from '#lib/components/UserLink.svelte';
	import DiaryComposer from '#lib/components/DiaryComposer.svelte';
	import DiaryPostView from '#lib/components/DiaryPostView.svelte';
	import { nudge } from '#lib/nudge.ts';

	const PER_PAGE = 4;
	let pageNo = $state(1);
	// Vännernas dagböcker: dina inlägg (inte de privata) och dina vänners.
	const allPosts = $derived(
		[...demo.d.myPosts.filter((p) => p.visibility !== 'privat'), ...diary.filter((p) => p.by === ME_ID || demo.isFriend(p.by))].sort(
			(a, b) => minutesAgo(a, demo.now) - minutesAgo(b, demo.now)
		)
	);
	const pages = $derived(Math.max(1, Math.ceil(allPosts.length / PER_PAGE)));
	const posts = $derived(allPosts.slice((pageNo - 1) * PER_PAGE, pageNo * PER_PAGE));


	const spontaneous = $derived(
		demo.allActivities
			.map((a) => ({ a, m: demo.minutesUntil(a) }))
			.filter(({ m }) => m >= -30 && m <= 360)
			.sort((x, y) => x.m - y.m)
			.map(({ a }) => a)
	);

	let msnDraft = $state('');
	let msnSaved = $state(false);
	$effect(() => {
		if (demo.ready) msnDraft = demo.d.msn;
	});

	const onlineFriends = $derived(
		[...myFriends, ...(demo.d.friendRequest === 'accepted' ? [friendRequest.from] : [])]
			.map((id) => userById(id)!)
			.filter((u) => u.presence !== 'off')
			.sort((a, b) => (a.presence === b.presence ? 0 : a.presence === 'on' ? -1 : 1))
	);

	const season = $derived(demo.today);
	const weatherIcon = $derived(
		season.weather === 'sol' && isDark(demo.now, season.sunset)
			? 'moon'
			: { regn: 'rain', snö: 'snow', sol: 'sun', moln: 'cloud' }[season.weather]
	);

	function saveMsn(e: SubmitEvent) {
		e.preventDefault();
		demo.d.msn = msnDraft.slice(0, 80);
		msnSaved = true;
		setTimeout(() => (msnSaved = false), 2500);
	}

	function knuffa(id: string) {
		nudge(document.getElementById(`van-${id}`));
		demo.knuff(id, () => nudge(document.querySelector('main')));
	}

	function greeting(now: number) {
		const h = parts(now).h;
		return h < 5 ? 'God natt' : h < 10 ? 'God morgon' : h < 17 ? 'Hej' : 'God kväll';
	}

	function toggleSchysst(id: string) {
		demo.d.schysst[id] = !demo.d.schysst[id];
	}
</script>

<svelte:head><title>Hem – {SITE_NAME}</title></svelte:head>

<div class="page-head">
	<h1>{greeting(demo.now)}, Gubben940!</h1>
	<p>Klockan är <span class="num">{nowLabel(demo.now)}</span>. Vad sägs om att hitta på något i stället för att scrolla?</p>
</div>

<div class="grid-main">
	<div class="stack">
		<Dice />

		<Box title="Spontant just nu" icon="clock" id="spontant">
			{#snippet extra()}inom 6 timmar{/snippet}
			{#if spontaneous.length}
				<ul class="plain spont">
					{#each spontaneous as a (a.id)}
						<li><ActivityCard {a} compact /></li>
					{/each}
				</ul>
			{:else}
				<p>Inget planerat de närmaste timmarna. <a href="/anslagstavlan#ny-lapp">Sätt upp en lapp!</a></p>
			{/if}
		</Box>

		<Box title="Vännernas dagböcker" icon="book" id="dagboken">
			{#snippet extra()}<a href={`/profil/${ME_ID}#dagbok`}>Min dagbok</a>{/snippet}
			<DiaryComposer onposted={() => (pageNo = 1)} />
			<ul class="plain item-list diary">
				{#each posts as post (post.id)}<DiaryPostView {post} />{/each}
			</ul>
			{#if pageNo === pages}
				<p class="notice ok caught-up" role="status">
					<strong>Du är ikapp!</strong> Dags att stänga datorn och gå ut? <a href="/kartan">Se vad som händer på kartan</a>.
				</p>
			{/if}
			<div class="pager-row"><Pager total={pages} bind:current={pageNo} label="Dagbokens sidor" /></div>
		</Box>
	</div>

	<aside class="stack" aria-label="Sidokolumn">
		<Box title="Min status" icon="user" level={2}>
			<p class="msn current">
				<span class="dot"></span> <span>{demo.d.msn || 'Ingen status'}</span>
			</p>
			<form onsubmit={saveMsn}>
				<label for="msn" class="label">Ny MSN-status</label>
				<input id="msn" type="text" maxlength="80" bind:value={msnDraft} aria-describedby="msn-count" />
				<div class="spread msn-foot">
					<span id="msn-count" class="xs muted num">{msnDraft.length}/80</span>
					<button type="submit" class="btn btn-small">Spara</button>
				</div>
				{#if msnSaved}<p class="xs" role="status">Sparad!</p>{/if}
			</form>
		</Box>

		<Box title="Vänförfrågan" icon="plus" id="vanforfragan">
			{#if demo.d.friendRequest === null}
				<div class="req">
					<Avatar id={friendRequest.from} size={40} />
					<div>
						<p class="small"><UserLink id={friendRequest.from} /> vill bli din vän.</p>
						<p class="msn small">"{friendRequest.message}"</p>
					</div>
				</div>
				<div class="row">
					<button type="button" class="btn btn-small btn-primary" onclick={() => (demo.d.friendRequest = 'accepted')}>Godkänn</button>
					<button type="button" class="btn btn-small" onclick={() => (demo.d.friendRequest = 'declined')}>Nej tack</button>
				</div>
			{:else if demo.d.friendRequest === 'accepted'}
				<p class="small" role="status">Du och <UserLink id={friendRequest.from} /> är nu vänner. Tobbe ser din dagbok från och med nu.</p>
			{:else}
				<p class="small" role="status">Förfrågan nekad. Tobbe får inget meddelande om det.</p>
			{/if}
		</Box>

		<Box title="Inloggade vänner" icon="group">
			{#snippet extra()}<span class="num">{onlineFriends.length}</span> · <a href="/vanner">Hitta vänner</a>{/snippet}
			<ul class="plain friends">
				{#each onlineFriends as u (u.id)}
					<li id={`van-${u.id}`}>
						<span class="f-top">
							<UserLink id={u.id} dot />
							<button type="button" class="linkbtn xs knuff" onclick={() => knuffa(u.id)} aria-label={`Knuffa ${u.name}`}>Knuffa</button>
						</span>
						<span class="msn xs">{u.status}</span>
					</li>
				{/each}
			</ul>
		</Box>

		<Box title="Västerås idag" icon={weatherIcon}>
			<p class="today-date small">{season.dateText}{season.holidayText ? ` · ${season.holidayText}` : ''}</p>
			<p class="today-temp" data-testid="today-weather"><span class="num big">{season.temp}°</span> <span>{season.weatherText}</span></p>
			<p class="small">Solen går ner <span class="num">{season.sunset}</span>.</p>
			<p class="small"><strong class="num">{spontaneous.length}</strong> saker händer de närmaste sex timmarna.</p>
			{#if season.source === 'smhi'}
				<p class="xs muted">Källa: <a href="https://www.smhi.se/vader/prognoser/ortsprognoser" rel="noopener">SMHI</a>, prognos för Västerås.</p>
			{:else if weather.status === 'done'}
				<p class="xs muted">Vädret är ett exempel – SMHI gick inte att nå just nu.</p>
			{:else}
				<p class="xs muted">Hämtar väder från SMHI…</p>
			{/if}
		</Box>
	</aside>
</div>

<style>










	.spont {
		display: grid;
		gap: var(--space-2);
	}





	.caught-up {
		margin: var(--space-3) 0;
	}

	.pager-row {
		margin-top: var(--space-3);
	}

	.current {
		display: flex;
		align-items: center;
		gap: 6px;
		margin-bottom: var(--space-2);
	}

	.msn-foot {
		margin-top: 6px;
	}

	.req {
		display: flex;
		gap: var(--space-2);
		margin-bottom: var(--space-2);
	}

	.req p {
		margin: 0 0 4px;
	}

	.friends {
		display: grid;
		gap: var(--space-2);
	}

	.friends li {
		display: grid;
		gap: 0;
		padding: 2px 4px;
		margin: -2px -4px;
	}

	.f-top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-2);
	}

	.knuff {
		min-height: 24px;
		padding: 0 4px;
	}

	.friends .msn {
		padding-left: 16px;
	}

	.today-date {
		margin: 0;
		color: var(--text-muted);
	}

	.today-temp {
		display: flex;
		align-items: baseline;
		gap: var(--space-2);
		margin: 0 0 var(--space-2);
	}

	.big {
		font-size: var(--text-3xl);
		line-height: 1;
	}
</style>
