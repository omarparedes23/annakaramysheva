<template>
  <div class="pt-20">
    <!-- ─── Page header ───────────────────────────────────── -->
    <section class="section-sm bg-white border-b border-bone-200">
      <div class="container-editorial">
        <p class="label text-bone-500 mb-4">{{ $t('gallery.label') }}</p>
        <h1 class="display-lg text-jet-900">{{ $t('gallery.heading') }}</h1>
      </div>
    </section>

    <!-- ─── Filters ───────────────────────────────────────── -->
    <section class="bg-white border-b border-bone-200 sticky top-16 md:top-20 z-30">
      <div class="container-editorial py-5 flex items-center gap-8 overflow-x-auto no-scrollbar">
        <!-- All -->
        <button
          class="caption flex-shrink-0 pb-px border-b transition-all duration-200"
          :class="activeCollection === null ? 'border-jet-900 text-jet-900' : 'border-transparent text-jet-400 hover:text-jet-700'"
          @click="activeCollection = null"
        >
          {{ $t('gallery.all') }}
        </button>

        <!-- Collections -->
        <button
          v-for="col in collections"
          :key="col.id"
          class="caption flex-shrink-0 pb-px border-b transition-all duration-200"
          :class="activeCollection === col.id ? 'border-jet-900 text-jet-900' : 'border-transparent text-jet-400 hover:text-jet-700'"
          @click="activeCollection = col.id"
        >
          {{ localizeCollection(col.title) }}
        </button>
      </div>
    </section>

    <!-- ─── Products grid ─────────────────────────────────── -->
    <section class="section bg-bone-50">
      <div class="container-editorial">
        <!-- Loading -->
        <div v-if="pending" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
          <div v-for="i in 8" :key="i" class="aspect-3/4 bg-bone-100 animate-pulse" />
        </div>

        <!-- Empty -->
        <div v-else-if="!filteredProducts.length" class="py-32 text-center">
          <p class="font-serif text-2xl text-jet-400">{{ $t('gallery.empty') }}</p>
        </div>

        <!-- Grid -->
        <TransitionGroup
          v-else
          tag="div"
          name="grid-fade"
          class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8"
        >
          <ProductCard
            v-for="product in filteredProducts"
            :key="product.id"
            :product="product"
          />
        </TransitionGroup>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { Collection } from '~/types/collection'

definePageMeta({ layout: 'default' })

const { t } = useI18n()
const { fetchPublishedProducts } = useProducts()
const { fetchCollections, localize: localizeCollection } = useCollections()

useSeo({
  title: t('gallery.heading'),
  description: t('seo.gallery_description'),
})

const { data: products, pending } = await useAsyncData('gallery-products', fetchPublishedProducts)
const { data: collections } = await useAsyncData('gallery-collections', fetchCollections)

const activeCollection = ref<string | null>(null)

const filteredProducts = computed(() => {
  const list = products.value ?? []
  if (!activeCollection.value) return list
  return list.filter(p => p.collection_id === activeCollection.value)
})
</script>

<style scoped>
.grid-fade-enter-active,
.grid-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.grid-fade-enter-from,
.grid-fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
.grid-fade-move {
  transition: transform 0.3s ease;
}
</style>
