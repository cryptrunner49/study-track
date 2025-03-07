import db from '../../db';
import { defineEventHandler, getRouterParam, createError } from 'h3';
import { getCurrentUser } from '~/server/utils/auth';

export default defineEventHandler(async (event) => {
    const userId = getCurrentUser(event);
    console.log('DELETE userId:', userId);
    const id = getRouterParam(event, 'id');

    if (!userId) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
    }

    return new Promise((resolve, reject) => {
        db.run(
            'DELETE FROM StudyPlans WHERE planId = ? AND userId = ?',
            [id, userId],
            function (err) {
                if (err) {
                    console.error('DELETE error:', { id, userId, message: err.message });
                    return reject(createError({ statusCode: 500, statusMessage: `Database error: ${err.message}` }));
                }
                if (this.changes === 0) {
                    console.warn('No study plan deleted:', { id, userId });
                    return reject(createError({ statusCode: 404, statusMessage: 'Study plan not found or unauthorized' }));
                }
                console.log('Study plan deleted:', { id, userId });
                resolve({ message: 'Study plan deleted' });
            }
        );
    });
});