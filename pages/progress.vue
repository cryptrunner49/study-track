<template>
    <div class="py-8 max-w-4xl mx-auto">
        <h1 class="text-4xl font-bold mb-10 text-center dark:text-white">Your Learning Progress</h1>

        <!-- Skeleton Loading State -->
        <div v-if="loading && !cachedDataLoaded" class="space-y-6">
            <div class="bg-gray-200 dark:bg-gray-700 p-6 rounded-xl animate-pulse">
                <div class="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/4 mb-4"></div>
                <div class="grid grid-cols-3 gap-4">
                    <div class="h-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
                    <div class="h-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
                    <div class="h-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
                </div>
            </div>
            <div v-for="n in 3" :key="n" class="bg-gray-200 dark:bg-gray-700 p-4 rounded-lg animate-pulse">
                <div class="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/3 mb-2"></div>
                <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full mb-2"></div>
                <div class="h-2.5 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
            </div>
        </div>

        <!-- Overview Card -->
        <div v-else-if="!error"
            class="mb-8 bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-gray-700 dark:to-gray-800 p-6 rounded-xl shadow-lg text-white">
            <h2 class="text-2xl font-semibold mb-4">Overview</h2>
            <div class="grid grid-cols-3 gap-4 text-center">
                <div>
                    <p class="text-lg">Study Plans</p>
                    <p class="text-3xl font-bold">{{ studyPlans.length }}</p>
                </div>
                <div>
                    <p class="text-lg">Books Completed</p>
                    <p class="text-3xl font-bold">{{ completedBooks }} / {{ books.length }}</p>
                </div>
                <div>
                    <p class="text-lg">Other Content Completed</p>
                    <p class="text-3xl font-bold">{{ completedOtherContent }} / {{ otherContent.length }}</p>
                </div>
            </div>
        </div>

        <!-- Study Plans Section -->
        <div v-if="!error" class="mb-8">
            <button @click="toggleSection('studyPlans')"
                class="w-full flex justify-between items-center bg-gray-100 dark:bg-gray-700 p-4 rounded-lg shadow-md hover:bg-gray-200 dark:hover:bg-gray-600 transition duration-200">
                <h2 class="text-xl font-semibold dark:text-white">Study Plans ({{ completedPlans }}/{{ studyPlans.length
                }})</h2>
                <span class="text-gray-600 dark:text-gray-300 text-xl">{{ studyPlansOpen ? '−' : '+' }}</span>
            </button>
            <div v-if="studyPlansOpen" class="mt-4 space-y-4">
                <div class="flex items-center justify-between">
                    <p class="dark:text-white">Overall Study Plans Progress: {{ overallStudyPlansProgress }}%</p>
                    <div class="w-1/2 bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                        <div :style="{ width: overallStudyPlansProgress + '%' }" class="bg-blue-500 h-2.5 rounded-full">
                        </div>
                    </div>
                </div>
                <div v-for="plan in studyPlans" :key="plan.planId"
                    class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                    <h3 class="text-lg font-medium dark:text-white">{{ plan.title }}</h3>
                    <p class="text-sm text-gray-600 dark:text-gray-300">{{ plan.description || 'No description' }}</p>
                    <p class="text-sm dark:text-white">
                        Progress: {{ planProgress(plan.planId) }}% (Books: {{ completedBooksInPlan(plan.planId) }}/{{
                            booksInPlan(plan.planId) }}, Other: {{ completedOtherContentInPlan(plan.planId) }}/{{
                            otherContentInPlan(plan.planId) }})
                    </p>
                    <div class="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-2">
                        <div :style="{ width: planProgress(plan.planId) + '%' }"
                            :class="planProgress(plan.planId) === 100 ? 'bg-green-500' : 'bg-blue-500'"
                            class="h-2.5 rounded-full"></div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Books Section -->
        <div v-if="!error" class="mb-8">
            <button @click="toggleSection('books')"
                class="w-full flex justify-between items-center bg-gray-100 dark:bg-gray-700 p-4 rounded-lg shadow-md hover:bg-gray-200 dark:hover:bg-gray-600 transition duration-200">
                <h2 class="text-xl font-semibold dark:text-white">Books ({{ completedBooks }}/{{ books.length }})</h2>
                <span class="text-gray-600 dark:text-gray-300 text-xl">{{ booksOpen ? '−' : '+' }}</span>
            </button>
            <div v-if="booksOpen" class="mt-4 space-y-4">
                <div class="flex items-center justify-between">
                    <p class="dark:text-white">Overall Reading Progress: {{ overallBookProgress }}%</p>
                    <div class="w-1/2 bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                        <div :style="{ width: overallBookProgress + '%' }" class="bg-blue-500 h-2.5 rounded-full"></div>
                    </div>
                </div>
                <div v-for="book in books" :key="book.bookId" class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                    <h3 class="text-lg font-medium dark:text-white">{{ book.title }}</h3>
                    <p class="text-sm text-gray-600 dark:text-gray-300">Author: {{ book.author || 'Unknown' }}</p>
                    <p class="text-sm dark:text-white">
                        Pages: {{ book.currentPage || 0 }} / {{ book.totalPages }} ({{ bookProgress(book.currentPage,
                            book.totalPages) }}%)
                    </p>
                    <div class="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-2">
                        <div :style="{ width: bookProgress(book.currentPage, book.totalPages) + '%' }"
                            :class="book.currentPage >= book.totalPages ? 'bg-green-500' : 'bg-blue-500'"
                            class="h-2.5 rounded-full"></div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Other Content Section -->
        <div v-if="!error" class="mb-8">
            <button @click="toggleSection('otherContent')"
                class="w-full flex justify-between items-center bg-gray-100 dark:bg-gray-700 p-4 rounded-lg shadow-md hover:bg-gray-200 dark:hover:bg-gray-600 transition duration-200">
                <h2 class="text-xl font-semibold dark:text-white">Other Content ({{ completedOtherContent }}/{{
                    otherContent.length }})</h2>
                <span class="text-gray-600 dark:text-gray-300 text-xl">{{ otherContentOpen ? '−' : '+' }}</span>
            </button>
            <div v-if="otherContentOpen" class="mt-4 space-y-4">
                <div class="flex items-center justify-between">
                    <p class="dark:text-white">Overall Other Content Progress: {{ overallOtherContentProgress }}%</p>
                    <div class="w-1/2 bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                        <div :style="{ width: overallOtherContentProgress + '%' }"
                            class="bg-blue-500 h-2.5 rounded-full"></div>
                    </div>
                </div>
                <div v-for="content in otherContent" :key="content.contentId"
                    class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                    <h3 class="text-lg font-medium dark:text-white">{{ content.title }}</h3>
                    <p class="text-sm text-gray-600 dark:text-gray-300">Type: {{ content.otherType || 'N/A' }}</p>
                    <a v-if="content.link" :href="content.link" target="_blank"
                        class="text-blue-500 hover:underline text-sm">
                        View Content
                    </a>
                    <p class="text-sm dark:text-white">
                        Progress: {{ otherContentProgress(content.progressNote) }}%
                    </p>
                    <div class="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-2">
                        <div :style="{ width: otherContentProgress(content.progressNote) + '%' }"
                            :class="isOtherContentCompleted(content.progressNote) ? 'bg-green-500' : 'bg-blue-500'"
                            class="h-2.5 rounded-full"></div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Error Display -->
        <div v-if="error" class="mt-6 p-4 bg-red-100 dark:bg-red-900 rounded-lg shadow-md text-center">
            <p class="text-red-700 dark:text-red-300 font-medium">{{ error }}</p>
            <button @click="retryLoad"
                class="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-200">
                Retry
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useUserStore } from '~/stores/user';
import { useRouter } from 'nuxt/app';
import { getStudyPlans } from '~/client/api/study-plans';
import { getBooks } from '~/client/api/books';
import { getOtherContents } from '~/client/api/other-content';

