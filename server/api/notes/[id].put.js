import db from '../../db';
import { defineEventHandler, readBody, createError } from 'h3';

export default defineEventHandler(async (event) => {
    const user = event.context.user;
    if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
    }

    const noteId = event.context.params.id;
    const { content, planId, bookId, contentId } = await readBody(event);

    if (!content || (!planId && !bookId && !contentId)) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Missing required fields: content and one of planId, bookId, or contentId are required',
        });
    }

    if ([planId, bookId, contentId].filter(Boolean).length > 1) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Only one of planId, bookId, or contentId can be set',
        });
    }

    let userIdCheck;
    if (planId) {
        userIdCheck = await new Promise((resolve, reject) =>
            db.get('SELECT userId FROM StudyPlans WHERE planId = ?', [planId], (err, row) =>
                err ? reject(err) : resolve(row)
            )
        );
    } else if (bookId) {
        userIdCheck = await new Promise((resolve, reject) =>
            db.get(
                'SELECT sp.userId FROM Books b JOIN StudyPlans sp ON b.planId = sp.planId WHERE b.bookId = ?',
                [bookId],
                (err, row) => (err ? reject(err) : resolve(row))
            )
        );
    } else if (contentId) {
        userIdCheck = await new Promise((resolve, reject) =>
            db.get(
                'SELECT sp.userId FROM OtherContent oc JOIN StudyPlans sp ON oc.planId = sp.planId WHERE oc.contentId = ?',
                [contentId],
                (err, row) => (err ? reject(err) : resolve(row))
            )
        );
    }

    if (!userIdCheck || userIdCheck.userId !== user.userId) {
        throw createError({ statusCode: 403, statusMessage: 'Forbidden: Invalid association ID' });
    }

    const note = await new Promise((resolve, reject) =>
        db.get('SELECT * FROM Notes WHERE noteId = ?', [noteId], (err, row) =>
            err ? reject(err) : resolve(row)
        )
    );
    if (!note) {
        throw createError({ statusCode: 404, statusMessage: 'Note not found' });
    }

    return new Promise((resolve, reject) => {
        db.run(
            'UPDATE Notes SET content = ?, planId = ?, bookId = ?, contentId = ? WHERE noteId = ?',
            [content, planId || null, bookId || null, contentId || null, noteId],
            function (err) {
                if (err) {
                    reject(createError({ statusCode: 500, statusMessage: 'Failed to update note: ' + err.message }));
                } else if (this.changes === 0) {
                    reject(createError({ statusCode: 404, statusMessage: 'Note not found' }));
                } else {
                    resolve({
                        noteId,
                        content,
                        createdDate: note.createdDate,
                        planId: planId || null,
                        bookId: bookId || null,
                        contentId: contentId || null,
                    });
                }
            }
        );
    });
});

export const middleware = ['api-auth'];