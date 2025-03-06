import db from '~~/server/db';
import bcrypt from 'bcrypt';
import { defineEventHandler, readBody, setCookie } from 'h3';

export default defineEventHandler(async (event) => {
    const { email, password } = await readBody(event);
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM Users WHERE email = ?', [email], (err, user) => {
            if (err) {
                reject(new Error('Database error'));
            } else if (!user) {
                reject(new Error('Invalid credentials'));
            } else {
                bcrypt.compare(password, user.password, (err, match) => {
                    if (err || !match) {
                        reject(new Error('Invalid credentials'));
                    } else {
                        setCookie(event, 'userId', user.userId.toString(), { httpOnly: true });
                        resolve({ userId: user.userId, name: user.name, email: user.email });
                    }
                });
            }
        });
    });
});