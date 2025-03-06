<template>
    <div class="py-8 max-w-5xl mx-auto">
        <h1 class="text-3xl font-bold mb-8 dark:text-white">Your Notes</h1>

        <!-- Notes List -->
        <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden mb-8">
            <table class="w-full table-auto">
                <thead>
                    <tr class="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                        <th class="px-6 py-4 text-left">Content</th>
                        <th class="px-6 py-4 text-left">Associated With</th>
                        <th class="px-6 py-4 text-left">Created</th>
                        <th class="px-6 py-4 text-left">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="note in notes" :key="note.noteId"
                        class="border-b dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td class="px-6 py-4 dark:text-white truncate max-w-xs">
                            <VueMarkdown :source="note.content" />
                        </td>
                        <td class="px-6 py-4 dark:text-white">
                            {{ getAssociationDisplay(note) }}
                        </td>
                        <td class="px-6 py-4 dark:text-white">{{ formatDate(note.createdDate) }}</td>
                        <td class="px-6 py-4 space-x-4">
                            <NuxtLink :to="`/notes/${note.noteId}`" class="text-blue-500 hover:underline">Edit
                            </NuxtLink>
                            <button @click="deleteNote(note.noteId)"
                                class="text-red-500 hover:underline">Delete</button>
                        </td>
                    </tr>
                    <tr v-if="notes.length === 0">
                        <td colspan="4" class="px-6 py-4 text-center dark:text-white">No notes found.</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Create New Note Form -->
        <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
            <h2 class="text-2xl font-bold mb-6 dark:text-white">Add a New Note</h2>
            <form @submit.prevent="createNote" class="space-y-6">
                <div>
                    <label for="associationType" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                        Associate With
                    </label>
                    <select id="associationType" v-model="newNote.type"
                        class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required @change="newNote.id = ''">
                        <option value="" disabled>Select Type</option>
                        <option value="plan">Study Plan</option>
                        <option value="book">Book</option>
                        <option value="content">Other Content</option>
                    </select>
                </div>
                <div v-if="newNote.type">
                    <label for="associationId" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                        {{ associationLabel }}
                    </label>
                    <select id="associationId" v-model="newNote.id"
                        class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required>
                        <option value="" disabled>Select an Item</option>
                        <option v-if="newNote.type === 'plan'" v-for="plan in studyPlans" :key="plan.planId"
                            :value="plan.planId">
                            {{ plan.title }}
                        </option>
                        <option v-if="newNote.type === 'book'" v-for="book in books" :key="book.bookId"
                            :value="book.bookId">
                            {{ book.title }} (Plan: {{ getPlanTitle(book.planId) }})
                        </option>
                        <option v-if="newNote.type === 'content'" v-for="content in otherContent"
                            :key="content.contentId" :value="content.contentId">
                            {{ content.title }} ({{ content.otherType || 'N/A' }})
                        </option>
                    </select>
                </div>
                <div>
                    <label for="content" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                        Note
                    </label>
                    <div class="flex flex-col md:flex-row md:space-x-4">
                        <textarea id="content" v-model="newNote.content"
                            class="min-h-fit w-1/2 px-3 py-2 border rounded dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows="6" required></textarea>
                        <div
                            class="min-h-fit w-1/2 mt-0 p-4 border rounded bg-gray-100 dark:bg-gray-900 dark:text-white">
                            <VueMarkdown :source="newNote.content || 'Preview will appear here...'" />
                        </div>
                    </div>
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
import { ref, onMounted, computed } from 'vue';
import { useUserStore } from '~/stores/user';
import VueMarkdown from 'vue3-markdown-it';

definePageMeta({
    middleware: ['auth'],
});

const userStore = useUserStore();
const notes = ref([]);
const studyPlans = ref([]);
const books = ref([]);
const otherContent = ref([]);
const newNote = ref({ type: 'book', id: '', content: '' }); // Default to 'book'
const error = ref('');

// Computed property for association label
const associationLabel = computed(() => {
    if (newNote.value.type === 'plan') return 'Study Plan';
    if (newNote.value.type === 'book') return 'Book';
    return 'Other Content'; // Default for 'content' or empty
});

onMounted(async () => {
    if (!userStore.user) {
        error.value = 'User not authenticated';
        return;
    }
    try {
        console.log('Fetching notes...');
        const notesData = await $fetch('/api/notes', { credentials: 'include' });
        console.log('Notes fetched:', notesData);
        notes.value = notesData;

        console.log('Fetching study plans...');
        const plansData = await $fetch('/api/study-plans', { credentials: 'include' });
        console.log('Study plans fetched:', plansData);
        studyPlans.value = plansData;

        console.log('Fetching books...');
        const booksData = await $fetch('/api/books', { credentials: 'include' });
        console.log('Books fetched:', booksData);
        books.value = booksData;

        console.log('Fetching other content...');
        const contentData = await $fetch('/api/other-content', { credentials: 'include' });
        console.log('Other content fetched:', contentData);
        otherContent.value = contentData;
    } catch (err) {
        console.error('Fetch error:', err);
        error.value = 'Failed to load data: ' + (err.data?.statusMessage || err.message);
    }
});

// Create a new note
async function createNote() {
    if (!newNote.value.type || !newNote.value.id || !newNote.value.content) {
        error.value = 'All fields are required';
        return;
    }
    try {
        console.log('Creating note with:', newNote.value);
        const payload = {
            content: newNote.value.content,
            ...(newNote.value.type === 'plan' && { planId: Number(newNote.value.id) }),
            ...(newNote.value.type === 'book' && { bookId: Number(newNote.value.id) }),
            ...(newNote.value.type === 'content' && { contentId: Number(newNote.value.id) }),
        };
        const createdNote = await $fetch('/api/notes', {
            method: 'POST',
            body: payload,
            credentials: 'include',
        });
        console.log('Note created:', createdNote);
        notes.value.push(createdNote);
        newNote.value = { type: 'book', id: '', content: '' }; // Reset with default
        error.value = '';
    } catch (err) {
        console.error('Create note error:', err);
        error.value = 'Failed to create note: ' + (err.data?.statusMessage || err.message);
    }
}

// Delete a note
async function deleteNote(noteId) {
    try {
        console.log('Deleting note:', noteId);
        await $fetch(`/api/notes/${noteId}`, { method: 'DELETE', credentials: 'include' });
        notes.value = notes.value.filter((note) => note.noteId !== noteId);
        error.value = '';
    } catch (err) {
        console.error('Delete note error:', err);
        error.value = 'Failed to delete note: ' + (err.data?.statusMessage || err.message);
    }
}

// Helper functions
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

function getAssociationDisplay(note) {
    if (note.planId) return getPlanTitle(note.planId);
    if (note.bookId) return getBookTitle(note.bookId);
    if (note.contentId) return getContentTitle(note.contentId);
    return 'N/A';
}

function formatDate(dateStr) {
    return dateStr ? new Date(dateStr).toLocaleDateString() : 'N/A';
}
</script>