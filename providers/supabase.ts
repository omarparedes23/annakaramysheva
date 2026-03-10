import type { ProviderGetImage } from '@nuxt/image'

export const getImage: ProviderGetImage = (src, { modifiers = {}, baseURL }) => {
  // src is the path after /storage/v1/object/public
  // baseURL is SUPABASE_URL + /storage/v1/object/public
  const url = src.startsWith('http') ? src : `${baseURL}/${src}`

  return {
    url,
  }
}
