<template>
    <div>
        <h1 class="text-3xl font-bold mb-4">{{ studyPlan.title }}</h1>
        <p class="mb-8">{{ studyPlan.description }}</p>
        <h2 class="text-2xl font-bold mb-4">Books</h2>
        <table class="w-full table-auto mb-8">
            <thead>
                <tr class="bg-gray-200 dark:bg-gray-700">
                    <th class="px-4 py-2">Title</th>
                    <th class="px-4 py-2">Author</th>
                    <th class="px-4 py-2">Total Pages</th>
                    <th class="px-4 py-2">Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="book in books" :key="book.bookId" class="border-b dark:border-gray-600">
                    <td class="px-4 py-2">{{ book.title }}</td>
                    <td class="px-4 py-2">{{ book.author }}</td>
                    <td class="px-4 py-2">{{ book.totalPages }}</td>
                    <td class="px-4 py-2">
                        <NuxtLink :to="`/books/${book.bookId}`" class="text-blue-500 hover:underline">View</NuxtLink>
                    </td>
                </tr>
            </tbody>
        </table>
        <h2 class="text-2xl font-bold mb-4">Other Content</h2>
        <table class="w-full table-auto mb-8">
            <thead>
                <tr class="bg-gray-200 dark:bg-gray-700">
                    <th class="px-4 py-2">Title</th>
                    <th class="px-4 py-2">Type</th>
                    <th class="px-4 py-2">Link</th>
                    <th class="px-4 py-2">Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="content in otherContent" :key="content.contentId" class="border-b dark:border-gray-600">
                    <td class="px-4 py-2">{{ content.title }}</td>
                    <td class="px-4 py-2">{{ content.otherType }}</td>
                    <td class="px-4 py-2">
                        <a :href="content.link" target="_blank" class="text-blue-500 hover:underline">{{ content.link
                            }}</a>
                    </td>
                    <td class="px-4 py-2">
                        <NuxtLink :to="`/other-content/${content.contentId}`" class="text-blue-500 hover:underline">View
                        </NuxtLink>
                    </td>
                </tr>
            </tbody>
        </table>
        <h2 class="text-2xl font-bold mb-4">Add Book</h2>
        <form @submit.prevent="addBook" class="space-y-4 mb-8">
            <div>
                <label for="bookTitle" class="block text-gray-700 dark:text-gray-300">Title</label>
                <input id="bookTitle" v-model="bookTitle" type="text"
                    class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white" required />
            </div>
            <div>
                <label for="bookAuthor" class="block text-gray-700 dark:text-gray-300">Author</label>
                <input id="bookAuthor" v-model="bookAuthor" type="text"
                    class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white" />
            </div>
            <div>
                <label for="bookTotalPages" class="block text-gray-700 dark:text-gray-300">Total Pages</label>
                <input id="bookTotalPages" v-model="bookTotalPages" type="number"
                    class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white" required />
            </div>
            <button type="submit" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Add Book
            </button>
        </form>
        <h2 class="text-2xl font-bold mb-4">Add Other Content</h2>
        <form @submit.prevent="addOtherContent" class="space-y-4">
            <div>
                <label for="contentTitle" class="block text-gray-700 dark:text-gray-300">Title</label>
                <input id="contentTitle" v-model="contentTitle" type="text"
                    class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white" required />
            </div>
            <div>
                <label for="contentType" class="block text-gray-700 dark:text-gray-300">Type</label>
                <select id="contentType" v-model="contentType"
                    class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white">
                    <option value="course">Course</option>
                    <option value="video">Video</option>
                    <option value="paper">Paper</option>
                    <option value="blog">Blog</option>
                    <option value="other">Other</option>
                </select>
            </div>
            <div>
                <label for="contentLink" class="block text-gray-700 dark:text-gray-300">Link</label>
                <input id="contentLink" v-model="contentLink" type="text"
                    class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white" />
            </div>
            <button type="submit" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Add Content
            </button>
        </form>
        <p v-if="error" class="text-red-500 mt-4">{{ error }}</p>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'nuxt/app';

definePageMeta({
    middleware: ['auth'],
});

const route = useRoute();
const studyPlan = ref({});
const books = ref([]);
const otherContent = ref([]);
const bookTitle = ref('');
const bookAuthor = ref('');
const bookTotalPages = ref(0);
const contentTitle = ref('');
const contentType = ref('course');
const contentLink = ref('');
const error = ref('');

onMounted(async () => {
    const id = route.params.id;
    try {
        studyPlan.value = await $fetch(`/api/study-plans/${id}`);
        books.value = await $fetch(`/api/books?planId=${id}`);
        otherContent.value = await $fetch(`/api/other-content?planId=${id}`);
    } catch (err) {
        error.value = 'Failed to load study plan details: ' + err.message;
    }
});

async function addBook() {
    try {
        const newBook = await $fetch('/api/books', {
            method: 'POST',
            body: {
                planId: route.params.id,
                title: bookTitle.value,
                author: bookAuthor.value,
                totalPages: bookTotalPages.value,
            },
        });
        books.value.push(newBook);
        bookTitle.value = '';
        bookAuthor.value = '';
        bookTotalPages.value = 0;
    } catch (err) {
        error.value = 'Failed to add book: ' + err.message;
    }
}

async function addOtherContent() {
    try {
        const newContent = await $fetch('/api/other-content', {
            method: 'POST',
            body: {
                planId: route.params.id,
                title: contentTitle.value,
                otherType: contentType.value,
                link: contentLink.value,
            },
        });
        otherContent.value.push(newContent);
        contentTitle.value = '';
        contentType.value = 'course';
        contentLink.value = '';
    } catch (err) {
        error.value = 'Failed to add content: ' + err.message;
    }
}
</script>