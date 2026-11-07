<script lang="ts">
	import { ME_ID } from '#lib/config.ts';
	import { HAIR, SKIN, lookFor, splitLook, type HairStyle, type Headwear, type Look } from '#lib/avatars.ts';
	import { demo } from '#lib/state.svelte.ts';
	import Avatar from './Avatar.svelte';
	import Icon from './Icon.svelte';

	let { onclose }: { onclose?: () => void } = $props();

	const start = demo.d.myLook ?? lookFor(ME_ID);
	const split = splitLook(start);

	let skin = $state(start.skin);
	let style = $state<HairStyle>(split.style);
	let hairColor = $state(start.hairColor);
	let headwear = $state<Headwear>(split.headwear);
	let hat = $state(start.hat ?? '#1b56c4');
	let beard = $state(!!start.beard);
	let glasses = $state(!!start.glasses);
	let shirt = $state(start.shirt);

	const draft = $derived<Look>({ skin, hair: style, hairColor, headwear, hat, beard, glasses, shirt });

	const STYLES: { id: HairStyle; label: string }[] = [
		{ id: 'kort', label: 'Kort' },
		{ id: 'lang', label: 'Långt' },
		{ id: 'knut', label: 'Knut' },
		{ id: 'lockigt', label: 'Lockigt' },
		{ id: 'lugg', label: 'Lugg' },
		{ id: 'flint', label: 'Flint' }
	];
	const HAIRS = [
		{ c: HAIR.svart, label: 'Svart' },
		{ c: HAIR.brun, label: 'Brunt' },
		{ c: HAIR.ljus, label: 'Ljust' },
		{ c: HAIR.rod, label: 'Rött' },
		{ c: HAIR.gra, label: 'Grått' },
		{ c: HAIR.vit, label: 'Vitt' }
	];
	const COLORS = [
		{ c: '#1b56c4', label: 'Blå' },
		{ c: '#c8463a', label: 'Röd' },
		{ c: '#2f7a6a', label: 'Grön' },
		{ c: '#f2c14e', label: 'Gul' },
		{ c: '#7a3aa5', label: 'Lila' },
		{ c: '#22252b', label: 'Svart' },
		{ c: '#e8735a', label: 'Orange' },
		{ c: '#3a9aa5', label: 'Turkos' }
	];

	function save() {
		demo.d.myLook = $state.snapshot(draft);
		demo.toast('Din nya figur syns nu överallt – i dagboken, gästböcker och Topp 8.');
		onclose?.();
	}

	function reset() {
		demo.d.myLook = null;
		demo.toast('Figuren är återställd.');
		onclose?.();
	}
</script>

<div class="editor" data-testid="avatar-editor">
	<div class="preview">
		<Avatar id={ME_ID} size={128} look={draft} />
		<p class="xs muted">Förhandsvisning</p>
	</div>
	<div class="opts">
		<fieldset>
			<legend>Hudton</legend>
			<div class="sw">
				{#each SKIN as c, i (c)}
					<label class="swatch" style:--c={c}><input type="radio" name="skin" value={i} bind:group={skin} /><span class="sr-only">Hudton {i + 1}</span></label>
				{/each}
			</div>
		</fieldset>
		<fieldset>
			<legend>Frisyr</legend>
			<div class="chips">
				{#each STYLES as st (st.id)}
					<label class="chip"><input type="radio" name="style" value={st.id} bind:group={style} /><span>{st.label}</span></label>
				{/each}
			</div>
		</fieldset>
		<fieldset>
			<legend>Hårfärg</legend>
			<div class="sw">
				{#each HAIRS as h (h.c)}
					<label class="swatch" style:--c={h.c}><input type="radio" name="hair" value={h.c} bind:group={hairColor} /><span class="sr-only">{h.label}</span></label>
				{/each}
			</div>
		</fieldset>
		<fieldset>
			<legend>Mössa eller keps</legend>
			<div class="chips">
				{#each [['ingen', 'Ingen'], ['keps', 'Keps'], ['mossa', 'Mössa']] as [v, l] (v)}
					<label class="chip"><input type="radio" name="headwear" value={v} bind:group={headwear} /><span>{l}</span></label>
				{/each}
			</div>
			{#if headwear !== 'ingen'}
				<div class="sw sub" role="group" aria-label="Färg på mössa eller keps">
					{#each COLORS as h (h.c)}
						<label class="swatch" style:--c={h.c}><input type="radio" name="hat" value={h.c} bind:group={hat} /><span class="sr-only">{h.label}</span></label>
					{/each}
				</div>
			{/if}
		</fieldset>
		<fieldset>
			<legend>Detaljer</legend>
			<div class="chips">
				<label class="chip"><input type="checkbox" bind:checked={beard} /><span>Skägg</span></label>
				<label class="chip"><input type="checkbox" bind:checked={glasses} /><span>Glasögon</span></label>
			</div>
		</fieldset>
		<fieldset>
			<legend>Tröjfärg</legend>
			<div class="sw">
				{#each COLORS as h (h.c)}
					<label class="swatch" style:--c={h.c}><input type="radio" name="shirt" value={h.c} bind:group={shirt} /><span class="sr-only">{h.label}</span></label>
				{/each}
			</div>
		</fieldset>
		<div class="row">
			<button type="button" class="btn btn-primary" onclick={save}><Icon name="check" size={12} /> Spara figuren</button>
			<button type="button" class="btn" onclick={reset}>Återställ</button>
			<button type="button" class="linkbtn small" onclick={() => onclose?.()}>Avbryt</button>
		</div>
	</div>
</div>

<style>
	.editor {
		display: grid;
		gap: var(--space-3);
		margin-top: var(--space-3);
		padding: var(--space-3);
		background: var(--surface-2);
		border: 1px dashed var(--head-border);
		border-radius: var(--radius);
	}

	.preview {
		display: grid;
		justify-items: center;
		gap: 4px;
	}

	.preview p {
		margin: 0;
	}

	fieldset {
		margin: 0 0 var(--space-2);
		padding: var(--space-2);
		background: var(--surface);
	}

	.sw,
	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}

	.sw.sub {
		margin-top: var(--space-2);
	}

	.swatch {
		position: relative;
		width: 32px;
		height: 32px;
		background: var(--c);
		border: 2px solid var(--photo-frame);
		outline: 1px solid var(--border-strong);
		border-radius: var(--radius-sm);
		cursor: pointer;
	}

	.swatch input,
	.chip input {
		position: absolute;
		opacity: 0;
		width: 1px;
		height: 1px;
	}

	.swatch:has(input:checked) {
		outline: 3px solid var(--accent);
		outline-offset: 1px;
	}

	.chip {
		position: relative;
		display: inline-flex;
		align-items: center;
		min-height: 32px;
		padding: 2px 10px;
		font-size: var(--text-sm);
		background: var(--btn-bg);
		border: 1px solid var(--btn-border);
		border-radius: var(--radius-pill);
		cursor: pointer;
	}

	.chip:has(input:checked) {
		color: var(--accent-text);
		background: var(--accent);
		border-color: var(--accent);
	}

	.swatch:has(input:focus-visible),
	.chip:has(input:focus-visible) {
		box-shadow: 0 0 0 3px var(--focus);
	}
</style>
