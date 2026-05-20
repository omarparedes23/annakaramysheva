<template>
  <div class="pt-20" v-if="product">
    <!-- ─── Breadcrumb ─────────────────────────────────────── -->
    <div class="container-editorial py-6">
      <nav class="flex items-center gap-2 font-sans text-xs tracking-widest uppercase text-jet-400">
        <NuxtLink :to="localePath('/')" class="hover:text-jet-900 transition-colors">
          {{ $t('nav.home') }}
        </NuxtLink>
        <span>/</span>
        <NuxtLink :to="localePath('/gallery')" class="hover:text-jet-900 transition-colors">
          {{ $t('nav.products') }}
        </NuxtLink>
        <template v-if="showCommercialInfo">
          <span>/</span>
          <span class="text-jet-700">{{ title }}</span>
        </template>
      </nav>
    </div>

    <!-- ─── Product Layout ────────────────────────────────── -->

    <!-- Portfolio mode: collection carousel (one photo per piece, navigates URLs) -->
    <section v-if="!showCommercialInfo" class="container-editorial pb-24 md:pb-40">
      <div class="max-w-2xl mx-auto">

        <!-- Arrows outside image: flex row [←] [media] [→] -->
        <div
          class="flex items-center gap-4 md:gap-6"
          @touchstart="onSwipeStart"
          @touchend="onSwipeEnd"
        >
          <!-- Left arrow slot (always occupies space to keep image centered) -->
          <div class="w-8 flex-shrink-0 flex justify-center">
            <button
              v-if="prevProduct && collectionProducts.length > 1"
              class="text-jet-400 hover:text-jet-900 transition-colors duration-200 p-1"
              aria-label="Anterior"
              @click="goToProduct(prevProduct.slug)"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>

          <!-- Cover media: key on slug forces full DOM remount on navigation -->
          <div :key="product.slug" class="flex-1 aspect-3/4 bg-bone-100 overflow-hidden">
            <video
              v-if="coverMedia?.media_type === 'video'"
              ref="videoEl"
              :src="coverMedia.image_url"
              class="w-full h-full object-cover"
              autoplay
              muted
              loop
              playsinline
            />
            <NuxtImg
              v-else-if="coverMedia"
              :src="coverMedia.image_url"
              :alt="imageAlt"
              :width="1200"
              :height="1600"
              class="w-full h-full object-cover"
              loading="eager"
              fit="cover"
            />
          </div>

          <!-- Right arrow slot -->
          <div class="w-8 flex-shrink-0 flex justify-center">
            <button
              v-if="nextProduct && collectionProducts.length > 1"
              class="text-jet-400 hover:text-jet-900 transition-colors duration-200 p-1"
              aria-label="Siguiente"
              @click="goToProduct(nextProduct.slug)"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Dots: one per piece in the collection -->
        <div v-if="collectionProducts.length > 1" class="flex justify-center gap-2 mt-4">
          <NuxtLink
            v-for="p in collectionProducts"
            :key="p.id"
            :to="localePath(`/products/${p.slug}`)"
            class="w-1.5 h-1.5 rounded-full transition-colors duration-200"
            :class="p.id === product.id ? 'bg-jet-900' : 'bg-bone-400'"
          />
        </div>

        <!-- Collection name -->
        <div v-if="collectionTitle" class="mt-6 text-center">
          <NuxtLink
            v-if="product.collections"
            :to="localePath(`/collections/${(product.collections as any).slug}`)"
            class="label text-bone-500 hover:text-jet-900 transition-colors"
          >
            {{ collectionTitle }}
            <span v-if="(product.collections as any).year"> — {{ (product.collections as any).year }}</span>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Commercial mode: 2-column grid with product details -->
    <section v-else class="container-editorial pb-24 md:pb-40">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 xl:gap-28">

        <!-- Gallery -->
        <div>
          <ProductGallery
            :images="product.product_images ?? []"
            :alt="imageAlt"
          />
        </div>

        <!-- Details -->
        <div class="lg:pt-8 xl:pt-16">
          <!-- Collection badge -->
          <div v-if="collectionTitle" class="mb-6">
            <NuxtLink
              v-if="product.collections"
              :to="localePath(`/collections/${(product.collections as any).slug}`)"
              class="label text-bone-500 hover:text-jet-900 transition-colors"
            >
              {{ collectionTitle }}
              <span v-if="(product.collections as any).year"> — {{ (product.collections as any).year }}</span>
            </NuxtLink>
          </div>

          <!-- Title -->
          <h1 class="font-serif text-4xl md:text-5xl font-light text-jet-900 leading-tight mb-6">
            {{ title }}
          </h1>

          <!-- Price -->
          <p v-if="product.price" class="font-sans text-lg font-light text-jet-700 mb-8">
            {{ formattedPrice }}
          </p>

          <!-- Status -->
          <div class="mb-8">
            <span v-if="product.status === 'sold_out'" class="badge-sold-out">
              {{ $t('product.sold_out') }}
            </span>
            <span v-else-if="product.status === 'published'" class="label text-jet-500">
              {{ $t('product.available') }}
            </span>
          </div>

          <!-- Divider -->
          <div class="divider mb-8" />

          <!-- Description -->
          <div
            v-if="description"
            class="font-sans text-sm font-light text-jet-600 leading-relaxed mb-12 prose-editorial"
            v-html="formattedDescription"
          />

          <!-- CTA -->
          <div class="space-y-4">
            <a
              v-if="product.external_link && product.status !== 'sold_out'"
              :href="product.external_link"
              target="_blank"
              rel="noopener noreferrer"
              class="btn-primary w-full text-center block"
            >
              {{ $t('product.consult_availability') }}
            </a>

            <NuxtLink
              :to="localePath('/contact')"
              class="btn-ghost w-full text-center block"
            >
              {{ $t('product.ask_question') }}
            </NuxtLink>
          </div>

          <!-- Details accordion -->
          <div class="mt-16 space-y-0 divide-y divide-bone-200">
            <details
              v-for="detail in productDetails"
              :key="detail.key"
              class="group py-5"
            >
              <summary class="flex items-center justify-between cursor-pointer list-none">
                <span class="caption">{{ $t(detail.key) }}</span>
                <svg
                  class="w-4 h-4 text-jet-400 transition-transform duration-200 group-open:rotate-45"
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4v16m8-8H4" />
                </svg>
              </summary>
              <p class="mt-4 font-sans text-sm font-light text-jet-500 leading-relaxed">
                {{ $t(detail.value) }}
              </p>
            </details>
          </div>
        </div>
      </div>
    </section>

    <!-- ─── Related products ───────────────────────────────── -->
    <section v-if="relatedProducts.length" class="section bg-bone-50">
      <div class="container-editorial">
        <h2 v-if="showCommercialInfo" class="display-md text-jet-900 mb-14">{{ $t('product.you_may_like') }}</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          <ProductCard
            v-for="p in relatedProducts"
            :key="p.id"
            :product="p"
          />
        </div>
      </div>
    </section>
  </div>

  <!-- Not found -->
  <div v-else class="pt-40 pb-40 text-center container-editorial">
    <p class="font-serif text-4xl font-light text-jet-400 mb-6">{{ $t('errors.product_not_found') }}</p>
    <AppButton variant="ghost" tag="NuxtLink" :to="localePath('/gallery')">
      {{ $t('gallery.heading') }}
    </AppButton>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const route = useRoute()
