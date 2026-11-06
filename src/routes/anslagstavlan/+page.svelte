<script lang="ts">
	import { tick } from 'svelte';
	import { SITE_NAME, ME_ID } from '#lib/config.ts';
	import { afterNattbad, groups, type Visibility } from '#lib/mock.ts';
	import { demo } from '#lib/state.svelte.ts';
	import ActivityCard from '#lib/components/ActivityCard.svelte';
	import Avatar from '#lib/components/Avatar.svelte';
	import Box from '#lib/components/Box.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import Photo from '#lib/components/Photo.svelte';
	import UserLink from '#lib/components/UserLink.svelte';

	let title = $state('');
	let place = $state('');
	let whenId = $state('tonight');
	let bring = $state('');
	let text = $state('');
	let visibility = $state<Visibility>('alla');
	let groupId = $state(groups[0].id);
	let recurring = $state(false);
	let fromDice = $state(false);
	let error = $state('');
	let posted = $state('');
	let comment = $state('');

	const whenOptions = [
		{ id: 'h1', label: 'Om en timme' },
		{ id: 'h2', label: 'Om två timmar' },
		{ id: 'tonight', label: 'I kväll kl 19' },
		{ id: 'tomorrow', label: 'I morgon kl 18' },
		{ id: 'weekend', label: 'Nästa lördag kl 12' }
	];

	function minutesFor(id: string, now: number) {
		const d = new Date(now);
		const at = (days: number, h: number) => {
			const t = new Date(d.getFullYear(), d.getMonth(), d.getDate() + days, h, 0);
			return Math.round((t.getTime() - now) / 60000);
		};
		switch (id) {
			case 'h1': return 60;
			case 'h2': return 120;
			case 'tonight': { const m = at(0, 19); return m > 15 ? m : at(1, 19); }
			case 'tomorrow': return at(1, 18);
			default: { const days = ((6 - d.getDay() + 7) % 7) || 7; return at(days, 12); }
		}
	}

	$effect(() => {
		if (demo.ready && demo.d.draft) {
			title = demo.d.draft.title;
			place = demo.d.draft.place;
			bring = demo.d.draft.bring;
			fromDice = true;
			demo.d.draft = null;
		}
	});

	const notes = $derived(
		[...demo.allActivities].sort((a, b) => {
			const am = a.id.startsWith('n') ? -1 : 0;
			const bm = b.id.startsWith('n') ? -1 : 0;
			return am - bm || demo.minutesUntil(a) - demo.minutesUntil(b);
		})
	);

	const comments = $derived([...demo.d.nattbadComments, ...afterNattbad.comments]);

	async function submit(e: SubmitEvent) {
		e.preventDefault();
		error = '';
		if (!title.trim()) {
			error = 'Lappen behöver en rubrik.';
			document.getElementById('f-title')?.focus();
			return;
		}
		if (!place.trim()) {
			error = 'Skriv var ni ses – en allmän plats är bäst första gången.';
			document.getElementById('f-place')?.focus();
			return;
		}
		const note = demo.addNote({
			title: title.trim(),
			place: place.trim(),
			when: minutesFor(whenId, demo.now),
			bring: bring.trim(),
			visibility,
			groupId: visibility === 'grupp' ? groupId : undefined,
			recurring,
			text: text.trim()
		});
		posted = note.title;
		title = place = bring = text = '';
		recurring = false;
		fromDice = false;
		await tick();
		document.getElementById(`lapp-${note.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
	}

	function addComment(e: SubmitEvent) {
		e.preventDefault();
		if (!comment.trim()) return;
		demo.d.nattbadComments.unshift({ by: ME_ID, ago: 'nyss', text: comment.trim() });
		comment = '';
	}
</script>

<svelte:head><title>Anslagstavlan – {SITE_NAME}</title></svelte:head>

<div class="page-head">
	<h1>Anslagstavlan</h1>
	<p>Sätt upp en lapp om något du tänker göra – och säg att vem som helst får hänga på. Ingen OSA, inga måsten: man trycker "Jag kommer" och sedan ses man.</p>
	<p class="head-cta"><a class="btn btn-primary" href="#ny-lapp"><Icon name="plus" size={12} /> Sätt upp en lapp</a></p>
</div>

<div class="grid-main">
	<div class="stack">
		<Box title="Alla lappar" icon="board" id="lappar">
			{#snippet extra()}<span class="num">{notes.length}</span> lappar{/snippet}
			{#if posted}
				<p class="notice ok posted" role="status">Lappen "{posted}" sitter uppe överst. Nu är det bara att vänta in folk!</p>
			{/if}
			<ul class="plain notes">
				{#each notes as a (a.id)}
					<li id={`lapp-${a.id}`}><ActivityCard {a} /></li>
				{/each}
			</ul>
		</Box>

		<Box title="Gästboken efteråt" icon="camera" id="efterat">
			<h3 class="after-title">{afterNattbad.title}</h3>
			<p>{afterNattbad.text}</p>
			<ul class="plain photos">
				{#each afterNattbad.photos as ph (ph.caption)}
					<li><Photo caption={ph.caption} color={ph.color} icon={ph.icon} /></li>
				{/each}
			</ul>
			<h3 class="gb-title">Hälsningar</h3>
			<form class="gb-form" onsubmit={addComment}>
				<label for="gb" class="label">Skriv i gästboken</label>
				<textarea id="gb" maxlength="300" bind:value={comment} placeholder="Tack för senast!"></textarea>
				<button type="submit" class="btn btn-small">Skriv</button>
			</form>
			<ul class="plain item-list">
				{#each comments as c, i (i)}
					<li class="gb">
						<Avatar id={c.by} size={32} />
						<div>
							<p class="small gb-head"><UserLink id={c.by} /> <span class="muted">· {c.ago}</span></p>
							<p class="gb-text">{c.text}</p>
						</div>
					</li>
				{/each}
			</ul>
		</Box>
	</div>

	<aside class="stack" aria-label="Sätt upp en lapp">
		<Box title="Sätt upp en lapp" icon="plus" id="ny-lapp">
			{#if fromDice}<p class="notice draft small">Förifyllt från tärningen. Ändra det du vill.</p>{/if}
			<form onsubmit={submit} novalidate>
				<div class="field">
					<label for="f-title">Rubrik</label>
					<input id="f-title" type="text" maxlength="80" bind:value={title} placeholder="Korvgrillning på Djäkneberget" />
				</div>
				<div class="field">
					<label for="f-place">Plats</label>
					<input id="f-place" type="text" maxlength="80" bind:value={place} placeholder="Grillplatsen vid stora stenen" />
				</div>
				<div class="field">
					<label for="f-when">När</label>
					<select id="f-when" bind:value={whenId}>
						{#each whenOptions as o (o.id)}<option value={o.id}>{o.label}</option>{/each}
					</select>
				</div>
				<div class="field">
					<label for="f-bring">Ta med</label>
					<input id="f-bring" type="text" maxlength="80" bind:value={bring} placeholder="Egen korv och dricka" />
				</div>
				<div class="field">
					<label for="f-text">Mer info <span class="muted">(frivilligt)</span></label>
					<textarea id="f-text" maxlength="300" bind:value={text}></textarea>
				</div>
				<fieldset>
					<legend>Vem ser lappen?</legend>
					<label class="check"><input type="radio" name="vis" value="alla" bind:group={visibility} /> Alla</label>
					<label class="check"><input type="radio" name="vis" value="vänner" bind:group={visibility} /> Mina vänner</label>
					<label class="check"><input type="radio" name="vis" value="grupp" bind:group={visibility} /> En grupp</label>
					{#if visibility === 'grupp'}
						<div class="field group-pick">
							<label for="f-group">Grupp</label>
							<select id="f-group" bind:value={groupId}>
								{#each groups as g (g.id)}<option value={g.id}>{g.name}</option>{/each}
							</select>
						</div>
					{/if}
				</fieldset>
				<label class="check field"><input type="checkbox" bind:checked={recurring} /> Återkommer (t.ex. varje vecka)</label>
				{#if error}<p class="notice err" role="alert">{error}</p>{/if}
				<button type="submit" class="btn btn-primary"><Icon name="board" size={12} /> Sätt upp lappen</button>
			</form>
		</Box>
		<Box title="Tips" icon="star">
			<ul class="small tips">
				<li>Första gången: ses på en allmän plats.</li>
				<li>Skriv vad folk ska ta med, så slipper någon känna sig dum.</li>
				<li>Ingen kommer? Det händer. Gå ändå – nästa gång kommer någon.</li>
			</ul>
		</Box>
	</aside>
</div>

<style>
	.notes {
		display: grid;
		gap: var(--space-3);
	}

	.notes li {
		scroll-margin-top: 80px;
	}

	.posted {
		margin-bottom: var(--space-3);
	}

	.after-title {
		margin-bottom: 4px;
	}

	.photos {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
		gap: var(--space-3);
		margin-bottom: var(--space-4);
	}

	.photos li:nth-child(odd) {
		transform: rotate(-1.2deg);
	}

	.photos li:nth-child(even) {
		transform: rotate(1deg);
	}

	.gb-title {
		font-size: var(--text-md);
	}

	.gb-form {
		display: grid;
		gap: 6px;
		margin-bottom: var(--space-3);
	}

	.gb-form textarea {
		min-height: 64px;
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

	fieldset .check + .check {
		margin-top: 6px;
	}

	.group-pick {
		margin: var(--space-2) 0 0;
	}

	.tips {
		margin: 0;
		padding-left: 1.2em;
	}

</style>
