<template>
    <div class="py-8 max-w-4xl mx-auto">
        <h1 class="text-4xl font-bold mb-10 text-center dark:text-white">Your Learning Progress</h1>

        <!-- Loading State -->
        <div v-if="loading" class="text-center dark:text-white">
            <p class="text-xl">Loading your progress...</p>
        </div>

        <!-- Overview Card -->
        <div v-else-if="!error"
            class="mb-8 bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-gray-700 dark:to-gray-800 p-6 rounded-xl shadow-lg text-white">
            <h2 class="text-2xl font-semibold mb-4">Overview</h2>
            <div class="grid grid-cols-3 gap-4 text-center">
                <div>
                    <p class="text-lg">Study Plans</p>
                    <p class="text-3xl font-bold">{{ studyPlans.length }}</p>
                </div>
                <div>
                    <p class="text-lg">Books Completed</p>
                    <p class="text-3xl font-bold">{{ completedBooks }} / {{ books.length }}</p>
                </div>
                <div>
                    <p class="text-lg">Other Content</p>
                    <p class="text-3xl font-bold">{{ otherContent.length }}</p>
                </div>
            </div>
        </div>

        <!-- Study Plans Section -->
        <div v-if="!error" class="mb-8">
            <button @click="toggleSection('studyPlans')"
                class="w-full flex justify-between items-center bg-gray-100 dark:bg-gray-700 p-4 rounded-lg shadow-md hover:bg-gray-200 dark:hover:bg-gray-600 transition duration-200">
                <h2 class="text-xl font-semibold dark:text-white">Study Plans ({{ completedPlans }}/{{ studyPlans.length
                    }})</h2>
                <span class="text-gray-600 dark:text-gray-300 text-xl">{{ studyPlansOpen ? '−' : '+' }}</span>
            </button>
            <div v-if="studyPlansOpen" class="mt-4 space-y-4">
                <div v-for="plan in studyPlans" :key="plan.planId"
                    class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                    <h3 class="text-lg font-medium dark:text-white">{{ plan.title }}</h3>
                    <p class="text-sm text-gray-600 dark:text-gray-300">{{ plan.description || 'No description' }}</p>
                    <p class="text-sm dark:text-white">
                        Progress: {{ planProgress(plan.planId) }}% (Books: {{ completedBooksInPlan(plan.planId) }}/{{
                            booksInPlan(planId)
                        }})
                    </p>
                    <div class="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-2">
                        <div :style="{ width: planProgress(plan.planId) + '%' }"
                            :class="planProgress(plan.planId) === 100 ? 'bg-green-500' : 'bg-blue-500'"
                            class="h-2.5 rounded-full"></div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Books Section -->
        <div v-if="!error" class="mb-8">
            <button @click="toggleSection('books')"
                class="w-full flex justify-between items-center bg-gray-100 dark:bg-gray-700 p-4 rounded-lg shadow-md hover:bg-gray-200 dark:hover:bg-gray-600 transition duration-200">
                <h2 class="text-xl font-semibold dark:text-white">Books ({{ completedBooks }}/{{ books.length }})</h2>
                <span class="text-gray-600 dark:text-gray-300 text-xl">{{ booksOpen ? '−' : '+' }}</span>
            </button>
            <div v-if="booksOpen" class="mt-4 space-y-4">
                <div class="flex items-center justify-between">
                    <p class="dark:text-white">Overall Reading Progress: {{ overallBookProgress }}%</p>
                    <div class="w-1/2 bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                        <div :style="{ width: overallBookProgress + '%' }" class="bg-blue-500 h-2.5 rounded-full"></div>
                    </div>
                </div>
                <div v-for="book in books" :key="book.bookId" class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                    <h3 class="text-lg font-medium dark:text-white">{{ book.title }}</h3>
                    <p class="text-sm text-gray-600 dark:text-gray-300">Author: {{ book.author || 'Unknown' }}</p>
                    <p class="text-sm dark:text-white">
                        Pages: {{ book.currentPage || 0 }} / {{ book.totalPages }} ({{
                            bookProgress(book.currentPage, book.totalPages)
                        }}%)
                    </p>
                    <div class="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-2">
                        <div :style="{ width: bookProgress(book.currentPage, book.totalPages) + '%' }"
                            :class="book.currentPage >= book.totalPages ? 'bg-green-500' : 'bg-blue-500'"
                            class="h-2.5 rounded-full"></div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Other Content Section -->
        <div v-if="!error" class="mb-8">
            <button @click="toggleSection('otherContent')"
                class="w-full flex justify-between items-center bg-gray-100 dark:bg-gray-700 p-4 rounded-lg shadow-md hover:bg-gray-200 dark:hover:bg-gray-600 transition duration-200">
                <h2 class="text-xl font-semibold dark:text-white">Other Content ({{ otherContent.length }})</h2>
                <span class="text-gray-600 dark:text-gray-300 text-xl">{{ otherContentOpen ? '−' : '+' }}</span>
            </button>
            <div v-if="otherContentOpen" class="mt-4 space-y-4">
                <div v-for="content in otherContent" :key="content.contentId"
                    class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                    <h3 class="text-lg font-medium dark:text-white">{{ content.title }}</h3>
                    <p class="text-sm text-gray-600 dark:text-gray-300">Type: {{ content.otherType || 'N/A' }}</p>
                    <a v-if="content.link" :href="content.link" target="_blank"
                        class="text-blue-500 hover:underline text-sm">
                        View Content
                    </a>
                    <p class="text-sm dark:text-white">Progress: Not tracked</p>
                </div>
            </div>
        </div>

        <!-- Error Display -->
        <div v-if="error" class="mt-6 p-4 bg-red-100 dark:bg-red-900 rounded-lg shadow-md text-center">
            <p class="text-red-700 dark:text-red-300 font-medium">{{ error }}</p>
            <button @click="retryLoad"
                class="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-200">
                Retry
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useUserStore } from '~/stores/user';
import { useRouter } from 'nuxt/app';

