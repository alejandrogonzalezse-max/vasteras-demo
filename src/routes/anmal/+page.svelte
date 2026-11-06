<script lang="ts">
	import { SITE_NAME } from '#lib/config.ts';
	import { demo } from '#lib/state.svelte.ts';
	import Box from '#lib/components/Box.svelte';

	let what = $state('');
	let reason = $state('reklam');
	let more = $state('');
	let sent = $state(false);

	const reasons = [
		{ id: 'reklam', label: 'Reklam', rule: 'Regel 3: Ingen reklam' },
		{ id: 'riksnyhet', label: 'Rikspolitik / riksnyhet', rule: 'Regel 4: Ingen rikspolitik' },
		{ id: 'pahopp', label: 'Påhopp eller trakasserier', rule: 'Regel 1: Var schysst' },
		{ id: 'farligt', label: 'Olagligt eller farligt', rule: 'Regel 6: Lagligt och säkert' },
		{ id: 'bild', label: 'Bild på mig utan lov', rule: 'Regel 7: Respektera andra' }
	];

	function submit(e: SubmitEvent) {
		e.preventDefault();
		if (!what.trim()) return;
		const r = reasons.find((x) => x.id === reason)!;
		demo.addToQueue({
			id: 'rep-' + Math.random().toString(36).slice(2, 7),
			type: 'anmälan',
			title: `Anmält: "${what.trim()}"`,
			detail: `Skäl: ${r.label}.${more.trim() ? ' ' + more.trim() : ''}`,
			from: 'Anmält av Gubben940 (du)',
			approve: { label: 'Låt ligga kvar', message: 'Hej! Vi har tittat på anmälan och låter innehållet ligga kvar. Inget regelbrott hittades.' },
			remove: {
				label: 'Ta bort',
				message: `Hej! Ditt innehåll är borttaget. ${r.rule}. Tycker du att vi gjort fel? Svara inom 14 dagar så tittar en annan moderator på beslutet.`,
				logReason: r.label.toLowerCase()
			}
		});
		what = more = '';
		sent = true;
	}
</script>

<svelte:head><title>Anmäl innehåll – {SITE_NAME}</title></svelte:head>

<div class="page-head">
	<h1>Anmäl innehåll</h1>
	<p>Ser du något som bryter mot ordningsreglerna? Säg till. Den du anmäler får inte veta vem som anmält.</p>
</div>

<div class="narrow">
	<Box title="Anmälan" icon="flag">
		{#if sent}
			<p class="notice ok" role="status">Tack! Anmälan ligger nu i <a href="/moderering">moderatorkön</a>.</p>
		{/if}
		<form onsubmit={submit}>
			<div class="field">
				<label for="what">Vad vill du anmäla?</label>
				<input id="what" type="text" bind:value={what} placeholder="Rubrik, användarnamn eller länk" required />
			</div>
			<div class="field">
				<label for="reason">Skäl</label>
				<select id="reason" bind:value={reason}>
					{#each reasons as r (r.id)}<option value={r.id}>{r.label}</option>{/each}
				</select>
			</div>
			<div class="field">
				<label for="more">Berätta mer <span class="muted">(frivilligt)</span></label>
				<textarea id="more" bind:value={more}></textarea>
			</div>
			<button type="submit" class="btn btn-primary">Skicka anmälan</button>
		</form>
	</Box>
</div>

<style>
	.narrow {
		max-width: 560px;
	}
</style>
