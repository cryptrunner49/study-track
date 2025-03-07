import db from '../../db';
import { defineEventHandler, createError } from 'h3';

export default defineEventHandler(async (event) => {
    const user = event.context.user;
    if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
    }

    const bookId = event.context.params.bookId;

    // Validate book ownership
    const book = await new Promise((resolve, reject) =>
        db.get(
            'SELECT planId FROM Books WHERE bookId = ?',
            [bookId],
            (err, row) => (err ? reject(err) : resolve(row))
        )
    );
    if (!book) {
        throw createError({ statusCode: 404, statusMessage: 'Book not found' });
    }
    const plan = await new Promise((resolve, reject) =>
        db.get(
            'SELECT userId FROM StudyPlans WHERE planId = ?',
            [book.planId],
            (err, row) => (err ? reject(err) : resolve(row))
        )
    );
    if (!plan || plan.userId !== user.userId) {
        throw createError({ statusCode: 403, statusMessage: 'Forbidden' });
    }

    return new Promise((resolve, reject) => {
        db.get(
            'SELECT * FROM ReadingPlans WHERE bookId = ?',
            [bookId],
            (err, row) => {
                if (err) {
                    reject(createError({ statusCode: 500, statusMessage: 'Failed to fetch reading plan' }));
                } else {
                    resolve(row || null); // Return null if no plan exists
                }
            }
        );
    });
});

export const middleware = ['api-auth'];