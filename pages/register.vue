<template>
    <div class="flex flex-col items-center justify-center min-h-screen">
        <h1 class="text-3xl font-bold mb-8">Register</h1>
        <form @submit.prevent="register" class="w-full max-w-sm">
            <div class="mb-4">
                <label for="name" class="block text-gray-700 dark:text-gray-300">Name</label>
                <input id="name" v-model="name" type="text"
                    class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white" required />
            </div>
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
            <button type="submit" class="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                Register
            </button>
        </form>
        <p v-if="error" class="text-red-500 mt-4">{{ error }}</p>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useUserStore } from '~/stores/user';
import { useRouter } from 'nuxt/app';

const name = ref('');
const email = ref('');
const password = ref('');
const error = ref('');
const userStore = useUserStore();
const router = useRouter();

async function register() {
    try {
        const response = await $fetch('/api/register', {
            method: 'POST',
            body: { name: name.value, email: email.value, password: password.value },
        });
        userStore.setUser(response);
        router.push('/dashboard');
    } catch (err) {
        error.value = 'Registration failed: ' + err.message;
    }
}
</script>