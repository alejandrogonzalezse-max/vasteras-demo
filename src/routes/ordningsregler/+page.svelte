<script lang="ts">
	import { SITE_NAME } from '#lib/config.ts';
	import { rules } from '#lib/mock.ts';
	import DraftPage from '#lib/components/DraftPage.svelte';
</script>

<DraftPage title="Ordningsregler">
	<p>{SITE_NAME} finns för att västeråsare ska träffas på riktigt. Reglerna är få och skrivna så att alla kan förstå dem.</p>
	<ol class="rules">
		{#each rules as r (r.n)}
			<li><h2>{r.title}</h2><p>{r.text}</p></li>
		{/each}
	</ol>
	<h2>Om något går fel</h2>
	<p>Anmäl innehåll med knappen vid inlägget eller via <a href="/anmal">Anmäl innehåll</a>. Moderatorerna är frivilliga och motiverar alltid sina beslut. Du kan överklaga inom 14 dagar.</p>
</DraftPage>

<style>
	.rules {
		padding-left: 1.4em;
	}

	.rules h2 {
		margin: var(--space-3) 0 4px;
	}

	.rules p {
		margin: 0;
	}
</style>
