import { error } from '@sveltejs/kit';
import { users } from '#lib/mock.ts';
import type { EntryGenerator, PageLoad } from './$types';

export const entries: EntryGenerator = () => users.map((u) => ({ id: u.id }));

export const load: PageLoad = ({ params }) => {
	const user = users.find((u) => u.id === params.id);
	if (!user) error(404, 'Profilen finns inte');
	return { user };
};
