<template>
    <div>
        <h1 class="text-3xl font-bold mb-8">Dashboard</h1>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div class="bg-white dark:bg-gray-800 p-4 rounded shadow">
                <h2 class="text-xl font-semibold mb-2">Study Plans</h2>
                <p>You have {{ studyPlans.length }} study plans.</p>
            </div>
            <div class="bg-white dark:bg-gray-800 p-4 rounded shadow">
                <h2 class="text-xl font-semibold mb-2">Books</h2>
                <p>You are reading {{ books.length }} books.</p>
            </div>
            <div class="bg-white dark:bg-gray-800 p-4 rounded shadow">
                <h2 class="text-xl font-semibold mb-2">Other Content</h2>
                <p>You have {{ otherContent.length }} other content items.</p>
            </div>
        </div>
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
const userStore = useUserStore();

onMounted(async () => {
    if (userStore.user) {
        try {
            studyPlans.value = await $fetch('/api/study-plans');
            books.value = await $fetch('/api/books');
            otherContent.value = await $fetch('/api/other-content');
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        }
    }
});
</script>