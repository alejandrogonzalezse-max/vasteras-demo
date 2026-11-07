<script lang="ts">
	import 'leaflet/dist/leaflet.css';
	import { onMount, tick } from 'svelte';
	import { goto } from '$app/navigation';
	import type * as Leaflet from 'leaflet';
	import { MAP_BOUNDS, MAP_CENTER, SITE_NAME, TILE_ATTRIBUTION, TILE_URL } from '#lib/config.ts';
	import { ICONS } from '#lib/icons.ts';
	import { openDoors, places, userById, type Activity, type OpenDoor, type Place } from '#lib/mock.ts';
	import { demo, whenLabel } from '#lib/state.svelte.ts';
	import ActivityCard from '#lib/components/ActivityCard.svelte';
	import Box from '#lib/components/Box.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import UserLink from '#lib/components/UserLink.svelte';

	type Pin = { kind: 'akt'; item: Activity } | { kind: 'plats'; item: Place };
	type Sel =
		| Pin
		| { kind: 'door'; item: OpenDoor }
		| { kind: 'many'; items: Pin[] }
		| null;

	/** Nålar närmare än så här (i skärmpixlar) slås ihop till ett kluster. */
	const CLUSTER_PX = 48;

	let mapEl: HTMLDivElement;
	let panelEl: HTMLElement | undefined = $state();
	let map: Leaflet.Map | undefined;
	let L: typeof Leaflet | undefined;
	let pinLayer: Leaflet.LayerGroup | undefined;
	let doorLayer: Leaflet.LayerGroup | undefined;
	let show = $state({ akt: true, door: true, plats: true });
	let sel = $state<Sel>(null);
	let asked = $state<Record<string, boolean>>({});
	let failed = $state(false);

	const acts = $derived(demo.allActivities);

	function svg(name: string) {
		return `<svg viewBox="0 0 12 12" width="18" height="18" shape-rendering="crispEdges" aria-hidden="true"><path fill="currentColor" d="${ICONS[name]}"/></svg>`;
	}

	const pinLabel = (p: Pin) => (p.kind === 'akt' ? `Aktivitet: ${p.item.title}` : `Plats: ${p.item.name}`);

	function visiblePins(): Pin[] {
		const out: Pin[] = [];
		if (show.akt) for (const a of acts) out.push({ kind: 'akt', item: a });
		if (show.plats) for (const p of places) out.push({ kind: 'plats', item: p });
		return out;
	}

	/** Enkel girig klustring i skärmkoordinater för aktuell zoomnivå. */
	function clusterPins(list: Pin[]) {
		const groups: { pins: Pin[]; x: number; y: number }[] = [];
		for (const p of list) {
			const pt = map!.latLngToLayerPoint([p.item.lat, p.item.lng]);
			const g = groups.find((c) => Math.hypot(c.x - pt.x, c.y - pt.y) < CLUSTER_PX);
			if (g) {
				g.pins.push(p);
				g.x = (g.x * (g.pins.length - 1) + pt.x) / g.pins.length;
				g.y = (g.y * (g.pins.length - 1) + pt.y) / g.pins.length;
			} else groups.push({ pins: [p], x: pt.x, y: pt.y });
		}
		return groups;
	}

	function renderPins() {
		if (!L || !map || !pinLayer) return;
		mapEl.dataset.zoom = String(map.getZoom());
		pinLayer.clearLayers();
		for (const g of clusterPins(visiblePins())) {
			const ll = map.layerPointToLatLng([g.x, g.y]);
			let m: Leaflet.Marker;
			if (g.pins.length === 1) {
				const p = g.pins[0];
				m = L.marker([p.item.lat, p.item.lng], {
					icon: L.divIcon({
						className: `pin pin-${p.kind}`,
						html: `<span class="pin-box">${svg(p.kind === 'akt' ? 'star' : 'tree')}</span>`,
						iconSize: [44, 44],
						iconAnchor: [22, 42]
					}),
					title: pinLabel(p),
					keyboard: true,
					riseOnHover: true
				}).on('click', () => selectAndFocus(p));
			} else {
				const n = g.pins.length;
				m = L.marker(ll, {
					icon: L.divIcon({
						className: 'pin pin-cluster',
						html: `<span class="cluster-box"><span>${n}</span></span>`,
						iconSize: [44, 44],
						iconAnchor: [22, 22]
					}),
					title: `${n} saker här – zooma in`,
					keyboard: true,
					riseOnHover: true
				}).on('click', () => openCluster(g.pins));
			}
			m.addTo(pinLayer);
			const el = m.getElement();
			el?.setAttribute('role', 'button');
			el?.setAttribute('data-count', String(g.pins.length));
		}
	}

	function openCluster(pins: Pin[]) {
		if (!map || !L) return;
		const bounds = L.latLngBounds(pins.map((p) => [p.item.lat, p.item.lng] as [number, number]));
		const target = map.getBoundsZoom(bounds.pad(0.5));
		if (map.getZoom() < map.getMaxZoom() && target > map.getZoom()) {
			map.flyToBounds(bounds.pad(0.5), { maxZoom: map.getMaxZoom(), duration: reduce() ? 0 : 0.6 });
		} else {
			// Redan inzoomat så långt det går – visa allt som en lista i panelen.
			sel = { kind: 'many', items: pins };
			tick().then(() => panelEl?.focus());
		}
	}

	const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

	function select(s: Sel, fly = true) {
		sel = s;
		if (!s || !map || s.kind === 'many') return;
		if (fly) {
			const ll: [number, number] = [s.item.lat, s.item.lng];
			map.flyTo(ll, Math.max(map.getZoom(), s.kind === 'door' ? 13 : 15), { duration: reduce() ? 0 : 0.6 });
		}
	}

	async function selectAndFocus(s: Sel) {
		select(s);
		await tick();
		panelEl?.focus();
	}

	function build() {
		if (!L || !map) return;
		doorLayer?.remove();
		doorLayer = L.layerGroup();
		for (const d of openDoors) {
			L.circle([d.lat, d.lng], {
				radius: d.radius,
				color: '#c2410c',
				weight: 2,
				dashArray: '6 6',
				fillColor: '#f97316',
				fillOpacity: 0.12
			})
				.bindTooltip(`Öppen dörr i ${d.area}`, { sticky: true })
				.on('click', () => selectAndFocus({ kind: 'door', item: d }))
				.addTo(doorLayer);
		}
		pinLayer ??= L.layerGroup().addTo(map);
		applyLayers();
	}

	function applyLayers() {
		if (!map || !doorLayer) return;
		if (show.door) doorLayer.addTo(map);
		else doorLayer.remove();
		renderPins();
	}

	onMount(() => {
		let cancelled = false;
		(async () => {
			try {
				const mod = await import('leaflet');
				L = (mod.default ?? mod) as typeof Leaflet;
			} catch {
				failed = true;
				return;
			}
			if (cancelled) return;
			map = L.map(mapEl, {
				center: MAP_CENTER,
				zoom: 12,
				minZoom: 10,
				maxZoom: 17,
				maxBounds: MAP_BOUNDS,
				maxBoundsViscosity: 1,
				zoomControl: true
			});
			map.attributionControl.setPrefix('<a href="https://leafletjs.com">Leaflet</a>');
			L.tileLayer(TILE_URL, { attribution: TILE_ATTRIBUTION, maxZoom: 19 }).addTo(map);
			build();
			map.on('zoomend', renderPins);
			const id = new URLSearchParams(window.location.search).get('nal');
			const hit = id ? acts.find((a) => a.id === id) : undefined;
			if (hit) select({ kind: 'akt', item: hit });
		})();
		return () => {
			cancelled = true;
			map?.remove();
		};
	});

	function toggle(k: 'akt' | 'door' | 'plats') {
		show[k] = !show[k];
		applyLayers();
		if (sel && sel.kind === k && !show[k]) sel = null;
	}

	function noteHere(p: Place) {
		demo.d.draft = { title: '', place: p.name, bring: '' };
		goto('/anslagstavlan#ny-lapp');
	}

	const actsAt = (p: Place) => acts.filter((a) => a.placeId === p.id);

	$effect(() => {
		void acts.length;
		renderPins();
	});
