<script lang="ts">
	import 'leaflet/dist/leaflet.css';
	import { onMount } from 'svelte';
	import type * as Leaflet from 'leaflet';
	import { TILE_ATTRIBUTION, TILE_URL } from '#lib/config.ts';
	import { ICONS } from '#lib/icons.ts';

	let { lat, lng, label }: { lat: number; lng: number; label: string } = $props();
	let el: HTMLDivElement;

	onMount(() => {
		let map: Leaflet.Map | undefined;
		let alive = true;
		import('leaflet').then((mod) => {
			if (!alive) return;
			const L = (mod.default ?? mod) as typeof Leaflet;
			map = L.map(el, {
				center: [lat, lng],
				zoom: 15,
				zoomControl: false,
				dragging: false,
				scrollWheelZoom: false,
				doubleClickZoom: false,
				boxZoom: false,
				keyboard: false,
				touchZoom: false
			});
			map.attributionControl.setPrefix(false);
			L.tileLayer(TILE_URL, { attribution: TILE_ATTRIBUTION, maxZoom: 19 }).addTo(map);
			L.marker([lat, lng], {
				icon: L.divIcon({
					className: 'mm-pin',
					html: `<span><svg viewBox="0 0 12 12" width="16" height="16" shape-rendering="crispEdges" aria-hidden="true"><path fill="currentColor" d="${ICONS.star}"/></svg></span>`,
					iconSize: [34, 40],
					iconAnchor: [17, 38]
				}),
				keyboard: false,
				interactive: false
			}).addTo(map);
		});
		return () => {
			alive = false;
			map?.remove();
		};
	});
</script>

<div class="mini" bind:this={el} data-label={label}></div>

<style>
	.mini {
		height: 200px;
		border: 1px solid var(--head-border);
		border-radius: var(--radius);
		overflow: hidden;
		background: var(--surface-sunk);
		z-index: 0;
	}

	.mini :global(.leaflet-tile-pane) {
		filter: var(--map-filter);
	}

	.mini :global(.leaflet-control-attribution) {
		font-size: 11px;
		color: #222;
		background: rgb(255 255 255 / 0.9);
	}

	.mini :global(.leaflet-control-attribution a) {
		color: #0a4cad;
	}

	.mini :global(.mm-pin) {
		background: none;
		border: 0;
	}

	.mini :global(.mm-pin span) {
		display: grid;
		place-items: center;
		width: 34px;
		height: 32px;
		color: #fff;
		background: #1b56c4;
		border: 2px solid #fff;
		border-radius: 6px;
		box-shadow: 0 2px 4px rgb(0 0 0 / 0.35);
	}
</style>
