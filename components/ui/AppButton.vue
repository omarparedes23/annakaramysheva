<template>
  <component
    :is="tag"
    :href="href"
    :to="to"
    :target="target"
    :rel="target === '_blank' ? 'noopener noreferrer' : undefined"
    :disabled="disabled || loading"
    class="inline-flex items-center justify-center gap-2 transition-all duration-400 select-none"
    :class="[variantClasses, sizeClasses, { 'opacity-50 cursor-not-allowed': disabled }]"
    v-bind="$attrs"
  >
    <span v-if="loading" class="w-3.5 h-3.5 border border-current border-t-transparent rounded-full animate-spin" />
    <slot />
  </component>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'ghost' | 'ghost-bone' | 'text'
  size?: 'sm' | 'md' | 'lg'
  tag?: string
  href?: string
  to?: string
  target?: string
  disabled?: boolean
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  tag: 'button',
})

const variantClasses = computed(() => ({
  primary:    'bg-jet-900 text-white hover:bg-jet-700 font-sans tracking-widest uppercase',
  ghost:      'border border-jet-900 text-jet-900 hover:bg-jet-900 hover:text-white font-sans tracking-widest uppercase',
  'ghost-bone': 'border border-bone-300 text-bone-200 hover:bg-white hover:border-white hover:text-jet-900 font-sans tracking-widest uppercase',
  text:       'text-jet-900 hover:opacity-60 font-sans tracking-widest uppercase',
}[props.variant]))

const sizeClasses = computed(() => ({
  sm: 'px-5 py-2 text-2xs',
  md: 'px-8 py-3 text-xs',
  lg: 'px-10 py-4 text-xs',
}[props.size]))
</script>
