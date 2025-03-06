// server/api/other-content.post.js
import db from '../db';

export default defineEventHandler(async (event) => {
    const { study_plan_id, title, type, link } = await readBody(event);
    return new Promise((resolve, reject) => {
        db.run(
            'INSERT INTO other_content (study_plan_id, title, type, link) VALUES (?, ?, ?, ?)',
            [study_plan_id, title, type, link],
            function (err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, study_plan_id, title, type, link });
            }
        );
    });
});