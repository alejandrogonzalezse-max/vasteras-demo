import { expect, test, type Page } from '@playwright/test';
import { collectErrors, enter } from './helpers';

/** Gör en riktig liten JPEG i webbläsaren (canvas) och returnerar bytes. */
async function makeJpeg(page: Page, w = 1600, h = 1200): Promise<Buffer> {
	const b64 = await page.evaluate(
		async ([w, h]) => {
			const c = document.createElement('canvas');
			c.width = w;
			c.height = h;
			const g = c.getContext('2d')!;
			const grad = g.createLinearGradient(0, 0, w, h);
			grad.addColorStop(0, '#2b5ea8');
			grad.addColorStop(1, '#f2b84b');
			g.fillStyle = grad;
			g.fillRect(0, 0, w, h);
			g.fillStyle = '#fff';
			g.fillRect(w / 3, h / 3, w / 3, h / 3);
			const blob: Blob = await new Promise((r) => c.toBlob((b) => r(b!), 'image/jpeg', 0.9));
			const bytes = new Uint8Array(await blob.arrayBuffer());
			let s = '';
			for (const x of bytes) s += String.fromCharCode(x);
			return btoa(s);
		},
		[w, h]
	);
	return Buffer.from(b64, 'base64');
}

/** Lägger in ett EXIF-block (APP1) med GPS-position (59°36'36" N – Västerås) direkt efter SOI. */
function withGps(jpeg: Buffer): Buffer {
	const tiff = Buffer.alloc(80);
	let o = 0;
	tiff.write('MM', o); o += 2;
	tiff.writeUInt16BE(42, o); o += 2;
	tiff.writeUInt32BE(8, o); o += 4;
	// IFD0: en post – pekare till GPS-IFD
	tiff.writeUInt16BE(1, o); o += 2;
	tiff.writeUInt16BE(0x8825, o); tiff.writeUInt16BE(4, o + 2); tiff.writeUInt32BE(1, o + 4); tiff.writeUInt32BE(26, o + 8); o += 12;
	tiff.writeUInt32BE(0, o); o += 4;
	// GPS-IFD vid 26: GPSLatitudeRef = "N", GPSLatitude = 59/1, 36/1, 3600/100
	tiff.writeUInt16BE(2, o); o += 2;
	tiff.writeUInt16BE(1, o); tiff.writeUInt16BE(2, o + 2); tiff.writeUInt32BE(2, o + 4); tiff.write('N\0', o + 8); o += 12;
	tiff.writeUInt16BE(2, o); tiff.writeUInt16BE(5, o + 2); tiff.writeUInt32BE(3, o + 4); tiff.writeUInt32BE(56, o + 8); o += 12;
	tiff.writeUInt32BE(0, o); o += 4;
	for (const [n, d] of [[59, 1], [36, 1], [3600, 100]]) {
		tiff.writeUInt32BE(n, o);
		tiff.writeUInt32BE(d, o + 4);
		o += 8;
	}
	const body = Buffer.concat([Buffer.from('Exif\0\0', 'binary'), tiff.subarray(0, o)]);
	const len = Buffer.alloc(2);
	len.writeUInt16BE(body.length + 2);
	return Buffer.concat([jpeg.subarray(0, 2), Buffer.from([0xff, 0xe1]), len, body, jpeg.subarray(2)]);
}

/** Läser en sparad bild ur IndexedDB som bytes. */
async function storedBytes(page: Page, id: string) {
	const arr = await page.evaluate(async (id) => {
		const db: IDBDatabase = await new Promise((r, j) => {
			const q = indexedDB.open('vasteras-demo-bilder', 1);
			q.onsuccess = () => r(q.result);
			q.onerror = () => j(q.error);
		});
		const blob: Blob = await new Promise((r, j) => {
			const q = db.transaction('bilder').objectStore('bilder').get(id);
			q.onsuccess = () => r(q.result);
			q.onerror = () => j(q.error);
		});
		const bmp = await createImageBitmap(blob);
		return { bytes: Array.from(new Uint8Array(await blob.arrayBuffer())), type: blob.type, w: bmp.width, h: bmp.height };
	}, id);
	return { ...arr, buf: Buffer.from(arr.bytes) };
}

const myPosts = (page: Page) => page.evaluate(() => JSON.parse(localStorage.getItem('vasteras-demo-v1')!).myPosts);

