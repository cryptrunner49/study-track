import db from '../../db';
import { defineEventHandler, readBody, getRouterParam } from 'h3';
import { getCurrentUser } from '~/server/utils/auth';

export default defineEventHandler(async (event) => {
    const userId = getCurrentUser(event);
    const id = getRouterParam(event, 'id');
    const { title, description } = await readBody(event);
    return new Promise((resolve, reject) => {
        db.run(
            'UPDATE StudyPlans SET title = ?, description = ? WHERE planId = ? AND userId = ?',
            [title, description, id, userId],
            function (err) {
                if (err) {
                    reject(new Error('Database error'));
                } else if (this.changes === 0) {
                    reject(new Error('Study plan not found or unauthorized'));
                } else {
                    resolve({ planId: id, title, description });
                }
            }
        );
    });
});