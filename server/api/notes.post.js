// server/api/notes.post.js
import db from '../db';

export default defineEventHandler(async (event) => {
    const { study_plan_id, book_id, other_content_id, content } = await readBody(event);
    return new Promise((resolve, reject) => {
        db.run(
            'INSERT INTO notes (study_plan_id, book_id, other_content_id, content) VALUES (?, ?, ?, ?)',
            [study_plan_id, book_id, other_content_id, content],
            function (err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, study_plan_id, book_id, other_content_id, content });
            }
        );
    });
});