import db from '~/server/db';
import bcrypt from 'bcrypt';
import { defineEventHandler, readBody } from 'h3';

export default defineEventHandler(async (event) => {
  const { name, email, password } = await readBody(event);
  const hashedPassword = await bcrypt.hash(password, 10);
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO Users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword],
      function (err) {
        if (err) {
          if (err.code === 'SQLITE_CONSTRAINT') {
            reject(new Error('Email already exists'));
          } else {
            reject(new Error('Database error'));
          }
        } else {
          resolve({ userId: this.lastID, name, email });
        }
      }
    );
  });
});