import { getCookie } from 'h3';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export function getCurrentUser(event) {
    try {
        const token = getCookie(event, 'auth_token');
        if (!token) {
            console.warn('No auth token found');
            return null;
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        if (!decoded.userId) {
            console.warn('Invalid token: no userId', decoded);
            return null;
        }

        console.log('User authenticated:', decoded.userId);
        return decoded.userId;
    } catch (err) {
        console.error('Auth error:', err.message);
        return null;
    }
}