// server/api/login.post.js
import db from '../db';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { defineEventHandler, readBody, createError, setCookie } from 'h3';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export default defineEventHandler(async (event) => {
    const { email, password } = await readBody(event);

    // Fetch user from the database
    const user = await new Promise((resolve, reject) =>
        db.get('SELECT * FROM Users WHERE email = ?', [email], (err, row) =>
            err ? reject(err) : resolve(row)
        )
    );

    if (!user || !(await bcrypt.compare(password, user.password))) {
        throw createError({ statusCode: 401, statusMessage: 'Invalid credentials' });
    }

    // Generate JWT token with no expiration
    const token = jwt.sign({ userId: user.userId, email: user.email }, JWT_SECRET);

    // Set the auth cookie with a very large maxAge (10 years)
    setCookie(event, 'auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 10 * 365 * 24 * 60 * 60, // 10 years in seconds
    });

    return { userId: user.userId, email: user.email };
});