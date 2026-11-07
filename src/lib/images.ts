// Egna bilder i demon: bearbetas i webbläsaren och sparas i IndexedDB
// (localStorage räcker inte till bilder). Går IndexedDB inte att använda
// (t.ex. vissa privata lägen) sparas bilderna i minnet tills sidan laddas om.

export const MAX_BYTES = 5 * 1024 * 1024;
export const MAX_SIDE = 1080;

export interface StoredImage {
	id: string;
	alt: string;
}

const DB_NAME = 'vasteras-demo-bilder';
const STORE = 'bilder';
const memory = new Map<string, Blob>();
const urls = new Map<string, string>();
let dbPromise: Promise<IDBDatabase | null> | null = null;

function openDb(): Promise<IDBDatabase | null> {
	if (dbPromise) return dbPromise;
	dbPromise = new Promise((resolve) => {
		try {
			if (typeof indexedDB === 'undefined') return resolve(null);
			const req = indexedDB.open(DB_NAME, 1);
			req.onupgradeneeded = () => req.result.createObjectStore(STORE);
			req.onsuccess = () => resolve(req.result);
			req.onerror = () => resolve(null);
			req.onblocked = () => resolve(null);
		} catch {
			resolve(null);
		}
	});
	return dbPromise;
}

function tx<T>(db: IDBDatabase, mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
	return new Promise((resolve, reject) => {
		const t = db.transaction(STORE, mode);
		const req = fn(t.objectStore(STORE));
		req.onsuccess = () => resolve(req.result);
		req.onerror = () => reject(req.error);
	});
}

export async function putImage(blob: Blob): Promise<string> {
	const id = 'img-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
	const db = await openDb();
	try {
		if (!db) throw new Error('ingen IndexedDB');
		await tx(db, 'readwrite', (s) => s.put(blob, id));
	} catch {
		memory.set(id, blob);
	}
	return id;
}

export async function getImage(id: string): Promise<Blob | null> {
	if (memory.has(id)) return memory.get(id)!;
	const db = await openDb();
	if (!db) return null;
	try {
		return ((await tx(db, 'readonly', (s) => s.get(id))) as Blob | undefined) ?? null;
	} catch {
		return null;
	}
}

/** Object URL för en sparad bild (cachas). */
export async function imageUrl(id: string): Promise<string | null> {
	if (urls.has(id)) return urls.get(id)!;
	const blob = await getImage(id);
	if (!blob) return null;
	const url = URL.createObjectURL(blob);
	urls.set(id, url);
	return url;
}

export async function clearImages() {
	for (const u of urls.values()) URL.revokeObjectURL(u);
	urls.clear();
	memory.clear();
	const db = await openDb();
	if (!db) return;
	try {
		await tx(db, 'readwrite', (s) => s.clear());
	} catch {
		/* ok */
	}
}

// ---------------------------------------------------------------- Bildflöde

export class ImageError extends Error {}

async function decode(file: Blob): Promise<ImageBitmap | HTMLImageElement> {
	// createImageBitmap följer EXIF-rotationen; annars en vanlig <img> (som också gör det i moderna webbläsare).
	if (typeof createImageBitmap === 'function') {
		try {
			return await createImageBitmap(file, { imageOrientation: 'from-image' });
		} catch {
			/* prova <img> */
		}
	}
	const url = URL.createObjectURL(file);
	try {
		const img = new Image();
		img.decoding = 'async';
		img.src = url;
		await img.decode();
		return img;
	} finally {
		URL.revokeObjectURL(url);
	}
}

function toBlob(canvas: HTMLCanvasElement, type: string, q: number): Promise<Blob | null> {
	return new Promise((resolve) => canvas.toBlob(resolve, type, q));
}

export interface Processed {
	blob: Blob;
	width: number;
	height: number;
	type: string;
}

/**
 * Läser en bild, skalar om till max 1080 px och kodar om till WebP (eller JPEG
 * där WebP inte går att skapa). Omkodningen ritar bara pixlarna – all metadata
 * som EXIF och GPS-position följer inte med.
 * square: beskär till kvadrat; pos (0–1) styr var utsnittet hamnar längs den långa sidan.
 */
export async function processImage(file: File, opts: { square?: boolean; pos?: number } = {}): Promise<Processed> {
	if (!file.type.startsWith('image/') && !/\.(jpe?g|png|gif|webp|heic|heif|avif)$/i.test(file.name))
		throw new ImageError('Det där verkar inte vara en bild. Välj en JPG-, PNG- eller WebP-bild.');
	if (file.size > MAX_BYTES)
		throw new ImageError(`Bilden är ${(file.size / 1024 / 1024).toFixed(1).replace('.', ',')} MB – max är 5 MB per bild.`);

	let src: ImageBitmap | HTMLImageElement;
	try {
		src = await decode(file);
	} catch {
		throw new ImageError(
			'Webbläsaren kunde inte läsa bilden. Är det en HEIC-bild från en iPhone? Välj "Mest kompatibel" under Kamera › Format, eller ta en skärmdump av bilden.'
		);
	}
	const sw = 'naturalWidth' in src ? src.naturalWidth : src.width;
	const sh = 'naturalHeight' in src ? src.naturalHeight : src.height;
	let sx = 0,
		sy = 0,
		cw = sw,
		ch = sh;
	if (opts.square) {
		const side = Math.min(sw, sh);
		const pos = Math.min(1, Math.max(0, opts.pos ?? 0.5));
		sx = Math.round((sw - side) * pos);
		sy = Math.round((sh - side) * pos);
		cw = ch = side;
	}
	const scale = Math.min(1, (opts.square ? 640 : MAX_SIDE) / Math.max(cw, ch));
	const w = Math.max(1, Math.round(cw * scale));
	const h = Math.max(1, Math.round(ch * scale));
	const canvas = document.createElement('canvas');
	canvas.width = w;
	canvas.height = h;
	const ctx = canvas.getContext('2d');
	if (!ctx) throw new ImageError('Bilden kunde inte bearbetas i den här webbläsaren.');
	ctx.imageSmoothingQuality = 'high';
	ctx.drawImage(src, sx, sy, cw, ch, 0, 0, w, h);
	if ('close' in src) src.close();

	let blob = await toBlob(canvas, 'image/webp', 0.85);
	// Äldre Safari kan inte skapa WebP och lämnar då PNG – koda om till JPEG i så fall.
	if (!blob || blob.type !== 'image/webp') blob = await toBlob(canvas, 'image/jpeg', 0.86);
	if (!blob) throw new ImageError('Bilden kunde inte sparas i den här webbläsaren.');
	return { blob, width: w, height: h, type: blob.type };
}
