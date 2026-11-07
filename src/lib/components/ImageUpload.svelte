<script lang="ts" module>
	import { putImage, type StoredImage } from '#lib/images.ts';

	export interface UploadItem {
		key: string;
		file: File;
		blob: Blob;
		url: string;
		alt: string;
		pos: number;
	}

	/** Sparar uppladdade bilder i IndexedDB och returnerar id + bildtext. */
	export async function saveUploads(items: UploadItem[]): Promise<StoredImage[]> {
		const out: StoredImage[] = [];
		for (const it of items) out.push({ id: await putImage(it.blob), alt: it.alt.trim() });
		return out;
	}

	export const missingAlt = (items: UploadItem[]) => items.some((i) => !i.alt.trim());
</script>

<script lang="ts">
	import { ImageError, processImage } from '#lib/images.ts';
	import Icon from './Icon.svelte';

	let {
		items = $bindable([]),
		max = 4,
		square = false,
		label = 'Välj bild eller ta foto',
		altLabel = 'Bildtext'
	}: { items?: UploadItem[]; max?: number; square?: boolean; label?: string; altLabel?: string } = $props();

	const uid = $props.id();
	let error = $state('');
	let busy = $state(false);

	async function onPick(e: Event) {
		const input = e.currentTarget as HTMLInputElement;
		const files = [...(input.files ?? [])];
		input.value = '';
		error = '';
		if (!files.length) return;
		const room = max - items.length;
		if (files.length > room) error = max === 1 ? 'Du kan bara välja en bild här.' : `Max ${max} bilder per inlägg – de första ${Math.max(room, 0)} togs med.`;
		busy = true;
		for (const file of files.slice(0, Math.max(room, 0))) {
			try {
				const p = await processImage(file, { square, pos: 0.5 });
				items = [...items, { key: crypto.randomUUID?.() ?? String(Math.random()), file, blob: p.blob, url: URL.createObjectURL(p.blob), alt: '', pos: 0.5 }];
			} catch (err) {
				error = err instanceof ImageError ? err.message : 'Något gick fel med bilden. Prova en annan.';
			}
		}
		busy = false;
	}

	function remove(key: string) {
		const it = items.find((i) => i.key === key);
		if (it) URL.revokeObjectURL(it.url);
		items = items.filter((i) => i.key !== key);
	}

	async function recrop(it: UploadItem, pos: number) {
		const p = await processImage(it.file, { square: true, pos });
		URL.revokeObjectURL(it.url);
		items = items.map((i) => (i.key === it.key ? { ...i, pos, blob: p.blob, url: URL.createObjectURL(p.blob) } : i));
	}
</script>

<div class="upload" data-testid="upload">
	{#if items.length < max}
		<label class="btn btn-small file-btn">
			<Icon name="camera" size={12} />
			{items.length ? 'Lägg till fler bilder' : label}
			<input class="file" type="file" accept="image/*" multiple={max > 1} onchange={onPick} data-testid="file-input" />
		</label>
		<span class="xs muted">{items.length}/{max} · max 5 MB per bild</span>
	{/if}
	{#if busy}<p class="xs" role="status">Förbereder bilden…</p>{/if}
	{#if error}<p class="notice err small" role="alert">{error}</p>{/if}

	{#if items.length}
		<ul class="plain previews" class:square>
			{#each items as it, i (it.key)}
				<li class="pv">
					<img src={it.url} alt="" class="pv-img" />
					<div class="pv-fields">
						<label class="label" for={`${uid}-alt-${i}`}>{altLabel} <span class="muted">(krävs)</span></label>
						<input
							id={`${uid}-alt-${i}`}
							type="text"
							maxlength="140"
							placeholder="Vad visar bilden?"
							bind:value={it.alt}
							aria-invalid={!it.alt.trim()}
							data-testid="alt-input"
						/>
						{#if square}
							<label class="label" for={`${uid}-pos-${i}`}>Beskärning</label>
							<input
								id={`${uid}-pos-${i}`}
								type="range"
								min="0"
								max="1"
								step="0.05"
								value={it.pos}
								onchange={(e) => recrop(it, Number((e.currentTarget as HTMLInputElement).value))}
							/>
						{/if}
						<button type="button" class="linkbtn xs" onclick={() => remove(it.key)}>Ta bort bilden</button>
					</div>
				</li>
			{/each}
		</ul>
	{/if}
	<p class="xs muted note">Lägg bara upp bilder på andra om de har sagt ok. Bilderna sparas bara i din webbläsare i demon.</p>
</div>

<style>
	.upload {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-2);
	}

	.file-btn {
		position: relative;
		cursor: pointer;
	}

	.file {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		opacity: 0;
		cursor: pointer;
	}

	.file-btn:has(.file:focus-visible) {
		outline: 3px solid var(--focus);
		outline-offset: 2px;
	}

	.previews {
		display: grid;
		gap: var(--space-2);
		width: 100%;
	}

	.pv {
		display: grid;
		grid-template-columns: 96px minmax(0, 1fr);
		gap: var(--space-2);
		padding: var(--space-2);
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
	}

	.pv-img {
		width: 96px;
		height: 96px;
		object-fit: cover;
		background: var(--surface-sunk);
		border: 3px solid var(--photo-frame);
		box-shadow: var(--shadow-sm);
	}

	.pv-fields {
		display: grid;
		gap: 4px;
		align-content: start;
	}

	.pv-fields input[type='range'] {
		width: 100%;
		accent-color: var(--accent);
	}

	.pv-fields button {
		justify-self: start;
	}

	.note {
		flex-basis: 100%;
		margin: 0;
	}
</style>
