<template>
    <div>
        <h1 class="text-3xl font-bold mb-4">{{ book.title }}</h1>
        <p class="mb-2">Author: {{ book.author }}</p>
        <p class="mb-2">Total Pages: {{ book.totalPages }}</p>
        <p class="mb-2">Current Chapter: {{ book.currentChapter }}</p>
        <p class="mb-8">Current Page: {{ book.currentPage }}</p>
        <h2 class="text-2xl font-bold mb-4">Update Progress</h2>
        <form @submit.prevent="updateProgress" class="space-y-4 mb-8">
            <div>
                <label for="currentChapter" class="block text-gray-700 dark:text-gray-300">Current Chapter</label>
                <input id="currentChapter" v-model="currentChapter" type="text"
                    class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white" />
            </div>
            <div>
                <label for="currentPage" class="block text-gray-700 dark:text-gray-300">Current Page</label>
                <input id="currentPage" v-model="currentPage" type="number"
                    class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white" />
            </div>
            <button type="submit" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Update
            </button>
        </form>
        <h2 class="text-2xl font-bold mb-4">Notes</h2>
        <ul class="mb-8">
            <li v-for="note in notes" :key="note.noteId" class="mb-2">{{ note.content }}</li>
        </ul>
        <h2 class="text-2xl font-bold mb-4">Add Note</h2>
        <form @submit.prevent="addNote" class="space-y-4">
            <div>
                <label for="noteContent" class="block text-gray-700 dark:text-gray-300">Note Content</label>
                <textarea id="noteContent" v-model="noteContent"
                    class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white"></textarea>
            </div>
            <button type="submit" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Add Note
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
const book = ref({});
const notes = ref([]);
const currentChapter = ref('');
const currentPage = ref(0);
const noteContent = ref('');
const error = ref('');

onMounted(async () => {
    const id = route.params.id;
    try {
        book.value = await $fetch(`/api/books/${id}`);
        notes.value = await $fetch(`/api/notes?bookId=${id}`);
        currentChapter.value = book.value.currentChapter;
        currentPage.value = book.value.currentPage;
    } catch (err) {
        error.value = 'Failed to load book details: ' + err.message;
    }
});

async function updateProgress() {
    try {
        const updatedBook = await $fetch(`/api/books/${route.params.id}`, {
            method: 'PUT',
            body: { currentChapter: currentChapter.value, currentPage: currentPage.value },
        });
        book.value = updatedBook;
    } catch (err) {
        error.value = 'Failed to update progress: ' + err.message;
    }
}

async function addNote() {
    try {
        const newNote = await $fetch('/api/notes', {
            method: 'POST',
            body: { content: noteContent.value, bookId: route.params.id },
        });
        notes.value.push(newNote);
        noteContent.value = '';
    } catch (err) {
        error.value = 'Failed to add note: ' + err.message;
    }
}
</script>