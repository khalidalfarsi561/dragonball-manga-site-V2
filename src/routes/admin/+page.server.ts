/* src/routes/admin/+page.server.ts */
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const [mangaRecords, chapterRecords, userRecords, commentRecords, readHistoryRecords] =
		await Promise.all([
			locals.pb.collection('mangas').getFullList({ fields: 'id,title' }),
			locals.pb.collection('chapters').getFullList({ fields: 'id' }),
			locals.pb.collection('users').getFullList(),
			locals.pb.collection('comments').getFullList(),
			locals.pb.collection('read_history').getFullList({ expand: 'manga' })
		]);

	const latestUsers = userRecords.slice(0, 5);
	const latestComments = commentRecords.filter((c) => !c.isApproved).slice(0, 5);

	const mangaReadCounts = new Map<string, { title: string; reads: number }>();

	for (const record of readHistoryRecords) {
		if (record.expand?.manga) {
			const mangaId = record.expand.manga.id;
			const mangaTitle = record.expand.manga.title;

			if (!mangaReadCounts.has(mangaId)) {
				mangaReadCounts.set(mangaId, { title: mangaTitle, reads: 0 });
			}

			mangaReadCounts.get(mangaId)!.reads++;
		}
	}

	const mostReadMangas = Array.from(mangaReadCounts.values())
		.sort((a, b) => b.reads - a.reads)
		.slice(0, 5);

	return {
		stats: {
			mangas: mangaRecords.length,
			chapters: chapterRecords.length,
			users: userRecords.length,
			comments: commentRecords.length
		},
		latestUsers,
		latestComments,
		mostReadMangas
	};
};
