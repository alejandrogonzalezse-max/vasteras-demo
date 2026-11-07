import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { collectErrors, enter } from './helpers';

const SMHI = '**/opendata-download-metfcst.smhi.se/**';
// Mönstret för platshållare (versaler inom hakparentes). Det gamla arbetsnamnet byggs ihop
// av två delar så att testfilen själv inte innehåller det.
const NAME = ['ARBETS', 'NAMN'].join('');
const PLACEHOLDER = /\[[A-ZÅÄÖ ]+\]/;

function files(dir: string, out: string[] = []) {
	for (const f of readdirSync(dir)) {
		const p = join(dir, f);
		if (statSync(p).isDirectory()) files(p, out);
		else out.push(p);
	}
	return out;
}

test.describe('platshållare', () => {
	test('inga platshållare i byggd output, källkod eller README', async () => {
		test.skip(test.info().project.name !== 'desktop', 'räcker att köra en gång');
		const hits: string[] = [];
		for (const f of files('build')) {
			if (/\.(png|ico|woff2?|map)$/.test(f)) continue;
			let text = readFileSync(f, 'utf8');
			if (text.includes(`[${NAME}]`)) hits.push(`${f}: [${NAME}]`);
			if (/\.html$/.test(f)) text = text.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, '');
			if (/\.(html|json|webmanifest|txt|svg)$/.test(f)) {
				const m = text.match(PLACEHOLDER);
				if (m) hits.push(`${f}: ${m[0]}`);
			} else if (/\.m?js$/.test(f)) {
				// I minifierad kod: bara i strängar, så att t.ex. a[B] inte räknas.
				const m = text.match(/["'`][^"'`\n]*\[[A-ZÅÄÖ][A-ZÅÄÖ ]+\][^"'`\n]*["'`]/);
				if (m) hits.push(`${f}: ${m[0].slice(0, 80)}`);
			}
		}
		for (const f of [...files('src'), ...files('static'), 'README.md', ...files('tests')]) {
			if (/\.(png|ico|woff2?)$/.test(f)) continue;
			if (readFileSync(f, 'utf8').includes(`[${NAME}]`)) hits.push(`${f}: [${NAME}]`);
		}
		expect(hits, hits.join('\n')).toEqual([]);
	});

	test('ingen synlig text med platshållare på sidorna', async ({ page }) => {
		await enter(page);
		for (const path of ['/', '/hem', '/om', '/affisch', '/profil/grundaren', '/anslagstavlan']) {
			await page.goto(path);
			const text = await page.locator('body').innerText();
			expect(text.match(PLACEHOLDER)?.[0] ?? null, path).toBeNull();
			expect(await page.title()).toContain('Västeråsarna');
		}
		const manifest = await (await page.request.get('/manifest.webmanifest')).json();
		expect(manifest.name).toContain('Västeråsarna');
	});
});

async function blockSmhi(page: Page) {
	await page.route(SMHI, (r) => r.abort());
}

test.describe('riktig tid', () => {
	test('midsommarafton: högtid, solnedgång, tärning och relativa tider', async ({ page }) => {
		await blockSmhi(page);
		await page.clock.setFixedTime(new Date('2026-06-19T10:00:00Z')); // 12:00 i Stockholm
		await enter(page);
		await expect(page.getByRole('heading', { level: 1 })).toHaveText('Hej, Gubben940!');
		const today = page.locator('section', { has: page.getByRole('heading', { name: 'Västerås idag' }) });
		await expect(today).toContainText('Fredag 19 juni · midsommarafton');
		await expect(today).toContainText(/Solen går ner 22:\d\d/);
		await expect(page.locator('#spontant')).toContainText('om 50 min · 12:45');
		await page.getByText('Så funkar tärningen').click();
		await expect(page.locator('.chances')).toContainText(/midsommarstång/i);
	});

	test('en vardag i februari: ingen högtid, vintertärning och morgonförslag', async ({ page }) => {
		await blockSmhi(page);
		await page.clock.setFixedTime(new Date('2027-02-10T07:30:00Z')); // onsdag 08:30
		await enter(page);
		await expect(page.getByRole('heading', { level: 1 })).toHaveText('God morgon, Gubben940!');
		const today = page.locator('section', { has: page.getByRole('heading', { name: 'Västerås idag' }) });
		await expect(today).toContainText('Onsdag 10 februari');
		await expect(today).not.toContainText(/midsommar|jul|påsk/);
		await expect(page.locator('#spontant')).toContainText('Morgondopp och bastu vid Framnäs');
		await page.getByText('Så funkar tärningen').click();
		const chances = page.locator('.chances');
		await expect(chances).not.toContainText(/midsommarstång/i);
		await expect(chances).toContainText(/skridsko|choklad|soppa|Stjärnskådning|Torsdagsärtor|kallbad|snö/i);
		// Brädspelet ligger "i kväll 19:00" och söndagspromenaden "på söndag 13:00"
		await page.goto('/anslagstavlan');
		await expect(page.locator('#lapp-a-bradspel')).toContainText('i kväll 19:00');
		await expect(page.locator('#lapp-a-anundshog')).toContainText('på söndag 13:00');
	});
});

