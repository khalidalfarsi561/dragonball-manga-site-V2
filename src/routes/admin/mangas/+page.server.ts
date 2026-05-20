// src/routes/admin/mangas/+page.server.ts (New file)
import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	try {
		const mangas = await locals.pb.collection('mangas').getFullList({ sort: '-created' });
		return { mangas };
	} catch (error) {
		console.error('Failed to load mangas with sort, falling back to unsorted list:', error);
		const mangas = await locals.pb.collection('mangas').getFullList();
		return { mangas };
	}
};

export const actions: Actions = {
	deleteManga: async ({ request, locals }) => {
		const formData = await request.formData();
		const mangaId = formData.get('mangaId') as string;

		try {
			// لاحقًا: يمكن إضافة حذف الفصول والصفحات المتعلقة بالمانجا هنا
			await locals.pb.collection('mangas').delete(mangaId);
		} catch {
			return fail(500, { error: 'فشل حذف المانجا.' });
		}
		return { success: true };
	}
};
