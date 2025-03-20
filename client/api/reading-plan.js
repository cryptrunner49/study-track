import db from '../db';
import { AppError } from '../utils/errors';

/**
 * Retrieves a reading plan by book ID.
 * @param {number} bookId - The ID of the book.
 * @param {Object} user - The user object.
 * @returns {Promise<Object>} - The reading plan object.
 * @throws {AppError} - If the user is not authenticated or the reading plan does not exist.
 */
export async function getReadingPlan(bookId, user) {
    if (!user) throw new AppError(401, 'Unauthorized');

    const book = await db.books.get(Number(bookId));
    if (!book) throw new AppError(404, 'Book not found');

    const plan = await db.studyPlans.get(book.planId);
    if (!plan || plan.userId !== user.userId) {
        throw new AppError(403, 'Forbidden');
    }

    const readingPlan = await db.readingPlans.where({ bookId: Number(bookId) }).first();
    return readingPlan || null;
}

/**
 * Deletes a reading plan by its ID.
 * @param {number} readingPlanId - The ID of the reading plan to delete.
 * @param {Object} user - The user object.
 * @returns {Promise<Object>} - A success message.
 * @throws {AppError} - If the user is not authenticated or the reading plan does not exist.
 */
export async function deleteReadingPlan(readingPlanId, user) {
    if (!user) throw new AppError(401, 'Unauthorized');

    const readingPlan = await db.readingPlans.get(Number(readingPlanId));
    if (!readingPlan) throw new AppError(404, 'Reading plan not found');

    const book = await db.books.get(readingPlan.bookId);
    if (!book) throw new AppError(404, 'Associated book not found');

    const studyPlan = await db.studyPlans.get(book.planId);
    if (!studyPlan || studyPlan.userId !== user.userId) {
        throw new AppError(403, 'Forbidden');
    }

    await db.readingPlans.delete(Number(readingPlanId));
    return { message: 'Reading plan deleted successfully' };
}

/**
 * Updates a reading plan's details.
 * @param {number} readingPlanId - The ID of the reading plan to update.
 * @param {Object} user - The user object.
 * @param {Object} updates - The updates to apply to the reading plan.
 * @returns {Promise<Object>} - The updated reading plan object.
 * @throws {AppError} - If the user is not authenticated or any required fields are missing.
 */
export async function updateReadingPlan(readingPlanId, user, { hours, minutes, monday, tuesday, wednesday, thursday, friday, saturday, sunday }) {
    if (!user) throw new AppError(401, 'Unauthorized');
    if (hours === undefined || minutes === undefined) {
        throw new AppError(400, 'Missing required fields: hours and minutes are required');
    }

    const readingPlan = await db.readingPlans.get(Number(readingPlanId));
    if (!readingPlan) throw new AppError(404, 'Reading plan not found');

    const book = await db.books.get(readingPlan.bookId);
    if (!book) throw new AppError(404, 'Associated book not found');

    const studyPlan = await db.studyPlans.get(book.planId);
    if (!studyPlan || studyPlan.userId !== user.userId) {
        throw new AppError(403, 'Forbidden');
    }

    await db.readingPlans.update(Number(readingPlanId), {
        hours: Number(hours),
        minutes: Number(minutes),
        monday: Number(monday || 0),
        tuesday: Number(tuesday || 0),
        wednesday: Number(wednesday || 0),
        thursday: Number(thursday || 0),
        friday: Number(friday || 0),
        saturday: Number(saturday || 0),
        sunday: Number(sunday || 0),
    });
    return {
        readingPlanId,
        bookId: readingPlan.bookId,
        hours,
        minutes,
        monday: Number(monday || 0),
        tuesday: Number(tuesday || 0),
        wednesday: Number(wednesday || 0),
        thursday: Number(thursday || 0),
        friday: Number(friday || 0),
        saturday: Number(saturday || 0),
        sunday: Number(sunday || 0),
    };
}

/**
 * Creates a new reading plan.
 * @param {Object} user - The user object.
 * @param {Object} readingPlanData - The data for the new reading plan.
 * @returns {Promise<Object>} - The newly created reading plan object.
 * @throws {AppError} - If the user is not authenticated or any required fields are missing.
 */
export async function createReadingPlan(user, { bookId, hours, minutes, monday, tuesday, wednesday, thursday, friday, saturday, sunday }) {
    if (!user) throw new AppError(401, 'Unauthorized');
    if (!bookId || hours === undefined || minutes === undefined) {
        throw new AppError(400, 'Missing required fields: bookId, hours, and minutes are required');
    }

    const book = await db.books.get(Number(bookId));
    if (!book) throw new AppError(404, 'Book not found');

    const plan = await db.studyPlans.get(book.planId);
    if (!plan || plan.userId !== user.userId) {
        throw new AppError(403, 'Forbidden: You do not own this book');
    }

    const existingPlan = await db.readingPlans.where({ bookId: Number(bookId) }).first();
    if (existingPlan) {
        throw new AppError(409, 'Reading plan already exists for this book');
    }

    const readingPlanId = await db.readingPlans.add({
        bookId: Number(bookId),
        hours: Number(hours),
        minutes: Number(minutes),
        monday: Number(monday || 0),
        tuesday: Number(tuesday || 0),
        wednesday: Number(wednesday || 0),
        thursday: Number(thursday || 0),
        friday: Number(friday || 0),
        saturday: Number(saturday || 0),
        sunday: Number(sunday || 0),
    });
    return {
        readingPlanId,
        bookId,
        hours,
        minutes,
        monday: Number(monday || 0),
        tuesday: Number(tuesday || 0),
        wednesday: Number(wednesday || 0),
        thursday: Number(thursday || 0),
        friday: Number(friday || 0),
        saturday: Number(saturday || 0),
        sunday: Number(sunday || 0),
    };
}
