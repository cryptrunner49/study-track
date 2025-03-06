<template>
    <div>
        <h1 class="text-2xl font-bold mb-4 dark:text-white">Books</h1>
        <table class="w-full table-auto mb-8">
            <thead>
                <tr class="bg-gray-200 dark:bg-gray-700">
                    <th class="px-4 py-2">Title</th>
                    <th class="px-4 py-2">Author</th>
                    <th class="px-4 py-2">Progress</th>
                    <th class="px-4 py-2">Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="book in books" :key="book.id" class="border-b dark:border-gray-600">
                    <td class="px-4 py-2 dark:text-white">{{ book.title }}</td>
                    <td class="px-4 py-2 dark:text-white">{{ book.author }}</td>
                    <td class="px-4 py-2 dark:text-white">{{ book.current_page }} / {{ book.total_pages }}</td>
                    <td class="px-4 py-2">
                        <NuxtLink :to="`/books/${book.id}`" class="text-blue-500 hover:underline">View</NuxtLink>
                        <button @click="deleteBook(book.id)" class="text-red-500 hover:underline ml-2">Delete</button>
                    </td>
                </tr>
            </tbody>
        </table>
        <h2 class="text-xl font-bold mb-4 dark:text-white">Create New Book</h2>
        <form @submit.prevent="createBook" class="space-y-4">
            <div>
                <label for="study_plan_id" class="block text-gray-700 dark:text-gray-300">Study Plan ID</label>
                <input id="study_plan_id" v-model.number="newBook.study_plan_id" type="number"
                    class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white" required />
            </div>
            <div>
                <label for="title" class="block text-gray-700 dark:text-gray-300">Title</label>
                <input id="title" v-model="newBook.title" type="text"
                    class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white" required />
            </div>
            <div>
                <label for="author" class="block text-gray-700 dark:text-gray-300">Author</label>
                <input id="author" v-model="newBook.author" type="text"
                    class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white" />
            </div>
            <div>
                <label for="total_pages" class="block text-gray-700 dark:text-gray-300">Total Pages</label>
                <input id="total_pages" v-model.number="newBook.total_pages" type="number"
                    class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white" required />
            </div>
            <button type="submit" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Create
            </button>
        </form>
        <p v-if="error" class="text-red-500 mt-4">{{ error }}</p>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

//definePageMeta({ layout: 'default' });
definePageMeta({
    middleware: ['auth'],
});

const books = ref([]);
const newBook = ref({ study_plan_id: '', title: '', author: '', total_pages: '' });
const error = ref('');

onMounted(async () => {
    try {
        books.value = await $fetch('/api/books');
    } catch (err) {
        error.value = 'Failed to load books: ' + err.message;
    }
});

async function createBook() {
    try {
        const createdBook = await $fetch('/api/books', {
            method: 'POST',
            body: {
                study_plan_id: Number(newBook.value.study_plan_id), // Ensure number type
                title: newBook.value.title,
                author: newBook.value.author || null, // Allow null if empty
                total_pages: Number(newBook.value.total_pages), // Ensure number type
            },
        });
        books.value.push(createdBook);
        newBook.value = { study_plan_id: '', title: '', author: '', total_pages: '' };
        error.value = '';
    } catch (err) {
        error.value = err.data?.statusMessage || 'Failed to create book: ' + err.message;
    }
}

async function deleteBook(id) {
    try {
        await $fetch(`/api/books/${id}`, { method: 'DELETE' });
        books.value = books.value.filter((book) => book.id !== id);
        error.value = '';
    } catch (err) {
        error.value = 'Failed to delete book: ' + err.message;
    }
}
</script>