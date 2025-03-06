import db from '~/server/db';
import { defineEventHandler, readBody } from 'h3';
import { getCurrentUser } from '~/server/utils/auth';

export default defineEventHandler(async (event) => {
    const userId = getCurrentUser(event);
    const { title, description } = await readBody(event);
    return new Promise((resolve, reject) => {
        db.run(
            'INSERT INTO StudyPlans (userId, title, description) VALUES (?, ?, ?)',
            [userId, title, description],
            function (err) {
                if (err) {
                    reject(new Error('Database error'));
                } else {
                    resolve({ planId: this.lastID, userId, title, description });
                }
            }
        );
    });
});