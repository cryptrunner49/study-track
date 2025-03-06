<template>
    <div>
        <h1 class="text-3xl font-bold mb-8">Progress</h1>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div class="bg-white dark:bg-gray-800 p-4 rounded shadow">
                <h2 class="text-xl font-semibold mb-2">Study Plans</h2>
                <p>Total: {{ studyPlans.length }}</p>
            </div>
            <div class="bg-white dark:bg-gray-800 p-4 rounded shadow">
                <h2 class="text-xl font-semibold mb-2">Books</h2>
                <p>Total: {{ books.length }}</p>
                <p>Completed: {{books.filter(book => book.currentPage >= book.totalPages).length}}</p>
            </div>
            <div class="bg-white dark:bg-gray-800 p-4 rounded shadow">
                <h2 class="text-xl font-semibold mb-2">Other Content</h2>
                <p>Total: {{ otherContent.length }}</p>
            </div>
        </div>
        <p v-if="error" class="text-red-500 mt-4">{{ error }}</p>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useUserStore } from '~/stores/user';

definePageMeta({
    middleware: ['auth'],
});

const studyPlans = ref([]);
const books = ref([]);
const otherContent = ref([]);
const error = ref('');
const userStore = useUserStore();

onMounted(async () => {
    if (userStore.user) {
        try {
            studyPlans.value = await $fetch('/api/study-plans');
            books.value = await $fetch('/api/books');
            otherContent.value = await $fetch('/api/other-content');
        } catch (err) {
            error.value = 'Failed to load progress data: ' + err.message;
        }
    }
});
</script>