test('öppna en lapp från Spontant just nu och se detaljsidan', async ({ page }) => {
	const errors = collectErrors(page);
	await enter(page);
	const link = page.locator('#spontant .t-link').first();
	const title = (await link.textContent())!.trim();
	await link.click();
	await expect(page).toHaveURL(/\/lapp\/a-[\w-]+$/);
	await expect(page.getByRole('heading', { level: 1 })).toHaveText(title);
	await expect(page.getByTestId('lapp-when')).not.toBeEmpty();
	await expect(page.getByRole('heading', { name: 'Vilka kommer' })).toBeVisible();
	await expect(page.getByRole('link', { name: 'Visa på stora kartan' })).toHaveAttribute('href', /\/kartan\?nal=a-/);
	const rsvp = page.getByRole('button', { name: /Jag kommer|Du kommer/ });
	const was = await rsvp.getAttribute('aria-pressed');
	await rsvp.click();
	await expect(rsvp).toHaveAttribute('aria-pressed', was === 'true' ? 'false' : 'true');

	// Tillbaka dit man kom ifrån
	await page.getByTestId('back').click();
	await expect(page).toHaveURL(/\/hem$/);

	// Delbar adress fungerar även vid direkt besök
	await page.goto('/lapp/a-bradspel');
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Brädspel och te på biblioteket');
	expect(errors).toEqual([]);
});

test('skapa en grupp på tre steg och se den i listan', async ({ page }) => {
	await enter(page);
	await page.goto('/grupper');
	await page.getByTestId('start-group').click();
	await expect(page).toHaveURL(/\/grupper\/ny$/);

	await page.getByLabel('Namn').fill('Kvällsdopparna');
	await page.getByLabel('En mening om gruppen').fill('Vi badar i Mälaren när solen går ner.');
	await page.getByRole('button', { name: 'Nästa' }).click(); // steg 2
	await page.getByRole('radio', { name: /Sluten/ }).check();
	await page.getByRole('button', { name: 'Nästa' }).click(); // steg 3
	await expect(page.getByText('I den riktiga sajten godkänner en moderator nya grupper först')).toBeVisible();
	await page.getByRole('button', { name: 'Skapa gruppen' }).click(); // klart

	await expect(page).toHaveURL(/\/grupp\/g-[\w]+$/);
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Kvällsdopparna');
	await expect(page.getByText('Du är moderator').first()).toBeVisible();

	// Sluten grupp: en ansökan dyker upp och kan godkännas på samma sida
	const apps = page.locator('#ansokningar');
	await expect(apps.getByRole('button', { name: 'Godkänn' })).toBeVisible({ timeout: 8000 });
	await apps.getByRole('button', { name: 'Godkänn' }).click();

	await page.goto('/grupper');
	await expect(page.locator('.mine-list')).toContainText('Kvällsdopparna');
	await expect(page.getByRole('heading', { name: 'Kvällsdopparna', level: 3 })).toBeVisible();
});

test('starta en ny tråd i forumet och svara med citat', async ({ page }) => {
	await enter(page);
	await page.goto('/forum/natur');
	await page.getByTestId('new-thread').click();
	await expect(page).toHaveURL(/\/forum\/ny\?kategori=natur$/);
	await expect(page.getByLabel('Kategori')).toHaveValue('natur');
	await page.getByLabel('Rubrik').fill('Var plockar ni svamp?');
	await page.getByLabel('Text').fill('Har hört att det finns kantareller vid Johannisberg. Stämmer det?');
	await page.getByRole('button', { name: 'Publicera tråden' }).click();

	await expect(page).toHaveURL(/\/forum\/trad\/t-[\w]+$/);
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Var plockar ni svamp?');
	await page.getByRole('button', { name: 'Citera' }).first().click();
	await expect(page.getByLabel('Svara i tråden')).toHaveValue(/^> /);

	await page.goto('/forum/natur');
	await expect(page.getByRole('link', { name: 'Var plockar ni svamp?' })).toBeVisible();
});

test('lägg till vän från en deltagarlista – förfrågan blir vänskap', async ({ page }) => {
	await enter(page);
	await page.goto('/lapp/a-bradspel');
	const list = page.getByTestId('attendees');
	const add = list.getByRole('button', { name: /Lägg till .+ som vän/ }).first();
	const name = ((await add.textContent()) ?? '').replace(/^Lägg till | som vän$/g, '').trim();
	await add.click();
	await expect(list.getByTestId('friend-pending').first()).toBeVisible();
	await expect(page.getByText(`${name} accepterade din vänförfrågan!`)).toBeVisible({ timeout: 8000 });

	await page.goto('/vanner');
	await page.getByLabel('Sök på namn').fill(name);
	await expect(page.getByTestId('search-results').getByTestId('friend-ok')).toBeVisible();
});

test('Hitta vänner: vänkod och QR', async ({ page }) => {
	await enter(page);
	await page.goto('/profil/sannas');
	const code = (await page.getByTestId('friend-code').textContent())!.trim();
	await page.goto(`/vanner?kod=${code}`);
	await expect(page.getByRole('img', { name: /QR-kod/ })).toBeVisible();
	await expect(page.locator('.hit')).toContainText('SannaS');
	await expect(page.getByRole('heading', { name: 'Folk du har träffat' })).toBeVisible();
	await expect(page.getByRole('heading', { name: 'Vänner till vänner' })).toBeVisible();
});

