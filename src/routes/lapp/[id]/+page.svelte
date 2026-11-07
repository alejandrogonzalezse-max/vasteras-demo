<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { ME_ID, SITE_NAME } from '#lib/config.ts';
	import { afterGrill, userById } from '#lib/mock.ts';
	import { demo, whenLabel, type GuestEntry } from '#lib/state.svelte.ts';
	import { agoLabel, clock, dateText, since } from '#lib/time.ts';
	import { forecastAt } from '#lib/weather.svelte.ts';
	import { addToCalendar, commentCount, shareLapp } from '#lib/lapp.ts';
	import Avatar from '#lib/components/Avatar.svelte';
	import Box from '#lib/components/Box.svelte';
	import FriendButton from '#lib/components/FriendButton.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import ImageUpload, { missingAlt, saveUploads, type UploadItem } from '#lib/components/ImageUpload.svelte';
	import LappComments from '#lib/components/LappComments.svelte';
	import MiniMap from '#lib/components/MiniMap.svelte';
	import Photo from '#lib/components/Photo.svelte';
	import UserImage from '#lib/components/UserImage.svelte';
	import UserLink from '#lib/components/UserLink.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const a = $derived(demo.findActivity(data.id));
	const mins = $derived(a ? demo.minutesUntil(a) : 0);
	const start = $derived(demo.now + mins * 60000);
	const past = $derived(mins < -180);
	const going = $derived(a ? demo.isAttending(a) : false);
	const maybe = $derived(a ? demo.isMaybe(a) : false);
	const people = $derived(a ? demo.attendeesOf(a) : []);
	const maybes = $derived(a && maybe ? [ME_ID] : []);
	const group = $derived(a?.groupId ? demo.findGroup(a.groupId) : undefined);
	const wx = $derived(a && !past ? forecastAt(start) : null);
	const author = $derived(a ? userById(a.by) : undefined);

	const visibilityText = $derived(
		!a
			? ''
			: a.visibility === 'alla'
				? 'Alla på Västeråsarna ser lappen.'
				: a.visibility === 'vänner'
					? `Bara ${author?.name ?? 'värdens'}s vänner ser lappen.`
					: `Bara gruppen ${group?.name ?? ''} ser lappen.`
	);

	// Tillbaka dit man kom ifrån (om man kom från sajten), annars till anslagstavlan.
	let back = $state<string | null>(null);
	afterNavigate(({ from }) => {
		if (from?.url && from.url.pathname !== location.pathname) back = from.url.pathname + from.url.search + from.url.hash;
	});

	// Gästboken efteråt
	const after = $derived(a ? (demo.d.afterPosts[a.id] ?? []) : []);
	const seedAfter = $derived(a?.id === afterGrill.activityId ? afterGrill : null);
	let gbText = $state('');
	let gbImages = $state<UploadItem[]>([]);
	let gbError = $state('');
	let gbBusy = $state(false);

	async function postAfter(e: SubmitEvent) {
		e.preventDefault();
		if (!a) return;
		gbError = '';
		if (!gbText.trim() && !gbImages.length) return (gbError = 'Skriv en hälsning eller lägg till en bild.');
		if (missingAlt(gbImages)) return (gbError = 'Skriv en kort bildtext till varje bild – den behövs för den som inte ser bilden.');
		gbBusy = true;
		const images = await saveUploads(gbImages);
		demo.d.afterPosts[a.id] = [{ by: ME_ID, ago: 'nyss', at: Date.now(), text: gbText.trim(), images }, ...after];
		gbText = '';
		gbImages = [];
		gbBusy = false;
		demo.toast('Tack! Din hälsning ligger i gästboken.');
	}
</script>

<svelte:head><title>{a ? a.title : 'Lappen'} – {SITE_NAME}</title></svelte:head>

<p class="crumbs small">
	<a
		href={back ?? '/anslagstavlan'}
		onclick={(e) => {
			if (back) {
				e.preventDefault();
				history.back();
			}
		}}
		data-testid="back">← Tillbaka</a
	>
	<span class="muted"> · <a href="/anslagstavlan">Anslagstavlan</a></span>
</p>

