import type { Actions, PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';
import type {
	Manga,
	Chapter,
	PaginatedResult,
	ReadHistoryRecord,
	LastReadChapterInfo
} from '$lib/types';

export const load: PageServerLoad = async ({ locals, params }) => {
	const initialLimit = 30;

	try {
		const manga = await locals.pb
			.collection('mangas')
			.getFirstListItem<Manga>(`slug = "${params.slug}"`);
		manga.cover_image_url = locals.pb.files.getURL(manga, manga.cover_image);

		const [chaptersResult, isFavorited, historyRecords] = await Promise.all([
			locals.pb.collection('chapters').getList<Chapter>(1, initialLimit, {
				filter: `manga = "${manga.id}"`,
				sort: 'chapter_number',
				count: true
			}),
			locals.user
				? locals.pb
						.collection('favorites')
						.getFirstListItem(`user = "${locals.user.id}" && manga = "${manga.id}"`)
						.then(() => true)
						.catch(() => false)
				: Promise.resolve(false),
			locals.user
				? locals.pb
						.collection('read_history')
						.getFullList<ReadHistoryRecord>({
							filter: `user = "${locals.user.id}" && manga = "${manga.id}"`,
							sort: '-updated',
							expand: 'chapter'
						})
						.catch((err) => {
							console.warn('Failed to load read history, continuing without it:', err);
							return [];
						})
				: Promise.resolve([])
		]);

		const totalChaptersCount = chaptersResult.totalItems;
		manga.total_chapters = totalChaptersCount;

		const readChapterIds = new Set(historyRecords.map((r) => r.chapter));
		let lastReadChapter: LastReadChapterInfo | null = null;
		let firstUnreadChapter: Chapter | null = null;

		if (historyRecords.length > 0) {
			const lastRecord = historyRecords[0];
			if (lastRecord.expand && lastRecord.expand.chapter) {
				lastReadChapter = {
					...lastRecord.expand.chapter,
					last_page_read: lastRecord.last_page_read
				};
			}
		}

		const allChaptersSorted = await locals.pb.collection('chapters').getFullList<Chapter>({
			filter: `manga = "${manga.id}"`,
			sort: 'chapter_number'
		});

		for (const chapter of allChaptersSorted) {
			if (!readChapterIds.has(chapter.id)) {
				firstUnreadChapter = chapter;
				break;
			}
		}

		return {
			user: locals.user || null,
			manga,
			isFavorited,
			chaptersResult: chaptersResult as PaginatedResult<Chapter>,
			readChapterIds: Array.from(readChapterIds),
			lastReadChapter,
			firstUnreadChapter,
			readCount: readChapterIds.size
		};
	} catch (err: unknown) {
		const pbError = err as { status?: number };
		if (pbError.status === 404) {
			throw error(404, 'The requested manga does not exist.');
		}
		console.error('Failed to load manga page:', err);
		throw error(500, 'A server error occurred while loading the manga page.');
	}
};

export const actions: Actions = {
	toggleFavorite: async ({ locals, request }) => {
		if (!locals.user) {
			throw redirect(303, '/login');
		}

		const formData = await request.formData();
		const mangaId = formData.get('mangaId') as string;
		const currentIsFavorited = formData.get('isFavorited') === 'true';

		const filter = `user = "${locals.user.id}" && manga = "${mangaId}"`;

		try {
			if (currentIsFavorited) {
				// عملية الحذف (Unfavorite)
				const record = await locals.pb.collection('favorites').getFirstListItem(filter);
				await locals.pb.collection('favorites').delete(record.id);
				return { success: true, message: 'تمت الإزالة من المفضلة بنجاح' };
			} else {
				// عملية الإضافة (Favorite)
				try {
					await locals.pb.collection('favorites').getFirstListItem(filter);
					return { success: false, message: 'هذه المانجا موجودة بالفعل في المفضلة.' };
				} catch (err: unknown) {
					const pbError = err as { status?: number };
					if (pbError.status === 404) {
						await locals.pb.collection('favorites').create({
							user: locals.user.id,
							manga: mangaId
						});
						return { success: true, message: 'تمت الإضافة للمفضلة بنجاح' };
					}
					throw err;
				}
			}
		} catch (err: unknown) {
			console.error('Toggle Favorite Action Error:', err);
			const pbError = err as { data?: { data?: { name?: { code?: string } } } };
			if (pbError.data?.data?.name?.code === 'validation_not_unique') {
				return { success: false, message: 'هذه المانجا موجودة بالفعل في المفضلة.' };
			}
			return { success: false, message: 'فشل تحديث المفضلة. حاول مرة أخرى.' };
		}
	}
};
