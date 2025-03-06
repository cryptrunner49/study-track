<template>
    <div>
        <h1 class="text-3xl font-bold mb-4">{{ content.title }}</h1>
        <p class="mb-2">Type: {{ content.otherType }}</p>
        <p class="mb-8">
            Link:
            <a :href="content.link" target="_blank" class="text-blue-500 hover:underline">{{ content.link }}</a>
        </p>
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
const content = ref({});
const notes = ref([]);
const noteContent = ref('');
const error = ref('');

onMounted(async () => {
    const id = route.params.id;
    try {
        content.value = await $fetch(`/api/other-content/${id}`);
        notes.value = await $fetch(`/api/notes?contentId=${id}`);
    } catch (err) {
        error.value = 'Failed to load content details: ' + err.message;
    }
});

async function addNote() {
    try {
        const newNote = await $fetch('/api/notes', {
            method: 'POST',
            body: { content: noteContent.value, contentId: route.params.id },
        });
        notes.value.push(newNote);
        noteContent.value = '';
    } catch (err) {
        error.value = 'Failed to add note: ' + err.message;
    }
}
</script>