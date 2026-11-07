// Allt som är namn-specifikt bor här, så att arbetsnamnet kan bytas på ett ställe.
export const SITE_NAME = '[ARBETSNAMN]';
export const SLOGAN = 'Västerås. Lite mer som förr.';
export const TAGLINE = 'Ingen reklam. Ingen algoritm. 18+.';
export const CITY = 'Västerås';
/** Publik adress, används för länkförhandsvisning (Open Graph). */
export const SITE_URL = 'https://vasteras-demo.netlify.app';
export const DESCRIPTION =
	'En ideell mötesplats där västeråsare lägger ut saker att göra tillsammans – nattbad, korvgrillning, öppet garage, brännboll. Ingen reklam, ingen algoritm, 18+.';
export const DEMO_NOTICE = 'Demo – allt innehåll är påhittat.';

/** Den påhittade inloggade användaren i demon. */
export const ME_ID = 'gubben940';

/** Kartan: OpenStreetMaps standardtiles. Byt här om ni senare kör egen tile-server. */
export const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
export const TILE_ATTRIBUTION =
	'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap-bidragsgivare</a>';

/** Ungefärlig ruta runt Västerås kommun. */
export const MAP_BOUNDS: [[number, number], [number, number]] = [
	[59.45, 16.15],
	[59.8, 16.95]
];
export const MAP_CENTER: [number, number] = [59.611, 16.548];

export const STORAGE_KEY = 'vasteras-demo-v1';
export const THEME_KEY = 'vasteras-demo-theme';
