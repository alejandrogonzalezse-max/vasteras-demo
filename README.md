# [ARBETSNAMN] – klickbar demo

Demo av en ideell mötesplats för Västerås: *"Västerås. Lite mer som förr."*
Ingen reklam, ingen algoritm, ingen politik, 18+.

**Allt innehåll är påhittat.** Ingen backend, ingen databas, ingen riktig inloggning.
Interaktioner sparas i webbläsarens localStorage (med fallback till minnet) och
nollställs med "Återställ demon" i sidfoten.

## Kom igång

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # statisk sajt i build/
npm test           # Playwright: flöden + axe i ljust och mörkt tema, 1280 och 390 px
```

## Var saker finns

| Fil | Vad |
| --- | --- |
| `src/lib/config.ts` | `SITE_NAME`, slogan, kartans tile-URL och gränser – byt namn här |
| `src/lib/mock.ts` | All påhittad data: användare, 68 tärningsidéer, lappar, platser, grupper, forum, modkö |
| `src/lib/dice.ts` | Tärningens viktning (årstid, väder, temperatur, högtid) |
| `src/lib/state.svelte.ts` | Demons tillstånd, localStorage, demoklockan |
| `src/lib/styles/tokens.css` | Designtokens: färger (Kvällsblå/Mälarnatt), typskala, avstånd, radier, skuggor |
| `src/lib/styles/base.css` | Globala stilar och små klasser |
| `src/lib/icons.ts` | Egenritade pixelikoner (12×12) |

## Teknik

SvelteKit + TypeScript + adapter-static, handskriven CSS, Leaflet 1.9.4 med
OpenStreetMap-tiles, självhostade typsnitt via @fontsource (Atkinson Hyperlegible, Silkscreen).
Inga tredjepartsskript och ingen spårning.

Demons klocka står alltid på lördag 16:40 den aktuella veckan, så att lapparna hamnar på rimliga tider.
