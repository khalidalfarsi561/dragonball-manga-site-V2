import { PUBLIC_POCKETBASE_URL } from '$env/static/public';
import { DRAGON_BALL_SECRET } from '$env/static/private';
import PocketBase from 'pocketbase';

export function createPbClient() {
	const pb = new PocketBase(PUBLIC_POCKETBASE_URL);
	pb.autoCancellation(false);
	return pb;
}

export function serializeRecord<T>(record: T): T {
	return structuredClone(record);
}

export async function createDragonBallToken(userId: string, ballNumber: number): Promise<string> {
	const payload = `${userId}${ballNumber}${DRAGON_BALL_SECRET}`;
	const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(payload));
	return Array.from(new Uint8Array(hashBuffer))
		.map((byte) => byte.toString(16).padStart(2, '0'))
		.join('');
}
