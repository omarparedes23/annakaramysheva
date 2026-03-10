<template>
  <article class="group cursor-pointer">
    <NuxtLink :to="localePath(`/collections/${collection.slug}`)">
      <!-- Cover image — first product image in collection -->
      <div class="aspect-[3/4] overflow-hidden bg-bone-100 relative">
        <NuxtImg
          v-if="coverImage"
          :src="coverImage"
          :alt="imageAlt"
          :width="800"
          :height="1067"
          class="w-full h-full object-cover transition-transform duration-800 group-hover:scale-[1.04]"
          loading="lazy"
          fit="cover"
        />
        <div
          v-else
          class="w-full h-full flex items-center justify-center"
        >
          <span class="label text-bone-400">{{ title }}</span>
        </div>

        <!-- Overlay -->
        <div class="absolute inset-0 bg-gradient-to-t from-jet-900/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>

      <!-- Info -->
      <div class="mt-4">
        <p class="font-serif text-lg font-light text-jet-900 leading-tight">{{ title }}</p>
        <p v-if="collection.year" class="label mt-1">{{ collection.year }}</p>
      </div>
    </NuxtLink>
  </article>
</template>

<script setup lang="ts">
import type { CollectionWithProducts } from '~/types/collection'

const props = defineProps<{
  collection: CollectionWithProducts
  coverImage?: string | null
}>()

const localePath = useLocalePath()
const { localize } = useCollections()

const title = computed(() => localize(props.collection.title))

const imageAlt = computed(() =>
  `${title.value} collection by Anna Karamysheva${props.collection.year ? ' ' + props.collection.year : ''}`
)
</script>
