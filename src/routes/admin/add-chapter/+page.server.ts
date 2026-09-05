import { fail } from '@sveltejs/kit';
import { JSDOM } from 'jsdom';
import { mangasSchema } from '$lib/schemas'; // تم التأكد من وجود هذا التعريف
import { message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { PageServerLoad, Actions, RequestEvent } from './$types'; // تم استيراد الأنواع اللازمة
import DOMPurify from 'dompurify';

const ALLOWED_DOMAINS = ['https://onepiecechapters.com', 'https://ww8.read-naruto.com'];

export const load: PageServerLoad = async ({ locals }) => {
	const form = await superValidate(zod(mangasSchema));

	const getMangas = async () => {
		try {
			// الآن 'pb' معرف بشكل صحيح
			const mangas = structuredClone(
				await locals.pb.collection('mangas').getFullList(undefined, { sort: '-created' })
			);
			return mangas;
		} catch (err) {
			console.log('Error: ', err);
		}
	};

	return {
		form,
		mangas: await getMangas()
	};
};

// تم تحديد نوع 'event' بشكل صريح
export const actions: Actions = {
	add: async (event: RequestEvent) => {
		const form = await superValidate(event, zod(mangasSchema));
		const data = await event.request.formData();
		const mangaId = data.get('manga') as string;
		const url = data.get('url') as string;
		const title = data.get('title') as string;
		const chapter_number = data.get('chapter_number') as string;

		let parsedUrl: URL;

		try {
			parsedUrl = new URL(url);
		} catch {
			return fail(400, {
				error: 'الرابط غير صحيح.'
			});
		}

		const isAllowed = ALLOWED_DOMAINS.some((domain) => {
			const allowedHost = new URL(domain).hostname;
			return parsedUrl.hostname === allowedHost;
		});

		if (!isAllowed) {
			return fail(400, {
				error: 'هذا النطاق غير مسموح به. يرجى استخدام رابط من النطاقات الموثوقة فقط.'
			});
		}

		try {
			const res = await fetch(url);

			if (!res.ok) {
				return message(form, 'فشل جلب الرابط. تأكد أن الرابط يعمل.');
			}

			const html = await res.text();
			const window = new JSDOM(html).window;
			const purify = DOMPurify(window);
			const sanitizedHtml = purify.sanitize(html);
			const dom = new JSDOM(sanitizedHtml).window.document;
			const images = Array.from(dom.querySelectorAll('img')).map((img) => img.src);

			// 1. إنشاء سجل الفصل
			const newChapter = await event.locals.pb.collection('chapters').create({
				manga: mangaId,
				title: title,
				chapter_number: Number(chapter_number)
			});

			// 2. إدخال كل صورة كسجل صفحة داخل جدول pages حتى تظهر في القارئ
			for (let i = 0; i < images.length; i++) {
				await event.locals.pb.collection('pages').create({
					chapter: newChapter.id,
					page_number: i + 1,
					image_path: images[i]
				});
			}
		} catch (err) {
			console.log('Error: ', err);
			return message(form, 'Something went wrong');
		}

		return message(form, 'Chapter added successfully');
	}
};
