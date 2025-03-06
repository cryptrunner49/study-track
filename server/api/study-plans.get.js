// server/api/study-plans.get.js
import db from '../db';
import { defineEventHandler, createError } from 'h3';

export default defineEventHandler((event) => {
    const user = event.context.user; // Set by auth middleware

    if (!user) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized: User not authenticated',
        });
    }

    return new Promise((resolve, reject) => {
        db.all(
            'SELECT * FROM StudyPlans WHERE userId = ?',
            [user.userId],
            (err, rows) => {
                if (err) {
                    console.error('Database error:', err);
                    reject(
                        createError({
                            statusCode: 500,
                            statusMessage: 'Failed to fetch study plans: Database error',
                        })
                    );
                } else {
                    resolve(rows || []);
                }
            }
        );
    });
});

// Apply auth middleware
export const middleware = ['api-auth'];