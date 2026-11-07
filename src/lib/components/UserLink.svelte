<script lang="ts">
	import { userById } from '#lib/mock.ts';
	import FriendButton from './FriendButton.svelte';

	/** addFriend = visa ett litet "+ Lägg till vän" efter namnet om ni inte är vänner. */
	let { id, dot = false, addFriend = false }: { id: string; dot?: boolean; addFriend?: boolean } = $props();
	const u = $derived(userById(id));
</script>

{#if u}
	<span class="ul">
		{#if dot}<span
				class="dot"
				class:away={u.presence === 'away'}
				class:off={u.presence === 'off'}
				title={u.presence === 'on' ? 'Inloggad' : u.presence === 'away' ? 'Borta' : 'Utloggad'}
			></span><span class="sr-only">{u.presence === 'on' ? 'Inloggad:' : u.presence === 'away' ? 'Borta:' : 'Utloggad:'}</span>{/if}<a href={`/profil/${u.id}`}>{u.name}</a>{#if addFriend}<FriendButton {id} compact />{/if}
	</span>
{:else}
	<span>{id}</span>
{/if}

<style>
	.ul {
		display: inline-flex;
		align-items: center;
		gap: 6px;
	}
</style>