definePageMeta({
    middleware: ['auth'], // Client-side auth check
});

const userStore = useUserStore();
const router = useRouter();
const studyPlans = ref([]);
const books = ref([]);
const otherContent = ref([]);
const error = ref('');
const loading = ref(false);
const studyPlansOpen = ref(false);
const booksOpen = ref(true);
const otherContentOpen = ref(false);

async function loadData() {
    if (!userStore.user) {
        error.value = 'User not authenticated. Redirecting to login...';
        setTimeout(() => router.push('/login'), 2000);
        return;
    }

    loading.value = true;
    error.value = '';
    try {
        const [plansResponse, booksResponse, contentResponse] = await Promise.all([
            $fetch('/api/study-plans', { credentials: 'include' }),
            $fetch('/api/books', { credentials: 'include' }),
            $fetch('/api/other-content', { credentials: 'include' }),
        ]);
        studyPlans.value = plansResponse || [];
        books.value = booksResponse || [];
        otherContent.value = contentResponse || [];
    } catch (err) {
        error.value = 'Failed to load progress data: ' + (err.data?.statusMessage || err.message);
        console.error('Fetch error:', err);
    } finally {
        loading.value = false;
    }
}

onMounted(() => loadData());

function retryLoad() {
    loadData();
}

// Computed properties for progress metrics
const completedBooks = computed(() => books.value.filter((book) => (book.currentPage || 0) >= book.totalPages).length);
const overallBookProgress = computed(() => {
    if (books.value.length === 0) return 0;
    const totalPages = books.value.reduce((sum, book) => sum + book.totalPages, 0);
    const pagesRead = books.value.reduce((sum, book) => sum + (book.currentPage || 0), 0);
    return Math.round((pagesRead / totalPages) * 100) || 0;
});
const completedPlans = computed(() =>
    studyPlans.value.filter((plan) => booksInPlan(plan.planId) > 0 && completedBooksInPlan(plan.planId) === booksInPlan(plan.planId)).length
);

// Helper functions
function bookProgress(currentPage, totalPages) {
    return totalPages ? Math.round(((currentPage || 0) / totalPages) * 100) : 0;
}

function toggleSection(section) {
    if (section === 'studyPlans') studyPlansOpen.value = !studyPlansOpen.value;
    if (section === 'books') booksOpen.value = !booksOpen.value;
    if (section === 'otherContent') otherContentOpen.value = !otherContentOpen.value;
}

function booksInPlan(planId) {
    return books.value.filter((book) => book.planId === planId).length;
}

function completedBooksInPlan(planId) {
    return books.value.filter((book) => book.planId === planId && (book.currentPage || 0) >= book.totalPages).length;
}

function planProgress(planId) {
    const totalBooks = booksInPlan(planId);
    if (totalBooks === 0) return 0;
    const completed = completedBooksInPlan(planId);
    return Math.round((completed / totalBooks) * 100);
}
</script>