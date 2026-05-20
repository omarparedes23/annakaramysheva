// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  components: {
    dirs: [
      {
        path: '~/components',
        pathPrefix: false,
      },
    ],
  },

  modules: [
    '@nuxtjs/supabase',
    '@nuxt/image',
    '@nuxtjs/i18n',
    '@nuxtjs/tailwindcss',
  ],

  // ─── Supabase ────────────────────────────────────────────
  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY,
    redirectOptions: {
      login: '/admin/login',
      callback: '/admin/dashboard',
      exclude: [
        '/',
        '/gallery',
        '/contact',
        '/privacy',
        '/products/*',
        '/collections/*',
        '/en',
        '/en/*',
      ],
    },
  },

  // ─── i18n ────────────────────────────────────────────────
  i18n: {
    locales: [
      { code: 'en', name: 'English', file: 'en.json' },
      { code: 'ru', name: 'Русский', file: 'ru.json' },
    ],
    defaultLocale: 'ru',
    langDir: 'locales/',
    strategy: 'prefix_except_default',
    detectBrowserLanguage: false,
    vueI18n: './i18n.config.ts',
  },

  // ─── Image ───────────────────────────────────────────────
  image: {
    quality: 85,
    format: ['avif', 'webp', 'jpg'],
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536,
    },
    providers: {
      supabase: {
        name: 'supabase',
        provider: '~/providers/supabase.ts',
        options: {
          baseURL: process.env.SUPABASE_URL + '/storage/v1/object/public',
        },
      },
      r2: {
        name: 'r2',
        provider: '~/providers/r2.ts',
        options: {
          baseURL: process.env.R2_PUBLIC_URL,
        },
      },
    },
    domains: [
      (process.env.SUPABASE_URL || '').replace('https://', ''),
      (process.env.R2_PUBLIC_URL || '').replace('https://', ''),
    ],
  },

  // ─── Runtime Config ──────────────────────────────────────
  runtimeConfig: {
    r2AccountId: process.env.R2_ACCOUNT_ID,
    r2AccessKeyId: process.env.R2_ACCESS_KEY_ID,
    r2SecretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    r2BucketName: process.env.R2_BUCKET_NAME || 'annakaramysheva',
    public: {
      r2PublicUrl: process.env.R2_PUBLIC_URL || '',
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_KEY,
      siteUrl: process.env.SITE_URL || 'https://annakaramysheva.com',
      siteName: 'Anna Karamysheva',
      siteDescription: 'Luxury fashion designer from Voronezh. Loved. Happy. Special.',
    },
  },

  // ─── App ─────────────────────────────────────────────────
  app: {
    head: {
      htmlAttrs: { lang: 'ru' },
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      title: 'Anna Karamysheva — dress & design',
      meta: [
        { name: 'description', content: 'Любимая. Счастливая. Особенная. Luxury fashion designer from Voronezh, Russia.' },
        { name: 'theme-color', content: '#0a0a0a' },
        { property: 'og:site_name', content: 'Anna Karamysheva' },
        { property: 'og:type', content: 'website' },
        { name: 'robots', content: 'index, follow' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Inter:wght@300;400;500&display=swap',
        },
      ],
    },
  },

  // ─── CSS ─────────────────────────────────────────────────
  css: ['~/assets/css/main.css'],

  // ─── TypeScript ──────────────────────────────────────────
  typescript: {
    strict: true,
    typeCheck: false,
  },
})
