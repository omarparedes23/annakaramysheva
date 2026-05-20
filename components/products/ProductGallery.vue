<template>
  <div class="product-gallery">
    <!-- Main display -->
    <div
      class="main-image aspect-3/4 bg-bone-100 overflow-hidden relative"
      @touchstart="carousel ? onMainTouchStart($event) : undefined"
      @touchend="carousel ? onMainTouchEnd($event) : undefined"
    >
      <template v-if="activeMedia">
        <NuxtImg
          v-if="activeMedia.media_type === 'image'"
          :src="activeMedia.image_url"
          :alt="alt"
          :width="1200"
          :height="1600"
          class="w-full h-full object-cover transition-opacity duration-300 cursor-zoom-in"
          :class="{ 'opacity-0': transitioning }"
          loading="eager"
          fit="cover"
          @click="carousel ? handleCarouselClick() : openLightbox(activeIndex)"
        />
        <video
          v-else
          :src="activeMedia.image_url"
          class="w-full h-full object-cover"
          controls
          playsinline
          autoplay
          muted
          loop
        />
      </template>

      <!-- Carousel arrows -->
      <template v-if="carousel && images.length > 1">
        <button
          class="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-white/75 hover:bg-white backdrop-blur-sm transition-all duration-200"
          aria-label="Anterior"
          @click.stop="prev"
        >
          <svg class="w-4 h-4 text-jet-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          class="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-white/75 hover:bg-white backdrop-blur-sm transition-all duration-200"
          aria-label="Siguiente"
          @click.stop="next"
        >
          <svg class="w-4 h-4 text-jet-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </template>
    </div>

    <!-- Carousel dots -->
    <div v-if="carousel && images.length > 1" class="flex justify-center gap-2 mt-4">
      <button
        v-for="(_, i) in images"
        :key="i"
        class="w-1.5 h-1.5 rounded-full transition-colors duration-200"
        :class="i === activeIndex ? 'bg-jet-900' : 'bg-bone-400'"
        :aria-label="`Imagen ${i + 1}`"
        @click="setActive(i)"
      />
    </div>

    <!-- Thumbnails (non-carousel) -->
    <div v-if="!carousel && images.length > 1" class="flex gap-2 mt-3 overflow-x-auto no-scrollbar">
      <button
        v-for="(img, i) in images"
        :key="img.id"
        class="flex-shrink-0 w-16 h-20 overflow-hidden border-2 transition-all duration-200 relative"
        :class="i === activeIndex ? 'border-jet-900' : 'border-transparent hover:border-bone-300'"
        @click="setActive(i)"
      >
        <video
          v-if="img.media_type === 'video'"
          :src="img.image_url"
          class="w-full h-full object-cover"
          muted
          preload="metadata"
          playsinline
        />
        <img
          v-else
          :src="img.image_url"
          :alt="`${alt} — view ${i + 1}`"
          class="w-full h-full object-cover"
          loading="lazy"
        />
        <span
          v-if="img.media_type === 'video'"
          class="absolute inset-0 flex items-center justify-center bg-black/20"
        >
          <svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      </button>
    </div>

    <!-- Lightbox (images only) -->
    <Teleport to="body">
      <Transition name="lightbox">
        <div
          v-if="lightboxOpen"
          class="fixed inset-0 z-50 bg-jet-900/95 flex items-center justify-center touch-pan-y"
          @click.self="lightboxOpen = false"
          @touchstart="onLightboxTouchStart"
          @touchend="onLightboxTouchEnd"
        >
          <button
            class="absolute top-6 right-6 text-white/70 hover:text-white transition-colors z-10"
            @click="lightboxOpen = false"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <button
            v-if="imageItems.length > 1"
            class="absolute left-6 text-white/70 hover:text-white transition-colors"
            @click="prevLightboxImage"
          >
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div class="max-w-3xl max-h-screen p-12 w-full">
            <NuxtImg
              v-if="lightboxImage"
              :src="lightboxImage.image_url"
              :alt="`${alt} — view ${lightboxImageIndex + 1}`"
              :width="1200"
              :height="1600"
              class="max-h-[85vh] w-auto mx-auto object-contain"
              fit="inside"
            />
          </div>

          <button
            v-if="imageItems.length > 1"
            class="absolute right-6 text-white/70 hover:text-white transition-colors"
            @click="nextLightboxImage"
          >
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <span class="absolute bottom-6 left-1/2 -translate-x-1/2 label text-white/50">
            {{ lightboxImageIndex + 1 }} / {{ imageItems.length }}
          </span>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type { ProductMedia } from '~/types/product'

