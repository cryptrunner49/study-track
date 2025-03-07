<template>
  <div class="py-8 max-w-6xl mx-auto">
    <div class="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6">
      <h1 class="text-3xl font-bold mb-6 text-gray-900 dark:text-white tracking-tight">Edit Note</h1>
      <form @submit.prevent="updateNote" class="space-y-6">
        <div>
          <label for="associationType" class="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
            Associate With
          </label>
          <select id="associationType" v-model="note.type"
            class="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 transition-all"
            required @change="note.id = ''">
            <option value="" disabled>Select Type</option>
            <option value="plan">Study Plan</option>
            <option value="book">Book</option>
            <option value="content">Other Content</option>
          </select>
        </div>
        <div v-if="note.type">
          <label for="associationId" class="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
            {{ associationLabel }}
          </label>
          <select id="associationId" v-model="note.id"
            class="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 transition-all"
            required>
            <option value="" disabled>Select an Item</option>
            <option v-if="note.type === 'plan'" v-for="plan in studyPlans" :key="plan.planId" :value="plan.planId">
              {{ plan.title }}
            </option>
            <option v-if="note.type === 'book'" v-for="book in books" :key="book.bookId" :value="book.bookId">
              {{ book.title }} (Plan: {{ getPlanTitle(book.planId) }})
            </option>
            <option v-if="note.type === 'content'" v-for="content in otherContent" :key="content.contentId"
              :value="content.contentId">
              {{ content.title }} ({{ content.otherType || 'N/A' }})
            </option>
          </select>
        </div>
        <div>
          <div class="flex items-center space-x-4 mb-2">
            <label for="content" class="text-gray-700 dark:text-gray-200 font-semibold">Note Editor</label>
            <div class="flex space-x-2">
              <button type="button" @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
                :class="{ 'bg-gray-200 dark:bg-gray-600': editor.isActive('heading', { level: 1 }) }"
                class="px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 transition-colors">
                H1
              </button>
              <button type="button" @click="editor.chain().focus().toggleBold().run()"
                :class="{ 'bg-gray-200 dark:bg-gray-600': editor.isActive('bold') }"
                class="px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 transition-colors">
                <strong>B</strong>
              </button>
              <button type="button" @click="editor.chain().focus().toggleItalic().run()"
                :class="{ 'bg-gray-200 dark:bg-gray-600': editor.isActive('italic') }"
                class="px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 transition-colors">
                <em>I</em>
              </button>
              <button type="button" @click="editor.chain().focus().toggleCodeBlock().run()"
                :class="{ 'bg-gray-200 dark:bg-gray-600': editor.isActive('codeBlock') }"
                class="px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 transition-colors">
                <code>Code</code>
              </button>
              <button type="button" @click="editor.chain().focus().toggleHighlight().run()"
                :class="{ 'bg-gray-200 dark:bg-gray-600': editor.isActive('highlight') }"
                class="px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 transition-colors">
                <span>✨</span>
              </button>
              <button type="button" @click="addImage"
                class="px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 transition-colors">
                <span>🖼️</span>
              </button>
            </div>
          </div>
          <div class="relative w-full border border-gray-300 dark:border-gray-600 rounded-lg">
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
              <button @click="editor.chain().focus().toggleHighlight().run()"
                :class="{ 'bg-gray-200 dark:bg-gray-600': editor.isActive('highlight') }"
                class="px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-500">
                <span>✨</span>
              </button>
              <button @click="addImage" class="px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-500">
                <span>🖼️</span>
              </button>
            </BubbleMenu>
            <EditorContent :editor="editor" class="tiptap" />
          </div>
        </div>
        <div class="flex space-x-4">
          <button type="submit"
            class="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200">
            Update Note
          </button>
          <button type="button" @click="cancelEdit"
            class="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200">
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
import { useRoute, useRouter } from 'nuxt/app';
import { useUserStore } from '~/stores/user';
import { Editor, EditorContent, BubbleMenu } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import Heading from '@tiptap/extension-heading';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import Highlight from '@tiptap/extension-highlight';
import { createLowlight } from 'lowlight';
import hljs from 'highlight.js';

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

import 'highlight.js/styles/github-dark.css';
import { getNote, updateNote as updateNoteAPI } from '~/client/api/notes';
import { getStudyPlans } from '~/client/api/study-plans';
import { getBooks } from '~/client/api/books';
import { getOtherContents } from '~/client/api/other-content';

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

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const note = ref({ type: '', id: '', content: '' });
const studyPlans = ref([]);
const books = ref([]);
const otherContent = ref([]);
const error = ref('');

const editor = new Editor({
  content: '',
  extensions: [
    StarterKit.configure({ codeBlock: false }),
    Heading.configure({ levels: [1, 2, 3] }),
    CodeBlockLowlight.configure({ lowlight, defaultLanguage: 'javascript', HTMLAttributes: { class: 'hljs' } }),
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    Placeholder.configure({ placeholder: 'Write here... Markdown supported!' }),
    Image.configure({ inline: true, allowBase64: true }),
    Highlight.configure({ multicolor: false }),
  ],
  onUpdate: ({ editor }) => {
    note.value.content = editor.getHTML();
  },
});

const associationLabel = computed(() => {
  if (note.value.type === 'plan') return 'Study Plan';
  if (note.value.type === 'book') return 'Book';
  return 'Other Content';
});

onMounted(async () => {
  if (!userStore.user) {
    error.value = 'User not authenticated';
    router.push('/login');
    return;
  }
  try {
    const [fetchedNote, plansData, booksData, contentData] = await Promise.all([
      getNote(route.params.id, userStore.user),
      getStudyPlans(userStore.user),
      getBooks(userStore.user),
      getOtherContents(userStore.user),
    ]);
    note.value = {
      content: fetchedNote.content,
      type: fetchedNote.planId ? 'plan' : fetchedNote.bookId ? 'book' : 'content',
      id: fetchedNote.planId || fetchedNote.bookId || fetchedNote.contentId || '',
    };
    editor.commands.setContent(fetchedNote.content);
    studyPlans.value = plansData;
    books.value = booksData;
    otherContent.value = contentData;
  } catch (err) {
    error.value = `Failed to load note: ${err.message}`;
  }
});

onBeforeUnmount(() => {
  if (editor) editor.destroy();
});

async function updateNote() {
  if (!userStore.user) {
    error.value = 'User not authenticated';
    return;
  }
  if (!note.value.type || !note.value.id || !note.value.content) {
    error.value = 'All fields are required';
    return;
  }
  try {
    const payload = {
      content: note.value.content,
      ...(note.value.type === 'plan' && { planId: Number(note.value.id) }),
      ...(note.value.type === 'book' && { bookId: Number(note.value.id) }),
      ...(note.value.type === 'content' && { contentId: Number(note.value.id) }),
    };
    await updateNoteAPI(route.params.id, userStore.user, payload);
    error.value = '';
    router.push('/notes');
  } catch (err) {
    error.value = `Failed to update note: ${err.message}`;
  }
}

function cancelEdit() {
  router.push('/notes');
}

function getPlanTitle(planId) {
  const plan = studyPlans.value.find((p) => p.planId === planId);
  return plan ? plan.title : 'N/A';
}

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
</script>

<style>
.tiptap {
  @apply w-full min-h-[100px] p-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 rounded-b-lg focus:outline-none border-t border-gray-300 dark:border-gray-600;
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

.tiptap mark {
  @apply bg-yellow-200 dark:bg-yellow-600 text-gray-900 dark:text-gray-200 px-0.5 rounded;
}
</style>