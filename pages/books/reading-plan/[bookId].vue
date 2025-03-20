<template>
    <div class="py-8">
        <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 max-w-2xl mx-auto">
            <h1 class="text-3xl font-bold mb-6 dark:text-white">
                {{ readingPlan.readingPlanId ? 'Edit' : 'Create' }} Reading Plan for "{{ book?.title || 'Book' }}"
            </h1>
            <form @submit.prevent="saveReadingPlan" class="space-y-6">
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
                <button type="submit"
                    class="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded transition duration-200">
                    {{ readingPlan.readingPlanId ? 'Update' : 'Create' }} Reading Plan
                </button>
            </form>
            <button v-if="readingPlan.readingPlanId" @click="deleteReadingPlan"
                class="w-full mt-4 bg-red-500 hover:bg-red-700 text-white font-bold py-3 px-4 rounded transition duration-200">
                Delete Reading Plan
            </button>
            <p v-if="error" class="text-red-500 mt-4">{{ error }}</p>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'nuxt/app';
import { useUserStore } from '~/stores/user';
import { getBook } from '~/client/api/books';
import { getReadingPlan, createReadingPlan, updateReadingPlan, deleteReadingPlan as deleteReadingPlanAPI } from '~/client/api/reading-plan';

definePageMeta({
    middleware: ['auth'],
});

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
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
    readingPlanId: null,
});
const book = ref(null);
const error = ref('');
const days = ref(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']);

onMounted(async () => {
    if (!userStore.user) {
        error.value = 'User not authenticated';
        router.push('/login');
        return;
    }
    try {
        book.value = await getBook(bookId, userStore.user);
        const existingPlan = await getReadingPlan(bookId, userStore.user);
        if (existingPlan && existingPlan.readingPlanId) {
            readingPlan.value = { ...existingPlan, bookId: Number(bookId) };
        }
    } catch (err) {
        error.value = `Failed to load data: ${err.message}`;
    }
});

async function saveReadingPlan() {
    if (!userStore.user) {
        error.value = 'User not authenticated';
        return;
    }
    try {
        const payload = {
            bookId: Number(bookId),
            hours: readingPlan.value.hours,
            minutes: readingPlan.value.minutes,
            monday: readingPlan.value.monday ? 1 : 0,
            tuesday: readingPlan.value.tuesday ? 1 : 0,
            wednesday: readingPlan.value.wednesday ? 1 : 0,
            thursday: readingPlan.value.thursday ? 1 : 0,
            friday: readingPlan.value.friday ? 1 : 0,
            saturday: readingPlan.value.saturday ? 1 : 0,
            sunday: readingPlan.value.sunday ? 1 : 0,
        };
        let response;
        if (readingPlan.value.readingPlanId) {
            response = await updateReadingPlan(readingPlan.value.readingPlanId, userStore.user, payload);
        } else {
            response = await createReadingPlan(userStore.user, payload);
        }
        readingPlan.value = response;
        error.value = '';
        router.push('/books');
    } catch (err) {
        error.value = `Failed to save reading plan: ${err.message}`;
    }
}

async function deleteReadingPlan() {
    if (!userStore.user) {
        error.value = 'User not authenticated';
        return;
    }
    if (!readingPlan.value.readingPlanId) {
        error.value = 'No reading plan exists to delete';
        return;
    }
    try {
        await deleteReadingPlanAPI(readingPlan.value.readingPlanId, userStore.user);
        readingPlan.value = {
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
            readingPlanId: null,
        };
        error.value = '';
        router.push('/books');
    } catch (err) {
        error.value = `Failed to delete reading plan: ${err.message}`;
    }
}
</script>
