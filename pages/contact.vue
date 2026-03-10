<template>
  <div class="pt-20">
    <!-- Hero -->
    <section class="section bg-white border-b border-bone-200">
      <div class="container-editorial">
        <div class="max-w-2xl">
          <p class="label text-bone-500 mb-6">{{ $t('contact.label') }}</p>
          <h1 class="display-lg text-jet-900 mb-6">{{ $t('contact.heading') }}</h1>
          <p class="font-sans text-sm font-light text-jet-500 leading-relaxed">
            {{ $t('contact.subheading') }}
          </p>
        </div>
      </div>
    </section>

    <!-- Form + Info -->
    <section class="section bg-bone-50">
      <div class="container-editorial">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-20 md:gap-24">

          <!-- Contact form -->
          <div>
            <h2 class="font-serif text-2xl font-light text-jet-900 mb-10">
              {{ $t('contact.form_heading') }}
            </h2>

            <!-- Success -->
            <Transition name="fade">
              <div v-if="submitted" class="py-12 text-center border border-bone-300">
                <p class="font-serif text-2xl font-light text-jet-900 mb-3">
                  {{ $t('contact.success_heading') }}
                </p>
                <p class="font-sans text-sm text-jet-500">
                  {{ $t('contact.success_text') }}
                </p>
              </div>

              <form
                v-else
                class="space-y-8"
                @submit.prevent="handleSubmit"
              >
                <!-- Name -->
                <div>
                  <label class="form-label">{{ $t('contact.field_name') }}</label>
                  <input
                    v-model="form.name"
                    type="text"
                    class="form-input"
                    :placeholder="$t('contact.placeholder_name')"
                    required
                    autocomplete="name"
                  />
                </div>

                <!-- Email -->
                <div>
                  <label class="form-label">{{ $t('contact.field_email') }}</label>
                  <input
                    v-model="form.email"
                    type="email"
                    class="form-input"
                    :placeholder="$t('contact.placeholder_email')"
                    required
                    autocomplete="email"
                  />
                </div>

                <!-- Message -->
                <div>
                  <label class="form-label">{{ $t('contact.field_message') }}</label>
                  <textarea
                    v-model="form.message"
                    class="form-input resize-none"
                    :placeholder="$t('contact.placeholder_message')"
                    rows="5"
                    required
                  />
                </div>

                <!-- Error -->
                <p v-if="error" class="font-sans text-xs text-red-600">{{ error }}</p>

                <!-- Submit -->
                <AppButton
                  type="submit"
                  variant="primary"
                  :loading="loading"
                  class="w-full md:w-auto"
                >
                  {{ $t('contact.submit') }}
                </AppButton>
              </form>
            </Transition>
          </div>

          <!-- Info -->
          <div class="space-y-12">
            <div>
              <p class="label text-bone-500 mb-4">{{ $t('contact.info_designer') }}</p>
              <p class="font-serif text-3xl font-light text-jet-900 leading-tight">
                Anna<br>Karamysheva
              </p>
              <p class="font-serif italic text-jet-400 mt-2">dress & design</p>
            </div>

            <div class="space-y-4">
              <div>
                <p class="label text-bone-500 mb-2">{{ $t('contact.info_location') }}</p>
                <p class="font-sans text-sm text-jet-700">Воронеж, Россия</p>
              </div>
              <div>
                <p class="label text-bone-500 mb-2">{{ $t('contact.info_email') }}</p>
                <a
                  href="mailto:hello@annakaramysheva.com"
                  class="font-sans text-sm text-jet-700 hover:text-jet-500 transition-colors"
                >
                  hello@annakaramysheva.com
                </a>
              </div>
              <div>
                <p class="label text-bone-500 mb-2">Instagram</p>
                <a
                  href="https://www.instagram.com/annakaramysheva"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="font-sans text-sm text-jet-700 hover:text-jet-500 transition-colors"
                >
                  @annakaramysheva
                </a>
              </div>
            </div>

            <!-- Philosophy -->
            <div class="border-t border-bone-200 pt-10">
              <blockquote class="font-serif italic text-2xl text-jet-400 leading-relaxed">
                «Любимая.<br>Счастливая.<br>Особенная.»
              </blockquote>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const { t } = useI18n()
const { submitInquiry } = useProducts()

useSeo({
  title: t('contact.heading'),
  description: t('seo.contact_description'),
})

const form = reactive({
  name:    '',
  email:   '',
  message: '',
})

const loading   = ref(false)
const submitted = ref(false)
const error     = ref<string | null>(null)

const handleSubmit = async () => {
  error.value   = null
  loading.value = true
  try {
    await submitInquiry({ name: form.name, email: form.email, message: form.message })
    submitted.value = true
  }
  catch (e: any) {
    error.value = e?.message ?? t('contact.error_generic')
  }
  finally {
    loading.value = false
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
