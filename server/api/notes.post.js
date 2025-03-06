import db from '../db';

export default defineEventHandler(async (event) => {
    const user = event.context.user;
    const { planId, bookId, contentId, content } = await readBody(event);

    if (!planId || !content) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Missing required fields: planId and content are required',
        });
    }

    // Validate ownership
    if (planId) {
        const plan = await new Promise((resolve, reject) =>
            db.get('SELECT userId FROM StudyPlans WHERE planId = ?', [planId], (err, row) =>
                err ? reject(err) : resolve(row)
            )
        );
        if (!plan || plan.userId !== user.userId) {
            throw createError({ statusCode: 403, statusMessage: 'Forbidden: Invalid planId' });
        }
    }
    if (bookId) {
        const book = await new Promise((resolve, reject) =>
            db.get('SELECT planId FROM Books WHERE bookId = ?', [bookId], (err, row) =>
                err ? reject(err) : resolve(row)
            )
        );
        if (!book || !await checkPlanOwnership(book.planId, user.userId)) {
            throw createError({ statusCode: 403, statusMessage: 'Forbidden: Invalid bookId' });
        }
    }
    if (contentId) {
        const content = await new Promise((resolve, reject) =>
            db.get('SELECT planId FROM OtherContent WHERE contentId = ?', [contentId], (err, row) =>
                err ? reject(err) : resolve(row)
            )
        );
        if (!content || !await checkPlanOwnership(content.planId, user.userId)) {
            throw createError({ statusCode: 403, statusMessage: 'Forbidden: Invalid contentId' });
        }
    }

    return new Promise((resolve, reject) => {
        db.run(
            'INSERT INTO Notes (planId, bookId, contentId, content, createdDate) VALUES (?, ?, ?, ?, ?)',
            [planId, bookId, contentId, content, new Date().toISOString()],
            function (err) {
                if (err) reject(err);
                else resolve({ noteId: this.lastID, planId, bookId, contentId, content });
            }
        );
    });
});

async function checkPlanOwnership(planId, userId) {
    const plan = await new Promise((resolve, reject) =>
        db.get('SELECT userId FROM StudyPlans WHERE planId = ?', [planId], (err, row) =>
            err ? reject(err) : resolve(row)
        )
    );
    return plan && plan.userId === userId;
}