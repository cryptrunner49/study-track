<template>
    <div class="py-8">
        <h1 class="text-3xl font-bold mb-6 dark:text-white">Your Books</h1>

        <!-- Books List -->
        <div class="space-y-6 mb-8">
            <div v-for="book in books" :key="book.bookId" class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
                <!-- Book Details -->
                <div class="flex flex-col md:flex-row md:items-start md:space-x-6">
                    <div class="flex-1">
                        <h2 class="text-xl font-semibold dark:text-white">{{ book.title }}</h2>
                        <p class="text-gray-600 dark:text-gray-400">
                            {{ book.author || 'Unknown' }}
                        </p>
                    </div>
                    <div class="mt-4 md:mt-0 md:w-1/3">
                        <div class="dark:text-white">
                            {{ book.currentPage || 0 }} / {{ book.totalPages }} pages
                        </div>
                        <div class="text-sm text-gray-600 dark:text-gray-400">
                            ({{ progressPercentage(book) }}%)
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-1">
                            <div :style="{ width: progressPercentage(book) + '%' }"
                                class="bg-green-500 h-2.5 rounded-full"></div>
                        </div>
                    </div>
                    <div class="mt-4 md:mt-0 md:w-1/4 flex flex-col space-y-2">
                        <NuxtLink :to="`/books/${book.bookId}`" class="text-blue-500 hover:underline">
                            Edit
                        </NuxtLink>
                        <NuxtLink :to="`/books/reading-plan/${book.bookId}`" class="text-blue-500 hover:underline">
                            {{ book.readingPlan ? 'Edit Reading Plan' : 'Add Reading Plan' }}
                        </NuxtLink>
                        <button @click="deleteBook(book.bookId)" class="text-red-500 hover:underline text-left">
                            Delete
                        </button>
                        <button v-if="book.readingPlan" @click="deleteReadingPlan(book.bookId)"
                            class="text-red-500 hover:underline text-left">
                            Delete Reading Plan
                        </button>
                    </div>
                </div>

                <!-- Integrated Reading Plan -->
                <div v-if="book.readingPlan" class="mt-4">
                    <button @click="togglePlan(book.bookId)"
                        class="text-blue-500 hover:underline flex items-center focus:outline-none">
                        <span>{{ expandedPlans[book.bookId] ? 'Hide' : 'Show' }} Reading Plan</span>
                        <svg :class="{ 'rotate-180': expandedPlans[book.bookId] }"
                            class="w-4 h-4 ml-2 transition-transform" fill="none" stroke="currentColor"
                            viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    <div v-if="expandedPlans[book.bookId]" class="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg mt-2">
                        <h3 class="text-lg font-semibold dark:text-white mb-2">Current Reading Plan</h3>
                        <p class="dark:text-gray-300">
                            <strong>Session Duration:</strong> {{ book.readingPlan.hours }}h {{ book.readingPlan.minutes
                            }}m
                        </p>
                        <p class="dark:text-gray-300">
                            <strong>Reading Days:</strong>
                            <span v-if="activeDays(book.readingPlan).length > 0">
                                <span v-for="day in activeDays(book.readingPlan)" :key="day"
                                    :class="{ 'font-bold text-blue-500': day.toLowerCase() === currentDay.toLowerCase() }">
                                    {{ day }}<span
                                        v-if="activeDays(book.readingPlan).indexOf(day) < activeDays(book.readingPlan).length - 1">,
                                    </span>
                                </span>
                            </span>
                            <span v-else>None selected</span>
                        </p>
                    </div>
                </div>
            </div>

            <div v-if="books.length === 0"
                class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 text-center dark:text-white">
                No books found.
            </div>
        </div>

        <!-- Create New Book Form -->
        <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
            <h2 class="text-2xl font-bold mb-6 dark:text-white">Add a New Book</h2>
            <form @submit.prevent="createBook" class="space-y-6">
                <div>
                    <label for="study_plan_id" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Study
                        Plan</label>
                    <select id="study_plan_id" v-model="newBook.planId"
                        class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required>
                        <option value="" disabled>Select a Study Plan</option>
                        <option v-for="plan in studyPlans" :key="plan.planId" :value="plan.planId">
                            {{ plan.title }}
                        </option>
                    </select>
                </div>
                <div>
                    <label for="title" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Title</label>
                    <input id="title" v-model="newBook.title" type="text"
                        class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required />
                </div>
                <div>
                    <label for="author" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Author</label>
                    <input id="author" v-model="newBook.author" type="text"
                        class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                    <label for="total_pages" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Total
                        Pages</label>
                    <input id="total_pages" v-model.number="newBook.totalPages" type="number"
                        class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required />
                </div>
                <button type="submit"
                    class="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded transition duration-200">
                    Create Book
                </button>
            </form>
            <p v-if="error" class="text-red-500 mt-4">{{ error }}</p>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useUserStore } from '~/stores/user';
