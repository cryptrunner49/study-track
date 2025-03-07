<template>
    <div class="py-8 max-w-6xl mx-auto">
        <h1 class="text-3xl font-bold mb-6 dark:text-white">Your Study Plans</h1>

        <div v-if="loading" class="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden mb-8">
            <table class="w-full table-auto">
                <thead>
                    <tr class="bg-gray-200 dark:bg-gray-700">
                        <th class="px-6 py-4">
                            <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4 animate-pulse"></div>
                        </th>
                        <th class="px-6 py-4">
                            <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2 animate-pulse"></div>
                        </th>
                        <th class="px-6 py-4">
                            <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/3 animate-pulse"></div>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="n in 3" :key="n" class="border-b dark:border-gray-600">
                        <td class="px-6 py-4">
                            <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/3 animate-pulse"></div>
                        </td>
                        <td class="px-6 py-4">
                            <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-2/3 animate-pulse"></div>
                        </td>
                        <td class="px-6 py-4">
                            <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4 animate-pulse"></div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div v-else class="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden mb-8">
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
                            <NuxtLink :to="`/study-plans/${plan.planId}`" class="text-blue-500 hover:underline">Edit
                            </NuxtLink>
                            <button @click="removeStudyPlan(plan.planId)"
                                class="text-red-500 hover:underline ml-4">Delete</button>
                        </td>
                    </tr>
                    <tr v-if="studyPlans.length === 0">
                        <td colspan="3" class="px-6 py-4 text-center dark:text-white">No study plans found.</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
            <h2 class="text-2xl font-bold mb-6 dark:text-white">Create a New Study Plan</h2>
            <form @submit.prevent="createNewStudyPlan" class="space-y-6">
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
            <p v-if="error" class="text-red-500 mt-4">
                {{ error }}
                <button v-if="!isUnauthorized" @click="loadData" class="text-blue-500 underline ml-2">Retry</button>
                <NuxtLink v-else to="/login" class="text-blue-500 underline ml-2">Login</NuxtLink>
            </p>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'nuxt/app';
import { useUserStore } from '~/stores/user';
import { getStudyPlans, createStudyPlan, deleteStudyPlan } from '~/client/api/study-plans';

definePageMeta({
    middleware: ['auth'],
});

const router = useRouter();
const userStore = useUserStore();
const studyPlans = ref([]);
const newPlan = ref({ title: '', description: '' });
const error = ref('');
const loading = ref(true);
const isUnauthorized = ref(false);

async function loadData() {
    loading.value = true;
    error.value = '';
    isUnauthorized.value = false;
    try {
        const user = userStore.user;
        if (!user) throw new Error('User not authenticated');
        studyPlans.value = await getStudyPlans(user);
    } catch (err) {
        error.value = err.message || 'Failed to load study plans';
        isUnauthorized.value = err.statusCode === 401;
    } finally {
        loading.value = false;
    }
}

async function createNewStudyPlan() {
    try {
        const user = userStore.user;
        if (!user) throw new Error('User not authenticated');
        const createdPlan = await createStudyPlan(user, newPlan.value);
        studyPlans.value.push(createdPlan);
        newPlan.value = { title: '', description: '' };
        error.value = '';
        isUnauthorized.value = false;
    } catch (err) {
        error.value = err.message || 'Failed to create study plan';
        isUnauthorized.value = err.statusCode === 401;
    }
}

async function removeStudyPlan(planId) {
    try {
        const user = userStore.user;
        if (!user) throw new Error('User not authenticated');
        await deleteStudyPlan(planId, user);
        studyPlans.value = studyPlans.value.filter((plan) => plan.planId !== planId);
        error.value = '';
        isUnauthorized.value = false;
    } catch (err) {
        error.value = err.message || 'Failed to delete study plan';
        isUnauthorized.value = err.statusCode === 401;
    }
}

onMounted(() => loadData());
</script>