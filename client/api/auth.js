import db from '../db';
import { AppError } from '../utils/errors';
import { sha256 } from 'js-sha256';

/**
 * Generates a simple client-side token for demonstration purposes.
 * @param {number} userId - The user's ID.
 * @param {string} email - The user's email.
 * @returns {string} - A generated token.
 */
const generateToken = (userId, email) => `${userId}-${email}-${Date.now()}`;

/**
 * Logs in a user with the provided email and password.
 * @param {Object} credentials - The user's email and password.
 * @returns {Promise<Object>} - The user object and token.
 * @throws {AppError} - If email or password is missing, or if authentication fails.
 */
export async function login({ email, password }) {
    if (!email || !password) {
        throw new AppError(400, 'Email and password are required');
    }

    const hashedPassword = sha256(password);
    const user = await db.users.where({ email }).first();
    if (!user || user.password !== hashedPassword) {
        throw new AppError(401, 'Invalid email or password');
    }

    const token = generateToken(user.userId, user.email);
    return { user: { userId: user.userId, email: user.email }, token };
}

/**
 * Registers a new user with the provided name, email, and password.
 * @param {Object} userData - The user's name, email, and password.
 * @returns {Promise<Object>} - The newly created user object.
 * @throws {AppError} - If any required fields are missing or if the email already exists.
 */
export async function register({ name, email, password }) {
    if (!name || !email || !password) {
        throw new AppError(400, 'Missing required fields: name, email, and password are required');
    }

    const existingUser = await db.users.where({ email }).first();
    if (existingUser) throw new AppError(409, 'Email already exists');

    const hashedPassword = sha256(password);
    const userId = await db.users.add({ name, email, password: hashedPassword });
    return { userId, name, email };
}

/**
 * Logs out the current user.
 */
export function logout() {
    return { message: 'Logged out successfully' };
}
