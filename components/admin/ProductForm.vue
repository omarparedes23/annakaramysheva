<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div class="flex items-center gap-4">
        <NuxtLink to="/admin/products" class="text-jet-400 hover:text-jet-900 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </NuxtLink>
        <h1 class="font-serif text-2xl font-light text-jet-900">
          {{ mode === 'create' ? 'Новое изделие' : 'Редактировать изделие' }}
        </h1>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-3">
        <button
          v-if="mode === 'edit' && product"
          :href="`/products/${product.slug}`"
          class="btn-ghost text-2xs py-2 px-4"
          @click="previewProduct"
        >
          Просмотр ↗
        </button>
        <button
          class="btn-primary text-2xs py-2 px-5"
          :disabled="saving"
          @click="handleSave"
        >
          <span v-if="saving" class="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin inline-block mr-1" />
          {{ mode === 'create' ? 'Создать' : 'Сохранить' }}
        </button>
      </div>
    </div>

    <!-- Success banner -->
    <Transition name="banner">
      <div v-if="savedSuccess" class="bg-jet-900 text-white px-6 py-4 mb-6 flex items-center justify-between">
        <span class="font-sans text-xs tracking-widest uppercase">Сохранено</span>
        <button @click="savedSuccess = false">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </Transition>

    <!-- Error banner -->
    <div v-if="saveError" class="bg-red-50 border border-red-200 text-red-700 px-6 py-4 mb-6">
      <p class="font-sans text-xs">{{ saveError }}</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main column -->
      <div class="lg:col-span-2 space-y-6">

        <!-- ─── Titles (multilingual) ─────────────────────────── -->
        <div class="bg-white border border-bone-200 p-6">
          <h2 class="font-serif text-lg font-light text-jet-900 mb-6">Название изделия</h2>

          <div class="space-y-5">
            <div>
              <label class="admin-label">Русский</label>
              <input v-model="form.title.ru" type="text" class="admin-input" placeholder="Платье из альпаки" />
            </div>
            <div>
              <label class="admin-label">English</label>
              <input v-model="form.title.en" type="text" class="admin-input" placeholder="Alpaca knitted dress" />
            </div>
          </div>

          <!-- Auto slug -->
          <div class="mt-5">
            <label class="admin-label">Slug (URL)</label>
            <div class="flex items-center gap-3">
              <input
                v-model="form.slug"
                type="text"
                class="admin-input flex-1 font-mono text-xs"
                placeholder="alpaca-knitted-dress"
              />
              <button
                type="button"
                class="font-sans text-2xs tracking-widest uppercase text-jet-500 hover:text-jet-900 flex-shrink-0 border border-bone-300 px-3 py-3"
                @click="autoSlug"
              >
                Авто
              </button>
            </div>
          </div>
        </div>

        <!-- ─── Descriptions (multilingual) ──────────────────── -->
        <div class="bg-white border border-bone-200 p-6">
          <h2 class="font-serif text-lg font-light text-jet-900 mb-6">Описание</h2>
          <div class="space-y-5">
            <div>
              <label class="admin-label">Русский</label>
              <textarea
                v-model="form.description.ru"
                class="admin-input resize-none"
                rows="5"
                placeholder="Описание на русском..."
              />
            </div>
            <div>
              <label class="admin-label">English</label>
              <textarea
                v-model="form.description.en"
                class="admin-input resize-none"
                rows="5"
                placeholder="Description in English..."
              />
            </div>
          </div>
        </div>

        <!-- ─── Images ────────────────────────────────────────── -->
        <div class="bg-white border border-bone-200 p-6">
          <h2 class="font-serif text-lg font-light text-jet-900 mb-6">Фотографии</h2>

          <!-- Upload zone -->
          <div
            class="border-2 border-dashed border-bone-300 p-8 text-center cursor-pointer hover:border-jet-400 transition-colors"
            :class="{ 'opacity-50': uploadingImages }"
            @click="triggerFileInput"
            @dragover.prevent
            @drop.prevent="handleDrop"
          >
            <input
              ref="fileInputRef"
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              multiple
              class="hidden"
              @change="handleFileSelect"
            />
            <svg class="w-8 h-8 mx-auto mb-3 text-bone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p class="font-sans text-xs text-jet-500 mb-1">
              <span v-if="uploadingImages" class="animate-pulse">Загрузка...</span>
              <span v-else>Нажмите или перетащите фото</span>
            </p>
            <p class="label text-bone-400">JPEG, PNG, WebP — до 10MB</p>
          </div>

          <!-- Image previews -->
          <div v-if="imageList.length" class="mt-4 grid grid-cols-4 sm:grid-cols-6 gap-3">
            <div
              v-for="(img, i) in imageList"
              :key="img.id ?? img.preview"
              class="relative group aspect-3/4 bg-bone-100 overflow-hidden"
            >
              <img
                :src="img.preview ?? img.image_url"
                :alt="`Image ${i + 1}`"
                class="w-full h-full object-cover"
              />

              <!-- Position badge -->
              <div class="absolute top-1 left-1 bg-jet-900/80 text-white text-2xs px-1.5 py-0.5 font-mono">
                {{ i + 1 }}
              </div>

              <!-- Remove button -->
              <button
                class="absolute top-1 right-1 bg-red-500 text-white w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                @click="removeImage(i)"
              >
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar column -->
      <div class="space-y-6">

        <!-- ─── Status & pricing ──────────────────────────────── -->
        <div class="bg-white border border-bone-200 p-6">
          <h2 class="font-serif text-lg font-light text-jet-900 mb-6">Статус</h2>

          <div class="space-y-5">
            <div>
              <label class="admin-label">Статус</label>
              <div class="relative">
                <select v-model="form.status" class="admin-select pr-8">
                  <option value="draft">Черновик</option>
                  <option value="published">Опубликовано</option>
                  <option value="sold_out">Продано</option>
                </select>
                <svg class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-jet-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            <div>
              <label class="admin-label">Цена (₽)</label>
              <input
                v-model.number="form.price"
                type="number"
                min="0"
                class="admin-input"
                placeholder="0"
              />
            </div>

            <div>
              <label class="admin-label">Ссылка для консультации</label>
              <input
                v-model="form.external_link"
                type="url"
                class="admin-input"
                placeholder="https://wa.me/..."
              />
              <p class="font-sans text-2xs text-bone-400 mt-1">WhatsApp, Telegram, форма и т.д.</p>
            </div>
          </div>
        </div>

        <!-- ─── Collection ────────────────────────────────────── -->
        <div class="bg-white border border-bone-200 p-6">
          <h2 class="font-serif text-lg font-light text-jet-900 mb-6">Коллекция</h2>

          <div>
            <label class="admin-label">Коллекция</label>
            <div class="relative">
              <select v-model="form.collection_id" class="admin-select pr-8">
                <option :value="null">— Без коллекции —</option>
                <option
                  v-for="col in collections"
                  :key="col.id"
                  :value="col.id"
                >
                  {{ col.title.ru || col.title.en }}
                  <span v-if="col.year"> ({{ col.year }})</span>
                </option>
              </select>
              <svg class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-jet-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ProductWithImages } from '~/types/product'
