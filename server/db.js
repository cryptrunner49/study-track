import sqlite3 from 'sqlite3';

// Open the database with WAL mode
const db = new sqlite3.Database('./studytrack.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Database connected');

    // Enable WAL mode
    db.run('PRAGMA journal_mode = WAL;', (err) => {
      if (err) {
        console.error('Error setting WAL mode:', err);
      } else {
        console.log('WAL mode enabled');
      }
    });

    // Ensure tables are created in order due to foreign keys
    db.serialize(() => {
      // Users table
      db.run(`
        CREATE TABLE IF NOT EXISTS Users (
          userId INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL
        )
      `);

      // StudyPlans table
      db.run(`
        CREATE TABLE IF NOT EXISTS StudyPlans (
          planId INTEGER PRIMARY KEY AUTOINCREMENT,
          userId INTEGER NOT NULL,
          title TEXT NOT NULL,
          description TEXT,
          FOREIGN KEY (userId) REFERENCES Users(userId)
        )
      `);

      // Books table
      db.run(`
        CREATE TABLE IF NOT EXISTS Books (
          bookId INTEGER PRIMARY KEY AUTOINCREMENT,
          planId INTEGER NOT NULL,
          title TEXT NOT NULL,
          author TEXT,
          totalPages INTEGER NOT NULL,
          currentChapter TEXT,
          currentPage INTEGER,
          FOREIGN KEY (planId) REFERENCES StudyPlans(planId)
        )
      `);

      // OtherContent table
      db.run(`
        CREATE TABLE IF NOT EXISTS OtherContent (
          contentId INTEGER PRIMARY KEY AUTOINCREMENT,
          planId INTEGER NOT NULL,
          title TEXT NOT NULL,
          otherType TEXT NOT NULL CHECK (otherType IN ('course', 'video', 'paper', 'blog', 'other')),
          link TEXT,
          progressNote TEXT,
          FOREIGN KEY (planId) REFERENCES StudyPlans(planId)
        )
      `);

      // ReadingPlans table
      db.run(`
        CREATE TABLE IF NOT EXISTS ReadingPlans (
          readingPlanId INTEGER PRIMARY KEY AUTOINCREMENT,
          bookId INTEGER NOT NULL,
          hours INTEGER NOT NULL,
          minutes INTEGER NOT NULL,
          monday INTEGER NOT NULL DEFAULT 0,
          tuesday INTEGER NOT NULL DEFAULT 0,
          wednesday INTEGER NOT NULL DEFAULT 0,
          thursday INTEGER NOT NULL DEFAULT 0,
          friday INTEGER NOT NULL DEFAULT 0,
          saturday INTEGER NOT NULL DEFAULT 0,
          sunday INTEGER NOT NULL DEFAULT 0,
          FOREIGN KEY (bookId) REFERENCES Books(bookId)
        )
      `);

      // Notes table
      db.run(`
        CREATE TABLE IF NOT EXISTS Notes (
          noteId INTEGER PRIMARY KEY AUTOINCREMENT,
          content TEXT NOT NULL,
          createdDate TEXT NOT NULL,
          bookId INTEGER,
          planId INTEGER,
          contentId INTEGER,
          FOREIGN KEY (bookId) REFERENCES Books(bookId) ON DELETE CASCADE,
          FOREIGN KEY (planId) REFERENCES StudyPlans(planId) ON DELETE CASCADE,
          FOREIGN KEY (contentId) REFERENCES OtherContent(contentId) ON DELETE CASCADE
        )
      `);

      // ReadingPlans table
      db.run(`
        CREATE TABLE IF NOT EXISTS ReadingPlans (
          readingPlanId INTEGER PRIMARY KEY AUTOINCREMENT,
          bookId INTEGER NOT NULL,
          hours INTEGER NOT NULL,
          minutes INTEGER NOT NULL,
          monday INTEGER NOT NULL DEFAULT 0,
          tuesday INTEGER NOT NULL DEFAULT 0,
          wednesday INTEGER NOT NULL DEFAULT 0,
          thursday INTEGER NOT NULL DEFAULT 0,
          friday INTEGER NOT NULL DEFAULT 0,
          saturday INTEGER NOT NULL DEFAULT 0,
          sunday INTEGER NOT NULL DEFAULT 0,
          FOREIGN KEY (bookId) REFERENCES Books(bookId)
        )
      `);
    });
  }
});

export default db;