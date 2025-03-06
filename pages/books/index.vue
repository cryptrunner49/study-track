<template>
    <div>
        <h1 class="text-3xl font-bold mb-8">Books</h1>
        <table class="w-full table-auto">
            <thead>
                <tr class="bg-gray-200 dark:bg-gray-700">
                    <th class="px-4 py-2">Title</th>
                    <th class="px-4 py-2">Author</th>
                    <th class="px-4 py-2">Total Pages</th>
                    <th class="px-4 py-2">Study Plan</th>
                    <th class="px-4 py-2">Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="book in books" :key="book.bookId" class="border-b dark:border-gray-600">
                    <td class="px-4 py-2">{{ book.title }}</td>
                    <td class="px-4 py-2">{{ book.author }}</td>
                    <td class="px-4 py-2">{{ book.totalPages }}</td>
                    <td class="px-4 py-2">{{ book.planTitle }}</td>
                    <td class="px-4 py-2">
                        <NuxtLink :to="`/books/${book.bookId}`" class="text-blue-500 hover:underline">View</NuxtLink>
                    </td>
                </tr>
            </tbody>
        </table>
        <h2 class="text-2xl font-bold mt-8 mb-4">Create New Book</h2>
        <form @submit.prevent="createBook" class="space-y-4">
            <div>
                <label for="title" class="block text-gray-700 dark:text-gray-300">Title</label>
                <input id="title" v-model="title" type="text"
                    class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white" required />
            </div>
            <div>
                <label for="author" class="block text-gray-700 dark:text-gray-300">Author</label>
                <input id="author" v-model="author" type="text"
                    class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white" />
            </div>
            <div>
                <label for="totalPages" class="block text-gray-700 dark:text-gray-300">Total Pages</label>
                <input id="totalPages" v-model="totalPages" type="number"
                    class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white" required />
            </div>
            <div>
                <label for="planId" class="block text-gray-700 dark:text-gray-300">Study Plan</label>
                <select id="planId" v-model="planId"
                    class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white">
                    <option v-for="plan in studyPlans" :key="plan.planId" :value="plan.planId">{{ plan.title }}</option>
                </select>
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
import { useUserStore } from '~/stores/user';

definePageMeta({
    middleware: ['auth'],
});

const books = ref([]);
const studyPlans = ref([]);
const title = ref('');
const author = ref('');
const totalPages = ref(0);
const planId = ref(null);
const error = ref('');
const userStore = useUserStore();

onMounted(async () => {
    if (userStore.user) {
        try {
            books.value = await $fetch('/api/books');
            studyPlans.value = await $fetch('/api/study-plans');
        } catch (err) {
            error.value = 'Failed to load books or study plans: ' + err.message;
        }
    }
});

async function createBook() {
    try {
        const newBook = await $fetch('/api/books', {
            method: 'POST',
            body: { planId: planId.value, title: title.value, author: author.value, totalPages: totalPages.value },
        });
        books.value.push(newBook);
        title.value = '';
        author.value = '';
        totalPages.value = 0;
        planId.value = null;
    } catch (err) {
        error.value = 'Failed to create book: ' + err.message;
    }
}
</script>