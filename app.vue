<template>
  <div
    class="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
    <header class="bg-white dark:bg-gray-800 shadow">
      <nav class="container mx-auto px-4 py-4 flex justify-between items-center">
        <div class="flex space-x-6">
          <NuxtLink to="/" class="hover:text-blue-500 font-medium">Home</NuxtLink>
          <NuxtLink to="/study-plans" class="hover:text-blue-500 font-medium">Study Plans</NuxtLink>
          <NuxtLink to="/books" class="hover:text-blue-500 font-medium">Books</NuxtLink>
          <NuxtLink to="/other-content" class="hover:text-blue-500 font-medium">Other Content</NuxtLink>
          <NuxtLink to="/notes" class="hover:text-blue-500 font-medium">Notes</NuxtLink>
          <NuxtLink to="/progress" class="hover:text-blue-500 font-medium">Progress</NuxtLink>
        </div>
        <div class="flex items-center space-x-4">
          <button @click="toggleDarkMode"
            class="flex items-center bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium py-2 px-4 rounded-full transition-colors duration-200">
            <span v-if="isDark" class="mr-2">☀️</span>
            <span v-else class="mr-2">🌙</span>
            {{ isDark ? 'Light Mode' : 'Dark Mode' }}
          </button>
          <template v-if="user">
            <button @click="logout"
              class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full transition-colors duration-200">
              Logout
            </button>
          </template>
          <template v-else>
            <NuxtLink to="/login" class="hover:text-blue-500 font-medium">Login</NuxtLink>
            <NuxtLink to="/register" class="hover:text-blue-500 font-medium">Register</NuxtLink>
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
import { ref, onMounted } from 'vue';

const userStore = useUserStore();
const router = useRouter();

const user = computed(() => userStore.user);
const isDark = ref(false);

onMounted(() => {
  // Initialize dark mode from localStorage
  const savedDarkMode = localStorage.getItem('darkMode') === 'true';
  isDark.value = savedDarkMode;
  if (savedDarkMode) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
});

function toggleDarkMode() {
  isDark.value = !isDark.value;
  if (isDark.value) {
    document.documentElement.classList.add('dark');
    localStorage.setItem('darkMode', 'true');
  } else {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('darkMode', 'false');
  }
}

async function logout() {
  try {
    await $fetch('/api/logout', { method: 'POST', credentials: 'include' });
    userStore.logout();
    router.push('/login');
  } catch (error) {
    console.error('Logout failed:', error);
  }
}
</script>