test('ladda upp en bild i dagboken och se den efter omladdning', async ({ page }) => {
	await enter(page);
	const jpeg = await makeJpeg(page);
	const composer = page.getByTestId('diary-composer');
	await composer.getByLabel('Skriv i dagboken').fill('Solnedgång vid Lögarängen');
	await composer.getByRole('button', { name: 'Lägg till bild' }).click();
	await composer.getByTestId('file-input').setInputFiles({ name: 'solnedgang.jpg', mimeType: 'image/jpeg', buffer: jpeg });
	await expect(composer.getByTestId('upload').locator('img')).toBeVisible();

	// Alt-text är obligatorisk
	await composer.getByRole('button', { name: 'Publicera' }).click();
	await expect(composer.getByRole('alert')).toContainText(/bildtext/i);
	await composer.getByTestId('alt-input').fill('Orange himmel över Mälaren');
	await composer.getByRole('button', { name: 'Publicera' }).click();

	const first = page.locator('.diary > li').first();
	await expect(first.getByRole('img', { name: 'Orange himmel över Mälaren' })).toBeVisible();
	await page.reload();
	await expect(page.locator('.diary > li').first().getByRole('img', { name: 'Orange himmel över Mälaren' })).toBeVisible();

	// Storleken krymps till högst 1080 px
	const id = (await myPosts(page))[0].images[0].id;
	const s = await storedBytes(page, id);
	expect(Math.max(s.w, s.h)).toBeLessThanOrEqual(1080);
});

test('EXIF och GPS-position tas bort från uppladdade bilder', async ({ page }) => {
	await enter(page);
	const original = withGps(await makeJpeg(page, 800, 600));
	expect(original.includes(Buffer.from('Exif'))).toBe(true);
	expect(original.includes(Buffer.from([0x88, 0x25]))).toBe(true);

	const composer = page.getByTestId('diary-composer');
	await composer.getByLabel('Skriv i dagboken').fill('Bild med GPS i');
	await composer.getByRole('button', { name: 'Lägg till bild' }).click();
	await composer.getByTestId('file-input').setInputFiles({ name: 'gps.jpg', mimeType: 'image/jpeg', buffer: original });
	await composer.getByTestId('alt-input').fill('Testbild');
	await composer.getByRole('button', { name: 'Publicera' }).click();
	await expect(page.locator('.diary > li').first().getByRole('img', { name: 'Testbild' })).toBeVisible();

	const id = (await myPosts(page))[0].images[0].id;
	const s = await storedBytes(page, id);
	expect(['image/webp', 'image/jpeg']).toContain(s.type);
	expect(s.buf.includes(Buffer.from('Exif'))).toBe(false);
	expect(s.buf.includes(Buffer.from('EXIF'))).toBe(false);
	expect(s.buf.includes(Buffer.from('GPS'))).toBe(false);
	// GPS-pekaren (tagg 0x8825) i TIFF-huvud finns inte heller
	expect(s.buf.includes(Buffer.from('MM\0*'))).toBe(false);
	expect(s.buf.includes(Buffer.from('II*\0'))).toBe(false);
});

test('"Bara jag"-inlägg syns inte i vännernas flöde men på egna profilen med lås', async ({ page }) => {
	await enter(page);
	const composer = page.getByTestId('diary-composer');
	await composer.getByLabel('Skriv i dagboken').fill('Hemlig tanke om midsommar');
	await composer.getByRole('radio', { name: 'Bara jag' }).check();
	await composer.getByRole('button', { name: 'Publicera' }).click();
	await expect(page.getByText('Hemlig tanke om midsommar')).toHaveCount(0);

	await composer.getByLabel('Skriv i dagboken').fill('Öppen tanke om midsommar');
	await composer.getByRole('radio', { name: 'Vänner' }).check();
	await composer.getByRole('button', { name: 'Publicera' }).click();
	await expect(page.locator('.diary').getByText('Öppen tanke om midsommar')).toBeVisible();

	await page.goto('/profil/gubben940#dagbok');
	const post = page.getByTestId('diary-post').filter({ hasText: 'Hemlig tanke om midsommar' });
	await expect(post).toBeVisible();
	await expect(post.getByTestId('private')).toHaveText(/Bara jag/);
});

test('ogiltiga bilder ger vänliga fel', async ({ page }) => {
	await enter(page);
	const composer = page.getByTestId('diary-composer');
	await composer.getByRole('button', { name: 'Lägg till bild' }).click();
	await composer.getByTestId('file-input').setInputFiles({ name: 'inte-en-bild.txt', mimeType: 'text/plain', buffer: Buffer.from('hej') });
	await expect(composer.getByTestId('upload').getByRole('alert')).toBeVisible();
	await composer.getByTestId('file-input').setInputFiles({ name: 'stor.jpg', mimeType: 'image/jpeg', buffer: Buffer.alloc(6 * 1024 * 1024, 1) });
	await expect(composer.getByTestId('upload').getByRole('alert')).toContainText('5 MB');
});
