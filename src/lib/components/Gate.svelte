<script lang="ts">
	import { goto } from '$app/navigation';
	import { demo } from '#lib/state.svelte.ts';
	import Box from './Box.svelte';
</script>

<div class="gate">
	<Box title="Bara för inloggade" icon="lock">
		<p>Den här delen syns bara för medlemmar. I den riktiga sajten kommer man in med en inbjudan från någon som redan är med.</p>
		<div class="row">
			<button type="button" class="btn btn-primary" onclick={() => (demo.d.loggedIn = true)}>Gå in i demon som Gubben940</button>
			<button type="button" class="btn" onclick={() => goto('/')}>Till startsidan</button>
		</div>
	</Box>
</div>

<style>
	.gate {
		max-width: 560px;
		margin: var(--space-5) auto;
	}
</style>
