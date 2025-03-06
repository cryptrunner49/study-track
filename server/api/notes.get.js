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
       LEFT JOIN StudyPlans sp ON n.planId = sp.planId
       LEFT JOIN Books b ON n.bookId = b.bookId
       LEFT JOIN OtherContent oc ON n.contentId = oc.contentId
       LEFT JOIN StudyPlans sp2 ON b.planId = sp2.planId OR oc.planId = sp2.planId
       WHERE sp.userId = ? OR sp2.userId = ?`,
            [user.userId, user.userId],
            (err, rows) => {
                if (err) {
                    console.error('SQL Error:', err.message);
                    reject(createError({ statusCode: 500, statusMessage: 'Failed to fetch notes: ' + err.message }));
                } else {
                    resolve(rows || []);
                }
            }
        );
    });
});

export const middleware = ['api-auth'];