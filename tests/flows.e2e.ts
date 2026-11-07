import { expect, test } from '@playwright/test';
import { PAGES, clickThemeToggle, collectErrors, enter, openMenuIfMobile } from './helpers';

test('startsidan för utloggade och inbjudningsformuläret', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByRole('heading', { level: 1 })).toContainText('Lite mer som förr');
	await expect(page.getByRole('navigation', { name: 'Huvudmeny' })).toHaveCount(0);
	await expect(page.getByRole('heading', { name: 'Tärningen' })).toBeVisible();
	await expect(page.getByRole('heading', { name: 'En vanlig vecka i Västerås' })).toBeVisible();
	const form = page.locator('#inbjudan');
	await form.getByRole('button', { name: 'Gå med' }).click();
	await expect(form.getByRole('alert')).toContainText('inbjudningskoden');
	await form.getByLabel('Inbjudningskod').fill('MÄLAR-1234');
	await form.getByLabel('E-post').fill('test@exempel.se');
	await form.getByRole('button', { name: 'Gå med' }).click();
	await expect(form.getByRole('alert')).toContainText('18');
	await form.getByLabel(/fyllt 18/).check();
	await form.getByRole('button', { name: 'Gå med' }).click();
	await expect(page).toHaveURL(/\/hem$/);
});

test('alla sidor går att klicka fram utan fel', async ({ page }) => {
	const errors = collectErrors(page);
	await enter(page);
	for (const path of PAGES) {
		await page.goto(path);
		await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
		const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
		expect(overflow, `horisontell scroll på ${path}`).toBeLessThanOrEqual(0);
	}
	// Menyn fungerar med klick
	for (const name of ['Anslagstavlan', 'Kartan', 'Grupper', 'Forum', 'Moderering', 'Hem']) {
		await page.getByRole('navigation', { name: 'Huvudmeny' }).getByRole('link', { name: new RegExp(name) }).click();
		await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
	}
	expect(errors).toEqual([]);
});

test('tärning → ta initiativet → publicera lapp → jag kommer', async ({ page }) => {
	await enter(page);
	await page.getByTestId('dice').click();
	const idea = page.getByTestId('idea');
	await expect(idea).not.toBeEmpty();
	const ideaText = (await idea.textContent())!.trim();
	await page.getByRole('button', { name: 'Ta initiativet' }).click();
	await expect(page).toHaveURL(/\/anslagstavlan/);
	await expect(page.getByText('Förifyllt från tärningen')).toBeVisible();
	await expect(page.getByLabel('Rubrik')).toHaveValue(ideaText);
	await page.getByLabel('Plats', { exact: true }).fill('Vasaparken, vid fontänen');
	await page.getByLabel('Återkommer').check();
	await page.getByRole('button', { name: 'Sätt upp lappen' }).click();
	await expect(page.getByRole('status').filter({ hasText: 'sitter uppe överst' })).toBeVisible();

	const first = page.locator('ul.notes > li').first();
	await expect(first.getByRole('heading')).toHaveText(ideaText);
	await expect(first.getByRole('button', { name: /Du kommer/ })).toBeVisible();

	// "Jag kommer" på någon annans lapp
	const other = page.locator('#lapp-a-bradspel');
	const count = other.locator('.count strong.num');
	const before = Number(await count.textContent());
	await other.getByRole('button', { name: 'Jag kommer' }).click();
	await expect(other.getByRole('button', { name: /Du kommer/ })).toBeVisible();
	await expect(count).toHaveText(String(before + 1));

	// Sparas över omladdning
	await page.reload();
	await expect(page.locator('ul.notes > li').first().getByRole('heading')).toHaveText(ideaText);
	await expect(page.locator('#lapp-a-bradspel').getByRole('button', { name: /Du kommer/ })).toBeVisible();
});

test('jag har tråkigt nu visar något inom 3 timmar med länk till kartan', async ({ page }) => {
	await enter(page);
	await page.getByRole('button', { name: 'Jag har tråkigt nu' }).click();
	await expect(page.getByText('Det här händer redan snart')).toBeVisible();
	await page.getByRole('link', { name: 'Visa nålen på kartan' }).click();
	await expect(page).toHaveURL(/\/kartan\?nal=/);
	await expect(page.getByTestId('panel').getByRole('button', { name: /kommer/i })).toBeVisible();
});

