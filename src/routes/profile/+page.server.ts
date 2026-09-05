// src/routes/profile/+page.server.ts
import { redirect, fail } from '@sveltejs/kit';
import { grantXp } from '../../hooks.server'; // ✅ لإضافة النقاط عبر منطق المستويات
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) throw redirect(303, '/login');

	const user = locals.user;
	if (user.avatar) {
		user.avatarUrl = locals.pb.files.getURL(user, user.avatar, { thumb: '100x100' });
	}

	const [favorites, readHistory, userDragonBalls] = await Promise.all([
		locals.pb.collection('favorites').getFullList({
			filter: `user.id = "${locals.user.id}"`,
			expand: 'manga'
		}),
		locals.pb.collection('read_history').getFullList({
			filter: `user = "${locals.user.id}"`,
			fields: 'id'
		}),
		locals.pb
			.collection('user_dragonballs')
			.getFirstListItem(`user.id = "${locals.user.id}"`)
			.catch(() => null)
	]);

	favorites.forEach((fav) => {
		if (fav.expand && fav.expand.manga) {
			fav.expand.manga.cover_image_url = locals.pb.files.getURL(
				fav.expand.manga,
				fav.expand.manga.cover_image
			);
		}
	});

	const stats = {
		totalFavorites: favorites.length,
		totalChaptersRead: readHistory.length
	};

	return {
		user, // تم استبدال locals.user بالبيانات الجديدة الكاملة
		favorites,
		stats,
		collectedBalls: userDragonBalls?.collected_balls || []
	};
};

// قائمة الأمنيات المتاحة
const allWishes = [
	{
		id: 'title_z_warrior',
		text: 'أريد لقب "محارب Z" الأسطوري!',
		action: { type: 'update_user', payload: { title: 'محارب Z' } }
	},
	{
		id: 'title_super_saiyan',
		text: 'أريد الوصول إلى قوة "السوبر سايان"!',
		action: { type: 'update_user', payload: { title: 'سوبر سايان' } }
	},
	{
		id: 'title_god_of_destruction',
		text: 'أريد الحصول على هيبة "حاكم دمار"!',
		action: { type: 'update_user', payload: { title: 'حاكم دمار' } }
	},
	{
		id: 'cosmetic_gold_name',
		text: 'أريد أن يظهر اسمي باللون الذهبي!',
		action: { type: 'update_user', payload: { cosmetic_name_color: '#FFD700' } }
	},
	{
		id: 'xp_boost',
		text: 'أتمنى الحصول على دفعة من نقاط الخبرة!',
		action: { type: 'update_user', payload: { 'xp+': 1000 } }
	}
];

