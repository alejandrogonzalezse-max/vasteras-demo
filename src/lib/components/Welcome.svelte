<script lang="ts">
	import Avatar from './Avatar.svelte';
	import Icon from './Icon.svelte';

	// Namnet är redan sanerat (founder.svelte.ts) och skrivs bara ut som text, aldrig som HTML.
	let {
		name,
		open = $bindable(false),
		ontour,
		onself
	}: { name: string; open?: boolean; ontour: () => void; onself: () => void } = $props();

	let dlg: HTMLDialogElement | undefined = $state();

	$effect(() => {
		if (!dlg) return;
		if (open && !dlg.open) {
			dlg.showModal();
		}
		if (!open && dlg.open) dlg.close();
	});
</script>

<dialog
	bind:this={dlg}
	class="msn-win"
	aria-labelledby="welcome-title"
	aria-describedby="welcome-text"
	data-testid="welcome"
	onclose={() => (open = false)}
>
	<div class="titlebar">
		<span class="tb-icon" aria-hidden="true"><Icon name="dice" size={14} /></span>
		<span class="tb-title">Västeråsarna – Meddelande</span>
		<button type="button" class="tb-close" aria-label="Stäng" onclick={() => (open = false)}>×</button>
	</div>
	<div class="body">
		<div class="who">
			<Avatar id="grundaren" size={56} />
			<p class="xs muted"><span class="dot"></span> Västeråsarna säger:</p>
		</div>
		<div class="msg">
			<h2 id="welcome-title">Hej {name}!</h2>
			<p id="welcome-text">
				Det här är Västeråsarna – din idé, byggd på riktigt. Klicka runt, slå tärningen och sätt upp en lapp.
			</p>
			<div class="acts">
				<!-- Dialogens huvudval får fokus när fönstret öppnas (standardbeteende för <dialog>). -->
				<!-- svelte-ignore a11y_autofocus -->
				<button type="button" class="btn btn-primary" autofocus onclick={ontour}><Icon name="eye" size={12} /> Visa mig runt</button>
				<button type="button" class="btn" onclick={onself}>Jag klickar själv</button>
			</div>
		</div>
	</div>
</dialog>

<style>
	.msn-win {
		width: min(460px, calc(100vw - 24px));
		padding: 0;
		color: var(--text);
		background: var(--surface);
		border: 1px solid #2d528a;
		border-radius: 8px 8px 6px 6px;
		box-shadow:
			0 0 0 1px rgb(255 255 255 / 0.4) inset,
			0 18px 50px rgb(0 0 0 / 0.45);
		overflow: hidden;
	}

	.msn-win[open] {
		animation: nudge 520ms var(--ease);
	}

	.msn-win::backdrop {
		background: rgb(7 13 25 / 0.45);
	}

	.titlebar {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 6px 6px 6px 10px;
		color: #fff;
		background: linear-gradient(to bottom, #4f86d6, #1b56c4 55%, #1648a6);
		border-bottom: 1px solid #10305f;
	}

	.tb-icon {
		display: grid;
		place-items: center;
		width: 20px;
		height: 20px;
		color: #1b56c4;
		background: #fff;
		border-radius: 4px;
	}

	.tb-title {
		flex: 1;
		font-size: var(--text-sm);
		font-weight: 700;
		text-shadow: 0 1px 0 rgb(0 0 0 / 0.35);
	}

	.tb-close {
		width: 32px;
		height: 28px;
		font-size: 20px;
		line-height: 1;
		color: #fff;
		background: linear-gradient(#e8735a, #c8463a);
		border: 1px solid #8a2e25;
		border-radius: 4px;
		cursor: pointer;
	}

	.body {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: var(--space-3);
		padding: var(--space-3);
		background:
			linear-gradient(to bottom, var(--accent-soft), var(--surface) 60%);
	}

	.who {
		display: grid;
		justify-items: center;
		gap: 4px;
		text-align: center;
	}

	.who p {
		display: flex;
		align-items: center;
		gap: 4px;
		margin: 0;
		max-width: 80px;
		font-style: italic;
	}

	.msg h2 {
		margin: 0 0 6px;
		font-family: var(--font-display);
		font-weight: 400;
		font-size: 2rem;
		line-height: 1;
		overflow-wrap: anywhere;
	}

	.msg p {
		margin: 0 0 var(--space-3);
	}

	.acts {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}

	@keyframes nudge {
		0%,
		100% {
			transform: translate(0, 0);
		}
		15% {
			transform: translate(-8px, 2px);
		}
		30% {
			transform: translate(7px, -3px);
		}
		45% {
			transform: translate(-6px, 3px);
		}
		60% {
			transform: translate(5px, -2px);
		}
		75% {
			transform: translate(-3px, 1px);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.msn-win[open] {
			animation: none;
		}
	}

	@media (max-width: 420px) {
		.body {
			grid-template-columns: 1fr;
		}

		.who {
			grid-auto-flow: column;
			justify-content: start;
			align-items: center;
		}

		.who p {
			max-width: none;
		}
	}
</style>
