import db from '../../db';

export default defineEventHandler(async (event) => {
    const user = event.context.user;
    const noteId = event.context.params.id;
    const { content } = await readBody(event);

    return new Promise((resolve, reject) => {
        db.get(
            'SELECT planId FROM Notes WHERE noteId = ?',
            [noteId],
            (err, note) => {
                if (err) return reject(err);
                if (!note) return reject(createError({ statusCode: 404, statusMessage: 'Note not found' }));

                db.get(
                    'SELECT userId FROM StudyPlans WHERE planId = ?',
                    [note.planId],
                    (err, plan) => {
                        if (err) return reject(err);
                        if (!plan || plan.userId !== user.userId) {
                            return reject(createError({ statusCode: 403, statusMessage: 'Forbidden' }));
                        }

                        db.run(
                            'UPDATE Notes SET content = ? WHERE noteId = ?',
                            [content, noteId],
                            function (err) {
                                if (err) reject(err);
                                else if (this.changes === 0) reject(createError({ statusCode: 404, statusMessage: 'Note not found' }));
                                else resolve({ noteId, content });
                            }
                        );
                    }
                );
            }
        );
    });
});