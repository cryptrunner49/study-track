import db from '../db';
import { AppError } from '../utils/errors';
import { OtherTypeValues } from '../types';

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