<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
    <header class="bg-white dark:bg-gray-800 shadow">
      <nav class="container mx-auto px-4 py-4 flex justify-between items-center">
        <div class="flex space-x-4">
          <NuxtLink to="/" class="hover:text-blue-500">Home</NuxtLink>
          <NuxtLink to="/study-plans" class="hover:text-blue-500">Study Plans</NuxtLink>
          <NuxtLink to="/books" class="hover:text-blue-500">Books</NuxtLink>
          <NuxtLink to="/other-content" class="hover:text-blue-500">Other Content</NuxtLink>
          <NuxtLink to="/notes" class="hover:text-blue-500">Notes</NuxtLink>
          <NuxtLink to="/progress" class="hover:text-blue-500">Progress</NuxtLink>
        </div>
        <div class="flex items-center space-x-4">
          <button @click="toggleDarkMode" class="bg-gray-200 dark:bg-gray-700 p-2 rounded">
            <span v-if="isDark">Light Mode</span>
            <span v-else>Dark Mode</span>
          </button>
          <template v-if="user">
            <button @click="logout" class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
              Logout
            </button>
          </template>
          <template v-else>
            <NuxtLink to="/login" class="hover:text-blue-500">Login</NuxtLink>
            <NuxtLink to="/register" class="hover:text-blue-500">Register</NuxtLink>
          </template>
        </div>
      </nav>
    </header>
    <main class="container mx-auto px-4 py-8">
      <NuxtPage />
    </main>
  </div>
</template>

<script setup>
import { useUserStore } from '~/stores/user';
import { useRouter } from 'nuxt/app';
import { onMounted, computed } from 'vue';

const userStore = useUserStore();
const router = useRouter();

const user = computed(() => userStore.user);
const isDark = computed(() => document.documentElement.classList.contains('dark'));

onMounted(() => {
  if (localStorage.getItem('darkMode') === 'true') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
});

async function logout() {
  try {
    await $fetch('/api/logout', { method: 'POST' });
    userStore.logout();
    router.push('/login');
  } catch (error) {
    console.error('Logout failed:', error);
  }
}

function toggleDarkMode() {
  const isDarkMode = document.documentElement.classList.toggle('dark');
  localStorage.setItem('darkMode', isDarkMode);
}
</script>