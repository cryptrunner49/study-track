<template>
    <div class="flex flex-col items-center justify-center min-h-screen">
        <h1 class="text-4xl font-bold mb-4">Welcome to StudyTrack</h1>
        <p class="text-xl mb-8">Your all-in-one companion for organizing reading and study goals.</p>
        <div class="space-x-4">
            <NuxtLink to="/login" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Login
            </NuxtLink>
            <NuxtLink to="/register" class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                Register
            </NuxtLink>
        </div>
    </div>
</template>

<script setup>
</script>