const props = defineProps<{
  images: ProductMedia[]
  alt: string
  carousel?: boolean
}>()

const activeIndex   = ref(0)
const transitioning = ref(false)
const lightboxOpen  = ref(false)
const lightboxIndex = ref(0)

const minSwipeDistance = 50

// Lightbox swipe state
const lightboxTouchStartX = ref(0)

// Main image swipe state (carousel mode)
const mainTouchStartX = ref(0)
const hasSwiped       = ref(false)

const activeMedia        = computed(() => props.images[activeIndex.value] ?? null)
const imageItems         = computed(() => props.images.filter(m => m.media_type === 'image'))
const lightboxImage      = computed(() => imageItems.value[lightboxIndex.value] ?? null)
const lightboxImageIndex = computed(() => lightboxIndex.value)

const setActive = (i: number) => {
  if (i === activeIndex.value) return
  transitioning.value = true
  setTimeout(() => {
    activeIndex.value = i
    transitioning.value = false
  }, 150)
}

const prev = () => setActive((activeIndex.value - 1 + props.images.length) % props.images.length)
const next = () => setActive((activeIndex.value + 1) % props.images.length)

const openLightbox = (i: number) => {
  const imgIndex = imageItems.value.findIndex(m => m === props.images[i])
  if (imgIndex === -1) return
  lightboxIndex.value = imgIndex
  lightboxOpen.value  = true
}

const handleCarouselClick = () => {
  if (hasSwiped.value) return
  openLightbox(activeIndex.value)
}

const prevLightboxImage = () => {
  lightboxIndex.value = (lightboxIndex.value - 1 + imageItems.value.length) % imageItems.value.length
}
const nextLightboxImage = () => {
  lightboxIndex.value = (lightboxIndex.value + 1) % imageItems.value.length
}

const handleKey = (e: KeyboardEvent) => {
  if (!lightboxOpen.value) return
  if (e.key === 'ArrowLeft')  prevLightboxImage()
  if (e.key === 'ArrowRight') nextLightboxImage()
  if (e.key === 'Escape')     lightboxOpen.value = false
}

// Lightbox swipe
const onLightboxTouchStart = (e: TouchEvent) => {
  lightboxTouchStartX.value = e.changedTouches[0].screenX
}
const onLightboxTouchEnd = (e: TouchEvent) => {
  const diff = e.changedTouches[0].screenX - lightboxTouchStartX.value
  if (Math.abs(diff) > minSwipeDistance) {
    if (diff > 0) prevLightboxImage()
    else          nextLightboxImage()
  }
}

// Main image swipe (carousel mode only)
const onMainTouchStart = (e: TouchEvent) => {
  mainTouchStartX.value = e.changedTouches[0].screenX
  hasSwiped.value = false
}
const onMainTouchEnd = (e: TouchEvent) => {
  const diff = e.changedTouches[0].screenX - mainTouchStartX.value
  if (Math.abs(diff) > minSwipeDistance) {
    hasSwiped.value = true
    if (diff > 0) prev()
    else          next()
  }
}

onMounted(() => document.addEventListener('keydown', handleKey))
onUnmounted(() => document.removeEventListener('keydown', handleKey))
</script>

<style scoped>
.lightbox-enter-active,
.lightbox-leave-active {
  transition: opacity 0.25s ease;
}
.lightbox-enter-from,
.lightbox-leave-to {
  opacity: 0;
}
</style>
