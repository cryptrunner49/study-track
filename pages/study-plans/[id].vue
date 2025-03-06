<template>
    <div class="py-8">
        <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
            <h1 class="text-3xl font-bold mb-6 dark:text-white">{{ studyPlan.title }}</h1>
            <form @submit.prevent="updateStudyPlan" class="space-y-6 mb-8">
                <div>
                    <label for="title" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Title</label>
                    <input id="title" v-model="studyPlan.title" type="text"
                        class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                        required />
                </div>
                <div>
                    <label for="description"
                        class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Description</label>
                    <textarea id="description" v-model="studyPlan.description"
                        class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                        rows="4"></textarea>
                </div>
                <button type="submit"
                    class="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-3 px-4 rounded transition duration-200">
                    Update Study Plan
                </button>
            </form>
            <p v-if="error" class="text-red-500 mb-4">{{ error }}</p>

            <h2 class="text-2xl font-bold mb-4 dark:text-white">Books</h2>
            <ul class="mb-6 list-disc list-inside dark:text-white">
                <li v-for="book in books" :key="book.bookId" class="mb-2">
                    {{ book.title }} by {{ book.author || 'Unknown' }} ({{ book.currentPage || 0 }} / {{ book.totalPages
                    }} pages)
                </li>
                <li v-if="books.length === 0" class="text-gray-500 dark:text-gray-400">No books assigned.</li>
            </ul>

            <h2 class="text-2xl font-bold mb-4 dark:text-white">Other Content</h2>
            <ul class="mb-6 list-disc list-inside dark:text-white">
                <li v-for="content in otherContent" :key="content.contentId" class="mb-2">
                    {{ content.title }} ({{ content.otherType }})
                    <a :href="content.link" target="_blank" class="text-blue-500 hover:underline ml-2"
                        v-if="content.link">Link</a>
                </li>
                <li v-if="otherContent.length === 0" class="text-gray-500 dark:text-gray-400">No other content assigned.
                </li>
            </ul>

            <h2 class="text-2xl font-bold mb-4 dark:text-white">Notes</h2>
            <ul class="list-disc list-inside dark:text-white">
                <li v-for="note in notes" :key="note.noteId" class="mb-2">{{ note.content }}</li>
                <li v-if="notes.length === 0" class="text-gray-500 dark:text-gray-400">No notes added.</li>
            </ul>
        </div>
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
const notes = ref([]);
const error = ref('');

onMounted(async () => {
    const planId = route.params.id;
    try {
        studyPlan.value = await $fetch(`/api/study-plans/${planId}`);
        books.value = await $fetch('/api/books');
        books.value = books.value.filter((book) => book.planId === Number(planId));
        otherContent.value = await $fetch('/api/other-content');
        otherContent.value = otherContent.value.filter((content) => content.planId === Number(planId));
        notes.value = await $fetch('/api/notes');
        notes.value = notes.value.filter((note) => note.planId === Number(planId));
    } catch (err) {
        error.value = 'Failed to load study plan details: ' + err.message;
    }
});

async function updateStudyPlan() {
    try {
        const updatedPlan = await $fetch(`/api/study-plans/${route.params.id}`, {
            method: 'PUT',
            body: studyPlan.value,
        });
        studyPlan.value = updatedPlan;
        error.value = '';
    } catch (err) {
        error.value = 'Failed to update study plan: ' + err.message;
    }
}
</script>