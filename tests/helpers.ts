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
	'/profil/grundaren',
	'/om',
	'/affisch',
	'/ordningsregler',
	'/integritet',
	'/kontakt',
	'/anmal'
];

/** Går in i demon via startsidans knapp. */
export async function enter(page: Page) {
	await page.goto('/');
	await page.getByRole('link', { name: 'Titta runt själv' }).click();
	await expect(page).toHaveURL(/\/hem$/);
	await expect(page.getByRole('navigation', { name: 'Huvudmeny' })).toBeVisible();
}

export function collectErrors(page: Page) {
	const errors: string[] = [];
	page.on('pageerror', (e) => errors.push(e.message));
	page.on('console', (m) => {
		if (m.type() === 'error' && !m.text().includes('tile.openstreetmap.org') && !m.text().includes('Failed to load resource')) errors.push(m.text());
	});
	return errors;
}

/** På mobil ligger konto och tema i menyn – öppna den om den finns. */
export async function openMenuIfMobile(page: Page) {
	const btn = page.getByTestId('menu-btn');
	if (await btn.isVisible()) {
		if ((await btn.getAttribute('aria-expanded')) !== 'true') await btn.click();
		return true;
	}
	return false;
}

export async function clickThemeToggle(page: Page) {
	if (await openMenuIfMobile(page)) await page.getByTestId('theme-toggle-menu').click();
	else await page.getByTestId('theme-toggle').click();
}