</script>

<svelte:head><title>Kartan – {SITE_NAME}</title></svelte:head>

<div class="page-head">
	<h1>Kartan</h1>
	<p>Vad händer i Västerås just nu? Klicka på en nål för att se mer. Öppna dörrar visas bara som en ring över stadsdelen – aldrig var någon bor.</p>
</div>

<div class="map-layout">
	<div class="map-col">
		<fieldset class="layers" aria-label="Kartlager">
			<legend class="sr-only">Visa lager</legend>
			<label class="layer akt" class:off={!show.akt}>
				<input type="checkbox" checked={show.akt} onchange={() => toggle('akt')} data-testid="layer-akt" />
				<span class="sw"><Icon name="star" size={14} /></span> Aktiviteter <span class="num">{acts.length}</span>
			</label>
			<label class="layer door" class:off={!show.door}>
				<input type="checkbox" checked={show.door} onchange={() => toggle('door')} data-testid="layer-door" />
				<span class="sw ring"></span> Öppen dörr <span class="num">{openDoors.length}</span>
			</label>
			<label class="layer plats" class:off={!show.plats}>
				<input type="checkbox" checked={show.plats} onchange={() => toggle('plats')} data-testid="layer-plats" />
				<span class="sw"><Icon name="tree" size={14} /></span> Platser <span class="num">{places.length}</span>
			</label>
		</fieldset>
		<div class="map" bind:this={mapEl} role="region" aria-label="Karta över Västerås" data-testid="map">
			{#if failed}<p class="notice">Kartan kunde inte laddas. Listan nedanför visar samma sak.</p>{/if}
		</div>
		<p class="xs muted map-note">Kartdata © OpenStreetMap-bidragsgivare. Kartan är begränsad till Västerås kommun.</p>
	</div>

	<aside class="panel-col" aria-label="Detaljer">
		<div class="panel" bind:this={panelEl} tabindex="-1" data-testid="panel">
			<Box title={sel ? (sel.kind === 'akt' ? 'Aktivitet' : sel.kind === 'door' ? 'Öppen dörr' : sel.kind === 'many' ? 'Flera saker här' : 'Plats') : 'Detaljer'} icon={sel?.kind === 'door' ? 'door' : sel?.kind === 'plats' ? 'tree' : 'pin'}>
				{#if !sel}
					<p>Klicka på en nål eller en ring på kartan, eller välj i listan nedanför.</p>
					<p class="small muted">Stjärna = aktivitet · Gran = plats · Streckad ring = öppen dörr</p>
				{:else if sel.kind === 'many'}
					<p class="small">Här ligger flera saker tätt ihop:</p>
					<ul class="plain list">
						{#each sel.items as p (p.item.id)}
							<li><button type="button" class="linkbtn" onclick={() => selectAndFocus(p)}>{pinLabel(p)}</button></li>
						{/each}
					</ul>
				{:else if sel.kind === 'akt'}
					<ActivityCard a={sel.item} headingLevel={3} />
				{:else if sel.kind === 'plats'}
					{@const p = sel.item}
					<h3>{p.name}</h3>
					<p class="small muted">{p.kind}</p>
					<p>{p.text}</p>
					{#if actsAt(p).length}
						<p class="small"><strong>Händer här:</strong></p>
						<ul class="small">
							{#each actsAt(p) as a (a.id)}
								<li><button type="button" class="linkbtn" onclick={() => select({ kind: 'akt', item: a })}>{a.title}</button> – {whenLabel(demo.minutesUntil(a), demo.now)}</li>
							{/each}
						</ul>
					{/if}
					<button type="button" class="btn btn-small" onclick={() => noteHere(p)}>Sätt upp en lapp här</button>
				{:else}
					{@const d = sel.item}
					<h3>{d.title}</h3>
					<p class="small">Värd: <UserLink id={d.host} /> · Stadsdel: <strong>{d.area}</strong> · {d.when}</p>
					<p>{d.text}</p>
					<p class="notice small">
						<strong>Varför bara en ring?</strong> Öppen dörr är hemma hos någon. Därför visar vi bara stadsdelen. Exakt adress skickar värden till dig när ni bestämt att du kommer.
					</p>
					{#if asked[d.id]}
						<p class="notice ok small" role="status">Förfrågan skickad till {userById(d.host)?.name}. Du får adressen om du blir välkommen.</p>
					{:else}
						<button type="button" class="btn btn-primary btn-small" onclick={() => (asked[d.id] = true)}>Fråga om att få komma</button>
					{/if}
				{/if}
			</Box>
		</div>
	</aside>
</div>

<Box title="Allt på kartan som lista" icon="board" id="lista">
	<div class="lists">
		{#if show.akt}
			<div>
				<h3 class="list-h">Aktiviteter</h3>
				<ul class="plain list">
					{#each acts as a (a.id)}
						<li><button type="button" class="linkbtn" onclick={() => selectAndFocus({ kind: 'akt', item: a })}>{a.title}</button> <span class="xs muted">{whenLabel(demo.minutesUntil(a), demo.now)}</span></li>
					{/each}
				</ul>
			</div>
		{/if}
		{#if show.door}
			<div>
				<h3 class="list-h">Öppen dörr</h3>
				<ul class="plain list">
					{#each openDoors as d (d.id)}
						<li><button type="button" class="linkbtn" onclick={() => selectAndFocus({ kind: 'door', item: d })}>{d.title}</button> <span class="xs muted">{d.area}</span></li>
					{/each}
				</ul>
			</div>
		{/if}
		{#if show.plats}
			<div>
				<h3 class="list-h">Platser</h3>
				<ul class="plain list">
					{#each places as p (p.id)}
						<li><button type="button" class="linkbtn" onclick={() => selectAndFocus({ kind: 'plats', item: p })}>{p.name}</button> <span class="xs muted">{p.kind}</span></li>
					{/each}
				</ul>
			</div>
		{/if}
	</div>
</Box>

<style>
	.map-layout {
		display: grid;
		gap: var(--space-3);
		margin-bottom: var(--space-4);
		align-items: start;
	}

	@media (min-width: 900px) {
		.map-layout {
			grid-template-columns: minmax(0, 1fr) 320px;
		}
	}

	.layers {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		margin: 0 0 var(--space-2);
		padding: 0;
		border: 0;
	}

	.layer {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		min-height: 40px;
		padding: 4px 12px 4px 8px;
		font-size: var(--text-sm);
		font-weight: 700;
		background: var(--surface);
		border: 1px solid var(--border-strong);
		border-radius: var(--radius-pill);
		cursor: pointer;
		user-select: none;
	}

	.layer.off {
		opacity: 0.7;
		background: var(--surface-sunk);
	}

	.layer .num {
		font-size: var(--text-xs);
		color: var(--text-muted);
	}

	.sw {
		display: inline-grid;
		place-items: center;
		width: 22px;
		height: 22px;
		border-radius: 4px;
		color: #fff;
	}

	.akt .sw {
		background: #1b56c4;
	}

	.plats .sw {
		background: #1d7a3a;
	}

	.sw.ring {
		background: rgb(249 115 22 / 0.15);
		border: 2px dashed #c2410c;
		border-radius: 50%;
	}

	.map {
		height: min(62vh, 540px);
		min-height: 340px;
		border: 1px solid var(--head-border);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-sm);
		overflow: hidden;
		background: var(--surface-sunk);
		z-index: 0;
	}

	.map :global(.leaflet-tile-pane) {
		filter: var(--map-filter);
	}

	.map :global(.leaflet-container) {
		font-family: var(--font-body);
	}

	.map :global(.leaflet-control-attribution) {
		font-size: 12px;
		color: #222;
		background: rgb(255 255 255 / 0.9);
	}

	.map :global(.leaflet-control-attribution a) {
		color: #0a4cad;
	}

	/* Varje nål är en 44×44 px träffyta; själva nålen ritas överst i den. */
	.map :global(.pin) {
		display: grid;
		justify-items: center;
		align-content: start;
		background: none;
		border: 0;
		border-radius: 8px;
	}

	.map :global(.pin-box) {
		position: relative;
		display: grid;
		place-items: center;
		width: 34px;
		height: 32px;
		color: #fff;
		border: 2px solid #fff;
		border-radius: 6px;
		box-shadow: 0 2px 4px rgb(0 0 0 / 0.35);
		transition: transform var(--speed-fast) var(--ease);
	}

	.map :global(.pin-box::after) {
		content: '';
		position: absolute;
		left: 50%;
		bottom: -8px;
		width: 0;
		height: 0;
		border: 6px solid transparent;
		border-top-color: #fff;
		transform: translateX(-50%);
	}

	.map :global(.pin-akt .pin-box) {
		background: #1b56c4;
	}

	.map :global(.pin-plats .pin-box) {
		background: #1d7a3a;
	}

	.map :global(.pin-cluster) {
		align-content: center;
	}

	.map :global(.cluster-box) {
		display: grid;
		place-items: center;
		width: 40px;
		height: 40px;
		font-family: var(--font-pixel);
		font-size: 15px;
		color: #fff;
		background: #10305f;
		border: 3px solid #fff;
		border-radius: 50%;
		box-shadow:
			0 0 0 3px rgb(27 86 196 / 0.45),
			0 2px 6px rgb(0 0 0 / 0.4);
		transition: transform var(--speed-fast) var(--ease);
	}

	.map :global(.pin:hover .pin-box),
	.map :global(.pin:focus-visible .pin-box),
	.map :global(.pin:hover .cluster-box),
	.map :global(.pin:focus-visible .cluster-box) {
		transform: translateY(-2px) scale(1.06);
	}

	.map :global(.leaflet-marker-icon:focus-visible) {
		outline: 3px solid var(--focus);
		outline-offset: 2px;
	}

	.map-note {
		margin: 6px 0 0;
	}

	.panel:focus {
		outline: none;
	}

	.panel:focus-visible {
		outline: 3px solid var(--focus);
		outline-offset: 2px;
		border-radius: var(--radius-lg);
	}

	.panel h3 {
		margin-bottom: 4px;
	}

	.lists {
		display: grid;
		gap: var(--space-4);
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
	}

	.list-h {
		font-size: var(--text-md);
	}

	.list {
		display: grid;
		gap: 6px;
		font-size: var(--text-sm);
	}

	.list .linkbtn {
		text-align: left;
	}
</style>