export const actions: Actions = {
	logout: ({ cookies, locals }) => {
		locals.pb.authStore.clear();
		locals.user = null;
		locals.admin = false;
		cookies.set('pb_auth', '', {
			path: '/',
			expires: new Date(0)
		});
		// ✨ التحسين: إعادة التوجيه للصفحة الرئيسية مع رسالة تأكيد ✨
		throw redirect(303, '/?logout=true');
	},

	// ✨ التحسين: تمت إضافة ميزة تغيير كلمة المرور ✨
	changePassword: async ({ locals, request }) => {
		if (!locals.user) throw redirect(303, '/login');

		const data = await request.formData();
		const oldPassword = data.get('oldPassword') as string;
		const newPassword = data.get('newPassword') as string;
		const newPasswordConfirm = data.get('newPasswordConfirm') as string;

		if (!oldPassword || !newPassword || !newPasswordConfirm) {
			return fail(400, { passwordError: 'يرجى ملء جميع الحقول.' });
		}
		if (newPassword.length < 8) {
			return fail(400, { passwordError: 'يجب أن تتكون كلمة المرور الجديدة من 8 أحرف على الأقل.' });
		}
		if (newPassword !== newPasswordConfirm) {
			return fail(400, { passwordError: 'كلمتا المرور الجديدتان غير متطابقتين.' });
		}

		try {
			await locals.pb.collection('users').update(locals.user.id, {
				password: newPassword,
				passwordConfirm: newPasswordConfirm,
				oldPassword: oldPassword
			});
		} catch (err) {
			console.error(err);
			return fail(400, { passwordError: 'كلمة المرور القديمة غير صحيحة. حاول مرة أخرى.' });
		}

		return { passwordSuccess: 'تم تغيير كلمة المرور بنجاح!' };
	},

	updateAvatar: async ({ locals, request }) => {
		if (!locals.user) throw redirect(303, '/login');

		const formData = await request.formData();
		const avatar = formData.get('avatar') as File;

		if (!avatar || avatar.size === 0) {
			return fail(400, { avatarError: 'يرجى اختيار ملف صورة.' });
		}

		try {
			await locals.pb.collection('users').update(locals.user.id, { avatar });
		} catch (err) {
			console.error(err);
			return fail(500, { avatarError: 'فشل رفع الصورة. حاول مرة أخرى.' });
		}

		return { avatarSuccess: 'تم تحديث الصورة الرمزية بنجاح!' };
	},

	deleteAvatar: async ({ locals }) => {
		if (!locals.user) throw redirect(303, '/login');

		try {
			await locals.pb.collection('users').update(locals.user.id, { avatar: null });
		} catch (err) {
			console.error(err);
			return fail(500, { avatarError: 'فشل حذف الصورة.' });
		}

		return { avatarSuccess: 'تم حذف الصورة الرمزية.' };
	},

	// 1. الإجراء الأول: استدعاء التنين وعرض الأمنيات
	summonShenron: async ({ locals }) => {
		if (!locals.user) throw redirect(303, '/login');

		const userBallsRecord = await locals.pb
			.collection('user_dragonballs')
			.getFirstListItem(`user.id = "${locals.user.id}"`);

		if ((userBallsRecord.collected_balls || []).length < 7) {
			return fail(400, { error: 'يجب جمع الكرات السبع أولاً.' });
		}

		// اختيار 3 أمنيات عشوائية من القائمة
		// ✅ نسخة من المصفوفة حتى لا نغيّر الترتيب الأصلي بشكل دائم
		const shuffled = [...allWishes].sort(() => 0.5 - Math.random());
		const selectedWishes = shuffled.slice(0, 3);

		return { wishes: selectedWishes };
	},

	// 2. الإجراء الثاني: تحقيق الأمنية المختارة
	grantWish: async ({ locals, request }) => {
		if (!locals.user) throw redirect(303, '/login');

		const formData = await request.formData();
		const wishId = formData.get('wishId') as string;

		const selectedWish = allWishes.find((w) => w.id === wishId);

		if (!selectedWish) {
			return fail(400, { error: 'هذه الأمنية غير صالحة.' });
		}

		const userBallsRecord = await locals.pb
			.collection('user_dragonballs')
			.getFirstListItem(`user.id = "${locals.user.id}"`);

		// ✅ حماية إضافية: لا يمكن تحقيق الأمنية إلا بجمع الكرات السبع أولاً
		// (لا نعتمد على واجهة summonShenron فقط)
		if ((userBallsRecord.collected_balls || []).length < 7) {
			return fail(400, { error: 'يجب جمع الكرات السبع أولاً.' });
		}

		// تطبيق تأثير الأمنية
		if (selectedWish.action.type === 'update_user') {
			const payload = { ...selectedWish.action.payload };

			// ✅ أمنية "دفعة الخبرة" تُمرّر عبر grantXp لتحديث المستوى بشكل صحيح
			if ('xp+' in payload) {
				const xpAmount = Number(payload['xp+']) || 0;
				delete payload['xp+'];
				if (Object.keys(payload).length > 0) {
					await locals.pb.collection('users').update(locals.user.id, payload);
				}
				await grantXp(locals.user.id, xpAmount);
			} else {
				await locals.pb.collection('users').update(locals.user.id, payload);
			}
		}

		// إعادة تعيين كرات التنين
		await locals.pb.collection('user_dragonballs').update(userBallsRecord.id, {
			collected_balls: []
		});

		return { shenronWished: true, message: `تهانينا! لقد تحققت أمنيتك: "${selectedWish.text}"` };
	}
};
