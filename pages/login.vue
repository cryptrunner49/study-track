<template>
    <div class="flex flex-col items-center justify-center min-h-screen">
        <h1 class="text-3xl font-bold mb-8">Login</h1>
        <form @submit.prevent="login" class="w-full max-w-sm">
            <div class="mb-4">
                <label for="email" class="block text-gray-700 dark:text-gray-300">Email</label>
                <input id="email" v-model="email" type="email"
                    class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white" required />
            </div>
            <div class="mb-6">
                <label for="password" class="block text-gray-700 dark:text-gray-300">Password</label>
                <input id="password" v-model="password" type="password"
                    class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white" required />
            </div>
            <button type="submit" class="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Login
            </button>
        </form>
        <p v-if="error" class="text-red-500 mt-4">{{ error }}</p>
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
        const response = await $fetch('/api/login', {
            method: 'POST',
            body: { email: email.value, password: password.value },
        });
        userStore.setUser(response);
        router.push('/');
    } catch (err) {
        error.value = 'Login failed: ' + err.message;
    }
}
</script>