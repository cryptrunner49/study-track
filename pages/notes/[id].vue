<template>
  <div class="py-8">
    <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
      <h1 class="text-3xl font-bold mb-6 dark:text-white">Edit Note</h1>
      <form @submit.prevent="updateNote" class="space-y-6">
        <div>
          <label for="content" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Content</label>
          <textarea id="content" v-model="note.content"
            class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            rows="6" required></textarea>
        </div>
        <button type="submit"
          class="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-3 px-4 rounded transition duration-200">
          Update Note
        </button>
      </form>
      <p v-if="error" class="text-red-500 mt-4">{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'nuxt/app';
import { useUserStore } from '~/stores/user';

definePageMeta({
  middleware: ['auth'],
});

const route = useRoute();
const userStore = useUserStore();
const note = ref({});
const error = ref('');

onMounted(async () => {
  if (!userStore.user) return;
  try {
    note.value = await $fetch(`/api/notes/${route.params.id}`);
  } catch (err) {
    error.value = 'Failed to load note: ' + err.message;
  }
});

async function updateNote() {
  try {
    const updatedNote = await $fetch(`/api/notes/${route.params.id}`, {
      method: 'PUT',
      body: { content: note.value.content },
    });
    note.value = updatedNote;
    error.value = '';
  } catch (err) {
    error.value = 'Failed to update note: ' + err.message;
  }
}
</script>