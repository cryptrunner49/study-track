<template>
    <div>
        <h1 class="text-2xl font-bold mb-4 dark:text-white">Study Plans</h1>
        <table class="w-full table-auto mb-8">
            <thead>
                <tr class="bg-gray-200 dark:bg-gray-700">
                    <th class="px-4 py-2">Title</th>
                    <th class="px-4 py-2">Description</th>
                    <th class="px-4 py-2">Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="plan in studyPlans" :key="plan.id" class="border-b dark:border-gray-600">
                    <td class="px-4 py-2 dark:text-white">{{ plan.title }}</td>
                    <td class="px-4 py-2 dark:text-white">{{ plan.description }}</td>
                    <td class="px-4 py-2">
                        <NuxtLink :to="`/study-plans/${plan.id}`" class="text-blue-500 hover:underline">View</NuxtLink>
                        <button @click="deleteStudyPlan(plan.id)"
                            class="text-red-500 hover:underline ml-2">Delete</button>
                    </td>
                </tr>
            </tbody>
        </table>
        <h2 class="text-xl font-bold mb-4 dark:text-white">Create New Study Plan</h2>
        <form @submit.prevent="createStudyPlan" class="space-y-4">
            <div>
                <label for="title" class="block text-gray-700 dark:text-gray-300">Title</label>
                <input id="title" v-model="newPlan.title" type="text"
                    class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white" required />
            </div>
            <div>
                <label for="description" class="block text-gray-700 dark:text-gray-300">Description</label>
                <textarea id="description" v-model="newPlan.description"
                    class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white"></textarea>
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

const studyPlans = ref([]);
const newPlan = ref({ title: '', description: '' });
const error = ref('');

onMounted(async () => {
    try {
        studyPlans.value = await $fetch('/api/study-plans');
    } catch (err) {
        error.value = 'Failed to load study plans: ' + err.message;
    }
});

async function createStudyPlan() {
    try {
        const createdPlan = await $fetch('/api/study-plans', {
            method: 'POST',
            body: newPlan.value,
        });
        studyPlans.value.push(createdPlan);
        newPlan.value = { title: '', description: '' };
        error.value = '';
    } catch (err) {
        error.value = 'Failed to create study plan: ' + err.message;
    }
}

async function deleteStudyPlan(id) {
    try {
        await $fetch(`/api/study-plans/${id}`, { method: 'DELETE' });
        studyPlans.value = studyPlans.value.filter(plan => plan.id !== id);
        error.value = '';
    } catch (err) {
        error.value = 'Failed to delete study plan: ' + err.message;
    }
}
</script>