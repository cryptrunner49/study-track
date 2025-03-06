<template>
    <div class="py-8 max-w-5xl mx-auto">
        <h1 class="text-3xl font-bold mb-8 dark:text-white">Your Notes</h1>

        <!-- Notes List Section -->
        <div v-if="!isCreatingNote" class="space-y-6">
            <button @click="isCreatingNote = true"
                class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200">
                Add a New Note
            </button>
            <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
                <div class="border-b dark:border-gray-600">
                    <table class="w-full table-auto">
                        <thead>
                            <tr class="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                                <th class="px-4 py-3 text-left w-3/5">Content</th>
                                <th class="px-4 py-3 text-left w-1/5">Associated With</th>
                                <th class="px-4 py-3 text-left w-1/10">Created</th>
                                <th class="px-4 py-3 text-left w-1/10">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="note in notes" :key="note.noteId"
                                class="border-t dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                                <td class="px-4 py-3 dark:text-white">
                                    <div v-html="note.content" class="line-clamp-2"></div>
                                </td>
                                <td class="px-4 py-3 dark:text-white truncate">
                                    {{ getAssociationDisplay(note) }}
                                </td>
                                <td class="px-4 py-3 dark:text-white">
                                    {{ formatDate(note.createdDate) }}
                                </td>
                                <td class="px-4 py-3 space-x-2 whitespace-nowrap">
                                    <NuxtLink :to="`/notes/${note.noteId}`"
                                        class="text-blue-500 hover:underline hover:text-blue-700 transition-colors">
                                        Edit
                                    </NuxtLink>
                                    <button @click="deleteNote(note.noteId)"
                                        class="text-red-500 hover:underline hover:text-red-700 transition-colors">
                                        Delete
                                    </button>
                                </td>
                            </tr>
                            <tr v-if="notes.length === 0" class="border-t dark:border-gray-600">
                                <td colspan="4" class="px-4 py-3 text-center dark:text-white">No notes found.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Create New Note Form Section -->
        <div v-if="isCreatingNote" class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
            <h2 class="text-2xl font-bold mb-6 dark:text-white">Add a New Note</h2>
            <form @submit.prevent="createNote" class="space-y-6">
                <div>
                    <label for="associationType" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                        Associate With
                    </label>
                    <select id="associationType" v-model="newNote.type"
                        class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required @change="newNote.id = ''">
                        <option value="" disabled>Select Type</option>
                        <option value="plan">Study Plan</option>
                        <option value="book">Book</option>
                        <option value="content">Other Content</option>
                    </select>
                </div>
                <div v-if="newNote.type">
                    <label for="associationId" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                        {{ associationLabel }}
                    </label>
                    <select id="associationId" v-model="newNote.id"
                        class="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required>
                        <option value="" disabled>Select an Item</option>
                        <option v-if="newNote.type === 'plan'" v-for="plan in studyPlans" :key="plan.planId"
                            :value="plan.planId">
                            {{ plan.title }}
                        </option>
                        <option v-if="newNote.type === 'book'" v-for="book in books" :key="book.bookId"
                            :value="book.bookId">
                            {{ book.title }} (Plan: {{ getPlanTitle(book.planId) }})
                        </option>
                        <option v-if="newNote.type === 'content'" v-for="content in otherContent"
                            :key="content.contentId" :value="content.contentId">
                            {{ content.title }} ({{ content.otherType || 'N/A' }})
                        </option>
                    </select>
                </div>
                <div>
                    <div class="flex items-center space-x-4 mb-2">
                        <label for="content" class="text-gray-700 dark:text-gray-300 font-medium">
                            Note Editor
                        </label>
                        <div class="flex space-x-2">
                            <button type="button" @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
                                :class="{ 'bg-gray-200 dark:bg-gray-600': editor.isActive('heading', { level: 1 }) }"
                                class="px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200">
                                H1
                            </button>
                            <button type="button" @click="editor.chain().focus().toggleBold().run()"
                                :class="{ 'bg-gray-200 dark:bg-gray-600': editor.isActive('bold') }"
                                class="px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200">
                                <strong>B</strong>
                            </button>
                            <button type="button" @click="editor.chain().focus().toggleItalic().run()"
                                :class="{ 'bg-gray-200 dark:bg-gray-600': editor.isActive('italic') }"
                                class="px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200">
                                <em>I</em>
                            </button>
                            <button type="button" @click="editor.chain().focus().toggleCodeBlock().run()"
                                :class="{ 'bg-gray-200 dark:bg-gray-600': editor.isActive('codeBlock') }"
                                class="px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200">
                                <code>Code</code>
                            </button>
                            <button type="button" @click="addImage"
                                class="px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200">
                                <span>🖼️</span>
                            </button>
                        </div>
                    </div>
                    <div class="relative w-full border rounded dark:border-gray-600">
                        <BubbleMenu :editor="editor" :tippy-options="{ duration: 100 }"
                            class="bg-white dark:bg-gray-700 border dark:border-gray-600 rounded shadow-md p-1 flex space-x-1">
                            <button @click="editor.chain().focus().toggleBold().run()"
                                :class="{ 'bg-gray-200 dark:bg-gray-600': editor.isActive('bold') }"
                                class="px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-500">
                                <strong>B</strong>
                            </button>
                            <button @click="editor.chain().focus().toggleItalic().run()"
                                :class="{ 'bg-gray-200 dark:bg-gray-600': editor.isActive('italic') }"
                                class="px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-500">
                                <em>I</em>
                            </button>
                            <button @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
                                :class="{ 'bg-gray-200 dark:bg-gray-600': editor.isActive('heading', { level: 1 }) }"
                                class="px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-500">
                                H1
                            </button>
                            <button @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
                                :class="{ 'bg-gray-200 dark:bg-gray-600': editor.isActive('heading', { level: 2 }) }"
                                class="px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-500">
                                H2
                            </button>
                            <button @click="editor.chain().focus().toggleCodeBlock().run()"
                                :class="{ 'bg-gray-200 dark:bg-gray-600': editor.isActive('codeBlock') }"
                                class="px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-500">
                                <code>Code</code>
                            </button>
                            <button @click="addImage"
                                class="px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-500">
                                <span>🖼️</span>
                            </button>
                        </BubbleMenu>
                        <EditorContent :editor="editor" class="tiptap" />
                    </div>
                </div>
                <div class="flex space-x-4">
                    <button type="submit"
                        class="flex-1 bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded transition-colors duration-200">
                        Create Note
                    </button>
                    <button type="button" @click="cancelNoteCreation"
                        class="flex-1 bg-gray-500 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded transition-colors duration-200">
                        Cancel
                    </button>
                </div>
            </form>
            <p v-if="error" class="text-red-500 mt-4">{{ error }}</p>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed, onBeforeUnmount } from 'vue';
