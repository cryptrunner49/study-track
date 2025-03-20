// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: ['@pinia/nuxt', '@nuxtjs/tailwindcss'],
  css: ['@mdi/font/css/materialdesignicons.css', '~/assets/css/tailwind.css'],
  app: {
    baseURL: '/study-track/',
    buildAssetsDir: 'assets',
    head: {
      link: [
        // SVG favicon
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      ],
    }
  },
  vite: {
    server: {
      watch: {
        usePolling: true,
      },
    },
  },
  ssr: false,

});
