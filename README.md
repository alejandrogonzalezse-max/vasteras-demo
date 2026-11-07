# Västeråsarna – klickbar demo

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
| `src/lib/config.ts` | `SITE_NAME` (Västeråsarna), slogan, kartans tile-URL och gränser |
| `src/lib/mock.ts` | All påhittad data: användare, 68 tärningsidéer, lappar, platser, grupper, forum, modkö |
| `src/lib/dice.ts` | Tärningens viktning (årstid, väder, temperatur, högtid) |
| `src/lib/state.svelte.ts` | Demons tillstånd och localStorage |
| `src/lib/time.ts` | Svensk tid (Europe/Stockholm), högtider, solnedgång, "i kväll 21:30"/"i tisdags" |
| `src/lib/schedule.ts` | Lägger de påhittade aktiviteterna på rimliga tider relativt till nu |
| `src/lib/weather.svelte.ts` | Riktigt väder från SMHI (snow1g v1) med 30 min cache och reservväder |
| `src/lib/chiptune.ts` | Egen chiptune-slinga med WebAudio (startar bara på klick) |
| `src/lib/wordmark.ts` | Pixelordbilden "Västeråsarna" |
| `src/lib/styles/tokens.css` | Designtokens: färger (Kvällsblå/Mälarnatt), typskala, avstånd, radier, skuggor |
| `src/lib/styles/base.css` | Globala stilar och små klasser |
| `src/lib/icons.ts` | Egenritade pixelikoner (12×12) |

## Teknik

SvelteKit + TypeScript + adapter-static, handskriven CSS, Leaflet 1.9.4 med
OpenStreetMap-tiles, självhostade typsnitt via @fontsource (Atkinson Hyperlegible, Silkscreen).
Inga tredjepartsskript och ingen spårning.

Allt påhittat innehåll räknas relativt till riktig tid i Västerås, så sajten ser alltid aktuell ut.
Vädret hämtas direkt från SMHI i webbläsaren (källa anges); går det inte visas exempelväder.

Tips: `https://vasteras-demo.netlify.app/?hej=Kalle` visar ett välkomstfönster och ger Grundaren namnet Kalle.
