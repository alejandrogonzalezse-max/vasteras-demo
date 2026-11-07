<script lang="ts">
	import { goto } from '$app/navigation';
	import { tick } from 'svelte';
	import { SITE_NAME } from '#lib/config.ts';
	import { SCENE_TITLES, sceneNames } from '#lib/illustrations.ts';
	import { demo } from '#lib/state.svelte.ts';
	import { WHEN_OPTIONS, minutesForChoice } from '#lib/time.ts';
	import Box from '#lib/components/Box.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import ImageUpload, { missingAlt, saveUploads, type UploadItem } from '#lib/components/ImageUpload.svelte';
	import Scene from '#lib/components/Scene.svelte';

	let step = $state(1);
	let name = $state('');
	let text = $state('');
	let open = $state<'open' | 'closed'>('open');
	let coverKind = $state<'pixel' | 'egen'>('pixel');
	let scene = $state('kubb');
	let images = $state<UploadItem[]>([]);
	let meetTitle = $state('');
	let meetWhen = $state('weekend');
	let meetPlace = $state('');
	let error = $state('');
	let busy = $state(false);
	let headEl: HTMLElement | undefined = $state();

	async function go(n: number) {
		error = '';
		if (n > step && step === 1) {
			if (!name.trim()) return (error = 'Gruppen behöver ett namn.');
			if (!text.trim()) return (error = 'Skriv en mening om vad gruppen gör.');
		}
		step = n;
		await tick();
		headEl?.focus();
	}

	async function create(e: SubmitEvent) {
		e.preventDefault();
		error = '';
		if (coverKind === 'egen' && !images.length) return (error = 'Välj en bild, eller ta en av pixelbilderna.');
		if (coverKind === 'egen' && missingAlt(images)) return (error = 'Skriv en kort bildtext till omslagsbilden.');
		busy = true;
		const cover = coverKind === 'egen' ? (await saveUploads(images))[0] : undefined;
		const id = demo.createGroup({
			name: name.trim(),
			text: text.trim(),
			open: open === 'open',
			scene: coverKind === 'pixel' ? scene : undefined,
			cover,
			meet: meetTitle.trim() ? { title: meetTitle.trim(), place: meetPlace.trim(), when: minutesForChoice(meetWhen, demo.now) } : undefined
		});
		busy = false;
		demo.toast(`Gruppen "${name.trim()}" är skapad. Du är dess moderator.`);
		goto(`/grupp/${id}`);
	}
</script>

<svelte:head><title>Starta en grupp – {SITE_NAME}</title></svelte:head>

<p class="crumbs small"><a href="/grupper">Grupper</a> › Starta en grupp</p>
<div class="page-head">
	<h1>Starta en grupp</h1>
	<p>Tre korta steg. Allt går att ändra sen.</p>
</div>

