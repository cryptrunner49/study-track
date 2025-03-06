import db from '~/server/db';
import { defineEventHandler } from 'h3';
import { getCurrentUser } from '~/server/utils/auth';

export default defineEventHandler((event) => {
    const userId = getCurrentUser(event);
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM StudyPlans WHERE userId = ?', [userId], (err, rows) => {
            if (err) {
                reject(new Error('Database error'));
            } else {
                resolve(rows);
            }
        });
    });
});