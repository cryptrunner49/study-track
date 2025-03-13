<template>
    <div class="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <form @submit.prevent="registerUser"
            class="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md space-y-6"
            aria-labelledby="registerHeading">
            <h1 id="registerHeading" class="text-3xl font-bold text-center dark:text-white">
                Create Account
            </h1>

            <div class="space-y-4">
                <!-- Name Input -->
                <div>
                    <label for="name" class="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                        Name
                    </label>
                    <input id="name" v-model="name" type="text" required placeholder="John Doe" autocomplete="name"
                        class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white" />
                </div>

                <!-- Email Input -->
                <div>
                    <label for="email" class="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                        Email
                    </label>
                    <input id="email" v-model="email" type="email" required placeholder="you@example.com"
                        autocomplete="email"
                        class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white" />
                </div>

                <!-- Password Input -->
                <div class="relative">
                    <label for="password" class="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                        Password
                    </label>
                    <input :type="showPassword ? 'text' : 'password'" id="password" v-model="password" required
                        placeholder="••••••••" autocomplete="new-password"
                        class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                        aria-describedby="passwordHelp" />
                    <button type="button" @click="togglePassword"
                        class="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-600 dark:text-gray-300"
                        :aria-label="showPassword ? 'Hide password' : 'Show password'">
                        <span v-if="showPassword">Hide</span>
                        <span v-else>Show</span>
                    </button>
                </div>

                <!-- Confirm Password Input -->
                <div class="relative">
                    <label for="confirmPassword" class="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                        Confirm Password
                    </label>
                    <input :type="showConfirmPassword ? 'text' : 'password'" id="confirmPassword"
                        v-model="confirmPassword" required placeholder="••••••••" autocomplete="new-password"
                        class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                        aria-describedby="confirmPasswordHelp" />
                    <button type="button" @click="toggleConfirmPassword"
                        class="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-600 dark:text-gray-300"
                        :aria-label="showConfirmPassword ? 'Hide password' : 'Show password'">
                        <span v-if="showConfirmPassword">Hide</span>
                        <span v-else>Show</span>
                    </button>
                </div>
            </div>

            <button type="submit"
                class="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition duration-200">
                Register
            </button>

            <p v-if="error" class="text-red-500 text-center mt-4">{{ error }}</p>

            <p class="text-center text-sm text-gray-700 dark:text-gray-300">
                Already have an account?
                <a href="/login" class="text-green-500 hover:underline">Login</a>
            </p>
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
const confirmPassword = ref('');
const error = ref('');
const showPassword = ref(false);
const showConfirmPassword = ref(false);

const userStore = useUserStore();
const router = useRouter();

function togglePassword() {
    showPassword.value = !showPassword.value;
}

function toggleConfirmPassword() {
    showConfirmPassword.value = !showConfirmPassword.value;
}

async function registerUser() {
    if (password.value !== confirmPassword.value) {
        error.value = "Passwords do not match";
        return;
    }
    try {
        const user = await register({ name: name.value, email: email.value, password: password.value });
        userStore.setUser(user);
        router.push('/');
    } catch (err) {
        error.value = err.message || 'Registration failed';
    }
}
</script>