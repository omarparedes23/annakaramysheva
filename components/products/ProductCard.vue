<template>
  <article class="product-card">
    <NuxtLink v-if="product.slug" :to="localePath(`/products/${product.slug}`)">
      <!-- Image -->
      <div class="product-card-image">
        <NuxtImg
          v-if="coverImage"
          :src="coverImage"
          :alt="imageAlt"
          :width="600"
          :height="800"
          class="w-full h-full object-cover transition-transform duration-800 group-hover:scale-[1.04]"
          loading="lazy"
          fit="cover"
        />
        <div
          v-else
          class="w-full h-full bg-bone-100 flex items-center justify-center"
        >
          <span class="label text-bone-400">Anna Karamysheva</span>
        </div>

        <!-- Status overlay -->
        <div v-if="product.status === 'sold_out'" class="absolute bottom-4 left-4">
          <span class="badge-sold-out">{{ $t('product.sold_out') }}</span>
        </div>
      </div>

      <!-- Info -->
      <div class="mt-4 space-y-1.5">
        <p class="font-serif text-base font-light text-jet-900 leading-snug">
          {{ title }}
        </p>
        <div class="flex items-center justify-between">
          <p v-if="collectionTitle" class="label">{{ collectionTitle }}</p>
          <p v-if="product.price" class="font-sans text-xs font-light text-jet-600">
            {{ formattedPrice }}
          </p>
        </div>
      </div>
    </NuxtLink>
    <div v-else class="cursor-not-allowed opacity-70">
      <!-- Image -->
      <div class="product-card-image">
        <NuxtImg
          v-if="coverImage"
          :src="coverImage"
          :alt="imageAlt"
          :width="600"
          :height="800"
          class="w-full h-full object-cover transition-transform duration-800 group-hover:scale-[1.04]"
          loading="lazy"
          fit="cover"
        />
        <div
          v-else
          class="w-full h-full bg-bone-100 flex items-center justify-center"
        >
          <span class="label text-bone-400">Anna Karamysheva</span>
        </div>

        <!-- Status overlay -->
        <div v-if="product.status === 'sold_out'" class="absolute bottom-4 left-4">
          <span class="badge-sold-out">{{ $t('product.sold_out') }}</span>
        </div>
      </div>

      <!-- Info -->
      <div class="mt-4 space-y-1.5">
        <p class="font-serif text-base font-light text-jet-900 leading-snug">
          {{ title }}
        </p>
        <div class="flex items-center justify-between">
          <p v-if="collectionTitle" class="label">{{ collectionTitle }}</p>
          <p v-if="product.price" class="font-sans text-xs font-light text-jet-600">
            {{ formattedPrice }}
          </p>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { ProductWithImages } from '~/types/product'

const props = defineProps<{
  product: ProductWithImages
}>()

const localePath = useLocalePath()
const { localize, formatPrice } = useProducts()

const coverImage = computed(() =>
  props.product.product_images?.[0]?.image_url ?? null
)

const title = computed(() => localize(props.product.title))

const collectionTitle = computed(() => {
  const col = props.product.collections as any
  if (!col) return ''
  return localize(col.title)
})

const formattedPrice = computed(() => formatPrice(props.product.price))

const imageAlt = computed(() => {
  const t = title.value
  return `${t} by Anna Karamysheva`
})
</script>
