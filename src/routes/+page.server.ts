import { pb } from '$lib/pocketbase';
import type { PageServerLoad } from './$types';
import type { EnrichedManga } from '$lib/types';

export const load: PageServerLoad = async ({ url }) => {
	const searchTerm = url.searchParams.get('q') || '';
	const sort = '';
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
	} = {};

	if (filter) {
		options.filter = filter;
	}

	const records = await pb.collection('mangas').getFullList(options);

	// Process each record to add dynamic properties for the badges
	const enhancedRecords: EnrichedManga[] = records.map((record) => {
		// --- "New" badge logic disabled temporarily ---
		const isNew = false;

		// --- "Trending" badge logic ---
		const TRENDING_THRESHOLD = 5000; // Any manga over 5000 views is considered trending
		const isTrending = record.views > TRENDING_THRESHOLD;

		return {
			...record,
			cover_image_url: pb.files.getURL(record, record.cover_image),
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
