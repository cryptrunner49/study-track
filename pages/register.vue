<template>
    <div class="flex items-center justify-center min-h-screen">
        <form @submit.prevent="registerUser" class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md w-full max-w-md">
            <h1 class="text-3xl font-bold mb-6 dark:text-white">Register</h1>
            <div class="space-y-4">
                <div>
                    <label for="name" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Name</label>
                    <input id="name" v-model="name" type="text"
                        class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                        required />
                </div>
                <div>
                    <label for="email" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Email</label>
                    <input id="email" v-model="email" type="email"
                        class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                        required />
                </div>
                <div>
                    <label for="password"
                        class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Password</label>
                    <input id="password" v-model="password" type="password"
                        class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                        required />
                </div>
                <button type="submit"
                    class="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-3 px-4 rounded transition duration-200">
                    Register
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
import { register } from '~/client/api/auth';

const name = ref('');
const email = ref('');
const password = ref('');
const error = ref('');
const userStore = useUserStore();
const router = useRouter();

async function registerUser() {
    try {
        const user = await register({ name: name.value, email: email.value, password: password.value });
        userStore.setUser(user);
        router.push('/');
    } catch (err) {
        error.value = err.message || 'Registration failed';
    }
}
</script>