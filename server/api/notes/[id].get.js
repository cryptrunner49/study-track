import db from '../../db';
import { defineEventHandler, createError } from 'h3';

export default defineEventHandler((event) => {
  const user = event.context.user;
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }

  const noteId = event.context.params.id;

  return new Promise((resolve, reject) => {
    db.get(
      `SELECT n.*
       FROM Notes n
       LEFT JOIN StudyPlans sp ON n.planId = sp.planId
       LEFT JOIN Books b ON n.bookId = b.bookId
       LEFT JOIN OtherContent oc ON n.contentId = oc.contentId
       LEFT JOIN StudyPlans sp2 ON b.planId = sp2.planId OR oc.planId = sp2.planId
       WHERE n.noteId = ? AND (sp.userId = ? OR sp2.userId = ?)`,
      [noteId, user.userId, user.userId],
      (err, row) => {
        if (err) {
          reject(createError({ statusCode: 500, statusMessage: 'Failed to fetch note: ' + err.message }));
        } else if (!row) {
          reject(createError({ statusCode: 404, statusMessage: 'Note not found or not authorized' }));
        } else {
          resolve(row);
        }
      }
    );
  });
});

export const middleware = ['api-auth'];