<script lang="ts">
	import { goto } from '$app/navigation';
	import { ME_ID, SITE_NAME } from '#lib/config.ts';
	import { myFriends, userById } from '#lib/mock.ts';
	import { demo, whenLabel } from '#lib/state.svelte.ts';
	import { membersOf, threadsOf } from '#lib/groups.ts';
	import { agoLabel, since } from '#lib/time.ts';
	import ActivityCard from '#lib/components/ActivityCard.svelte';
	import Avatar from '#lib/components/Avatar.svelte';
	import Box from '#lib/components/Box.svelte';
	import FriendButton from '#lib/components/FriendButton.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import Scene from '#lib/components/Scene.svelte';
	import UserImage from '#lib/components/UserImage.svelte';
	import UserLink from '#lib/components/UserLink.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const g = $derived(demo.findGroup(data.id));
	const status = $derived(g ? demo.d.groups[g.id] : undefined);
	const isMod = $derived(status === 'mod');
	const isMember = $derived(status === 'member' || status === 'mod');
	const members = $derived(g ? membersOf(g) : []);
	const memberCount = $derived(g ? (g.mine ? members.length : g.members + (isMember ? 1 : 0)) : 0);
	const invited = $derived(g ? (demo.d.groupInvites[g.id] ?? []) : []);
	const meets = $derived(
		g
			? demo.allActivities
					.filter((a) => a.groupId === g.id && demo.minutesUntil(a) >= -90)
					.sort((x, y) => demo.minutesUntil(x) - demo.minutesUntil(y))
			: []
	);
	const threads = $derived(g ? threadsOf(g) : []);
	const apps = $derived(g ? (demo.d.groupApps[g.id] ?? []) : []);
	const friendIds = $derived(
		[...new Set([...myFriends, ...Object.keys(demo.d.friends)])].filter((id) => demo.isFriend(id) && !members.includes(id))
	);

	function join() {
		if (!g) return;
		if (status) delete demo.d.groups[g.id];
		else demo.d.groups[g.id] = g.open ? 'member' : 'pending';
	}

	// Bjud in vänner
	let inviteDlg: HTMLDialogElement | undefined = $state();
	let picked = $state<string[]>([]);
	function sendInvites(e: SubmitEvent) {
		e.preventDefault();
		if (!g || !picked.length) return;
		demo.d.groupInvites[g.id] = [...new Set([...invited, ...picked])];
		demo.toast(`Inbjudan skickad till ${picked.length} ${picked.length === 1 ? 'vän' : 'vänner'}.`);
		picked = [];
		inviteDlg?.close();
	}

	function noteForGroup() {
		if (!g) return;
		demo.d.draft = { title: '', place: '', bring: '', groupId: g.id };
		goto('/anslagstavlan#ny-lapp');
	}

	// Gruppens forum
	let tTitle = $state('');
	let tText = $state('');
	let tError = $state('');
	function newThread(e: SubmitEvent) {
		e.preventDefault();
		if (!g) return;
		if (!tTitle.trim() || !tText.trim()) return (tError = 'Skriv både rubrik och text.');
		const id = demo.createThread('', tTitle.trim(), tText.trim(), undefined, g.id);
		tTitle = tText = tError = '';
		goto(`/forum/trad/${id}`);
	}

	function decide(i: number, ok: boolean) {
		if (!g) return;
		const list = [...apps];
		list[i] = { ...list[i], status: ok ? 'ok' : 'nej' };
		demo.d.groupApps[g.id] = list;
		const name = userById(list[i].by)?.name;
		demo.toast(ok ? `${name} är nu med i ${g.name}.` : `Ansökan från ${name} är nekad. Hen får en vänlig motivering.`);
	}
</script>

<svelte:head><title>{g?.name ?? 'Gruppen'} – {SITE_NAME}</title></svelte:head>

<p class="crumbs small"><a href="/grupper">Grupper</a> › {g?.name ?? ''}</p>

