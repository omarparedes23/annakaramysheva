<template>
  <div>
    <!-- ─── Hero ─────────────────────────────────────────── -->
    <section class="relative h-screen min-h-[600px] flex items-end overflow-hidden">
      <!-- Background image -->
      <div class="absolute inset-0">
        <NuxtImg
          v-if="heroProduct"
          :src="heroProduct.product_images?.[0]?.image_url ?? ''"
          :alt="`${heroProductTitle} by Anna Karamysheva`"
          :width="1920"
          :height="1080"
          class="w-full h-full object-cover"
          loading="eager"
          fit="cover"
          preload
        />
        <div v-else class="w-full h-full bg-bone-200" />
      </div>

      <!-- Dark gradient overlay -->
      <div class="absolute inset-0 bg-gradient-to-t from-jet-900/70 via-jet-900/20 to-transparent" />

      <!-- Hero content -->
      <div class="container-editorial relative pb-20 md:pb-28">
        <div class="max-w-2xl">
          <p class="label text-white/60 mb-6">{{ $t('home.hero_label') }}</p>
          <h1 class="display-xl text-white mb-6 text-balance">
            {{ $t('home.hero_tagline') }}
          </h1>
          <p class="font-serif italic text-white/70 text-xl mb-10">
            «Любимая. Счастливая. Особенная.»
          </p>
          <AppButton
            variant="ghost-bone"
            tag="NuxtLink"
            :to="localePath('/gallery')"
          >
            {{ $t('home.hero_cta') }}
          </AppButton>
        </div>
      </div>

      <!-- Scroll indicator -->
      <div class="absolute bottom-8 right-8 md:right-16 flex flex-col items-center gap-2 text-white/50">
        <span class="label text-white/40 text-2xs rotate-90 mb-6">Scroll</span>
        <div class="w-px h-16 bg-white/20 relative overflow-hidden">
          <div class="w-full bg-white/60 animate-scroll-line absolute top-0" style="height: 40%; animation: scrollLine 2s ease-in-out infinite;" />
        </div>
      </div>
    </section>

    <!-- ─── Brand Statement ───────────────────────────────── -->
    <section class="section bg-white">
      <div class="container-editorial">
        <div class="max-w-3xl mx-auto text-center">
          <p class="label text-bone-500 mb-8">{{ $t('home.about_label') }}</p>
          <h2 class="display-md text-jet-900 text-balance leading-snug mb-8">
            {{ $t('home.about_heading') }}
          </h2>
          <p class="font-sans text-sm font-light text-jet-500 leading-relaxed max-w-xl mx-auto">
            {{ $t('home.about_text') }}
          </p>
        </div>
      </div>
    </section>

    <!-- ─── Featured Products ─────────────────────────────── -->
    <section class="section bg-bone-50">
      <div class="container-editorial">
        <div class="flex items-end justify-between mb-14">
          <h2 class="display-md text-jet-900">{{ $t('home.featured_heading') }}</h2>
          <NuxtLink
            :to="localePath('/gallery')"
            class="hidden md:block font-sans text-xs tracking-widest uppercase text-jet-500 hover:text-jet-900 transition-colors duration-200"
          >
            {{ $t('home.view_all') }} →
          </NuxtLink>
        </div>

        <!-- Loading -->
        <div v-if="pending" class="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
          <div v-for="i in 3" :key="i" class="aspect-3/4 bg-bone-100 animate-pulse" />
        </div>

        <!-- Products grid -->
        <div v-else-if="featuredProducts.length" class="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
          <ProductCard
            v-for="product in featuredProducts"
            :key="product.id"
            :product="product"
          />
        </div>

        <!-- Mobile view all -->
        <div class="mt-12 text-center md:hidden">
          <AppButton variant="ghost" tag="NuxtLink" :to="localePath('/gallery')">
            {{ $t('home.view_all') }}
          </AppButton>
        </div>
      </div>
    </section>

    <!-- ─── Editorial Strip ───────────────────────────────── -->
    <section class="bg-jet-900 py-24">
      <div class="container-editorial">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <p class="label text-bone-600 mb-6">{{ $t('home.philosophy_label') }}</p>
            <h2 class="font-serif text-4xl md:text-5xl font-light text-white leading-tight mb-8">
              {{ $t('home.philosophy_heading') }}
            </h2>
            <p class="font-sans text-sm font-light text-bone-400 leading-relaxed mb-10">
              {{ $t('home.philosophy_text') }}
            </p>
            <AppButton variant="ghost-bone" tag="NuxtLink" :to="localePath('/contact')">
              {{ $t('home.contact_cta') }}
            </AppButton>
          </div>

          <!-- Quotes -->
          <div class="space-y-8 border-l border-bone-700 pl-10">
            <blockquote
              v-for="(quote, i) in quotes"
              :key="i"
              class="font-serif italic text-xl text-bone-300 leading-relaxed"
            >
              "{{ quote }}"
            </blockquote>
          </div>
        </div>
      </div>
    </section>

    <!-- ─── Contact teaser ────────────────────────────────── -->
    <section class="section bg-white">
      <div class="container-editorial text-center">
        <p class="label text-bone-500 mb-6">{{ $t('home.inquiry_label') }}</p>
        <h2 class="display-md text-jet-900 mb-10">{{ $t('home.inquiry_heading') }}</h2>
        <AppButton variant="primary" tag="NuxtLink" :to="localePath('/contact')" size="lg">
          {{ $t('home.inquiry_cta') }}
        </AppButton>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const localePath = useLocalePath()
const { t } = useI18n()
const { fetchPublishedProducts, localize } = useProducts()

const { data: products, pending } = await useAsyncData('home-products', fetchPublishedProducts)

const featuredProducts = computed(() => (products.value ?? []).slice(0, 3))

const heroProduct = computed(() => products.value?.[0] ?? null)
const heroProductTitle = computed(() => heroProduct.value ? localize(heroProduct.value.title) : '')

const quotes = computed(() => [
  t('home.quote_1'),
  t('home.quote_2'),
])

// SEO
useSeo({
  title: undefined,
  description: t('seo.home_description'),
  image: heroProduct.value?.product_images?.[0]?.image_url,
  imageAlt: heroProductTitle.value ? `${heroProductTitle.value} by Anna Karamysheva` : undefined,
})
</script>

<style scoped>
@keyframes scrollLine {
  0%   { transform: translateY(-100%); }
  100% { transform: translateY(300%); }
}
</style>
