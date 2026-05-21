import { dev } from '$app/environment';
import type { Handle, HandleServerError } from '@sveltejs/kit';
import { createDragonBallToken, createPbClient } from '$lib/server/pocketbase';
import PocketBase from 'pocketbase';

export async function grantXp(
	userId: string,
	amount: number,
	client: PocketBase = createPbClient()
) {
	if (!userId || amount <= 0) return;

	try {
		const user = await client.collection('users').getOne(userId);
		const newXp = (user.xp || 0) + amount;
		let newLevel = user.power_level || 1;
		let xpToNext = user.xp_to_next_level || 100;

		if (newXp >= xpToNext) {
			newLevel += 1;
			const remainingXp = newXp - xpToNext;
			xpToNext = newLevel * 100;

			await client.collection('users').update(userId, {
				xp: remainingXp,
				power_level: newLevel,
				xp_to_next_level: xpToNext
			});
			return;
		}

		await client.collection('users').update(userId, { xp: newXp });
	} catch (err) {
		console.error('Error granting XP:', err);
	}
}

export const handle: Handle = async ({ event, resolve }) => {
	const requestPb = createPbClient();
	event.locals.pb = requestPb;

	requestPb.authStore.loadFromCookie(event.request.headers.get('cookie') || '');

	if (requestPb.authStore.isValid) {
		try {
			await requestPb.collection('users').authRefresh();
			event.locals.user = structuredClone(requestPb.authStore.model);
			event.locals.admin = !!requestPb.authStore.model?.isAdmin;
		} catch (error) {
			console.error('Auth refresh failed:', error);
			requestPb.authStore.clear();
			event.locals.user = null;
			event.locals.admin = false;
		}
	} else {
		event.locals.user = null;
		event.locals.admin = false;
	}

	const user = event.locals.user;

	if (user) {
		const now = new Date();
		const lastLogin = new Date((user as { last_login_xp?: string | null }).last_login_xp || 0);
		const oneDay = 24 * 60 * 60 * 1000;

		if (now.getTime() - lastLogin.getTime() > oneDay) {
			await grantXp(user.id, 15, requestPb);
			await requestPb.collection('users').update(user.id, { last_login_xp: now.toISOString() });
		}

		if (Math.random() < 0.02) {
			let userBallsRecord;

			try {
				userBallsRecord = await requestPb
					.collection('user_dragonballs')
					.getFirstListItem(`user.id = "${user.id}"`);
			} catch (err: unknown) {
				if (
					typeof err === 'object' &&
					err !== null &&
					'status' in err &&
					(err as { status?: number }).status === 404
				) {
					userBallsRecord = await requestPb.collection('user_dragonballs').create({
						user: user.id,
						collected_balls: []
					});
				}
			}

			if (userBallsRecord) {
				const collected: number[] = userBallsRecord.collected_balls || [];

				if (collected.length < 7) {
					const availableBalls = [1, 2, 3, 4, 5, 6, 7].filter((ball) => !collected.includes(ball));

					if (availableBalls.length > 0) {
						const ballToFind = availableBalls[Math.floor(Math.random() * availableBalls.length)];
						event.locals.dragonBall = {
							ball_number: ballToFind,
							find_token: await createDragonBallToken(user.id, ballToFind)
						};
					}
				}
			}
		}
	} else {
		event.locals.user = null;
	}

	const response = await resolve(event);
	response.headers.set(
		'set-cookie',
		requestPb.authStore.exportToCookie({
			path: '/',
			httpOnly: true,
			secure: !dev,
			sameSite: 'lax'
		})
	);

	return response;
};

export const handleError: HandleServerError = async ({ error }) => {
	console.error('An unexpected error occurred:', error);

	return {
		message: 'حدث خطأ غير متوقع في الخادم، الرجاء المحاولة مرة أخرى.',
		code: 'UNEXPECTED_ERROR'
	};
};
