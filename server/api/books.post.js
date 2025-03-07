import db from '../db';

export default defineEventHandler(async (event) => {
    const { planId, title, author, totalPages } = await readBody(event);

    // Basic validation
    if (!planId || !title || !totalPages) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Missing required fields: planId, title, and totalPages are required',
        });
    }

    return new Promise((resolve, reject) => {
        db.run(
            'INSERT INTO Books (planId, title, author, totalPages) VALUES (?, ?, ?, ?)',
            [planId, title, author, totalPages],
            function (err) {
                if (err) {
                    console.error('Database error:', err.message);
                    if (err.message.includes('FOREIGN KEY constraint failed')) {
                        reject(
                            createError({
                                statusCode: 400,
                                statusMessage: 'Invalid planId: No matching study plan exists',
                            })
                        );
                    } else {
                        reject(
                            createError({
                                statusCode: 500,
                                statusMessage: 'Failed to create book: ' + err.message,
                            })
                        );
                    }
                } else {
                    resolve({
                        bookId: this.lastID,
                        planId,
                        title,
                        author,
                        totalPages,
                        currentPage: 0, // Default value from schema
                    });
                }
            }
        );
    });
});