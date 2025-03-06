<template>
    <div>
        <h1 class="text-2xl font-bold mb-4 dark:text-white">{{ book.title }}</h1>
        <form @submit.prevent="updateBook" class="space-y-4">
            <div>
                <label for="title" class="block text-gray-700 dark:text-gray-300">Title</label>
                <input id="title" v-model="book.title" type="text"
                    class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white" required />
            </div>
            <div>
                <label for="author" class="block text-gray-700 dark:text-gray-300">Author</label>
                <input id="author" v-model="book.author" type="text"
                    class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white" />
            </div>
            <div>
                <label for="total_pages" class="block text-gray-700 dark:text-gray-300">Total Pages</label>
                <input id="total_pages" v-model.number="book.total_pages" type="number"
                    class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white" required />
            </div>
            <div>
                <label for="current_page" class="block text-gray-700 dark:text-gray-300">Current Page</label>
                <input id="current_page" v-model.number="book.current_page" type="number"
                    class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white" required />
            </div>
            <button type="submit" class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                Update
            </button>
        </form>
        <p v-if="error" class="text-red-500 mt-4">{{ error }}</p>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'nuxt/app';

//definePageMeta({ layout: 'default' });
definePageMeta({
    middleware: ['auth'],
});

const route = useRoute();
const book = ref({});
const error = ref('');

onMounted(async () => {
    try {
        book.value = await $fetch(`/api/books/${route.params.id}`);
    } catch (err) {
        error.value = 'Failed to load book: ' + err.message;
    }
});

async function updateBook() {
    try {
        const updatedBook = await $fetch(`/api/books/${route.params.id}`, {
            method: 'PUT',
            body: book.value,
        });
        book.value = updatedBook;
        error.value = '';
    } catch (err) {
        error.value = 'Failed to update book: ' + err.message;
    }
}
</script>