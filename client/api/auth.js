import db from '../db';
import { AppError } from '../utils/errors';
import { sha256 } from 'js-sha256'; // Lightweight client-side hashing

// Simple client-side token for demonstration (not secure for production without server validation)
const generateToken = (userId, email) => `${userId}-${email}-${Date.now()}`;

export async function login({ email, password }) {
    if (!email || !password) {
        throw new AppError(400, 'Email and password are required');
    }

    const hashedPassword = sha256(password); // Hash password client-side
    const user = await db.users.where({ email }).first();
    if (!user || user.password !== hashedPassword) {
        throw new AppError(401, 'Invalid email or password');
    }

    const token = generateToken(user.userId, user.email);
    return { user: { userId: user.userId, email: user.email }, token };
}

export async function register({ name, email, password }) {
    if (!name || !email || !password) {
        throw new AppError(400, 'Missing required fields: name, email, and password are required');
    }

    const existingUser = await db.users.where({ email }).first();
    if (existingUser) throw new AppError(409, 'Email already exists');

    const hashedPassword = sha256(password); // Hash password client-side
    const userId = await db.users.add({ name, email, password: hashedPassword });
    return { userId, name, email };
}

export function logout() {
    return { message: 'Logged out successfully' };
}