import db from '../../db';
import { defineEventHandler, getRouterParam, createError } from 'h3';
import { getCurrentUser } from '~/server/utils/auth';

export default defineEventHandler(async (event) => {
    const userId = getCurrentUser(event);
    console.log('GET userId:', userId);
    const id = getRouterParam(event, 'id');

    if (!userId) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
    }

    return new Promise((resolve, reject) => {
        db.get(
            'SELECT * FROM StudyPlans WHERE planId = ? AND userId = ?',
            [id, userId],
            (err, row) => {
                if (err) {
                    console.error('GET error:', { id, userId, message: err.message });
                    return reject(createError({ statusCode: 500, statusMessage: `Database error: ${err.message}` }));
                }
                if (!row) {
                    console.warn('Study plan not found:', { id, userId });
                    return reject(createError({ statusCode: 404, statusMessage: 'Study plan not found or unauthorized' }));
                }
                console.log('Study plan fetched:', { id, userId });
                resolve(row);
            }
        );
    });
});