import { getBooks, createBook as createBookAPI, deleteBook as deleteBookAPI } from '~/client/api/books';
import { getStudyPlans } from '~/client/api/study-plans';
import { getReadingPlan, deleteReadingPlan as deleteReadingPlanAPI } from '~/client/api/reading-plan';

definePageMeta({
    middleware: ['auth'],
});

const userStore = useUserStore();
const books = ref([]);
const studyPlans = ref([]);
const newBook = ref({ planId: '', title: '', author: '', totalPages: '' });
const error = ref('');
const days = ref(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']);
const expandedPlans = ref({});
const currentDay = ref(new Date().toLocaleString('en-US', { weekday: 'long' }));

onMounted(async () => {
    if (!userStore.user) {
        error.value = 'User not authenticated';
        return;
    }
    try {
        const fetchedBooks = await getBooks(userStore.user);
        books.value = await Promise.all(
            fetchedBooks.map(async (book) => {
                const readingPlan = await getReadingPlan(book.bookId, userStore.user);
                return { ...book, readingPlan };
            })
        );
        studyPlans.value = await getStudyPlans(userStore.user);
    } catch (err) {
        error.value = `Failed to load data: ${err.message}`;
    }
});

async function createBook() {
    if (!userStore.user) {
        error.value = 'User not authenticated';
        return;
    }
    try {
        const createdBook = await createBookAPI(userStore.user, {
            planId: Number(newBook.value.planId),
            title: newBook.value.title,
            author: newBook.value.author || null,
            totalPages: Number(newBook.value.totalPages),
        });
        books.value.push({ ...createdBook, readingPlan: null });
        newBook.value = { planId: '', title: '', author: '', totalPages: '' };
        error.value = '';
    } catch (err) {
        error.value = `Failed to create book: ${err.message}`;
    }
}

async function deleteBook(id) {
    if (!userStore.user) {
        error.value = 'User not authenticated';
        return;
    }
    try {
        await deleteBookAPI(id, userStore.user);
        books.value = books.value.filter((book) => book.bookId !== id);
        error.value = '';
    } catch (err) {
        error.value = `Failed to delete book: ${err.message}`;
    }
}

async function deleteReadingPlan(bookId) {
    if (!userStore.user) {
        error.value = 'User not authenticated';
        return;
    }
    try {
        const book = books.value.find(b => b.bookId === bookId);
        if (!book?.readingPlan?.readingPlanId) {
            error.value = 'No reading plan found to delete';
            return;
        }
        await deleteReadingPlanAPI(book.readingPlan.readingPlanId, userStore.user);
        books.value = books.value.map(b =>
            b.bookId === bookId ? { ...b, readingPlan: null } : b
        );
        error.value = '';
    } catch (err) {
        error.value = `Failed to delete reading plan: ${err.message}`;
    }
}

function activeDays(plan) {
    return days.value.filter((day) => plan[day.toLowerCase()]);
}

function progressPercentage(book) {
    const current = book.currentPage || 0;
    const total = book.totalPages || 1;
    return Math.min(100, Math.round((current / total) * 100));
}

function togglePlan(bookId) {
    expandedPlans.value[bookId] = !expandedPlans.value[bookId];
}
</script>