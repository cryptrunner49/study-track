import db from '../../db';

export default defineEventHandler(async (event) => {
    const id = event.context.params.id;
    const { title, author, total_pages, current_page } = await readBody(event);
    return new Promise((resolve, reject) => {
        db.run(
            'UPDATE books SET title = ?, author = ?, total_pages = ?, current_page = ? WHERE id = ?',
            [title, author, total_pages, current_page, id],
            function (err) {
                if (err) reject(err);
                else if (this.changes === 0) reject(new Error('Book not found'));
                else resolve({ id, title, author, total_pages, current_page });
            }
        );
    });
});