{#if !a}
	<div class="page-head">
		<h1>{demo.ready ? 'Lappen finns inte' : 'Lappen'}</h1>
		{#if demo.ready}
			<p>Den kan ha tagits ner, eller så finns den bara i någon annans webbläsare (i demon sparas egna lappar lokalt).</p>
			<p><a class="btn" href="/anslagstavlan">Till anslagstavlan</a></p>
		{/if}
	</div>
{:else}
	<header class="page-head lapp-head">
		<p class="when display" data-testid="lapp-when">
			{past ? `Var ${agoLabel(-mins, demo.now)}` : whenLabel(mins, demo.now)}
		</p>
		<h1 class="lapp-title">{a.title}</h1>
		<p class="exact">{dateText(start)} kl {clock(Math.round(start / 900000) * 900000)} · {a.place}</p>
		<p class="tags">
			{#if a.recurring}<span class="tag">återkommer</span>{/if}
			{#if group}<a class="tag" href={`/grupp/${group.id}`}>gruppen {group.name}</a>{/if}
			{#if past}<span class="tag warn">har varit</span>{/if}
		</p>
		{#if !past}
			<div class="acts">
				<button
					type="button"
					class="btn"
					class:btn-primary={!going}
					class:btn-done={going}
					aria-pressed={going}
					onclick={() => demo.toggleAttend(a)}
				>
					{#if going}<Icon name="check" size={12} /> Du kommer ✓{:else}Jag kommer{/if}
				</button>
				<button type="button" class="btn" class:btn-done={maybe} aria-pressed={maybe} onclick={() => demo.toggleMaybe(a)}>
					{maybe ? 'Kanske ✓' : 'Kanske'}
				</button>
				<button type="button" class="btn" onclick={() => addToCalendar(a)}><Icon name="calendar" size={12} /> Lägg i kalendern</button>
				<button type="button" class="btn" onclick={() => shareLapp(a)}><Icon name="share" size={12} /> Dela</button>
			</div>
		{/if}
	</header>

	<div class="grid-main">
		<div class="stack">
			<Box title="Om lappen" icon="board">
				{#if a.text}<p class="lead-text">{a.text}</p>{/if}
				<dl class="facts">
					{#if a.bring}<dt>Ta med</dt><dd>{a.bring}</dd>{/if}
					<dt>Uppsatt av</dt>
					<dd class="author"><Avatar id={a.by} size={32} /> <UserLink id={a.by} /> <FriendButton id={a.by} compact /></dd>
					<dt>Vem ser lappen</dt>
					<dd>{visibilityText}</dd>
				</dl>
			</Box>

			<Box title={past ? 'De som kom' : 'Vilka kommer'} icon="group" id="deltagare">
				{#snippet extra()}<span class="num">{people.length}</span> {past ? 'var där' : 'kommer'}{/snippet}
				<ul class="plain people" data-testid="attendees">
					{#each people as id (id)}
						<li>
							<Avatar {id} size={40} />
							<span class="small">
								{#if id === ME_ID}<strong>Du</strong>{:else}<UserLink {id} />{/if}
								{#if id !== ME_ID}<FriendButton {id} compact />{/if}
							</span>
						</li>
					{/each}
				</ul>
				{#if maybes.length}<p class="small muted">Kanske: du.</p>{/if}
				{#if !people.length}<p class="small muted">Ingen har tryckt "Jag kommer" än. Bli först!</p>{/if}
			</Box>

			{#if past}
				<Box title="Gästboken efteråt" icon="camera" id="efterat">
					<p class="small muted">Lägg upp bilder och hälsningar från kvällen. Bara den som var där kan skriva.</p>
					{#if seedAfter}
						<ul class="plain photos">
							{#each seedAfter.photos as ph (ph.caption)}<li><Photo caption={ph.caption} scene={ph.scene} /></li>{/each}
						</ul>
					{/if}
					{#if going}
						<form class="gb-form" onsubmit={postAfter}>
							<label for="gb-after" class="label">Din hälsning</label>
							<textarea id="gb-after" maxlength="400" bind:value={gbText} placeholder="Tack för en fin kväll!"></textarea>
							<ImageUpload bind:items={gbImages} max={4} />
							{#if gbError}<p class="notice err small" role="alert">{gbError}</p>{/if}
							<button type="submit" class="btn btn-primary" disabled={gbBusy}>Lägg upp i gästboken</button>
						</form>
					{/if}
					<ul class="plain item-list gb">
						{#each [...after, ...((seedAfter?.comments ?? []) as GuestEntry[])] as c, i (i)}
							<li>
								<Avatar id={c.by} size={32} />
								<div>
									<p class="small gb-head"><UserLink id={c.by} addFriend={c.by !== ME_ID} /> <span class="muted">· {agoLabel(since(c, demo.now), demo.now)}</span></p>
									{#if c.text}<p class="gb-text">{c.text}</p>{/if}
									{#if c.images?.length}
										<ul class="plain imgs">
											{#each c.images as img (img.id)}
												<li><figure><UserImage id={img.id} alt={img.alt} square /><figcaption class="xs muted">{img.alt}</figcaption></figure></li>
											{/each}
										</ul>
									{/if}
								</div>
							</li>
						{/each}
					</ul>
				</Box>
			{/if}

			<Box title={`Kommentarer (${commentCount(a)})`} icon="forum" id="kommentarer">
				<LappComments {a} addFriend />
			</Box>
		</div>

		<aside class="stack" aria-label="Plats och väder">
			<Box title="Plats" icon="pin">
				<MiniMap lat={a.lat} lng={a.lng} label={a.place} />
				<p class="small place">{a.place}</p>
				<a class="btn btn-small" href={`/kartan?nal=${a.id}`}><Icon name="pin" size={12} /> Visa på stora kartan</a>
			</Box>
			{#if !past}
				<Box title="Väder då" icon={wx?.kind === 'regn' ? 'rain' : wx?.kind === 'snö' ? 'snow' : wx?.kind === 'moln' ? 'cloud' : 'sun'}>
					{#if wx}
						<p class="wx"><span class="num big">{wx.temp}°</span> {wx.text}</p>
						<p class="xs muted">Källa: SMHI, prognos för {clock(start)} i Västerås.</p>
					{:else}
						<p class="small">Ingen prognos för den tiden än.</p>
						<p class="xs muted">SMHI:s prognos sträcker sig cirka tio dagar fram – eller så gick SMHI inte att nå just nu.</p>
					{/if}
				</Box>
			{/if}
		</aside>
	</div>
{/if}

<style>
	.crumbs {
		margin-bottom: var(--space-2);
	}

	.lapp-head .when {
		margin: 0 0 4px;
		color: var(--head-text);
	}

	.lapp-title {
		font-family: var(--font-body);
		font-weight: 700;
		font-size: var(--text-2xl);
		margin-bottom: 4px;
	}

	.exact {
		margin: 0 0 var(--space-2);
		color: var(--text-muted);
	}

	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		margin: 0 0 var(--space-3);
	}

	.acts {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}

	.lead-text {
		font-size: var(--text-lg);
	}

	.facts {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: var(--space-2) var(--space-3);
		margin: 0;
	}

	.facts dt {
		font-weight: 700;
	}

	.facts dd {
		margin: 0;
	}

	.author {
		display: flex;
		align-items: center;
		gap: 6px;
		flex-wrap: wrap;
	}

	.people {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
		gap: var(--space-2);
	}

	.people li {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.photos {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
		gap: var(--space-3);
		margin-bottom: var(--space-3);
	}

	.gb-form {
		display: grid;
		gap: var(--space-2);
		margin-bottom: var(--space-3);
		padding-bottom: var(--space-3);
		border-bottom: 1px solid var(--border);
	}

	.gb-form button[type='submit'] {
		justify-self: start;
	}

	.gb li {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr);
		gap: var(--space-2);
	}

	.gb-head,
	.gb-text {
		margin: 0 0 4px;
	}

	.imgs {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
		gap: var(--space-2);
	}

	.imgs figure {
		margin: 0;
		padding: 4px;
		background: var(--photo-frame);
		border: 1px solid var(--border);
	}

	.imgs figcaption {
		margin-top: 4px;
		color: #46536a;
	}

	.place {
		margin: var(--space-2) 0;
	}

	.wx {
		display: flex;
		align-items: baseline;
		gap: var(--space-2);
		margin: 0 0 4px;
	}

	.big {
		font-size: var(--text-3xl);
		line-height: 1;
	}
</style>
