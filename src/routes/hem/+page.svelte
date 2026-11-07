<script lang="ts">
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
	import Scene from '#lib/components/Scene.svelte';
	import { SCENE_TITLES, sceneNames } from '#lib/illustrations.ts';

	const PER_PAGE = 4;
	let pageNo = $state(1);
	const allPosts = $derived([...demo.d.myPosts, ...diary]);
	const pages = $derived(Math.ceil(allPosts.length / PER_PAGE));
	const posts = $derived(allPosts.slice((pageNo - 1) * PER_PAGE, pageNo * PER_PAGE));

	let postText = $state('');
	let postScene = $state('');
	let pickOpen = $state(false);

	function writePost(e: SubmitEvent) {
		e.preventDefault();
		const text = postText.trim();
		if (!text) return;
		demo.addPost(text, postScene || undefined, postScene ? SCENE_TITLES[postScene] : undefined);
		postText = '';
		postScene = '';
		pickOpen = false;
		pageNo = 1;
	}

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

	const season = $derived(demo.season);
	const weatherIcon = $derived({ regn: 'rain', snö: 'snow', sol: 'sun', moln: 'cloud' }[season.weather]);

	function saveMsn(e: SubmitEvent) {
		e.preventDefault();
		demo.d.msn = msnDraft.slice(0, 80);
		msnSaved = true;
		setTimeout(() => (msnSaved = false), 2500);
	}

	function toggleSchysst(id: string) {
		demo.d.schysst[id] = !demo.d.schysst[id];
	}
</script>

<svelte:head><title>Hem – {SITE_NAME}</title></svelte:head>

<div class="page-head">
	<h1>Hej Gubben940!</h1>
	<p>Klockan är <span class="num">{nowLabel(demo.now)}</span> <span class="xs">(demotid)</span>. Vad sägs om att hitta på något i stället för att scrolla?</p>
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

		<Box title="Dagboken" icon="book" id="dagboken">
			{#snippet extra()}bara vänner{/snippet}
			<form class="composer" onsubmit={writePost}>
				<label for="post-text" class="label">Skriv i dagboken</label>
				<textarea id="post-text" maxlength="500" bind:value={postText} placeholder="Vad har du hittat på i dag?"></textarea>
				{#if pickOpen}
					<fieldset class="pick">
						<legend>Välj en bild</legend>
						<label class="pick-opt none"><input type="radio" name="post-scene" value="" bind:group={postScene} /><span>Ingen bild</span></label>
						{#each sceneNames as sc (sc)}
							<label class="pick-opt">
								<input type="radio" name="post-scene" value={sc} bind:group={postScene} />
								<span class="pick-img"><Scene scene={sc} alt={null} /></span>
								<span class="sr-only">{SCENE_TITLES[sc]}</span>
							</label>
						{/each}
					</fieldset>
				{/if}
				<div class="spread">
					<button type="button" class="linkbtn small" aria-expanded={pickOpen} onclick={() => (pickOpen = !pickOpen)}>
						<Icon name="camera" size={12} />
						{postScene ? `Bild: ${SCENE_TITLES[postScene]}` : 'Lägg till bild'}
					</button>
					<button type="submit" class="btn btn-small btn-primary">Publicera</button>
				</div>
				<p class="xs muted">Syns bara för dina vänner. Bara du ser hur många som tycker att det är schysst.</p>
			</form>
			<ul class="plain item-list diary">
				{#each posts as post (post.id)}
					{@const mine = post.by === ME_ID}
					{@const liked = !!demo.d.schysst[post.id]}
					<li class="post">
						<Avatar id={post.by} size={44} />
						<div class="post-body">
							<p class="post-head small"><UserLink id={post.by} /> <span class="muted">· {post.ago}</span></p>
							<p class="post-text">{post.text}</p>
							{#if post.photo}
								<div class="post-photo"><Photo caption={post.photo.caption} scene={post.photo.scene} /></div>
							{/if}
							<div class="row">
								<button
									type="button"
									class="btn btn-small"
									class:btn-done={liked}
									aria-pressed={liked}
									onclick={() => toggleSchysst(post.id)}
								>
									<Icon name="heart" size={12} /> {liked ? 'Schysst ✓' : 'Schysst'}
								</button>
								{#if mine}
									<span class="small"><strong class="num">{post.schysst + (liked ? 1 : 0)}</strong> tycker det är schysst <span class="muted">(syns bara för dig)</span></span>
								{/if}
							</div>
						</div>
					</li>
				{/each}
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
			{#snippet extra()}<span class="num">{onlineFriends.length}</span>{/snippet}
			<ul class="plain friends">
				{#each onlineFriends as u (u.id)}
					<li>
						<UserLink id={u.id} dot />
						<span class="msn xs">{u.status}</span>
					</li>
				{/each}
			</ul>
		</Box>

		<Box title="Västerås idag" icon={weatherIcon}>
			<p class="today-date small">{season.dateText}</p>
			<p class="today-temp"><span class="num big">{season.temp}°</span> <span>{season.weatherText}</span></p>
			<p class="small">Solen går ner <span class="num">{season.sunset}</span>.</p>
			<p class="small"><strong class="num">{spontaneous.length}</strong> saker händer de närmaste sex timmarna.</p>
			<p class="xs muted">Vädret är ett exempel – i demon är det påhittat.</p>
		</Box>
	</aside>
</div>

<style>
	.composer {
		display: grid;
		gap: 6px;
		margin-bottom: var(--space-4);
		padding-bottom: var(--space-3);
		border-bottom: 1px solid var(--border);
	}

	.composer textarea {
		min-height: 72px;
	}

	.composer p {
		margin: 0;
	}

	.pick {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(64px, 1fr));
		gap: 6px;
		margin: 0;
	}

	.pick-opt {
		position: relative;
		display: grid;
		place-items: center;
		min-height: 64px;
		padding: 3px;
		background: var(--photo-frame);
		border: 2px solid var(--border);
		border-radius: var(--radius-sm);
		cursor: pointer;
	}

	.pick-opt input {
		position: absolute;
		opacity: 0;
		width: 1px;
		height: 1px;
	}

	.pick-img {
		display: block;
		width: 100%;
	}

	.pick-opt.none span {
		font-size: var(--text-xs);
		color: #333;
		text-align: center;
	}

	.pick-opt:has(input:checked) {
		border-color: var(--accent);
		box-shadow: 0 0 0 2px var(--accent);
	}

	.pick-opt:has(input:focus-visible) {
		outline: 3px solid var(--focus);
		outline-offset: 2px;
	}

	.spont {
		display: grid;
		gap: var(--space-2);
	}

	.post {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr);
		gap: var(--space-3);
	}

	.post-head {
		margin: 0 0 4px;
	}

	.post-text {
		margin: 0 0 var(--space-2);
	}

	.post-photo {
		max-width: 220px;
		margin-bottom: var(--space-2);
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
