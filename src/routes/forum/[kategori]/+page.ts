import { error } from '@sveltejs/kit';
import { forumCategories, forumThreads } from '#lib/mock.ts';
import type { EntryGenerator, PageLoad } from './$types';

export const entries: EntryGenerator = () => forumCategories.map((c) => ({ kategori: c.id }));

export const load: PageLoad = ({ params }) => {
	const cat = forumCategories.find((c) => c.id === params.kategori);
	if (!cat) error(404, 'Kategorin finns inte');
	return { cat, threads: forumThreads.filter((t) => t.cat === cat.id) };
};
