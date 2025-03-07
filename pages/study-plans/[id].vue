<template>
    <div class="py-8 max-w-6xl mx-auto">
        <div class="flex justify-end mb-4">
            <button @click="logout" class="text-red-500 hover:underline">Logout</button>
        </div>
        <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
            <div v-if="loading" class="space-y-6">
                <div class="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 animate-pulse"></div>
                <div class="space-y-4">
                    <div class="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse"></div>
                    <div class="h-20 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse"></div>
                    <div class="h-12 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse"></div>
                </div>
            </div>
            <div v-else>
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
                <p v-if="error" class="text-red-500 mb-4">
                    {{ error }}
                    <button v-if="!isUnauthorized" @click="loadData" class="text-blue-500 underline ml-2">Retry</button>
                    <NuxtLink v-else to="/login" class="text-blue-500 underline ml-2">Login</NuxtLink>
                </p>

                <h2 class="text-2xl font-bold mb-4 dark:text-white">Books</h2>
                <ul class="mb-6 list-disc list-inside dark:text-white">
                    <li v-for="book in books" :key="book.bookId" class="mb-2">
                        {{ book.title }} by {{ book.author || 'Unknown' }} ({{ book.currentPage || 0 }} / {{
                        book.totalPages }} pages)
                    </li>
                    <li v-if="books.length === 0" class="text-gray-500 dark:text-gray-400">No books assigned.</li>
                </ul>

                <h2 class="text-2xl font-bold mb-4 dark:text-white">Other Content</h2>
                <ul class="mb-6 list-disc list-inside dark:text-white">
                    <li v-for="content in otherContent" :key="content.contentId" class="mb-2">
                        {{ content.title }} ({{ content.otherType || 'N/A' }})
                        <a :href="content.link" target="_blank" class="text-blue-500 hover:underline ml-2"
                            v-if="content.link">Link</a>
                    </li>
                    <li v-if="otherContent.length === 0" class="text-gray-500 dark:text-gray-400">No other content
                        assigned.</li>
                </ul>

                <h2 class="text-2xl font-bold mb-4 dark:text-white">Notes</h2>
                <ul class="list-disc list-inside dark:text-white">
                    <li v-for="note in notes" :key="note.noteId" class="mb-2" v-html="note.content"></li>
                    <li v-if="notes.length === 0" class="text-gray-500 dark:text-gray-400">No notes added.</li>
                </ul>
            </div>
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
const studyPlan = ref({ title: '', description: '' });
const books = ref([]);
const otherContent = ref([]);
const notes = ref([]);
const error = ref('');
const loading = ref(true);
const isUnauthorized = ref(false);

async function loadData() {
    const planId = route.params.id;
    loading.value = true;
    error.value = '';
    isUnauthorized.value = false;
    try {
        const [planResponse, booksResponse, contentResponse, notesResponse] = await Promise.all([
            $fetch(`/api/study-plans/${planId}`, { credentials: 'include' }),
            $fetch(`/api/books?planId=${planId}`, { credentials: 'include' }),
            $fetch(`/api/other-content?planId=${planId}`, { credentials: 'include' }),
            $fetch(`/api/notes?planId=${planId}`, { credentials: 'include' }),
        ]);

        studyPlan.value = planResponse || { title: '', description: '' };
        books.value = booksResponse || [];
        otherContent.value = contentResponse || [];
        notes.value = notesResponse || [];
    } catch (err) {
        error.value = 'Failed to load study plan details: ' + (err.data?.statusMessage || err.message);
        isUnauthorized.value = err.status === 401;
        console.error('Load error:', err);
        if (err.status === 404) {
            studyPlan.value = { title: '', description: '' }; // Reset on not found
        }
    } finally {
        loading.value = false;
    }
}

async function updateStudyPlan() {
    const planId = route.params.id;
    if (!studyPlan.value.title.trim()) {
        error.value = 'Title cannot be empty';
        return;
    }

    try {
        const updatedPlan = await $fetch(`/api/study-plans/${planId}`, {
            method: 'PUT',
            body: { title: studyPlan.value.title, description: studyPlan.value.description || '' },
            credentials: 'include',
        });
        studyPlan.value = updatedPlan;
        error.value = '';
        isUnauthorized.value = false;
        console.log('Study plan updated successfully:', updatedPlan);
    } catch (err) {
        error.value = 'Failed to update study plan: ' + (err.data?.statusMessage || err.message);
        isUnauthorized.value = err.status === 401;
        console.error('Update error:', err);
    }
}

async function logout() {
    try {
        await $fetch('/api/logout', { method: 'POST', credentials: 'include' });
        router.push('/login');
    } catch (err) {
        console.error('Logout error:', err);
        error.value = 'Failed to logout: ' + (err.data?.statusMessage || err.message);
    }
}

onMounted(() => loadData());
</script>