import type { Collection } from '~/types/collection'

interface LocalImage {
  id?: string
  image_url?: string
  preview?: string
  file?: File
  position: number
}

const props = defineProps<{
  mode: 'create' | 'edit'
  product?: ProductWithImages | null
  collections: Collection[]
}>()

const emit = defineEmits<{
  saved: [id: string]
}>()

const {
  createProduct,
  updateProduct,
  uploadImage,
  saveProductImages,
  deleteProductImage,
  generateSlug,
  generateFallbackSlug,
} = useProducts()

// ─── Form state ────────────────────────────────────────────

const form = reactive({
  title:         { en: props.product?.title?.en ?? '', ru: props.product?.title?.ru ?? '' },
  description:   { en: props.product?.description?.en ?? '', ru: props.product?.description?.ru ?? '' },
  slug:          props.product?.slug ?? '',
  price:         props.product?.price ?? null as number | null,
  status:        props.product?.status ?? 'draft',
  external_link: props.product?.external_link ?? (props.mode === 'create' ? 'https://wa.me/+79087808967' : ''),
  collection_id: props.product?.collection_id ?? null as string | null,
})

const imageList = ref<LocalImage[]>(
  (props.product?.product_images ?? []).map((img, i) => ({
    id: img.id,
    image_url: img.image_url,
    position: i,
  }))
)

