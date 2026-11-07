<script lang="ts">
	import { ME_ID } from '#lib/config.ts';
	import { groups, userById, type Activity } from '#lib/mock.ts';
	import { demo, whenLabel } from '#lib/state.svelte.ts';
	import Icon from './Icon.svelte';
	import UserLink from './UserLink.svelte';
	import Avatar from './Avatar.svelte';

	let {
		a,
		compact = false,
		headingLevel = 3
	}: { a: Activity; compact?: boolean; headingLevel?: 3 | 4 } = $props();

	const going = $derived(demo.isAttending(a));
	const people = $derived(demo.attendeesOf(a));
	const mins = $derived(demo.minutesUntil(a));
	const group = $derived(a.groupId ? groups.find((g) => g.id === a.groupId) : undefined);
	const isNew = $derived(a.by === ME_ID && a.id.startsWith('n'));

	// Påhittade kommentarer från dem som kommer, plus det man själv skrivit.
	const LINES = [
		'Kommer! Tar med kaffe till fler än mig.',
		'Kan bli tio minuter sen – vänta inte på mig.',
		'Första gången jag hänger på. Hur känner jag igen er?',
		'Vilket bra initiativ. Mer sånt här!',
		'Jag tar med en extra filt om någon fryser.',
		'Får man ta med en kompis som är ny i stan?'
	];
	const seeded = $derived(
		a.comments
			? a.attendees
					.filter((id) => id !== a.by && id !== ME_ID)
					.slice(0, 3)
					.map((by, i, list) => ({ by, ago: `${(list.length - i) * 17} min sedan`, text: LINES[(a.id.length + i * 2) % LINES.length] }))
			: []
	);
	const mine = $derived(demo.d.lappComments[a.id] ?? []);
	const thread = $derived([...seeded, ...mine]);
	const commentCount = $derived(a.comments + mine.length);
	let open = $state(false);
	let draft = $state('');

	function sendComment(e: SubmitEvent) {
		e.preventDefault();
		const text = draft.trim();
		if (!text) return;
		demo.d.lappComments[a.id] = [...mine, { by: ME_ID, ago: 'nyss', text }];
		draft = '';
	}

	function icsDate(d: Date) {
		return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
	}

	function icsText(t: string) {
		return t.replace(/\\/g, '\\\\').replace(/([,;])/g, '\\$1').replace(/\n/g, '\\n');
	}

	/** Skapar en .ics-fil för lappen (demotid) och laddar ner den. */
	function addToCalendar() {
		const start = new Date(demo.now + mins * 60000);
		start.setMinutes(Math.round(start.getMinutes() / 15) * 15, 0, 0);
		const end = new Date(start.getTime() + 2 * 3600000);
		const body = [
			'BEGIN:VCALENDAR',
			'VERSION:2.0',
			'PRODID:-//vasteras-demo//SV',
			'BEGIN:VEVENT',
			`UID:${a.id}@vasteras-demo`,
			`DTSTAMP:${icsDate(new Date())}`,
			`DTSTART:${icsDate(start)}`,
			`DTEND:${icsDate(end)}`,
			`SUMMARY:${icsText(a.title)}`,
			`LOCATION:${icsText(a.place)}`,
			`DESCRIPTION:${icsText((a.bring ? 'Ta med: ' + a.bring + '. ' : '') + 'Demo – påhittad lapp.')}`,
			'END:VEVENT',
			'END:VCALENDAR'
		].join('\r\n');
		const url = URL.createObjectURL(new Blob([body], { type: 'text/calendar' }));
		const link = Object.assign(document.createElement('a'), { href: url, download: `${a.id}.ics` });
		document.body.append(link);
		link.click();
		link.remove();
		setTimeout(() => URL.revokeObjectURL(url), 1000);
		demo.toast(`"${a.title}" är nedladdad som kalenderfil.`);
	}

	async function share() {
		const url = `${location.origin}/anslagstavlan#lapp-${a.id}`;
		if (navigator.share) {
			try {
				await navigator.share({ title: a.title, text: `${a.title} – ${a.place}`, url });
				return;
			} catch {
				/* avbrutet – fall tillbaka till kopiering */
			}
		}
		try {
			await navigator.clipboard.writeText(url);
			demo.toast('Länken till lappen är kopierad.');
		} catch {
			demo.toast(`Kopiera länken: ${url}`);
		}
	}
</script>

