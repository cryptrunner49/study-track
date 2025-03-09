<template>
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <!-- Welcome Page for Non-Logged-In Users -->
        <div v-if="!userStore.user" class="flex flex-col items-center justify-center min-h-screen px-4 text-center">
            <h1
                class="text-5xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent leading-tight">
                Welcome to StudyTrack
            </h1>
            <p class="text-xl md:text-2xl mb-10 max-w-2xl text-gray-600 dark:text-gray-300 leading-relaxed">
                Your ultimate companion for organizing reading and study goals. Track progress, manage content, and
                achieve your learning objectives.
            </p>
            <div class="flex flex-col sm:flex-row gap-4">
                <NuxtLink to="/login"
                    class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-all duration-300 transform hover:-translate-y-1">
                    Login
                </NuxtLink>
                <NuxtLink to="/register"
                    class="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-all duration-300 transform hover:-translate-y-1">
                    Register
                </NuxtLink>
            </div>
        </div>

        <!-- Dashboard for Logged-In Users -->
        <div v-else class="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center mb-10">
                <h1 class="text-4xl font-bold dark:text-white">Welcome back, {{ userStore.user?.name || 'User' }}</h1>
                <button @click="loadDashboardData"
                    class="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                    title="Refresh dashboard">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                </button>
            </div>

            <!-- Skeleton Loading -->
            <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div v-for="n in 3" :key="n" class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md animate-pulse">
                    <div class="h-7 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-3"></div>
                    <div class="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                </div>
            </div>

            <!-- Error Display -->
            <div v-else-if="error" class="p-6 bg-red-50 dark:bg-red-900/50 rounded-xl shadow-md text-center">
                <p class="text-red-700 dark:text-red-300 font-medium mb-4">{{ error }}</p>
                <button @click="loadDashboardData"
                    class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-200">
                    Retry
                </button>
            </div>

            <!-- Dashboard Content -->
            <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div
                    class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200">
                    <div class="flex items-center gap-4">
                        <div class="p-3 rounded-full bg-blue-100 dark:bg-blue-900/20">
                            <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div>
                            <h2 class="text-xl font-semibold dark:text-white">Study Plans</h2>
                            <p class="text-gray-600 dark:text-gray-300">You have {{ studyPlans.length }} study plans.
                            </p>
                        </div>
                    </div>
                </div>
                <div
                    class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200">
                    <div class="flex items-center gap-4">
                        <div class="p-3 rounded-full bg-green-100 dark:bg-green-900/20">
                            <svg class="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                        <div>
                            <h2 class="text-xl font-semibold dark:text-white">Books</h2>
                            <p class="text-gray-600 dark:text-gray-300">You are reading {{ books.length }} books.</p>
                        </div>
                    </div>
                </div>
                <div
                    class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200">
                    <div class="flex items-center gap-4">
                        <div class="p-3 rounded-full bg-purple-100 dark:bg-purple-900/20">
                            <svg class="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M19 11H5m14 0a8 8 0 11-16 0 8 8 0 0116 0z" />
                            </svg>
                        </div>
                        <div>
                            <h2 class="text-xl font-semibold dark:text-white">Other Content</h2>
                            <p class="text-gray-600 dark:text-gray-300">You have {{ otherContent.length }} other content
                                items.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useUserStore } from '~/stores/user';
import { getStudyPlans } from '~/client/api/study-plans';
import { getBooks } from '~/client/api/books';
import { getOtherContents } from '~/client/api/other-content';

const userStore = useUserStore();
const studyPlans = ref([]);
const books = ref([]);
const otherContent = ref([]);
const loading = ref(false);
const error = ref('');

async function loadDashboardData() {
    if (!userStore.user) return;

    loading.value = true;
    error.value = '';

    try {
        const user = userStore.user;
        console.log('User:', user); // Debug: Check if user is populated
        const [plansResponse, booksResponse, contentResponse] = await Promise.all([
            getStudyPlans(user),
            getBooks(user),
            getOtherContents(user),
        ]);
        console.log('API Responses:', plansResponse, booksResponse, contentResponse); // Debug: Check API data
        studyPlans.value = plansResponse || [];
        books.value = booksResponse || [];
        otherContent.value = contentResponse || [];
    } catch (err) {
        error.value = err.message || 'Failed to load dashboard data';
        console.error('Error loading data:', err); // Debug: Log the error
    } finally {
        loading.value = false;
    }
}

onMounted(() => {
    console.log('Mounted, user:', userStore.user); // Debug: Check user on mount
    loadDashboardData();
});
</script>

<style scoped>
@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.flex-col {
    animation: fadeIn 0.8s ease-out;
}

h1 {
    line-height: 1.2;
    padding-bottom: 0.1em;
}
</style>