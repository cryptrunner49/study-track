// server/api/notes/[id].put.js
import db from '../../db';

export default defineEventHandler(async (event) => {
    const id = event.context.params.id;
    const { content } = await readBody(event);
    return new Promise((resolve, reject) => {
        db.run(
            'UPDATE notes SET content = ? WHERE id = ?',
            [content, id],
            function (err) {
                if (err) reject(err);
                else if (this.changes === 0) reject(new Error('Note not found'));
                else resolve({ id, content });
            }
        );
    });
});