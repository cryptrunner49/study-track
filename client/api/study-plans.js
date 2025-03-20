import db from '../db';
import { AppError } from '../utils/errors';

/**
 * Deletes a study plan by its ID.
 * @param {number} planId - The ID of the study plan to delete.
 * @param {Object} user - The user object.
 * @returns {Promise<Object>} - A success message.
 * @throws {AppError} - If the user is not authenticated or the study plan does not exist.
 */
export async function deleteStudyPlan(planId, user) {
    if (!user) throw new AppError(401, 'Unauthorized');

    const studyPlan = await db.studyPlans.get(Number(planId));
    if (!studyPlan || studyPlan.userId !== user.userId) {
        throw new AppError(404, 'Study plan not found or unauthorized');
    }

    await db.studyPlans.delete(Number(planId));
    return { message: 'Study plan deleted' };
}

/**
 * Retrieves a study plan by its ID.
 * @param {number} planId - The ID of the study plan to retrieve.
 * @param {Object} user - The user object.
 * @returns {Promise<Object>} - The study plan object.
 * @throws {AppError} - If the user is not authenticated or the study plan does not exist.
 */
export async function getStudyPlan(planId, user) {
    if (!user) throw new AppError(401, 'Unauthorized');

    const studyPlan = await db.studyPlans.get(Number(planId));
    if (!studyPlan || studyPlan.userId !== user.userId) {
        throw new AppError(404, 'Study plan not found or unauthorized');
    }

    return studyPlan;
}

/**
 * Updates a study plan's details.
 * @param {number} planId - The ID of the study plan to update.
 * @param {Object} user - The user object.
 * @param {Object} updates - The updates to apply to the study plan.
 * @returns {Promise<Object>} - The updated study plan object.
 * @throws {AppError} - If the user is not authenticated or any required fields are missing.
 */
export async function updateStudyPlan(planId, user, { title, description }) {
    if (!user) throw new AppError(401, 'Unauthorized');
    if (!title || !title.trim()) {
        throw new AppError(400, 'Title cannot be empty');
    }

    const studyPlan = await db.studyPlans.get(Number(planId));
    if (!studyPlan || studyPlan.userId !== user.userId) {
        throw new AppError(404, 'Study plan not found or unauthorized');
    }

    await db.studyPlans.update(Number(planId), { title: title.trim(), description: description || null });
    return { planId, title, description };
}

/**
 * Retrieves all study plans for a user.
 * @param {Object} user - The user object.
 * @returns {Promise<Array>} - An array of study plan objects.
 * @throws {AppError} - If the user is not authenticated.
 */
export async function getStudyPlans(user) {
    if (!user) throw new AppError(401, 'Unauthorized');

    return await db.studyPlans.where({ userId: user.userId }).toArray();
}

/**
 * Creates a new study plan.
 * @param {Object} user - The user object.
 * @param {Object} studyPlanData - The data for the new study plan.
 * @returns {Promise<Object>} - The newly created study plan object.
 * @throws {AppError} - If the user is not authenticated or any required fields are missing.
 */
export async function createStudyPlan(user, { title, description }) {
    if (!user) throw new AppError(401, 'Unauthorized');
    if (!title) throw new AppError(400, 'Title is required');

    const planId = await db.studyPlans.add({
        userId: user.userId,
        title,
        description: description || null,
    });
    return { planId, userId: user.userId, title, description };
}