test('tipsa om tärningsidé hamnar i moderatorkön', async ({ page }) => {
	await enter(page);
	await page.getByRole('button', { name: 'Tipsa om en tärningsidé' }).click();
	await page.getByLabel('Din idé till tärningen').fill('Minigolf i regnet');
	await page.getByRole('button', { name: 'Skicka' }).click();
	await expect(page.getByText('Tipset ligger nu i')).toBeVisible();
	await page.goto('/moderering');
	await expect(page.getByText('Tärningsidé: "Minigolf i regnet"')).toBeVisible();
});

test('demo-säsong ändrar tärningens viktning', async ({ page }) => {
	await enter(page);
	await page.getByText('Så funkar tärningen').click();
	const chances = page.locator('.chances');
	const nov = await chances.textContent();
	await page.getByLabel(/annan årstid/).selectOption('dec');
	await expect(page.getByText('lätt snöfall').first()).toBeVisible();
	await expect(chances).not.toHaveText(nov!);
	await expect(chances).toContainText(/lussefika|Pulka|snögubb|Pepparkaks/i);
});

test('kartlager går att slå av och på, och öppen dörr är bara en ring', async ({ page }) => {
	await enter(page);
	await page.goto('/kartan');
	const rings = page.locator('path.leaflet-interactive');
	// Summan av alla nålar och kluster (data-count) = antal saker på kartan.
	const total = () =>
		page.locator('.leaflet-marker-icon').evaluateAll((els) => els.reduce((s, e) => s + Number(e.getAttribute('data-count') ?? 0), 0));
	await expect.poll(total).toBe(16);
	await expect(rings).toHaveCount(4);

	await page.getByTestId('layer-akt').uncheck();
	await expect.poll(total).toBe(8);
	await page.getByTestId('layer-plats').uncheck();
	await expect.poll(total).toBe(0);
	await page.getByTestId('layer-door').uncheck();
	await expect(rings).toHaveCount(0);
	await page.getByTestId('layer-door').check();
	await expect(rings).toHaveCount(4);
	await page.getByTestId('layer-plats').check();
	await page.getByTestId('layer-akt').check();
	await expect.poll(total).toBe(16);

	await page.locator('#lista').getByRole('button', { name: 'Björnö' }).click();
	await expect(page.getByTestId('panel').getByRole('heading', { name: 'Björnö' })).toBeVisible();

	await page.locator('#lista').getByRole('button', { name: 'Vinylkväll i vardagsrummet' }).click();
	await expect(page.getByTestId('panel')).toContainText('Varför bara en ring?');
	await expect(page.locator('.leaflet-control-attribution')).toContainText('OpenStreetMap-bidragsgivare');
});

test('kartan: täta nålar blir kluster och varje nål har 44 px träffyta', async ({ page }) => {
	await enter(page);
	await page.goto('/kartan');
	const markers = page.locator('.leaflet-marker-icon');
	await expect(markers.first()).toBeVisible();
	for (const box of await markers.evaluateAll((els) => els.map((e) => e.getBoundingClientRect()))) {
		expect(box.width).toBeGreaterThanOrEqual(44);
		expect(box.height).toBeGreaterThanOrEqual(44);
	}
	// Inga två träffytor överlappar.
	const rects = await markers.evaluateAll((els) => els.map((e) => e.getBoundingClientRect().toJSON()));
	for (let i = 0; i < rects.length; i++)
		for (let j = i + 1; j < rects.length; j++) {
			const a = rects[i], b = rects[j];
			const overlap = a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
			expect(overlap, `nål ${i} och ${j} överlappar`).toBe(false);
		}
	const cluster = page.locator('.pin-cluster').first();
	await expect(cluster).toHaveAttribute('title', /saker här/);
	const map = page.getByTestId('map');
	const zoomBefore = Number(await map.getAttribute('data-zoom'));
	await cluster.click();
	await expect
		.poll(async () => Number(await map.getAttribute('data-zoom')) > zoomBefore || (await page.getByTestId('panel').getByText('Flera saker här').count()) > 0)
		.toBe(true);
});

