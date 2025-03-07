import db from '../../db';
import { defineEventHandler, createError } from 'h3';

export default defineEventHandler(async (event) => {
    const user = event.context.user;
    if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
    }

    const bookId = event.context.params.id;

    // Verify book exists and user owns it
    const book = await new Promise((resolve, reject) => {
        db.get(
            `SELECT b.bookId
             FROM Books b
             JOIN StudyPlans sp ON b.planId = sp.planId
             WHERE b.bookId = ? AND sp.userId = ?`,
            [bookId, user.userId],
            (err, row) => {
                if (err) {
                    reject(createError({ statusCode: 500, statusMessage: 'Database error: ' + err.message }));
                } else {
                    resolve(row);
                }
            }
        );
    });

    if (!book) {
        throw createError({ statusCode: 404, statusMessage: 'Book not found or not authorized' });
    }

    // Perform deletion
    return new Promise((resolve, reject) => {
        db.run('DELETE FROM Books WHERE bookId = ?', [bookId], function (err) {
            if (err) {
                console.error('Delete book error:', { bookId, message: err.message });
                if (err.message.includes('FOREIGN KEY constraint failed')) {
                    reject(
                        createError({
                            statusCode: 409,
                            statusMessage: 'Cannot delete book: It is referenced by other records (e.g., notes or reading plans)',
                        })
                    );
                } else {
                    reject(createError({ statusCode: 500, statusMessage: 'Failed to delete book: ' + err.message }));
                }
            } else if (this.changes === 0) {
                reject(createError({ statusCode: 404, statusMessage: 'Book not found' }));
            } else {
                resolve({ message: 'Book deleted successfully' });
            }
        });
    });
});

export const middleware = ['api-auth'];