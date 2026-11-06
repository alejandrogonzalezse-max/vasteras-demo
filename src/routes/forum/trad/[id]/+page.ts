import { error } from '@sveltejs/kit';
import { forumCategories, forumThreads } from '#lib/mock.ts';
import type { EntryGenerator, PageLoad } from './$types';

export const entries: EntryGenerator = () => forumThreads.map((t) => ({ id: t.id }));

export const load: PageLoad = ({ params }) => {
	const thread = forumThreads.find((t) => t.id === params.id);
	if (!thread) error(404, 'Tråden finns inte');
	return { thread, cat: forumCategories.find((c) => c.id === thread.cat)! };
};
