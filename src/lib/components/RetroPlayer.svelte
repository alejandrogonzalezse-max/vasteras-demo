<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { chiptune, LOOP_SECONDS } from '#lib/chiptune.ts';
	import { demo } from '#lib/state.svelte.ts';
	import Icon from './Icon.svelte';

	let { title }: { title: string } = $props();
	let playing = $state(false);
	let secs = $state(0);
	let tick: ReturnType<typeof setInterval> | undefined;

	onMount(() =>
		chiptune.on((p) => {
			playing = p;
			clearInterval(tick);
			if (p) tick = setInterval(() => (secs = chiptune.elapsed() % LOOP_SECONDS), 250);
			else secs = 0;
		})
	);

	onDestroy(() => {
		clearInterval(tick);
		chiptune.stop();
	});

	// Stäng av direkt om ljudet slås av i sidfoten.
	$effect(() => {
		if (!demo.d.sound) chiptune.stop();
	});

	const mmss = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
</script>

<div class="player" class:playing data-testid="player">
	<div class="lcd" aria-hidden="true">
		<div class="marquee"><span>♪ {title} ♪</span></div>
		<div class="lcd-row">
			<span class="time num">{mmss(secs)}</span>
			<span class="eq">{#each Array(5) as _, i (i)}<i style:--d={`${i * 90}ms`}></i>{/each}</span>
		</div>
	</div>
	<div class="ctrl">
		<button
			type="button"
			class="btn btn-small"
			class:btn-primary={!playing}
			aria-pressed={playing}
			disabled={!demo.d.sound}
			onclick={() => (playing ? chiptune.stop() : chiptune.play())}
			data-testid="play"
		>
			<Icon name={playing ? 'mute' : 'sound'} size={12} />
			{playing ? 'Pausa' : 'Spela låten'}
		</button>
		<span class="xs muted">{demo.d.sound ? 'Egen chiptune-slinga, gjord för demon.' : 'Ljudet är avstängt i sidfoten.'}</span>
	</div>
</div>

<style>
	.player {
		display: grid;
		gap: var(--space-2);
		padding: var(--space-2);
		background: var(--surface-2);
		border: 1px dashed var(--head-border);
		border-radius: var(--radius-sm);
	}

	.lcd {
		padding: 6px 8px;
		color: #9dff9d;
		background: #0e1f12;
		border: 2px solid #2b3b2e;
		border-radius: 4px;
		box-shadow: inset 0 0 8px rgb(0 0 0 / 0.6);
		font-family: var(--font-pixel);
		font-size: 11px;
		text-shadow: 0 0 4px rgb(120 255 120 / 0.5);
		overflow: hidden;
	}

	.marquee {
		white-space: nowrap;
		overflow: hidden;
	}

	.playing .marquee span {
		display: inline-block;
		padding-left: 100%;
		animation: scroll 9s linear infinite;
	}

	.lcd-row {
		display: flex;
		justify-content: space-between;
		align-items: end;
		margin-top: 4px;
	}

	.eq {
		display: inline-flex;
		align-items: end;
		gap: 2px;
		height: 12px;
	}

	.eq i {
		width: 4px;
		height: 3px;
		background: #9dff9d;
	}

	.playing .eq i {
		animation: eq 520ms steps(4) var(--d) infinite alternate;
	}

	.ctrl {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-2);
	}

	@keyframes scroll {
		to {
			transform: translateX(-100%);
		}
	}

	@keyframes eq {
		from {
			height: 3px;
		}
		to {
			height: 12px;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.playing .marquee span,
		.playing .eq i {
			animation: none;
			padding-left: 0;
		}

		.playing .eq i {
			height: 8px;
		}
	}
</style>
