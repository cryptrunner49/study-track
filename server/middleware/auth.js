// server/middleware/auth.js
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export default defineEventHandler((event) => {
    const publicRoutes = ['/', '/login', '/api/login', '/api/logout'];
    if (publicRoutes.some((route) => event.node.req.url.startsWith(route))) {
        return; // Skip auth for public API routes
    }

    const token = getCookie(event, 'auth_token');
    if (!token) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized: No token provided',
        });
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