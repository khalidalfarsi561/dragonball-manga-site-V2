// src/routes/admin/users/[userId]/+page.server.ts
import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	try {
		const user = await locals.pb.collection('users').getOne(params.userId);

		// جلب بيانات مرتبطة بالمستخدم
		const [favorites, readHistory, comments, userDragonBalls] = await Promise.all([
			locals.pb.collection('favorites').getFullList({
				filter: `user.id = "${params.userId}"`,
				expand: 'manga',
				sort: '-created'
			}),
			locals.pb.collection('read_history').getList(1, 10, {
				filter: `user.id = "${params.userId}"`,
				sort: '-created',
				expand: 'chapter,manga'
			}),
			// جلب آخر 10 تعليقات للمستخدم
			locals.pb.collection('comments').getList(1, 10, {
				filter: `user.id = "${params.userId}"`,
				sort: '-created',
				expand: 'chapter'
			}),
			locals.pb
				.collection('user_dragonballs')
				.getFirstListItem(`user.id = "${params.userId}"`)
				.catch(() => null)
		]);

		return {
			userDetails: user,
			stats: {
				totalFavorites: favorites.length,
				totalComments: comments.totalItems,
				totalChaptersRead: readHistory.totalItems
			},
			favorites,
			latestReadHistory: readHistory.items,
			latestComments: comments.items,
			collectedBalls: userDragonBalls?.collected_balls || []
		};
	} catch {
		throw error(404, 'المستخدم غير موجود');
	}
};

export const actions: Actions = {
	updateUser: async ({ request, params, locals }) => {
		const formData = await request.formData();
		const username = formData.get('username') as string;
		const title = formData.get('title') as string;

		try {
			await locals.pb.collection('users').update(params.userId, { username, title });
		} catch {
			return fail(400, {
				updateError: 'فشل تحديث المستخدم. قد يكون اسم المستخدم محجوزًا.'
			});
		}
		return { updateSuccess: 'تم تحديث بيانات المستخدم بنجاح.' };
	},

	requestPasswordReset: async ({ params, locals }) => {
		try {
			const user = await locals.pb.collection('users').getOne(params.userId);
			await locals.pb.collection('users').requestPasswordReset(user.email);
		} catch {
			return fail(500, {
				resetError: 'فشل إرسال بريد إعادة تعيين كلمة المرور.'
			});
		}
		return { resetSuccess: 'تم إرسال رابط إعادة التعيين إلى بريد المستخدم.' };
	}
};