import { useUserStore } from '~/stores/user';
import { Editor, EditorContent, BubbleMenu } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import Heading from '@tiptap/extension-heading';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import { createLowlight } from 'lowlight';

import c from 'highlight.js/lib/languages/c';
import cpp from 'highlight.js/lib/languages/cpp';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import ruby from 'highlight.js/lib/languages/ruby';
import go from 'highlight.js/lib/languages/go';
import python from 'highlight.js/lib/languages/python';
import markdown from 'highlight.js/lib/languages/markdown';
import css from 'highlight.js/lib/languages/css';
import java from 'highlight.js/lib/languages/java';
import csharp from 'highlight.js/lib/languages/csharp';
import glsl from 'highlight.js/lib/languages/glsl';
import django from 'highlight.js/lib/languages/django';
import xml from 'highlight.js/lib/languages/xml';
import yaml from 'highlight.js/lib/languages/yaml';
import vbscript from 'highlight.js/lib/languages/vbscript';
import vbnet from 'highlight.js/lib/languages/vbnet';
import shell from 'highlight.js/lib/languages/shell';
import scheme from 'highlight.js/lib/languages/scheme';
import rust from 'highlight.js/lib/languages/rust';
import vim from 'highlight.js/lib/languages/vim';
import makefile from 'highlight.js/lib/languages/makefile';
import latex from 'highlight.js/lib/languages/latex';
import json from 'highlight.js/lib/languages/json';
import haskell from 'highlight.js/lib/languages/haskell';
import groovy from 'highlight.js/lib/languages/groovy';
import gradle from 'highlight.js/lib/languages/gradle';
import dockerfile from 'highlight.js/lib/languages/dockerfile';
import cmake from 'highlight.js/lib/languages/cmake';
import basic from 'highlight.js/lib/languages/basic';
import awk from 'highlight.js/lib/languages/awk';
import angelscript from 'highlight.js/lib/languages/angelscript';

