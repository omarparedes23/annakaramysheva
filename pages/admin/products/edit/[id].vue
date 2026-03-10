<template>
  <div class="max-w-4xl">
    <div v-if="pending" class="p-12 text-center">
      <p class="label text-bone-400 animate-pulse">Загрузка...</p>
    </div>

    <div v-else-if="!product" class="p-12 text-center">
      <p class="font-serif text-2xl font-light text-jet-400 mb-4">Изделие не найдено</p>
      <NuxtLink to="/admin/products" class="btn-ghost inline-flex">← Назад</NuxtLink>
    </div>

    <ProductForm
      v-else
      mode="edit"
      :product="product"
      :collections="collections ?? []"
      @saved="handleSaved"
    />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin-auth' })

const route = useRoute()
const id = route.params.id as string

const { fetchProductById } = useProducts()
const { fetchAllCollectionsAdmin } = useCollections()

const [{ data: product, pending }, { data: collections }] = await Promise.all([
  useAsyncData(`admin-product-${id}`, () => fetchProductById(id)),
  useAsyncData('admin-collections', fetchAllCollectionsAdmin),
])

useHead({ title: computed(() => `Редактировать — Admin`) })

const handleSaved = () => {
  // Stays on page, form shows success
}
</script>
