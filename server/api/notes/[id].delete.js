// server/api/notes/[id].delete.js
import db from '../../db';

export default defineEventHandler((event) => {
    const id = event.context.params.id;
    return new Promise((resolve, reject) => {
        db.run('DELETE FROM notes WHERE id = ?', [id], function (err) {
            if (err) reject(err);
            else if (this.changes === 0) reject(new Error('Note not found'));
            else resolve({ message: 'Note deleted' });
        });
    });
});