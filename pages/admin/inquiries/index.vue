<template>
  <div>
    <!-- Filters -->
    <div class="flex items-center gap-3 mb-6">
      <button
        v-for="f in filters"
        :key="f.value"
        class="font-sans text-xs tracking-widest uppercase px-3 py-1.5 border transition-colors"
        :class="activeFilter === f.value
          ? 'border-jet-900 bg-jet-900 text-white'
          : 'border-bone-300 text-jet-500 hover:border-jet-500'"
        @click="activeFilter = f.value"
      >
        {{ f.label }} {{ f.count ? `(${f.count})` : '' }}
      </button>
    </div>

    <!-- Table -->
    <div class="bg-white border border-bone-200">
      <div v-if="pending" class="p-12 text-center">
        <p class="label text-bone-400 animate-pulse">Загрузка...</p>
      </div>

      <div v-else-if="!filteredInquiries.length" class="p-16 text-center">
        <p class="font-serif text-2xl font-light text-jet-400">Нет запросов</p>
      </div>

      <ul v-else class="divide-y divide-bone-100">
        <li
          v-for="inq in filteredInquiries"
          :key="inq.id"
          class="px-6 py-5 hover:bg-bone-50 transition-colors cursor-pointer"
          @click="openInquiry(inq)"
        >
          <div class="flex items-start justify-between gap-6">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-3 mb-1">
                <p class="font-sans text-sm font-light text-jet-900">{{ inq.name }}</p>
                <span v-if="inq.status === 'new'" class="badge-published text-2xs">Новый</span>
              </div>
              <p class="font-sans text-xs text-bone-500">{{ inq.email }}</p>
              <p class="font-sans text-xs text-jet-500 mt-2 line-clamp-2">{{ inq.message }}</p>
            </div>
            <p class="label text-bone-400 flex-shrink-0">{{ formatDate(inq.created_at) }}</p>
          </div>
        </li>
      </ul>
    </div>

    <!-- Inquiry detail modal -->
    <AppModal v-model="detailModal" :title="selectedInquiry?.name ?? ''" size="lg">
      <div v-if="selectedInquiry" class="space-y-5">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="admin-label">Имя</p>
            <p class="font-sans text-sm text-jet-900">{{ selectedInquiry.name }}</p>
          </div>
          <div>
            <p class="admin-label">Email</p>
            <a :href="`mailto:${selectedInquiry.email}`" class="font-sans text-sm text-jet-900 hover:underline">
              {{ selectedInquiry.email }}
            </a>
          </div>
        </div>
        <div>
          <p class="admin-label">Сообщение</p>
          <p class="font-sans text-sm text-jet-700 leading-relaxed whitespace-pre-wrap">{{ selectedInquiry.message }}</p>
        </div>
        <div>
          <p class="admin-label">Дата</p>
          <p class="font-sans text-sm text-jet-500">{{ formatDate(selectedInquiry.created_at) }}</p>
        </div>
      </div>

      <template #footer>
        <div class="flex items-center justify-between">
          <a
            v-if="selectedInquiry"
            :href="`mailto:${selectedInquiry.email}?subject=Re: Anna Karamysheva`"
            class="btn-primary text-2xs py-2 px-5"
          >
            Ответить
          </a>
          <button
            v-if="selectedInquiry?.status === 'new'"
            class="font-sans text-xs tracking-widest uppercase text-jet-400 hover:text-jet-900 transition-colors"
            @click="archiveInquiry(selectedInquiry)"
          >
            Архивировать
          </button>
        </div>
      </template>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import type { Inquiry } from '~/types/product'

definePageMeta({ layout: 'admin', middleware: 'admin-auth' })
useHead({ title: 'Запросы — Admin' })

const supabase = useSupabaseClient()

const { data: inquiries, pending, refresh } = await useAsyncData('admin-inquiries', async () => {
  const { data } = await supabase
    .from('inquiries')
    .select('*')
    .order('created_at', { ascending: false })
  return (data ?? []) as Inquiry[]
})

const activeFilter = ref('all')

const filters = computed(() => [
  { label: 'Все',      value: 'all',      count: inquiries.value?.length ?? 0 },
  { label: 'Новые',    value: 'new',      count: inquiries.value?.filter(i => i.status === 'new').length ?? 0 },
  { label: 'Архив',    value: 'archived', count: inquiries.value?.filter(i => i.status === 'archived').length ?? 0 },
])

const filteredInquiries = computed(() => {
  if (activeFilter.value === 'all') return inquiries.value ?? []
  return (inquiries.value ?? []).filter(i => i.status === activeFilter.value)
})

const detailModal     = ref(false)
const selectedInquiry = ref<Inquiry | null>(null)

const openInquiry = (inq: Inquiry) => {
  selectedInquiry.value = inq
  detailModal.value = true
}

const archiveInquiry = async (inq: Inquiry) => {
  await supabase.from('inquiries').update({ status: 'archived' }).eq('id', inq.id)
  detailModal.value = false
  await refresh()
}

const formatDate = (d: string) =>
  new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(d))
</script>
