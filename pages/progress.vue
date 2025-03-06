<template>
    <div class="py-8">
        <h1 class="text-4xl font-bold mb-8 text-center dark:text-white">Your Progress</h1>

        <!-- Study Plans Section -->
        <div class="mb-6">
            <button @click="toggleSection('studyPlans')"
                class="w-full flex justify-between items-center bg-gray-200 dark:bg-gray-700 p-4 rounded-lg shadow-md hover:bg-gray-300 dark:hover:bg-gray-600 transition duration-200">
                <h2 class="text-2xl font-semibold dark:text-white">Study Plans</h2>
                <span class="text-gray-600 dark:text-gray-300">{{ studyPlansOpen ? '−' : '+' }}</span>
            </button>
            <div v-if="studyPlansOpen" class="mt-4 space-y-4">
                <p class="dark:text-white">Total Study Plans: {{ studyPlans.length }}</p>
                <div v-for="plan in studyPlans" :key="plan.planId"
                    class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                    <h3 class="text-lg font-medium dark:text-white">{{ plan.title }}</h3>
                    <p class="text-sm text-gray-600 dark:text-gray-300">{{ plan.description || 'No description' }}</p>
                    <!-- Placeholder for future progress metrics -->
                    <p class="text-sm dark:text-white">Progress: In Progress</p>
                </div>
            </div>
        </div>

        <!-- Books Section -->
        <div class="mb-6">
            <button @click="toggleSection('books')"
                class="w-full flex justify-between items-center bg-gray-200 dark:bg-gray-700 p-4 rounded-lg shadow-md hover:bg-gray-300 dark:hover:bg-gray-600 transition duration-200">
                <h2 class="text-2xl font-semibold dark:text-white">Books</h2>
                <span class="text-gray-600 dark:text-gray-300">{{ booksOpen ? '−' : '+' }}</span>
            </button>
            <div v-if="booksOpen" class="mt-4 space-y-4">
                <p class="dark:text-white">
                    Total Books: {{ books.length }} | Completed: {{ completedBooks }} | Reading Progress: {{
                    overallBookProgress }}%
                </p>
                <div class="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div :style="{ width: overallBookProgress + '%' }" class="bg-blue-500 h-2.5 rounded-full"></div>
                </div>
                <div v-for="book in books" :key="book.bookId" class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                    <h3 class="text-lg font-medium dark:text-white">{{ book.title }}</h3>
                    <p class="text-sm text-gray-600 dark:text-gray-300">Author: {{ book.author || 'Unknown' }}</p>
                    <p class="text-sm dark:text-white">
                        Pages Read: {{ book.currentPage || 0 }} / {{ book.totalPages }} ({{
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
        <div class="mb-6">
            <button @click="toggleSection('otherContent')"
                class="w-full flex justify-between items-center bg-gray-200 dark:bg-gray-700 p-4 rounded-lg shadow-md hover:bg-gray-300 dark:hover:bg-gray-600 transition duration-200">
                <h2 class="text-2xl font-semibold dark:text-white">Other Content</h2>
                <span class="text-gray-600 dark:text-gray-300">{{ otherContentOpen ? '−' : '+' }}</span>
            </button>
            <div v-if="otherContentOpen" class="mt-4 space-y-4">
                <p class="dark:text-white">Total Items: {{ otherContent.length }}</p>
                <div v-for="content in otherContent" :key="content.contentId"
                    class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                    <h3 class="text-lg font-medium dark:text-white">{{ content.title }}</h3>
                    <p class="text-sm text-gray-600 dark:text-gray-300">Type: {{ content.otherType || 'N/A' }}</p>
                    <a v-if="content.link" :href="content.link" target="_blank"
                        class="text-blue-500 hover:underline text-sm">
                        View Content
                    </a>
                    <!-- Placeholder for future progress metrics -->
                    <p class="text-sm dark:text-white">Progress: Not tracked</p>
                </div>
            </div>
        </div>

        <p v-if="error" class="text-red-500 mt-4 text-center">{{ error }}</p>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useUserStore } from '~/stores/user';

definePageMeta({
    middleware: ['auth'],
});

const userStore = useUserStore();
const studyPlans = ref([]);
const books = ref([]);
const otherContent = ref([]);
const error = ref('');
const studyPlansOpen = ref(false);
const booksOpen = ref(true); // Open by default
const otherContentOpen = ref(false);

onMounted(async () => {
    if (userStore.user) {
        try {
            studyPlans.value = await $fetch('/api/study-plans', { credentials: 'include' });
            books.value = await $fetch('/api/books', { credentials: 'include' });
            otherContent.value = await $fetch('/api/other-content', { credentials: 'include' });
        } catch (err) {
            error.value = 'Failed to load progress data: ' + (err.data?.statusMessage || err.message);
        }
    }
});

// Computed properties for progress metrics
const completedBooks = computed(() => books.value.filter((book) => book.currentPage >= book.totalPages).length);
const overallBookProgress = computed(() => {
    if (books.value.length === 0) return 0;
    const totalPages = books.value.reduce((sum, book) => sum + book.totalPages, 0);
    const pagesRead = books.value.reduce((sum, book) => sum + (book.currentPage || 0), 0);
    return Math.round((pagesRead / totalPages) * 100) || 0;
});

// Functions
function bookProgress(currentPage, totalPages) {
    return totalPages ? Math.round(((currentPage || 0) / totalPages) * 100) : 0;
}

function toggleSection(section) {
    if (section === 'studyPlans') studyPlansOpen.value = !studyPlansOpen.value;
    if (section === 'books') booksOpen.value = !booksOpen.value;
    if (section === 'otherContent') otherContentOpen.value = !otherContentOpen.value;
}
</script>