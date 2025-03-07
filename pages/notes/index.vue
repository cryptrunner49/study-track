<template>
    <div class="py-4 max-w-5xl mx-auto">
        <h1 class="text-2xl font-bold mb-6 dark:text-white">Your Notes</h1>

        <!-- Notes List Section -->
        <div v-if="!isCreatingNote" class="space-y-4">
            <!-- Toolbar -->
            <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 flex flex-col sm:flex-row gap-4">
                <div class="flex-1">
                    <label for="filterType" class="block text-sm text-gray-700 dark:text-gray-300 font-medium mb-1">
                        Filter by Type
                    </label>
                    <select id="filterType" v-model="filter.type"
                        class="w-full px-2 py-1 border rounded dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        @change="filter.id = ''; applyFilters()">
                        <option value="">All Types</option>
                        <option value="plan">Study Plan</option>
                        <option value="book">Book</option>
                        <option value="content">Other Content</option>
                    </select>
                </div>
                <div class="flex-1">
                    <label for="filterName" class="block text-sm text-gray-700 dark:text-gray-300 font-medium mb-1">
                        Search by Name
                    </label>
                    <input id="filterName" v-model="filter.name" type="text" placeholder="Enter name..."
                        class="w-full px-2 py-1 border rounded dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        @input="applyFilters" />
                </div>
                <div class="flex-1">
                    <label for="filterId" class="block text-sm text-gray-700 dark:text-gray-300 font-medium mb-1">
                        Filter by Specific Item
                    </label>
                    <select id="filterId" v-model="filter.id"
                        class="w-full px-2 py-1 border rounded dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        :disabled="!filter.type" @change="applyFilters">
                        <option value="">All Items</option>
                        <option v-if="filter.type === 'plan'" v-for="plan in studyPlans" :key="plan.planId"
                            :value="plan.planId">
                            {{ plan.title }}
                        </option>
                        <option v-if="filter.type === 'book'" v-for="book in books" :key="book.bookId"
                            :value="book.bookId">
                            {{ book.title }} (Plan: {{ getPlanTitle(book.planId) }})
                        </option>
                        <option v-if="filter.type === 'content'" v-for="content in otherContent"
                            :key="content.contentId" :value="content.contentId">
                            {{ content.title }} ({{ content.otherType || 'N/A' }})
                        </option>
                    </select>
                </div>
                <button @click="isCreatingNote = true"
                    class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded transition-colors duration-200 self-end">
                    Add Note
                </button>
            </div>

            <!-- Notes List -->
            <div class="space-y-3">
                <div v-for="note in filteredNotes" :key="note.noteId"
                    class="bg-white dark:bg-gray-800 shadow-sm rounded-md p-3 transition-all duration-200 hover:shadow-md">
                    <!-- Content (Main Focus) -->
                    <div class="note-content mb-2 dark:text-gray-200 text-sm">
                        <div v-html="note.content"></div>
                    </div>
                    <!-- Metadata and Actions -->
                    <div
                        class="flex flex-col sm:flex-row sm:justify-between sm:items-center border-t dark:border-gray-700 pt-2 text-xs text-gray-600 dark:text-gray-400">
                        <div class="space-y-1 sm:space-y-0 sm:space-x-4">
                            <span><strong>With:</strong> {{ getAssociationDisplay(note) }}</span>
                            <span><strong>Created:</strong> {{ formatDate(note.createdDate) }}</span>
                        </div>
                        <div class="mt-2 sm:mt-0 flex space-x-3">
                            <NuxtLink :to="`/notes/${note.noteId}`"
                                class="text-blue-500 hover:underline hover:text-blue-700 transition-colors">
                                Edit
                            </NuxtLink>
                            <button @click="deleteNote(note.noteId)"
                                class="text-red-500 hover:underline hover:text-red-700 transition-colors">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
                <div v-if="filteredNotes.length === 0"
                    class="bg-white dark:bg-gray-800 shadow-sm rounded-md p-3 text-center dark:text-gray-300 text-sm">
                    No notes found.
                </div>
            </div>
        </div>

        <!-- Create New Note Form Section -->
        <div v-if="isCreatingNote" class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
            <h2 class="text-xl font-bold mb-4 dark:text-white">Add a New Note</h2>
            <form @submit.prevent="createNote" class="space-y-4">
                <div>
                    <label for="associationType" class="block text-gray-700 dark:text-gray-300 font-medium mb-1">
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
                    <label for="associationId" class="block text-gray-700 dark:text-gray-300 font-medium mb-1">
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
                        class="flex-1 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200">
                        Create Note
                    </button>
                    <button type="button" @click="cancelNoteCreation"
                        class="flex-1 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200">
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

// Import Highlight.js languages
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
const filteredNotes = ref([]);
const studyPlans = ref([]);
const books = ref([]);
const otherContent = ref([]);
const newNote = ref({ type: 'book', id: '', content: '' });
const error = ref('');
const isCreatingNote = ref(false);
const filter = ref({ type: '', name: '', id: '' }); // Filter state