function debounce(fn, wait) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn(...args), wait);
    };
}

const SECTION_STATES_KEY = 'sectionStates';

function loadSectionStates() {
    const savedStates = localStorage.getItem(SECTION_STATES_KEY);
    return savedStates ? JSON.parse(savedStates) : {
        studyPlansOpen: false,
        booksOpen: true,
        otherContentOpen: false
    };
}

function saveSectionStates(states) {
    localStorage.setItem(SECTION_STATES_KEY, JSON.stringify(states));
}

definePageMeta({
    middleware: ['auth'],
});

const userStore = useUserStore();
const router = useRouter();
const studyPlans = ref([]);
const books = ref([]);
const otherContent = ref([]);
const error = ref('');
const loading = ref(false);
const cachedDataLoaded = ref(false);

const initialStates = loadSectionStates();
const studyPlansOpen = ref(initialStates.studyPlansOpen);
const booksOpen = ref(initialStates.booksOpen);
const otherContentOpen = ref(initialStates.otherContentOpen);

async function loadData(retryCount = 0) {
    if (!userStore.user) {
        error.value = 'User not authenticated. Redirecting to login...';
        setTimeout(() => router.push('/login'), 2000);
        return;
    }

    loading.value = true;
    error.value = '';
    try {
        const user = userStore.user;
        const [plansResponse, booksResponse, contentResponse] = await Promise.all([
            getStudyPlans(user),
            getBooks(user),
            getOtherContents(user),
        ]);
        studyPlans.value = plansResponse || [];
        books.value = booksResponse || [];
        otherContent.value = contentResponse || [];
        cachedDataLoaded.value = true;
    } catch (err) {
        if (retryCount < 3) {
            const delay = Math.pow(2, retryCount) * 1000;
            error.value = `Failed to load data (attempt ${retryCount + 1}/3). Retrying in ${delay / 1000}s...`;
            setTimeout(() => loadData(retryCount + 1), delay);
        } else {
            error.value = err.message || 'Failed to load progress data after 3 attempts';
        }
    } finally {
        loading.value = false;
    }
}

