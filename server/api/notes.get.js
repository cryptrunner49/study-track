import db from '../db';
import { defineEventHandler, getQuery, createError } from 'h3';
import { getCurrentUser } from '~/server/utils/auth';

export default defineEventHandler(async (event) => {
    const userId = getCurrentUser(event);
    const { planId } = getQuery(event);

    if (!userId) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
    }
    if (!planId) {
        throw createError({ statusCode: 400, statusMessage: 'planId is required' });
    }

    return new Promise((resolve, reject) => {
        db.all(
            'SELECT * FROM Notes WHERE planId = ?',
            [planId],
            (err, rows) => {
                if (err) {
                    console.error('Notes fetch error:', { planId, message: err.message });
                    return reject(createError({ statusCode: 500, statusMessage: `Database error: ${err.message}` }));
                }
                // Verify ownership
                db.get(
                    'SELECT userId FROM StudyPlans WHERE planId = ?',
                    [planId],
                    (err, plan) => {
                        if (err || !plan || plan.userId !== userId) {
                            return reject(createError({ statusCode: 403, statusMessage: 'Forbidden: Invalid plan ownership' }));
                        }
                        console.log('Notes fetched:', { planId, count: rows.length });
                        resolve(rows || []);
                    }
                );
            }
        );
    });
});