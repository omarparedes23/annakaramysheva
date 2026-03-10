interface SeoOptions {
  title?: string
  description?: string
  image?: string
  imageAlt?: string
  type?: 'website' | 'article' | 'product'
  noIndex?: boolean
}

export const useSeo = (options: SeoOptions = {}) => {
  const config = useRuntimeConfig()
  const route = useRoute()

  const siteName = config.public.siteName as string
  const siteUrl  = config.public.siteUrl as string

  const fullTitle       = options.title ? `${options.title} — ${siteName}` : `${siteName} — dress & design`
  const description     = options.description || (config.public.siteDescription as string)
  const canonicalUrl    = `${siteUrl}${route.path}`
  const ogImage         = options.image || `${siteUrl}/og-default.jpg`
  const ogImageAlt      = options.imageAlt || `${siteName} — luxury fashion designer`

  useHead({
    title: fullTitle,
    meta: [
      { name: 'description', content: description },
      { name: 'robots', content: options.noIndex ? 'noindex, nofollow' : 'index, follow' },

      // Open Graph
      { property: 'og:title', content: fullTitle },
      { property: 'og:description', content: description },
      { property: 'og:image', content: ogImage },
      { property: 'og:image:alt', content: ogImageAlt },
      { property: 'og:url', content: canonicalUrl },
      { property: 'og:type', content: options.type || 'website' },
      { property: 'og:site_name', content: siteName },

      // Twitter Card
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: fullTitle },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: ogImage },
      { name: 'twitter:image:alt', content: ogImageAlt },
    ],
    link: [
      { rel: 'canonical', href: canonicalUrl },
    ],
  })
}
