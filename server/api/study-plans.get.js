// server/api/study-plans.get.js
import db from '../db';
import { defineEventHandler, createError } from 'h3';

// Apply auth middleware to ensure the user is authenticated
export const middleware = ['api-auth'];

export default defineEventHandler((event) => {
    const user = event.context.user; // Set by the auth middleware
    console.log("User from auth middleware:", user);

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
                    return reject(
                        createError({
                            statusCode: 500,
                            statusMessage: 'Failed to fetch study plans: Database error',
                        })
                    );
                }
                resolve(rows || []);
            }
        );
    });
});
