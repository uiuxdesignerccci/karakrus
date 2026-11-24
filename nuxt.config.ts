export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: true },
  typescript: { strict: true, typeCheck: false },
  css: [
    '@fontsource/dm-sans/400.css',
    '@fontsource/dm-sans/500.css',
    '@fontsource/dm-sans/600.css',
    '@fontsource/dm-sans/700.css',
    '@fontsource/montserrat/600.css',
    '@fontsource/montserrat/700.css',
    '@fontsource/montserrat/800.css',
    '@fontsource/montserrat/900.css',
    '@fontsource/manrope/400.css',
    '@fontsource/manrope/500.css',
    '@fontsource/manrope/600.css',
    '@fontsource/manrope/800.css',
    '~/assets/css/main.css',
  ],
  app: {
    head: {
      title: 'Kara Krus · The live coin club',
      htmlAttrs: { lang: 'en' },
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'color-scheme', content: 'light dark' },
        { name: 'theme-color', content: '#f4f0ff' },
      ],
      script: [
        {
          // Apply the saved theme (or the system preference) before first paint to avoid a flash.
          innerHTML: "try{var t=localStorage.getItem('kk-theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark')}catch(e){}",
        },
      ],
    },
  },
})
