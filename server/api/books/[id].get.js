import db from '../../db';
import { defineEventHandler, createError } from 'h3';

export default defineEventHandler(async (event) => {
    const user = event.context.user;
    if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
    }

    const bookId = event.context.params.id;

    return new Promise((resolve, reject) => {
        db.get(
            `SELECT b.*
       FROM Books b
       JOIN StudyPlans sp ON b.planId = sp.planId
       WHERE b.bookId = ? AND sp.userId = ?`,
            [bookId, user.userId],
            (err, row) => {
                if (err) {
                    reject(createError({ statusCode: 500, statusMessage: 'Failed to fetch book' }));
                } else if (!row) {
                    reject(createError({ statusCode: 404, statusMessage: 'Book not found or not authorized' }));
                } else {
                    resolve(row);
                }
            }
        );
    });
});

export const middleware = ['api-auth'];