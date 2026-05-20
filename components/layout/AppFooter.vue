<template>
  <footer class="bg-jet-900 text-white">
    <div class="container-editorial py-20">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8">

        <!-- Brand column -->
        <div>
          <p class="font-serif text-2xl font-light tracking-wider leading-tight mb-4">
            Anna<br>Karamysheva
          </p>
          <p class="font-serif text-sm italic text-bone-400 mb-8">
            «Любимая. Счастливая. Особенная.»
          </p>
          <p class="label text-bone-600">
            Москва, Россия
          </p>
        </div>

        <!-- Links -->
        <div class="flex flex-col gap-4">
          <span class="label text-bone-600 mb-2">{{ $t('footer.navigation') }}</span>
          <NuxtLink
            v-for="link in footerLinks"
            :key="link.key"
            :to="localePath(link.to)"
            class="font-sans text-xs tracking-widest uppercase text-bone-300 hover:text-white transition-colors duration-200 w-fit"
          >
            {{ $t(link.key) }}
          </NuxtLink>
        </div>

        <!-- Contact -->
        <div class="flex flex-col gap-4">
          <span class="label text-bone-600 mb-2">{{ $t('footer.contact') }}</span>
          <a
            href="mailto:anitamorsito777@yandex.ru"
            class="font-sans text-xs tracking-widest text-bone-300 hover:text-white transition-colors duration-200 w-fit"
          >
            anitamorsito777@yandex.ru
          </a>
          <a
            href="https://t.me/anitamorsito"
            target="_blank"
            rel="noopener noreferrer"
            class="font-sans text-xs tracking-widest uppercase text-bone-300 hover:text-white transition-colors duration-200 w-fit"
          >
            Telegram @anitamorsito
          </a>
        </div>
      </div>

      <!-- Bottom bar -->
      <div class="divider-dark mt-16 pt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div class="flex flex-col gap-1">
          <p class="font-sans text-xs text-neutral-500">
            ИП Карамышева Анна, Москва, Россия
          </p>
          <p class="font-sans text-2xs tracking-widest text-bone-600 uppercase">
            &copy; {{ new Date().getFullYear() }} Anna Karamysheva. All rights reserved.
          </p>
        </div>
        <div class="flex items-center gap-6">
          <NuxtLink
            :to="localePath('/privacy')"
            class="font-sans text-2xs tracking-widest uppercase text-bone-600 hover:text-white transition-colors duration-200"
          >
            {{ $t('footer.privacy') }}
          </NuxtLink>
          <p class="font-sans text-2xs tracking-widest text-bone-700 uppercase">
            dress&design
          </p>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const localePath = useLocalePath()

const footerLinks = [
  { key: 'nav.collections', to: '/gallery' },
  { key: 'nav.contact',     to: '/contact' },
]
</script>