test('byt tema och temat sparas', async ({ page }) => {
	await page.emulateMedia({ colorScheme: 'light' });
	await enter(page);
	const html = page.locator('html');
	await expect(html).toHaveAttribute('data-theme', 'light');
	await clickThemeToggle(page);
	await expect(html).toHaveAttribute('data-theme', 'dark');
	await page.reload();
	await expect(html).toHaveAttribute('data-theme', 'dark');
	await clickThemeToggle(page);
	await expect(html).toHaveAttribute('data-theme', 'light');
});

test('profilteman och gästbok', async ({ page }) => {
	await enter(page);
	await page.goto('/profil/gubben940');
	await page.getByLabel('Granskog').check();
	await expect(page.getByTestId('profile')).toHaveClass(/theme-granskog/);
	await page.getByRole('link', { name: 'SannaS' }).first().click();
	await expect(page).toHaveURL(/\/profil\/sannas$/);
	await page.getByLabel(/Skriv något till SannaS/).fill('Ses vid bastun!');
	await page.getByRole('button', { name: 'Skriv i gästboken' }).click();
	await expect(page.getByText('Ses vid bastun!')).toBeVisible();
});

test('dagboken: sidnumrering och "Du är ikapp"', async ({ page }) => {
	await enter(page);
	await expect(page.getByText('Du är ikapp!')).toHaveCount(0);
	await page.getByRole('button', { name: 'Sida 2' }).click();
	await expect(page.getByText('Du är ikapp!')).toBeVisible();
});

test('grupper och moderering', async ({ page }) => {
	await enter(page);
	await page.goto('/grupper');
	const closed = page.locator('li', { has: page.getByRole('heading', { name: '18–25 i Västerås' }) });
	await expect(closed).toContainText('ålder ej verifierad', { ignoreCase: true });
	await closed.getByRole('button', { name: 'Ansök' }).click();
	await expect(closed).toContainText('inväntar gruppens moderatorer');

	await page.goto('/moderering');
	const item = page.getByTestId('queue-item').first();
	await item.getByRole('button', { name: 'Ta bort' }).click();
	await expect(item).toContainText('Regel 3');
	await expect(item).toContainText('14 dagar');
	await expect(page.locator('#logg')).toContainText('Mod Gubben940');
});

test('visa som utloggad och återställ demon', async ({ page }) => {
	await enter(page);
	await page.getByLabel('Ny MSN-status').fill('Testar demon');
	await page.getByRole('button', { name: 'Spara' }).click();
	await expect(page.locator('.current')).toContainText('Testar demon');

	await openMenuIfMobile(page);
	await page.getByRole('button', { name: 'Visa som utloggad' }).click();
	await expect(page).toHaveURL(/\/$/);
	await expect(page.getByRole('navigation', { name: 'Huvudmeny' })).toHaveCount(0);
	await page.goto('/hem');
	await expect(page.getByRole('heading', { name: 'Bara för inloggade' })).toBeVisible();
	await page.getByRole('button', { name: /Gå in i demon/ }).click();
	await expect(page.locator('.current')).toContainText('Testar demon');

	await page.getByTestId('reset').click();
	await expect(page).toHaveURL(/\/$/);
	await expect(page.getByText('Demon är återställd')).toBeVisible();
	const stored = await page.evaluate(() => localStorage.getItem('vasteras-demo-v1'));
	expect(stored === null || JSON.parse(stored).loggedIn === false).toBe(true);
	await enter(page);
	await expect(page.locator('.current')).not.toContainText('Testar demon');
});

test('fungerar även när localStorage är blockerat', async ({ page }) => {
	await page.addInitScript(() => {
		Object.defineProperty(window, 'localStorage', {
			get() {
				throw new Error('blocked');
			}
		});
	});
	const errors = collectErrors(page);
	await enter(page);
	await expect(page.getByText('tillåter inte lagring')).toBeVisible();
	await page.getByTestId('dice').click();
	await expect(page.getByTestId('idea')).not.toBeEmpty();
	expect(errors).toEqual([]);
});
