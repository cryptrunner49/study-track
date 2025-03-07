<template>
    <div class="py-8">
        <h1 class="text-3xl font-bold mb-6 dark:text-white">Other Content</h1>

        <!-- Content List -->
        <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden mb-8">
            <table class="w-full table-auto">
                <thead>
                    <tr class="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                        <th class="px-6 py-4 text-left">Title</th>
                        <th class="px-6 py-4 text-left">Type</th>
                        <th class="px-6 py-4 text-left">Link</th>
                        <th class="px-6 py-4 text-left">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="content in otherContent" :key="content.contentId"
                        class="border-b dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td class="px-6 py-4 dark:text-white">{{ content.title }}</td>
                        <td class="px-6 py-4 dark:text-white">{{ content.otherType }}</td>
                        <td class="px-6 py-4">
                            <a :href="content.link" target="_blank" class="text-blue-500 hover:underline">{{
                                content.link || 'N/A' }}</a>
                        </td>
                        <td class="px-6 py-4">
                            <NuxtLink :to="`/other-content/${content.contentId}`" class="text-blue-500 hover:underline">
                                Edit</NuxtLink>
                            <button @click="deleteContent(content.contentId)"
                                class="text-red-500 hover:underline ml-4">Delete</button>
                        </td>
                    </tr>
                    <tr v-if="otherContent.length === 0">
                        <td colspan="4" class="px-6 py-4 text-center dark:text-white">No content found.</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Create New Content Form -->
        <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
            <h2 class="text-2xl font-bold mb-6 dark:text-white">Add New Content</h2>
            <form @submit.prevent="createContent" class="space-y-6">
                <div>
                    <label for="planId" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Study
                        Plan</label>
                    <select id="planId" v-model.number="newContent.planId"
                        class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required>
                        <option value="" disabled>Select a Study Plan</option>
                        <option v-for="plan in studyPlans" :key="plan.planId" :value="plan.planId">
                            {{ plan.title }}
                        </option>
                    </select>
                </div>
                <div>
                    <label for="title" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Title</label>
                    <input id="title" v-model="newContent.title" type="text"
                        class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required />
                </div>
                <div>
                    <label for="otherType" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Type</label>
                    <select id="otherType" v-model="newContent.otherType"
                        class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required>
                        <option value="" disabled>Select a Type</option>
                        <option v-for="type in otherTypes" :key="type" :value="type">{{ type }}</option>
                    </select>
                </div>
                <div>
                    <label for="link" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Link
                        (optional)</label>
                    <input id="link" v-model="newContent.link" type="url"
                        class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <button type="submit"
                    class="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded transition duration-200">
                    Create Content
                </button>
            </form>
            <p v-if="error" class="text-red-500 mt-4">{{ error }}</p>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useUserStore } from '~/stores/user';
import { getOtherContents, createOtherContent, deleteOtherContent } from '~/client/api/other-content';
import { getStudyPlans } from '~/client/api/study-plans';
import { OtherTypeValues } from '~/client/types';

definePageMeta({
    middleware: ['auth'],
});

const userStore = useUserStore();
const otherContent = ref([]);
const studyPlans = ref([]);
const newContent = ref({ planId: '', title: '', otherType: '', link: '' });
const error = ref('');
const otherTypes = ref(OtherTypeValues);

onMounted(async () => {
    try {
        const user = userStore.user;
        if (!user) throw new Error('User not authenticated');
        otherContent.value = await getOtherContents(user);
        studyPlans.value = await getStudyPlans(user);
    } catch (err) {
        error.value = err.message || 'Failed to load content';
    }
});

async function createContent() {
    try {
        const user = userStore.user;
        if (!user) throw new Error('User not authenticated');
        const createdContent = await createOtherContent(user, {
            planId: Number(newContent.value.planId),
            title: newContent.value.title,
            otherType: newContent.value.otherType,
            link: newContent.value.link || null,
        });
        otherContent.value.push(createdContent);
        newContent.value = { planId: '', title: '', otherType: '', link: '' };
        error.value = '';
    } catch (err) {
        error.value = err.message || 'Failed to create content';
    }
}

async function deleteContent(contentId) {
    try {
        const user = userStore.user;
        if (!user) throw new Error('User not authenticated');
        await deleteOtherContent(contentId, user);
        otherContent.value = otherContent.value.filter((content) => content.contentId !== contentId);
        error.value = '';
    } catch (err) {
        error.value = err.message || 'Failed to delete content';
    }
}
</script>