<template>
    <div>
        <h1 class="text-2xl font-bold mb-4 dark:text-white">Notes</h1>
        <table class="w-full table-auto mb-8">
            <thead>
                <tr class="bg-gray-200 dark:bg-gray-700">
                    <th class="px-4 py-2">Content</th>
                    <th class="px-4 py-2">Study Plan ID</th>
                    <th class="px-4 py-2">Book ID</th>
                    <th class="px-4 py-2">Content ID</th>
                    <th class="px-4 py-2">Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="note in notes" :key="note.id" class="border-b dark:border-gray-600">
                    <td class="px-4 py-2 dark:text-white">{{ note.content }}</td>
                    <td class="px-4 py-2 dark:text-white">{{ note.study_plan_id }}</td>
                    <td class="px-4 py-2 dark:text-white">{{ note.book_id }}</td>
                    <td class="px-4 py-2 dark:text-white">{{ note.other_content_id }}</td>
                    <td class="px-4 py-2">
                        <NuxtLink :to="`/notes/${note.id}`" class="text-blue-500 hover:underline">View</NuxtLink>
                        <button @click="deleteNote(note.id)" class="text-red-500 hover:underline ml-2">Delete</button>
                    </td>
                </tr>
            </tbody>
        </table>
        <h2 class="text-xl font-bold mb-4 dark:text-white">Create New Note</h2>
        <form @submit.prevent="createNote" class="space-y-4">
            <div>
                <label for="study_plan_id" class="block text-gray-700 dark:text-gray-300">Study Plan ID</label>
                <input id="study_plan_id" v-model.number="newNote.study_plan_id" type="number"
                    class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white" required />
            </div>
            <div>
                <label for="book_id" class="block text-gray-700 dark:text-gray-300">Book ID (optional)</label>
                <input id="book_id" v-model.number="newNote.book_id" type="number"
                    class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white" />
            </div>
            <div>
                <label for="other_content_id" class="block text-gray-700 dark:text-gray-300">Other Content ID
                    (optional)</label>
                <input id="other_content_id" v-model.number="newNote.other_content_id" type="number"
                    class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white" />
            </div>
            <div>
                <label for="content" class="block text-gray-700 dark:text-gray-300">Content</label>
                <textarea id="content" v-model="newNote.content"
                    class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white" required></textarea>
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

const notes = ref([]);
const newNote = ref({ study_plan_id: '', book_id: null, other_content_id: null, content: '' });
const error = ref('');

onMounted(async () => {
    try {
        notes.value = await $fetch('/api/notes');
    } catch (err) {
        error.value = 'Failed to load notes: ' + err.message;
    }
});

async function createNote() {
    try {
        const createdNote = await $fetch('/api/notes', {
            method: 'POST',
            body: newNote.value,
        });
        notes.value.push(createdNote);
        newNote.value = { study_plan_id: '', book_id: null, other_content_id: null, content: '' };
        error.value = '';
    } catch (err) {
        error.value = 'Failed to create note: ' + err.message;
    }
}

async function deleteNote(id) {
    try {
        await $fetch(`/api/notes/${id}`, { method: 'DELETE' });
        notes.value = notes.value.filter(note => note.id !== id);
        error.value = '';
    } catch (err) {
        error.value = 'Failed to delete note: ' + err.message;
    }
}
</script>