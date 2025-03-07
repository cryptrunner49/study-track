import db from '../db';
import { AppError } from '../utils/errors';

export async function deleteBook(bookId, user) {
    if (!user) throw new AppError(401, 'Unauthorized');

    const book = await db.books.get(Number(bookId));
    if (!book) throw new AppError(404, 'Book not found or not authorized');

    const studyPlan = await db.studyPlans.get(book.planId);
    if (!studyPlan || studyPlan.userId !== user.userId) {
        throw new AppError(403, 'Forbidden');
    }

    const notes = await db.notes.where({ bookId: Number(bookId) }).toArray();
    const readingPlans = await db.readingPlans.where({ bookId: Number(bookId) }).toArray();
    if (notes.length > 0 || readingPlans.length > 0) {
        throw new AppError(409, 'Cannot delete book: It is referenced by other records (e.g., notes or reading plans)');
    }

    await db.books.delete(Number(bookId));
    return { message: 'Book deleted successfully' };
}

export async function getBook(bookId, user) {
    if (!user) throw new AppError(401, 'Unauthorized');

    const book = await db.books.get(Number(bookId));
    if (!book) throw new AppError(404, 'Book not found or not authorized');

    const studyPlan = await db.studyPlans.get(book.planId);
    if (!studyPlan || studyPlan.userId !== user.userId) {
        throw new AppError(403, 'Forbidden');
    }

    return book;
}

export async function updateBook(bookId, user, { title, author, totalPages, currentPage }) {
    if (!user) throw new AppError(401, 'Unauthorized');
    if (!title || totalPages === undefined || currentPage === undefined) {
        throw new AppError(400, 'Missing required fields: title, totalPages, and currentPage are required');
    }

    const book = await db.books.get(Number(bookId));
    if (!book) throw new AppError(404, 'Book not found or not authorized');

    const studyPlan = await db.studyPlans.get(book.planId);
    if (!studyPlan || studyPlan.userId !== user.userId) {
        throw new AppError(403, 'Forbidden');
    }

    await db.books.update(Number(bookId), {
        title,
        author: author || null,
        totalPages: Number(totalPages),
        currentPage: Number(currentPage),
    });
    return { bookId, planId: book.planId, title, author, totalPages, currentPage };
}

export async function getBooks(user, planId) {
    if (!user) throw new AppError(401, 'Unauthorized');

    let books;
    if (planId) {
        const studyPlan = await db.studyPlans.get(Number(planId));
        if (!studyPlan || studyPlan.userId !== user.userId) {
            throw new AppError(403, 'Forbidden: Invalid plan ownership');
        }
        books = await db.books.where({ planId: Number(planId) }).toArray();
    } else {
        const plans = await db.studyPlans.where({ userId: user.userId }).toArray();
        const planIds = plans.map(p => p.planId);
        books = await db.books.where('planId').anyOf(planIds).toArray();
    }
    return books || [];
}

export async function createBook(user, { planId, title, author, totalPages }) {
    if (!user) throw new AppError(401, 'Unauthorized');
    if (!planId || !title || totalPages === undefined) {
        throw new AppError(400, 'Missing required fields: planId, title, and totalPages are required');
    }

    const studyPlan = await db.studyPlans.get(Number(planId));
    if (!studyPlan || studyPlan.userId !== user.userId) {
        throw new AppError(400, 'Invalid planId: No matching study plan exists');
    }

    const bookId = await db.books.add({
        planId: Number(planId),
        title,
        author: author || null,
        totalPages: Number(totalPages),
        currentPage: 0,
    });
    return { bookId, planId, title, author, totalPages, currentPage: 0 };
}