<template>
    <div>
        <h1 class="text-2xl font-bold mb-4 dark:text-white">Other Content</h1>
        <table class="w-full table-auto mb-8">
            <thead>
                <tr class="bg-gray-200 dark:bg-gray-700">
                    <th class="px-4 py-2">Title</th>
                    <th class="px-4 py-2">Type</th>
                    <th class="px-4 py-2">Link</th>
                    <th class="px-4 py-2">Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="content in otherContent" :key="content.id" class="border-b dark:border-gray-600">
                    <td class="px-4 py-2 dark:text-white">{{ content.title }}</td>
                    <td class="px-4 py-2 dark:text-white">{{ content.type }}</td>
                    <td class="px-4 py-2">
                        <a :href="content.link" target="_blank" class="text-blue-500 hover:underline">{{ content.link
                        }}</a>
                    </td>
                    <td class="px-4 py-2">
                        <NuxtLink :to="`/other-content/${content.id}`" class="text-blue-500 hover:underline">View
                        </NuxtLink>
                        <button @click="deleteContent(content.id)"
                            class="text-red-500 hover:underline ml-2">Delete</button>
                    </td>
                </tr>
            </tbody>
        </table>
        <h2 class="text-xl font-bold mb-4 dark:text-white">Create New Content</h2>
        <form @submit.prevent="createContent" class="space-y-4">
            <div>
                <label for="study_plan_id" class="block text-gray-700 dark:text-gray-300">Study Plan ID</label>
                <input id="study_plan_id" v-model.number="newContent.study_plan_id" type="number"
                    class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white" required />
            </div>
            <div>
                <label for="title" class="block text-gray-700 dark:text-gray-300">Title</label>
                <input id="title" v-model="newContent.title" type="text"
                    class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white" required />
            </div>
            <div>
                <label for="type" class="block text-gray-700 dark:text-gray-300">Type</label>
                <input id="type" v-model="newContent.type" type="text"
                    class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white" />
            </div>
            <div>
                <label for="link" class="block text-gray-700 dark:text-gray-300">Link</label>
                <input id="link" v-model="newContent.link" type="url"
                    class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white" />
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

const otherContent = ref([]);
const newContent = ref({ study_plan_id: '', title: '', type: '', link: '' });
const error = ref('');

onMounted(async () => {
    try {
        otherContent.value = await $fetch('/api/other-content');
    } catch (err) {
        error.value = 'Failed to load content: ' + err.message;
    }
});

async function createContent() {
    try {
        const createdContent = await $fetch('/api/other-content', {
            method: 'POST',
            body: newContent.value,
        });
        otherContent.value.push(createdContent);
        newContent.value = { study_plan_id: '', title: '', type: '', link: '' };
        error.value = '';
    } catch (err) {
        error.value = 'Failed to create content: ' + err.message;
    }
}

async function deleteContent(id) {
    try {
        await $fetch(`/api/other-content/${id}`, { method: 'DELETE' });
        otherContent.value = otherContent.value.filter(content => content.id !== id);
        error.value = '';
    } catch (err) {
        error.value = 'Failed to delete content: ' + err.message;
    }
}
</script>