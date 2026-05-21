import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { pb } from '$lib/pocketbase';
import { grantXp } from '../../../hooks.server';
import { z } from 'zod';

const updateProgressSchema = z.object({
	chapterId: z.string().trim().min(1, { message: 'chapterId is required' }),
	page: z.number().int().positive({ message: 'page must be a positive integer' })
});

type ParsedProgressBody = z.infer<typeof updateProgressSchema>;

async function getTotalPages(chapterId: string): Promise<number> {
	const pages = await pb.collection('pages').getFullList({
		filter: `chapter = "${chapterId}"`,
		fields: 'id'
	});

	return pages.length;
}

async function getReadHistoryRecord(userId: string, chapterId: string) {
	return pb
		.collection('read_history')
		.getFirstListItem(`user.id = "${userId}" && chapter.id = "${chapterId}"`);
}

async function createReadHistoryRecord(userId: string, chapterId: string, page: number) {
	const chapter = await pb.collection('chapters').getOne(chapterId, { fields: 'manga' });

	return pb.collection('read_history').create({
		user: userId,
		chapter: chapterId,
		manga: chapter.manga,
		last_page_read: page,
		completed_reading: false,
		reading_started_at: new Date().toISOString()
	});
}

async function updateProgressRecord(userId: string, chapterId: string, page: number) {
	const record = await getReadHistoryRecord(userId, chapterId);
	await pb.collection('read_history').update(record.id, { last_page_read: page });

	return record;
}

async function processCompletionReward(
	userId: string,
	record: { id: string; completed_reading?: boolean; reading_started_at?: string | null },
	chapterId: string,
	totalPages: number,
	page: number
) {
	if (record.completed_reading) return;

	const isAtEnd = page >= totalPages;
	if (!isAtEnd) return;

	const startedAt = record.reading_started_at ? new Date(record.reading_started_at).getTime() : 0;
	const timeSpentInSeconds = startedAt > 0 ? (Date.now() - startedAt) / 1000 : 0;
	const minimumRequiredSeconds = totalPages * 2;
	const isValidRead = timeSpentInSeconds >= minimumRequiredSeconds;

	await pb.collection('read_history').update(record.id, {
		completed_reading: true
	});

	if (!isValidRead) {
		console.warn(
			`Anti-cheat triggered for user ${userId} on chapter ${chapterId}: ${timeSpentInSeconds}s spent for ${totalPages} pages. XP withheld.`
		);
		return;
	}

	await grantXp(userId, 25);
}

async function handleProgressSubmission(userId: string, body: ParsedProgressBody) {
	const totalPages = await getTotalPages(body.chapterId);

	try {
		const record = await updateProgressRecord(userId, body.chapterId, body.page);
		await processCompletionReward(userId, record, body.chapterId, totalPages, body.page);

		return json({
			success: true,
			message: 'Progress updated.'
		});
	} catch (err: unknown) {
		if (
			typeof err === 'object' &&
			err !== null &&
			'status' in err &&
			(err as { status?: number }).status === 404
		) {
			const record = await createReadHistoryRecord(userId, body.chapterId, body.page);
			await processCompletionReward(userId, record, body.chapterId, totalPages, body.page);

			return json({
				success: true,
				message: 'Progress created.'
			});
		}

		throw err;
	}
}

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		throw error(401, 'غير مصرح به');
	}

	const rawBody = await request.json();

	try {
		const parsedBody = updateProgressSchema.parse(rawBody);
		return await handleProgressSubmission(locals.user.id, parsedBody);
	} catch (err: unknown) {
		if (err instanceof z.ZodError) {
			throw error(400, 'بيانات غير صالحة');
		}

		console.error('فشل في تحديث التقدم:', err);
		throw error(500, 'فشل تحديث سجل القراءة.');
	}
};
