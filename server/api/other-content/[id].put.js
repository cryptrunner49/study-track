import db from '../../db';
import { defineEventHandler, readBody, createError } from 'h3';
import { OtherTypeValues } from '../../types';

export default defineEventHandler(async (event) => {
    const user = event.context.user;
    if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
    }

    const contentId = event.context.params.id;
    const { title, otherType, link } = await readBody(event);

    if (!title || !otherType) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Missing required fields: title and otherType are required',
        });
    }

    if (!OtherTypeValues.includes(otherType)) {
        throw createError({
            statusCode: 400,
            statusMessage: `Invalid otherType. Must be one of: ${OtherTypeValues.join(', ')}`,
        });
    }

    const content = await new Promise((resolve, reject) =>
        db.get(
            'SELECT planId FROM OtherContent WHERE contentId = ?',
            [contentId],
            (err, row) => (err ? reject(err) : resolve(row))
        )
    );
    if (!content) {
        throw createError({ statusCode: 404, statusMessage: 'Content not found' });
    }

    const plan = await new Promise((resolve, reject) =>
        db.get(
            'SELECT userId FROM StudyPlans WHERE planId = ?',
            [content.planId],
            (err, row) => (err ? reject(err) : resolve(row))
        )
    );
    if (!plan || plan.userId !== user.userId) {
        throw createError({ statusCode: 403, statusMessage: 'Forbidden' });
    }

    return new Promise((resolve, reject) => {
        db.run(
            'UPDATE OtherContent SET title = ?, otherType = ?, link = ? WHERE contentId = ?',
            [title, otherType, link, contentId],
            function (err) {
                if (err) reject(createError({ statusCode: 500, statusMessage: 'Failed to update content' }));
                else if (this.changes === 0) reject(createError({ statusCode: 404, statusMessage: 'Content not found' }));
                else resolve({ contentId, planId: content.planId, title, otherType, link });
            }
        );
    });
});

export const middleware = ['api-auth'];