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
        <span>/</span>
        <span class="text-jet-700">{{ title }}</span>
      </nav>
    </div>

    <!-- ─── Product Layout ────────────────────────────────── -->
    <section class="container-editorial pb-24 md:pb-40">
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
        <h2 class="display-md text-jet-900 mb-14">{{ $t('product.you_may_like') }}</h2>
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

const productDetails = [
  { key: 'product.details_label', value: 'product.details_text' },
  { key: 'product.care_label',    value: 'product.care_text' },
  { key: 'product.shipping_label', value: 'product.shipping_text' },
]

// SEO
const ogImage = product.value?.product_images?.[0]?.image_url
useSeo({
  title: title.value,
  description: description.value ? description.value.slice(0, 160) : `${title.value} — luxury dress by Anna Karamysheva`,
  image: ogImage,
  imageAlt: imageAlt.value,
  type: 'product',
})
</script>
