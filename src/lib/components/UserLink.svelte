<script lang="ts">
	import { userById } from '#lib/mock.ts';

	let { id, dot = false }: { id: string; dot?: boolean } = $props();
	const u = $derived(userById(id));
</script>

{#if u}
	<span class="ul">
		{#if dot}<span
				class="dot"
				class:away={u.presence === 'away'}
				class:off={u.presence === 'off'}
				title={u.presence === 'on' ? 'Inloggad' : u.presence === 'away' ? 'Borta' : 'Utloggad'}
			></span><span class="sr-only">{u.presence === 'on' ? 'Inloggad:' : u.presence === 'away' ? 'Borta:' : 'Utloggad:'}</span>{/if}<a href={`/profil/${u.id}`}>{u.name}</a>
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
