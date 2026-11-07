import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { PAGES, enter, openMenuIfMobile } from './helpers';


for (const scheme of ['light', 'dark'] as const) {
	test(`axe utan allvarliga fel – ${scheme === 'light' ? 'Kvällsblå' : 'Mälarnatt'}`, async ({ page }) => {
		test.setTimeout(300_000);
		await page.emulateMedia({ colorScheme: scheme });
		await page.goto('/');
		const check = async (path: string) => {
			await page.waitForTimeout(path === '/kartan' ? 800 : 150);
			const res = await new AxeBuilder({ page })
				.withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
				.exclude('.leaflet-tile-pane')
				.analyze();
			const bad = res.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
			const summary = bad.map((v) => `${path}: ${v.id} – ${v.nodes.map((n) => n.target.join(' ')).slice(0, 4).join(' | ')}`);
			expect(summary, summary.join('\n')).toEqual([]);
		};
		await check('/');
		await enter(page);
		for (const path of PAGES) {
			await page.goto(path);
			await check(path);
		}
		// Några interaktiva lägen
		await page.goto('/hem');
		await page.getByTestId('dice').click();
		await page.getByRole('button', { name: 'Jag har tråkigt nu' }).click();
		await check('/hem (efter tärning)');
		await page.goto('/moderering');
		await page.getByTestId('queue-item').first().getByRole('button', { name: 'Ta bort' }).click();
		await check('/moderering (beslut)');
		await page.goto('/hem');
		await page.getByRole('button', { name: 'Lägg till bild' }).click();
		await page.getByTestId('tour-start').click();
		await expect(page.getByTestId('tour')).toBeVisible();
		await check('/hem (bildväljare + rundtur)');
		await page.keyboard.press('Escape');
		await page.goto('/anslagstavlan');
		const card = page.locator('#lapp-a-bradspel');
		await card.getByRole('button', { name: /Kommentarer/ }).click();
		await card.getByRole('button', { name: 'Jag kommer' }).click();
		await expect(page.getByText('Du kommer på')).toBeVisible();
		await check('/anslagstavlan (kommentarer + notis)');
		await page.goto('/profil/sannas');
		await check('/profil/sannas (besökare)');
		await page.goto('/profil/gubben940');
		await page.getByTestId('pixla').click();
		await page.getByTestId('play').click();
		await check('/profil/gubben940 (pixla din figur + spelare)');
		await page.goto('/kartan');
		await page.getByTestId('time-filter').getByText('Nu', { exact: false }).first().click();
		await check('/kartan (filter Nu)');
		if (await openMenuIfMobile(page)) await check('/kartan (mobilmeny)');
		// Nya formulär och dialoger
		const PNG = Buffer.from(
			(await page.evaluate(() => {
				const c = document.createElement('canvas');
				c.width = c.height = 64;
				const g = c.getContext('2d')!;
				g.fillStyle = '#c33';
				g.fillRect(0, 0, 64, 64);
				return c.toDataURL('image/png');
			})).split(',')[1],
			'base64'
		);
		await page.goto('/grupper/ny');
		await page.getByLabel('Namn').fill('Axegruppen');
		await page.getByLabel('En mening om gruppen').fill('Test');
		await page.getByRole('button', { name: 'Nästa' }).click();
		await check('/grupper/ny (steg 2)');
		await page.getByRole('radio', { name: /Sluten/ }).check();
		await page.getByRole('button', { name: 'Nästa' }).click();
		await page.getByRole('radio', { name: 'Egen bild' }).check();
		await check('/grupper/ny (steg 3)');
		await page.getByRole('radio', { name: 'En av pixelbilderna' }).check();
		await page.getByRole('button', { name: 'Skapa gruppen' }).click();
		await expect(page.locator('#ansokningar').getByRole('button', { name: 'Godkänn' })).toBeVisible({ timeout: 8000 });
		await page.getByRole('button', { name: 'Bjud in vänner' }).click();
		await expect(page.getByTestId('invite')).toBeVisible();
		await check('/grupp/ny (ansökan + bjud in)');
		await page.keyboard.press('Escape');
		await page.goto('/hem');
		const composer = page.getByTestId('diary-composer');
		await composer.getByRole('button', { name: 'Lägg till bild' }).click();
		await composer.getByTestId('file-input').setInputFiles({ name: 'a.png', mimeType: 'image/png', buffer: PNG });
		await expect(composer.getByTestId('alt-input')).toBeVisible();
		await composer.getByRole('button', { name: 'Publicera' }).click();
		await check('/hem (bild med förhandsvisning + fel)');
		await page.goto('/profil/gubben940');
		await page.getByTestId('change-pic').click();
		await page.locator('#profilbild input[type=file], [data-testid=upload] input[type=file]').first().setInputFiles({ name: 'a.png', mimeType: 'image/png', buffer: PNG });
		await check('/profil/gubben940 (profilbild med beskärning)');
		await page.goto('/forum');
		await page.getByRole('button', { name: 'Föreslå en ny kategori' }).click();
		await check('/forum (föreslå kategori)');
		await page.goto('/lapp/a-grillkvall');
		await check('/lapp/a-grillkvall (gästboken efteråt)');
		await page.goto('/vanner?kod=XXXX-000');
		await page.getByLabel('Sök på namn').fill('a');
		await check('/vanner (sök + kod)');
		await page.goto('/?hej=Kalle');
		await expect(page.getByTestId('welcome')).toBeVisible();
		await check('/?hej=Kalle (välkomstfönster)');
	});
}
