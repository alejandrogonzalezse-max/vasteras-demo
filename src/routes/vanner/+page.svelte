<script lang="ts">
	import { onMount } from 'svelte';
	import { ME_ID, SITE_NAME } from '#lib/config.ts';
	import { users, userById } from '#lib/mock.ts';
	import { demo } from '#lib/state.svelte.ts';
	import { membersOf } from '#lib/groups.ts';
	import { friendCode, friendLink, userByCode } from '#lib/friends.ts';
	import Avatar from '#lib/components/Avatar.svelte';
	import Box from '#lib/components/Box.svelte';
	import FriendButton from '#lib/components/FriendButton.svelte';
	import QrCode from '#lib/components/QrCode.svelte';

	let q = $state('');
	let code = $state('');
	let codeTried = $state(false);
	const codeHit = $derived(code.trim() ? userByCode(code) : undefined);

	onMount(() => {
		const k = new URLSearchParams(location.search).get('kod');
		if (k) {
			code = k;
			codeTried = true;
		}
	});

	const others = users.filter((u) => u.id !== ME_ID);
	const notFriend = (id: string) => id !== ME_ID && !demo.isFriend(id);

	const results = $derived(
		q.trim() ? others.filter((u) => u.name.toLowerCase().includes(q.trim().toLowerCase())).slice(0, 12) : []
	);

	// Folk du har träffat: de som var eller ska vara på samma aktiviteter som du
	const met = $derived.by(() => {
		const out = new Map<string, string>();
		for (const a of [...demo.pastActivities, ...demo.allActivities]) {
			if (!demo.isAttending(a)) continue;
			for (const id of a.attendees) if (notFriend(id) && !out.has(id)) out.set(id, `${demo.minutesUntil(a) < 0 ? 'Var på' : 'Ska på'} ${a.title}`);
		}
		return [...out];
	});

	// Från dina grupper
	const fromGroups = $derived.by(() => {
		const out = new Map<string, string>();
		for (const g of demo.allGroups) {
			const s = demo.d.groups[g.id];
			if (s !== 'member' && s !== 'mod') continue;
			for (const id of membersOf(g)) if (notFriend(id) && !out.has(id)) out.set(id, `Med i ${g.name}`);
		}
		return [...out];
	});

	// Vänner till vänner
	const fof = $derived.by(() => {
		const out = new Map<string, string[]>();
		for (const f of others.filter((u) => demo.isFriend(u.id)))
			for (const id of f.topFriends) if (notFriend(id)) out.set(id, [...(out.get(id) ?? []), f.name]);
		return [...out].map(([id, via]) => [id, `Vän med ${via.slice(0, 2).join(' och ')}${via.length > 2 ? ` m.fl.` : ''}`] as [string, string]);
	});
</script>

<svelte:head><title>Hitta vänner – {SITE_NAME}</title></svelte:head>

<div class="page-head">
	<h1>Hitta vänner</h1>
	<p>Sök på namn, lägg till folk du träffat – eller byt vänkoder när ni ses på riktigt.</p>
</div>

<div class="grid-main">
	<div class="stack">
		<Box title="Sök" icon="eye">
			<label for="sok" class="label">Sök på namn</label>
			<input id="sok" type="search" bind:value={q} placeholder="t.ex. Sanna eller Pelle" autocomplete="off" />
			{#if q.trim()}
				{#if results.length}
					<ul class="plain people" data-testid="search-results">
						{#each results as u (u.id)}
							<li>
								<Avatar id={u.id} size={40} />
								<span class="who"><a href={`/profil/${u.id}`}>{u.name}</a><span class="xs muted">{u.area}</span></span>
								<FriendButton id={u.id} />
							</li>
						{/each}
					</ul>
				{:else}
					<p class="small muted" role="status">Ingen som heter så. Prova en del av namnet.</p>
				{/if}
			{/if}
		</Box>

		{#each [['Folk du har träffat', met, 'mott'], ['Från dina grupper', fromGroups, 'grupper'], ['Vänner till vänner', fof, 'vvv']] as [title, list, key] (key)}
			<Box title={title as string} icon="group" id={`f-${key}`}>
				{#if (list as [string, string][]).length}
					<ul class="plain people">
						{#each list as [string, string][] as [id, why] (id)}
							<li>
								<Avatar {id} size={40} />
								<span class="who"><a href={`/profil/${id}`}>{userById(id)?.name}</a><span class="xs muted">{why}</span></span>
								<FriendButton {id} />
							</li>
						{/each}
					</ul>
				{:else}
					<p class="small muted">Inga förslag här just nu – du är redan vän med alla!</p>
				{/if}
			</Box>
		{/each}
	</div>

	<aside class="stack" aria-label="Vänkoder">
		<Box title="Din vänkod" icon="plus" id="min-kod">
			<div class="mine">
				<QrCode value={friendLink(ME_ID)} label="QR-kod: bli vän med Gubben940" size={168} />
				<p class="code num">{friendCode(ME_ID)}</p>
				<p class="small">Skanna för att bli vänner – perfekt när ni har träffats vid en grillning.</p>
			</div>
		</Box>
		<Box title="Har du fått en kod?" icon="check">
			<form
				onsubmit={(e) => {
					e.preventDefault();
					codeTried = true;
				}}
			>
				<label for="kod" class="label">Vänkod</label>
				<div class="code-row">
					<input id="kod" type="text" bind:value={code} placeholder="t.ex. SANN-123" autocomplete="off" />
					<button type="submit" class="btn btn-small">Sök</button>
				</div>
			</form>
			{#if codeTried && code.trim()}
				{#if codeHit && codeHit.id !== ME_ID}
					<div class="hit" role="status">
						<Avatar id={codeHit.id} size={48} />
						<span class="who"><a href={`/profil/${codeHit.id}`}>{codeHit.name}</a><span class="xs muted">{codeHit.area}</span></span>
						<FriendButton id={codeHit.id} />
					</div>
				{:else if codeHit}
					<p class="small" role="status">Det är din egen kod!</p>
				{:else}
					<p class="small" role="status">Ingen har den koden. Kolla att du skrivit rätt.</p>
				{/if}
			{/if}
		</Box>
	</aside>
</div>

<style>
	.people {
		display: grid;
		gap: var(--space-2);
		margin-top: var(--space-3);
	}

	.people li,
	.hit {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr) auto;
		gap: var(--space-2);
		align-items: center;
	}

	.hit {
		margin-top: var(--space-3);
	}

	.who {
		display: grid;
		line-height: 1.3;
	}

	.mine {
		display: grid;
		justify-items: center;
		text-align: center;
	}

	.code {
		margin: var(--space-2) 0 4px;
		padding: 4px 12px;
		font-size: var(--text-xl);
		letter-spacing: 0.08em;
		background: var(--surface-2);
		border: 1px dashed var(--head-border);
		border-radius: var(--radius-sm);
	}

	.code-row {
		display: flex;
		gap: var(--space-2);
		margin-top: 4px;
	}
</style>
