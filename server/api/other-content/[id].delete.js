import db from '../../db';
import { defineEventHandler, createError } from 'h3';

export default defineEventHandler(async (event) => {
    const user = event.context.user;
    if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
    }

    const contentId = event.context.params.id;

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
            'DELETE FROM OtherContent WHERE contentId = ?',
            [contentId],
            function (err) {
                if (err) reject(createError({ statusCode: 500, statusMessage: 'Failed to delete content' }));
                else if (this.changes === 0) reject(createError({ statusCode: 404, statusMessage: 'Content not found' }));
                else resolve({ message: 'Content deleted' });
            }
        );
    });
});

export const middleware = ['api-auth'];