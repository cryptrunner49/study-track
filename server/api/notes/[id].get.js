import db from '../../db';

export default defineEventHandler((event) => {
  const user = event.context.user;
  const noteId = event.context.params.id;
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT n.* 
       FROM Notes n
       JOIN StudyPlans sp ON n.planId = sp.planId
       WHERE n.noteId = ? AND sp.userId = ?`,
      [noteId, user.userId],
      (err, row) => {
        if (err) reject(err);
        else if (!row) reject(createError({ statusCode: 404, statusMessage: 'Note not found or not authorized' }));
        else resolve(row);
      }
    );
  });
});