<template>
  <div class="max-w-4xl">
    <ProductForm
      mode="create"
      :collections="collections ?? []"
      @saved="handleSaved"
    />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin-auth' })
useHead({ title: 'Новое изделие — Admin' })

const { fetchAllCollectionsAdmin } = useCollections()
const { data: collections } = await useAsyncData('admin-collections', fetchAllCollectionsAdmin)

const handleSaved = (id: string) => {
  navigateTo(`/admin/products/edit/${id}`)
}
</script>
