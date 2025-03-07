import db from '../db';
import { defineEventHandler, createError } from 'h3';
import { getCurrentUser } from '~/server/utils/auth';

export default defineEventHandler(async (event) => {
    const userId = getCurrentUser(event);
    console.log('GET all userId:', userId);

    if (!userId) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
    }

    return new Promise((resolve, reject) => {
        db.all(
            'SELECT * FROM StudyPlans WHERE userId = ?',
            [userId],
            (err, rows) => {
                if (err) {
                    console.error('GET all error:', { userId, message: err.message });
                    return reject(createError({ statusCode: 500, statusMessage: `Database error: ${err.message}` }));
                }
                console.log('Study plans fetched:', { userId, count: rows.length });
                resolve(rows || []);
            }
        );
    });
});