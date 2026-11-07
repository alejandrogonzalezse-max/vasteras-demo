import { forumThreads } from '#lib/mock.ts';
import type { EntryGenerator, PageLoad } from './$types';

// Demons trådar förrenderas. Egna trådar och grupptrådar visas av appens skal (se netlify.toml).
export const prerender = 'auto';
export const entries: EntryGenerator = () => forumThreads.map((t) => ({ id: t.id }));
export const load: PageLoad = ({ params }) => ({ id: params.id });
