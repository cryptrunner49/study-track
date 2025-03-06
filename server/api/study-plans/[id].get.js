import db from '../../db';

export default defineEventHandler((event) => {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM study_plans', [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
});