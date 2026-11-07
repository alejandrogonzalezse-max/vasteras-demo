<script lang="ts">
	import { tick } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { TOUR } from '#lib/tour.ts';
	import { demo } from '#lib/state.svelte.ts';

	let headEl: HTMLElement | undefined = $state();
	const step = $derived(demo.d.tour);
	const cur = $derived(step === null ? null : TOUR[step]);
	const last = $derived(step === TOUR.length - 1);

	function clearHighlight() {
		document.querySelectorAll('[data-tour-on]').forEach((e) => e.removeAttribute('data-tour-on'));
	}

	$effect(() => {
		if (!demo.ready || !cur) return;
		if (page.url.pathname !== cur.path) {
			goto(cur.path);
			return;
		}
		const target = cur.target;
		tick().then(() =>
			setTimeout(() => {
				clearHighlight();
				const el = document.querySelector<HTMLElement>(target);
				const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
				if (el) {
					el.setAttribute('data-tour-on', '');
					el.scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : 'smooth' });
				}
				headEl?.focus({ preventScroll: true });
			}, 120)
		);
	});

	function next() {
		if (step === null) return;
		if (last) return end(true);
		demo.d.tour = step + 1;
	}

	function prev() {
		if (step) demo.d.tour = step - 1;
	}

	function end(done = false) {
		demo.d.tour = null;
		clearHighlight();
		if (done) demo.toast('Rundturen är klar. Nu är det din tur – slå tärningen!', '/hem#tarningen', 'Till tärningen');
	}
</script>

<svelte:window onkeydown={(e) => e.key === 'Escape' && cur && end()} />

{#if cur && step !== null}
	<div class="tour" role="dialog" aria-modal="false" aria-labelledby="tour-title" data-testid="tour">
		<p class="tour-step display">Rundtur · steg {step + 1} av {TOUR.length}</p>
		<h2 id="tour-title" tabindex="-1" bind:this={headEl}>{cur.title}</h2>
		<p class="tour-text">{cur.text}</p>
		<div class="dots" aria-hidden="true">
			{#each TOUR as _, i (i)}<span class:on={i <= step}></span>{/each}
		</div>
		<div class="tour-act">
			<button type="button" class="btn btn-small" onclick={prev} disabled={step === 0}>Föregående</button>
			<button type="button" class="btn btn-small btn-primary" onclick={next}>{last ? 'Klart!' : 'Nästa'}</button>
			<button type="button" class="linkbtn small end" onclick={() => end()}>Avsluta rundturen</button>
		</div>
	</div>
{/if}

<style>
	.tour {
		position: fixed;
		left: 50%;
		bottom: 16px;
		z-index: 900;
		width: min(460px, calc(100vw - 24px));
		padding: var(--space-3);
		color: var(--text);
		background: var(--surface);
		border: 2px solid var(--accent);
		border-radius: var(--radius-lg);
		box-shadow: 0 10px 30px rgb(0 0 0 / 0.3);
		transform: translateX(-50%);
		animation: rise var(--speed) var(--ease);
	}

	.tour-step {
		margin: 0;
		color: var(--head-text);
	}

	h2 {
		margin: 2px 0 6px;
		font-size: var(--text-xl);
	}

	h2:focus {
		outline: none;
	}

	.tour-text {
		margin: 0 0 var(--space-2);
		font-size: var(--text-sm);
	}

	.dots {
		display: flex;
		gap: 4px;
		margin-bottom: var(--space-2);
	}

	.dots span {
		width: 18px;
		height: 6px;
		background: var(--border);
		border-radius: 2px;
	}

	.dots span.on {
		background: var(--accent);
	}

	.tour-act {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-2);
	}

	.end {
		margin-left: auto;
	}

	@keyframes rise {
		from {
			opacity: 0;
			transform: translate(-50%, 12px);
		}
	}
</style>
