import { getCookie, createError, defineEventHandler } from 'h3';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export default defineEventHandler((event) => {
    const publicRoutes = ['/api/login', '/api/logout'];
    if (publicRoutes.some((route) => event.node.req.url.startsWith(route))) {
        return;
    }

    const publicPages = ['/', '/login'];
    const token = getCookie(event, 'auth_token');
    if (!token) {
        if (publicPages.some((route) => event.node.req.url.startsWith(route))) {
            return;
        } else {
            throw createError({
                statusCode: 401,
                statusMessage: 'Unauthorized: No token provided',
            });
        }
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        event.context.user = decoded;
    } catch (err) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized: Invalid token',
        });
    }
});
