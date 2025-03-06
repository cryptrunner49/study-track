<template>
    <div class="py-8">
        <h1 class="text-3xl font-bold mb-6 dark:text-white">Your Notes</h1>

        <!-- Notes List -->
        <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden mb-8">
            <table class="w-full table-auto">
                <thead>
                    <tr class="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                        <th class="px-6 py-4 text-left">Content</th>
                        <th class="px-6 py-4 text-left">Study Plan</th>
                        <th class="px-6 py-4 text-left">Book</th>
                        <th class="px-6 py-4 text-left">Other Content</th>
                        <th class="px-6 py-4 text-left">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="note in notes" :key="note.noteId"
                        class="border-b dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td class="px-6 py-4 dark:text-white">{{ note.content }}</td>
                        <td class="px-6 py-4 dark:text-white">{{ getPlanTitle(note.planId) }}</td>
                        <td class="px-6 py-4 dark:text-white">{{ getBookTitle(note.bookId) }}</td>
                        <td class="px-6 py-4 dark:text-white">{{ getContentTitle(note.contentId) }}</td>
                        <td class="px-6 py-4">
                            <NuxtLink :to="`/notes/${note.noteId}`" class="text-blue-500 hover:underline">View
                            </NuxtLink>
                            <button @click="deleteNote(note.noteId)"
                                class="text-red-500 hover:underline ml-4">Delete</button>
                        </td>
                    </tr>
                    <tr v-if="notes.length === 0">
                        <td colspan="5" class="px-6 py-4 text-center dark:text-white">No notes found.</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Create New Note Form -->
        <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
            <h2 class="text-2xl font-bold mb-6 dark:text-white">Add a New Note</h2>
            <form @submit.prevent="createNote" class="space-y-6">
                <div>
                    <label for="planId" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Study
                        Plan</label>
                    <select id="planId" v-model="newNote.planId"
                        class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required>
                        <option value="" disabled>Select a Study Plan</option>
                        <option v-for="plan in studyPlans" :key="plan.planId" :value="plan.planId">
                            {{ plan.title }}
                        </option>
                    </select>
                </div>
                <div>
                    <label for="bookId" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Book
                        (optional)</label>
                    <select id="bookId" v-model="newNote.bookId"
                        class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">None</option>
                        <option v-for="book in books" :key="book.bookId" :value="book.bookId">
                            {{ book.title }}
                        </option>
                    </select>
                </div>
                <div>
                    <label for="contentId" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Other Content
                        (optional)</label>
                    <select id="contentId" v-model="newNote.contentId"
                        class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">None</option>
                        <option v-for="content in otherContent" :key="content.contentId" :value="content.contentId">
                            {{ content.title }}
                        </option>
                    </select>
                </div>
                <div>
                    <label for="content" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Content</label>
                    <textarea id="content" v-model="newNote.content"
                        class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="4" required></textarea>
                </div>
                <button type="submit"
                    class="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded transition duration-200">
                    Create Note
                </button>
            </form>
            <p v-if="error" class="text-red-500 mt-4">{{ error }}</p>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useUserStore } from '~/stores/user';

definePageMeta({
    middleware: ['auth'],
});

const userStore = useUserStore();
const notes = ref([]);
const studyPlans = ref([]);
const books = ref([]);
const otherContent = ref([]);
const newNote = ref({ planId: '', bookId: '', contentId: '', content: '' });
const error = ref('');

onMounted(async () => {
    if (!userStore.user) return;
    const userId = userStore.user.userId;
    try {
        notes.value = await $fetch('/api/notes');
        studyPlans.value = await $fetch('/api/study-plans');
        books.value = await $fetch('/api/books');
        otherContent.value = await $fetch('/api/other-content');
    } catch (err) {
        error.value = 'Failed to load data: ' + err.message;
    }
});

async function createNote() {
    try {
        const createdNote = await $fetch('/api/notes', {
            method: 'POST',
            body: {
                planId: newNote.value.planId || null,
                bookId: newNote.value.bookId || null,
                contentId: newNote.value.contentId || null,
                content: newNote.value.content,
            },
        });
        notes.value.push(createdNote);
        newNote.value = { planId: '', bookId: '', contentId: '', content: '' };
        error.value = '';
    } catch (err) {
        error.value = 'Failed to create note: ' + err.message;
    }
}

async function deleteNote(noteId) {
    try {
        await $fetch(`/api/notes/${noteId}`, { method: 'DELETE' });
        notes.value = notes.value.filter((note) => note.noteId !== noteId);
        error.value = '';
    } catch (err) {
        error.value = 'Failed to delete note: ' + err.message;
    }
}

function getPlanTitle(planId) {
    const plan = studyPlans.value.find((p) => p.planId === planId);
    return plan ? plan.title : 'N/A';
}

function getBookTitle(bookId) {
    const book = books.value.find((b) => b.bookId === bookId);
    return book ? book.title : 'N/A';
}

function getContentTitle(contentId) {
    const content = otherContent.value.find((c) => c.contentId === contentId);
    return content ? content.title : 'N/A';
}
</script>