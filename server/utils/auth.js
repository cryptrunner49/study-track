import { getCookie } from 'h3';

export function getCurrentUser(event) {
    const userId = getCookie(event, 'userId');
    if (!userId) {
        throw new Error('Unauthorized');
    }
    return parseInt(userId, 10);
}