import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { PAGES, enter, openMenuIfMobile } from './helpers';

for (const scheme of ['light', 'dark'] as const) {
	test(`axe utan allvarliga fel – ${scheme === 'light' ? 'Kvällsblå' : 'Mälarnatt'}`, async ({ page }) => {
		test.setTimeout(180_000);
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
		await page.goto('/?hej=Kalle');
		await expect(page.getByTestId('welcome')).toBeVisible();
		await check('/?hej=Kalle (välkomstfönster)');
	});
}