function toggleSection(section) {
    if (section === 'studyPlans') studyPlansOpen.value = !studyPlansOpen.value;
    else if (section === 'books') booksOpen.value = !booksOpen.value;
    else if (section === 'otherContent') otherContentOpen.value = !otherContentOpen.value;

    saveSectionStates({
        studyPlansOpen: studyPlansOpen.value,
        booksOpen: booksOpen.value,
        otherContentOpen: otherContentOpen.value
    });
}

onMounted(() => loadData());

const retryLoad = debounce(() => loadData(), 500);

const completedBooks = computed(() => books.value.filter((book) => (book.currentPage || 0) >= book.totalPages).length);
const completedOtherContent = computed(() =>
    otherContent.value.filter((content) => isOtherContentCompleted(content.progressNote)).length
);
const completedPlans = computed(() =>
    studyPlans.value.filter((plan) => {
        const totalBooks = booksInPlan(plan.planId);
        const totalOtherContent = otherContentInPlan(plan.planId);
        const completedBooksCount = completedBooksInPlan(plan.planId);
        const completedOtherContentCount = completedOtherContentInPlan(plan.planId);
        return (totalBooks + totalOtherContent) > 0 && (completedBooksCount + completedOtherContentCount) === (totalBooks + totalOtherContent);
    }).length
);

const overallBookProgress = computed(() => {
    if (books.value.length === 0) return 0;
    const totalPages = books.value.reduce((sum, book) => sum + book.totalPages, 0);
    const pagesRead = books.value.reduce((sum, book) => sum + (book.currentPage || 0), 0);
    return Math.round((pagesRead / totalPages) * 100) || 0;
});

const overallStudyPlansProgress = computed(() => {
    if (studyPlans.value.length === 0) return 0;
    const totalProgress = studyPlans.value.reduce((sum, plan) => sum + planProgress(plan.planId), 0);
    return Math.round(totalProgress / studyPlans.value.length) || 0;
});

const overallOtherContentProgress = computed(() => {
    if (otherContent.value.length === 0) return 0;
    const totalProgress = otherContent.value.reduce((sum, content) => sum + otherContentProgress(content.progressNote), 0);
    return Math.round(totalProgress / otherContent.value.length) || 0;
});

function bookProgress(currentPage, totalPages) {
    return totalPages ? Math.round(((currentPage || 0) / totalPages) * 100) : 0;
}

function booksInPlan(planId) {
    return books.value.filter((book) => book.planId === planId).length;
}

function completedBooksInPlan(planId) {
    return books.value.filter((book) => book.planId === planId && (book.currentPage || 0) >= book.totalPages).length;
}

function otherContentInPlan(planId) {
    return otherContent.value.filter((content) => content.planId === planId).length;
}

function completedOtherContentInPlan(planId) {
    return otherContent.value.filter((content) => content.planId === planId && isOtherContentCompleted(content.progressNote)).length;
}

function isOtherContentCompleted(progressNote) {
    const completedStatuses = ['Complete', 'Completed', 'OK'];
    return progressNote && completedStatuses.includes(progressNote.trim());
}

function otherContentProgress(progressNote) {
    return isOtherContentCompleted(progressNote) ? 100 : 0;
}

function planProgress(planId) {
    const totalBooks = booksInPlan(planId);
    const totalOtherContent = otherContentInPlan(planId);
    const totalItems = totalBooks + totalOtherContent;
    if (totalItems === 0) return 0;
    const completedBooksCount = completedBooksInPlan(planId);
    const completedOtherContentCount = completedOtherContentInPlan(planId);
    const completedItems = completedBooksCount + completedOtherContentCount;
    return Math.round((completedItems / totalItems) * 100);
}
</script>