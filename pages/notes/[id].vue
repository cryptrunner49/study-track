<!-- pages/notes/[id].vue -->
<template>
  <div>
    <h1 class="text-2xl font-bold mb-4 dark:text-white">Note</h1>
    <form @submit.prevent="updateNote" class="space-y-4">
      <div>
        <label for="content" class="block text-gray-700 dark:text-gray-300">Content</label>
        <textarea id="content" v-model="note.content"
          class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white" required></textarea>
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
const note = ref({});
const error = ref('');

onMounted(async () => {
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