<article class="note" class:compact class:mine={isNew} aria-labelledby={`t-${a.id}`}>
	<div class="when num">{whenLabel(mins, demo.now)}</div>
	<svelte:element this={`h${headingLevel}`} class="title" id={`t-${a.id}`}>{a.title}</svelte:element>
	<p class="meta">
		<span><Icon name="pin" size={12} /> {a.place}</span>
		{#if a.recurring}<span class="tag">återkommer</span>{/if}
		{#if a.visibility === 'vänner'}<span class="tag">bara vänner</span>{/if}
		{#if group}<span class="tag">gruppen {group.name}</span>{/if}
		{#if isNew}<span class="tag warn">ny lapp</span>{/if}
	</p>
	{#if !compact}
		{#if a.text}<p class="text">{a.text}</p>{/if}
		{#if a.bring}<p class="bring"><strong>Ta med:</strong> {a.bring}</p>{/if}
		<p class="by small muted">Uppsatt av <UserLink id={a.by} /></p>
	{/if}
	<div class="act">
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
		<span class="count small">
			<strong class="num">{people.length}</strong> kommer{#if people.length}:{/if}
			{#each people.slice(0, compact ? 3 : 8) as id, i (id)}
				{i > 0 ? ', ' : ' '}{#if id === ME_ID}<strong>du</strong>{:else}<a href={`/profil/${id}`}>{userById(id)?.name}</a>{/if}
			{/each}{#if people.length > (compact ? 3 : 8)}&nbsp;m.fl.{/if}
		</span>
	</div>
	{#if !compact}
		<div class="tools">
			<button type="button" class="linkbtn small" aria-expanded={open} aria-controls={`c-${a.id}`} onclick={() => (open = !open)}>
				<Icon name="forum" size={12} /> Kommentarer ({commentCount})
			</button>
			<button type="button" class="linkbtn small" onclick={addToCalendar}><Icon name="calendar" size={12} /> Lägg i kalendern</button>
			<button type="button" class="linkbtn small" onclick={share}><Icon name="share" size={12} /> Dela</button>
		</div>
		{#if open}
			<div class="comments" id={`c-${a.id}`}>
				{#if thread.length}
					<ul class="plain">
						{#each thread as c, i (i)}
							<li>
								<Avatar id={c.by} size={28} />
								<p><UserLink id={c.by} /> <span class="xs muted">{c.ago}</span><br />{c.text}</p>
							</li>
						{/each}
					</ul>
					{#if a.comments > seeded.length}<p class="xs muted">Visar de senaste kommentarerna.</p>{/if}
				{:else}
					<p class="small muted">Inga kommentarer än. Skriv den första!</p>
				{/if}
				<form class="c-form" onsubmit={sendComment}>
					<label class="sr-only" for={`ci-${a.id}`}>Skriv en kommentar</label>
					<input id={`ci-${a.id}`} type="text" maxlength="200" placeholder="Skriv en kommentar…" bind:value={draft} />
					<button type="submit" class="btn btn-small">Skicka</button>
				</form>
			</div>
		{/if}
	{/if}
</article>

<style>
	.note {
		position: relative;
		padding: var(--space-3);
		background: var(--surface-2);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		min-width: 0;
	}

	.note.mine {
		border-color: var(--accent);
		box-shadow: 0 0 0 1px var(--accent);
	}

	.when {
		font-size: var(--text-xs);
		color: var(--head-text);
		margin-bottom: 4px;
	}

	.title {
		margin: 0 0 4px;
		font-size: var(--text-lg);
	}

	.compact .title {
		font-size: var(--text-md);
	}

	.meta {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 6px;
		margin: 0 0 var(--space-2);
		font-size: var(--text-sm);
		color: var(--text-muted);
	}

	.text,
	.bring {
		margin: 0 0 var(--space-2);
		font-size: var(--text-sm);
	}

	.by {
		margin: 0 0 var(--space-2);
	}

	.act {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-2) var(--space-3);
	}

	.count {
		color: var(--text-muted);
	}

	.tools {
		display: flex;
		flex-wrap: wrap;
		gap: 4px var(--space-3);
		margin-top: var(--space-2);
		padding-top: var(--space-2);
		border-top: 1px dashed var(--border);
	}

	.tools .linkbtn {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		min-height: 32px;
	}

	.comments {
		margin-top: var(--space-2);
	}

	.comments ul {
		display: grid;
		gap: var(--space-2);
		margin-bottom: var(--space-2);
	}

	.comments li {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: var(--space-2);
		font-size: var(--text-sm);
	}

	.comments li p {
		margin: 0;
	}

	.c-form {
		display: flex;
		gap: var(--space-2);
	}
</style>
