<template>
  <div
    class="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
    <header class="bg-white dark:bg-gray-800 shadow sticky top-0 z-50">
      <nav class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <!-- Logo/Brand -->
          <NuxtLink to="/" class="px-0 mr-6 text-xl font-bold hover:text-blue-500 transition-colors duration-200">
            StudyTrack
          </NuxtLink>

          <!-- Desktop Navigation -->
          <div class="hidden min-[800px]:flex max-[799px]:hidden items-center space-x-8">
            <div class="flex space-x-6">
              <NuxtLink v-for="link in navLinks" :key="link.to" :to="link.to"
                class="relative py-1 hover:text-blue-500 font-medium transition-colors duration-200 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-blue-500 after:transition-all after:duration-300 hover:after:w-full">
                {{ link.text }}
              </NuxtLink>
            </div>

            <!-- Right Side Controls -->
            <div class="flex items-center space-x-4">
              <button @click="toggleDarkMode"
                class="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
                title="Toggle theme">
                <span class="text-xl">{{ isDark ? '☀️' : '🌙' }}</span>
              </button>

              <template v-if="user">
                <div class="relative" ref="dropdown">
                  <button @click="toggleDropdown" class="flex items-center space-x-2 hover:text-blue-500">
                    <span>{{ user.username }}</span>
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div v-if="showDropdown"
                    class="absolute right-0 mt-3 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl py-2 transform translate-y-1 scale-95 origin-top-right transition-all duration-150 ease-out border border-gray-200 dark:border-gray-700 z-50">
                    <button @click="logout"
                      class="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">Logout</button>
                  </div>
                </div>
              </template>
              <template v-else>
                <NuxtLink to="/login"
                  class="px-4 py-2 rounded-full bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-500 dark:hover:text-blue-400 font-medium transition-colors duration-200">
                  Login</NuxtLink>
                <NuxtLink to="/register"
                  class="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 font-medium">Register
                </NuxtLink>
              </template>
            </div>
          </div>

          <!-- Mobile Menu Button -->
          <button @click="toggleMobileMenu" class="max-[799px]:block min-[800px]:hidden p-2">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path v-if="!mobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16" />
              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Mobile Navigation -->
        <div v-if="mobileMenuOpen"
          class="max-[799px]:block min-[800px]:hidden mt-4 pb-4 border-t border-gray-200 dark:border-gray-700">
          <div class="flex flex-col space-y-4">
            <NuxtLink v-for="link in navLinks" :key="link.to" :to="link.to" @click="mobileMenuOpen = false"
              class="py-2 hover:text-blue-500 font-medium">
              {{ link.text }}
            </NuxtLink>
            <template v-if="user">
              <NuxtLink to="/profile" class="py-2 hover:text-blue-500 font-medium">Profile</NuxtLink>
              <button @click="logout" class="py-2 text-red-600 font-medium text-left">Logout</button>
            </template>
          </div>
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
import { ref, onMounted, onUnmounted } from 'vue';

const userStore = useUserStore();
const router = useRouter();

const user = computed(() => userStore.user);
const isDark = ref(false);
const mobileMenuOpen = ref(false);
const showDropdown = ref(false);

const navLinks = [
  { to: '/', text: 'Home' },
  { to: '/study-plans', text: 'Study Plans' },
  { to: '/books', text: 'Books' },
  { to: '/other-content', text: 'Other Content' },
  { to: '/notes', text: 'Notes' },
  { to: '/progress', text: 'Progress' },
];

// Dark mode handling
onMounted(() => {
  const savedDarkMode = localStorage.getItem('darkMode') === 'true';
  isDark.value = savedDarkMode;
  document.documentElement.classList.toggle('dark', savedDarkMode);

  // Close dropdown on outside click
  document.addEventListener('click', handleOutsideClick);
});

onUnmounted(() => {
  document.removeEventListener('click', handleOutsideClick);
});

function toggleDarkMode() {
  isDark.value = !isDark.value;
  document.documentElement.classList.toggle('dark');
  localStorage.setItem('darkMode', isDark.value.toString());
}

function toggleMobileMenu() {
  mobileMenuOpen.value = !mobileMenuOpen.value;
}

function toggleDropdown() {
  showDropdown.value = !showDropdown.value;
}

function handleOutsideClick(event) {
  if (!event.target.closest('.relative')) {
    showDropdown.value = false;
  }
}

async function logout() {
  try {
    await $fetch('/api/logout', { method: 'POST', credentials: 'include' });
    userStore.clearUser();
    router.push('/login');
    mobileMenuOpen.value = false;
    showDropdown.value = false;
  } catch (error) {
    console.error('Logout failed:', error);
  }
}
</script>
