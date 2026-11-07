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
| `src/lib/images.ts` | Egna bilder: skalas till max 1080 px, kodas om (tar bort EXIF/GPS), sparas i IndexedDB |
| `src/lib/lapp.ts` | Kommentarer, kalenderfil (.ics) och delning för lappar |
| `src/lib/groups.ts` | Medlemmar och trådar för grupperna |
| `src/lib/friends.ts` | Vänkoder och länkar till QR-koden |

## Delbara adresser

- `/lapp/<id>` – en lapp med karta, deltagare, väder och kommentarer (efteråt: gästboken med bilder)
- `/grupp/<id>` – en grupp med medlemmar, träffar, gruppforum och ansökningar
- `/forum/trad/<id>` – en forumtråd
- `/vanner?kod=ABCD-123` – Hitta vänner med koden ifylld (det är dit QR-koden pekar)

Det man skapar själv (grupper, trådar) finns bara i den egna webbläsaren. Netlify skickar
okända adresser under `/lapp`, `/grupp` och `/forum/trad` till `200.html` så att sidan byggs i webbläsaren.

## Teknik

SvelteKit + TypeScript + adapter-static, handskriven CSS, Leaflet 1.9.4 med
OpenStreetMap-tiles, självhostade typsnitt via @fontsource (Atkinson Hyperlegible, Silkscreen).
Inga tredjepartsskript och ingen spårning. QR-koder ritas lokalt (qrcode-generator, MIT).

Egna bilder lämnar aldrig webbläsaren: de ritas om på en canvas (vilket tar bort EXIF och
GPS-position), sparas i IndexedDB (i minnet om IndexedDB saknas) och töms med "Återställ demon".

Allt påhittat innehåll räknas relativt till riktig tid i Västerås, så sajten ser alltid aktuell ut.
Vädret hämtas direkt från SMHI i webbläsaren (källa anges); går det inte visas exempelväder.

Tips: `https://vasteras-demo.netlify.app/?hej=Kalle` visar ett välkomstfönster och ger Grundaren namnet Kalle.
