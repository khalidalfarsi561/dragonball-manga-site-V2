// src/routes/+layout.server.ts
import { pb } from '$lib/pocketbase';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	const user = locals.user || null;

	// ✅ احتساب رابط الصورة الرمزية حتى تظهر في الهيدر
	if (user && user.avatar) {
		user.avatarUrl = pb.files.getURL(user, user.avatar, { thumb: '100x100' });
	}

	return {
		user,
		dragonBall: locals.dragonBall || null
	};
};