const localePath = useLocalePath()
const { t, locale } = useI18n()
const { fetchProductBySlug, fetchPublishedProducts, localize, formatPrice } = useProducts()
const config = useRuntimeConfig()
const showCommercialInfo = config.public.showCommercialInfo as boolean

const slug = route.params.slug as string

const [{ data: product }, { data: allProducts }] = await Promise.all([
  useAsyncData(`product-${slug}`, () => fetchProductBySlug(slug)),
  useAsyncData('all-products-related', fetchPublishedProducts),
])

if (!product.value) {
  throw createError({ statusCode: 404, message: 'Product not found' })
}

const title           = computed(() => localize(product.value?.title))
const description     = computed(() => localize(product.value?.description))
const collectionTitle = computed(() => {
  const col = product.value?.collections as any
  if (!col) return ''
  return localize(col.title)
})
const formattedPrice  = computed(() => formatPrice(product.value?.price ?? null))
const imageAlt        = computed(() => `${title.value} by Anna Karamysheva`)

// Simple line-break to paragraph
const formattedDescription = computed(() =>
  description.value.split('\n\n').map(p => `<p>${p}</p>`).join('')
)

const relatedProducts = computed(() =>
  (allProducts.value ?? [])
    .filter(p => p.id !== product.value?.id && p.collection_id === product.value?.collection_id)
    .slice(0, 4)
)

// Collection carousel (portfolio mode)
const collectionProducts = computed(() =>
  (allProducts.value ?? []).filter(p => p.collection_id === product.value?.collection_id)
)

const currentIndex = computed(() =>
  collectionProducts.value.findIndex(p => p.id === product.value?.id)
)

const prevProduct = computed(() =>
  currentIndex.value > 0 ? collectionProducts.value[currentIndex.value - 1] : null
)

const nextProduct = computed(() =>
  currentIndex.value < collectionProducts.value.length - 1
    ? collectionProducts.value[currentIndex.value + 1]
    : null
)

const coverMedia = computed(() =>
  product.value?.product_images?.find(m => m.media_type === 'video')
  || product.value?.product_images?.[0]
  || null
)

// Swipe mobile
const swipeTouchStartX = ref(0)
const minSwipeDistance = 50

const onSwipeStart = (e: TouchEvent) => {
  swipeTouchStartX.value = e.changedTouches[0].screenX
}
const onSwipeEnd = (e: TouchEvent) => {
  const diff = e.changedTouches[0].screenX - swipeTouchStartX.value
  if (Math.abs(diff) < minSwipeDistance) return
  if (diff > 0 && prevProduct.value) {
    goToProduct(prevProduct.value.slug)
  } else if (diff < 0 && nextProduct.value) {
    goToProduct(nextProduct.value.slug)
  }
}

const goToProduct = (slug: string) => {
  if (coverMedia.value?.media_type === 'video') {
    window.location.href = localePath(`/products/${slug}`)
  } else {
    navigateTo(localePath(`/products/${slug}`))
  }
}

// Stop and unload video before ANY navigation to prevent
// STATUS_ACCESS_VIOLATION (Chromium crashes when a playing <video>
// is destroyed mid-decode during SPA route transitions)
const videoEl = ref<HTMLVideoElement | null>(null)

onBeforeRouteLeave(() => {
  if (videoEl.value) {
    videoEl.value.pause()
    videoEl.value.src = ''
    videoEl.value.load()
  }
})

const productDetails = [
  { key: 'product.details_label', value: 'product.details_text' },
  { key: 'product.care_label',    value: 'product.care_text' },
  { key: 'product.shipping_label', value: 'product.shipping_text' },
]

// SEO — only images work as OG tags, never videos
const ogImage = product.value?.product_images?.find(m => m.media_type === 'image')?.image_url
useSeo({
  title: title.value,
  description: description.value ? description.value.slice(0, 160) : `${title.value} — luxury dress by Anna Karamysheva`,
  image: ogImage,
  imageAlt: imageAlt.value,
  type: 'product',
})
</script>
