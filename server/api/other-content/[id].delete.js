// server/api/other-content/[id].delete.js
import db from '../../db';

export default defineEventHandler((event) => {
    const id = event.context.params.id;
    return new Promise((resolve, reject) => {
        db.run('DELETE FROM other_content WHERE id = ?', [id], function (err) {
            if (err) reject(err);
            else if (this.changes === 0) reject(new Error('Content not found'));
            else resolve({ message: 'Content deleted' });
        });
    });
});