import db from '../../db';
import { defineEventHandler, createError } from 'h3';

export default defineEventHandler(async (event) => {
    const user = event.context.user;
    if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
    }

    const noteId = event.context.params.id;

    const note = await new Promise((resolve, reject) =>
        db.get('SELECT planId, bookId, contentId FROM Notes WHERE noteId = ?', [noteId], (err, row) =>
            err ? reject(err) : resolve(row)
        )
    );
    if (!note) {
        throw createError({ statusCode: 404, statusMessage: 'Note not found' });
    }

    let userIdCheck;
    if (note.planId) {
        userIdCheck = await new Promise((resolve, reject) =>
            db.get('SELECT userId FROM StudyPlans WHERE planId = ?', [note.planId], (err, row) =>
                err ? reject(err) : resolve(row)
            )
        );
    } else if (note.bookId) {
        userIdCheck = await new Promise((resolve, reject) =>
            db.get(
                'SELECT sp.userId FROM Books b JOIN StudyPlans sp ON b.planId = sp.planId WHERE b.bookId = ?',
                [note.bookId],
                (err, row) => (err ? reject(err) : resolve(row))
            )
        );
    } else if (note.contentId) {
        userIdCheck = await new Promise((resolve, reject) =>
            db.get(
                'SELECT sp.userId FROM OtherContent oc JOIN StudyPlans sp ON oc.planId = sp.planId WHERE oc.contentId = ?',
                [note.contentId],
                (err, row) => (err ? reject(err) : resolve(row))
            )
        );
    }

    if (!userIdCheck || userIdCheck.userId !== user.userId) {
        throw createError({ statusCode: 403, statusMessage: 'Forbidden' });
    }

    return new Promise((resolve, reject) => {
        db.run('DELETE FROM Notes WHERE noteId = ?', [noteId], function (err) {
            if (err) {
                reject(createError({ statusCode: 500, statusMessage: 'Failed to delete note: ' + err.message }));
            } else if (this.changes === 0) {
                reject(createError({ statusCode: 404, statusMessage: 'Note not found' }));
            } else {
                resolve({ message: 'Note deleted' });
            }
        });
    });
});

export const middleware = ['api-auth'];