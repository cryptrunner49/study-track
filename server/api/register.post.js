// server/api/register.post.js
import db from '~/server/db';
import bcrypt from 'bcrypt';
import { defineEventHandler, readBody, createError } from 'h3';

export default defineEventHandler(async (event) => {
  const { name, email, password } = await readBody(event);

  // Basic validation
  if (!name || !email || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required fields: name, email, and password are required',
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    return await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO Users (name, email, password) VALUES (?, ?, ?)',
        [name, email, hashedPassword],
        function (err) {
          if (err) {
            if (err.code === 'SQLITE_CONSTRAINT') {
              reject(
                createError({
                  statusCode: 409, // Conflict
                  statusMessage: 'Email already exists',
                })
              );
            } else {
              reject(
                createError({
                  statusCode: 500,
                  statusMessage: 'Database error: Failed to create user',
                })
              );
            }
          } else {
            resolve({ userId: this.lastID, name, email });
          }
        }
      );
    });
  } catch (err) {
    throw err; // Propagate the error to the client
  }
});