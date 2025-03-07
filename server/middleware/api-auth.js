import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export default defineEventHandler((event) => {
    const publicRoutes = ['/', '/login', '/api/login', '/api/logout', '/api/register'];
    if (publicRoutes.some((route) => event.node.req.url.startsWith(route))) {
        return; // Skip auth for public API routes
    }

    const token = getCookie(event, 'auth_token');
    console.log('Token received:', token); // Debug log

    if (!token) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized: No token provided',
        });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log('Token decoded:', decoded); // Debug log
        event.context.user = decoded; // { userId, email }
    } catch (err) {
        console.error('Token verification failed:', err);
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized: Invalid token',
        });
    }
});