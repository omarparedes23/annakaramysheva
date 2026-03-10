<template>
  <div>
    <!-- Toolbar -->
    <div class="flex items-center justify-between mb-6">
      <p class="label text-bone-500">{{ collections?.length ?? 0 }} коллекций</p>
      <button class="btn-primary text-2xs py-2.5 px-5" @click="openCreate">
        + Новая коллекция
      </button>
    </div>

    <!-- Table -->
    <div class="bg-white border border-bone-200">
      <div v-if="pending" class="p-12 text-center">
        <p class="label text-bone-400 animate-pulse">Загрузка...</p>
      </div>

      <div v-else-if="!collections?.length" class="p-16 text-center">
        <p class="font-serif text-2xl font-light text-jet-400 mb-6">Нет коллекций</p>
        <button class="btn-ghost inline-flex" @click="openCreate">Создать первую</button>
      </div>

      <ul v-else class="divide-y divide-bone-100">
        <li
          v-for="col in collections"
          :key="col.id"
          class="flex items-center gap-4 px-6 py-5 hover:bg-bone-50 transition-colors"
        >
          <div class="flex-1">
            <p class="font-sans text-sm font-light text-jet-900">
              {{ col.title.ru || col.title.en }}
            </p>
            <p class="label text-bone-500 mt-0.5">
              {{ col.title.en }}
              <span v-if="col.year"> — {{ col.year }}</span>
            </p>
            <p class="font-mono text-2xs text-bone-400 mt-1">{{ col.slug }}</p>
          </div>

          <div class="flex items-center gap-3">
            <button
              class="text-jet-400 hover:text-jet-900 transition-colors"
              @click="openEdit(col)"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              class="text-jet-300 hover:text-red-500 transition-colors"
              @click="confirmDelete(col)"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </li>
      </ul>
    </div>

    <!-- Create / Edit Modal -->
    <AppModal v-model="formModal" :title="editingCollection ? 'Редактировать коллекцию' : 'Новая коллекция'" size="lg">
      <div class="space-y-5">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="admin-label">Название (RU)</label>
            <input v-model="form.title.ru" type="text" class="admin-input" placeholder="Весенняя Тишина" />
          </div>
          <div>
            <label class="admin-label">Title (EN)</label>
            <input v-model="form.title.en" type="text" class="admin-input" placeholder="Spring Silence" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="admin-label">Описание (RU)</label>
            <textarea v-model="form.description.ru" class="admin-input resize-none" rows="3" />
          </div>
          <div>
            <label class="admin-label">Description (EN)</label>
            <textarea v-model="form.description.en" class="admin-input resize-none" rows="3" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="admin-label">Slug</label>
            <div class="flex gap-2">
              <input v-model="form.slug" type="text" class="admin-input flex-1 font-mono text-xs" />
              <button
                class="border border-bone-300 px-3 font-sans text-2xs tracking-widest uppercase text-jet-500 hover:text-jet-900"
                @click="autoSlug"
              >Авто</button>
            </div>
          </div>
          <div>
            <label class="admin-label">Год</label>
            <input v-model.number="form.year" type="number" class="admin-input" placeholder="2025" />
          </div>
        </div>

        <p v-if="formError" class="font-sans text-xs text-red-600">{{ formError }}</p>
      </div>

      <template #footer>
        <div class="flex items-center justify-end gap-3">
          <button class="btn-ghost text-2xs py-2 px-4" @click="formModal = false">Отмена</button>
          <button
            class="btn-primary text-2xs py-2 px-5"
            :disabled="formSaving"
            @click="handleSave"
          >
            <span v-if="formSaving" class="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin inline-block mr-1" />
            {{ editingCollection ? 'Сохранить' : 'Создать' }}
          </button>
        </div>
      </template>
    </AppModal>

    <!-- Delete modal -->
    <AppModal v-model="deleteModal" title="Удалить коллекцию?">
      <p class="font-sans text-sm text-jet-600">
        Коллекция <strong class="text-jet-900">{{ collectionToDelete?.title.ru }}</strong> будет удалена.
        Изделия в ней останутся, но потеряют привязку.
      </p>
      <template #footer>
        <div class="flex items-center justify-end gap-3">
          <button class="btn-ghost text-2xs py-2 px-4" @click="deleteModal = false">Отмена</button>
          <button
            class="btn-primary text-2xs py-2 px-4 bg-red-600 hover:bg-red-700 border-red-600"
            :disabled="deleteLoading"
            @click="handleDelete"
          >
            Удалить
          </button>
        </div>
      </template>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import type { Collection } from '~/types/collection'

definePageMeta({ layout: 'admin', middleware: 'admin-auth' })
useHead({ title: 'Коллекции — Admin' })

const { fetchAllCollectionsAdmin, createCollection, updateCollection, deleteCollection, generateSlug } = useCollections()

const { data: collections, pending, refresh } = await useAsyncData('admin-collections-list', fetchAllCollectionsAdmin)

const formModal       = ref(false)
const deleteModal     = ref(false)
const formSaving      = ref(false)
const deleteLoading   = ref(false)
const formError       = ref<string | null>(null)
const editingCollection  = ref<Collection | null>(null)
const collectionToDelete = ref<Collection | null>(null)

const form = reactive({
  title:       { en: '', ru: '' },
  description: { en: '', ru: '' },
  slug:        '',
  year:        null as number | null,
})

const resetForm = () => {
  form.title       = { en: '', ru: '' }
  form.description = { en: '', ru: '' }
  form.slug        = ''
  form.year        = null
  formError.value  = null
}

const openCreate = () => {
  resetForm()
  editingCollection.value = null
  formModal.value = true
}

const openEdit = (col: Collection) => {
  editingCollection.value  = col
  form.title       = { ...col.title }
  form.description = { ...col.description }
  form.slug        = col.slug
  form.year        = col.year
  formError.value  = null
  formModal.value  = true
}

const autoSlug = () => {
  const base = form.title.en || form.title.ru
  if (base) form.slug = generateSlug(base)
}

const confirmDelete = (col: Collection) => {
  collectionToDelete.value = col
  deleteModal.value = true
}

const handleSave = async () => {
  formError.value = null
  formSaving.value = true
  try {
    if (editingCollection.value) {
      await updateCollection(editingCollection.value.id, form)
    }
    else {
      await createCollection(form as any)
    }
    formModal.value = false
    await refresh()
  }
  catch (e: any) {
    formError.value = e?.message
  }
  finally {
    formSaving.value = false
  }
}

const handleDelete = async () => {
  if (!collectionToDelete.value) return
  deleteLoading.value = true
  try {
    await deleteCollection(collectionToDelete.value.id)
    deleteModal.value = false
    await refresh()
  }
  finally {
    deleteLoading.value = false
  }
}
</script>
