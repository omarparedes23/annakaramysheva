<template>
  <div class="product-gallery">
    <!-- Main image -->
    <div class="main-image aspect-3/4 bg-bone-100 overflow-hidden cursor-zoom-in relative" @click="openLightbox(activeIndex)">
      <NuxtImg
        v-if="activeImage"
        :src="activeImage.image_url"
        :alt="alt"
        :width="1200"
        :height="1600"
        class="w-full h-full object-cover transition-opacity duration-300"
        :class="{ 'opacity-0': transitioning }"
        loading="eager"
        fit="cover"
      />
    </div>

    <!-- Thumbnails -->
    <div v-if="images.length > 1" class="flex gap-2 mt-3 overflow-x-auto no-scrollbar">
      <button
        v-for="(img, i) in images"
        :key="img.id"
        class="flex-shrink-0 w-16 h-20 overflow-hidden border-2 transition-all duration-200"
        :class="i === activeIndex ? 'border-jet-900' : 'border-transparent hover:border-bone-300'"
        @click="setActive(i)"
      >
        <NuxtImg
          :src="img.image_url"
          :alt="`${alt} — view ${i + 1}`"
          :width="128"
          :height="160"
          class="w-full h-full object-cover"
          loading="lazy"
          fit="cover"
        />
      </button>
    </div>

    <!-- Lightbox -->
    <Teleport to="body">
      <Transition name="lightbox">
        <div
          v-if="lightboxOpen"
          class="fixed inset-0 z-50 bg-jet-900/95 flex items-center justify-center touch-pan-y"
          @click.self="lightboxOpen = false"
          @touchstart="onTouchStart"
          @touchend="onTouchEnd"
        >
          <!-- Close -->
          <button
            class="absolute top-6 right-6 text-white/70 hover:text-white transition-colors z-10"
            @click="lightboxOpen = false"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <!-- Prev -->
          <button
            v-if="images.length > 1"
            class="absolute left-6 text-white/70 hover:text-white transition-colors"
            @click="prevImage"
          >
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <!-- Image -->
          <div class="max-w-3xl max-h-screen p-12 w-full">
            <NuxtImg
              v-if="images[lightboxIndex]"
              :src="images[lightboxIndex].image_url"
              :alt="`${alt} — view ${lightboxIndex + 1}`"
              :width="1200"
              :height="1600"
              class="max-h-[85vh] w-auto mx-auto object-contain"
              fit="inside"
            />
          </div>

          <!-- Next -->
          <button
            v-if="images.length > 1"
            class="absolute right-6 text-white/70 hover:text-white transition-colors"
            @click="nextImage"
          >
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <!-- Counter -->
          <span class="absolute bottom-6 left-1/2 -translate-x-1/2 label text-white/50">
            {{ lightboxIndex + 1 }} / {{ images.length }}
          </span>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type { ProductImage } from '~/types/product'

const props = defineProps<{
  images: ProductImage[]
  alt: string
}>()

const activeIndex  = ref(0)
const transitioning = ref(false)
const lightboxOpen  = ref(false)
const lightboxIndex = ref(0)

// Touch swipe handling for mobile
const touchStartX = ref(0)
const touchEndX = ref(0)
const minSwipeDistance = 50

const activeImage = computed(() => props.images[activeIndex.value] ?? null)

const setActive = (i: number) => {
  if (i === activeIndex.value) return
  transitioning.value = true
  setTimeout(() => {
    activeIndex.value = i
    transitioning.value = false
  }, 150)
}

const openLightbox = (i: number) => {
  lightboxIndex.value = i
  lightboxOpen.value  = true
}

const prevImage = () => {
  lightboxIndex.value = (lightboxIndex.value - 1 + props.images.length) % props.images.length
}

const nextImage = () => {
  lightboxIndex.value = (lightboxIndex.value + 1) % props.images.length
}

// Keyboard navigation in lightbox
const handleKey = (e: KeyboardEvent) => {
  if (!lightboxOpen.value) return
  if (e.key === 'ArrowLeft')  prevImage()
  if (e.key === 'ArrowRight') nextImage()
  if (e.key === 'Escape')     lightboxOpen.value = false
}

// Touch swipe handlers
const onTouchStart = (e: TouchEvent) => {
  touchStartX.value = e.changedTouches[0].screenX
}

const onTouchEnd = (e: TouchEvent) => {
  touchEndX.value = e.changedTouches[0].screenX
  handleSwipe()
}

const handleSwipe = () => {
  const swipeDistance = touchEndX.value - touchStartX.value
  if (Math.abs(swipeDistance) > minSwipeDistance) {
    if (swipeDistance > 0) {
      // Swiped right -> go to previous
      prevImage()
    } else {
      // Swiped left -> go to next
      nextImage()
    }
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