test.describe('SMHI', () => {
	test('faller tillbaka till exempelväder när SMHI inte svarar', async ({ page }) => {
		const errors = collectErrors(page);
		await blockSmhi(page);
		await enter(page);
		await expect(page.getByTestId('wx-source')).toHaveText('exempel');
		await expect(page.getByText('Vädret är ett exempel')).toBeVisible();
		await page.getByTestId('dice').click();
		await expect(page.getByTestId('idea')).not.toBeEmpty();
		expect(errors).toEqual([]);
	});

	test('visar riktigt väder med "Källa: SMHI" när API:et svarar', async ({ page }) => {
		const now = Date.now();
		const series = [-1, 0, 1, 2].map((h) => ({
			time: new Date(Math.floor(now / 3600000) * 3600000 + h * 3600000).toISOString(),
			data: { air_temperature: -3.2, symbol_code: 26 }
		}));
		await page.route(SMHI, (r) => r.fulfill({ json: { timeSeries: series }, headers: { 'access-control-allow-origin': '*' } }));
		await enter(page);
		await expect(page.getByTestId('wx-source')).toHaveText('Källa: SMHI');
		await expect(page.getByTestId('today-weather')).toContainText('-3°');
		await expect(page.getByTestId('today-weather')).toContainText('snöfall');
	});
});

test.describe('välkomstfönstret', () => {
	test('visas bara med ?hej= och bara en gång', async ({ page }) => {
		await page.goto('/');
		await expect(page.getByTestId('welcome')).not.toBeVisible();

		await page.goto('/?hej=Kalle');
		const dlg = page.getByTestId('welcome');
		await expect(dlg).toBeVisible();
		await expect(dlg.getByRole('heading')).toHaveText('Hej Kalle!');
		await expect(dlg).toContainText('Det här är Västeråsarna – din idé, byggd på riktigt.');
		await expect(dlg.getByRole('button', { name: 'Visa mig runt' })).toBeFocused();
		await dlg.getByRole('button', { name: 'Jag klickar själv' }).click();
		await expect(page).toHaveURL(/\/hem$/);

		await page.goto('/?hej=Kalle');
		await page.waitForTimeout(400);
		await expect(page.getByTestId('welcome')).not.toBeVisible();

		await page.goto('/profil/grundaren');
		await expect(page.getByRole('heading', { level: 1 })).toContainText('Kalle');
		await expect(page.getByTestId('badge')).toHaveText('Grundare');
	});

	test('"Visa mig runt" i fönstret startar rundturen', async ({ page }) => {
		await page.goto('/?hej=Anna-Lena');
		await page.getByTestId('welcome').getByRole('button', { name: 'Visa mig runt' }).click();
		await expect(page.getByTestId('tour')).toContainText('steg 1 av 6');
	});

	test('?hej=<script> visas som ren text och körs aldrig', async ({ page }) => {
		const dialogs: string[] = [];
		page.on('dialog', (d) => {
			dialogs.push(d.message());
			d.dismiss();
		});
		await page.goto('/?hej=' + encodeURIComponent('<script>alert(1)</script><img src=x onerror=alert(2)>'));
		const heading = page.getByTestId('welcome').getByRole('heading');
		await expect(heading).toBeVisible();
		const text = await heading.textContent();
		expect(text).toMatch(/^Hej [\p{L} -]+!$/u);
		expect(text).not.toContain('<');
		expect(await heading.evaluate((h) => h.children.length)).toBe(0);
		expect(await page.locator('img[src="x"]').count()).toBe(0);
		await page.waitForTimeout(500);
		expect(dialogs).toEqual([]);
	});
});

test('Pixla din figur: utseendet sparas och syns överallt', async ({ page }) => {
	await enter(page);
	await page.goto('/profil/gubben940');
	await page.getByTestId('pixla').click();
	const ed = page.getByTestId('avatar-editor');
	await ed.locator('label.chip', { hasText: 'Mössa' }).click();
	await ed.locator('label.chip', { hasText: 'Glasögon' }).click();
	await ed.getByRole('group', { name: 'Tröjfärg' }).getByLabel('Röd').check({ force: true });
	await ed.getByRole('button', { name: 'Spara figuren' }).click();
	await expect(page.getByText('Din nya figur syns nu överallt')).toBeVisible();
	const look = await page.evaluate(() => JSON.parse(localStorage.getItem('vasteras-demo-v1')!).myLook);
	expect(look).toMatchObject({ headwear: 'mossa', glasses: true, shirt: '#c8463a' });
	await page.goto('/hem');
	const myPost = page.locator('.diary > li', { hasText: 'Tack alla som kom på grillningen' });
	await expect(myPost.locator('.av rect[fill="#c8463a"]').first()).toBeAttached();
});

