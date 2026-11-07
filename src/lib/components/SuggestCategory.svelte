<script lang="ts">
	import { demo } from '#lib/state.svelte.ts';

	let open = $state(false);
	let name = $state('');
	let why = $state('');
	let sent = $state(false);

	function submit(e: SubmitEvent) {
		e.preventDefault();
		if (!name.trim()) return;
		demo.addToQueue({
			id: 'kat-' + Math.random().toString(36).slice(2, 7),
			type: 'kategoriförslag',
			title: `Ny forumkategori: "${name.trim()}"`,
			detail: why.trim() || 'Ingen motivering.',
			from: 'Förslag från Gubben940 (du)',
			approve: { label: 'Skapa kategorin', message: `Hej! Kategorin "${name.trim()}" finns nu i forumet. Tack för förslaget!` },
			remove: {
				label: 'Avslå',
				message: `Hej! Vi skapar inte kategorin "${name.trim()}" just nu – det passar bra i en befintlig kategori. Tycker du att vi gjort fel? Svara inom 14 dagar så tittar en annan moderator på det.`,
				logReason: 'kategoriförslag avslogs'
			}
		});
		name = why = '';
		sent = true;
		open = false;
	}
</script>

<div class="suggest">
	{#if !open}
		<button type="button" class="btn btn-small" onclick={() => { open = true; sent = false; }} aria-expanded="false">Föreslå en ny kategori</button>
		{#if sent}<p class="notice ok small" role="status">Tack! Förslaget ligger i <a href="/moderering">moderatorkön</a>.</p>{/if}
	{:else}
		<form onsubmit={submit} class="sg-form">
			<div class="field">
				<label for="sg-name">Namn på kategorin</label>
				<input id="sg-name" type="text" maxlength="40" bind:value={name} />
			</div>
			<div class="field">
				<label for="sg-why">Varför behövs den? <span class="muted">(valfritt)</span></label>
				<input id="sg-why" type="text" maxlength="140" bind:value={why} />
			</div>
			<div class="row">
				<button type="submit" class="btn btn-small btn-primary">Skicka förslaget</button>
				<button type="button" class="btn btn-small" onclick={() => (open = false)}>Avbryt</button>
			</div>
		</form>
	{/if}
</div>

<style>
	.suggest {
		margin-top: var(--space-4);
	}

	.sg-form {
		max-width: 480px;
		padding: var(--space-3);
		background: var(--surface);
		border: 1px solid var(--head-border);
		border-radius: var(--radius-lg);
	}

	.suggest p {
		margin-top: var(--space-2);
	}
</style>
