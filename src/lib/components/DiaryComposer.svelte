<script lang="ts">
	import { SCENE_TITLES, sceneNames } from '#lib/illustrations.ts';
	import { places } from '#lib/mock.ts';
	import { demo } from '#lib/state.svelte.ts';
	import Icon from './Icon.svelte';
	import ImageUpload, { missingAlt, saveUploads, type UploadItem } from './ImageUpload.svelte';
	import Scene from './Scene.svelte';

	let { onposted }: { onposted?: () => void } = $props();
	const uid = $props.id();

	let text = $state('');
	let place = $state('');
	let visibility = $state<'vänner' | 'privat'>('vänner');
	let scene = $state('');
	let images = $state<UploadItem[]>([]);
	let pickOpen = $state(false);
	let error = $state('');
	let busy = $state(false);

	async function submit(e: SubmitEvent) {
		e.preventDefault();
		error = '';
		if (!text.trim() && !images.length) return (error = 'Skriv något eller lägg till en bild.');
		if (missingAlt(images)) return (error = 'Skriv en kort bildtext till varje bild – den behövs för den som inte ser bilden.');
		busy = true;
		const stored = await saveUploads(images);
		demo.addPost(text.trim(), scene || undefined, scene ? SCENE_TITLES[scene] : undefined, { visibility, images: stored, place: place.trim() });
		demo.toast(visibility === 'privat' ? 'Sparat i din dagbok – bara du ser det.' : 'Publicerat i din dagbok.');
		text = place = scene = '';
		images = [];
		visibility = 'vänner';
		pickOpen = false;
		busy = false;
		onposted?.();
	}
</script>

<form class="composer" onsubmit={submit} data-testid="diary-composer">
	<label for={`${uid}-text`} class="label">Skriv i dagboken</label>
	<textarea id={`${uid}-text`} maxlength="800" bind:value={text} placeholder="Vad har du hittat på i dag?"></textarea>

	<div class="opts">
		<div class="place">
			<label for={`${uid}-place`} class="label">Plats <span class="muted">(valfritt)</span></label>
			<input id={`${uid}-place`} type="text" maxlength="60" list={`${uid}-places`} bind:value={place} placeholder="t.ex. Framnäs" />
			<datalist id={`${uid}-places`}>{#each places as p (p.id)}<option value={p.name}></option>{/each}</datalist>
		</div>
		<fieldset class="vis">
			<legend class="label">Vem ser inlägget?</legend>
			<label class="check"><input type="radio" name={`${uid}-vis`} value="vänner" bind:group={visibility} /> Vänner</label>
			<label class="check"><input type="radio" name={`${uid}-vis`} value="privat" bind:group={visibility} /> <Icon name="lock" size={10} /> Bara jag</label>
		</fieldset>
	</div>

	{#if pickOpen}
		<div class="pics">
			<ImageUpload bind:items={images} max={4} label="Välj egna bilder eller ta foto" />
			<fieldset class="pick">
				<legend>Eller välj en pixelbild</legend>
				<label class="pick-opt none"><input type="radio" name={`${uid}-scene`} value="" bind:group={scene} /><span>Ingen</span></label>
				{#each sceneNames as sc (sc)}
					<label class="pick-opt">
						<input type="radio" name={`${uid}-scene`} value={sc} bind:group={scene} />
						<span class="pick-img"><Scene scene={sc} alt={null} /></span>
						<span class="sr-only">{SCENE_TITLES[sc]}</span>
					</label>
				{/each}
			</fieldset>
		</div>
	{/if}

	{#if error}<p class="notice err small" role="alert">{error}</p>{/if}
	<div class="spread">
		<button type="button" class="linkbtn small" aria-expanded={pickOpen} onclick={() => (pickOpen = !pickOpen)}>
			<Icon name="camera" size={12} />
			{images.length ? (images.length === 1 ? "1 egen bild" : `${images.length} egna bilder`) : scene ? `Bild: ${SCENE_TITLES[scene]}` : 'Lägg till bild'}
		</button>
		<button type="submit" class="btn btn-small btn-primary" disabled={busy}>Publicera</button>
	</div>
	<p class="xs muted">
		{visibility === 'privat' ? 'Privat anteckning: syns bara på din egen profil.' : 'Syns för dina vänner. Bara du ser hur många som tycker att det är schysst.'}
	</p>
</form>

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

	.opts {
		display: grid;
		gap: var(--space-2);
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		align-items: end;
	}

	.place {
		display: grid;
		gap: 4px;
	}

	.vis {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-3);
		margin: 0;
		padding: var(--space-2);
	}

	.pics {
		display: grid;
		gap: var(--space-3);
		padding: var(--space-2);
		background: var(--surface-2);
		border: 1px dashed var(--head-border);
		border-radius: var(--radius-sm);
	}

	.pick {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(56px, 1fr));
		gap: 6px;
		margin: 0;
	}

	.pick-opt {
		position: relative;
		display: grid;
		place-items: center;
		min-height: 56px;
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
	}

	.pick-opt:has(input:checked) {
		border-color: var(--accent);
		box-shadow: 0 0 0 2px var(--accent);
	}

	.pick-opt:has(input:focus-visible) {
		outline: 3px solid var(--focus);
		outline-offset: 2px;
	}
</style>
