import db from '../../db';
import { defineEventHandler, createError } from 'h3';

export default defineEventHandler(async (event) => {
    const user = event.context.user;
    if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
    }
    const readingPlanId = parseInt(event.context.params.bookId, 10);
    if (isNaN(readingPlanId)) {
        console.log(event.context.params);
        throw createError({ statusCode: 400, statusMessage: 'Invalid readingPlanId: ' + readingPlanId });
    }

    const readingPlan = await new Promise((resolve, reject) =>
        db.get(
            'SELECT bookId FROM ReadingPlans WHERE readingPlanId = ?',
            [readingPlanId],
            (err, row) => (err ? reject(err) : resolve(row))
        )
    );
    if (!readingPlan) {
        throw createError({ statusCode: 404, statusMessage: 'Reading plan not found' });
    }

    const book = await new Promise((resolve, reject) =>
        db.get(
            'SELECT planId FROM Books WHERE bookId = ?',
            [readingPlan.bookId],
            (err, row) => (err ? reject(err) : resolve(row))
        )
    );
    if (!book) {
        throw createError({ statusCode: 404, statusMessage: 'Associated book not found' });
    }

    const studyPlan = await new Promise((resolve, reject) =>
        db.get(
            'SELECT userId FROM StudyPlans WHERE planId = ?',
            [book.planId],
            (err, row) => (err ? reject(err) : resolve(row))
        )
    );
    if (!studyPlan || studyPlan.userId !== user.userId) {
        throw createError({ statusCode: 403, statusMessage: 'Forbidden' });
    }

    return new Promise((resolve, reject) => {
        db.run(
            'DELETE FROM ReadingPlans WHERE readingPlanId = ?',
            [readingPlanId],
            function (err) {
                if (err) {
                    reject(createError({ statusCode: 500, statusMessage: 'Failed to delete reading plan' }));
                } else if (this.changes === 0) {
                    reject(createError({ statusCode: 404, statusMessage: 'Reading plan not found' }));
                } else {
                    resolve({ message: 'Reading plan deleted successfully' });
                }
            }
        );
    });
});

export const middleware = ['api-auth'];