// TipTap Editor setup
const editor = new Editor({
    content: '',
    extensions: [
        StarterKit.configure({ codeBlock: false }),
        Heading.configure({ levels: [1, 2, 3] }),
        CodeBlockLowlight.configure({ lowlight, defaultLanguage: 'javascript', HTMLAttributes: { class: 'hljs' } }),
        TextAlign.configure({ types: ['heading', 'paragraph'] }),
        Placeholder.configure({ placeholder: 'Write here... Markdown supported!' }),
        Image.configure({ inline: true, allowBase64: true }),
    ],
    onUpdate: ({ editor }) => {
        newNote.value.content = editor.getHTML();
    },
});

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
    if (editor) editor.destroy();
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
        console.log('Fetching data...');
        const [notesData, plansData, booksData, contentData] = await Promise.all([
            $fetch('/api/notes', { credentials: 'include' }),
            $fetch('/api/study-plans', { credentials: 'include' }),
            $fetch('/api/books', { credentials: 'include' }),
            $fetch('/api/other-content', { credentials: 'include' }),
        ]);
        notes.value = notesData;
        filteredNotes.value = notesData; // Initialize filteredNotes
        studyPlans.value = plansData;
        books.value = booksData;
        otherContent.value = contentData;
        console.log('Data fetched:', { notesData, plansData, booksData, contentData });
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
        notes.value.push(createdNote);
        filteredNotes.value = notes.value; // Update filteredNotes
        newNote.value = { type: 'book', id: '', content: '' };
        editor.commands.setContent('');
        error.value = '';
        isCreatingNote.value = false;
        applyFilters(); // Reapply filters after creation
    } catch (err) {
        console.error('Create note error:', err);
        error.value = 'Failed to create note: ' + (err.data?.statusMessage || err.message);
    }
}

function cancelNoteCreation() {
    newNote.value = { type: 'book', id: '', content: '' };
    editor.commands.setContent('');
    error.value = '';
    isCreatingNote.value = false;
}

async function deleteNote(noteId) {
    try {
        await $fetch(`/api/notes/${noteId}`, { method: 'DELETE', credentials: 'include' });
        notes.value = notes.value.filter((note) => note.noteId !== noteId);
        applyFilters(); // Reapply filters after deletion
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

// Filter Logic
function applyFilters() {
    let result = [...notes.value];

    // Filter by type
    if (filter.value.type) {
        result = result.filter((note) => {
            if (filter.value.type === 'plan') return !!note.planId;
            if (filter.value.type === 'book') return !!note.bookId;
            if (filter.value.type === 'content') return !!note.contentId;
            return true;
        });
    }

    // Filter by specific ID
    if (filter.value.id) {
        result = result.filter((note) => {
            if (filter.value.type === 'plan') return note.planId === Number(filter.value.id);
            if (filter.value.type === 'book') return note.bookId === Number(filter.value.id);
            if (filter.value.type === 'content') return note.contentId === Number(filter.value.id);
            return false;
        });
    }

    // Filter by name (case-insensitive)
    if (filter.value.name) {
        const searchTerm = filter.value.name.toLowerCase();
        result = result.filter((note) => {
            const title = getAssociationDisplay(note).toLowerCase();
            return title.includes(searchTerm);
        });
    }

    filteredNotes.value = result;
}
</script>

<style>
/* Editor Styles */
.tiptap {
    @apply w-full min-h-[100px] p-2 dark:bg-gray-800 dark:text-gray-200 focus:outline-none rounded-b;
}

.tiptap p {
    @apply my-1 text-sm;
}

.tiptap h1 {
    @apply text-xl font-bold my-2;
}

.tiptap h2 {
    @apply text-lg font-semibold my-1.5;
}

.tiptap h3 {
    @apply text-base font-medium my-1;
}

.tiptap code {
    @apply bg-gray-100 dark:bg-gray-700 rounded px-0.5 py-0.5 text-xs;
}

.tiptap pre {
    @apply bg-gray-100 dark:bg-gray-700 rounded p-2 my-1 font-mono text-xs overflow-auto;
}

.tiptap ul,
.tiptap ol {
    @apply ml-3 my-1;
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
    @apply max-w-full h-auto my-1 rounded;
}

/* Note Content Styles */
.note-content {
    @apply w-1/2;
}

.note-content p {
    @apply my-1 text-sm;
}

.note-content h1 {
    @apply text-xl font-bold my-2;
}

.note-content h2 {
    @apply text-lg font-semibold my-1.5;
}

.note-content h3 {
    @apply text-base font-medium my-1;
}

.note-content code {
    @apply bg-gray-100 dark:bg-gray-700 rounded px-0.5 py-0.5 text-xs;
}

.note-content pre {
    @apply bg-gray-100 dark:bg-gray-700 rounded p-2 my-1 font-mono text-xs overflow-auto;
}

.note-content ul,
.note-content ol {
    @apply ml-3 my-1;
}

.note-content ul li {
    @apply list-disc;
}

.note-content ol li {
    @apply list-decimal;
}

.note-content img {
    @apply max-w-full h-auto my-1 rounded;
}
</style>