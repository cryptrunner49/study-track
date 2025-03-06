// server/api/other-content/[id].put.js
import db from '../../db';

export default defineEventHandler(async (event) => {
    const id = event.context.params.id;
    const { title, type, link } = await readBody(event);
    return new Promise((resolve, reject) => {
        db.run(
            'UPDATE other_content SET title = ?, type = ?, link = ? WHERE id = ?',
            [title, type, link, id],
            function (err) {
                if (err) reject(err);
                else if (this.changes === 0) reject(new Error('Content not found'));
                else resolve({ id, title, type, link });
            }
        );
    });
});