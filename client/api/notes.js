import db from '../db';
import { AppError } from '../utils/errors';

export async function deleteNote(noteId, user) {
    if (!user) throw new AppError(401, 'Unauthorized');

    const note = await db.notes.get(Number(noteId));
    if (!note) throw new AppError(404, 'Note not found');

    let userIdCheck;
    if (note.planId) {
        userIdCheck = await db.studyPlans.get(note.planId);
    } else if (note.bookId) {
        const book = await db.books.get(note.bookId);
        userIdCheck = book ? await db.studyPlans.get(book.planId) : null;
    } else if (note.contentId) {
        const content = await db.otherContent.get(note.contentId);
        userIdCheck = content ? await db.studyPlans.get(content.planId) : null;
    }

    if (!userIdCheck || userIdCheck.userId !== user.userId) {
        throw new AppError(403, 'Forbidden');
    }

    await db.notes.delete(Number(noteId));
    return { message: 'Note deleted' };
}

export async function getNote(noteId, user) {
    if (!user) throw new AppError(401, 'Unauthorized');

    const note = await db.notes.get(Number(noteId));
    if (!note) throw new AppError(404, 'Note not found or not authorized');

    let userIdCheck;
    if (note.planId) {
        userIdCheck = await db.studyPlans.get(note.planId);
    } else if (note.bookId) {
        const book = await db.books.get(note.bookId);
        userIdCheck = book ? await db.studyPlans.get(book.planId) : null;
    } else if (note.contentId) {
        const content = await db.otherContent.get(note.contentId);
        userIdCheck = content ? await db.studyPlans.get(content.planId) : null;
    }

    if (!userIdCheck || userIdCheck.userId !== user.userId) {
        throw new AppError(403, 'Forbidden');
    }

    return note;
}

export async function updateNote(noteId, user, { content, planId, bookId, contentId }) {
    if (!user) throw new AppError(401, 'Unauthorized');
    if (!content || (!planId && !bookId && !contentId)) {
        throw new AppError(400, 'Missing required fields: content and one of planId, bookId, or contentId are required');
    }
    if ([planId, bookId, contentId].filter(Boolean).length > 1) {
        throw new AppError(400, 'Only one of planId, bookId, or contentId can be set');
    }

    const note = await db.notes.get(Number(noteId));
    if (!note) throw new AppError(404, 'Note not found');

    let userIdCheck;
    if (planId) {
        userIdCheck = await db.studyPlans.get(Number(planId));
    } else if (bookId) {
        const book = await db.books.get(Number(bookId));
        userIdCheck = book ? await db.studyPlans.get(book.planId) : null;
    } else if (contentId) {
        const content = await db.otherContent.get(Number(contentId));
        userIdCheck = content ? await db.studyPlans.get(content.planId) : null;
    }

    if (!userIdCheck || userIdCheck.userId !== user.userId) {
        throw new AppError(403, 'Forbidden: Invalid association ID');
    }

    await db.notes.update(Number(noteId), {
        content,
        planId: planId ? Number(planId) : null,
        bookId: bookId ? Number(bookId) : null,
        contentId: contentId ? Number(contentId) : null,
    });
    return { noteId, content, createdDate: note.createdDate, planId, bookId, contentId };
}

export async function getNotes(user, { planId, bookId, contentId }) {
    if (!user) throw new AppError(401, 'Unauthorized');

    let notes = await db.notes.toArray();
    notes = notes.filter(note => {
        if (planId && note.planId !== Number(planId)) return false;
        if (bookId && note.bookId !== Number(bookId)) return false;
        if (contentId && note.contentId !== Number(contentId)) return false;
        return true;
    });

    const filteredNotes = [];
    for (const note of notes) {
        let userIdCheck;
        if (note.planId) {
            userIdCheck = await db.studyPlans.get(note.planId);
        } else if (note.bookId) {
            const book = await db.books.get(note.bookId);
            userIdCheck = book ? await db.studyPlans.get(book.planId) : null;
        } else if (note.contentId) {
            const content = await db.otherContent.get(note.contentId);
            userIdCheck = content ? await db.studyPlans.get(content.planId) : null;
        }
        if (userIdCheck && userIdCheck.userId === user.userId) {
            filteredNotes.push(note);
        }
    }
    return filteredNotes;
}

export async function createNote(user, { content, planId, bookId, contentId }) {
    if (!user) throw new AppError(401, 'Unauthorized');
    if (!content || (!planId && !bookId && !contentId)) {
        throw new AppError(400, 'Missing required fields: content and one of planId, bookId, or contentId are required');
    }
    if ([planId, bookId, contentId].filter(Boolean).length > 1) {
        throw new AppError(400, 'Only one of planId, bookId, or contentId can be set');
    }

    let userIdCheck;
    if (planId) {
        userIdCheck = await db.studyPlans.get(Number(planId));
    } else if (bookId) {
        const book = await db.books.get(Number(bookId));
        userIdCheck = book ? await db.studyPlans.get(book.planId) : null;
    } else if (contentId) {
        const content = await db.otherContent.get(Number(contentId));
        userIdCheck = content ? await db.studyPlans.get(content.planId) : null;
    }

    if (!userIdCheck || userIdCheck.userId !== user.userId) {
        throw new AppError(403, 'Forbidden: Invalid association ID');
    }

    const noteId = await db.notes.add({
        content,
        createdDate: new Date().toISOString(),
        planId: planId ? Number(planId) : null,
        bookId: bookId ? Number(bookId) : null,
        contentId: contentId ? Number(contentId) : null,
    });
    return { noteId, content, createdDate: new Date().toISOString(), planId, bookId, contentId };
}