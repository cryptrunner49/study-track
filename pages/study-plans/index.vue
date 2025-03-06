<template>
    <div>
        <h1 class="text-3xl font-bold mb-8">Study Plans</h1>
        <table class="w-full table-auto">
            <thead>
                <tr class="bg-gray-200 dark:bg-gray-700">
                    <th class="px-4 py-2">Title</th>
                    <th class="px-4 py-2">Description</th>
                    <th class="px-4 py-2">Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="plan in studyPlans" :key="plan.planId" class="border-b dark:border-gray-600">
                    <td class="px-4 py-2">{{ plan.title }}</td>
                    <td class="px-4 py-2">{{ plan.description }}</td>
                    <td class="px-4 py-2">
                        <NuxtLink :to="`/study-plans/${plan.planId}`" class="text-blue-500 hover:underline">View
                        </NuxtLink>
                    </td>
                </tr>
            </tbody>
        </table>
        <h2 class="text-2xl font-bold mt-8 mb-4">Create New Study Plan</h2>
        <form @submit.prevent="createStudyPlan" class="space-y-4">
            <div>
                <label for="title" class="block text-gray-700 dark:text-gray-300">Title</label>
                <input id="title" v-model="title" type="text"
                    class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white" required />
            </div>
            <div>
                <label for="description" class="block text-gray-700 dark:text-gray-300">Description</label>
                <textarea id="description" v-model="description"
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
import { useUserStore } from '~/stores/user';

definePageMeta({
    middleware: ['auth'],
});

const studyPlans = ref([]);
const title = ref('');
const description = ref('');
const error = ref('');
const userStore = useUserStore();

onMounted(async () => {
    if (userStore.user) {
        try {
            studyPlans.value = await $fetch('/api/study-plans');
        } catch (err) {
            error.value = 'Failed to load study plans: ' + err.message;
        }
    }
});

async function createStudyPlan() {
    try {
        const newPlan = await $fetch('/api/study-plans', {
            method: 'POST',
            body: { title: title.value, description: description.value },
        });
        studyPlans.value.push(newPlan);
        title.value = '';
        description.value = '';
    } catch (err) {
        error.value = 'Failed to create study plan: ' + err.message;
    }
}
</script>