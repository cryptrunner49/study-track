// server/api/notes.get.js
export default defineEventHandler(() => {
    // Mock data for notes
    const notes = [
        { noteId: 1, content: "Note 1", bookId: 1 },
        { noteId: 2, content: "Note 2", bookId: 1 },
    ];
    return notes;
});