const saving        = ref(false)
const savedSuccess  = ref(false)
const saveError     = ref<string | null>(null)
const uploadingImages = ref(false)
const fileInputRef  = ref<HTMLInputElement | null>(null)

// ─── Slug generation ──────────────────────────────────────

const generateProductSlug = (title: string): string => {
  const slug = generateSlug(title)
  // If slug is empty (e.g., title was all Cyrillic), use fallback
  return slug || generateFallbackSlug()
}

const autoSlug = () => {
  const base = form.title.en || form.title.ru
  if (base) form.slug = generateProductSlug(base)
}

watch(() => form.title.en, (val) => {
  if (props.mode === 'create' && val) {
    form.slug = generateProductSlug(val)
  }
})

watch(() => form.title.ru, (val) => {
  if (props.mode === 'create' && val && !form.title.en) {
    // Only auto-generate from Russian if English is empty
    form.slug = generateProductSlug(val)
  }
})

// ─── Image handling ───────────────────────────────────────

const triggerFileInput = () => fileInputRef.value?.click()

const handleFileSelect = async (e: Event) => {
  const files = Array.from((e.target as HTMLInputElement).files ?? [])
  await processFiles(files)
  if (fileInputRef.value) fileInputRef.value.value = ''
}

const handleDrop = async (e: DragEvent) => {
  const files = Array.from(e.dataTransfer?.files ?? []).filter(f => f.type.startsWith('image/'))
  await processFiles(files)
}

const processFiles = async (files: File[]) => {
  if (!files.length) return

  // For create mode: store locally and upload on save
  if (props.mode === 'create') {
    for (const file of files) {
      const preview = URL.createObjectURL(file)
      imageList.value.push({
        file,
        preview,
        position: imageList.value.length,
      })
    }
    return
  }

  // For edit mode: upload immediately
  if (!props.product?.id) return
  uploadingImages.value = true
  try {
    for (const file of files) {
      const url = await uploadImage(file, props.product.id)
      const [saved] = await saveProductImages(props.product.id, [url], imageList.value.length)
      imageList.value.push({
        id: saved.id,
        image_url: saved.image_url,
        position: imageList.value.length,
      })
    }
  }
  catch (e: any) {
    saveError.value = e?.message
  }
  finally {
    uploadingImages.value = false
  }
}

const removeImage = async (index: number) => {
  const img = imageList.value[index]

  // If the image exists in DB, delete it
  if (img.id && img.image_url) {
    try {
      await deleteProductImage(img.id, img.image_url)
    }
    catch (e: any) {
      saveError.value = e?.message
      return
    }
  }

  // If it was a local preview, revoke object URL
  if (img.preview) URL.revokeObjectURL(img.preview)

  imageList.value.splice(index, 1)
}

// ─── Save ─────────────────────────────────────────────────

const handleSave = async () => {
  saveError.value  = null
  savedSuccess.value = false
  saving.value     = true

  try {
    const payload = {
      title:         form.title,
      description:   form.description,
      slug:          form.slug,
      price:         form.price,
      status:        form.status as 'draft' | 'published' | 'sold_out',
      external_link: form.external_link || null,
      collection_id: form.collection_id,
    }

    if (props.mode === 'create') {
      const created = await createProduct(payload)

      // Upload pending images
      const pendingFiles = imageList.value.filter(img => img.file)
      if (pendingFiles.length) {
        const urls: string[] = []
        for (const img of pendingFiles) {
          const url = await uploadImage(img.file!, created.id)
          urls.push(url)
        }
        await saveProductImages(created.id, urls, 0)
      }

      emit('saved', created.id)
    }
    else if (props.product?.id) {
      await updateProduct(props.product.id, payload)
      savedSuccess.value = true
      emit('saved', props.product.id)
    }
  }
  catch (e: any) {
    saveError.value = e?.message ?? 'Ошибка сохранения'
  }
  finally {
    saving.value = false
  }
}

const previewProduct = () => {
  if (props.product?.slug) {
    window.open(`/products/${props.product.slug}`, '_blank')
  }
}
</script>

<style scoped>
.banner-enter-active,
.banner-leave-active {
  transition: all 0.3s ease;
}
.banner-enter-from,
.banner-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
