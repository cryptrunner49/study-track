import db from '../db';
import { defineEventHandler, getQuery, createError } from 'h3';
import { getCurrentUser } from '~/server/utils/auth';

export default defineEventHandler(async (event) => {
    const userId = getCurrentUser(event);
    const { planId } = getQuery(event);

    if (!userId) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
    }

    const query = planId
        ? 'SELECT * FROM Books WHERE planId = ?'
        : 'SELECT * FROM Books WHERE planId IN (SELECT planId FROM StudyPlans WHERE userId = ?)';
    const params = planId ? [planId] : [userId];

    return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
            if (err) {
                console.error('Books fetch error:', { planId, userId, message: err.message });
                return reject(createError({ statusCode: 500, statusMessage: `Database error: ${err.message}` }));
            }
            if (planId) {
                // Verify ownership for specific planId
                db.get('SELECT userId FROM StudyPlans WHERE planId = ?', [planId], (err, plan) => {
                    if (err || !plan || plan.userId !== userId) {
                        return reject(createError({ statusCode: 403, statusMessage: 'Forbidden: Invalid plan ownership' }));
                    }
                    console.log('Books fetched:', { planId, count: rows.length });
                    resolve(rows || []);
                });
            } else {
                console.log('All books fetched:', { userId, count: rows.length });
                resolve(rows || []);
            }
        });
    });
});