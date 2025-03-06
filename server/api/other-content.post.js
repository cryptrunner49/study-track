import db from '../db';
import { defineEventHandler, readBody, createError } from 'h3';
import { OtherType, OtherTypeValues } from '../types';

export default defineEventHandler(async (event) => {
    const user = event.context.user;
    if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
    }

    const { planId, title, otherType, link } = await readBody(event);

    if (!planId || !title || !otherType) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Missing required fields: planId, title, and otherType are required',
        });
    }

    if (!OtherTypeValues.includes(otherType)) {
        throw createError({
            statusCode: 400,
            statusMessage: `Invalid otherType. Must be one of: ${OtherTypeValues.join(', ')}`,
        });
    }

    // Validate planId ownership
    const plan = await new Promise((resolve, reject) =>
        db.get('SELECT userId FROM StudyPlans WHERE planId = ?', [planId], (err, row) =>
            err ? reject(err) : resolve(row)
        )
    );
    if (!plan || plan.userId !== user.userId) {
        throw createError({ statusCode: 403, statusMessage: 'Forbidden: Invalid planId' });
    }

    return new Promise((resolve, reject) => {
        db.run(
            'INSERT INTO OtherContent (planId, title, otherType, link) VALUES (?, ?, ?, ?)',
            [planId, title, otherType, link],
            function (err) {
                if (err) {
                    reject(createError({ statusCode: 500, statusMessage: 'Failed to create content' }));
                } else {
                    resolve({ contentId: this.lastID, planId, title, otherType, link });
                }
            }
        );
    });
});

export const middleware = ['api-auth'];