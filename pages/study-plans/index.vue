<template>
    <div class="py-8">
        <h1 class="text-3xl font-bold mb-6 dark:text-white">Your Study Plans</h1>

        <!-- Study Plans List -->
        <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden mb-8">
            <table class="w-full table-auto">
                <thead>
                    <tr class="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                        <th class="px-6 py-4 text-left">Title</th>
                        <th class="px-6 py-4 text-left">Description</th>
                        <th class="px-6 py-4 text-left">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="plan in studyPlans" :key="plan.planId"
                        class="border-b dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td class="px-6 py-4 dark:text-white">{{ plan.title }}</td>
                        <td class="px-6 py-4 dark:text-white">{{ plan.description || 'No description' }}</td>
                        <td class="px-6 py-4">
                            <NuxtLink :to="`/study-plans/${plan.planId}`" class="text-blue-500 hover:underline">View
                            </NuxtLink>
                            <button @click="deleteStudyPlan(plan.planId)"
                                class="text-red-500 hover:underline ml-4">Delete</button>
                        </td>
                    </tr>
                    <tr v-if="studyPlans.length === 0">
                        <td colspan="3" class="px-6 py-4 text-center dark:text-white">No study plans found.</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Create New Study Plan Form -->
        <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
            <h2 class="text-2xl font-bold mb-6 dark:text-white">Create a New Study Plan</h2>
            <form @submit.prevent="createStudyPlan" class="space-y-6">
                <div>
                    <label for="title" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Title</label>
                    <input id="title" v-model="newPlan.title" type="text"
                        class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required />
                </div>
                <div>
                    <label for="description"
                        class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Description</label>
                    <textarea id="description" v-model="newPlan.description"
                        class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="4"></textarea>
                </div>
                <button type="submit"
                    class="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded transition duration-200">
                    Create Study Plan
                </button>
            </form>
            <p v-if="error" class="text-red-500 mt-4">{{ error }}</p>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

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

async function deleteStudyPlan(planId) {
    try {
        await $fetch(`/api/study-plans/${planId}`, { method: 'DELETE' });
        studyPlans.value = studyPlans.value.filter((plan) => plan.planId !== planId);
        error.value = '';
    } catch (err) {
        error.value = 'Failed to delete study plan: ' + err.message;
    }
}
</script>