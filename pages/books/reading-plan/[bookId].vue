<template>
    <div class="py-8">
        <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 max-w-2xl mx-auto">
            <h1 class="text-3xl font-bold mb-6 dark:text-white">
                {{ readingPlan.readingPlanId ? 'Edit' : 'Create' }} Reading Plan for "{{ book?.title || 'Book' }}"
            </h1>
            <form @submit.prevent="saveReadingPlan" class="space-y-6">
                <!-- Hours and Minutes -->
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label for="hours" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Hours per
                            Session</label>
                        <input id="hours" v-model.number="readingPlan.hours" type="number" min="0"
                            class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required />
                    </div>
                    <div>
                        <label for="minutes" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Minutes per
                            Session</label>
                        <input id="minutes" v-model.number="readingPlan.minutes" type="number" min="0" max="59"
                            class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required />
                    </div>
                </div>

                <!-- Days of the Week -->
                <div>
                    <p class="text-gray-700 dark:text-gray-300 font-medium mb-2">Reading Days</p>
                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <label v-for="day in days" :key="day" class="flex items-center space-x-2">
                            <input type="checkbox" v-model="readingPlan[day]"
                                class="h-5 w-5 text-blue-500 dark:bg-gray-700 border-gray-300 rounded focus:ring-blue-500" />
                            <span class="capitalize dark:text-white">{{ day }}</span>
                        </label>
                    </div>
                </div>

                <!-- Submit Button -->
                <button type="submit"
                    class="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded transition duration-200">
                    {{ readingPlan.readingPlanId ? 'Update' : 'Create' }} Reading Plan
                </button>
            </form>
            <p v-if="error" class="text-red-500 mt-4">{{ error }}</p>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'nuxt/app';

definePageMeta({
    middleware: ['auth'],
});

const route = useRoute();
const router = useRouter();
const bookId = route.params.bookId;
const readingPlan = ref({
    bookId: Number(bookId),
    hours: 0,
    minutes: 0,
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
    sunday: false,
});
const book = ref(null);
const error = ref('');
const days = ref(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']);

onMounted(async () => {
    try {
        // Fetch book details
        book.value = await $fetch(`/api/books/${bookId}`, { credentials: 'include' });

        // Fetch existing reading plan, if any
        const existingPlan = await $fetch(`/api/reading-plan/${bookId}`, { credentials: 'include' }).catch(() => null);
        if (existingPlan && existingPlan.readingPlanId) {
            readingPlan.value = {
                ...readingPlan.value,
                ...existingPlan,
                // Convert SQLite INTEGER (0/1) to boolean
                monday: !!existingPlan.monday,
                tuesday: !!existingPlan.tuesday,
                wednesday: !!existingPlan.wednesday,
                thursday: !!existingPlan.thursday,
                friday: !!existingPlan.friday,
                saturday: !!existingPlan.saturday,
                sunday: !!existingPlan.sunday,
            };
        }
    } catch (err) {
        error.value = 'Failed to load data: ' + (err.data?.statusMessage || err.message);
    }
});

async function saveReadingPlan() {
    try {
        const method = readingPlan.value.readingPlanId ? 'PUT' : 'POST';
        const url = readingPlan.value.readingPlanId
            ? `/api/reading-plan/${readingPlan.value.readingPlanId}`
            : '/api/reading-plan';
        const response = await $fetch(url, {
            method,
            body: readingPlan.value,
            credentials: 'include',
        });
        readingPlan.value = response; // Update with server response (includes readingPlanId)
        error.value = '';
        router.push('/books'); // Redirect back to books list
    } catch (err) {
        error.value = 'Failed to save reading plan: ' + (err.data?.statusMessage || err.message);
    }
}
</script>