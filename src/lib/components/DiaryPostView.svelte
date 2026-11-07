<script lang="ts">
	import { ME_ID } from '#lib/config.ts';
	import type { DiaryPost } from '#lib/mock.ts';
	import { demo } from '#lib/state.svelte.ts';
	import { agoLabel, since } from '#lib/time.ts';
	import Avatar from './Avatar.svelte';
	import Icon from './Icon.svelte';
	import Photo from './Photo.svelte';
	import UserImage from './UserImage.svelte';
	import UserLink from './UserLink.svelte';

	let { post }: { post: DiaryPost } = $props();
	const mine = $derived(post.by === ME_ID);
	const liked = $derived(!!demo.d.schysst[post.id]);
	const priv = $derived(post.visibility === 'privat');
</script>

<li class="post" class:priv data-testid="diary-post">
	<Avatar id={post.by} size={44} />
	<div class="post-body">
		<p class="post-head small">
			<UserLink id={post.by} />
			<span class="muted">· {agoLabel(since(post, demo.now), demo.now)}</span>
			{#if post.place}<span class="muted">· <Icon name="pin" size={10} /> {post.place}</span>{/if}
			{#if priv}<span class="tag" data-testid="private"><Icon name="lock" size={10} /> Bara jag</span>{/if}
		</p>
		{#if post.text}<p class="post-text">{post.text}</p>{/if}
		{#if post.photo}
			<div class="post-photo"><Photo caption={post.photo.caption} scene={post.photo.scene} /></div>
		{/if}
		{#if post.images?.length}
			<ul class="plain imgs" class:one={post.images.length === 1}>
				{#each post.images as img (img.id)}
					<li><figure><UserImage id={img.id} alt={img.alt} square={post.images.length > 1} /><figcaption class="xs">{img.alt}</figcaption></figure></li>
				{/each}
			</ul>
		{/if}
		{#if !priv}
			<div class="row">
				<button type="button" class="btn btn-small" class:btn-done={liked} aria-pressed={liked} onclick={() => (demo.d.schysst[post.id] = !liked)}>
					<Icon name="heart" size={12} /> {liked ? 'Schysst ✓' : 'Schysst'}
				</button>
				{#if mine}
					<span class="small"><strong class="num">{post.schysst + (liked ? 1 : 0)}</strong> tycker det är schysst <span class="muted">(syns bara för dig)</span></span>
				{/if}
			</div>
		{/if}
	</div>
</li>

<style>
	.post {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr);
		gap: var(--space-3);
	}

	.priv .post-body {
		padding: var(--space-2);
		background: var(--surface-2);
		border: 1px dashed var(--border-strong);
		border-radius: var(--radius-sm);
	}

	.post-head {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 4px 6px;
		margin: 0 0 4px;
	}

	.post-text {
		margin: 0 0 var(--space-2);
		white-space: pre-line;
	}

	.post-photo {
		max-width: 220px;
		margin-bottom: var(--space-2);
	}

	.imgs {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: var(--space-2);
		max-width: 420px;
		margin-bottom: var(--space-2);
	}

	.imgs.one {
		grid-template-columns: 1fr;
		max-width: 360px;
	}

	.imgs figure {
		margin: 0;
		padding: 5px;
		background: var(--photo-frame);
		border: 1px solid var(--border);
		box-shadow: var(--shadow-sm);
	}

	.imgs figcaption {
		margin-top: 4px;
		color: #46536a;
	}
</style>
