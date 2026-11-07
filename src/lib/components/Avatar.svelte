<script lang="ts">
	import { userById } from '#lib/mock.ts';
	import { avatarRects, type Look } from '#lib/avatars.ts';
	import { ME_ID } from '#lib/config.ts';
	import { demo } from '#lib/state.svelte.ts';
	import UserImage from './UserImage.svelte';

	/** look: visa ett annat utseende (förhandsvisning i "Pixla din figur"). */
	let { id, size = 40, look }: { id: string; size?: number; look?: Look } = $props();
	const u = $derived(userById(id));
	/** Egen uppladdad profilbild (bara för dig själv, och inte i förhandsvisningen). */
	const photo = $derived(!look && id === ME_ID ? demo.d.profileImage : null);
	const rects = $derived(avatarRects(id, u?.color ?? '#567890', look ?? (id === ME_ID ? demo.d.myLook : null)));
</script>

<span class="av" class:photo style:--s={`${size}px`} aria-hidden="true">
	{#if photo}<UserImage id={photo.id} alt="" square />{:else}<svg viewBox="0 0 16 16" shape-rendering="crispEdges" width={size - 4} height={size - 4} focusable="false">
		{#each rects as [x, y, w, h, c], i (i)}<rect {x} {y} width={w} height={h} fill={c} />{/each}
	</svg>{/if}
</span>

<style>
	.av {
		display: inline-grid;
		place-items: center;
		width: var(--s);
		height: var(--s);
		flex: none;
		background: var(--photo-frame);
		border: 1px solid var(--border);
		border-radius: 2px;
		box-shadow: var(--shadow-sm);
		overflow: hidden;
	}

	.av svg {
		display: block;
	}

	.av.photo :global(.uimg) {
		width: calc(var(--s) - 4px);
		height: calc(var(--s) - 4px);
	}
</style>
