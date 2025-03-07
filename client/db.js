import Dexie from 'dexie';

class StudyTrackDatabase extends Dexie {
    constructor() {
        super('StudyTrackDatabase');
        this.version(1).stores({
            users: '++userId, name, email, password',
            studyPlans: '++planId, userId, title, description',
            books: '++bookId, planId, title, author, totalPages, currentPage',
            otherContent: '++contentId, planId, title, otherType, link',
            readingPlans: '++readingPlanId, bookId, hours, minutes, monday, tuesday, wednesday, thursday, friday, saturday, sunday',
            notes: '++noteId, content, createdDate, planId, bookId, contentId'
        });
        this.users = this.table('users');
        this.studyPlans = this.table('studyPlans');
        this.books = this.table('books');
        this.otherContent = this.table('otherContent');
        this.readingPlans = this.table('readingPlans');
        this.notes = this.table('notes');
    }
}

const db = new StudyTrackDatabase();
export default db;