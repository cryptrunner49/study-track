<template>
    <div>
        <!-- Welcome Page for Non-Logged-In Users -->
        <div v-if="!userStore.user" class="flex flex-col items-center justify-center min-h-screen">
            <h1 class="text-4xl font-bold mb-4 dark:text-white">Welcome to StudyTrack</h1>
            <p class="text-xl mb-8 dark:text-gray-300">Your all-in-one companion for organizing reading and study goals.
            </p>
            <div class="space-x-4">
                <NuxtLink to="/login" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Login
                </NuxtLink>
                <NuxtLink to="/register" class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                    Register
                </NuxtLink>
            </div>
        </div>

        <!-- Dashboard for Logged-In Users -->
        <div v-else class="py-8 max-w-6xl mx-auto">
            <h1 class="text-3xl font-bold mb-8 dark:text-white">Dashboard</h1>
            <!-- Skeleton Loading -->
            <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div v-for="n in 3" :key="n" class="bg-gray-200 dark:bg-gray-700 p-4 rounded shadow animate-pulse">
                    <div class="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-2"></div>
                    <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                </div>
            </div>
            <!-- Error Display -->
            <div v-else-if="error" class="p-4 bg-red-100 dark:bg-red-900 rounded-lg shadow-md text-center">
                <p class="text-red-700 dark:text-red-300 font-medium">{{ error }}</p>
                <button @click="loadDashboardData"
                    class="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-200">
                    Retry
                </button>
            </div>
            <!-- Dashboard Content -->
            <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div class="bg-white dark:bg-gray-800 p-4 rounded shadow">
                    <h2 class="text-xl font-semibold mb-2 dark:text-white">Study Plans</h2>
                    <p class="dark:text-gray-300">You have {{ studyPlans.length }} study plans.</p>
                </div>
                <div class="bg-white dark:bg-gray-800 p-4 rounded shadow">
                    <h2 class="text-xl font-semibold mb-2 dark:text-white">Books</h2>
                    <p class="dark:text-gray-300">You are reading {{ books.length }} books.</p>
                </div>
                <div class="bg-white dark:bg-gray-800 p-4 rounded shadow">
                    <h2 class="text-xl font-semibold mb-2 dark:text-white">Other Content</h2>
                    <p class="dark:text-gray-300">You have {{ otherContent.length }} other content items.</p>
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
        const [plansResponse, booksResponse, contentResponse] = await Promise.all([
            getStudyPlans(user),
            getBooks(user),
            getOtherContents(user),
        ]);
        studyPlans.value = plansResponse || [];
        books.value = booksResponse || [];
        otherContent.value = contentResponse || [];
    } catch (err) {
        error.value = err.message || 'Failed to load dashboard data';
    } finally {
        loading.value = false;
    }
}

onMounted(() => loadDashboardData());
</script>