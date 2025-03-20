/**
 * Custom error class for application-specific errors.
 * Extends the built-in JavaScript Error class to include an HTTP status code.
 */
export class AppError extends Error {
    /**
     * Constructs a new AppError instance.
     *
     * @param {number} statusCode - The HTTP status code associated with the error.
     * @param {string} message - The error message describing the issue.
     */
    constructor(statusCode, message) {
        // Call the parent constructor with the provided message
        super(message);

        // Set the name of the error to 'AppError' for identification
        this.name = 'AppError';

        // Assign the HTTP status code to the instance
        this.statusCode = statusCode;
    }
}
