import db from '../db';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { defineEventHandler, readBody, createError, setCookie } from 'h3';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export default defineEventHandler(async (event) => {
    const { email, password } = await readBody(event);

    if (!email || !password) {
        throw createError({ statusCode: 400, statusMessage: 'Email and password are required' });
    }

    const user = await new Promise((resolve, reject) => {
        db.get('SELECT * FROM Users WHERE email = ?', [email], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });

    if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'Invalid email or password' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
        throw createError({ statusCode: 401, statusMessage: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: user.userId, email: user.email }, JWT_SECRET, { expiresIn: '10y' });

    setCookie(event, 'auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 10 * 365 * 24 * 60 * 60, // 10 years
    });

    console.log('User logged in:', { userId: user.userId, email });
    return { userId: user.userId, email: user.email };
});