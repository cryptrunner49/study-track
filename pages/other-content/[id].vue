<template>
    <div class="py-8">
        <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
            <h1 class="text-3xl font-bold mb-6 dark:text-white">Edit Content: {{ content.title }}</h1>
            <form @submit.prevent="updateContent" class="space-y-6">
                <div>
                    <label for="title" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Title</label>
                    <input id="title" v-model="content.title" type="text"
                        class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                        required />
                </div>
                <div>
                    <label for="otherType" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Type</label>
                    <select id="otherType" v-model="content.otherType"
                        class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                        required>
                        <option v-for="type in otherTypes" :key="type" :value="type">{{ type }}</option>
                    </select>
                </div>
                <div>
                    <label for="link" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Link
                        (optional)</label>
                    <input id="link" v-model="content.link" type="url"
                        class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <button type="submit"
                    class="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-3 px-4 rounded transition duration-200">
                    Update Content
                </button>
            </form>
            <p v-if="error" class="text-red-500 mt-4">{{ error }}</p>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'nuxt/app';
import { OtherTypeValues } from '~/server/types';

definePageMeta({
    middleware: ['auth'],
});

const route = useRoute();
const content = ref({});
const error = ref('');
const otherTypes = ref(OtherTypeValues);

onMounted(async () => {
    try {
        content.value = await $fetch(`/api/other-content/${route.params.id}`, { credentials: 'include' });
    } catch (err) {
        error.value = 'Failed to load content: ' + (err.data?.statusMessage || err.message);
    }
});

async function updateContent() {
    try {
        const updatedContent = await $fetch(`/api/other-content/${route.params.id}`, {
            method: 'PUT',
            body: content.value,
            credentials: 'include',
        });
        content.value = updatedContent;
        error.value = '';
    } catch (err) {
        error.value = 'Failed to update content: ' + (err.data?.statusMessage || err.message);
    }
}
</script>