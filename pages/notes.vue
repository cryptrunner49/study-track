<template>
    <div>
        <h1 class="text-3xl font-bold mb-8">Notes</h1>
        <ul class="mb-8">
            <li v-for="note in notes" :key="note.noteId" class="mb-2">
                {{ note.content }} -
                <span v-if="note.bookId">Book: {{ note.bookId }}</span>
                <span v-else-if="note.contentId">Content: {{ note.contentId }}</span>
                <span v-else-if="note.planId">Plan: {{ note.planId }}</span>
            </li>
        </ul>
        <h2 class="text-2xl font-bold mb-4">Create New Note</h2>
        <form @submit.prevent="createNote" class="space-y-4">
            <div>
                <label for="content" class="block text-gray-700 dark:text-gray-300">Note Content</label>
                <textarea id="content" v-model="content"
                    class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white" required></textarea>
            </div>
            <div>
                <label for="type" class="block text-gray-700 dark:text-gray-300">Associate with</label>
                <select id="type" v-model="type"
                    class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white">
                    <option value="book">Book</option>
                    <option value="content">Other Content</option>
                    <option value="plan">Study Plan</option>
                </select>
            </div>
            <div v-if="type === 'book'">
                <label for="bookId" class="block text-gray-700 dark:text-gray-300">Book ID</label>
                <input id="bookId" v-model="bookId" type="number"
                    class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white" />
            </div>
            <div v-if="type === 'content'">
                <label for="contentId" class="block text-gray-700 dark:text-gray-300">Content ID</label>
                <input id="contentId" v-model="contentId" type="number"
                    class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white" />
            </div>
            <div v-if="type === 'plan'">
                <label for="planId" class="block text-gray-700 dark:text-gray-300">Plan ID</label>
                <input id="planId" v-model="planId" type="number"
                    class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white" />
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

const notes = ref([]);
const content = ref('');
const type = ref('book');
const bookId = ref(null);
const contentId = ref(null);
const planId = ref(null);
const error = ref('');
const userStore = useUserStore();

onMounted(async () => {
    if (userStore.user) {
        try {
            notes.value = await $fetch('/api/notes');
        } catch (err) {
            error.value = 'Failed to load notes: ' + err.message;
        }
    }
});

async function createNote() {
    try {
        const body = { content: content.value };
        if (type.value === 'book') body.bookId = bookId.value;
        else if (type.value === 'content') body.contentId = contentId.value;
        else if (type.value === 'plan') body.planId = planId.value;
        const newNote = await $fetch('/api/notes', {
            method: 'POST',
            body,
        });
        notes.value.push(newNote);
        content.value = '';
        bookId.value = null;
        contentId.value = null;
        planId.value = null;
    } catch (err) {
        error.value = 'Failed to create note: ' + err.message;
    }
}
</script>