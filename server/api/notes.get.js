import db from '../db';
import { defineEventHandler, getQuery, createError } from 'h3';

export default defineEventHandler(async (event) => {
    const user = event.context.user;
    if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
    }

    const { planId, bookId, contentId } = getQuery(event);

    let query = `
        SELECT n.*
        FROM Notes n
        LEFT JOIN StudyPlans sp ON n.planId = sp.planId
        LEFT JOIN Books b ON n.bookId = b.bookId
        LEFT JOIN OtherContent oc ON n.contentId = oc.contentId
        LEFT JOIN StudyPlans sp2 ON b.planId = sp2.planId OR oc.planId = sp2.planId
        WHERE (sp.userId = ? OR sp2.userId = ? OR (n.planId IS NULL AND n.bookId IS NULL AND n.contentId IS NULL))
    `;
    const params = [user.userId, user.userId];

    if (planId) {
        query += ' AND n.planId = ?';
        params.push(Number(planId));
    }
    if (bookId) {
        query += ' AND n.bookId = ?';
        params.push(Number(bookId));
    }
    if (contentId) {
        query += ' AND n.contentId = ?';
        params.push(Number(contentId));
    }

    return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
            if (err) {
                console.error('Notes fetch error:', { message: err.message });
                return reject(createError({ statusCode: 500, statusMessage: `Database error: ${err.message}` }));
            }
            console.log('Notes fetched:', { count: rows.length });
            resolve(rows || []);
        });
    });
});

export const middleware = ['api-auth'];