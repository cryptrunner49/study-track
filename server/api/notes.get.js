import db from '../db';
import { defineEventHandler, createError } from 'h3';

export default defineEventHandler((event) => {
    const user = event.context.user;
    if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
    }
    return new Promise((resolve, reject) => {
        db.all(
            `SELECT n.* 
       FROM Notes n
       JOIN StudyPlans sp ON n.planId = sp.planId
       WHERE sp.userId = ?`,
            [user.userId],
            (err, rows) => {
                if (err) reject(createError({ statusCode: 500, statusMessage: 'Failed to fetch notes' }));
                else resolve(rows || []);
            }
        );
    });
});

export const middleware = ['api-auth'];