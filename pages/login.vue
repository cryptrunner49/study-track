<template>
    <div class="flex items-center justify-center min-h-screen">
        <form @submit.prevent="login" class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md w-full max-w-md">
            <h1 class="text-2xl font-bold mb-6 dark:text-white">Login</h1>
            <div class="space-y-4">
                <div>
                    <label for="email" class="block text-gray-700 dark:text-gray-300">Email</label>
                    <input id="email" v-model="email" type="email"
                        class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required />
                </div>
                <div>
                    <label for="password" class="block text-gray-700 dark:text-gray-300">Password</label>
                    <input id="password" v-model="password" type="password"
                        class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required />
                </div>
                <button type="submit"
                    class="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded transition duration-200">
                    Login
                </button>
            </div>
            <p v-if="error" class="text-red-500 mt-4">{{ error }}</p>
        </form>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useUserStore } from '~/stores/user';
import { useRouter } from 'nuxt/app';

const email = ref('');
const password = ref('');
const error = ref('');
const userStore = useUserStore();
const router = useRouter();

async function login() {
    try {
        const userData = await $fetch('/api/login', {
            method: 'POST',
            body: { email: email.value, password: password.value },
            credentials: 'include',
        });
        userStore.setUser(userData);
        router.push('/');
    } catch (err) {
        error.value = err.data?.statusMessage || 'Login failed: An unexpected error occurred';
    }
}
</script>