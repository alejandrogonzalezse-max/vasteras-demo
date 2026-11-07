// Grundarens visningsnamn. Byts till namnet i ?hej=<namn> (se Welcome.svelte),
// och är reaktivt så att det uppdateras överallt där Grundaren syns.
export const founder = $state({ name: 'Grundaren' });

/** Tillåter bara bokstäver, mellanslag och bindestreck, max 30 tecken. */
export function sanitizeName(raw: string | null | undefined): string {
	if (!raw) return '';
	return raw
		.normalize('NFC')
		.replace(/[^\p{L} -]/gu, '')
		.replace(/\s+/g, ' ')
		.replace(/-{2,}/g, '-')
		.trim()
		.slice(0, 30)
		.trim();
}
