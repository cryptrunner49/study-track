// server/api/books.get.js
import db from "../db";

export default defineEventHandler(() => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM books", [], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
});