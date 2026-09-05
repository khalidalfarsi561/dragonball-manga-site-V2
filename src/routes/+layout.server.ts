// src/routes/+layout.server.ts
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	const user = locals.user || null;

	// ✅ احتساب رابط الصورة الرمزية حتى تظهر في الهيدر
	if (user && user.avatar) {
		user.avatarUrl = locals.pb.files.getURL(user, user.avatar, { thumb: '100x100' });
	}

	return {
		user,
		dragonBall: locals.dragonBall || null
	};
};
