<script lang="ts">
	import { SITE_NAME } from '#lib/config.ts';
	import DraftPage from '#lib/components/DraftPage.svelte';
</script>

<DraftPage title="Kontakt">
	<p>{SITE_NAME} är ett ideellt projekt som drivs av västeråsare på fritiden.</p>
	<h2>Frågor och idéer</h2>
	<p>Skriv till oss på <strong>hej@exempel.se</strong> (påhittad adress i demon). Vi svarar oftast inom några dagar.</p>
	<h2>Vill du bli moderator?</h2>
	<p>Vi söker fler frivilliga från olika stadsdelar. Du behöver ha varit medlem i tre månader.</p>
	<h2>Något akut?</h2>
	<p>Om någon är i fara: ring 112. Vi är ingen jourverksamhet.</p>
</DraftPage>
