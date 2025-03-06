// server/api/notes/[id].get.js
import db from '../../db';

export default defineEventHandler((event) => {
  const id = event.context.params.id;
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM notes WHERE id = ?', [id], (err, row) => {
      if (err) reject(err);
      else if (!row) reject(new Error('Note not found'));
      else resolve(row);
    });
  });
});