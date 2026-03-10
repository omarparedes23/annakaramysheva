<template>
  <div class="pt-20" v-if="collection">
    <!-- ─── Hero ─────────────────────────────────────────── -->
    <section class="relative h-[55vh] min-h-[400px] flex items-end overflow-hidden">
      <!-- Background -->
      <div class="absolute inset-0 bg-bone-100">
        <NuxtImg
          v-if="heroImage"
          :src="heroImage"
          :alt="imageAlt"
          :width="1600"
          :height="900"
          class="w-full h-full object-cover"
          loading="eager"
          fit="cover"
          preload
        />
      </div>
      <div class="absolute inset-0 bg-gradient-to-t from-jet-900/60 via-jet-900/20 to-transparent" />

      <!-- Text -->
      <div class="container-editorial relative pb-16">
        <p class="label text-white/60 mb-4">
          {{ $t('collection.label') }}
          <span v-if="collection.year"> — {{ collection.year }}</span>
        </p>
        <h1 class="display-lg text-white">{{ title }}</h1>
      </div>
    </section>

    <!-- ─── Description ───────────────────────────────────── -->
    <section v-if="description" class="section-sm bg-white border-b border-bone-200">
      <div class="container-editorial">
        <p class="font-serif italic text-xl text-jet-500 max-w-2xl leading-relaxed">
          {{ description }}
        </p>
      </div>
    </section>

    <!-- ─── Products ──────────────────────────────────────── -->
    <section class="section bg-bone-50">
      <div class="container-editorial">
        <div v-if="!products?.length" class="py-32 text-center">
          <p class="font-serif text-2xl text-jet-400">{{ $t('gallery.empty') }}</p>
        </div>

        <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
          <ProductCard
            v-for="product in products"
            :key="product.id"
            :product="product"
          />
        </div>
      </div>
    </section>
  </div>

  <div v-else class="pt-40 pb-40 text-center container-editorial">
    <p class="font-serif text-4xl font-light text-jet-400 mb-6">{{ $t('errors.collection_not_found') }}</p>
    <AppButton variant="ghost" tag="NuxtLink" :to="localePath('/gallery')">
      {{ $t('gallery.heading') }}
    </AppButton>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const route = useRoute()
const localePath = useLocalePath()
const { t } = useI18n()
const { fetchCollectionBySlug, localize } = useCollections()
const { fetchProductsByCollection } = useProducts()

const slug = route.params.slug as string

const { data: collection } = await useAsyncData(
  `collection-${slug}`,
  () => fetchCollectionBySlug(slug),
)

if (!collection.value) {
  throw createError({ statusCode: 404, message: 'Collection not found' })
}

const { data: products } = await useAsyncData(
  `collection-products-${slug}`,
  () => fetchProductsByCollection(collection.value!.id),
)

const title       = computed(() => localize(collection.value?.title))
const description = computed(() => localize(collection.value?.description))
const heroImage   = computed(() => (products.value?.[0]?.product_images?.[0]?.image_url) ?? null)
const imageAlt    = computed(() =>
  `${title.value} collection by Anna Karamysheva${collection.value?.year ? ' ' + collection.value.year : ''}`
)

useSeo({
  title: title.value,
  description: description.value || `${title.value} — collection by Anna Karamysheva`,
  image: heroImage.value ?? undefined,
  imageAlt: imageAlt.value,
})
</script>
