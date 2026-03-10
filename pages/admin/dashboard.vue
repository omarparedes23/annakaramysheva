<template>
  <div>
    <!-- Stats grid -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="bg-white border border-bone-200 p-6"
      >
        <p class="label text-bone-500 mb-2">{{ stat.label }}</p>
        <p class="font-serif text-4xl font-light text-jet-900">{{ stat.value }}</p>
      </div>
    </div>

    <!-- Recent products -->
    <div class="bg-white border border-bone-200">
      <div class="flex items-center justify-between px-6 py-5 border-b border-bone-200">
        <h2 class="font-serif text-lg font-light text-jet-900">Последние изделия</h2>
        <NuxtLink
          to="/admin/products/new"
          class="btn-primary text-2xs py-2 px-4"
        >
          + Добавить
        </NuxtLink>
      </div>

      <div v-if="pending" class="p-8 text-center">
        <p class="label text-bone-400 animate-pulse">Загрузка...</p>
      </div>

      <div v-else-if="!recentProducts.length" class="p-12 text-center">
        <p class="font-serif text-xl font-light text-jet-400">Нет изделий</p>
        <NuxtLink to="/admin/products/new" class="btn-ghost mt-6 inline-flex">
          Создать первое
        </NuxtLink>
      </div>

      <ul v-else class="divide-y divide-bone-100">
        <li
          v-for="product in recentProducts"
          :key="product.id"
          class="flex items-center gap-4 px-6 py-4 hover:bg-bone-50 transition-colors"
        >
          <!-- Thumbnail -->
          <div class="w-12 h-16 bg-bone-100 flex-shrink-0 overflow-hidden">
            <NuxtImg
              v-if="product.product_images?.[0]"
              :src="product.product_images[0].image_url"
              :alt="localizeTitle(product.title)"
              :width="96"
              :height="128"
              class="w-full h-full object-cover"
              loading="lazy"
            />
          </div>

          <!-- Info -->
          <div class="flex-1 min-w-0">
            <p class="font-sans text-sm font-light text-jet-900 truncate">{{ localizeTitle(product.title) }}</p>
            <p class="label text-bone-500 mt-0.5">
              {{ product.collections ? localizeTitle((product.collections as any).title) : '—' }}
            </p>
          </div>

          <!-- Status -->
          <span :class="statusClass(product.status)">{{ statusLabel(product.status) }}</span>

          <!-- Actions -->
          <NuxtLink
            :to="`/admin/products/edit/${product.id}`"
            class="text-jet-400 hover:text-jet-900 transition-colors ml-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </NuxtLink>
        </li>
      </ul>
    </div>

    <!-- Recent inquiries -->
    <div class="bg-white border border-bone-200 mt-6">
      <div class="flex items-center justify-between px-6 py-5 border-b border-bone-200">
        <h2 class="font-serif text-lg font-light text-jet-900">Последние запросы</h2>
      </div>

      <div v-if="!recentInquiries?.length" class="p-8 text-center">
        <p class="label text-bone-400">Нет новых запросов</p>
      </div>

      <ul v-else class="divide-y divide-bone-100">
        <li
          v-for="inquiry in recentInquiries"
          :key="inquiry.id"
          class="px-6 py-4"
        >
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="font-sans text-sm font-light text-jet-900">{{ inquiry.name }}</p>
              <p class="label text-bone-500 mt-0.5">{{ inquiry.email }}</p>
              <p class="font-sans text-xs text-jet-500 mt-2 line-clamp-2">{{ inquiry.message }}</p>
            </div>
            <span class="flex-shrink-0 label text-bone-500">
              {{ formatDate(inquiry.created_at) }}
            </span>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Inquiry } from '~/types/product'

definePageMeta({ layout: 'admin', middleware: 'admin-auth' })
useHead({ title: 'Dashboard — Admin' })

const supabase = useSupabaseClient()
const { fetchAllProductsAdmin, localize } = useProducts()
const { fetchAllCollectionsAdmin } = useCollections()

const { data: products, pending } = await useAsyncData('admin-dash-products', fetchAllProductsAdmin)
const { data: collections } = await useAsyncData('admin-dash-collections', fetchAllCollectionsAdmin)

// Recent inquiries
const { data: inquiries } = await useAsyncData('admin-dash-inquiries', async () => {
  const { data } = await supabase
    .from('inquiries')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)
  return (data ?? []) as Inquiry[]
})

const recentProducts = computed(() => (products.value ?? []).slice(0, 8))
const recentInquiries = computed(() => inquiries.value ?? [])

const localizeTitle = (title: any) => localize(title)

const stats = computed(() => [
  { label: 'Изделий',    value: products.value?.length ?? 0 },
  { label: 'Опубликовано', value: products.value?.filter(p => p.status === 'published').length ?? 0 },
  { label: 'Коллекций', value: collections.value?.length ?? 0 },
  { label: 'Запросов',  value: inquiries.value?.length ?? 0 },
])

const statusClass = (status: string) => ({
  published: 'badge-published',
  draft:     'badge-draft',
  sold_out:  'badge-sold-out',
}[status] ?? 'badge-draft')

const statusLabel = (status: string) => ({
  published: 'Опубликовано',
  draft:     'Черновик',
  sold_out:  'Продано',
}[status] ?? status)

const formatDate = (dateStr: string) => {
  return new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' }).format(new Date(dateStr))
}
</script>