import 'highlight.js/styles/github-dark.css'; // Dark theme for Highlight.js

// Initialize lowlight with Highlight.js
const lowlight = createLowlight();
lowlight.register('c', c);
lowlight.register('cpp', cpp);
lowlight.register('javascript', javascript);
lowlight.register('typescript', typescript);
lowlight.register('ruby', ruby);
lowlight.register('go', go);
lowlight.register('python', python);
lowlight.register('markdown', markdown);
lowlight.register('css', css);
lowlight.register('java', java);
lowlight.register('csharp', csharp);
lowlight.register('glsl', glsl);
lowlight.register('django', django);
lowlight.register('xml', xml);
lowlight.register('yaml', yaml);
lowlight.register('vbscript', vbscript);
lowlight.register('vbnet', vbnet);
lowlight.register('shell', shell);
lowlight.register('scheme', scheme);
lowlight.register('rust', rust);
lowlight.register('vim', vim);
lowlight.register('makefile', makefile);
lowlight.register('latex', latex);
lowlight.register('json', json);
lowlight.register('haskell', haskell);
lowlight.register('groovy', groovy);
lowlight.register('gradle', gradle);
lowlight.register('dockerfile', dockerfile);
lowlight.register('cmake', cmake);
lowlight.register('basic', basic);
lowlight.register('awk', awk);
lowlight.register('angelscript', angelscript);

definePageMeta({
    middleware: ['auth'],
});

const userStore = useUserStore();
const notes = ref([]);
const studyPlans = ref([]);
const books = ref([]);
const otherContent = ref([]);
const newNote = ref({ type: 'book', id: '', content: '' });
const error = ref('');
const isCreatingNote = ref(false); // State to toggle between notes list and form

// TipTap Editor setup with image support and Highlight.js
const editor = new Editor({
    content: '',
    extensions: [
        StarterKit.configure({
            codeBlock: false, // Disable default CodeBlock
        }),
        Heading.configure({ levels: [1, 2, 3] }),
        CodeBlockLowlight.configure({
            lowlight,
            defaultLanguage: 'javascript',
            HTMLAttributes: { class: 'hljs' },
        }),
        TextAlign.configure({ types: ['heading', 'paragraph'] }),
        Placeholder.configure({
            placeholder: 'Write here... Markdown supported!',
        }),
        Image.configure({
            inline: true,
            allowBase64: true, // Allow base64 images for simplicity
        }),
    ],
    onUpdate: ({ editor }) => {
        newNote.value.content = editor.getHTML();
    },
});

// Function to add an image via file input
function addImage() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = () => {
        const file = input.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const src = e.target.result;
                editor.chain().focus().setImage({ src }).run();
            };
            reader.readAsDataURL(file);
        }
    };
    input.click();
}

onBeforeUnmount(() => {
    if (editor) {
        editor.destroy();
    }
});

const associationLabel = computed(() => {
    if (newNote.value.type === 'plan') return 'Study Plan';
    if (newNote.value.type === 'book') return 'Book';
    return 'Other Content';
});

onMounted(async () => {
    if (!userStore.user) {
        error.value = 'User not authenticated';
        return;
    }
    try {
        console.log('Fetching notes...');
        const notesData = await $fetch('/api/notes', { credentials: 'include' });
        console.log('Notes fetched:', notesData);
        notes.value = notesData;

        console.log('Fetching study plans...');
        const plansData = await $fetch('/api/study-plans', { credentials: 'include' });
        console.log('Study plans fetched:', plansData);
        studyPlans.value = plansData;

        console.log('Fetching books...');
        const booksData = await $fetch('/api/books', { credentials: 'include' });
        console.log('Books fetched:', booksData);
        books.value = booksData;

        console.log('Fetching other content...');
        const contentData = await $fetch('/api/other-content', { credentials: 'include' });
        console.log('Other content fetched:', contentData);
        otherContent.value = contentData;
    } catch (err) {
        console.error('Fetch error:', err);
        error.value = 'Failed to load data: ' + (err.data?.statusMessage || err.message);
    }
});

