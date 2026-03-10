<template>
  <header
    ref="headerRef"
    class="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
    :class="[
      scrolled
        ? 'bg-white/95 backdrop-blur-sm border-b border-bone-200'
        : 'bg-transparent',
    ]"
  >
    <div class="container-editorial">
      <div class="flex items-center justify-between h-16 md:h-20">

        <!-- Brand -->
        <NuxtLink :to="localePath('/')" class="flex-shrink-0 group">
          <span
            class="font-serif font-light tracking-widest uppercase transition-colors duration-300"
            :class="[
              isHeroPage && !scrolled ? 'text-white' : 'text-jet-900',
            ]"
            style="font-size: clamp(0.7rem, 1.5vw, 0.875rem);"
          >
            Anna Karamysheva
          </span>
        </NuxtLink>

        <!-- Desktop Nav -->
        <nav class="hidden md:flex items-center gap-10">
          <NuxtLink
            v-for="link in navLinks"
            :key="link.key"
            :to="localePath(link.to)"
            class="font-sans text-xs tracking-widest uppercase relative pb-px transition-colors duration-300"
            :class="[
              isHeroPage && !scrolled ? 'text-white after:bg-white' : 'text-jet-900 after:bg-jet-900',
            ]"
            style="
              --tw-after-content: '';
              position: relative;
            "
            active-class="after:w-full!"
          >
            <span class="relative after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-current after:transition-all after:duration-300 hover:after:w-full">
              {{ $t(link.key) }}
            </span>
          </NuxtLink>
        </nav>

        <!-- Right: Language + Mobile Menu -->
        <div class="flex items-center gap-5">
          <!-- Language switcher -->
          <div class="flex items-center gap-2">
            <button
              v-for="loc in availableLocales"
              :key="loc"
              class="font-sans text-2xs tracking-superwide uppercase transition-colors duration-200"
              :class="[
                locale === loc
                  ? (isHeroPage && !scrolled ? 'text-white' : 'text-jet-900')
                  : (isHeroPage && !scrolled ? 'text-white/50 hover:text-white' : 'text-jet-400 hover:text-jet-900'),
              ]"
              @click="setLocale(loc as 'en' | 'ru')"
            >
              {{ loc.toUpperCase() }}
            </button>
          </div>

          <!-- Mobile burger -->
          <button
            class="md:hidden flex flex-col gap-1.5 p-1"
            :class="isHeroPage && !scrolled ? 'text-white' : 'text-jet-900'"
            aria-label="Menu"
            @click="mobileOpen = !mobileOpen"
          >
            <span
              class="block w-5 h-px bg-current transition-all duration-300"
              :class="mobileOpen ? 'rotate-45 translate-y-2' : ''"
            />
            <span
              class="block w-5 h-px bg-current transition-all duration-300"
              :class="mobileOpen ? 'opacity-0' : ''"
            />
            <span
              class="block w-5 h-px bg-current transition-all duration-300"
              :class="mobileOpen ? '-rotate-45 -translate-y-2' : ''"
            />
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile menu -->
    <Transition name="mobile-menu">
      <div
        v-if="mobileOpen"
        class="md:hidden bg-white border-t border-bone-200 px-6 py-8"
      >
        <nav class="flex flex-col gap-6">
          <NuxtLink
            v-for="link in navLinks"
            :key="link.key"
            :to="localePath(link.to)"
            class="font-sans text-xs tracking-widest uppercase text-jet-900"
            @click="mobileOpen = false"
          >
            {{ $t(link.key) }}
          </NuxtLink>
        </nav>
      </div>
    </Transition>
  </header>
</template>

<script setup lang="ts">
const route = useRoute()
const { locale, availableLocales, setLocale } = useI18n()
const localePath = useLocalePath()

const scrolled   = ref(false)
const mobileOpen = ref(false)

const navLinks = [
  { key: 'nav.collections', to: '/gallery' },
  { key: 'nav.products',    to: '/gallery' },
  { key: 'nav.contact',     to: '/contact' },
]

// Pages with transparent hero header
const heroPages = ['/', '/index']
const isHeroPage = computed(() => {
  const path = route.path.replace(/^\/en/, '') || '/'
  return heroPages.includes(path)
})

const handleScroll = () => {
  scrolled.value = window.scrollY > 40
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  handleScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

// Close mobile menu on route change
watch(() => route.path, () => {
  mobileOpen.value = false
})
</script>

<style scoped>
.mobile-menu-enter-active,
.mobile-menu-leave-active {
  transition: all 0.3s ease;
}
.mobile-menu-enter-from,
.mobile-menu-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
