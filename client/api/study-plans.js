import db from '../db';
import { AppError } from '../utils/errors';

export async function deleteStudyPlan(planId, user) {
    if (!user) throw new AppError(401, 'Unauthorized');

    const studyPlan = await db.studyPlans.get(Number(planId));
    if (!studyPlan || studyPlan.userId !== user.userId) {
        throw new AppError(404, 'Study plan not found or unauthorized');
    }

    await db.studyPlans.delete(Number(planId));
    return { message: 'Study plan deleted' };
}

export async function getStudyPlan(planId, user) {
    if (!user) throw new AppError(401, 'Unauthorized');

    const studyPlan = await db.studyPlans.get(Number(planId));
    if (!studyPlan || studyPlan.userId !== user.userId) {
        throw new AppError(404, 'Study plan not found or unauthorized');
    }

    return studyPlan;
}

export async function updateStudyPlan(planId, user, { title, description }) {
    if (!user) throw new AppError(401, 'Unauthorized');
    if (!title || !title.trim()) {
        throw new AppError(400, 'Title is required and cannot be empty');
    }

    const studyPlan = await db.studyPlans.get(Number(planId));
    if (!studyPlan || studyPlan.userId !== user.userId) {
        throw new AppError(404, 'Study plan not found or unauthorized');
    }

    await db.studyPlans.update(Number(planId), { title: title.trim(), description: description || null });
    return { planId, title, description };
}

export async function getStudyPlans(user) {
    if (!user) throw new AppError(401, 'Unauthorized');

    return await db.studyPlans.where({ userId: user.userId }).toArray();
}

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