import { activitySpecs } from '#lib/mock.ts';
import type { EntryGenerator, PageLoad } from './$types';

// Påhittade lappar förrenderas. Egna lappar finns bara i webbläsaren och
// visas av appens skal (se netlify.toml), därför 'auto'.
export const prerender = 'auto';
export const entries: EntryGenerator = () => activitySpecs.map((a) => ({ id: a.id }));

export const load: PageLoad = ({ params }) => ({ id: params.id });