{#if !g}
	<div class="page-head">
		<h1>{demo.ready ? 'Gruppen finns inte' : 'Gruppen'}</h1>
		{#if demo.ready}<p>Den kan ha tagits bort, eller så finns den bara i någon annans webbläsare (i demon sparas egna grupper lokalt).</p>{/if}
	</div>
{:else}
	<header class="g-head">
		<div class="cover">
			{#if g.cover}<UserImage id={g.cover.id} alt={g.cover.alt} square />{:else}<Scene scene={g.scene ?? 'kubb'} alt={null} />{/if}
		</div>
		<div class="g-info">
			<h1 class="g-title">{g.name}</h1>
			<p class="g-meta small">
				<span class="tag"><Icon name={g.open ? 'globe' : 'lock'} size={10} /> {g.open ? 'Öppen grupp' : 'Sluten grupp'}</span>
				<span><span class="num">{memberCount}</span> {memberCount === 1 ? 'medlem' : 'medlemmar'}</span>
				{#if isMod}<span class="tag warn">Du är moderator</span>{/if}
			</p>
			<p class="g-text">{g.text}</p>
			{#if g.mine}
				<p class="notice draft small">I demon skapades gruppen direkt. I den riktiga sajten godkänner en moderator nya grupper först.</p>
			{/if}
			<div class="row">
				{#if !isMod}
					{#if status === 'member'}
						<span class="tag"><Icon name="check" size={10} /> Du är med</span>
						<button type="button" class="linkbtn small" onclick={join}>Lämna gruppen</button>
					{:else if status === 'pending'}
						<span class="small"><em>Ansökan skickad – inväntar gruppens moderatorer</em></span>
						<button type="button" class="linkbtn small" onclick={join}>Dra tillbaka</button>
					{:else}
						<button type="button" class="btn btn-primary" onclick={join}>{g.open ? 'Gå med' : 'Ansök'}</button>
					{/if}
				{/if}
				{#if isMember}
					<button type="button" class="btn" onclick={() => inviteDlg?.showModal()} data-testid="invite"><Icon name="group" size={12} /> Bjud in vänner</button>
					<button type="button" class="btn" onclick={noteForGroup}><Icon name="board" size={12} /> Sätt upp en lapp för gruppen</button>
				{/if}
			</div>
		</div>
	</header>

	<div class="grid-main">
		<div class="stack">
			<Box title="Kommande träffar" icon="calendar" id="traffar">
				{#if meets.length}
					<ul class="plain list-cards">
						{#each meets as a (a.id)}<li><ActivityCard {a} compact /></li>{/each}
					</ul>
				{:else}
					<p class="small muted">Inga träffar planerade än.</p>
					{#if isMember}<button type="button" class="btn btn-small" onclick={noteForGroup}>Sätt upp den första lappen</button>{/if}
				{/if}
			</Box>

			<Box title="Gruppens forum" icon="forum" id="gruppforum">
				{#if threads.length}
					<ul class="plain item-list threads">
						{#each threads as t (t.id)}
							<li>
								<a href={`/forum/trad/${t.id}`}><strong>{t.title}</strong></a>
								<span class="xs muted">av {userById(t.by)?.name} · {t.posts.length} inlägg · senast {agoLabel(since(t.posts[t.posts.length - 1], demo.now), demo.now)}</span>
							</li>
						{/each}
					</ul>
				{:else}
					<p class="small muted">Inga trådar än. Starta den första!</p>
				{/if}
				{#if isMember}
					<form class="t-form" onsubmit={newThread}>
						<h3 class="t-h">Ny tråd i gruppen</h3>
						<label for="gt-title" class="label">Rubrik</label>
						<input id="gt-title" type="text" maxlength="80" bind:value={tTitle} />
						<label for="gt-text" class="label">Text</label>
						<textarea id="gt-text" maxlength="1000" bind:value={tText}></textarea>
						{#if tError}<p class="notice err small" role="alert">{tError}</p>{/if}
						<button type="submit" class="btn btn-small btn-primary">Starta tråden</button>
					</form>
				{:else}
					<p class="xs muted">Gå med i gruppen för att skriva i forumet.</p>
				{/if}
			</Box>
		</div>

		<aside class="stack" aria-label="Medlemmar">
			{#if isMod && !g.open}
				<Box title="Ansökningar" icon="lock" id="ansokningar">
					{#if apps.length}
						<ul class="plain item-list">
							{#each apps as ap, i (ap.by)}
								<li class="app">
									<p class="small"><UserLink id={ap.by} /> vill gå med:</p>
									<p class="msn small">"{ap.text}"</p>
									{#if ap.status}
										<span class="tag" class:warn={ap.status === 'nej'}>{ap.status === 'ok' ? 'Godkänd' : 'Nekad'}</span>
									{:else}
										<div class="row">
											<button type="button" class="btn btn-small btn-done" onclick={() => decide(i, true)}>Godkänn</button>
											<button type="button" class="btn btn-small btn-danger" onclick={() => decide(i, false)}>Neka</button>
										</div>
									{/if}
								</li>
							{/each}
						</ul>
					{:else}
						<p class="small muted">Inga ansökningar just nu. När någon ansöker syns det här.</p>
					{/if}
				</Box>
			{/if}
			<Box title="Medlemmar" icon="group" id="medlemmar">
				<ul class="plain members">
					{#each members as id (id)}
						<li>
							<Avatar {id} size={32} />
							<span class="small">{#if id === ME_ID}<strong>Du</strong>{#if isMod} (moderator){/if}{:else}<UserLink {id} /> <FriendButton {id} compact />{/if}</span>
						</li>
					{/each}
					{#each invited as id (id)}
						<li><Avatar {id} size={32} /><span class="small"><UserLink {id} /> <span class="tag">inbjuden</span></span></li>
					{/each}
				</ul>
			</Box>
		</aside>
	</div>

	<dialog bind:this={inviteDlg} class="dlg" aria-labelledby="inv-title">
		<form onsubmit={sendInvites}>
			<h2 id="inv-title" class="dlg-title">Bjud in vänner till {g.name}</h2>
			{#if friendIds.length}
				<fieldset>
					<legend class="sr-only">Välj vänner</legend>
					{#each friendIds as id (id)}
						<label class="check inv"><input type="checkbox" value={id} bind:group={picked} /> <Avatar {id} size={28} /> {userById(id)?.name}</label>
					{/each}
				</fieldset>
			{:else}
				<p>Alla dina vänner är redan med.</p>
			{/if}
			<div class="row">
				<button type="submit" class="btn btn-primary" disabled={!picked.length}>Skicka inbjudan</button>
				<button type="button" class="btn" onclick={() => inviteDlg?.close()}>Avbryt</button>
			</div>
		</form>
	</dialog>
{/if}

<style>
	.crumbs {
		margin-bottom: var(--space-2);
	}

	.g-head {
		display: grid;
		grid-template-columns: 160px minmax(0, 1fr);
		gap: var(--space-4);
		align-items: start;
		margin-bottom: var(--space-4);
	}

	@media (max-width: 600px) {
		.g-head {
			grid-template-columns: 1fr;
		}

		.cover {
			max-width: 160px;
		}
	}

	.cover {
		padding: 6px;
		background: var(--photo-frame);
		border: 1px solid var(--border);
		box-shadow: var(--shadow);
		transform: rotate(-2deg);
	}

	.g-title {
		margin-bottom: var(--space-2);
	}

	.g-meta {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-2);
	}

	.g-text {
		font-size: var(--text-lg);
		max-width: 60ch;
	}

	.list-cards {
		display: grid;
		gap: var(--space-2);
	}

	.threads li {
		display: grid;
		gap: 2px;
	}

	.t-form {
		display: grid;
		gap: 6px;
		margin-top: var(--space-3);
		padding-top: var(--space-3);
		border-top: 1px dashed var(--border);
	}

	.t-h {
		font-size: var(--text-md);
		margin: 0;
	}

	.t-form button {
		justify-self: start;
	}

	.members {
		display: grid;
		gap: var(--space-2);
	}

	.members li {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.app p {
		margin: 0 0 4px;
	}

	.dlg {
		width: min(420px, calc(100vw - 24px));
		padding: var(--space-4);
		color: var(--text);
		background: var(--surface);
		border: 1px solid var(--head-border);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow);
	}

	.dlg::backdrop {
		background: rgb(7 13 25 / 0.45);
	}

	.dlg-title {
		font-size: var(--text-lg);
	}

	.inv {
		align-items: center;
		padding: 4px 0;
	}
</style>