test.describe('MSN-knuff', () => {
	test('skakar rutan och kompisen knuffar tillbaka', async ({ page }) => {
		await enter(page);
		await page.goto('/profil/sannas');
		await page.getByTestId('knuffa').click();
		await expect(page.locator('#profilruta')).toHaveClass(/nudged/);
		await expect(page.locator('#profilruta')).not.toHaveClass(/nudged-mark/);
		await expect(page.getByText('SannaS knuffade dig tillbaka!')).toBeVisible({ timeout: 7000 });
	});

	test('med reducerad rörelse: ingen skakning, bara en markering', async ({ page }) => {
		await page.emulateMedia({ reducedMotion: 'reduce' });
		await enter(page);
		await page.goto('/profil/sannas');
		await page.getByTestId('knuffa').click();
		await expect(page.locator('#profilruta')).toHaveClass(/nudged-mark/);
		await expect(page.locator('#profilruta')).not.toHaveClass(/(^|\s)nudged(\s|$)/);
	});
});

test('ljud startar aldrig utan klick, och kan stängas av', async ({ page }) => {
	await page.addInitScript(() => {
		const w = window as unknown as { __ac: number; AudioContext: typeof AudioContext };
		w.__ac = 0;
		const Orig = w.AudioContext;
		w.AudioContext = class extends Orig {
			constructor(o?: AudioContextOptions) {
				super(o);
				w.__ac++;
			}
		};
	});
	await enter(page);
	for (const path of ['/hem', '/profil/gubben940', '/profil/grundaren', '/kartan']) {
		await page.goto(path);
		await page.waitForTimeout(300);
	}
	expect(await page.evaluate(() => (window as unknown as { __ac: number }).__ac)).toBe(0);

	await page.goto('/profil/gubben940');
	const play = page.getByTestId('play');
	await play.click();
	await expect(play).toHaveAttribute('aria-pressed', 'true');
	expect(await page.evaluate(() => (window as unknown as { __ac: number }).__ac)).toBe(1);

	await page.getByTestId('sound-toggle').click();
	await expect(play).toHaveAttribute('aria-pressed', 'false');
	await expect(play).toBeDisabled();
});

test('besöksräknaren i LCD-stil', async ({ page }) => {
	await enter(page);
	await page.goto('/profil/gubben940');
	await expect(page.getByTestId('counter')).toContainText('Du är besökare nr');
	await expect(page.getByTestId('counter')).toContainText('001 337');
});

test('affischen blir exakt en A4 i utskrift', async ({ page, browserName }) => {
	test.skip(browserName !== 'chromium');
	await page.goto('/affisch');
	await expect(page.locator('[data-testid="poster"] svg[aria-label^="QR-kod"]')).toBeVisible();
	await page.emulateMedia({ media: 'print' });
	const box = await page.getByTestId('poster').boundingBox();
	expect(Math.abs(box!.width - (210 / 25.4) * 96)).toBeLessThan(2);
	expect(Math.abs(box!.height - (297 / 25.4) * 96)).toBeLessThan(2);
	await expect(page.locator('.site-head')).toBeHidden();
	await expect(page.getByTestId('print')).toBeHidden();
	const pdf = await page.pdf({ preferCSSPageSize: true, printBackground: true });
	const pages = (pdf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) ?? []).length;
	expect(pages).toBe(1);
});

test('kartan: filtret Nu, pulserande nål och lista synkad med kartan', async ({ page }) => {
	await enter(page);
	await page.goto('/kartan');
	const total = () =>
		page.locator('.leaflet-marker-icon').evaluateAll((els) => els.reduce((s, e) => s + Number(e.getAttribute('data-count') ?? 0), 0));
	await expect.poll(total).toBe(16);
	await expect(page.locator('.pin-now').first()).toBeAttached();
	await page.getByTestId('time-filter').getByText('Nu', { exact: false }).first().click();
	await expect.poll(total).toBeLessThan(16);
	const list = page.locator('#lista');
	await expect(list.getByRole('heading', { name: 'Nu och inom en timme' })).toBeVisible();
	const first = list.locator('.list li').first().getByRole('button');
	await first.click();
	await expect(first).toHaveAttribute('aria-current', 'true');
	await expect(page.getByTestId('panel').getByRole('button', { name: /kommer/i })).toBeVisible();
});

test('/om och mobilheadern', async ({ page }) => {
	await page.goto('/om');
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Om Västeråsarna');
	for (const h of ['Manifestet', 'Principerna', 'Så kan det växa']) await expect(page.getByRole('heading', { name: h })).toBeVisible();

	if (test.info().project.name === 'mobil') {
		await enter(page);
		const head = await page.locator('.head-row').boundingBox();
		expect(head!.height).toBeLessThan(70);
		await expect(page.getByTestId('menu-btn')).toBeVisible();
		const dice = await page.getByTestId('dice').boundingBox();
		expect(dice!.y + dice!.height).toBeLessThan(844);
		const greeting = await page.getByRole('heading', { level: 1 }).boundingBox();
		expect(greeting!.y).toBeLessThan(844);
	}
});
