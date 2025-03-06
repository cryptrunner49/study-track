<template>
    <div>
        <h1 class="text-2xl font-bold mb-4 dark:text-white">{{ content.title }}</h1>
        <form @submit.prevent="updateContent" class="space-y-4">
            <div>
                <label for="title" class="block text-gray-700 dark:text-gray-300">Title</label>
                <input id="title" v-model="content.title" type="text"
                    class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white" required />
            </div>
            <div>
                <label for="type" class="block text-gray-700 dark:text-gray-300">Type</label>
                <input id="type" v-model="content.type" type="text"
                    class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white" />
            </div>
            <div>
                <label for="link" class="block text-gray-700 dark:text-gray-300">Link</label>
                <input id="link" v-model="content.link" type="url"
                    class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white" />
            </div>
            <button type="submit" class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                Update
            </button>
        </form>
        <p v-if="error" class="text-red-500 mt-4">{{ error }}</p>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'nuxt/app';

//definePageMeta({ layout: 'default' });
definePageMeta({
    middleware: ['auth'],
});

const route = useRoute();
const content = ref({});
const error = ref('');

onMounted(async () => {
    try {
        content.value = await $fetch(`/api/other-content/${route.params.id}`);
    } catch (err) {
        error.value = 'Failed to load content: ' + err.message;
    }
});

async function updateContent() {
    try {
        const updatedContent = await $fetch(`/api/other-content/${route.params.id}`, {
            method: 'PUT',
            body: content.value,
        });
        content.value = updatedContent;
        error.value = '';
    } catch (err) {
        error.value = 'Failed to update content: ' + err.message;
    }
}
</script>