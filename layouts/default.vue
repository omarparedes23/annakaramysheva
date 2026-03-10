<template>
  <div class="min-h-screen flex flex-col bg-white">
    <AppHeader />

    <main class="flex-1">
      <slot />
    </main>

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
</script>
