<template>
    <div class="py-8">
        <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
            <h1 class="text-3xl font-bold mb-6 dark:text-white">{{ book.title }}</h1>
            <form @submit.prevent="updateBook" class="space-y-6">
                <div>
                    <label for="title" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Title</label>
                    <input id="title" v-model="book.title" type="text"
                        class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                        required />
                </div>
                <div>
                    <label for="author" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Author</label>
                    <input id="author" v-model="book.author" type="text"
                        class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                    <label for="total_pages" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Total
                        Pages</label>
                    <input id="total_pages" v-model.number="book.totalPages" type="number"
                        class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                        required />
                </div>
                <div>
                    <label for="current_page" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Current
                        Page</label>
                    <input id="current_page" v-model.number="book.currentPage" type="number"
                        class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                        required />
                </div>
                <button type="submit"
                    class="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-3 px-4 rounded transition duration-200">
                    Update Book
                </button>
            </form>
            <p v-if="error" class="text-red-500 mt-4">{{ error }}</p>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'nuxt/app';

definePageMeta({
    middleware: ['auth'],
});

const route = useRoute();
const router = useRouter();
const book = ref({});
const error = ref('');

onMounted(async () => {
    try {
        book.value = await $fetch(`/api/books/${route.params.id}`, { credentials: 'include' });
    } catch (err) {
        error.value = 'Failed to load book: ' + (err.data?.statusMessage || err.message);
    }
});

async function updateBook() {
    try {
        const updatedBook = await $fetch(`/api/books/${route.params.id}`, {
            method: 'PUT',
            body: {
                title: book.value.title,
                author: book.value.author || null,
                totalPages: Number(book.value.totalPages),
                currentPage: Number(book.value.currentPage),
            },
            credentials: 'include',
        });
        book.value = updatedBook;
        error.value = '';
        router.push('/books');
    } catch (err) {
        error.value = 'Failed to update book: ' + (err.data?.statusMessage || err.message);
    }
}
</script>