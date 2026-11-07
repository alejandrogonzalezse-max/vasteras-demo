// En egen, kort chiptune-slinga ("Kvällsdopp") spelad med WebAudio.
// Inga ljudfiler och ingen befintlig låt. AudioContext skapas först när någon
// trycker play – inget ljud kan alltså starta av sig själv.

const BPM = 132;
const EIGHTH = 60 / BPM / 2;

// Melodi i åttondelar (MIDI-nummer, 0 = paus): fyra takter som loopar.
const LEAD = [
	72, 0, 76, 79, 81, 79, 76, 0, 74, 0, 77, 81, 79, 77, 74, 0,
	72, 0, 76, 79, 84, 81, 79, 76, 77, 76, 74, 72, 74, 0, 72, 0
];
// Bas i fjärdedelar
const BASS = [48, 48, 55, 55, 50, 50, 57, 57, 48, 48, 55, 55, 53, 55, 48, 48];

export const LOOP_SECONDS = LEAD.length * EIGHTH;

const freq = (m: number) => 440 * 2 ** ((m - 69) / 12);

type Listener = (playing: boolean) => void;

class Chiptune {
	#ctx: AudioContext | null = null;
	#master: GainNode | null = null;
	#timer: ReturnType<typeof setInterval> | null = null;
	#step = 0;
	#next = 0;
	#startedAt = 0;
	#listeners = new Set<Listener>();
	playing = false;

	on(fn: Listener) {
		this.#listeners.add(fn);
		return () => this.#listeners.delete(fn);
	}

	#emit() {
		for (const fn of this.#listeners) fn(this.playing);
	}

	/** Sekunder sedan start, för displayen. */
	elapsed() {
		return this.#ctx && this.playing ? this.#ctx.currentTime - this.#startedAt : 0;
	}

	#note(type: OscillatorType, m: number, at: number, len: number, vol: number) {
		const ctx = this.#ctx!;
		const osc = ctx.createOscillator();
		const g = ctx.createGain();
		osc.type = type;
		osc.frequency.value = freq(m);
		g.gain.setValueAtTime(0.0001, at);
		g.gain.exponentialRampToValueAtTime(vol, at + 0.01);
		g.gain.exponentialRampToValueAtTime(0.0001, at + len * 0.95);
		osc.connect(g).connect(this.#master!);
		osc.start(at);
		osc.stop(at + len);
	}

	#schedule = () => {
		const ctx = this.#ctx!;
		while (this.#next < ctx.currentTime + 0.12) {
			const i = this.#step % LEAD.length;
			if (LEAD[i]) this.#note('square', LEAD[i], this.#next, EIGHTH, 0.35);
			if (i % 2 === 0) this.#note('triangle', BASS[(i / 2) % BASS.length], this.#next, EIGHTH * 2, 0.6);
			this.#next += EIGHTH;
			this.#step++;
		}
	};

	async play() {
		if (this.playing) return;
		const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
		if (!AC) return;
		if (!this.#ctx) {
			this.#ctx = new AC();
			this.#master = this.#ctx.createGain();
			this.#master.gain.value = 0.08;
			this.#master.connect(this.#ctx.destination);
		}
		await this.#ctx.resume();
		this.#step = 0;
		this.#next = this.#ctx.currentTime + 0.05;
		this.#startedAt = this.#next;
		this.#timer = setInterval(this.#schedule, 25);
		this.playing = true;
		this.#emit();
	}

	stop() {
		if (this.#timer) clearInterval(this.#timer);
		this.#timer = null;
		if (this.#ctx) this.#ctx.suspend();
		if (!this.playing) return;
		this.playing = false;
		this.#emit();
	}
}

/** En enda spelare för hela sajten. */
export const chiptune = new Chiptune();
