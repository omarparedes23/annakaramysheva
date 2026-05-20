import type { ProviderGetImage } from '@nuxt/image'

export const getImage: ProviderGetImage = (src, { modifiers = {}, baseURL }) => {
  const url = src.startsWith('http') ? src : `${baseURL}/${src}`

  return {
    url,
  }
}
