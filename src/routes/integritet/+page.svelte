<script lang="ts">
	import { SITE_NAME } from '#lib/config.ts';
	import DraftPage from '#lib/components/DraftPage.svelte';
</script>

<DraftPage title="Integritet">
	<p>{SITE_NAME} drivs ideellt och samlar in så lite som möjligt.</p>
	<h2>Det här sparar vi</h2>
	<ul>
		<li>Ditt användarnamn, din e-post och vem som bjöd in dig.</li>
		<li>Det du själv skriver: lappar, inlägg, gästboksinlägg och status.</li>
		<li>Vilka lappar du tryckt "Jag kommer" på – det syns för andra som ska dit.</li>
	</ul>
	<h2>Det här gör vi inte</h2>
	<ul>
		<li>Ingen reklam och inga annonsnätverk.</li>
		<li>Ingen spårning, inga tredjepartsskript och ingen algoritm som profilerar dig.</li>
		<li>Vi säljer aldrig uppgifter vidare.</li>
		<li>Öppen dörr visar aldrig din adress på kartan – bara stadsdelen.</li>
	</ul>
	<h2>Dina rättigheter</h2>
	<p>Du kan när som helst ladda ner allt vi har om dig, eller radera ditt konto. Då försvinner allt inom 30 dagar.</p>
	<h2>Om demon</h2>
	<p>I den här demon sparas ingenting på någon server. Det du gör ligger bara i din egen webbläsare, och "Återställ demon" längst ner tar bort det.</p>
</DraftPage>
