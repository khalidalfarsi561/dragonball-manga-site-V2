import type { PageServerLoad } from './$types';
import type { EnrichedManga } from '$lib/types';

export const load: PageServerLoad = async ({ url, locals }) => {
	const searchTerm = url.searchParams.get('q') || '';
	// ✅ قراءة الفرز من الرابط وتطبيقه فعلياً
	const sortParam = url.searchParams.get('sort') || '-created';
	// نحن نسمح بالقيم الصالحة فقط: "-created" (الأحدث) أو "title" (أبجدي)
	const sort = sortParam === 'title' ? 'title' : sortParam === 'created' ? 'created' : '-created';
	const status = url.searchParams.get('status') || '';

	let filter = '';

	if (searchTerm) {
		filter = `title ~ "${searchTerm}"`;
	}

	if (status) {
		filter += filter ? ` && status = "${status}"` : `status = "${status}"`;
	}

	const options: {
		filter?: string;
		sort?: string;
	} = {};

	if (filter) {
		options.filter = filter;
	}

	// ✅ تطبيق الفرز على النتائج
	options.sort = sort;

	let records;
	try {
		records = await locals.pb.collection('mangas').getFullList(options);
	} catch (err) {
		console.warn('فشل جلب المانجا مع الفرز، جاري جلبها بدون فرز...', err);
		delete options.sort;
		records = await locals.pb.collection('mangas').getFullList(options);
	}

	// Process each record to add dynamic properties for the badges
	const enhancedRecords: EnrichedManga[] = records.map((record) => {
		// --- "New" badge logic disabled temporarily ---
		const isNew = false;

		// --- "Trending" badge logic ---
		const TRENDING_THRESHOLD = 5000; // Any manga over 5000 views is considered trending
		const isTrending = record.views > TRENDING_THRESHOLD;

		return {
			...record,
			cover_image_url: locals.pb.files.getURL(record, record.cover_image),
			isNew: isNew,
			isTrending: isTrending
		} as EnrichedManga; // Assert that the new object matches the EnrichedManga type
	});

	return {
		mangas: enhancedRecords,
		searchTerm: searchTerm || '',
		sort: sort,
		status: status
	};
};
