<template>
  <div>
    <!-- Toolbar -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      <!-- Filter by status -->
      <div class="flex items-center gap-2">
        <button
          v-for="f in filters"
          :key="f.value"
          class="font-sans text-xs tracking-widest uppercase px-3 py-1.5 border transition-colors duration-200"
          :class="activeFilter === f.value
            ? 'border-jet-900 bg-jet-900 text-white'
            : 'border-bone-300 text-jet-500 hover:border-jet-500'"
          @click="activeFilter = f.value"
        >
          {{ f.label }} <span class="ml-1 opacity-60">{{ f.count }}</span>
        </button>
      </div>

      <NuxtLink to="/admin/products/new" class="btn-primary text-2xs py-2.5 px-5">
        + Новое изделие
      </NuxtLink>
    </div>

    <!-- Table -->
    <div class="bg-white border border-bone-200">
      <div v-if="pending" class="p-12 text-center">
        <p class="label text-bone-400 animate-pulse">Загрузка...</p>
      </div>

      <div v-else-if="!filteredProducts.length" class="p-16 text-center">
        <p class="font-serif text-2xl font-light text-jet-400 mb-6">Нет изделий</p>
        <NuxtLink to="/admin/products/new" class="btn-ghost inline-flex">
          Создать первое
        </NuxtLink>
      </div>

      <table v-else class="w-full">
        <thead>
          <tr class="border-b border-bone-200">
            <th class="admin-label text-left px-6 py-4">Изделие</th>
            <th class="admin-label text-left px-6 py-4 hidden md:table-cell">Коллекция</th>
            <th class="admin-label text-left px-6 py-4 hidden sm:table-cell">Цена</th>
            <th class="admin-label text-left px-6 py-4">Статус</th>
            <th class="px-6 py-4" />
          </tr>
        </thead>
        <tbody class="divide-y divide-bone-100">
          <tr
            v-for="product in filteredProducts"
            :key="product.id"
            class="hover:bg-bone-50 transition-colors"
          >
            <!-- Product -->
            <td class="px-6 py-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-14 bg-bone-100 flex-shrink-0 overflow-hidden">
                  <NuxtImg
                    v-if="product.product_images?.[0]"
                    :src="product.product_images[0].image_url"
                    :alt="locTitle(product.title)"
                    :width="80"
                    :height="112"
                    class="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div>
                  <p class="font-sans text-sm font-light text-jet-900">{{ locTitle(product.title) }}</p>
                  <p class="font-sans text-2xs text-bone-500 font-mono mt-0.5">{{ product.slug }}</p>
                </div>
              </div>
            </td>

            <!-- Collection -->
            <td class="px-6 py-4 hidden md:table-cell">
              <span class="font-sans text-xs text-jet-500">
                {{ product.collections ? locTitle((product.collections as any).title) : '—' }}
              </span>
            </td>

            <!-- Price -->
            <td class="px-6 py-4 hidden sm:table-cell">
              <span class="font-sans text-xs text-jet-600">
                {{ product.price ? formatPrice(product.price) : '—' }}
              </span>
            </td>

            <!-- Status -->
            <td class="px-6 py-4">
              <span :class="statusClass(product.status)">{{ statusLabel(product.status) }}</span>
            </td>

            <!-- Actions -->
            <td class="px-6 py-4">
              <div class="flex items-center justify-end gap-3">
                <NuxtLink
                  :to="`/admin/products/edit/${product.id}`"
                  class="text-jet-400 hover:text-jet-900 transition-colors"
                  title="Редактировать"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </NuxtLink>
                <button
                  class="text-jet-300 hover:text-red-500 transition-colors"
                  title="Удалить"
                  @click="confirmDelete(product)"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Delete confirmation modal -->
    <AppModal v-model="deleteModal" title="Удалить изделие?">
      <p class="font-sans text-sm text-jet-600">
        Вы уверены, что хотите удалить
        <strong class="font-medium text-jet-900">{{ locTitle(productToDelete?.title) }}</strong>?
        Это действие необратимо.
      </p>
      <template #footer>
        <div class="flex items-center justify-end gap-3">
          <button
            class="btn-ghost text-2xs py-2 px-4"
            @click="deleteModal = false"
          >
            Отмена
          </button>
          <button
            class="btn-primary text-2xs py-2 px-4 bg-red-600 hover:bg-red-700 border-red-600"
            :disabled="deleteLoading"
            @click="handleDelete"
          >
            <span v-if="deleteLoading" class="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin inline-block" />
            <span v-else>Удалить</span>
          </button>
        </div>
      </template>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import type { ProductWithImages } from '~/types/product'

definePageMeta({ layout: 'admin', middleware: 'admin-auth' })
useHead({ title: 'Изделия — Admin' })

const { fetchAllProductsAdmin, localize, deleteProduct, formatPrice } = useProducts()

const { data: products, pending, refresh } = await useAsyncData('admin-products', fetchAllProductsAdmin)

const activeFilter = ref<string>('all')

const filters = computed(() => [
  { label: 'Все',           value: 'all',       count: products.value?.length ?? 0 },
  { label: 'Опубликовано',  value: 'published', count: products.value?.filter(p => p.status === 'published').length ?? 0 },
  { label: 'Черновики',     value: 'draft',     count: products.value?.filter(p => p.status === 'draft').length ?? 0 },
  { label: 'Продано',       value: 'sold_out',  count: products.value?.filter(p => p.status === 'sold_out').length ?? 0 },
])

const filteredProducts = computed(() => {
  if (activeFilter.value === 'all') return products.value ?? []
  return (products.value ?? []).filter(p => p.status === activeFilter.value)
})

const locTitle = (title: any) => localize(title)

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

// Delete
const deleteModal   = ref(false)
const deleteLoading = ref(false)
const productToDelete = ref<ProductWithImages | null>(null)

const confirmDelete = (product: ProductWithImages) => {
  productToDelete.value = product
  deleteModal.value = true
}

const handleDelete = async () => {
  if (!productToDelete.value) return
  deleteLoading.value = true
  try {
    await deleteProduct(productToDelete.value.id)
    deleteModal.value = false
    await refresh()
  }
  finally {
    deleteLoading.value = false
  }
}
</script>
