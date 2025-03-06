// nuxt.config.ts
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: ['@nuxt/ui', '@nuxtjs/supabase'],
  colorMode: {
    preference: 'light'
  },
  supabase: {
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      exclude: ['/', '/reset-password', '/update-password'],
    },
    cookieOptions: {
      secure: process.env.NODE_ENV === 'production'
    }
  },
  app: {
    pageTransition: { name: 'page', mode: 'out-in' }
  }
})