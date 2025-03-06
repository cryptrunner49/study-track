import db from '../db';
import { defineEventHandler, readBody, createError } from 'h3';

export default defineEventHandler(async (event) => {
    const user = event.context.user;
    if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
    }

    const { bookId, hours, minutes, monday, tuesday, wednesday, thursday, friday, saturday, sunday } = await readBody(event);

    // Validation
    if (!bookId || hours === undefined || minutes === undefined) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Missing required fields: bookId, hours, and minutes are required',
        });
    }

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
        throw createError({ statusCode: 403, statusMessage: 'Forbidden: You do not own this book' });
    }

    // Check for existing reading plan
    const existingPlan = await new Promise((resolve, reject) =>
        db.get(
            'SELECT readingPlanId FROM ReadingPlans WHERE bookId = ?',
            [bookId],
            (err, row) => (err ? reject(err) : resolve(row))
        )
    );
    if (existingPlan) {
        throw createError({ statusCode: 409, statusMessage: 'Reading plan already exists for this book' });
    }

    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO ReadingPlans (bookId, hours, minutes, monday, tuesday, wednesday, thursday, friday, saturday, sunday)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [bookId, hours, minutes, Number(monday), Number(tuesday), Number(wednesday), Number(thursday), Number(friday), Number(saturday), Number(sunday)],
            function (err) {
                if (err) {
                    reject(createError({ statusCode: 500, statusMessage: 'Failed to create reading plan' }));
                } else {
                    resolve({
                        readingPlanId: this.lastID,
                        bookId,
                        hours,
                        minutes,
                        monday: Number(monday),
                        tuesday: Number(tuesday),
                        wednesday: Number(wednesday),
                        thursday: Number(thursday),
                        friday: Number(friday),
                        saturday: Number(saturday),
                        sunday: Number(sunday),
                    });
                }
            }
        );
    });
});

export const middleware = ['api-auth'];