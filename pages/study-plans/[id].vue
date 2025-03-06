<template>
    <div>
        <h1 class="text-2xl font-bold mb-4 dark:text-white">{{ studyPlan.title }}</h1>
        <form @submit.prevent="updateStudyPlan" class="space-y-4 mb-8">
            <div>
                <label for="title" class="block text-gray-700 dark:text-gray-300">Title</label>
                <input id="title" v-model="studyPlan.title" type="text"
                    class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white" required />
            </div>
            <div>
                <label for="description" class="block text-gray-700 dark:text-gray-300">Description</label>
                <textarea id="description" v-model="studyPlan.description"
                    class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white"></textarea>
            </div>
            <button type="submit" class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                Update
            </button>
        </form>
        <p v-if="error" class="text-red-500 mb-4">{{ error }}</p>
        <h2 class="text-xl font-bold mb-2 dark:text-white">Books</h2>
        <ul class="mb-4">
            <li v-for="book in books" :key="book.id" class="mb-2 dark:text-white">
                {{ book.title }} by {{ book.author }} ({{ book.current_page }} / {{ book.total_pages }} pages)
            </li>
        </ul>
        <h2 class="text-xl font-bold mb-2 dark:text-white">Other Content</h2>
        <ul class="mb-4">
            <li v-for="content in otherContent" :key="content.id" class="mb-2 dark:text-white">
                {{ content.title }} ({{ content.type }})
                <a :href="content.link" target="_blank" class="text-blue-500 hover:underline ml-2">Link</a>
            </li>
        </ul>
        <h2 class="text-xl font-bold mb-2 dark:text-white">Notes</h2>
        <ul>
            <li v-for="note in notes" :key="note.id" class="mb-2 dark:text-white">{{ note.content }}</li>
        </ul>
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
const studyPlan = ref({});
const books = ref([]);
const otherContent = ref([]);
const notes = ref([]);
const error = ref('');

onMounted(async () => {
    const id = route.params.id;
    try {
        studyPlan.value = await $fetch(`/api/study-plans/${id}`);
        books.value = await $fetch('/api/books');
        books.value = books.value.filter(book => book.study_plan_id === Number(id));
        otherContent.value = await $fetch('/api/other-content');
        otherContent.value = otherContent.value.filter(content => content.study_plan_id === Number(id));
        notes.value = await $fetch('/api/notes');
        notes.value = notes.value.filter(note => note.study_plan_id === Number(id));
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