<script lang="ts">
	import qrcode from 'qrcode-generator';

	// QR-koden räknas fram lokalt (MIT-licensierat bibliotek) – ingen extern tjänst.
	let { value, label, size = 160 }: { value: string; label: string; size?: number } = $props();
	const qr = $derived.by(() => {
		const q = qrcode(0, 'M');
		q.addData(value);
		q.make();
		const n = q.getModuleCount();
		let d = '';
		for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) d += `M${c} ${r}h1v1h-1z`;
		return { n, d };
	});
</script>

<svg
	class="qr"
	viewBox={`-2 -2 ${qr.n + 4} ${qr.n + 4}`}
	width={size}
	height={size}
	shape-rendering="crispEdges"
	role="img"
	aria-label={label}
>
	<rect x="-2" y="-2" width={qr.n + 4} height={qr.n + 4} fill="#fff" />
	<path d={qr.d} fill="#111" />
</svg>

<style>
	.qr {
		display: block;
		max-width: 100%;
		height: auto;
		border: 3px solid #fff;
		outline: 1px solid var(--border-strong);
	}
</style>
