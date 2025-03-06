<template>
    <div class="py-8">
        <h1 class="text-3xl font-bold mb-6 dark:text-white">Your Books</h1>

        <!-- Books List -->
        <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden mb-8">
            <table class="w-full table-auto">
                <thead>
                    <tr class="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                        <th class="px-6 py-4 text-left">Title</th>
                        <th class="px-6 py-4 text-left">Author</th>
                        <th class="px-6 py-4 text-left">Progress</th>
                        <th class="px-6 py-4 text-left">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="book in books" :key="book.bookId"
                        class="border-b dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td class="px-6 py-4 dark:text-white">{{ book.title }}</td>
                        <td class="px-6 py-4 dark:text-white">{{ book.author || 'Unknown' }}</td>
                        <td class="px-6 py-4 dark:text-white">{{ book.currentPage || 0 }} / {{ book.totalPages }}</td>
                        <td class="px-6 py-4">
                            <NuxtLink :to="`/books/${book.bookId}`" class="text-blue-500 hover:underline">View
                            </NuxtLink>
                            <button @click="deleteBook(book.bookId)"
                                class="text-red-500 hover:underline ml-4">Delete</button>
                        </td>
                    </tr>
                    <tr v-if="books.length === 0">
                        <td colspan="4" class="px-6 py-4 text-center dark:text-white">No books found.</td>
                    </tr>
                </tbody>
            </table>
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

definePageMeta({
    middleware: ['auth'],
});

const books = ref([]);
const studyPlans = ref([]);
const newBook = ref({ planId: '', title: '', author: '', totalPages: '' });
const error = ref('');

onMounted(async () => {
    try {
        books.value = await $fetch('/api/books');
        studyPlans.value = await $fetch('/api/study-plans');
    } catch (err) {
        error.value = 'Failed to load data: ' + err.message;
    }
});

async function createBook() {
    try {
        const createdBook = await $fetch('/api/books', {
            method: 'POST',
            body: {
                planId: Number(newBook.value.planId), // Ensure number type
                title: newBook.value.title,
                author: newBook.value.author || null, // Allow null if empty
                totalPages: Number(newBook.value.totalPages), // Ensure number type
            },
        });
        books.value.push(createdBook);
        newBook.value = { planId: '', title: '', author: '', totalPages: '' };
        error.value = '';
    } catch (err) {
        error.value = err.data?.statusMessage || 'Failed to create book: ' + err.message;
    }
}

async function deleteBook(id) {
    try {
        await $fetch(`/api/books/${id}`, { method: 'DELETE' });
        books.value = books.value.filter((book) => book.bookId !== id);
        error.value = '';
    } catch (err) {
        error.value = 'Failed to delete book: ' + err.message;
    }
}
</script>