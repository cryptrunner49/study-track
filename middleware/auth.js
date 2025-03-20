/**
 * Middleware to handle authentication.
 * @param {Object} to - The route object.
 * @param {Object} from - The navigation from object.
 * @returns {void}
 */
export default defineNuxtRouteMiddleware((to, from) => {
    const userStore = useUserStore();

    // Allow access to public routes without redirecting
    const publicRoutes = ['/login', '/register'];
    if (publicRoutes.includes(to.path)) {
        return; // No redirect needed, proceed to the route
    }

    // Redirect to login only if user is not authenticated and not already on login/register
    if (!userStore.user) {
        console.log(`Auth middleware: Redirecting from ${to.path} to /login`);
        return navigateTo('/login');
    }

    // If authenticated, proceed to the requested route
    console.log(`Auth middleware: Allowing access to ${to.path}`);
});
