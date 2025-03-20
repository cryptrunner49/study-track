import db from '../db';
import { AppError } from '../utils/errors';
import { OtherTypeValues } from '../types';

/**
 * Deletes a content item by its ID.
 * @param {number} contentId - The ID of the content to delete.
 * @param {Object} user - The user object.
 * @returns {Promise<Object>} - A success message.
 * @throws {AppError} - If the user is not authenticated or the content does not exist.
 */
export async function deleteOtherContent(contentId, user) {
    if (!user) throw new AppError(401, 'Unauthorized');

    const content = await db.otherContent.get(Number(contentId));
    if (!content) throw new AppError(404, 'Content not found');

    const plan = await db.studyPlans.get(content.planId);
    if (!plan || plan.userId !== user.userId) {
        throw new AppError(403, 'Forbidden');
    }

    await db.otherContent.delete(Number(contentId));
    return { message: 'Content deleted' };
}

/**
 * Retrieves a content item by its ID.
 * @param {number} contentId - The ID of the content to retrieve.
 * @param {Object} user - The user object.
 * @returns {Promise<Object>} - The content object.
 * @throws {AppError} - If the user is not authenticated or the content does not exist.
 */
export async function getOtherContent(contentId, user) {
    if (!user) throw new AppError(401, 'Unauthorized');

    const content = await db.otherContent.get(Number(contentId));
    if (!content) throw new AppError(404, 'Content not found or not authorized');

    const plan = await db.studyPlans.get(content.planId);
    if (!plan || plan.userId !== user.userId) {
        throw new AppError(403, 'Forbidden');
    }

    return content;
}

/**
 * Updates a content item's details.
 * @param {number} contentId - The ID of the content to update.
 * @param {Object} user - The user object.
 * @param {Object} updates - The updates to apply to the content.
 * @returns {Promise<Object>} - The updated content object.
 * @throws {AppError} - If the user is not authenticated or any required fields are missing.
 */
export async function updateOtherContent(contentId, user, { title, otherType, link }) {
    if (!user) throw new AppError(401, 'Unauthorized');
    if (!title || !otherType) {
        throw new AppError(400, 'Missing required fields: title and otherType are required');
    }
    if (!OtherTypeValues.includes(otherType)) {
        throw new AppError(400, `Invalid otherType. Must be one of: ${OtherTypeValues.join(', ')}`);
    }

    const content = await db.otherContent.get(Number(contentId));
    if (!content) throw new AppError(404, 'Content not found');

    const plan = await db.studyPlans.get(content.planId);
    if (!plan || plan.userId !== user.userId) {
        throw new AppError(403, 'Forbidden');
    }

    await db.otherContent.update(Number(contentId), { title, otherType, link });
    return { contentId, planId: content.planId, title, otherType, link };
}

/**
 * Retrieves all content items for a user, optionally filtered by a study plan.
 * @param {Object} user - The user object.
 * @param {number} [planId] - The ID of the study plan to filter by.
 * @returns {Promise<Array>} - An array of content objects.
 * @throws {AppError} - If the user is not authenticated.
 */
export async function getOtherContents(user, planId) {
    if (!user) throw new AppError(401, 'Unauthorized');

    let contents;
    if (planId) {
        const studyPlan = await db.studyPlans.get(Number(planId));
        if (!studyPlan || studyPlan.userId !== user.userId) {
            throw new AppError(403, 'Forbidden: Invalid plan ownership');
        }
        contents = await db.otherContent.where({ planId: Number(planId) }).toArray();
    } else {
        const plans = await db.studyPlans.where({ userId: user.userId }).toArray();
        const planIds = plans.map(p => p.planId);
        contents = await db.otherContent.where('planId').anyOf(planIds).toArray();
    }
    return contents || [];
}

/**
 * Creates a new content item.
 * @param {Object} user - The user object.
 * @param {Object} contentData - The data for the new content.
 * @returns {Promise<Object>} - The newly created content object.
 * @throws {AppError} - If the user is not authenticated or any required fields are missing.
 */
export async function createOtherContent(user, { planId, title, otherType, link }) {
    if (!user) throw new AppError(401, 'Unauthorized');
    if (!planId || !title || !otherType) {
        throw new AppError(400, 'Missing required fields: planId, title, and otherType are required');
    }
    if (!OtherTypeValues.includes(otherType)) {
        throw new AppError(400, `Invalid otherType. Must be one of: ${OtherTypeValues.join(', ')}`);
    }

    const plan = await db.studyPlans.get(Number(planId));
    if (!plan || plan.userId !== user.userId) {
        throw new AppError(403, 'Forbidden: Invalid or unauthorized planId');
    }

    const contentId = await db.otherContent.add({
        planId: Number(planId),
        title,
        otherType,
        link: link || null,
    });
    return { contentId, planId, title, otherType, link };
}
