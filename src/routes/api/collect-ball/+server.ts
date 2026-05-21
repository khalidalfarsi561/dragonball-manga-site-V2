import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createDragonBallToken, createPbClient } from '$lib/server/pocketbase';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		throw error(401, 'يجب تسجيل الدخول أولاً.');
	}

	const pb = createPbClient();
	const formData = await request.formData();
	const ballNumber = Number(formData.get('ball_number'));
	const receivedToken = String(formData.get('find_token') || '');

	if (!Number.isInteger(ballNumber) || ballNumber < 1 || ballNumber > 7) {
		throw error(400, 'رقم الكرة غير صالح.');
	}

	const expectedToken = await createDragonBallToken(locals.user.id, ballNumber);
	if (receivedToken !== expectedToken) {
		throw error(400, 'محاولة غير صالحة. التوكن غير متطابق.');
	}

	try {
		let userBallsRecord;

		try {
			userBallsRecord = await pb
				.collection('user_dragonballs')
				.getFirstListItem(`user.id = "${locals.user.id}"`);
		} catch (err: unknown) {
			if (
				typeof err === 'object' &&
				err !== null &&
				'status' in err &&
				(err as { status?: number }).status === 404
			) {
				userBallsRecord = await pb.collection('user_dragonballs').create({
					user: locals.user.id,
					collected_balls: []
				});
			} else {
				throw err;
			}
		}

		const collected: number[] = userBallsRecord.collected_balls || [];

		if (collected.includes(ballNumber)) {
			return json({ success: true });
		}

		const updatedBalls = [...collected, ballNumber].sort((a, b) => a - b);
		await pb.collection('user_dragonballs').update(userBallsRecord.id, {
			collected_balls: updatedBalls
		});

		return json({ success: true, newBall: ballNumber });
	} catch (err) {
		console.error('API Error:', err);
		throw error(500, 'حدث خطأ أثناء حفظ الكرة في قاعدة البيانات.');
	}
};
