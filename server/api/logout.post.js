import { defineEventHandler, deleteCookie } from 'h3';

export default defineEventHandler(async (event) => {
    deleteCookie(event, 'auth_token');
    console.log('User logged out');
    return { message: 'Logged out successfully' };
});