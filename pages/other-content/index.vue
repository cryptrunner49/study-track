<template>
    <div>
        <h1 class="text-3xl font-bold mb-8">Other Content</h1>
        <table class="w-full table-auto">
            <thead>
                <tr class="bg-gray-200 dark:bg-gray-700">
                    <th class="px-4 py-2">Title</th>
                    <th class="px-4 py-2">Type</th>
                    <th class="px-4 py-2">Link</th>
                    <th class="px-4 py-2">Study Plan</th>
                    <th class="px-4 py-2">Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="content in otherContent" :key="content.contentId" class="border-b dark:border-gray-600">
                    <td class="px-4 py-2">{{ content.title }}</td>
                    <td class="px-4 py-2">{{ content.otherType }}</td>
                    <td class="px-4 py-2">
                        <a :href="content.link" target="_blank" class="text-blue-500 hover:underline">{{ content.link
                            }}</a>
                    </td>
                    <td class="px-4 py-2">{{ content.planTitle }}</td>
                    <td class="px-4 py-2">
                        <NuxtLink :to="`/other-content/${content.contentId}`" class="text-blue-500 hover:underline">View
                        </NuxtLink>
                    </td>
                </tr>
            </tbody>
        </table>
        <h2 class="text-2xl font-bold mt-8 mb-4">Create New Content</h2>
        <form @submit.prevent="createContent" class="space-y-4">
            <div>
                <label for="title" class="block text-gray-700 dark:text-gray-300">Title</label>
                <input id="title" v-model="title" type="text"
                    class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white" required />
            </div>
            <div>
                <label for="otherType" class="block text-gray-700 dark:text-gray-300">Type</label>
                <select id="otherType" v-model="otherType"
                    class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white">
                    <option value="course">Course</option>
                    <option value="video">Video</option>
                    <option value="paper">Paper</option>
                    <option value="blog">Blog</option>
                    <option value="other">Other</option>
                </select>
            </div>
            <div>
                <label for="link" class="block text-gray-700 dark:text-gray-300">Link</label>
                <input id="link" v-model="link" type="text"
                    class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white" />
            </div>
            <div>
                <label for="planId" class="block text-gray-700 dark:text-gray-300">Study Plan</label>
                <select id="planId" v-model="planId"
                    class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white">
                    <option v-for="plan in studyPlans" :key="plan.planId" :value="plan.planId">{{ plan.title }}</option>
                </select>
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

const otherContent = ref([]);
const studyPlans = ref([]);
const title = ref('');
const otherType = ref('course');
const link = ref('');
const planId = ref(null);
const error = ref('');
const userStore = useUserStore();

onMounted(async () => {
    if (userStore.user) {
        try {
            otherContent.value = await $fetch('/api/other-content');
            studyPlans.value = await $fetch('/api/study-plans');
        } catch (err) {
            error.value = 'Failed to load content or study plans: ' + err.message;
        }
    }
});

async function createContent() {
    try {
        const newContent = await $fetch('/api/other-content', {
            method: 'POST',
            body: { planId: planId.value, title: title.value, otherType: otherType.value, link: link.value },
        });
        otherContent.value.push(newContent);
        title.value = '';
        otherType.value = 'course';
        link.value = '';
        planId.value = null;
    } catch (err) {
        error.value = 'Failed to create content: ' + err.message;
    }
}
</script>