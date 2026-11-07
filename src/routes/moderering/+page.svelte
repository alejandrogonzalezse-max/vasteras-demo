<script lang="ts">
	import { SITE_NAME } from '#lib/config.ts';
	import { modLog, modQueue, type QueueItem } from '#lib/mock.ts';
	import { demo } from '#lib/state.svelte.ts';
	import Box from '#lib/components/Box.svelte';
	import Icon from '#lib/components/Icon.svelte';

	const queue = $derived([...demo.d.userQueue, ...modQueue]);
	const open = $derived(queue.filter((q) => !demo.d.decisions[q.id]).length);
	const log = $derived([...demo.d.extraLog, ...modLog]);

	const LABEL: Record<string, string> = {
		anmälan: 'Anmälan',
		plats: 'Ny plats',
		tärningsidé: 'Tärningsidé',
		gruppansökan: 'Gruppansökan'
	};

	function decide(q: QueueItem, d: 'approve' | 'remove') {
		demo.d.decisions[q.id] = d;
		const text =
			d === 'remove'
				? q.type === 'anmälan'
					? `Inlägg borttaget – ${q.remove.logReason}`
					: `${LABEL[q.type]} avslagen – ${q.remove.logReason}`
				: q.type === 'anmälan'
					? 'Anmälan avslagen – inget regelbrott'
					: `${LABEL[q.type]} godkänd`;
		demo.d.extraLog.unshift({ when: 'nyss', text, mod: 'Mod Gubben940 (du)' });
	}

	function undo(q: QueueItem) {
		delete demo.d.decisions[q.id];
		demo.d.extraLog.shift();
	}
</script>

<svelte:head><title>Moderering – {SITE_NAME}</title></svelte:head>

<div class="page-head">
	<h1>Moderering</h1>
	<p>I demon är du moderator. Varje beslut skickas till personen det gäller, med regeln och hur man överklagar. Loggen är öppen för alla medlemmar.</p>
</div>

<div class="grid-main">
	<Box title="Kön" icon="shield" id="kon">
		{#snippet extra()}<span class="num">{open}</span> att titta på{/snippet}
		<ul class="plain queue">
			{#each queue as q (q.id)}
				{@const d = demo.d.decisions[q.id]}
				<li class="q" class:done={!!d} data-testid="queue-item">
					<div class="q-top">
						<span class="tag">{LABEL[q.type]}</span>
						<span class="xs muted">{q.from}</span>
					</div>
					<h3 class="q-title">{q.title}</h3>
					<p class="small">{q.detail}</p>
					{#if !d}
						<div class="row">
							<button type="button" class="btn btn-small btn-done" onclick={() => decide(q, 'approve')}><Icon name="check" size={10} /> {q.approve.label}</button>
							<button type="button" class="btn btn-small btn-danger" onclick={() => decide(q, 'remove')}>{q.remove.label}</button>
						</div>
					{:else}
						<div class="decision" role="status">
							<p class="display dlabel">{d === 'approve' ? 'Beslut: ' + q.approve.label : 'Beslut: ' + q.remove.label} · meddelande skickat</p>
							<blockquote class="small">{d === 'approve' ? q.approve.message : q.remove.message}</blockquote>
							<button type="button" class="linkbtn xs" onclick={() => undo(q)}>Ångra (bara i demon)</button>
						</div>
					{/if}
				</li>
			{/each}
		</ul>
	</Box>

	<aside class="stack" aria-label="Om modereringen">
		<Box title="Så funkar modereringen" icon="book">
			<ol class="small how">
				<li>Vem som helst kan anmäla. Tre anmälningar lyfter upp något överst i kön.</li>
				<li>En frivillig moderator tittar – inget tas bort automatiskt.</li>
				<li>Beslutet skickas till personen, med regeln som gäller.</li>
				<li>Allt går att överklaga inom 14 dagar. Då tittar en annan moderator.</li>
				<li>Alla beslut syns i den öppna loggen, utan namn på den som anmälts.</li>
			</ol>
			<p class="small"><a href="/ordningsregler">Ordningsreglerna</a></p>
		</Box>
		<Box title="Öppen mod-logg" icon="eye" id="logg">
			<ul class="plain log">
				{#each log as l, i (i)}
					<li>
						<span class="xs muted num">{l.when}</span>
						<span class="small">{l.text} <span class="muted">/ {l.mod}</span></span>
					</li>
				{/each}
			</ul>
		</Box>
	</aside>
</div>

<style>
	.queue {
		display: grid;
		gap: var(--space-3);
	}

	.q {
		padding: var(--space-3);
		background: var(--surface-2);
		border: 1px solid var(--border);
		border-left: 4px solid var(--away);
		border-radius: var(--radius);
	}

	.q.done {
		border-left-color: var(--success);
	}

	.q-top {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		gap: var(--space-2);
		margin-bottom: 4px;
	}

	.q-title {
		font-size: var(--text-md);
		margin-bottom: 4px;
	}

	.decision {
		padding: var(--space-2) var(--space-3);
		background: var(--surface);
		border: 1px dashed var(--border-strong);
		border-radius: var(--radius-sm);
	}

	.dlabel {
		margin: 0 0 4px;
		color: var(--head-text);
	}

	blockquote {
		margin: 0 0 4px;
		padding-left: var(--space-2);
		border-left: 3px solid var(--head-border);
	}

	.how {
		margin: 0 0 var(--space-2);
		padding-left: 1.3em;
	}

	.how li + li {
		margin-top: 4px;
	}

	.log {
		display: grid;
		gap: 6px;
	}

	.log li {
		display: grid;
		padding-bottom: 6px;
		border-bottom: 1px dashed var(--border);
	}
</style>
