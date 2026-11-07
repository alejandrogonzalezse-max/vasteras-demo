import { groups } from '#lib/mock.ts';
import type { EntryGenerator, PageLoad } from './$types';

// Demons grupper förrenderas. Grupper du startar finns bara i webbläsaren (se netlify.toml).
export const prerender = 'auto';
export const entries: EntryGenerator = () => groups.map((g) => ({ id: g.id }));
export const load: PageLoad = ({ params }) => ({ id: params.id });
