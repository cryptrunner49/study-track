import db from '../db';

export default defineEventHandler((event) => {
    const user = event.context.user;
    return new Promise((resolve, reject) => {
        db.all(
            `SELECT n.* 
       FROM Notes n
       JOIN StudyPlans sp ON n.planId = sp.planId
       WHERE sp.userId = ?`,
            [user.userId],
            (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            }
        );
    });
});