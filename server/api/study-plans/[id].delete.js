import db from '../../db';

import { defineEventHandler, getRouterParam } from 'h3';
import { getCurrentUser } from '~/server/utils/auth';

export default defineEventHandler((event) => {
    const userId = getCurrentUser(event);
    const id = getRouterParam(event, 'id');
    return new Promise((resolve, reject) => {
        db.run(
            'DELETE FROM StudyPlans WHERE planId = ? AND userId = ?',
            [id, userId],
            function (err) {
                if (err) {
                    reject(new Error('Database error'));
                } else if (this.changes === 0) {
                    reject(new Error('Study plan not found or unauthorized'));
                } else {
                    resolve({ message: 'Study plan deleted' });
                }
            }
        );
    });
});