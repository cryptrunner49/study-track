import db from '../../db';
import { defineEventHandler, readBody, getRouterParam, createError } from 'h3';
import { getCurrentUser } from '~/server/utils/auth';

export default defineEventHandler(async (event) => {
    const userId = getCurrentUser(event);
    const id = getRouterParam(event, 'id');
    const { title, description } = await readBody(event);

    if (!userId) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
    }
    if (!title || !title.trim()) {
        throw createError({ statusCode: 400, statusMessage: 'Title is required and cannot be empty' });
    }

    return new Promise((resolve, reject) => {
        db.run(
            'UPDATE StudyPlans SET title = ?, description = ? WHERE planId = ? AND userId = ?',
            [title.trim(), description || null, id, userId],
            function (err) {
                if (err) {
                    console.error('PUT error:', { id, userId, message: err.message });
                    return reject(createError({ statusCode: 500, statusMessage: `Database error: ${err.message}` }));
                }
                if (this.changes === 0) {
                    console.warn('No study plan updated:', { id, userId });
                    return reject(createError({ statusCode: 404, statusMessage: 'Study plan not found or unauthorized' }));
                }
                console.log('Study plan updated:', { id, userId, title });
                resolve({ planId: id, title, description });
            }
        );
    });
});