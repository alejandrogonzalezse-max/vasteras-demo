<script lang="ts">
	import { page } from '$app/state';
</script>

<svelte:head><title>Hittade inte sidan</title></svelte:head>

<div class="page-head">
	<h1>{page.status === 404 ? 'Den sidan finns inte' : 'Något gick fel'}</h1>
	<p>Kanske en gammal länk? <a href="/hem">Gå till Hem</a> eller <a href="/">startsidan</a>.</p>
</div>
