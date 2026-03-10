<template>
  <div class="min-h-screen bg-bone-50 flex">
    <!-- Sidebar -->
    <aside class="w-56 bg-white border-r border-bone-200 flex flex-col fixed inset-y-0 left-0 z-30">
      <!-- Brand -->
      <div class="px-6 py-8 border-b border-bone-200">
        <NuxtLink to="/admin/dashboard" class="block">
          <span class="font-serif text-sm font-light tracking-widest uppercase text-jet-900 leading-tight">
            Anna<br>Karamysheva
          </span>
        </NuxtLink>
        <span class="label mt-1 block">Admin Panel</span>
      </div>

      <!-- Nav -->
      <nav class="flex-1 py-6">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="admin-nav-link"
          :class="{ active: isActive(item.to) }"
        >
          <component :is="item.icon" class="w-4 h-4 flex-shrink-0" />
          <span>{{ item.label }}</span>
        </NuxtLink>
      </nav>

      <!-- User / Logout -->
      <div class="px-4 py-6 border-t border-bone-200">
        <p class="label mb-3 truncate">{{ user?.email }}</p>
        <button
          class="flex items-center gap-2 font-sans text-xs tracking-widest uppercase text-jet-500 hover:text-jet-900 transition-colors"
          @click="handleLogout"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Выйти
        </button>
      </div>
    </aside>

    <!-- Main content -->
    <div class="flex-1 ml-56">
      <!-- Top bar -->
      <header class="bg-white border-b border-bone-200 px-8 py-4 flex items-center justify-between sticky top-0 z-20">
        <h1 class="font-serif text-xl font-light text-jet-900">{{ pageTitle }}</h1>
        <NuxtLink
          to="/"
          target="_blank"
          class="font-sans text-xs tracking-widest uppercase text-jet-500 hover:text-jet-900 transition-colors flex items-center gap-1.5"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Сайт
        </NuxtLink>
      </header>

      <!-- Page content -->
      <main class="p-8">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  LayoutDashboard,
  Package,
  FolderOpen,
  Mail,
} from 'lucide-vue-next'

defineOptions({ name: 'AdminLayout' })

const route = useRoute()
const { user, logout } = useAuth()

const navItems = [
  { to: '/admin/dashboard',  label: 'Дашборд',     icon: LayoutDashboard },
  { to: '/admin/products',   label: 'Изделия',      icon: Package },
  { to: '/admin/collections', label: 'Коллекции',   icon: FolderOpen },
  { to: '/admin/inquiries',  label: 'Запросы',       icon: Mail },
]

const pageTitles: Record<string, string> = {
  '/admin/dashboard':      'Дашборд',
  '/admin/products':       'Изделия',
  '/admin/products/new':   'Новое изделие',
  '/admin/collections':    'Коллекции',
  '/admin/inquiries':      'Входящие запросы',
}

const pageTitle = computed(() => {
  return pageTitles[route.path] || 'Редактирование'
})

const isActive = (path: string): boolean => {
  if (path === '/admin/dashboard') return route.path === path
  return route.path.startsWith(path)
}

const handleLogout = async () => {
  await logout()
}
</script>
