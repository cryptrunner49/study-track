export default defineEventHandler(async (event) => {
    // Clear session or token (implementation depends on your auth system)
    setCookie(event, 'session', '', { maxAge: -1 });
    return { success: true };
});