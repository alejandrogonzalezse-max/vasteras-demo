<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { SITE_NAME } from '#lib/config.ts';
	import { forumCategories } from '#lib/mock.ts';
	import { demo } from '#lib/state.svelte.ts';
	import Box from '#lib/components/Box.svelte';
	import ImageUpload, { missingAlt, saveUploads, type UploadItem } from '#lib/components/ImageUpload.svelte';

	let cat = $state(forumCategories[0].id);
	let title = $state('');
	let text = $state('');
	let images = $state<UploadItem[]>([]);
	let error = $state('');
	let busy = $state(false);

	onMount(() => {
		const k = new URLSearchParams(location.search).get('kategori');
		if (k && forumCategories.some((c) => c.id === k)) cat = k;
	});

	async function submit(e: SubmitEvent) {
		e.preventDefault();
		error = '';
		if (!title.trim()) return (error = 'Tråden behöver en rubrik.');
		if (!text.trim()) return (error = 'Skriv några rader så att andra vet vad tråden handlar om.');
		if (missingAlt(images)) return (error = 'Skriv en kort bildtext till bilden.');
		busy = true;
		const stored = await saveUploads(images);
		const id = demo.createThread(cat, title.trim(), text.trim(), stored);
		busy = false;
		demo.toast('Tråden är publicerad.');
		goto(`/forum/trad/${id}`);
	}
</script>

<svelte:head><title>Ny tråd – Forum – {SITE_NAME}</title></svelte:head>

<p class="crumbs small"><a href="/forum">Forum</a> › Ny tråd</p>
<div class="page-head">
	<h1>Ny tråd</h1>
	<p>Fråga, tipsa eller starta en diskussion. Håll god ton – ingen reklam och ingen rikspolitik.</p>
</div>

<div class="narrow">
	<Box title="Starta en tråd" icon="forum">
		<form onsubmit={submit} novalidate>
			<div class="field">
				<label for="nt-cat">Kategori</label>
				<select id="nt-cat" bind:value={cat}>
					{#each forumCategories as c (c.id)}<option value={c.id}>{c.name}</option>{/each}
				</select>
			</div>
			<div class="field">
				<label for="nt-title">Rubrik</label>
				<input id="nt-title" type="text" maxlength="90" bind:value={title} placeholder="t.ex. Bästa stället för vinterbad?" />
			</div>
			<div class="field">
				<label for="nt-text">Text</label>
				<textarea id="nt-text" maxlength="2000" bind:value={text}></textarea>
			</div>
			<div class="field">
				<span class="label">Bild <span class="muted">(valfritt)</span></span>
				<ImageUpload bind:items={images} max={1} label="Lägg till en bild" />
			</div>
			{#if error}<p class="notice err" role="alert">{error}</p>{/if}
			<button type="submit" class="btn btn-primary" disabled={busy}>Publicera tråden</button>
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

	textarea {
		min-height: 160px;
	}
</style>
