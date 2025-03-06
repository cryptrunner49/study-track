<template>
  <div class="py-8 max-w-2xl mx-auto">
    <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
      <h1 class="text-3xl font-bold mb-6 dark:text-white">Edit Note</h1>
      <form @submit.prevent="updateNote" class="space-y-6">
        <div>
          <label for="associationType" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">
            Associate With
          </label>
          <select id="associationType" v-model="note.type"
            class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            required @change="note.id = ''">
            <option value="plan">Study Plan</option>
            <option value="book">Book</option>
            <option value="content">Other Content</option>
          </select>
        </div>
        <div>
          <label for="associationId" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">
            {{ associationLabel }}
          </label>
          <select id="associationId" v-model="note.id"
            class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            required>
            <option value="" disabled>Select an Item</option>
            <option v-if="note.type === 'plan'" v-for="plan in studyPlans" :key="plan.planId" :value="plan.planId">
              {{ plan.title }}
            </option>
            <option v-if="note.type === 'book'" v-for="book in books" :key="book.bookId" :value="book.bookId">
              {{ book.title }} (Plan: {{ getPlanTitle(book.planId) }})
            </option>
            <option v-if="note.type === 'content'" v-for="content in otherContent" :key="content.contentId"
              :value="content.contentId">
              {{ content.title }} ({{ content.otherType || 'N/A' }})
            </option>
          </select>
        </div>
        <div>
          <label for="content" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Note Content</label>
          <textarea id="content" v-model="note.content"
            class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            rows="6" required></textarea>
          <div class="mt-2 p-4 border rounded bg-gray-100 dark:bg-gray-900 dark:text-white">
            <VueMarkdown :source="note.content || 'Preview will appear here...'" />
          </div>
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
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'nuxt/app';
import { useUserStore } from '~/stores/user';
import VueMarkdown from 'vue3-markdown-it';

definePageMeta({
  middleware: ['auth'],
});

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const note = ref({ type: '', id: '', content: '' });
const studyPlans = ref([]);
const books = ref([]);
const otherContent = ref([]);
const error = ref('');

// Computed property to replace ternary in template
const associationLabel = computed(() => {
  if (note.value.type === 'plan') return 'Study Plan';
  if (note.value.type === 'book') return 'Book';
  return 'Other Content'; // Default for 'content' or empty
});

onMounted(async () => {
  if (!userStore.user) return;
  try {
    const fetchedNote = await $fetch(`/api/notes/${route.params.id}`, { credentials: 'include' });
    note.value = {
      content: fetchedNote.content,
      type: fetchedNote.planId ? 'plan' : fetchedNote.bookId ? 'book' : 'content',
      id: fetchedNote.planId || fetchedNote.bookId || fetchedNote.contentId || '',
    };
    studyPlans.value = await $fetch('/api/study-plans', { credentials: 'include' });
    books.value = await $fetch('/api/books', { credentials: 'include' });
    otherContent.value = await $fetch('/api/other-content', { credentials: 'include' });
  } catch (err) {
    error.value = 'Failed to load note: ' + (err.data?.statusMessage || err.message);
  }
});

async function updateNote() {
  if (!note.value.type || !note.value.id || !note.value.content) {
    error.value = 'All fields are required';
    return;
  }
  try {
    const payload = {
      content: note.value.content,
      ...(note.value.type === 'plan' && { planId: Number(note.value.id) }),
      ...(note.value.type === 'book' && { bookId: Number(note.value.id) }),
      ...(note.value.type === 'content' && { contentId: Number(note.value.id) }),
    };
    const updatedNote = await $fetch(`/api/notes/${route.params.id}`, {
      method: 'PUT',
      body: payload,
      credentials: 'include',
    });
    note.value = {
      content: updatedNote.content,
      type: updatedNote.planId ? 'plan' : updatedNote.bookId ? 'book' : 'content',
      id: updatedNote.planId || updatedNote.bookId || updatedNote.contentId || '',
    };
    error.value = '';
    router.push('/notes');
  } catch (err) {
    error.value = 'Failed to update note: ' + (err.data?.statusMessage || err.message);
  }
}

function getPlanTitle(planId) {
  const plan = studyPlans.value.find((p) => p.planId === planId);
  return plan ? plan.title : 'N/A';
}
</script>