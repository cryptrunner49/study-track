import db from '../db';
import { defineEventHandler, readBody, createError } from 'h3';
import { getCurrentUser } from '~/server/utils/auth';

export default defineEventHandler(async (event) => {
    const userId = getCurrentUser(event);
    console.log('POST userId:', userId);
    const { title, description } = await readBody(event);

    if (!userId) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
    }
    if (!title) {
        throw createError({ statusCode: 400, statusMessage: 'Title is required' });
    }

    return new Promise((resolve, reject) => {
        db.run(
            'INSERT INTO StudyPlans (userId, title, description) VALUES (?, ?, ?)',
            [userId, title, description],
            function (err) {
                if (err) {
                    console.error('POST error:', { userId, title, message: err.message });
                    return reject(createError({ statusCode: 500, statusMessage: `Database error: ${err.message}` }));
                }
                console.log('Study plan created:', { planId: this.lastID, userId, title });
                resolve({ planId: this.lastID, userId, title, description });
            }
        );
    });
});