<div class="narrow">
	<ol class="plain steps" aria-label="Steg">
		{#each ['Namn', 'Öppen eller sluten', 'Omslag och träff'] as label, i (label)}
			<li class:on={step === i + 1} class:done={step > i + 1} aria-current={step === i + 1 ? 'step' : undefined}>
				<span class="num">{i + 1}</span> {label}
			</li>
		{/each}
	</ol>

	<Box title={`Steg ${step} av 3`} icon="group">
		<form onsubmit={step === 3 ? create : (e) => { e.preventDefault(); go(step + 1); }} novalidate data-testid="group-form">
			<h2 class="st-h" tabindex="-1" bind:this={headEl}>
				{step === 1 ? 'Vad heter gruppen?' : step === 2 ? 'Vem får vara med?' : 'Omslag och första träff'}
			</h2>

			{#if step === 1}
				<div class="field">
					<label for="g-name">Namn</label>
					<input id="g-name" type="text" maxlength="50" bind:value={name} placeholder="t.ex. Kallbadarna på Lövudden" />
				</div>
				<div class="field">
					<label for="g-text">En mening om gruppen</label>
					<input id="g-text" type="text" maxlength="140" bind:value={text} placeholder="Vi badar varje söndag morgon, året runt." />
				</div>
			{:else if step === 2}
				<fieldset class="choices">
					<legend class="sr-only">Öppen eller sluten</legend>
					<label class="choice">
						<input type="radio" name="open" value="open" bind:group={open} />
						<span><strong><Icon name="globe" size={12} /> Öppen</strong><br /><span class="small muted">Alla kan gå med direkt och se allt i gruppen.</span></span>
					</label>
					<label class="choice">
						<input type="radio" name="open" value="closed" bind:group={open} />
						<span><strong><Icon name="lock" size={12} /> Sluten</strong><br /><span class="small muted">Man ansöker och du godkänner. Bra för t.ex. tjejgrupper eller hemliga fiskeställen.</span></span>
					</label>
				</fieldset>
			{:else}
				<fieldset class="cover-kind">
					<legend>Omslagsbild</legend>
					<label class="check"><input type="radio" name="ck" value="pixel" bind:group={coverKind} /> En av pixelbilderna</label>
					<label class="check"><input type="radio" name="ck" value="egen" bind:group={coverKind} /> Egen bild</label>
				</fieldset>
				{#if coverKind === 'pixel'}
					<fieldset class="pick">
						<legend class="sr-only">Välj pixelbild</legend>
						{#each sceneNames as sc (sc)}
							<label class="pick-opt">
								<input type="radio" name="scene" value={sc} bind:group={scene} />
								<span class="pick-img"><Scene scene={sc} alt={null} /></span>
								<span class="sr-only">{SCENE_TITLES[sc]}</span>
							</label>
						{/each}
					</fieldset>
				{:else}
					<ImageUpload bind:items={images} max={1} square label="Välj omslagsbild" altLabel="Beskriv bilden" />
				{/if}
				<fieldset class="meet">
					<legend>Första träffen <span class="muted">(valfritt)</span></legend>
					<div class="field">
						<label for="m-title">Vad ska ni göra?</label>
						<input id="m-title" type="text" maxlength="80" bind:value={meetTitle} placeholder="t.ex. Första doppet" />
					</div>
					<div class="two">
						<div class="field">
							<label for="m-when">När</label>
							<select id="m-when" bind:value={meetWhen}>
								{#each WHEN_OPTIONS as o (o.id)}<option value={o.id}>{o.label}</option>{/each}
							</select>
						</div>
						<div class="field">
							<label for="m-place">Var</label>
							<input id="m-place" type="text" maxlength="60" bind:value={meetPlace} placeholder="t.ex. Lövudden" />
						</div>
					</div>
				</fieldset>
				<p class="notice draft small">I demon skapas gruppen direkt. I den riktiga sajten godkänner en moderator nya grupper först.</p>
			{/if}

			{#if error}<p class="notice err" role="alert">{error}</p>{/if}
			<div class="row nav">
				{#if step > 1}<button type="button" class="btn" onclick={() => go(step - 1)}>Tillbaka</button>{/if}
				<button type="submit" class="btn btn-primary" disabled={busy}>
					{step < 3 ? 'Nästa' : 'Skapa gruppen'}
				</button>
			</div>
		</form>
	</Box>
</div>

<style>
	.crumbs {
		margin-bottom: var(--space-2);
	}

	.narrow {
		max-width: 640px;
	}

	.steps {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		margin-bottom: var(--space-3);
		font-size: var(--text-sm);
	}

	.steps li {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 4px 10px 4px 4px;
		color: var(--text-muted);
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-pill);
	}

	.steps .num {
		display: grid;
		place-items: center;
		width: 24px;
		height: 24px;
		color: var(--text);
		background: var(--surface-sunk);
		border-radius: 50%;
	}

	.steps li.on {
		color: var(--text);
		font-weight: 700;
		border-color: var(--accent);
	}

	.steps li.on .num,
	.steps li.done .num {
		color: var(--accent-text);
		background: var(--accent);
	}

	.st-h {
		font-size: var(--text-lg);
		margin-bottom: var(--space-3);
	}

	.st-h:focus {
		outline: none;
	}

	.choices {
		display: grid;
		gap: var(--space-2);
		padding: 0;
		border: 0;
	}

	.choice {
		display: flex;
		gap: var(--space-2);
		align-items: flex-start;
		padding: var(--space-3);
		background: var(--surface-2);
		border: 2px solid var(--border);
		border-radius: var(--radius);
		cursor: pointer;
	}

	.choice:has(input:checked) {
		border-color: var(--accent);
		background: var(--accent-soft);
	}

	.choice input {
		margin-top: 4px;
	}

	.cover-kind {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-3);
	}

	.pick {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(64px, 1fr));
		gap: 6px;
		margin: 0 0 var(--space-3);
	}

	.pick-opt {
		position: relative;
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
	}

	.pick-opt:has(input:checked) {
		border-color: var(--accent);
		box-shadow: 0 0 0 2px var(--accent);
	}

	.pick-opt:has(input:focus-visible) {
		outline: 3px solid var(--focus);
		outline-offset: 2px;
	}

	.meet {
		margin-top: var(--space-3);
	}

	.two {
		display: grid;
		gap: var(--space-2);
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
	}

	.nav {
		margin-top: var(--space-2);
	}
</style>
