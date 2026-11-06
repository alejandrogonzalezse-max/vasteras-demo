import { expect, type Page } from '@playwright/test';

export const PAGES = [
	'/hem',
	'/anslagstavlan',
	'/kartan',
	'/utforska',
	'/grupper',
	'/forum',
	'/forum/natur',
	'/forum/trad/vinterbad',
	'/profil/gubben940',
	'/profil/sannas',
	'/moderering',
	'/ordningsregler',
	'/integritet',
	'/kontakt',
	'/anmal'
];

/** Går in i demon via startsidans knapp. */
export async function enter(page: Page) {
	await page.goto('/');
	await page.getByRole('button', { name: 'Titta runt i demon' }).click();
	await expect(page).toHaveURL(/\/hem$/);
	await expect(page.getByText('Inloggad som')).toBeVisible();
}

export function collectErrors(page: Page) {
	const errors: string[] = [];
	page.on('pageerror', (e) => errors.push(e.message));
	page.on('console', (m) => {
		if (m.type() === 'error' && !m.text().includes('tile.openstreetmap.org') && !m.text().includes('Failed to load resource')) errors.push(m.text());
	});
	return errors;
}
