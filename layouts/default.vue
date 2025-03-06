<!-- layouts/default.vue -->
<template>
    <div :class="darkMode ? 'dark' : ''">
        <header class="bg-white dark:bg-gray-800 p-4 shadow">
            <nav class="container mx-auto flex justify-between items-center">
                <div>
                    <NuxtLink to="/" class="text-blue-500 hover:underline">Home</NuxtLink>
                    <NuxtLink to="/study-plans" class="text-blue-500 hover:underline ml-4">Study Plans</NuxtLink>
                    <NuxtLink to="/books" class="text-blue-500 hover:underline ml-4">Books</NuxtLink>
                    <NuxtLink to="/other-content" class="text-blue-500 hover:underline ml-4">Other Content</NuxtLink>
                    <NuxtLink to="/notes" class="text-blue-500 hover:underline ml-4">Notes</NuxtLink>
                </div>
                <button @click="toggleDarkMode" class="bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded">
                    {{ darkMode ? 'Light Mode' : 'Dark Mode' }}
                </button>
            </nav>
        </header>
        <main class="container mx-auto p-4">
            <slot />
        </main>
    </div>
</template>

<script setup>
import { ref } from 'vue';

const darkMode = ref(false);

function toggleDarkMode() {
    darkMode.value = !darkMode.value;
}
</script>