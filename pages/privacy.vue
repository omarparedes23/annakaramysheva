<template>
  <div class="pt-20">
    <section class="section bg-white">
      <div class="container-editorial">
        <div class="max-w-2xl mx-auto">

          <p class="label text-bone-500 mb-6">{{ $t('privacy.label') }}</p>
          <h1 class="display-lg text-jet-900 mb-4">{{ $t('privacy.heading') }}</h1>
          <p class="font-sans text-xs text-jet-400 mb-14">{{ $t('privacy.effective_date') }}</p>

          <div class="space-y-10 font-sans text-sm font-light text-jet-700 leading-relaxed">

            <div>
              <h2 class="font-sans text-xs tracking-widest uppercase text-jet-900 mb-3">
                {{ $t('privacy.section_controller_title') }}
              </h2>
              <p>{{ $t('privacy.section_controller_text') }}</p>
            </div>

            <div>
              <h2 class="font-sans text-xs tracking-widest uppercase text-jet-900 mb-3">
                {{ $t('privacy.section_data_title') }}
              </h2>
              <p>{{ $t('privacy.section_data_text') }}</p>
            </div>

            <div>
              <h2 class="font-sans text-xs tracking-widest uppercase text-jet-900 mb-3">
                {{ $t('privacy.section_purpose_title') }}
              </h2>
              <p>{{ $t('privacy.section_purpose_text') }}</p>
            </div>

            <div>
              <h2 class="font-sans text-xs tracking-widest uppercase text-jet-900 mb-3">
                {{ $t('privacy.section_storage_title') }}
              </h2>
              <p>{{ $t('privacy.section_storage_text') }}</p>
            </div>

            <div>
              <h2 class="font-sans text-xs tracking-widest uppercase text-jet-900 mb-3">
                {{ $t('privacy.section_consent_title') }}
              </h2>
              <p>{{ $t('privacy.section_consent_text') }}</p>
            </div>

            <div>
              <h2 class="font-sans text-xs tracking-widest uppercase text-jet-900 mb-3">
                {{ $t('privacy.section_contact_title') }}
              </h2>
              <p>
                {{ $t('privacy.section_contact_text') }}
                <a
                  href="mailto:anitamorsito777@yandex.ru"
                  class="underline hover:text-jet-900 transition-colors"
                >
                  anitamorsito777@yandex.ru
                </a>
              </p>
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

useSeo({
  title: t('privacy.heading'),
  description: t('privacy.seo_description'),
  noIndex: true,
})
</script>
