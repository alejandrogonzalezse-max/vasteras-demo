import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { collectErrors, enter } from './helpers';

test('guidad rundtur från startsidan går igenom alla steg', async ({ page }) => {
	const errors = collectErrors(page);
	await page.goto('/');
	await page.getByTestId('tour-landing').click();
	const tour = page.getByTestId('tour');
	await expect(tour).toContainText('steg 1 av 6');
	await expect(tour.getByRole('heading')).toHaveText('Tärningen');
	await expect(page.locator('#tarningen')).toHaveAttribute('data-tour-on', '');

	const expected = ['/hem', '/anslagstavlan', '/kartan', '/profil/gubben940', '/moderering'];
	for (const path of expected) {
		await tour.getByRole('button', { name: 'Nästa' }).click();
		await expect(page).toHaveURL(new RegExp(path.replace(/\//g, '\\/') + '$'));
	}
	await expect(tour).toContainText('steg 6 av 6');
	await expect(page.locator('#kon')).toHaveAttribute('data-tour-on', '');
	await tour.getByRole('button', { name: 'Klart!' }).click();
	await expect(tour).toHaveCount(0);
	await expect(page.getByText('Rundturen är klar')).toBeVisible();
	await expect(page.locator('[data-tour-on]')).toHaveCount(0);
	expect(errors).toEqual([]);
});

test('rundturen kan startas från menyraden och stängas med Esc', async ({ page }) => {
	await enter(page);
	await page.getByTestId('tour-start').click();
	await expect(page.getByTestId('tour')).toBeVisible();
	await page.keyboard.press('Escape');
	await expect(page.getByTestId('tour')).toHaveCount(0);
});

test('Nytt-raden: vänförfrågan och gästbok', async ({ page }) => {
	await enter(page);
	const news = page.getByLabel('Nytt sedan sist');
	await expect(news).toContainText('1 vänförfrågan');
	await expect(news).toContainText('2 nya i gästboken');

	await page.getByRole('button', { name: 'Godkänn' }).click();
	await expect(news).not.toContainText('vänförfrågan');

	await news.getByRole('link', { name: /gästboken/ }).click();
	await expect(page).toHaveURL(/\/profil\/gubben940#gastbok$/);
	await expect(page.locator('#gastbok').getByText('Ny!')).toHaveCount(2);
	await expect(news).toContainText('Inget nytt');
});

test('ny lapp på känd plats: rätt nål, och kompisar reagerar efter en stund', async ({ page }) => {
	await enter(page);
	await page.goto('/anslagstavlan');
	await page.getByLabel('Rubrik').fill('Kvällsdopp och korv');
	await page.getByLabel('Plats', { exact: true }).fill('Framnäs');
	await page.getByRole('button', { name: 'Sätt upp lappen' }).click();
	const first = page.locator('ul.notes > li').first();
	await expect(first.getByRole('heading')).toHaveText('Kvällsdopp och korv');

	const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('vasteras-demo-v1')!).myNotes[0]);
	expect(stored.placeId).toBe('framnas');

	await page.getByRole('navigation', { name: 'Huvudmeny' }).getByRole('link', { name: 'Hem' }).click();
	await expect(page).toHaveURL(/\/hem$/);
	await expect(page.getByText('trycker "Jag kommer" på din lapp').first()).toBeVisible({ timeout: 8000 });
	await expect(page.getByLabel('Nytt sedan sist')).toContainText('kommer på din lapp');
});

test('lapp: kommentera, lägg i kalendern och dela', async ({ page, context, browserName }) => {
	test.skip(browserName !== 'chromium');
	await context.grantPermissions(['clipboard-read', 'clipboard-write']);
	await enter(page);
	await page.goto('/anslagstavlan');
	const card = page.locator('#lapp-a-bradspel');

	await card.getByRole('button', { name: /Kommentarer \(6\)/ }).click();
	await expect(card.locator('.comments li')).not.toHaveCount(0);
	await card.getByLabel('Skriv en kommentar').fill('Jag tar med Alfapet!');
	await card.getByRole('button', { name: 'Skicka' }).click();
	await expect(card.getByText('Jag tar med Alfapet!')).toBeVisible();
	await expect(card.getByRole('button', { name: /Kommentarer \(7\)/ })).toBeVisible();

	const download = page.waitForEvent('download');
	await card.getByRole('button', { name: 'Lägg i kalendern' }).click();
	const file = await (await download).path();
	const ics = readFileSync(file, 'utf8');
	expect(ics).toContain('BEGIN:VEVENT');
	expect(ics).toContain('SUMMARY:Brädspel och te på biblioteket');

	await card.getByRole('button', { name: 'Dela' }).click();
	await expect(page.getByText('Länken till lappen är kopierad')).toBeVisible();
	expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('/lapp/a-bradspel');
});

test('skriv i dagboken med bild, och få en schysst', async ({ page }) => {
	await enter(page);
	await page.getByLabel('Skriv i dagboken').fill('Badade vid Framnäs i kväll, iskallt!');
	await page.getByRole('button', { name: 'Lägg till bild' }).click();
	await page.getByLabel('Bryggan i månsken').check({ force: true });
	await page.getByRole('button', { name: 'Publicera' }).click();
	const first = page.locator('.diary > li').first();
	await expect(first).toContainText('Badade vid Framnäs i kväll');
	await expect(first.getByRole('img', { name: /brygga/i })).toBeVisible();
	await expect(page.getByText('tycker att ditt dagboksinlägg är schysst')).toBeVisible({ timeout: 8000 });
	await expect(first).toContainText('1 tycker det är schysst');
});

test('senaste besökarna och smygläge', async ({ page }) => {
	await enter(page);
	await page.goto('/profil/sannas');
	const box = page.locator('section', { has: page.getByRole('heading', { name: 'Senaste besökarna' }) });
	await expect(box.getByText('Du', { exact: true })).toBeVisible();

	await page.goto('/profil/gubben940');
	await page.getByLabel(/Smygläge/).check();
	await page.goto('/profil/sannas');
	await expect(box.getByText('Du', { exact: true })).toHaveCount(0);
});

test('grupper visar medlemmar och nästa träff', async ({ page }) => {
	await enter(page);
	await page.goto('/grupper');
	const g = page.locator('li', { has: page.getByRole('heading', { name: 'Söndagspromenaderna' }) });
	await expect(g).toContainText('Nästa träff');
	await expect(g.getByRole('link', { name: 'Söndagspromenad runt Anundshög' })).toBeVisible();
});

test('länkförhandsvisning och hemskärmsikon finns', async ({ page, request }) => {
	await page.goto('/');
	await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /\/og\.png$/);
	await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /Lite mer som förr/);
	expect((await request.get('/og.png')).status()).toBe(200);
	expect((await request.get('/manifest.webmanifest')).status()).toBe(200);
	expect((await request.get('/apple-touch-icon.png')).status()).toBe(200);
});
