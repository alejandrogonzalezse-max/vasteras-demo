// Vänkoder: en kort kod per person som man kan skriva in eller skanna som QR.
import { site } from './origin.svelte.ts';
import { userById, users } from './mock.ts';

export function friendCode(id: string): string {
	const name = (userById(id)?.name ?? id).replace(/[^A-Za-zÅÄÖåäö]/g, '').toUpperCase();
	const letters = (name.normalize('NFD').replace(/[̀-ͯ]/g, '') + 'XXXX').slice(0, 4);
	const n = [...id].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 1000, 7);
	return `${letters}-${String(n).padStart(3, '0')}`;
}

export function userByCode(code: string) {
	const c = code.trim().toUpperCase().replace(/\s+/g, '');
	return users.find((u) => friendCode(u.id) === c);
}

export const friendLink = (id: string) => `${site.origin}/vanner?kod=${friendCode(id)}`;