async function createNote() {
    if (!newNote.value.type || !newNote.value.id || !newNote.value.content) {
        error.value = 'All fields are required';
        return;
    }
    try {
        console.log('Creating note with:', newNote.value);
        const payload = {
            content: newNote.value.content,
            ...(newNote.value.type === 'plan' && { planId: Number(newNote.value.id) }),
            ...(newNote.value.type === 'book' && { bookId: Number(newNote.value.id) }),
            ...(newNote.value.type === 'content' && { contentId: Number(newNote.value.id) }),
        };
        const createdNote = await $fetch('/api/notes', {
            method: 'POST',
            body: payload,
            credentials: 'include',
        });
        console.log('Note created:', createdNote);
        notes.value.push(createdNote);
        newNote.value = { type: 'book', id: '', content: '' };
        editor.commands.setContent('');
        error.value = '';
        isCreatingNote.value = false; // Switch back to notes list after creation
    } catch (err) {
        console.error('Create note error:', err);
        error.value = 'Failed to create note: ' + (err.data?.statusMessage || err.message);
    }
}

function cancelNoteCreation() {
    newNote.value = { type: 'book', id: '', content: '' };
    editor.commands.setContent('');
    error.value = '';
    isCreatingNote.value = false; // Switch back to notes list
}

async function deleteNote(noteId) {
    try {
        console.log('Deleting note:', noteId);
        await $fetch(`/api/notes/${noteId}`, { method: 'DELETE', credentials: 'include' });
        notes.value = notes.value.filter((note) => note.noteId !== noteId);
        error.value = '';
    } catch (err) {
        console.error('Delete note error:', err);
        error.value = 'Failed to delete note: ' + (err.data?.statusMessage || err.message);
    }
}

function getPlanTitle(planId) {
    const plan = studyPlans.value.find((p) => p.planId === planId);
    return plan ? plan.title : 'N/A';
}

function getBookTitle(bookId) {
    const book = books.value.find((b) => b.bookId === bookId);
    return book ? book.title : 'N/A';
}

function getContentTitle(contentId) {
    const content = otherContent.value.find((c) => c.contentId === contentId);
    return content ? content.title : 'N/A';
}

function getAssociationDisplay(note) {
    if (note.planId) return getPlanTitle(note.planId);
    if (note.bookId) return getBookTitle(note.bookId);
    if (note.contentId) return getContentTitle(note.contentId);
    return 'N/A';
}

function formatDate(dateStr) {
    return dateStr ? new Date(dateStr).toLocaleDateString() : 'N/A';
}
</script>

<style>
.tiptap {
    @apply w-full min-h-[150px] p-4 dark:bg-gray-800 dark:text-gray-200 focus:outline-none rounded-b;
}

.tiptap p {
    @apply my-2 text-base;
}

.tiptap h1 {
    @apply text-3xl font-bold my-4;
}

.tiptap h2 {
    @apply text-2xl font-semibold my-3;
}

.tiptap h3 {
    @apply text-xl font-medium my-2;
}

.tiptap code {
    @apply bg-gray-100 dark:bg-gray-700 rounded px-1 py-0.5 text-sm;
}

.tiptap pre {
    @apply bg-gray-100 dark:bg-gray-700 rounded p-4 my-2 font-mono text-sm overflow-auto;
}

.tiptap ul,
.tiptap ol {
    @apply ml-6 my-2;
}

.tiptap ul li {
    @apply list-disc;
}

.tiptap ol li {
    @apply list-decimal;
}

.tiptap p.is-empty::before {
    content: attr(data-placeholder);
    @apply text-gray-400 dark:text-gray-500;
    float: left;
    height: 0;
    pointer-events: none;
}

.tiptap img {
    @apply max-w-full h-auto my-2 rounded;
}

/* Cleaner table styles */
.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
</style>