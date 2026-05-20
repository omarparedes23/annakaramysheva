<template>
  <article class="product-card">
    <NuxtLink v-if="product.slug" :to="localePath(`/products/${product.slug}`)">
      <div class="product-card-image">
        <template v-if="coverMedia">
          <video
            v-if="coverMedia.media_type === 'video'"
            ref="videoRef"
            :src="coverMedia.image_url"
            class="w-full h-full object-cover"
            muted
            loop
            playsinline
            preload="metadata"
            @play="isPlaying = true"
            @pause="isPlaying = false"
          />
          <NuxtImg
            v-else
            :src="coverMedia.image_url"
            :alt="imageAlt"
            :width="600"
            :height="800"
            class="w-full h-full object-cover transition-transform duration-800 group-hover:scale-[1.04]"
            loading="lazy"
            fit="cover"
          />
        </template>
        <div
          v-else
          class="w-full h-full bg-bone-100 flex items-center justify-center"
        >
          <span class="label text-bone-400">Anna Karamysheva</span>
        </div>

        <!-- Play overlay for video covers -->
        <button
          v-if="coverMedia?.media_type === 'video'"
          class="absolute inset-0 flex items-center justify-center transition-opacity duration-300"
          :class="isPlaying ? 'opacity-0 pointer-events-none' : 'opacity-100'"
          aria-label="Play video"
          @click.stop.prevent="togglePlay"
        >
          <div class="w-12 h-12 rounded-full bg-white/75 flex items-center justify-center backdrop-blur-sm">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-jet-900 ml-0.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </button>

        <div v-if="showCommercialInfo && product.status === 'sold_out'" class="absolute bottom-4 left-4">
          <span class="badge-sold-out">{{ $t('product.sold_out') }}</span>
        </div>
      </div>

      <div v-if="collectionTitle || showCommercialInfo" class="mt-4 space-y-1.5">
        <p v-if="showCommercialInfo" class="font-serif text-base font-light text-jet-900 leading-snug">
          {{ title }}
        </p>
        <div class="flex items-center justify-between">
          <p v-if="collectionTitle" class="label">{{ collectionTitle }}</p>
          <p v-if="showCommercialInfo && product.price" class="font-sans text-xs font-light text-jet-600">
            {{ formattedPrice }}
          </p>
        </div>
      </div>
    </NuxtLink>
    <div v-else class="cursor-not-allowed opacity-70">
      <div class="product-card-image">
        <template v-if="coverMedia">
          <video
            v-if="coverMedia.media_type === 'video'"
            :src="coverMedia.image_url"
            class="w-full h-full object-cover"
            muted
            playsinline
            preload="metadata"
          />
          <NuxtImg
            v-else
            :src="coverMedia.image_url"
            :alt="imageAlt"
            :width="600"
            :height="800"
            class="w-full h-full object-cover transition-transform duration-800 group-hover:scale-[1.04]"
            loading="lazy"
            fit="cover"
          />
        </template>
        <div
          v-else
          class="w-full h-full bg-bone-100 flex items-center justify-center"
        >
          <span class="label text-bone-400">Anna Karamysheva</span>
        </div>

        <div v-if="showCommercialInfo && product.status === 'sold_out'" class="absolute bottom-4 left-4">
          <span class="badge-sold-out">{{ $t('product.sold_out') }}</span>
        </div>
      </div>

      <div v-if="collectionTitle || showCommercialInfo" class="mt-4 space-y-1.5">
        <p v-if="showCommercialInfo" class="font-serif text-base font-light text-jet-900 leading-snug">
          {{ title }}
        </p>
        <div class="flex items-center justify-between">
          <p v-if="collectionTitle" class="label">{{ collectionTitle }}</p>
          <p v-if="showCommercialInfo && product.price" class="font-sans text-xs font-light text-jet-600">
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
const config = useRuntimeConfig()
const showCommercialInfo = config.public.showCommercialInfo as boolean

const videoRef = ref<HTMLVideoElement | null>(null)
const isPlaying = ref(false)

function togglePlay() {
  const video = videoRef.value
  if (!video) return
  if (isPlaying.value) {
    video.pause()
  } else {
    video.play()
  }
}

const coverMedia = computed(() =>
  props.product.product_images?.find(m => m.media_type === 'video')
  ?? props.product.product_images?.[0]
  ?? null
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
