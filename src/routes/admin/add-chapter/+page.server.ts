import { fail } from '@sveltejs/kit';
import { mangasSchema } from '$lib/schemas';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { PageServerLoad, Actions, RequestEvent } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const form = await superValidate(zod(mangasSchema));

	const getMangas = async () => {
		try {
			const mangas = structuredClone(
				await locals.pb.collection('mangas').getFullList({ sort: '-created' })
			);
			return mangas;
		} catch (err) {
			console.log('Error: ', err);
			return [];
		}
	};

	return {
		form,
		mangas: await getMangas()
	};
};

export const actions: Actions = {
	add: async (event: RequestEvent) => {
		const form = await superValidate(event, zod(mangasSchema));

		// فحص صحة البيانات
		if (!form.valid) {
			return fail(400, {
				error: 'يرجى ملء جميع الحقول المطلوبة والتأكد من صحتها.'
			});
		}

		// استخراج البيانات الجاهزة من form.data بدون إعادة قراءة الطلب
		const { manga: mangaId, title, chapter_number, image_urls } = form.data;

		// تقسيم النص سطراً بسطر واستخراج الروابط المباشرة فقط
		const urls = image_urls
			.split('\n')
			.map((url) => url.trim())
			.filter((url) => url.length > 0);

		if (urls.length === 0) {
			return fail(400, {
				error: 'الرجاء لصق رابط واحد على الأقل.'
			});
		}

		try {
			// 1. إنشاء سجل الفصل في جدول chapters
			const newChapter = await event.locals.pb.collection('chapters').create({
				manga: mangaId,
				title: title,
				chapter_number: Number(chapter_number)
			});

			// 2. إدخال كل رابط كصفحة مرتبة في جدول pages
			for (let i = 0; i < urls.length; i++) {
				await event.locals.pb.collection('pages').create({
					chapter: newChapter.id,
					page_number: i + 1,
					image_url: urls[i]
				});
			}
		} catch (err) {
			console.error('Error adding chapter: ', err);
			return fail(500, {
				error: 'حدث خطأ أثناء حفظ الفصل والصفحات في قاعدة البيانات.'
			});
		}

		return {
			success: `تمت إضافة الفصل بنجاح مع ${urls.length} صفحة!`
		};
	}
};
