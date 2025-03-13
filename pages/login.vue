<template>
    <div class="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <form @submit.prevent="loginUser"
            class="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md space-y-6"
            aria-labelledby="loginHeading">
            <h1 id="loginHeading" class="text-3xl font-bold text-center dark:text-white">
                Welcome Back
            </h1>

            <div>
                <label for="email" class="block mb-1 text-gray-700 dark:text-gray-300">
                    Email Address
                </label>
                <input id="email" v-model="email" type="email" required autocomplete="username"
                    placeholder="you@example.com"
                    class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
            </div>

            <div class="relative">
                <label for="password" class="block mb-1 text-gray-700 dark:text-gray-300">
                    Password
                </label>
                <input :type="showPassword ? 'text' : 'password'" id="password" v-model="password" required
                    autocomplete="current-password" placeholder="********"
                    class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    aria-describedby="passwordHelp" />
                <button type="button" @click="togglePassword"
                    class="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-600 dark:text-gray-300"
                    :aria-label="showPassword ? 'Hide password' : 'Show password as plain text. Warning: this will display your password on the screen.'">
                    <span v-if="showPassword">Hide</span>
                    <span v-else>Show</span>
                </button>
            </div>

            <div class="flex items-center justify-between">
                <div class="flex items-center">
                    <input id="remember" type="checkbox" v-model="remember"
                        class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                    <label for="remember" class="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                        Remember me
                    </label>
                </div>
                <div>
                    <a href="/forgot-password" class="text-sm text-blue-600 hover:underline dark:text-blue-400">
                        Forgot password?
                    </a>
                </div>
            </div>

            <button type="submit"
                class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition duration-200">
                Login
            </button>

            <p v-if="error" class="text-red-500 text-center">{{ error }}</p>
        </form>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useUserStore } from '~/stores/user';
import { useRouter } from 'nuxt/app';
import { login } from '~/client/api/auth';

const email = ref('');
const password = ref('');
const error = ref('');
const remember = ref(false);
const showPassword = ref(false);

const userStore = useUserStore();
const router = useRouter();

function togglePassword() {
    showPassword.value = !showPassword.value;
}

async function loginUser() {
    try {
        const { user, token } = await login({
            email: email.value,
            password: password.value,
        });
        if (remember.value) {
            localStorage.setItem('authToken', token);
        }
        userStore.setUser({ ...user, token });
        router.push('/');
    } catch (err) {
        error.value = err.message || 'Login failed. Please try again.';
    }
}
</script>