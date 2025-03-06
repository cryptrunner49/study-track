import db from '../../db';
import { defineEventHandler, readBody, createError } from 'h3';

export default defineEventHandler(async (event) => {
    const user = event.context.user;
    if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
    }

    const readingPlanId = event.context.params.id;
    const { hours, minutes, monday, tuesday, wednesday, thursday, friday, saturday, sunday } = await readBody(event);

    if (hours === undefined || minutes === undefined) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Missing required fields: hours and minutes are required',
        });
    }

    // Validate ownership
    const plan = await new Promise((resolve, reject) =>
        db.get(
            `SELECT rp.bookId, sp.userId
       FROM ReadingPlans rp
       JOIN Books b ON rp.bookId = b.bookId
       JOIN StudyPlans sp ON b.planId = sp.planId
       WHERE rp.readingPlanId = ?`,
            [readingPlanId],
            (err, row) => (err ? reject(err) : resolve(row))
        )
    );
    if (!plan) {
        throw createError({ statusCode: 404, statusMessage: 'Reading plan not found' });
    }
    if (plan.userId !== user.userId) {
        throw createError({ statusCode: 403, statusMessage: 'Forbidden' });
    }

    return new Promise((resolve, reject) => {
        db.run(
            `UPDATE ReadingPlans
       SET hours = ?, minutes = ?, monday = ?, tuesday = ?, wednesday = ?, thursday = ?, friday = ?, saturday = ?, sunday = ?
       WHERE readingPlanId = ?`,
            [hours, minutes, Number(monday), Number(tuesday), Number(wednesday), Number(thursday), Number(friday), Number(saturday), Number(sunday), readingPlanId],
            function (err) {
                if (err) {
                    reject(createError({ statusCode: 500, statusMessage: 'Failed to update reading plan' }));
                } else if (this.changes === 0) {
                    reject(createError({ statusCode: 404, statusMessage: 'Reading plan not found' }));
                } else {
                    resolve({
                        readingPlanId,
                        bookId: plan.bookId,
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