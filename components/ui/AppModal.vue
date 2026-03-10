<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click.self="$emit('update:modelValue', false)"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-jet-900/60 backdrop-blur-sm" />

        <!-- Panel -->
        <div
          class="relative bg-white w-full shadow-2xl"
          :class="sizeClasses"
        >
          <!-- Header -->
          <div v-if="title" class="flex items-start justify-between p-8 border-b border-bone-200">
            <h2 class="font-serif text-xl font-light text-jet-900">{{ title }}</h2>
            <button
              class="text-jet-400 hover:text-jet-900 transition-colors ml-4 mt-0.5"
              @click="$emit('update:modelValue', false)"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Close button (no title) -->
          <button
            v-if="!title"
            class="absolute top-4 right-4 text-jet-400 hover:text-jet-900 transition-colors z-10"
            @click="$emit('update:modelValue', false)"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <!-- Content -->
          <div class="p-8">
            <slot />
          </div>

          <!-- Footer -->
          <div v-if="$slots.footer" class="px-8 pb-8">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
})

defineEmits<{ 'update:modelValue': [value: boolean] }>()

const sizeClasses = computed(() => ({
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}[props.size]))
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .relative,
.modal-leave-to .relative {
  transform: scale(0.97) translateY(8px);
}
</style>
