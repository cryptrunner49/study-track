// server/api/books.post.js
import db from '../db';

export default defineEventHandler(async (event) => {
    const { study_plan_id, title, author, total_pages } = await readBody(event);

    // Basic validation
    if (!study_plan_id || !title || !total_pages) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Missing required fields: study_plan_id, title, and total_pages are required',
        });
    }

    return new Promise((resolve, reject) => {
        db.run(
            'INSERT INTO books (study_plan_id, title, author, total_pages) VALUES (?, ?, ?, ?)',
            [study_plan_id, title, author, total_pages],
            function (err) {
                if (err) {
                    console.error('Database error:', err.message); // Log the error for debugging
                    if (err.message.includes('FOREIGN KEY constraint failed')) {
                        reject(
                            createError({
                                statusCode: 400,
                                statusMessage: 'Invalid study_plan_id: No matching study plan exists',
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
                        id: this.lastID,
                        study_plan_id,
                        title,
                        author,
                        total_pages,
                        current_page: 0, // Default value from schema
                    });
                }
            }
        );
    });
});