import db from '../../db';
import { defineEventHandler, createError } from 'h3';

export default defineEventHandler(async (event) => {
    const user = event.context.user;
    if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
    }

    const contentId = event.context.params.id;

    return new Promise((resolve, reject) => {
        db.get(
            `SELECT oc.*
             FROM OtherContent oc
             JOIN StudyPlans sp ON oc.planId = sp.planId
             WHERE oc.contentId = ? AND sp.userId = ?`,
            [contentId, user.userId],
            (err, row) => {
                if (err) {
                    console.error('Get OtherContent error:', { contentId, message: err.message });
                    reject(createError({ statusCode: 500, statusMessage: `Database error: ${err.message}` }));
                } else if (!row) {
                    reject(createError({ statusCode: 404, statusMessage: 'Content not found or not authorized' }));
                } else {
                    resolve(row);
                }
            }
        );
    });
});

export const middleware = ['api-auth'];