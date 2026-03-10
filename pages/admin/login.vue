<template>
  <div class="min-h-screen bg-bone-50 flex items-center justify-center px-6">
    <div class="w-full max-w-sm">
      <!-- Brand -->
      <div class="text-center mb-12">
        <p class="font-serif text-2xl font-light tracking-widest text-jet-900">Anna Karamysheva</p>
        <p class="label text-bone-500 mt-1">Admin Panel</p>
      </div>

      <!-- Card -->
      <div class="bg-white border border-bone-200 p-10">
        <h1 class="font-serif text-xl font-light text-jet-900 mb-8 text-center">Вход</h1>

        <form class="space-y-6" @submit.prevent="handleLogin">
          <!-- Email -->
          <div>
            <label class="admin-label">Email</label>
            <input
              v-model="email"
              type="email"
              class="admin-input"
              placeholder="admin@example.com"
              required
              autocomplete="username"
            />
          </div>

          <!-- Password -->
          <div>
            <label class="admin-label">Пароль</label>
            <input
              v-model="password"
              type="password"
              class="admin-input"
              placeholder="••••••••"
              required
              autocomplete="current-password"
            />
          </div>

          <!-- Error -->
          <p v-if="error" class="font-sans text-xs text-red-600">{{ error }}</p>

          <!-- Submit -->
          <button
            type="submit"
            class="btn-primary w-full"
            :disabled="loading"
          >
            <span v-if="loading" class="w-3.5 h-3.5 border border-white border-t-transparent rounded-full animate-spin inline-block" />
            <span v-else>Войти</span>
          </button>
        </form>
      </div>

      <!-- Back link -->
      <div class="text-center mt-6">
        <NuxtLink to="/" class="font-sans text-xs tracking-widest uppercase text-jet-400 hover:text-jet-900 transition-colors">
          ← На сайт
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
})

const user = useSupabaseUser()

// Already logged in
watchEffect(() => {
  if (user.value) {
    navigateTo('/admin/dashboard')
  }
})

const { login } = useAuth()
const email    = ref('')
const password = ref('')
const loading  = ref(false)
const error    = ref<string | null>(null)

const handleLogin = async () => {
  error.value   = null
  loading.value = true
  try {
    await login(email.value, password.value)
    await navigateTo('/admin/dashboard')
  }
  catch (e: any) {
    error.value = e?.message ?? 'Ошибка входа. Проверьте данные.'
  }
  finally {
    loading.value = false
  }
}

useHead({ title: 'Admin Login — Anna Karamysheva' })
</script>
