import db from '../../db';
import { defineEventHandler, readBody, createError } from 'h3';

export default defineEventHandler(async (event) => {
    const user = event.context.user;
    if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
    }

    const bookId = event.context.params.id;
    const { title, author, totalPages, currentPage } = await readBody(event);

    if (!title || totalPages === undefined || currentPage === undefined) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Missing required fields: title, totalPages, and currentPage are required',
        });
    }

    // Verify book exists and user owns it
    const book = await new Promise((resolve, reject) => {
        db.get(
            `SELECT b.bookId, b.planId
             FROM Books b
             JOIN StudyPlans sp ON b.planId = sp.planId
             WHERE b.bookId = ? AND sp.userId = ?`,
            [bookId, user.userId],
            (err, row) => {
                if (err) reject(err);
                else resolve(row);
            }
        );
    });

    if (!book) {
        throw createError({ statusCode: 404, statusMessage: 'Book not found or not authorized' });
    }

    return new Promise((resolve, reject) => {
        db.run(
            'UPDATE Books SET title = ?, author = ?, totalPages = ?, currentPage = ? WHERE bookId = ?',
            [title, author || null, Number(totalPages), Number(currentPage), bookId],
            function (err) {
                if (err) {
                    console.error('Update book error:', { bookId, message: err.message });
                    reject(createError({ statusCode: 500, statusMessage: `Failed to update book: ${err.message}` }));
                } else if (this.changes === 0) {
                    reject(createError({ statusCode: 404, statusMessage: 'Book not found' }));
                } else {
                    resolve({ bookId, planId: book.planId, title, author, totalPages, currentPage });
                }
            }
        );
    });
});

export const middleware = ['api-auth'];